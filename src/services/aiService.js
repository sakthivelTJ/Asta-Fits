/**
 * aiService.js — OpenAI API Integration for Asta's Fit RPG
 * Powers the Floating System AI Bot and Dynamic Exercise Routine Generator.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../core/config';

const STORAGE_KEY_API_KEY = '@asta_fit_openai_key_v1';
export const DEFAULT_OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

/**
 * Get active API key from local storage or default configuration
 */
export async function getApiKey() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY_API_KEY);
    if (saved && saved.trim().length > 10) return saved.trim();
  } catch (e) {
    // Ignore read error
  }
  return DEFAULT_OPENAI_KEY;
}

/**
 * Save user custom API key
 */
export async function saveApiKey(newKey) {
  try {
    if (!newKey || newKey.trim() === '') {
      await AsyncStorage.removeItem(STORAGE_KEY_API_KEY);
    } else {
      await AsyncStorage.setItem(STORAGE_KEY_API_KEY, newKey.trim());
    }
    return true;
  } catch (e) {
    console.warn('Failed to save API key:', e);
    return false;
  }
}

/**
 * Send messages to OpenAI Chat Completion API (GPT-4o-mini)
 */
export async function askHunterOracle(userMessage, conversationHistory = [], userContext = {}) {
  const apiKey = await getApiKey();

  const hunterRank = userContext.rank || 'E';
  const hunterLevel = userContext.level || 1;
  const currentPhysique = userContext.currentPhysique || 'skinny (Slim frame)';
  const targetPhysique = userContext.targetPhysique || 'assassin (Shredded)';
  const equipment = (userContext.equipment || ['bodyweight', 'dumbbell']).join(', ');

  const systemPrompt = `You are "Charmy AI" - the spirited, food-and-fitness loving mentor and companion inspired by Charmy from Black Clover for the Asta's Fit RPG app.
Your hunter user has:
- Current Rank: ${hunterRank}-Rank (Level ${hunterLevel})
- Current Body Archetype: ${currentPhysique}
- Target Dream Physique: ${targetPhysique}
- Equipment: ${equipment}

Guidelines:
1. Speak as Charmy AI: cheerful, energetic, passionate about good food, high protein, and hard-working physical training gains (la!).
2. Give clear, science-backed workout, nutrition, form, and recovery advice.
3. Keep answers punchy, readable, and structured with bullet points or numbered tips.
4. Encourage eating properly to fuel muscle growth and training hard with consistency!`;

  const messagesPayload = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6).map((m) => ({
      role: m.isUser ? 'user' : 'assistant',
      content: m.text,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messagesPayload,
        max_tokens: 450,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error('Empty response from AI');
    return reply;
  } catch (err) {
    console.warn('[AI Service] OpenAI fetch fallback:', err.message);
    return generateOfflineAssistantResponse(userMessage, userContext);
  }
}

/**
 * Generate AI-calibrated Exercise Routine specifically bridging Current -> Dream Body
 */
export async function generateAiWorkoutRoutine(currentPhysique, targetPhysique, equipment = [], limitations = []) {
  const apiKey = await getApiKey();

  const prompt = `Generate a 4-exercise workout routine for a fitness RPG app.
User's Starting Frame: "${currentPhysique}"
User's Goal Dream Body: "${targetPhysique}"
Available Equipment: ${equipment.join(', ') || 'bodyweight, dumbbells'}
Safety / Joint Limitations: ${limitations.join(', ') || 'None'}

Return ONLY a valid JSON array of 4 exercise objects with keys:
- "name" (string): Exercise title
- "targetMuscle" (string): Main muscle targeted
- "sets" (number): Recommended sets (3 to 5)
- "reps" (string): Recommended rep range (e.g. "8-12 reps" or "45s")
- "focus" (string): Short 1-sentence tip on why this builds the dream body from current frame
- "xpReward" (number): XP points (between 100 and 200)

Example format:
[
  {
    "name": "Decline Push-Up",
    "targetMuscle": "Upper Chest & Delts",
    "sets": 4,
    "reps": "10-12 reps",
    "focus": "Builds upper chest shelf to transition from slim frame into V-Taper assassin.",
    "xpReward": 150
  }
]`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 600,
      }),
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    // Parse JSON safely
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    throw new Error('Failed to parse AI exercise JSON');
  } catch (err) {
    console.warn('[AI Service] Using calibrated offline workout engine:', err.message);
    return getOfflineTailoredRoutine(currentPhysique, targetPhysique, equipment);
  }
}

/**
 * High-intelligence offline assistant fallback
 */
function generateOfflineAssistantResponse(userMsg, ctx) {
  const q = (userMsg || '').toLowerCase();
  const target = ctx.targetPhysique || 'Shadow Assassin';

  if (q.includes('chest') || q.includes('push')) {
    return `[CHARMY AI: CHEST RECOVERY & HYPERTROPHY 🍖]
La! To forge your chest toward that ${target} physique:
1. Diamond & Incline Push-Ups: Prioritize upper and inner chest activation (3-4 sets, 10-15 reps).
2. Dumbbell Floor / Bench Press: Focus on a 3-second eccentric (lowering) phase for maximum muscle growth!
3. Fueling the Gains: Make sure to get 1.6g to 2.0g of protein per kg of bodyweight so your muscles can rebuild stronger!`;
  }

  if (q.includes('eat') || q.includes('diet') || q.includes('protein') || q.includes('food')) {
    return `[CHARMY AI MEAL MASTER PROTOCOL 🍲]
Calibrated for your dream: ${target}
• Daily Protein Goal: 120g - 160g of tasty protein (Eggs, Chicken, Lentils, Paneer, Fish, Whey).
• Pre-Workout Power: Fuel up with bananas or oats 45 min before your quest.
• Hydration Magic: Drink 3 to 4 Liters of water daily to keep cells hydrated and pump up XP!`;
  }

  if (q.includes('level') || q.includes('rank') || q.includes('xp')) {
    return `[CHARMY AI LEVELING SECRETS ⭐]
• Complete Daily System Quests: Each one gives 100 - 150 XP and stat points!
• Log Every Set & Rep: Each rep logged adds bonus XP to your character!
• Keep Up The Streak: Consecutive days give shields and multiplier bonuses!`;
  }

  return `[CHARMY AI: ${target.toUpperCase()} COMPANION GUIDE ✨]
La! Your training plan is calibrated to build your current body into the ${target} physique!
• Train hard, eat well, and hit near-failure on your last set for real muscle stimulus.
• Rest 60-90 seconds between sets to recharge your energy.
Ask me anything about exercises, meals, or workout techniques whenever you need a boost!`;
}

/**
 * Deterministic offline routine tailored by physique transition
 */
function getOfflineTailoredRoutine(currentPhysique, targetPhysique, equipment) {
  const isGym = equipment.includes('dumbbell') || equipment.includes('full_gym');

  if (targetPhysique === 'titan') {
    return [
      {
        name: isGym ? 'Heavy Dumbbell Bench Press' : 'Explosive Archer Push-Up',
        targetMuscle: 'Pectorals & Triceps',
        sets: 4,
        reps: '8-10 reps',
        focus: 'Heavy tension overload to pack dense mass onto a lean frame.',
        xpReward: 160,
      },
      {
        name: isGym ? 'Dumbbell Romanian Deadlift' : 'Single-Leg Bodyweight RDL',
        targetMuscle: 'Hamstrings & Posterior Chain',
        sets: 4,
        reps: '10 reps',
        focus: 'Strengthens the spinal erectors and hamstrings for massive power.',
        xpReward: 170,
      },
      {
        name: isGym ? 'Overhead Dumbbell Shoulder Press' : 'Pike Push-Up to Handstand',
        targetMuscle: 'Deltoids & Traps',
        sets: 4,
        reps: '8-12 reps',
        focus: 'Broadens shoulders to forge the Monarch Titan silhouette.',
        xpReward: 150,
      },
      {
        name: 'Bulgarian Split Squats',
        targetMuscle: 'Quadriceps & Glutes',
        sets: 3,
        reps: '12 reps / leg',
        focus: 'Unilateral quad density and stabilizer strength.',
        xpReward: 140,
      },
    ];
  }

  // Default to Assassin / Athletic V-Taper
  return [
    {
      name: 'Decline Push-Up (Feet Elevated)',
      targetMuscle: 'Upper Chest & Front Delts',
      sets: 4,
      reps: '12-15 reps',
      focus: 'Builds upper chest shelf to create a sharp V-taper frame.',
      xpReward: 150,
    },
    {
      name: isGym ? 'Dumbbell Gorilla Rows' : 'Inverted Bodyweight Door Row',
      targetMuscle: 'Lats & Rhomboids',
      sets: 4,
      reps: '12 reps',
      focus: 'Widens back wings for the agile Shadow Assassin profile.',
      xpReward: 160,
    },
    {
      name: 'Hanging Knee Raises / L-Sit Flutter',
      targetMuscle: 'Core & Lower Abs',
      sets: 3,
      reps: '20 reps',
      focus: 'Carves razor-sharp serratus and abdominal definition.',
      xpReward: 130,
    },
    {
      name: 'Bodyweight Jump Squats',
      targetMuscle: 'Legs & Explosive Fast-Twitch',
      sets: 3,
      reps: '15 reps',
      focus: 'Burns visceral fat while conditioning explosive athletic stamina.',
      xpReward: 140,
    },
  ];
}

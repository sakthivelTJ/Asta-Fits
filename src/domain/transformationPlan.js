/**
 * transformationPlan.js — Dynamic AI-powered Workout & Physique Transformation Engine
 * Generates customized workout roadmaps bridging Current Physique -> Target Dream Body.
 */

import { CURRENT_PHYSIQUES, TARGET_PHYSIQUES } from '../data/physiques';
import { generateAiWorkoutRoutine } from '../services/aiService';

/**
 * Get comprehensive transformation roadmap metadata and workout protocol
 */
export async function getTransformationPlan(currentId = 'slim', targetId = 'toned_athletic', equipment = [], limitations = []) {
  const current = CURRENT_PHYSIQUES.find(p => p.id === currentId) || CURRENT_PHYSIQUES[0];
  const target = TARGET_PHYSIQUES.find(p => p.id === targetId) || TARGET_PHYSIQUES[0];

  const protocolTitles = {
    'very_slim_muscular': 'HYPERTROPHY BULK & PROGRESSIVE OVERLOAD PROTOCOL',
    'slim_toned_athletic': 'LEAN RECOMP & V-TAPER SCULPTING PROTOCOL',
    'slim_muscular': 'MASS BUILDING & STRENGTH PROTOCOL',
    'normal_toned_athletic': 'ATHLETIC CUT & DEFINITION PROTOCOL',
    'normal_muscular': 'POWERBUILDING & MASS DENSITY PROTOCOL',
    'normal_highly_muscular': 'ADVANCED MASS & STRENGTH PROTOCOL',
    'overweight_toned_athletic': 'METABOLIC INCINERATOR & LEAN RECOMP',
    'overweight_muscular': 'HEAVY POWERLIFTING & BODY RECOMPOSITION',
    'fit_athletic_muscular': 'ADVANCED PROGRESSIVE OVERLOAD PR FORGE',
    'fit_athletic_highly_muscular': 'ELITE POWER & MASS MAXIMIZER',
  };

  const key = `${currentId}_${targetId}`;
  const protocolTitle = protocolTitles[key] || `${current.title.toUpperCase()} TO ${target.title.toUpperCase()} TRANSFORMATION`;

  // Fetch dynamic AI workout routine using OpenAI
  let exercises = [];
  try {
    exercises = await generateAiWorkoutRoutine(current.title, target.title, equipment, limitations);
  } catch (e) {
    exercises = [];
  }

  return {
    protocolTitle,
    current,
    target,
    weeklyCommitment: '4 Days / Week Recommended',
    phases: [
      { name: 'Phase 1: Foundation Stimulus', weeks: 'Weeks 1-4', focus: 'Neuromuscular adaptation and base strength.' },
      { name: 'Phase 2: Progressive Overload', weeks: 'Weeks 5-8', focus: 'Increasing volume and hypertrophic tension.' },
      { name: 'Phase 3: Dream Physique Realization', weeks: 'Weeks 9-12', focus: 'Sculpting cuts, symmetry, and max rank PRs.' },
    ],
    recommendedExercises: exercises,
  };
}

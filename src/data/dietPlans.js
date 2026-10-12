// Adaptive Hunter RPG Nutrition & Meal Generator Engine

export const CALCULATE_DIET_PLAN = (currentPhysiqueId, targetPhysiqueId, weightKg = 70, heightCm = 175) => {
  // Estimated BMR calculation (Mifflin-St Jeor base approximation)
  const baseBMR = 10 * weightKg + 6.25 * heightCm - 5 * 25 + 5;
  const maintenanceCalories = Math.round(baseBMR * 1.45); // Moderate Hunter Activity Factor

  let targetCalories = maintenanceCalories;
  let dietGoalName = 'Recomposition & Lean Muscle';
  let waterLiters = 3.5;

  // Calorie modifier based on current vs target physique transition
  if (currentPhysiqueId === 'skinny' || targetPhysiqueId === 'titan') {
    targetCalories = Math.round(maintenanceCalories + 450); // Hypertrophy Surplus
    dietGoalName = 'Titan Hypertrophy Surplus (+450 kcal)';
    waterLiters = 4.0;
  } else if (currentPhysiqueId === 'overweight' || targetPhysiqueId === 'assassin') {
    targetCalories = Math.round(maintenanceCalories - 450); // Fat Burning Deficit
    dietGoalName = 'Shadow Fat Burn Deficit (-450 kcal)';
    waterLiters = 3.8;
  } else if (targetPhysiqueId === 'apex') {
    targetCalories = Math.round(maintenanceCalories + 150); // Clean Recomp
    dietGoalName = 'Apex Athletic Recomp (+150 kcal)';
    waterLiters = 3.5;
  } else if (targetPhysiqueId === 'calisthenic') {
    targetCalories = Math.round(maintenanceCalories); // Clean Maintenance
    dietGoalName = 'Calisthenics Power Maintenance';
    waterLiters = 3.5;
  }

  // Target Protein (g): 2.0g per kg for Hunters
  const proteinGrams = Math.round(weightKg * 2.0);
  const proteinCalories = proteinGrams * 4;

  // Fats (25% of total calories)
  const fatCalories = targetCalories * 0.25;
  const fatGrams = Math.round(fatCalories / 9);

  // Remaining calories to Carbs
  const carbCalories = targetCalories - (proteinCalories + fatCalories);
  const carbGrams = Math.max(80, Math.round(carbCalories / 4));

  return {
    targetCalories,
    maintenanceCalories,
    dietGoalName,
    waterLiters,
    macros: {
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams,
    },
    macroRatios: {
      proteinPct: Math.round((proteinCalories / targetCalories) * 100),
      carbsPct: Math.round((carbCalories / targetCalories) * 100),
      fatPct: Math.round((fatCalories / targetCalories) * 100),
    },
    mealPlan: GET_RECOMMENDED_MEALS(targetPhysiqueId, proteinGrams, carbGrams),
  };
};

export const GET_RECOMMENDED_MEALS = (targetPhysiqueId, proteinTarget, carbTarget) => {
  return [
    {
      mealTime: 'Awakening Breakfast',
      time: '07:30 AM',
      title: 'Mana Surge Protein Omelette & Oats',
      calories: 550,
      protein: Math.round(proteinTarget * 0.28),
      carbs: Math.round(carbTarget * 0.3),
      icon: 'sunny',
      description: '4 Whole eggs/whites, 1 cup oats with berries, and 1 glass of almond milk or water.',
      hunterPerk: '+15 WIL Resilience',
    },
    {
      mealTime: 'Mid-Day Guild Feast',
      time: '01:00 PM',
      title: 'Monarch Grilled Chicken & Quinoa Bowl',
      calories: 680,
      protein: Math.round(proteinTarget * 0.35),
      carbs: Math.round(carbTarget * 0.35),
      icon: 'shield',
      description: '200g Grilled Chicken breast, 1.5 cups cooked quinoa/rice, steamed broccoli & olive oil.',
      hunterPerk: '+25 STR Recovery',
    },
    {
      mealTime: 'Post-Workout Elixir',
      time: '05:30 PM',
      title: 'Shadow Elixir Whey & Banana Shake',
      calories: 380,
      protein: Math.round(proteinTarget * 0.22),
      carbs: Math.round(carbTarget * 0.2),
      icon: 'flash',
      description: '1.5 Scoops Whey Protein, 1 ripe banana, 1 tbsp peanut butter, blended with cold water.',
      hunterPerk: '+30 XP Muscle Synthesis',
    },
    {
      mealTime: 'Dungeon Rest Dinner',
      time: '08:30 PM',
      title: 'Vanguard Salmon / Lean Beef & Sweet Potato',
      calories: 590,
      protein: Math.round(proteinTarget * 0.25),
      carbs: Math.round(carbTarget * 0.15),
      icon: 'moon',
      description: '180g Baked Salmon or extra lean minced beef, medium sweet potato, and large green salad.',
      hunterPerk: '+20 END Sleep Regeneration',
    },
  ];
};

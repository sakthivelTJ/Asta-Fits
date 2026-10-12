describe('Quest System & Completion State Tests', () => {
  test('completeQuest updates completedQuestIds and adds XP without state loss', () => {
    let hunter = {
      level: 1,
      xp: 0,
      completedQuestIds: [],
      availableStatPoints: 5,
    };

    const dailyQuests = [
      { id: 'q_daily_1', title: 'Chest Drive', xpReward: 150 },
      { id: 'q_daily_2', title: 'Hydration', xpReward: 100 },
    ];

    const getXPForLevel = (lvl) => lvl * 500;

    const addXP = (amount, baseState) => {
      let currentXP = baseState.xp + amount;
      let currentLvl = baseState.level;
      let xpForNext = getXPForLevel(currentLvl);
      let levelGained = 0;

      while (currentXP >= xpForNext) {
        currentXP -= xpForNext;
        currentLvl += 1;
        levelGained += 1;
        xpForNext = getXPForLevel(currentLvl);
      }

      return {
        ...baseState,
        level: currentLvl,
        xp: currentXP,
        availableStatPoints: baseState.availableStatPoints + levelGained * 3,
      };
    };

    const completeQuest = (questId, currentHunter) => {
      if (currentHunter.completedQuestIds.includes(questId)) return currentHunter;
      const quest = dailyQuests.find((q) => q.id === questId);
      if (!quest) return currentHunter;

      const updatedCompleted = [...currentHunter.completedQuestIds, questId];
      const updatedHunter = {
        ...currentHunter,
        completedQuestIds: updatedCompleted,
      };

      return addXP(quest.xpReward, updatedHunter);
    };

    // Claim Quest 1
    hunter = completeQuest('q_daily_1', hunter);
    expect(hunter.completedQuestIds).toContain('q_daily_1');
    expect(hunter.xp).toBe(150);

    // Claim Quest 2
    hunter = completeQuest('q_daily_2', hunter);
    expect(hunter.completedQuestIds).toContain('q_daily_1');
    expect(hunter.completedQuestIds).toContain('q_daily_2');
    expect(hunter.xp).toBe(250);
  });
});

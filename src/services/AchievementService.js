import { StorageService } from './StorageService';

export const ACHIEVEMENTS = {
  FIRST_PERFECT: {
    id: 'FIRST_PERFECT',
    name: 'Perfect Aim!',
    description: 'Get your first guess within 100 meters',
    points: 50
  },
  STREAK_3: {
    id: 'STREAK_3',
    name: 'Hot Streak!',
    description: 'Get 3 correct guesses in a row',
    points: 100
  },
  EXPLORER: {
    id: 'EXPLORER',
    name: 'Explorer',
    description: 'Complete 10 quests',
    points: 200
  }
};

export const AchievementService = {
  checkAchievement: (achievementId, playerData) => {
    const currentAchievements = StorageService.get('achievements', []);
    
    if (!currentAchievements.includes(achievementId)) {
      currentAchievements.push(achievementId);
      StorageService.set('achievements', currentAchievements);
      return ACHIEVEMENTS[achievementId];
    }
    return null;
  }
};

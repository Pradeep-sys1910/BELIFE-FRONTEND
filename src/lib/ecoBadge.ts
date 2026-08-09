export interface Badge { emoji: string; label: string; description: string }

export function getEcoBadge(posts: number, followers: number): Badge {
  if (posts >= 50 && followers >= 100) {
    return { emoji: '🏔️', label: 'Summit Explorer', description: '50+ stories and 100+ followers' };
  }
  if (followers >= 100) {
    return { emoji: '🧭', label: 'Trail Guide', description: '100+ followers and growing influence' };
  }
  if (posts >= 25) {
    return { emoji: '📸', label: 'Photo Collector', description: '25+ travel stories shared' };
  }
  if (followers >= 10) {
    return { emoji: '🌄', label: 'Wanderer', description: '10+ followers on the journey' };
  }
  if (posts >= 3) {
    return { emoji: '👣', label: 'First Step', description: '3+ meaningful adventures shared' };
  }
  return { emoji: '🌿', label: 'Starter', description: 'Just beginning the journey' };
}

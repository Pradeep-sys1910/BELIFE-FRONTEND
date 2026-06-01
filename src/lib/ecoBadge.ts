export interface Badge { emoji: string; label: string; description: string }

export function getEcoBadge(posts: number, followers: number): Badge {
  if (posts >= 50 && followers >= 100) return { emoji: '🔥', label: 'Champion',  description: '50+ posts & 100+ followers' };
  if (followers >= 100)               return { emoji: '⚡', label: 'Guardian',   description: '100+ followers' };
  if (posts >= 25)                    return { emoji: '🌍', label: 'Advocate',   description: '25+ posts' };
  if (followers >= 10)                return { emoji: '🌲', label: 'Grove',      description: '10+ followers' };
  if (posts >= 3)                     return { emoji: '🌿', label: 'Sprout',     description: '3+ posts' };
  return                                     { emoji: '🌱', label: 'Seedling',   description: 'Just getting started' };
}

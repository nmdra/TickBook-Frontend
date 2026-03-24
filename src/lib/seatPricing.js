export const SEAT_CATEGORY_MULTIPLIERS = {
  vip: 1.7,
  premium: 1.25,
  standard: 1,
};

export function getSeatCategory(rowLabel = '') {
  if (rowLabel <= 'C') return 'VIP';
  if (rowLabel <= 'F') return 'Premium';
  return 'Standard';
}

export function getSeatMultiplier(rowLabel = '') {
  const category = getSeatCategory(rowLabel);
  if (category === 'VIP') return SEAT_CATEGORY_MULTIPLIERS.vip;
  if (category === 'Premium') return SEAT_CATEGORY_MULTIPLIERS.premium;
  return SEAT_CATEGORY_MULTIPLIERS.standard;
}

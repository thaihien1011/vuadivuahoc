// Constants for Vừa Đi Vừa Học (vuadivuahoc)

export const STAMP_REWARD_TABLE = {
  0: 0, // < 5 points: No stamp
  1: 1, // 5-6 points: Stamp Level 1 -> 1 Star
  2: 2, // 7-8 points: Stamp Level 2 -> 2 Stars
  3: 3  // 9-10 points: Stamp Level 3 -> 3 Stars
};

export const WARDROBE_SLOTS = {
  HAIR: 'hair',
  TOP: 'top',
  BOTTOM_OR_SKIRT: 'bottom_or_skirt',
  FOOTWEAR: 'footwear'
};

export const WARDROBE_ITEMS_CATALOG = [
  // HAIR SLOT (Tóc)
  {
    id: 'wi_hair_001',
    slot: WARDROBE_SLOTS.HAIR,
    name: 'Tóc Thám Hiểm Ngắn',
    star_cost: 5,
    iconColor: '#3b82f6',
    svgPath: 'hair_short'
  },
  {
    id: 'wi_hair_002',
    slot: WARDROBE_SLOTS.HAIR,
    name: 'Tóc Đuôi Ngựa Năng Động',
    star_cost: 5,
    iconColor: '#ec4899',
    svgPath: 'hair_ponytail'
  },
  {
    id: 'wi_hair_003',
    slot: WARDROBE_SLOTS.HAIR,
    name: 'Tóc Mũ Lưỡi Trai Sử Địa',
    star_cost: 5,
    iconColor: '#f59e0b',
    svgPath: 'hair_cap'
  },

  // TOP SLOT (Áo)
  {
    id: 'wi_top_001',
    slot: WARDROBE_SLOTS.TOP,
    name: 'Áo Phông Sử - Địa Phiêu Lưu',
    star_cost: 5,
    iconColor: '#6366f1',
    svgPath: 'top_adventure'
  },
  {
    id: 'wi_top_002',
    slot: WARDROBE_SLOTS.TOP,
    name: 'Áo Ngũ Thân Truyền Thống',
    star_cost: 5,
    iconColor: '#10b981',
    svgPath: 'top_traditional'
  },
  {
    id: 'wi_top_003',
    slot: WARDROBE_SLOTS.TOP,
    name: 'Áo Hoodie Chiến Sĩ',
    star_cost: 5,
    iconColor: '#8b5cf6',
    svgPath: 'top_hoodie'
  },

  // BOTTOM / SKIRT SLOT (Quần / Váy)
  {
    id: 'wi_bottom_001',
    slot: WARDROBE_SLOTS.BOTTOM_OR_SKIRT,
    name: 'Quần Khám Phá Xanh',
    star_cost: 5,
    iconColor: '#0ea5e9',
    svgPath: 'bottom_jeans'
  },
  {
    id: 'wi_bottom_002',
    slot: WARDROBE_SLOTS.BOTTOM_OR_SKIRT,
    name: 'Váy Xếp Ly Năng Động',
    star_cost: 5,
    iconColor: '#f43f5e',
    svgPath: 'skirt_pleated'
  },
  {
    id: 'wi_bottom_003',
    slot: WARDROBE_SLOTS.BOTTOM_OR_SKIRT,
    name: 'Quần Short Thể Thao',
    star_cost: 5,
    iconColor: '#84cc16',
    svgPath: 'bottom_shorts'
  },

  // FOOTWEAR SLOT (Giày / Ủng / Dép)
  {
    id: 'wi_shoes_001',
    slot: WARDROBE_SLOTS.FOOTWEAR,
    name: 'Giày Thể Thao Thám Hiểm',
    star_cost: 5,
    iconColor: '#06b6d4',
    svgPath: 'shoes_sneakers'
  },
  {
    id: 'wi_shoes_002',
    slot: WARDROBE_SLOTS.FOOTWEAR,
    name: 'Ủng Hành Quân Sử Địa',
    star_cost: 5,
    iconColor: '#d97706',
    svgPath: 'shoes_boots'
  },
  {
    id: 'wi_shoes_003',
    slot: WARDROBE_SLOTS.FOOTWEAR,
    name: 'Dép Cao Su Bác Hồ',
    star_cost: 5,
    iconColor: '#65a30d',
    svgPath: 'shoes_sandals'
  }
];

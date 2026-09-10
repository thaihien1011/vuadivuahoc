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
    fileName: 'wi_hair_001.png',
    slot: WARDROBE_SLOTS.HAIR,
    name: 'Tóc cắt cao',
    star_cost: 5,
    gender_target: 'male',
    iconColor: '#3b82f6',
    imagePath: '/assets/avatar/hair/wi_hair_001.png',
    svgPath: 'hair_short'
  },
  {
    id: 'wi_hair_002',
    fileName: 'wi_hair_002.png',
    slot: WARDROBE_SLOTS.HAIR,
    name: 'Tóc vàng cao',
    star_cost: 5,
    gender_target: 'female',
    iconColor: '#ec4899',
    imagePath: '/assets/avatar/hair/wi_hair_002.png',
    svgPath: 'hair_ponytail'
  },
  {
    id: 'wi_hair_003',
    fileName: 'wi_hair_003.png',
    slot: WARDROBE_SLOTS.HAIR,
    name: 'Tóc xoăn dài',
    star_cost: 5,
    gender_target: 'female',
    iconColor: '#ec4899',
    imagePath: '/assets/avatar/hair/wi_hair_003.png',
    svgPath: 'hair_cap'
  },
  {
    id: 'wi_hair_004',
    fileName: 'wi_hair_004.png',
    slot: WARDROBE_SLOTS.HAIR,
    name: 'Tóc vuốt keo',
    star_cost: 5,
    gender_target: 'male',
    iconColor: '#3b82f6',
    imagePath: '/assets/avatar/hair/wi_hair_004.png',
    svgPath: 'hair_curly'
  },

  // TOP SLOT (Áo)
  {
    id: 'wi_top_001',
    fileName: 'wi_top_001.png',
    slot: WARDROBE_SLOTS.TOP,
    name: 'Áo đồng phục thể thao',
    star_cost: 5,
    gender_target: 'male',
    iconColor: '#3b82f6',
    imagePath: '/assets/avatar/top/wi_top_001.png',
    svgPath: 'top_adventure'
  },
  {
    id: 'wi_top_002',
    fileName: 'wi_top_002.png',
    slot: WARDROBE_SLOTS.TOP,
    name: 'Áo len dài tay',
    star_cost: 5,
    gender_target: 'female',
    iconColor: '#ec4899',
    imagePath: '/assets/avatar/top/wi_top_002.png',
    svgPath: 'top_traditional'
  },
  {
    id: 'wi_top_003',
    fileName: 'wi_top_003.png',
    slot: WARDROBE_SLOTS.TOP,
    name: 'Áo kaki dài tay',
    star_cost: 5,
    gender_target: 'female',
    iconColor: '#ec4899',
    imagePath: '/assets/avatar/top/wi_top_003.png',
    svgPath: 'top_hoodie'
  },

  // BOTTOM / SKIRT SLOT (Quần / Váy)
  {
    id: 'wi_bottom_001',
    fileName: 'wi_bottom_001.png',
    slot: WARDROBE_SLOTS.BOTTOM_OR_SKIRT,
    name: 'Quần đồng phục thể thao',
    star_cost: 5,
    gender_target: 'male',
    iconColor: '#3b82f6',
    imagePath: '/assets/avatar/bottom/wi_bottom_001.png',
    svgPath: 'bottom_jeans'
  },
  {
    id: 'wi_bottom_002',
    fileName: 'wi_bottom_002.png',
    slot: WARDROBE_SLOTS.BOTTOM_OR_SKIRT,
    name: 'Váy xếp li ngắn',
    star_cost: 5,
    gender_target: 'female',
    iconColor: '#ec4899',
    imagePath: '/assets/avatar/bottom/wi_bottom_002.png',
    svgPath: 'skirt_pleated'
  },
  {
    id: 'wi_bottom_003',
    fileName: 'wi_bottom_003.png',
    slot: WARDROBE_SLOTS.BOTTOM_OR_SKIRT,
    name: 'Quần jean thụng',
    star_cost: 5,
    gender_target: 'male',
    iconColor: '#3b82f6',
    imagePath: '/assets/avatar/bottom/wi_bottom_003.png',
    svgPath: 'bottom_kaki'
  },
  {
    id: 'wi_bottom_004',
    fileName: 'wi_bottom_004.png',
    slot: WARDROBE_SLOTS.BOTTOM_OR_SKIRT,
    name: 'Quần kaki dài',
    star_cost: 5,
    gender_target: 'female',
    iconColor: '#ec4899',
    imagePath: '/assets/avatar/bottom/wi_bottom_004.png',
    svgPath: 'skirt_long'
  },

  // FOOTWEAR SLOT (Giày)
  {
    id: 'wi_shoes_001',
    fileName: 'wi_shoes_001.png',
    slot: WARDROBE_SLOTS.FOOTWEAR,
    name: 'Giày Thể Thao Xanh',
    star_cost: 5,
    gender_target: 'male',
    iconColor: '#3b82f6',
    imagePath: '/assets/avatar/footwear/wi_shoes_001.png',
    svgPath: 'shoes_sneakers'
  },
  {
    id: 'wi_shoes_002',
    fileName: 'wi_shoes_002.png',
    slot: WARDROBE_SLOTS.FOOTWEAR,
    name: 'Bốt cổ cao',
    star_cost: 5,
    gender_target: 'female',
    iconColor: '#ec4899',
    imagePath: '/assets/avatar/footwear/wi_shoes_002.png',
    svgPath: 'shoes_boots'
  },
  {
    id: 'wi_shoes_003',
    fileName: 'wi_shoes_003.png',
    slot: WARDROBE_SLOTS.FOOTWEAR,
    name: 'Giày sneaker',
    star_cost: 5,
    gender_target: 'female',
    iconColor: '#ec4899',
    imagePath: '/assets/avatar/footwear/wi_shoes_003.png',
    svgPath: 'shoes_pink'
  },
  {
    id: 'wi_shoes_004',
    fileName: 'wi_shoes_004.png',
    slot: WARDROBE_SLOTS.FOOTWEAR,
    name: 'Giày Thám Hiểm Cổ Cao',
    star_cost: 5,
    gender_target: 'male',
    iconColor: '#3b82f6',
    imagePath: '/assets/avatar/footwear/wi_shoes_004.png',
    svgPath: 'shoes_high'
  }
];

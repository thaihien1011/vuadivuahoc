// Mock Data for "Vừa Đi Vừa Học" (vuadivuahoc)
// Includes Locations (History + Geography), Question Banks, Students, Teachers, and Initial State

export const INITIAL_TEACHERS = [
  {
    id: 'teacher_001',
    name: 'Cô Nguyễn Thị Hoa (GV Sử - Địa)',
    recovery_email: 'hoa.nguyen@thcstranphu.edu.vn',
    role: 'teacher'
  }
];

export const INITIAL_CLASSES = [
  { id: 'class_8a1', name: 'Lớp 8A1', teacher_id: 'teacher_001' },
  { id: 'class_8a2', name: 'Lớp 8A2', teacher_id: 'teacher_001' }
];

export const INITIAL_STUDENTS = [
  {
    id: 'st_hs001',
    username: 'nguyentramy',
    name: 'Nguyễn Trà My',
    class_id: 'class_8a1',
    current_star: 15,
    must_change_password: false,
    avatar_config: {
      hair: 'wi_hair_001',
      top: 'wi_top_001',
      bottom_or_skirt: 'wi_bottom_001',
      footwear: 'wi_shoes_001'
    }
  },
  {
    id: 'st_hs002',
    username: 'trannam8a1',
    name: 'Trần Nam',
    class_id: 'class_8a1',
    current_star: 8,
    must_change_password: false,
    avatar_config: {
      hair: 'wi_hair_003',
      top: 'wi_top_003',
      bottom_or_skirt: 'wi_bottom_003',
      footwear: 'wi_shoes_002'
    }
  },
  {
    id: 'st_hs003',
    username: 'lethu8a2',
    name: 'Lê Thị Thu',
    class_id: 'class_8a2',
    current_star: 5,
    must_change_password: true,
    avatar_config: {
      hair: 'wi_hair_002',
      top: 'wi_top_002',
      bottom_or_skirt: 'wi_bottom_002',
      footwear: 'wi_shoes_001'
    }
  }
];

export const INITIAL_LESSONS = [
  // --- TÂY BẮC ---
  {
    id: 'LS_DIENBIEN',
    location_name: 'Điện Biên',
    subtitle: 'Thung Lũng Mường Thanh & Chiến Thắng Lừng Lẫy',
    name: 'Điện Biên — Thung Lũng Mường Thanh & Chiến Thắng Lừng Lẫy',
    province_name: 'Điện Biên',
    region: 'Tây Bắc',
    coordinates: { x: 15.3, y: 15.1 },
    is_active: true,
    intro_text: `Điện Biên nổi tiếng với thung lũng Mường Thanh rộng lớn nhất Tây Bắc và Chiến dịch Điện Biên Phủ lịch sử 1954 "lừng lẫy năm châu, chấn động địa cầu".`,
    intro_video_url: 'https://www.youtube.com/embed/g2g-8_aW4pA'
  },
  {
    id: 'LS_LAICHAU',
    location_name: 'Lai Châu',
    subtitle: 'Hùng Vĩ Nơi Đầu Nguồn Sông Đà',
    name: 'Lai Châu — Hùng Vĩ Nơi Đầu Nguồn Sông Đà',
    province_name: 'Lai Châu',
    region: 'Tây Bắc',
    coordinates: { x: 15.2, y: 11.8 },
    is_active: true,
    intro_text: `Lai Châu nổi tiếng với đèo O Quý Hồ hùng vĩ, đỉnh Pusilung, đỉnh Putaleng cao ngất trời và thiên nhiên Tây Bắc hoang sơ.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_LAOCAI',
    location_name: 'Lào Cai',
    subtitle: 'Sapa Sương Mù & Đỉnh Fansipan',
    name: 'Lào Cai — Sapa Sương Mù & Đỉnh Fansipan',
    province_name: 'Lào Cai',
    region: 'Tây Bắc',
    coordinates: { x: 21.2, y: 11.6 },
    is_active: true,
    intro_text: `Lào Cai ghi dấu với Fansipan - "nóc nhà Đông Dương", khu du lịch Sapa thơ mộng và vị trí cửa ngõ biên giới phía Bắc.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_SONLA',
    location_name: 'Sơn La',
    subtitle: 'Cao Nguyên Mộc Châu & Thủy Điện Sơn La',
    name: 'Sơn La — Cao Nguyên Mộc Châu & Thủy Điện Sơn La',
    province_name: 'Sơn La',
    region: 'Tây Bắc',
    coordinates: { x: 22, y: 18 },
    is_active: true,
    intro_text: `Sơn La nổi tiếng với cao nguyên Mộc Châu xanh mướt, di tích Nhà tù Sơn La và công trình Thủy điện Sơn La lớn nhất Đông Nam Á.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_HOABINH',
    location_name: 'Hòa Bình',
    subtitle: 'Vùng Đất Mường & Thủy Điện Hòa Bình',
    name: 'Hòa Bình — Vùng Đất Mường & Thủy Điện Hòa Bình',
    province_name: 'Hòa Bình',
    region: 'Tây Bắc',
    coordinates: { x: 31.9, y: 21.5 },
    is_active: true,
    intro_text: `Hòa Bình là cái nôi của Văn hóa Hòa Bình thời đồ đá, nổi tiếng với hồ thủy điện Hòa Bình trên sông Đà và bản Lác Mai Châu.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_YENBAI',
    location_name: 'Yên Bái',
    subtitle: 'Danh Thắng Mù Cang Chải',
    name: 'Yên Bái — Danh Thắng Mù Cang Chải',
    province_name: 'Yên Bái',
    region: 'Tây Bắc',
    coordinates: { x: 25.8, y: 15.6 },
    is_active: true,
    intro_text: `Yên Bái tự hào với ruộng bậc thang Mù Cang Chải di sản quốc gia, hồ Thác Bà và cuộc Khởi nghĩa Yên Bái năm 1930.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },

  // --- ĐÔNG BẮC ---
  {
    id: 'LS_HAGIANG',
    location_name: 'Hà Giang',
    subtitle: 'Công Viên Địa Chất Cao Nguyên Đá Đồng Văn',
    name: 'Hà Giang — Công Viên Địa Chất Cao Nguyên Đá Đồng Văn',
    province_name: 'Hà Giang',
    region: 'Đông Bắc',
    coordinates: { x: 28.2, y: 9.6 },
    is_active: true,
    intro_text: `Hà Giang là vùng đất cực Bắc Tổ quốc với đèo Mã Pí Lèng, Cột cờ Lũng Cú và Cao nguyên đá Đồng Văn hùng vĩ.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_CAOBANG',
    location_name: 'Cao Bằng',
    subtitle: 'Pác Bó & Thác Bản Giốc',
    name: 'Cao Bằng — Pác Bó & Thác Bản Giốc',
    province_name: 'Cao Bằng',
    region: 'Đông Bắc',
    coordinates: { x: 37.4, y: 9.6 },
    is_active: true,
    intro_text: `Cao Bằng ghi dấu di tích Pác Bó nơi Bác Hồ về nước năm 1941 và Thác Bản Giốc - một trong những thác biên giới đẹp nhất thế giới.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_BACKAN',
    location_name: 'Bắc Kạn',
    subtitle: 'Hồ Ba Bể Xanh Biếc',
    name: 'Bắc Kạn — Hồ Ba Bể Xanh Biếc',
    province_name: 'Bắc Kạn',
    region: 'Đông Bắc',
    coordinates: { x: 35.3, y: 12.8 },
    is_active: true,
    intro_text: `Bắc Kạn thuộc vùng Việt Bắc lịch sử, nổi tiếng với danh thắng Hồ Ba Bể - hồ nước ngọt tự nhiên trên núi đẹp bậc nhất.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_TUYENQUANG',
    location_name: 'Tuyên Quang',
    subtitle: 'Thủ Đô Kháng Chiến Tân Trào',
    name: 'Tuyên Quang — Thủ Đô Kháng Chiến Tân Trào',
    province_name: 'Tuyên Quang',
    region: 'Đông Bắc',
    coordinates: { x: 30.5, y: 14.2 },
    is_active: true,
    intro_text: `Tuyên Quang là Thủ đô Giải phóng, Thủ đô Kháng chiến với Cây đa Tân Trào, Lán Nà Nưa ghi dấu quyết định Tổng khởi nghĩa 1945.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_THAINGUYEN',
    location_name: 'Thái Nguyên',
    subtitle: 'Thủ Đô Gió Ngàn & Đệ Nhất Danh Trà',
    name: 'Thái Nguyên — Thủ Đô Gió Ngàn & Đệ Nhất Danh Trà',
    province_name: 'Thái Nguyên',
    region: 'Đông Bắc',
    coordinates: { x: 35.1, y: 16.1 },
    is_active: true,
    intro_text: `Thái Nguyên thuộc ATK Định Hóa thời kháng chiến Pháp, trung tâm công nghiệp luyện kim và vùng chè Tân Cương danh tiếng.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_LANGSON',
    location_name: 'Lạng Sơn',
    subtitle: 'Ải Chi Lăng & Cửa Ải Biên Thùy',
    name: 'Lạng Sơn — Ải Chi Lăng & Cửa Ải Biên Thùy',
    province_name: 'Lạng Sơn',
    region: 'Đông Bắc',
    coordinates: { x: 41.9, y: 14.6 },
    is_active: true,
    intro_text: `Lạng Sơn vang dội chiến công Ải Chi Lăng đánh tan quân Minh năm 1427, có chùa Tam Thanh, thành nhà Mạc và động Nhị Thanh.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_BACGIANG',
    location_name: 'Bắc Giang',
    subtitle: 'Chiến Thắng Xương Giang & Vải Thiều Lục Ngạn',
    name: 'Bắc Giang — Chiến Thắng Xương Giang & Vải Thiều Lục Ngạn',
    province_name: 'Bắc Giang',
    region: 'Đông Bắc',
    coordinates: { x: 38.5, y: 17.6 },
    is_active: true,
    intro_text: `Bắc Giang có di tích Chiến thắng Xương Giang năm 1427, chốn tổ Tây Yên Tử và vùng trồng vải thiều Lục Ngạn lớn nhất cả nước.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_QUANGNINH',
    location_name: 'Quảng Ninh',
    subtitle: 'Vịnh Hạ Long Di Sản & Chiến Thắng Bạch Đằng',
    name: 'Quảng Ninh — Vịnh Hạ Long Di Sản & Chiến Thắng Bạch Đằng',
    province_name: 'Quảng Ninh',
    region: 'Đông Bắc',
    coordinates: { x: 46.4, y: 18.4 },
    is_active: true,
    intro_text: `Quảng Ninh nổi tiếng với Vịnh Hạ Long di sản thiên nhiên thế giới, chiến trường Bạch Đằng Giang, Yên Tử và trung tâm khai thác than.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_PHUTHO',
    location_name: 'Phú Thọ',
    subtitle: 'Đất Tổ Hùng Vương',
    name: 'Phú Thọ — Đất Tổ Hùng Vương',
    province_name: 'Phú Thọ',
    region: 'Đông Bắc',
    coordinates: { x: 29.3, y: 17.6 },
    is_active: true,
    intro_text: `Phú Thọ là cội nguồn dân tộc Việt Nam với Khu di tích Đền Hùng, nơi thờ tự các Vua Hùng đã có công dựng nước Văn Lang.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },

  // --- ĐỒNG BẰNG SÔNG HỒNG ---
  {
    id: 'LS_HANOI',
    location_name: 'Hà Nội',
    subtitle: 'Thủ Đô Ngàn Năm Văn Hiến',
    name: 'Hà Nội — Thủ Đô Ngàn Năm Văn Hiến',
    province_name: 'Hà Nội',
    region: 'Đồng Bằng Sông Hồng',
    coordinates: { x: 35.2, y: 18.8 },
    is_active: true,
    intro_text: `Thủ đô Hà Nội nằm ở trung tâm đồng bằng sông Hồng màu mỡ, là trung tâm chính trị, văn hóa ngàn năm văn hiến từ mốc 1010 Lý Thái Tổ dời đô.`,
    intro_video_url: 'https://www.youtube.com/embed/m06S8t_hQ1E'
  },
  {
    id: 'LS_VINHPHUC',
    location_name: 'Vĩnh Phúc',
    subtitle: 'Danh Thắng Tam Đảo & Tây Thiên',
    name: 'Vĩnh Phúc — Danh Thắng Tam Đảo & Tây Thiên',
    province_name: 'Vĩnh Phúc',
    region: 'Đồng Bằng Sông Hồng',
    coordinates: { x: 33, y: 17.5 },
    is_active: true,
    intro_text: `Vĩnh Phúc nổi tiếng với khu nghỉ dưỡng núi Tam Đảo, danh thắng Tây Thiên và trung tâm phát triển công nghiệp năng động.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_BACNINH',
    location_name: 'Bắc Ninh',
    subtitle: 'Vùng Đất Dân Ca Quan Họ & Kinh Bắc',
    name: 'Bắc Ninh — Vùng Đất Dân Ca Quan Họ & Kinh Bắc',
    province_name: 'Bắc Ninh',
    region: 'Đồng Bằng Sông Hồng',
    coordinates: { x: 37.1, y: 19 },
    is_active: true,
    intro_text: `Bắc Ninh là trung tâm văn hóa Kinh Bắc cổ kính, cái nôi của Dân ca Quan họ di sản thế giới, đền Đô và chùa Dâu cổ nhất Việt Nam.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_HAIDUONG',
    location_name: 'Hải Dương',
    subtitle: 'Di Tích Côn Sơn Kiếp Bạc',
    name: 'Hải Dương — Di Tích Côn Sơn Kiếp Bạc',
    province_name: 'Hải Dương',
    region: 'Đồng Bằng Sông Hồng',
    coordinates: { x: 39.1, y: 20.3 },
    is_active: true,
    intro_text: `Hải Dương là xứ Đông văn nhat với Côn Sơn Kiếp Bạc gắn liền với Nguyễn Trãi và Hưng Đạo Vương Trần Quốc Tuấn.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_HAIPHONG',
    location_name: 'Hải Phòng',
    subtitle: 'Thành Phố Hoa Phượng Đỏ & Cảng Biển',
    name: 'Hải Phòng — Thành Phố Hoa Phượng Đỏ & Cảng Biển',
    province_name: 'Hải Phòng',
    region: 'Đồng Bằng Sông Hồng',
    coordinates: { x: 41.3, y: 21.2 },
    is_active: true,
    intro_text: `Hải Phòng là thành phố cảng lớn nhất phía Bắc, gắn liền với đảo Cát Bà, bãi biển Đồ Sơn và sông Bạch Đằng lịch sử.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_HUNGYEN',
    location_name: 'Hưng Yên',
    subtitle: 'Phố Hiến "Thứ Nhất Kinh Kỳ, Thứ Nhì Phố Hiến"',
    name: 'Hưng Yên — Phố Hiến "Thứ Nhất Kinh Kỳ, Thứ Nhì Phố Hiến"',
    province_name: 'Hưng Yên',
    region: 'Đồng Bằng Sông Hồng',
    coordinates: { x: 36.7, y: 20.9 },
    is_active: true,
    intro_text: `Hưng Yên nổi tiếng với thương cảng Phố Hiến sầm uất thế kỷ XVII, nhãn lồng Phố Hiến và cây nhãn tổ hàng trăm năm.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_THAIBINH',
    location_name: 'Thái Bình',
    subtitle: 'Quê Hương Chị Hai 5 Tấn',
    name: 'Thái Bình — Quê Hương Chị Hai 5 Tấn',
    province_name: 'Thái Bình',
    region: 'Đồng Bằng Sông Hồng',
    coordinates: { x: 39.2, y: 22.4 },
    is_active: true,
    intro_text: `Thái Bình nằm trọn trong vùng châu thổ sông Hồng, nổi tiếng với chùa Keo kiến trúc gỗ độc đáo và truyền thống thâm canh lúa gạo.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_HANAM',
    location_name: 'Hà Nam',
    subtitle: 'Chùa Tam Chúc & Núi Cấm',
    name: 'Hà Nam — Chùa Tam Chúc & Núi Cấm',
    province_name: 'Hà Nam',
    region: 'Đồng Bằng Sông Hồng',
    coordinates: { x: 35.9, y: 22.6 },
    is_active: true,
    intro_text: `Hà Nam có quần thể tâm linh chùa Tam Chúc lớn bậc nhất, đền Trần Thương và sông Đáy thơ mộng.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_NAMDINH',
    location_name: 'Nam Định',
    subtitle: 'Đất Cố Đồ Nhà Trần & Đền Trần',
    name: 'Nam Định — Đất Cố Đồ Nhà Trần & Đền Trần',
    province_name: 'Nam Định',
    region: 'Đồng Bằng Sông Hồng',
    coordinates: { x: 38.2, y: 24.1 },
    is_active: true,
    intro_text: `Nam Định là phát tích nhà Trần lừng lẫy 3 lần đánh thắng quân Nguyên Mông, có Lễ khai ấn Đền Trần và vương gzals Phủ Dầy.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_NINHBINH',
    location_name: 'Ninh Bình',
    subtitle: 'Cố Đô Hoa Lư & Di Sản Tràng An',
    name: 'Ninh Bình — Cố Đô Hoa Lư & Di Sản Tràng An',
    province_name: 'Ninh Bình',
    region: 'Đồng Bằng Sông Hồng',
    coordinates: { x: 35.4, y: 24.3 },
    is_active: true,
    intro_text: `Ninh Bình tự hào với Cố đô Hoa Lư triều Đinh - Tiền Lê và Quần thể danh thắng Tràng An di sản hỗn hợp thế giới duy nhất ở Đông Nam Á.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },

  // --- BẮC TRUNG BỘ ---
  {
    id: 'LS_THANHHOA',
    location_name: 'Thanh Hóa',
    subtitle: 'Thành Nhà Hồ & Khởi Nghĩa Lam Sơn',
    name: 'Thanh Hóa — Thành Nhà Hồ & Khởi Nghĩa Lam Sơn',
    province_name: 'Thanh Hóa',
    region: 'Bắc Trung Bộ',
    coordinates: { x: 33.8, y: 26.8 },
    is_active: true,
    intro_text: `Thanh Hóa có Di sản thế giới Thành Nhà Hồ, di tích Lam Kinh phát tích khởi nghĩa Lam Sơn của Lê Lợi và bãi biển Sầm Sơn.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_NGHEAN',
    location_name: 'Nghệ An',
    subtitle: 'Quê Hương Chủ Tịch Hồ Chí Minh',
    name: 'Nghệ An — Quê Hương Chủ Tịch Hồ Chí Minh',
    province_name: 'Nghệ An',
    region: 'Bắc Trung Bộ',
    coordinates: { x: 30.5, y: 30.9 },
    is_active: true,
    intro_text: `Nghệ An là tỉnh có diện tích lớn nhất Việt Nam, quê hương Bác Hồ tại Kim Liên Nam Đàn, sông Lam núi Hồng và phong trào Xô Viết Nghệ Tĩnh.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_HATINH',
    location_name: 'Hà Tĩnh',
    subtitle: 'Ngã Ba Đồng Lộc & Danh Nhân Nguyễn Du',
    name: 'Hà Tĩnh — Ngã Ba Đồng Lộc & Danh Nhân Nguyễn Du',
    province_name: 'Hà Tĩnh',
    region: 'Bắc Trung Bộ',
    coordinates: { x: 33.7, y: 36.3 },
    is_active: true,
    intro_text: `Hà Tĩnh ghi dấu di tích lịch sử Ngã ba Đồng Lộc anh hùng, quê hương Đại thi hào Nguyễn Du tác giả Truyện Kiều.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_QUANGBINH',
    location_name: 'Quảng Bình',
    subtitle: 'Di Sản Phong Nha — Kẻ Bàng & Hang Sơn Đoòng',
    name: 'Quảng Bình — Di Sản Phong Nha - Kẻ Bàng & Hang Sơn Đoòng',
    province_name: 'Quảng Bình',
    region: 'Bắc Trung Bộ',
    coordinates: { x: 40.1, y: 41.6 },
    is_active: true,
    intro_text: `Quảng Bình nổi tiếng thế giới với Vườn quốc gia Phong Nha - Kẻ Bàng và Hang Sơn Đoòng - hang động tự nhiên lớn nhất hành tinh.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_QUANGTRI',
    location_name: 'Quảng Trị',
    subtitle: 'Thành Cổ Quảng Trị & Thành Cổ Lịch Sử',
    name: 'Quảng Trị — Thành Cổ Quảng Trị & Thành Cổ Lịch Sử',
    province_name: 'Quảng Trị',
    region: 'Bắc Trung Bộ',
    coordinates: { x: 44.2, y: 45.6 },
    is_active: true,
    intro_text: `Quảng Trị là mảnh đất lịch sử anh hùng với vĩ tuyến 17 sông Bến Hải, cầu Hiền Lương, Thành cổ Quảng Trị và địa đạo Vịnh Mốc.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_THUATHIENHUE',
    location_name: 'Thừa Thiên Huế',
    subtitle: 'Quần Thể Di Sản Cố Đô Huế',
    name: 'Thừa Thiên Huế — Quần Thể Di Sản Cố Đô Huế',
    province_name: 'Thừa Thiên Huế',
    region: 'Bắc Trung Bộ',
    coordinates: { x: 49.5, y: 47.9 },
    is_active: true,
    intro_text: `Thừa Thiên Huế là kinh đô triều Nguyễn (1802-1945), có Quần thể di tích Cố đô Huế và Nhã nhạc cung đình Huế được UNESCO công nhận.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },

  // --- DUYÊN HẢI NAM TRUNG BỘ ---
  {
    id: 'LS_DANANG',
    location_name: 'Đà Nẵng',
    subtitle: 'Thành Phố Đáng Sống & Thành Cổ Hải Vân',
    name: 'Đà Nẵng — Thành Phố Đáng Sống & Thành Cổ Hải Vân',
    province_name: 'Đà Nẵng',
    region: 'Duyên Hải Nam Trung Bộ',
    coordinates: { x: 53.2, y: 49.4 },
    is_active: true,
    intro_text: `Đà Nẵng là trung tâm kinh tế lớn của miền Trung, nổi tiếng với Ngũ Hành Sơn, Bà Nà Hills, Cầu Vàng và bãi biển Mỹ Khê.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_QUANGNAM',
    location_name: 'Quảng Nam',
    subtitle: 'Di Sản Hội An & Thánh Địa Mỹ Sơn',
    name: 'Quảng Nam — Di Sản Hội An & Thánh Địa Mỹ Sơn',
    province_name: 'Quảng Nam',
    region: 'Duyên Hải Nam Trung Bộ',
    coordinates: { x: 52.7, y: 53.1 },
    is_active: true,
    intro_text: `Quảng Nam sở hữu 2 di sản thế giới UNESCO: Đô thị cổ Hội An và Thánh địa Mỹ Sơn, cùng danh hiệu "Trung dũng kiên cường, đi đầu diệt Mỹ".`,
    intro_video_url: 'https://www.youtube.com/embed/1Jb0HqLwJTo'
  },
  {
    id: 'LS_QUANGNGAI',
    location_name: 'Quảng Ngãi',
    subtitle: 'Đảo Lý Sơn & Văn Hóa Sa Huỳnh',
    name: 'Quảng Ngãi — Đảo Lý Sơn & Văn Hóa Sa Huỳnh',
    province_name: 'Quảng Ngãi',
    region: 'Duyên Hải Nam Trung Bộ',
    coordinates: { x: 58.8, y: 56.6 },
    is_active: true,
    intro_text: `Quảng Ngãi có đảo vôi núi lửa Lý Sơn - quê hương Đội hùng binh Hoàng Sa, cái nôi Văn hóa Sa Huỳnh và di tích Sơn Mỹ.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_BINHDINH',
    location_name: 'Bình Định',
    subtitle: 'Đất Võ Tây Sơn & Hoàng Hoàng Đế',
    name: 'Bình Định — Đất Võ Tây Sơn & Hoàng Hoàng Đế',
    province_name: 'Bình Định',
    region: 'Duyên Hải Nam Trung Bộ',
    coordinates: { x: 60.3, y: 61.8 },
    is_active: true,
    intro_text: `Bình Định là quê hương Hoàng đế Quang Trung - Nguyễn Huệ, vùng đất võ thuật Tây Sơn huyền thoại và tháp Chăm cổ kính.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_PHUYEN',
    location_name: 'Phú Yên',
    subtitle: 'Gành Đá Đĩa & Mũi Điện Cực Đông',
    name: 'Phú Yên — Gành Đá Đĩa & Mũi Điện Cực Đông',
    province_name: 'Phú Yên',
    region: 'Duyên Hải Nam Trung Bộ',
    coordinates: { x: 61.1, y: 66.5 },
    is_active: true,
    intro_text: `Phú Yên có Gành Đá Đĩa kỳ thú duy nhất Việt Nam, Mũi Đại Lãnh nơi đón ánh bình minh đầu tiên trên đất liền Tổ quốc.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_KHANHHOA',
    location_name: 'Khánh Hòa',
    subtitle: 'Vịnh Nha Trang & Xứ Sở Trầm Hương',
    name: 'Khánh Hòa — Vịnh Nha Trang & Xứ Sở Trầm Hương',
    province_name: 'Khánh Hòa',
    region: 'Duyên Hải Nam Trung Bộ',
    coordinates: { x: 61.2, y: 72.6 },
    is_active: true,
    intro_text: `Khánh Hòa nổi tiếng với thành phố biển Nha Trang, Vịnh Cam Ranh chiến lược, Tháp Bà Ponagar và đặc sản Yến sào Trầm hương.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_NINHTHUAN',
    location_name: 'Ninh Thuận',
    subtitle: 'Tháp Po Klong Garai & Vườn Quốc Gia Núi Chúa',
    name: 'Ninh Thuận — Tháp Po Klong Garai & Vườn Quốc Gia Núi Chúa',
    province_name: 'Ninh Thuận',
    region: 'Duyên Hải Nam Trung Bộ',
    coordinates: { x: 59.4, y: 76.2 },
    is_active: true,
    intro_text: `Ninh Thuận nổi tiếng với tháp Chăm Po Klong Garai cổ kính, đồng cừu An Hòa, vựa nho lớn nhất nước và Vườn quốc gia Núi Chúa.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_BINHTHUAN',
    location_name: 'Bình Thuận',
    subtitle: 'Đồi Cát Mũi Né & Di Tích Trường Dục Thanh',
    name: 'Bình Thuận — Đồi Cát Mũi Né & Di Tích Trường Dục Thanh',
    province_name: 'Bình Thuận',
    region: 'Duyên Hải Nam Trung Bộ',
    coordinates: { x: 51.7, y: 79.8 },
    is_active: true,
    intro_text: `Bình Thuận có Đồi cát bay Mũi Né, di tích Trường Dục Thanh nơi Bác Hồ dừng chân dạy học năm 1910 và đảo Phú Quý.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },

  // --- TÂY NGUYÊN ---
  {
    id: 'LS_KONTUM',
    location_name: 'Kon Tum',
    subtitle: 'Nhà Thờ Gỗ & Ngục Kon Tum',
    name: 'Kon Tum — Nhà Thờ Gỗ & Ngục Kon Tum',
    province_name: 'Kon Tum',
    region: 'Tây Nguyên',
    coordinates: { x: 53.5, y: 57.6 },
    is_active: true,
    intro_text: `Kon Tum ở phía Bắc Tây Nguyên, nổi tiếng với Nhà thờ Gỗ kiến trúc cổ độc đáo, sông Đắk Bla ngược dòng và di tích Ngục Kon Tum.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_GIALAI',
    location_name: 'Gia Lai',
    subtitle: 'Biển Hồ T’Nưng & Thác Phú Cường',
    name: 'Gia Lai — Biển Hồ T’Nưng & Thác Phú Cường',
    province_name: 'Gia Lai',
    region: 'Tây Nguyên',
    coordinates: { x: 54.5, y: 63.1 },
    is_active: true,
    intro_text: `Gia Lai nổi tiếng với Biển Hồ T’Nưng "đôi mắt Pleiku", Quảng trường Đại Đoàn Kết và văn hóa Cồng chiêng Tây Nguyên.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_DAKLAK',
    location_name: 'Đắk Lắk',
    subtitle: 'Thủ Phủ Cà Phê BMT & Buôn Đôn',
    name: 'Đắc Lắc — Thủ Phủ Cà Phê BMT & Buôn Đôn',
    province_name: 'Đắk Lắk',
    region: 'Tây Nguyên',
    coordinates: { x: 54.8, y: 69.2 },
    is_active: true,
    intro_text: `Đắk Lắk là thủ phủ cà phê của Việt Nam tại Buôn Ma Thuột, nổi tiếng với truyền thống săn bắt voi Buôn Đôn và Hồ Lắc.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_DAKNONG',
    location_name: 'Đắk Nông',
    subtitle: 'Công Viên Địa Chất Toàn Cầu Hang Động Núi Lửa',
    name: 'Đắk Nông — Công Viên Địa Chất Toàn Cầu Hang Động Núi Lửa',
    province_name: 'Đắk Nông',
    region: 'Tây Nguyên',
    coordinates: { x: 50, y: 73.3 },
    is_active: true,
    intro_text: `Đắk Nông sở hữu Công viên địa chất toàn cầu UNESCO với hệ thống hang động núi lửa Krông Nô dài nhất Đông Nam Á.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_LAMDONG',
    location_name: 'Lâm Đồng',
    subtitle: 'Đà Lạt Thành Phố Ngàn Hoa',
    name: 'Lâm Đồng — Đà Lạt Thành Phố Ngàn Hoa',
    province_name: 'Lâm Đồng',
    region: 'Tây Nguyên',
    coordinates: { x: 54.7, y: 74.7 },
    is_active: true,
    intro_text: `Lâm Đồng nằm trên cao nguyên Langbiang với thành phố Đà Lạt mộng mơ, khí hậu ôn đới quanh năm và ngàn hoa khoe sắc.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },

  // --- ĐÔNG NAM BỘ ---
  {
    id: 'LS_BINHPHUOC',
    location_name: 'Bình Phước',
    subtitle: 'Căn Cứ Tà Thiết & Rừng Cao Su',
    name: 'Bình Phước — Căn Cứ Tà Thiết & Rừng Cao Su',
    province_name: 'Bình Phước',
    region: 'Đông Nam Bộ',
    coordinates: { x: 43, y: 77.1 },
    is_active: true,
    intro_text: `Bình Phước là thủ phủ điều và cao su của Việt Nam, ghi dấu Di tích Bộ chỉ huy Tà Thiết căn cứ chiến lược thời chống Mỹ.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_TAYNINH',
    location_name: 'Tây Ninh',
    subtitle: 'Núi Bà Đen & Tòa Thánh Cao Đài',
    name: 'Tây Ninh — Núi Bà Đen & Tòa Thánh Cao Đài',
    province_name: 'Tây Ninh',
    region: 'Đông Nam Bộ',
    coordinates: { x: 36.8, y: 77.8 },
    is_active: true,
    intro_text: `Tây Ninh nổi tiếng với Núi Bà Đen "nóc nhà Nam Bộ", Tòa thánh Cao Đài Tây Ninh kiến trúc rực rỡ và Căn cứ Trung ương Cục Miền Nam.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_BINHDUONG',
    location_name: 'Bình Dương',
    subtitle: 'Làng Nghề Gốm Lái Thiêu & Địa Đạo Tam Giác Sắt',
    name: 'Bình Dương — Làng Nghề Gốm Lái Thiêu & Địa Đạo Tam Giác Sắt',
    province_name: 'Bình Dương',
    region: 'Đông Nam Bộ',
    coordinates: { x: 41.6, y: 79.3 },
    is_active: true,
    intro_text: `Bình Dương là thủ phủ công nghiệp bứt phá, nổi tiếng với làng gốm Lái Thiêu, sơn mài Tương Bình Hiệp và Địa đạo Tam Giác Sắt.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_DONGNAI',
    location_name: 'Đồng Nai',
    subtitle: 'Vùng Đất Trấn Biên Hào Hùng',
    name: 'Đồng Nai — Vùng Đất Trấn Biên Hào Hùng',
    province_name: 'Đồng Nai',
    region: 'Đông Nam Bộ',
    coordinates: { x: 46.2, y: 79.5 },
    is_active: true,
    intro_text: `Đồng Nai là vùng đất Trấn Biên hình thành từ năm 1698 bởi Nguyễn Hữu Cảnh, vang danh với Chiến khu Đ và Chiến thắng Xuân Lộc 1975.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_BARIAVUNGTAU',
    location_name: 'Bà Rịa - Vũng Tàu',
    subtitle: 'Vũng Tàu — Côn Đảo Anh Hùng & Thành Phố Biển',
    name: 'Bà Rịa - Vũng Tàu — Côn Đảo Anh Hùng & Thành Phố Biển',
    province_name: 'Bà Rịa - Vũng Tàu',
    region: 'Đông Nam Bộ',
    coordinates: { x: 65.5, y: 95.5 },
    is_active: true,
    intro_text: `Bà Rịa - Vũng Tàu nổi tiếng với trung tâm khai thác dầu khí, bãi biển Vũng Tàu và quần đảo Côn Đảo di tích lịch sử đặc biệt.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_TPHCM',
    location_name: 'TP. Hồ Chí Minh',
    subtitle: 'Thành Phố Mang Tên Bác Rực Rỡ Tên Vàng',
    name: 'TP. Hồ Chí Minh — Thành Phố Mang Tên Bác Rực Rỡ Tên Vàng',
    province_name: 'TP. Hồ Chí Minh',
    region: 'Đông Nam Bộ',
    coordinates: { x: 41.4, y: 81.3 },
    is_active: true,
    intro_text: `TP. Hồ Chí Minh là đô thị lớn nhất Việt Nam, đầu tàu kinh tế, có Đền Bến Dược, Dinh Độc Lập, Bến Nhà Rồng nơi Bác Hồ ra đi tìm đường cứu nước năm 1911.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },

  // --- ĐỒNG BẰNG SÔNG CỬU LONG ---
  {
    id: 'LS_LONGAN',
    location_name: 'Long An',
    subtitle: 'Vàm Cỏ Đông & Vàm Cỏ Tây',
    name: 'Long An — Vàm Cỏ Đông & Vàm Cỏ Tây',
    province_name: 'Long An',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 37.9, y: 81.2 },
    is_active: true,
    intro_text: `Long An là cửa ngõ nối liền Đông Nam Bộ và Miền Tây, nổi tiếng với hai dòng sông Vàm Cỏ Đông, Vàm Cỏ Tây và danh hiệu "Trung dũng gia cường".`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_TIENGIANG',
    location_name: 'Tiền Giang',
    subtitle: 'Trận Rạch Gầm — Xoài Mút 1785',
    name: 'Tiền Giang — Trận Rạch Gầm - Xoài Mút 1785',
    province_name: 'Tiền Giang',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 37.6, y: 83 },
    is_active: true,
    intro_text: `Tiền Giang vang dội chiến công đại phá 5 vạn quân Xiêm của Nguyễn Huệ tại Rạch Gầm - Xoài Mút 1785, nổi tiếng với miệt vườn vú sữa Lò Rèn.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_BENTRE',
    location_name: 'Bến Tre',
    subtitle: 'Quê Hương Đồng Khởi & Xứ Dừa',
    name: 'Bến Tre — Quê Hương Đồng Khởi & Xứ Dừa',
    province_name: 'Bến Tre',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 62, y: 98 },
    is_active: true,
    intro_text: `Bến Tre là quê hương phong trào Đồng Khởi năm 1960 lãnh đạo bởi Nữ tướng Nguyễn Thị Định, nổi tiếng là thủ phủ dừa của Việt Nam.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_DONGTHAP',
    location_name: 'Đồng Tháp',
    subtitle: 'Đất Sen Hồng & Khu Di Tích Xẻo Quýt',
    name: 'Đồng Tháp — Đất Sen Hồng & Khu Di Tích Xẻo Quýt',
    province_name: 'Đồng Tháp',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 32.9, y: 82.5 },
    is_active: true,
    intro_text: `Đồng Tháp nổi tiếng với Tháp Mười đẹp nhất bông sen, Khu di tích Cụ Phó bảng Nguyễn Sinh Sắc và làng hoa Sa Đéc rực rỡ.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_ANGIANG',
    location_name: 'An Giang',
    subtitle: 'Thất Sơn Hùng Vĩ & Quê Hương Cụ Tôn Đức Thắng',
    name: 'An Giang — Thất Sơn Hùng Vĩ & Quê Hương Cụ Tôn Đức Thắng',
    province_name: 'An Giang',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 28.3, y: 82.8 },
    is_active: true,
    intro_text: `An Giang có vùng Bảy Núi Thất Sơn, Miếu Bà Chúa Xứ Núi Sam linh thiêng và là quê hương Chủ tịch Tôn Đức Thắng tại Cù Lao Ông Hổ.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_VINHLONG',
    location_name: 'Vĩnh Long',
    subtitle: 'Vùng Đất Địa Linh Nhân Kiệt',
    name: 'Vĩnh Long — Vùng Đất Địa Linh Nhân Kiệt',
    province_name: 'Vĩnh Long',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 35.7, y: 85.1 },
    is_active: true,
    intro_text: `Vĩnh Long nằm giữa hai dòng sông Tiền và sông Hậu, nơi sinh trưởng của nhiều danh nhân lịch sử như GS. Trần Đại Nghĩa, Thủ tướng Võ Văn Kiệt.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_TRAVINH',
    location_name: 'Trà Vinh',
    subtitle: 'Ao Bà Om & Chùa Hang Kính Bái',
    name: 'Trà Vinh — Ao Bà Om & Chùa Hang Kính Bái',
    province_name: 'Trà Vinh',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 38.5, y: 87 },
    is_active: true,
    intro_text: `Trà Vinh nổi tiếng với danh thắng Ao Bà Om huyền thoại, hơn 140 ngôi chùa Khmer kiến trúc cổ kính độc đáo.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_CANTHO',
    location_name: 'Cần Thơ',
    subtitle: 'Tây Đô Sầm Uất & Chợ Nổi Cái Răng',
    name: 'Cần Thơ — Tây Đô Sầm Uất & Chợ Nổi Cái Răng',
    province_name: 'Cần Thơ',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 31.7, y: 84.9 },
    is_active: true,
    intro_text: `Cần Thơ là trung tâm kinh tế - văn hóa của Đồng bằng sông Cửu Long, nổi tiếng với Chợ nổi Cái Răng và câu hát "Cần Thơ gạo trắng nước trong".`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_HAUGIANG',
    location_name: 'Hậu Giang',
    subtitle: 'Khởi Nghĩa Nam Kỳ & Kênh Xà No',
    name: 'Hậu Giang — Khởi Nghĩa Nam Kỳ & Kênh Xà No',
    province_name: 'Hậu Giang',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 32.5, y: 87.1 },
    is_active: true,
    intro_text: `Hậu Giang gắn liền với tuyến kênh xáng Xà No con đường lúa gạo miền Tây và Di tích Chiến thắng 7 tiểu đoàn quân ngụy năm 1973.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_KIENGIANG',
    location_name: 'Kiên Giang',
    subtitle: 'Đảo Ngọc Phú Quốc & Hà Tiên Thập Cảnh',
    name: 'Kiên Giang — Đảo Ngọc Phú Quốc & Hà Tiên Thập Cảnh',
    province_name: 'Kiên Giang',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 27.5, y: 86.8 },
    is_active: true,
    intro_text: `Kiên Giang sở hữu Đảo Ngọc Phú Quốc lớn nhất Việt Nam, danh thắng Hà Tiên thập cảnh và anh hùng Nguyễn Trung Trực.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_SOCTRANG',
    location_name: 'Sóc Trăng',
    subtitle: 'Chùa Dơi & Lễ Hội Oóc Om Bóc',
    name: 'Sóc Trăng — Chùa Dơi & Lễ Hội Oóc Om Bóc',
    province_name: 'Sóc Trăng',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 35.4, y: 89 },
    is_active: true,
    intro_text: `Sóc Trăng độc đáo với Chùa Dơi, Chùa Chén Kiểu, Lễ hội Đua ghe Ngo Oóc Om Bóc lớn bậc nhất Nam Bộ.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_BACLIEU',
    location_name: 'Bạc Liêu',
    subtitle: 'Nhà Công Tử Bạc Liêu & Nhạc Sĩ Cao Văn Lầu',
    name: 'Bạc Liêu — Nhà Công Tử Bạc Liêu & Nhạc Sĩ Cao Văn Lầu',
    province_name: 'Bạc Liêu',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 31.3, y: 90.2 },
    is_active: true,
    intro_text: `Bạc Liêu là quê hương bản Dạ Cổ Hoài Lang của Cố nhạc sĩ Cao Văn Lầu, giai thoại Công tử Bạc Liêu và đồng điện gió ven biển.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  },
  {
    id: 'LS_CAMAU',
    location_name: 'Cà Mau',
    subtitle: 'Đất Mũi Cực Nam Tổ Quốc',
    name: 'Cà Mau — Đất Mũi Cực Nam Tổ Quốc',
    province_name: 'Cà Mau',
    region: 'Đồng Bằng Sông Cửu Long',
    coordinates: { x: 26.8, y: 91.1 },
    is_active: true,
    intro_text: `Cà Mau là địa đầu Cực Nam đất liền Việt Nam với Cột mốc Tọa độ Quốc gia, Vườn quốc gia Mũi Cà Mau và rừng đước U Minh Hạ.`,
    intro_video_url: 'https://www.youtube.com/embed/l2KZ7m8oudM'
  }
];

export const INITIAL_QUESTIONS = [
  // --- ĐỒNG NAI QUESTIONS ---
  {
    id: 'q_dn_01',
    lesson_id: 'LS_DONGNAI',
    text: 'Ai là người có công khai phá và thành lập phủ Gia Định (xứ Trấn Biên - Đồng Nai) vào năm 1698?',
    question_type: 'single_choice',
    options: ['Nguyễn Hữu Cảnh', 'Thoại Ngọc Hầu', 'Nguyễn Tri Phương', 'Trương Định'],
    correct_options: ['a']
  },
  {
    id: 'q_dn_02',
    lesson_id: 'LS_DONGNAI',
    text: 'Sông nào chảy qua tỉnh Đồng Nai có trữ lượng nước ngọt lớn thứ nhì Nam Bộ?',
    question_type: 'single_choice',
    options: ['Sông Tiền', 'Sông Đồng Nai', 'Sông Sài Gòn', 'Sông Hậu'],
    correct_options: ['b']
  },
  {
    id: 'q_dn_03',
    lesson_id: 'LS_DONGNAI',
    text: 'Những di tích / địa danh lịch sử nào sau đây thuộc tỉnh Đồng Nai? (Chọn TẤT CẢ đáp án đúng)',
    question_type: 'multiple_choice',
    options: ['Căn cứ Chiến khu Đ', 'Trận tuyến Xuân Lộc', 'Đô thị cổ Hội An', 'Vườn quốc gia Nam Cát Tiên'],
    correct_options: ['a', 'b', 'd']
  },
  {
    id: 'q_dn_04',
    lesson_id: 'LS_DONGNAI',
    text: 'Loại cây công nghiệp lâu năm nào sau đây được trồng phổ biến tại Đồng Nai?',
    question_type: 'single_choice',
    options: ['Lúa nước', 'Cao su', 'Chè (Trà)', 'Vải thiều'],
    correct_options: ['b']
  },
  {
    id: 'q_dn_05',
    lesson_id: 'LS_DONGNAI',
    text: 'Chiến dịch giải phóng địa bàn nào ở Đồng Nai vào tháng 4/1975 được coi là "Cánh cửa thép" mở đường vào Sài Gòn?',
    question_type: 'single_choice',
    options: ['Trận Núi Thành', 'Chiến thắng Xuân Lộc', 'Chiến dịch Bình Giã', 'Chiến thắng Đồng Xoài'],
    correct_options: ['b']
  },
  {
    id: 'q_dn_06',
    lesson_id: 'LS_DONGNAI',
    text: 'Đặc điểm địa hình chủ yếu của tỉnh Đồng Nai là gì?',
    question_type: 'single_choice',
    options: ['Núi cao đèo dốc hiểm trở', 'Tương đối bằng phẳng, đồi bát úp lượn sóng', 'Hoàn toàn là đồng bằng ngập mặn', 'Vùng sa mạc cát'],
    correct_options: ['b']
  },
  {
    id: 'q_dn_07',
    lesson_id: 'LS_DONGNAI',
    text: 'Đồng Nai thuộc vùng kinh tế nào của Việt Nam?',
    question_type: 'single_choice',
    options: ['Đồng bằng sông Cửu Long', 'Tây Nguyên', 'Đông Nam Bộ', 'Duyên hải Nam Trung Bộ'],
    correct_options: ['c']
  },
  {
    id: 'q_dn_08',
    lesson_id: 'LS_DONGNAI',
    text: 'Vườn quốc gia nổi tiếng nào nằm trên địa bàn tỉnh Đồng Nai được UNESCO công nhận là Khu dự trữ sinh quyển thế giới?',
    question_type: 'single_choice',
    options: ['Cúc Phương', 'Nam Cát Tiên', 'U Minh Hạ', 'Ba Bể'],
    correct_options: ['b']
  },
  {
    id: 'q_dn_09',
    lesson_id: 'LS_DONGNAI',
    text: 'Thành phố nào là trung tâm hành chính - kinh tế lớn nhất của tỉnh Đồng Nai?',
    question_type: 'single_choice',
    options: ['Thành phố Biên Hòa', 'Thành phố Long Khánh', 'Huyện Nhơn Trạch', 'Thành phố Thủ Dầu Một'],
    correct_options: ['a']
  },
  {
    id: 'q_dn_10',
    lesson_id: 'LS_DONGNAI',
    text: 'Đặc điểm kinh tế nổi bật của tỉnh Đồng Nai hiện nay là gì? (Chọn TẤT CẢ đáp án đúng)',
    question_type: 'multiple_choice',
    options: ['Một trong những trung tâm công nghiệp lớn của cả nước', 'Nơi phát triển mạnh cây công nghiệp xuất khẩu', 'Trung tâm khai thác băng tuyết', 'Đầu mối giao thông trọng điểm phía Nam'],
    correct_options: ['a', 'b', 'd']
  },

  // --- ĐIỆN BIÊN QUESTIONS ---
  {
    id: 'q_db_01',
    lesson_id: 'LS_DIENBIEN',
    text: 'Chiến thắng Điện Biên Phủ lịch sử diễn ra vào năm nào?',
    question_type: 'single_choice',
    options: ['1945', '1954', '1968', '1975'],
    correct_options: ['b']
  },
  {
    id: 'q_db_02',
    lesson_id: 'LS_DIENBIEN',
    text: 'Ai là Tổng tư lệnh chỉ huy Chiến dịch Điện Biên Phủ năm 1954?',
    question_type: 'single_choice',
    options: ['Chủ tịch Hồ Chí Minh', 'Đại tướng Võ Nguyên Giáp', 'Đại tướng Văn Tiến Dũng', 'Đồng chí Trường Chinh'],
    correct_options: ['b']
  },
  {
    id: 'q_db_03',
    lesson_id: 'LS_DIENBIEN',
    text: 'Thung lũng cánh đồng nổi tiếng nào lớn nhất vùng Tây Bắc nằm ở tỉnh Điện Biên?',
    question_type: 'single_choice',
    options: ['Mường Thanh', 'Mường Lò', 'Mường Than', 'Mường Tấc'],
    correct_options: ['a']
  },
  {
    id: 'q_db_04',
    lesson_id: 'LS_DIENBIEN',
    text: 'Đặc điểm nào sau đây mô tả đúng về Chiến thắng Điện Biên Phủ 1954? (Chọn TẤT CẢ đáp án đúng)',
    question_type: 'multiple_choice',
    options: ['Diễn ra suốt 56 ngày đêm', 'Đập tan tập đoàn căn cứ điểm của thực dân Pháp', 'Buộc Pháp ký Hiệp định Giơ-ne-vơ năm 1954', 'Giải phóng hoàn toàn miền Nam'],
    correct_options: ['a', 'b', 'c']
  },
  {
    id: 'q_db_05',
    lesson_id: 'LS_DIENBIEN',
    text: 'Dòng sông nào chảy qua thung lũng bồi đắp phù sa cho cánh đồng Mường Thanh?',
    question_type: 'single_choice',
    options: ['Sông Nam Rốm', 'Sông Đà', 'Sông Mã', 'Sông Chảy'],
    correct_options: ['a']
  },
  {
    id: 'q_db_06',
    lesson_id: 'LS_DIENBIEN',
    text: 'Phương châm tác chiến chiến lược đúng đắn của Đại tướng Võ Nguyên Giáp tại Điện Biên Phủ là gì?',
    question_type: 'single_choice',
    options: ['"Đánh nhanh, thắng nhanh"', '"Đánh chắc, tiến chắc"', '"Đánh điểm, diệt viện"', '"Thâm nhập diện rộng"'],
    correct_options: ['b']
  },
  {
    id: 'q_db_07',
    lesson_id: 'LS_DIENBIEN',
    text: 'Ngọn đồi lịch sử nào tại Điện Biên Phủ diễn ra trận đánh giằng co ác liệt nhất giữa ta và địch?',
    question_type: 'single_choice',
    options: ['Đồi A1', 'Đồi C1', 'Đồi D1', 'Đồi E1'],
    correct_options: ['a']
  },
  {
    id: 'q_db_08',
    lesson_id: 'LS_DIENBIEN',
    text: 'Con đèo hiểm trở nổi tiếng nào nằm trên tuyến đường huyết mạch vận chuyển lương thực vào Điện Biên?',
    question_type: 'single_choice',
    options: ['Đèo Pha Đin', 'Đèo Mã Pí Lèng', 'Đèo Khau Phạ', 'Đèo Ô Quy Hồ'],
    correct_options: ['a']
  },
  {
    id: 'q_db_09',
    lesson_id: 'LS_DIENBIEN',
    text: 'Tướng Pháp nào chỉ huy tập đoàn căn cứ điểm Điện Biên Phủ bị bắt sống ngày 7/5/1954?',
    question_type: 'single_choice',
    options: ['Tướng De Castries (Đờ Cát-tơ-ri)', 'Tướng Navarre (Na-va)', 'Tướng Salan (Sa-lăng)', 'Tướng De Lattre'],
    correct_options: ['a']
  },
  {
    id: 'q_db_10',
    lesson_id: 'LS_DIENBIEN',
    text: 'Tỉnh Điện Biên thuộc vùng địa lý tự nhiên nào của Việt Nam?',
    question_type: 'single_choice',
    options: ['Tây Bắc', 'Đông Bắc', 'Đồng bằng sông Hồng', 'Bắc Trung Bộ'],
    correct_options: ['a']
  },

  // --- HÀ NỘI QUESTIONS ---
  {
    id: 'q_hn_01',
    lesson_id: 'LS_HANOI',
    text: 'Vua Lý Thái Tổ ban "Chiếu dời đô" chuyển kinh đô về Thăng Long (Hà Nội) vào năm nào?',
    question_type: 'single_choice',
    options: ['938', '1010', '1288', '1428'],
    correct_options: ['b']
  },
  {
    id: 'q_hn_02',
    lesson_id: 'LS_HANOI',
    text: 'Trường Đại học đầu tiên của Việt Nam nằm tại Hà Nội có tên là gì?',
    question_type: 'single_choice',
    options: ['Văn Miếu - Quốc Tử Giám', 'Trường Đông Kinh Nghĩa Thục', 'Học viện Quốc Gia', 'Trường Thi Hà Nội'],
    correct_options: ['a']
  },
  {
    id: 'q_hn_03',
    lesson_id: 'LS_HANOI',
    text: 'Tên gọi lịch sử nào được đặt cho Hà Nội sau sự kiện Vua Lý Thái Tổ dời đô năm 1010?',
    question_type: 'single_choice',
    options: ['Thăng Long', 'Đại La', 'Đông Đô', 'Tây Đô'],
    correct_options: ['a']
  },
  {
    id: 'q_hn_04',
    lesson_id: 'LS_HANOI',
    text: 'Dòng sông lớn nhất chảy qua lòng Thủ đô Hà Nội mang phù sa bồi đắp đồng bằng Bắc Bộ là gì?',
    question_type: 'single_choice',
    options: ['Sông Hồng', 'Sông Đáy', 'Sông Đuống', 'Sông Cầu'],
    correct_options: ['a']
  },
  {
    id: 'q_hn_05',
    lesson_id: 'LS_HANOI',
    text: 'Chiến công lừng lẫy 12 ngày đêm đánh bại máy bay B-52 Mỹ trên bầu trời Hà Nội năm 1972 có tên gọi là gì?',
    question_type: 'single_choice',
    options: ['"Điện Biên Phủ trên không"', 'Chiến dịch Hồ Chí Minh', 'Chiến thắng Đường 9 - Nam Lào', 'Trận Núi Thành'],
    correct_options: ['a']
  },
  {
    id: 'q_hn_06',
    lesson_id: 'LS_HANOI',
    text: 'Di tích lịch sử văn hóa nổi tiếng nào gắn liền với truyền thuyết Vua Lê Lợi trả gươm thần cho Rùa Vàng?',
    question_type: 'single_choice',
    options: ['Hồ Hoàn Kiếm (Hồ Gươm)', 'Hồ Tây', 'Chùa Một Cột', 'Cột cờ Hà Nội'],
    correct_options: ['a']
  },
  {
    id: 'q_hn_07',
    lesson_id: 'LS_HANOI',
    text: 'Vị vua nào có công lớn ban "Chiếu dời đô" khai sinh ra kinh đô Thăng Long ngàn năm văn hiến?',
    question_type: 'single_choice',
    options: ['Vua Lý Thái Tổ', 'Vua Trần Nhân Tông', 'Vua Lê Thái Tổ', 'Vua Quang Trung'],
    correct_options: ['a']
  },
  {
    id: 'q_hn_08',
    lesson_id: 'LS_HANOI',
    text: 'Làng nghề truyền thống gốm sứ nổi tiếng hàng trăm năm nằm ven sông Hồng ở Hà Nội tên là gì?',
    question_type: 'single_choice',
    options: ['Làng gốm Bát Tràng', 'Làng lụa Vạn Phúc', 'Làng đúc đồng Ngũ Xá', 'Làng mây tre Phú Vinh'],
    correct_options: ['a']
  },
  {
    id: 'q_hn_09',
    lesson_id: 'LS_HANOI',
    text: 'Đặc điểm khí hậu đặc trưng của Thủ đô Hà Nội là gì?',
    question_type: 'single_choice',
    options: ['Nhiệt đới gió mùa có 4 mùa rõ rệt', 'Nhiệt đới xích đạo có 2 mùa mưa nắng', 'Ôn đới quanh năm tuyết rơi', 'Khí hậu sa mạc khô hạn'],
    correct_options: ['a']
  },
  {
    id: 'q_hn_10',
    lesson_id: 'LS_HANOI',
    text: 'Các di tích lịch sử - văn hóa tiêu biểu nào sau đây thuộc Thủ đô Hà Nội? (Chọn TẤT CẢ đáp án đúng)',
    question_type: 'multiple_choice',
    options: ['Hoàng thành Thăng Long', 'Văn Miếu - Quốc Tử Giám', 'Cột cờ Hà Nội', 'Cố đô Huế'],
    correct_options: ['a', 'b', 'c']
  },

  // --- QUẢNG NAM QUESTIONS ---
  {
    id: 'q_qn_01',
    lesson_id: 'LS_QUANGNAM',
    text: 'Hai di sản văn hóa thế giới nào được UNESCO công nhận nằm ở tỉnh Quảng Nam? (Chọn TẤT CẢ đáp án đúng)',
    question_type: 'multiple_choice',
    options: ['Đô thị cổ Hội An', 'Thánh địa Mỹ Sơn', 'Cố đô Huế', 'Phong Nha Kẻ Bàng'],
    correct_options: ['a', 'b']
  },
  {
    id: 'q_qn_02',
    lesson_id: 'LS_QUANGNAM',
    text: 'Thương cảng quốc tế sầm uất bậc nhất Đông Nam Á từ thế kỷ XVI - XVII nằm ở Quảng Nam là gì?',
    question_type: 'single_choice',
    options: ['Đô thị cổ Hội An', 'Thương cảng Vân Đồn', 'Cảng Thị Nại', 'Cảng Ba Ngòi'],
    correct_options: ['a']
  },
  {
    id: 'q_qn_03',
    lesson_id: 'LS_QUANGNAM',
    text: 'Quảng Nam được phong tặng danh hiệu 8 chữ vàng nào trong kháng chiến chống Mỹ cứu nước?',
    question_type: 'single_choice',
    options: ['"Trung dũng kiên cường, đi đầu diệt Mỹ"', '"Anh dũng bất khuất, kiên trung thắng địch"', '"Đi đầu kháng chiến, lập công xuất sắc"', '"Vượt mọi khó khăn, hoàn thành nhiệm vụ"'],
    correct_options: ['a']
  },
  {
    id: 'q_qn_04',
    lesson_id: 'LS_QUANGNAM',
    text: 'Quần đảo nổi tiếng bảo tồn hệ sinh thái biển quý hiếm được công nhận là Khu dự trữ sinh quyển thế giới ở Quảng Nam?',
    question_type: 'single_choice',
    options: ['Cù Lao Chàm', 'Đảo Lý Sơn', 'Côn Đảo', 'Phú Quốc'],
    correct_options: ['a']
  },
  {
    id: 'q_qn_05',
    lesson_id: 'LS_QUANGNAM',
    text: 'Trận thắng đầu tiên tiêu diệt quân viễn chinh Mỹ năm 1965 diễn ra tại địa danh nào ở Quảng Nam?',
    question_type: 'single_choice',
    options: ['Núi Thành', 'Vạn Tường', 'Ấp Bắc', 'Bình Giã'],
    correct_options: ['a']
  },
  {
    id: 'q_qn_06',
    lesson_id: 'LS_QUANGNAM',
    text: 'Loại thảo dược dược liệu vô cùng quý hiếm được ví là "quốc bảo" trồng trên dãy núi cao ở Quảng Nam?',
    question_type: 'single_choice',
    options: ['Sâm Ngọc Linh', 'Nấm Linh Chi', 'Đông Trùng Hạ Thảo', 'Tam Thất'],
    correct_options: ['a']
  },
  {
    id: 'q_qn_07',
    lesson_id: 'LS_QUANGNAM',
    text: 'Thánh địa Mỹ Sơn ở Quảng Nam là quần thể kiến trúc di tích đặc sắc của nền văn hóa nào?',
    question_type: 'single_choice',
    options: ['Văn hóa Chăm-pa', 'Văn hóa Óc Eo', 'Văn hóa Đông Sơn', 'Văn hóa Sa Huỳnh'],
    correct_options: ['a']
  },
  {
    id: 'q_qn_08',
    lesson_id: 'LS_QUANGNAM',
    text: 'Dòng sông chính chảy qua lòng đô thị cổ Hội An đổ ra biển Cửa Đại là sông nào?',
    question_type: 'single_choice',
    options: ['Sông Thu Bồn', 'Sông Hương', 'Sông Hàn', 'Sông Gianh'],
    correct_options: ['a']
  },
  {
    id: 'q_qn_09',
    lesson_id: 'LS_QUANGNAM',
    text: 'Đặc điểm địa hình tự nhiên tiêu biểu của tỉnh Quảng Nam là gì?',
    question_type: 'single_choice',
    options: ['Nghiêng từ tây sang đông, từ núi Trường Sơn xuống đồng bằng ven biển', 'Đồng bằng phù sa ngập nước quanh năm', 'Vùng cao nguyên đá vôi', 'Vùng sa mạc cát khô nóng'],
    correct_options: ['a']
  },
  {
    id: 'q_qn_10',
    lesson_id: 'LS_QUANGNAM',
    text: 'Các đặc sản / làng nghề nổi tiếng tại Quảng Nam bao gồm? (Chọn TẤT CẢ đáp án đúng)',
    question_type: 'multiple_choice',
    options: ['Mì Quảng, Cao lầu', 'Làng mộc Kim Bồng', 'Làng gốm Thanh Hà', 'Bánh cốm Làng Vòng'],
    correct_options: ['a', 'b', 'c']
  }
];

export const INITIAL_ASSIGNMENTS = [
  { id: 'as_dn_default', lesson_id: 'LS_DONGNAI', class_id: null, deadline: null, is_active: true },
  { id: 'as_db_default', lesson_id: 'LS_DIENBIEN', class_id: null, deadline: null, is_active: true },
  { id: 'as_hn_default', lesson_id: 'LS_HANOI', class_id: null, deadline: null, is_active: true },
  { id: 'as_qn_default', lesson_id: 'LS_QUANGNAM', class_id: null, deadline: null, is_active: true },
  { id: 'as_dn_8a1', lesson_id: 'LS_DONGNAI', class_id: 'class_8a1', deadline: '2026-09-30T23:59:59Z', is_active: true }
];

export const INITIAL_LOCKED_SCORES = [
  { student_id: 'st_hs001', lesson_id: 'LS_DONGNAI', score: 10, stamp_level: 3, updated_at: '2026-08-25T14:30:00Z' },
  { student_id: 'st_hs001', lesson_id: 'LS_DIENBIEN', score: 7, stamp_level: 2, updated_at: '2026-08-26T09:15:00Z' },
  { student_id: 'st_hs001', lesson_id: 'LS_HOABINH', score: 9, stamp_level: 3, updated_at: '2026-08-27T10:00:00Z' },
  { student_id: 'st_hs002', lesson_id: 'LS_DONGNAI', score: 6, stamp_level: 1, updated_at: '2026-08-27T16:00:00Z' }
];

export const INITIAL_STUDENT_WARDROBES = [
  { student_id: 'st_hs001', item_id: 'wi_hair_001', purchased_at: '2026-08-20T10:00:00Z' },
  { student_id: 'st_hs001', item_id: 'wi_top_001', purchased_at: '2026-08-20T10:00:00Z' },
  { student_id: 'st_hs001', item_id: 'wi_bottom_001', purchased_at: '2026-08-20T10:00:00Z' },
  { student_id: 'st_hs001', item_id: 'wi_shoes_001', purchased_at: '2026-08-20T10:00:00Z' }
];

// AI Assistant Engine for "Vừa Đi Vừa Học" - Raccoon Thám Hiểm (Gemini AI API + Rich Knowledge Engine)
import { normalizeVietnameseText } from '../utils/textUtils.js';

const SYSTEM_PROMPT = `
Bạn là "Gấu Trúc Raccoon Thám Hiểm" - Trợ lý AI thông minh, thân thiện, hào hứng của ứng dụng học tập "Vừa Đi Vừa Học" dành cho học sinh THCS tại Việt Nam.
Nhiệm vụ của bạn:
1. Giải đáp các thắc mắc về Lịch Sử và Địa Lý Việt Nam (đặc biệt là 63 tỉnh thành, các di tích lịch sử, danh lam thắng cảnh, sản vật địa phương, văn hóa dân tộc).
2. Trả lời với giọng văn vui vẻ, khuyến khích học sinh khám phá, súc tích (dưới 150 từ), dễ hiểu với lứa tuổi THCS.
3. Luôn xưng là "Raccoon" và gọi học sinh là "Nhà thám hiểm" hoặc "bạn".
4. Sử dụng icon/emoji sinh động (📜, 🗺️, ⛰️, ⭐, 🦝, ⚔️, ☕, 🐘, 🌾).
5. QUAN TRỌNG: Tuyệt đối KHÔNG lặp lại các câu chào mở đầu rập khuôn (như "Chào Nhà thám hiểm! Raccoon đây!", "Chào Nhà thám hiểm siêu cấp!") ở mỗi câu trả lời trong cùng phiên trò chuyện. Hãy đi thẳng vào nội dung giải đáp một cách tự nhiên và sinh động.
`;

export function sanitizeChatResponse(text, isFirstMessage = false) {
  if (!text) return '';
  if (!isFirstMessage) {
    let cleaned = text;
    // Strip repetitive opener sentences on follow-up turns
    cleaned = cleaned.replace(/^(Xin chào|Chào)\s+(Nhà thám hiểm|bạn)[^!\.\n]*[!\.\s]*\s*(Raccoon\s+đây[!\.]*\s*|Raccoon\s+rất\s+vui[^!\.\n]*[!\.\s]*)?/gi, '');
    cleaned = cleaned.replace(/^(Raccoon\s+đây[!\.\s]*|Raccoon\s+rất\s+vui\s+được\s+(giải\s+đáp|bật\s+mí)[!:\.\s]*)/gi, '');
    cleaned = cleaned.trim();
    if (cleaned.length > 0) {
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }
  return text.trim();
}

const PROVINCE_REGION_MAP = [
  // TÂY NGUYÊN
  {
    names: ["dak lak", "dac lac", "buon ma thuot", "buon don"],
    province: "Đắk Lắk (Đắc Lắc)",
    region: "Tây Nguyên",
    macroRegion: "Miền Trung / Tây Nguyên",
    details: "Đắk Lắk nằm ở trung tâm vùng Tây Nguyên ⛰️. Đắk Lắk được mệnh danh là 'Thủ phủ Cà phê của Việt Nam' với thương hiệu cà phê Buôn Ma Thuột nổi tiếng thế giới ☕, sở hữu Không gian văn hóa Cồng chiêng Tây Nguyên, Hội đua voi Buôn Đôn, Hồ Lắk và Thác Dray Nur hùng vĩ 🐘!"
  },
  {
    names: ["gia lai", "pleiku", "bien ho"],
    province: "Gia Lai",
    region: "Tây Nguyên",
    macroRegion: "Miền Trung / Tây Nguyên",
    details: "Gia Lai thuộc vùng Tây Nguyên. Nơi đây nổi tiếng với Biển Hồ Tơ Nưng (Đôi mắt Pleiku) 🌊, Núi lửa Chư Đăng Ya và cà phê Tây Nguyên ☕."
  },
  {
    names: ["lam dong", "da lat", "langbiang"],
    province: "Lâm Đồng",
    region: "Tây Nguyên",
    macroRegion: "Miền Trung / Tây Nguyên",
    details: "Lâm Đồng thuộc vùng Tây Nguyên, sở hữu thành phố ngàn hoa Đà Lạt, đỉnh Langbiang hùng vĩ và cao nguyên Di Linh thơ mộng 🏔️🌸."
  },
  {
    names: ["kon tum", "mang den"],
    province: "Kon Tum",
    region: "Tây Nguyên",
    macroRegion: "Miền Trung / Tây Nguyên",
    details: "Kon Tum thuộc vùng Tây Nguyên, nổi tiếng với khu du lịch sinh thái Măng Đen, Nhà thờ Gỗ cổ kính và Sâm Ngọc Linh quý hiếm 🌿."
  },
  {
    names: ["dak nong", "dac nong", "gia nghia"],
    province: "Đắk Nông (Đắc Nông)",
    region: "Tây Nguyên",
    macroRegion: "Miền Trung / Tây Nguyên",
    details: "Đắk Nông thuộc vùng Tây Nguyên, nổi tiếng với Công viên địa chất toàn cầu UNESCO Đắk Nông và hệ thống hang động núi lửa Krông Nô 🌋."
  },

  // TÂY BẮC BỘ
  {
    names: ["dien bien", "muong thanh"],
    province: "Điện Biên",
    region: "Tây Bắc Bộ",
    macroRegion: "Miền Bắc",
    details: "Điện Biên thuộc vùng Tây Bắc Bộ (Miền Bắc). Nơi đây gắn liền với Chiến dịch Điện Biên Phủ 1954 lừng lẫy năm châu ⚔️ và thung lũng Mường Thanh trù phú 🌾."
  },
  {
    names: ["lai chau", "o quy ho"],
    province: "Lai Châu",
    region: "Tây Bắc Bộ",
    macroRegion: "Miền Bắc",
    details: "Lai Châu thuộc vùng Tây Bắc Bộ (Miền Bắc), nằm ở đầu nguồn Sông Đà hùng vĩ với đèo Ô Quy Hồ nức tiếng 🏔️."
  },
  {
    names: ["son la", "moc chau"],
    province: "Sơn La",
    region: "Tây Bắc Bộ",
    macroRegion: "Miền Bắc",
    details: "Sơn La thuộc vùng Tây Bắc Bộ (Miền Bắc), nổi tiếng với Cao nguyên Mộc Châu 🥛, nhà máy thủy điện Sơn La và di tích Nhà tù Sơn La ⚡."
  },
  {
    names: ["hoa binh"],
    province: "Hòa Bình",
    region: "Tây Bắc Bộ",
    macroRegion: "Miền Bắc",
    details: "Hòa Bình thuộc vùng Tây Bắc Bộ (Miền Bắc), là cái nôi của Văn hóa Hòa Bình thời đồ đá và Thủy điện Hòa Bình trên sông Đà 🌊."
  },
  {
    names: ["lao cai", "sa pa", "sapa", "fansipan"],
    province: "Lào Cai",
    region: "Tây Bắc Bộ",
    macroRegion: "Miền Bắc",
    details: "Lào Cai thuộc vùng Tây Bắc Bộ (Miền Bắc), sở hữu đỉnh Fansipan - Nóc nhà Đông Dương 🏔️ và thị trấn sương mờ Sa Pa 🌫️."
  },
  {
    names: ["yen bai", "mu cang chai"],
    province: "Yên Bái",
    region: "Tây Bắc Bộ",
    macroRegion: "Miền Bắc",
    details: "Yên Bái thuộc vùng Tây Bắc Bộ (Miền Bắc), lừng danh với ruộng bậc thang Mù Cang Chải rực rỡ sắc vàng mùa lúa chín 🌾."
  },

  // ĐÔNG BẮC BỘ
  {
    names: ["thai nguyen", "atk", "dinh hoa"],
    province: "Thái Nguyên",
    region: "Đông Bắc Bộ",
    macroRegion: "Miền Bắc",
    details: "Thái Nguyên thuộc vùng Đông Bắc Bộ (Miền Bắc). Nơi đây là Thủ đô gió ngàn ATK Định Hóa và 'Đệ nhất danh trà' Chè Tân Cương 🍵."
  },
  {
    names: ["quang ninh", "ha long"],
    province: "Quảng Ninh",
    region: "Đông Bắc Bộ",
    macroRegion: "Miền Bắc",
    details: "Quảng Ninh thuộc vùng Đông Bắc Bộ (Miền Bắc), sở hữu Vịnh Hạ Long - Di sản Thiên nhiên Thế giới 🚢 và Chả mực Hạ Long trứ danh 🦑."
  },
  {
    names: ["ha giang", "dong van", "lung cu"],
    province: "Hà Giang",
    region: "Đông Bắc Bộ",
    macroRegion: "Miền Bắc",
    details: "Hà Giang thuộc vùng Đông Bắc Bộ (Miền Bắc), nổi tiếng với Cột cờ Lũng Cú, Cao nguyên đá Đồng Văn và mùa hoa tam giác mạch 🌸."
  },
  {
    names: ["cao bang", "pac bo", "ban gioc"],
    province: "Cao Bằng",
    region: "Đông Bắc Bộ",
    macroRegion: "Miền Bắc",
    details: "Cao Bằng thuộc vùng Đông Bắc Bộ (Miền Bắc), có di tích Pác Bó nơi Bác Hồ về nước năm 1941 và Thác Bản Giốc 🌊."
  },
  {
    names: ["lang son", "mau son", "dong dang"],
    province: "Lạng Sơn",
    region: "Đông Bắc Bộ",
    macroRegion: "Miền Bắc",
    details: "Lạng Sơn thuộc vùng Đông Bắc Bộ (Miền Bắc), gắn liền với Ải Chi Lăng và đỉnh Mẫu Sơn 🏔️."
  },

  // ĐỒNG BẰNG SÔNG HỒNG
  {
    names: ["ha noi", "thang long", "hoan kiem"],
    province: "Hà Nội",
    region: "Đồng bằng Sông Hồng",
    macroRegion: "Miền Bắc",
    details: "Hà Nội là Thủ đô ngàn năm văn hiến thuộc vùng Đồng bằng Sông Hồng (Miền Bắc) 🏛️, với 36 phố phường, Hồ Hoàn Kiếm, Văn Miếu Quốc Tử Giám."
  },
  {
    names: ["hai phong", "cat ba"],
    province: "Hải Phòng",
    region: "Đồng bằng Sông Hồng",
    macroRegion: "Miền Bắc",
    details: "Hải Phòng là Thành phố Hoa phượng đỏ thuộc vùng Đồng bằng Sông Hồng (Miền Bắc) ⚓, nổi tiếng với đảo Cát Bà và bánh đa cua."
  },
  {
    names: ["ninh binh", "trang an", "bai dinh"],
    province: "Ninh Bình",
    region: "Đồng bằng Sông Hồng",
    macroRegion: "Miền Bắc",
    details: "Ninh Bình thuộc vùng Đồng bằng Sông Hồng (Miền Bắc), có Cố đô Hoa Lư và Quần thể danh thắng Tràng An - Di sản Kép thế giới 🚣‍♂️."
  },

  // BẮC TRUNG BỘ
  {
    names: ["thua thien hue", "hue", "song huong"],
    province: "Thừa Thiên Huế",
    region: "Bắc Trung Bộ",
    macroRegion: "Miền Trung",
    details: "Thừa Thiên Huế thuộc vùng Bắc Trung Bộ (Miền Trung), là Cố đô lịch sử với Quần thể di tích Cố đô Huế và Sông Hương 🏰."
  },
  {
    names: ["nghe an", "nam dan", "lang sen"],
    province: "Nghệ An",
    region: "Bắc Trung Bộ",
    macroRegion: "Miền Trung",
    details: "Nghệ An thuộc vùng Bắc Trung Bộ (Miền Trung), là quê hương Bác Hồ kính yêu (Làng Sen, Nam Đàn) 📜."
  },
  {
    names: ["quang binh", "phong nha", "son doong"],
    province: "Quảng Bình",
    region: "Bắc Trung Bộ",
    macroRegion: "Miền Trung",
    details: "Quảng Bình thuộc vùng Bắc Trung Bộ (Miền Trung), được mệnh danh là 'Vương quốc hang động' với Vườn quốc gia Phong Nha - Kẻ Bàng và Hang Sơn Đoòng 🦇."
  },

  // NAM TRUNG BỘ
  {
    names: ["da nang", "ba na", "cau vang"],
    province: "Đà Nẵng",
    region: "Nam Trung Bộ",
    macroRegion: "Miền Trung",
    details: "Đà Nẵng thuộc vùng Nam Trung Bộ (Miền Trung), nổi tiếng với Cầu Vàng Bàn Tay, Ngũ Hành Sơn và Biển Mỹ Khê 🌊."
  },
  {
    names: ["quang nam", "hoi an", "my son"],
    province: "Quảng Nam",
    region: "Nam Trung Bộ",
    macroRegion: "Miền Trung",
    details: "Quảng Nam thuộc vùng Nam Trung Bộ (Miền Trung), sở hữu Phố cổ Hội An 🏮 và Thánh địa Mỹ Sơn 🏛️."
  },
  {
    names: ["khanh hoa", "nha trang"],
    province: "Khánh Hòa",
    region: "Nam Trung Bộ",
    macroRegion: "Miền Trung",
    details: "Khánh Hòa thuộc vùng Nam Trung Bộ (Miền Trung), nổi tiếng với Thành phố biển Nha Trang và Yến sào Khánh Hòa 🪺."
  },
  {
    names: ["binh thuan", "phan thiet", "mui ne"],
    province: "Bình Thuận",
    region: "Nam Trung Bộ",
    macroRegion: "Miền Trung",
    details: "Bình Thuận thuộc vùng Nam Trung Bộ (Miền Trung), nổi tiếng với Đồi cát Mũi Né Phan Thiết 🏜️ và trái Thanh long ngọt mát 🌵."
  },

  // ĐỒNG NAM BỘ
  {
    names: ["ho chi minh", "sai gon", "dinh doc lap"],
    province: "TP. Hồ Chí Minh (Sài Gòn)",
    region: "Đông Nam Bộ",
    macroRegion: "Miền Nam",
    details: "TP. Hồ Chí Minh thuộc vùng Đông Nam Bộ (Miền Nam) 🏢, là trung tâm kinh tế - văn hóa lớn nhất nước với Bến Nhà Rồng, Dinh Độc Lập."
  },
  {
    names: ["ba ria vung tau", "vung tau", "con dao"],
    province: "Bà Rịa - Vũng Tàu",
    region: "Đông Nam Bộ",
    macroRegion: "Miền Nam",
    details: "Bà Rịa - Vũng Tàu thuộc vùng Đông Nam Bộ (Miền Nam), nổi tiếng với Thành phố biển Vũng Tàu và Quần đảo Côn Đảo 🏖️."
  },

  // ĐỒNG BẰNG SÔNG CỬU LONG
  {
    names: ["ben tre", "dong khoi"],
    province: "Bến Tre",
    region: "Đồng bằng Sông Cửu Long",
    macroRegion: "Miền Nam (Tây Nam Bộ)",
    details: "Bến Tre thuộc vùng Đồng bằng Sông Cửu Long (Miền Nam / Tây Nam Bộ) 🥥, là Xứ Dừa Việt Nam gắn liền với Phong trào Đồng Khởi."
  },
  {
    names: ["ca mau", "dat mui", "u minh"],
    province: "Cà Mau",
    region: "Đồng bằng Sông Cửu Long",
    macroRegion: "Miền Nam (Tây Nam Bộ)",
    details: "Cà Mau thuộc vùng Đồng bằng Sông Cửu Long (Miền Nam / Tây Nam Bộ) 🦀, là điểm cực Nam của Tổ quốc với Mũi Cà Mau và Rừng U Minh Hạ."
  },
  {
    names: ["can tho", "ninh kieu", "cai rang"],
    province: "Cần Thơ",
    region: "Đồng bằng Sông Cửu Long",
    macroRegion: "Miền Nam (Tây Nam Bộ)",
    details: "Cần Thơ thuộc vùng Đồng bằng Sông Cửu Long (Miền Nam / Tây Nam Bộ) 🚣‍♂️, là Tây Đô sông nước với Bến Ninh Kiều và Chợ nổi Cái Răng."
  },
  {
    names: ["an giang", "chau doc", "nui sam"],
    province: "An Giang",
    region: "Đồng bằng Sông Cửu Long",
    macroRegion: "Miền Nam (Tây Nam Bộ)",
    details: "An Giang thuộc vùng Đồng bằng Sông Cửu Long (Miền Nam / Tây Nam Bộ), nổi tiếng với Miếu Bà Chúa Xứ Núi Sam và Rừng tràm Trà Cử 🌿."
  },
  {
    names: ["kien giang", "phu quoc"],
    province: "Kiên Giang",
    region: "Đồng bằng Sông Cửu Long",
    macroRegion: "Miền Nam (Tây Nam Bộ)",
    details: "Kiên Giang thuộc vùng Đồng bằng Sông Cửu Long (Miền Nam / Tây Nam Bộ), sở hữu Đảo Ngọc Phú Quốc 🏝️."
  }
];

// TOPIC & RESOURCE KNOWLEDGE MAP (Khoáng sản, Nông sản, Địa lý, Lịch sử Việt Nam)
const TOPIC_KNOWLEDGE_MAP = [
  {
    keywords: ["than da", "khoang san than", "mo than", "vung than"],
    title: "Than đá (Khoáng sản)",
    answer: "Than đá là tài nguyên khoáng sản nổi tiếng nhất của tỉnh **Quảng Ninh** (vùng Đông Bắc Bộ) ⛏️🪨. Quảng Ninh sở hữu trữ lượng than đá lớn nhất Việt Nam (chiếm trên 90% trữ lượng cả nước) với các mỏ than nổi tiếng như Cẩm Phả, Hòn Gai, Uông Bí!"
  },
  {
    keywords: ["dau khi", "dau mo", "khi dot", "gian khoan"],
    title: "Dầu khí & Dầu mỏ",
    answer: "Dầu mỏ và khí đốt là tài nguyên khoáng sản năng lượng quan trọng tập trung ở thềm lục địa phía Nam, gắn liền với tỉnh **Bà Rịa - Vũng Tàu** ⛽🛢️ với các mỏ dầu Bạch Hổ, Rồng, Đại Hùng!"
  },
  {
    keywords: ["bo xit", "bauxite", "quang nhom"],
    title: "Quặng Bô-xít (Bauxite)",
    answer: "Quặng Bô-xít (dùng để sản xuất nhôm) tập trung nhiều nhất ở vùng **Tây Nguyên**, đặc biệt là tỉnh **Đắk Nông** và **Lâm Đồng** ⛰️⛏️ với trữ lượng thuộc hàng lớn nhất thế giới!"
  },
  {
    keywords: ["ca phe", "thu phu ca phe"],
    title: "Cà phê",
    answer: "Cà phê là nông sản chủ lực của vùng **Tây Nguyên**, trong đó tỉnh **Đắk Lắk** (Buôn Ma Thuột) được mệnh danh là 'Thủ phủ Cà phê của Việt Nam' ☕ rực rỡ!"
  },
  {
    keywords: ["vua lua", "lua nuoc", "lua gao"],
    title: "Vựa lúa Việt Nam",
    answer: "Việt Nam có 2 vựa lúa lớn nhất là **Đồng bằng sông Cửu Long** (vựa lúa lớn nhất cả nước 🌾) và **Đồng bằng sông Hồng**!"
  },
  {
    keywords: ["thuy dien", "nha may thuy dien"],
    title: "Thủy điện",
    answer: "Các nhà máy thủy điện lớn nhất Việt Nam nằm ở miền Bắc trên Sông Đà, bao gồm **Thủy điện Sơn La** (lớn nhất Đông Nam Á ⚡) và **Thủy điện Hòa Bình**!"
  },
  {
    keywords: ["che", "tra", "de nhat danh tra"],
    title: "Chè (Trà)",
    answer: "Tỉnh **Thái Nguyên** nổi tiếng với thương hiệu 'Đệ nhất danh trà' Chè Tân Cương 🍵, và vùng đất **Lâm Đồng** (Bảo Lộc) cũng là thủ phủ trà miền Nam!"
  },
  {
    keywords: ["hang dong", "phong nha", "son doong"],
    title: "Vương quốc hang động",
    answer: "**Quảng Bình** (vùng Bắc Trung Bộ) được mệnh danh là 'Vương quốc hang động' với Hang Sơn Đoòng (hang động tự nhiên lớn nhất thế giới 🦇) và Vườn quốc gia Phong Nha - Kẻ Bàng!"
  },
  {
    keywords: ["thanh long", "thu phu thanh long"],
    title: "Thanh Long",
    answer: "**Bình Thuận** (vùng Nam Trung Bộ) được mệnh danh là 'Thủ phủ Thanh Long' của Việt Nam 🌵🔴 với những cánh đồng thanh long bạt ngàn nổi tiếng khắp cả nước và xuất khẩu thế giới!"
  },
  {
    keywords: ["vai thieu", "vai thanh ha"],
    title: "Vải thiều",
    answer: "Vải thiều nổi tiếng nhất thuộc về tỉnh **Bắc Giang** (Lục Ngạn 🔴) và **Hải Dương** (Thanh Hà) với hương vị ngọt thanh trứ danh!"
  },
  {
    keywords: ["nhan long", "nhan hung yen"],
    title: "Nhãn lồng",
    answer: "Nhãn lồng là quả ngọt đặc sản nức tiếng của đất **Hưng Yên** (vùng Đồng bằng Sông Hồng) 🟡!"
  },
  {
    keywords: ["sau rieng"],
    title: "Sầu riêng",
    answer: "Sầu riêng là loại trái cây đặc sản nổi tiếng được trồng nhiều ở các tỉnh **Tiền Giang** (Cái Bè), **Bến Tre** và vùng **Tây Nguyên** (Đắk Lắk) 🍈!"
  }
];

const HISTORY_MILESTONES_MAP = [
  {
    keywords: ["ly thai to", "doi do", "thang long", "chieu doi do", "1010"],
    match: (q) => (q.includes("ly thai to") || q.includes("doi do") || q.includes("chieu doi do")) && (q.includes("thang long") || q.includes("nam bao nhieu") || q.includes("nam nao") || q.includes("hoa lu")),
    answer: "Vào mùa thu năm **1010** (năm Canh Tuất), vua **Lý Thái Tổ** (Lý Công Uẩn) đã ban *Chiếu dời đô*, chuyển kinh đô nước Đại Cồ Việt từ Hoa Lư (Ninh Bình) về thành Đại La và đổi tên thành **Thăng Long** (Hà Nội ngày nay) 📜🐉!"
  },
  {
    keywords: ["ngo quyen", "bach dang", "nam han", "coc go", "938"],
    match: (q) => q.includes("ngo quyen") || (q.includes("bach dang") && (q.includes("938") || q.includes("nam han") || q.includes("nam bao nhieu") || q.includes("nam nao"))),
    answer: "Năm **938**, **Ngô Quyền** đã lãnh đạo nhân dân ta dùng kế cắm cọc gỗ vạt nhọn bịt sắt tiêu diệt quân Nam Hán trên sông Bạch Đằng, chấm dứt hơn 1.000 năm Bắc thuộc, mở ra kỷ nguyên độc lập tự chủ lâu dài cho dân tộc ⚔️🌊!"
  },
  {
    keywords: ["dien bien phu", "1954", "de castries", "vo nguyen giap"],
    match: (q) => q.includes("dien bien phu") && (q.includes("1954") || q.includes("ngay nao") || q.includes("nam nao") || q.includes("nam bao nhieu") || q.includes("tuong") || q.includes("ai chi huy")),
    answer: "Chiến dịch **Điện Biên Phủ** toàn thắng vào ngày **7/5/1954** dưới sự chỉ huy tài tình của Đại tướng Võ Nguyên Giáp. Đây là chiến thắng 'Lừng lẫy năm châu, chấn động địa cầu', đập tan tập đoàn cứ điểm của thực dân Pháp 🎖️🇻🇳!"
  },
  {
    keywords: ["30/4", "giai phong mien nam", "1975", "dinh doc lap", "ho chi minh"],
    match: (q) => (q.includes("30/4") || q.includes("giai phong mien nam") || q.includes("thong nhat dat nuoc")) && (q.includes("1975") || q.includes("nam nao") || q.includes("ngay nao") || q.includes("nam bao nhieu")),
    answer: "Vào lúc 11 giờ 30 phút ngày **30/4/1975**, lá cờ cách mạng tung bay trên nóc Dinh Độc Lập, Chiến dịch Hồ Chí Minh toàn thắng, giải phóng hoàn toàn miền Nam, thống nhất đất nước non sông thu về một mối 🇻🇳⭐!"
  },
  {
    keywords: ["quoc khanh", "2/9", "2/9/1945", "tuyen ngon doc lap", "ba dinh"],
    match: (q) => q.includes("quoc khanh") || (q.includes("2/9") && (q.includes("bac ho") || q.includes("doc lap") || q.includes("tuyen ngon"))),
    answer: "Ngày **2/9/1945**, tại Quảng trường Ba Đình lịch sử (Hà Nội), Chủ tịch Hồ Chí Minh đã đọc bản *Tuyên ngôn Độc lập*, khai sinh ra nước Việt Nam Dân chủ Cộng hòa (nay là nước CHXHCN Việt Nam) 📜🇻🇳!"
  },
  {
    keywords: ["hai ba trung", "me linh", "nam 40"],
    match: (q) => q.includes("hai ba trung"),
    answer: "Vào mùa xuân năm **40** sau Công nguyên, **Hai Bà Trưng** (Trưng Trắc và Trưng Nhị) đã phất cờ khởi nghĩa tại Hát Môn (Mê Linh), đánh đuổi thái thú Tô Định, giành lại độc lập tự chủ cho đất nước 🐘⚔️!"
  },
  {
    keywords: ["tran hung dao", "tran quoc tuan", "nguyen mong"],
    match: (q) => q.includes("tran hung dao") || q.includes("tran quoc tuan"),
    answer: "Quốc công Tiết chế **Trần Hưng Đạo** (Trần Quốc Tuấn) là vị tướng kiệt xuất đã lãnh đạo quân dân nhà Trần 3 lần đại thắng giặc Nguyên Mông xâm lược (1258, 1285, 1288) vang dội sử sách ⚔️🛡️!"
  },
  {
    keywords: ["quang trung", "nguyen hue", "ngoc hoi", "dong da", "1789"],
    match: (q) => q.includes("quang trung") || q.includes("nguyen hue") || q.includes("ngoc hoi dong da"),
    answer: "Vào mùa xuân Kỷ Dậu năm **1789**, người anh hùng áo vải cờ đào **Quang Trung (Nguyễn Huệ)** đã thần tốc hành quân, đại phá 29 vạn quân Mãn Thanh trong trận Ngọc Hồi - Đống Đa oanh liệt 🦅⚡!"
  },
  {
    keywords: ["vua hung", "gio to", "den hung", "van lang"],
    match: (q) => q.includes("vua hung") || q.includes("gio to") || q.includes("den hung") || q.includes("van lang"),
    answer: "Các **Vua Hùng** là những người có công dựng nên nhà nước **Văn Lang** - nhà nước đầu tiên của dân tộc ta đóng đô tại Phong Châu (Phú Thọ). Hằng năm vào ngày mùng **10 tháng 3 Âm lịch**, cả nước long trọng tổ chức Giỗ Tổ Hùng Vương 📜🏛️!"
  }
];

const DEFAULT_GEMINI_KEY = 'AQ.Ab8RN6Jy6z-TgQsv3zEuFq8N23Lqwzu8PMqFJ3v664Leu5W5Iw';

export async function askRaccoonAI(userQuestion, apiKey = '', isFirstMessage = false, lessons = []) {
  if (!userQuestion || !userQuestion.trim()) return '';

  const normalizedQ = normalizeVietnameseText(userQuestion);

  // Helper to process response
  const formatResponse = (rawText) => sanitizeChatResponse(rawText, isFirstMessage);

  // 1. Try Gemini REST API with Empirically Verified Working Models
  const effectiveKey = apiKey || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') || DEFAULT_GEMINI_KEY;
  if (effectiveKey) {
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash-latest',
      'gemma-4-26b-a4b-it'
    ];

    const turnInstruction = isFirstMessage 
      ? '' 
      : '\n(Lưu ý: Đây là câu trả lời nối tiếp trong trò chuyện. KHÔNG lặp lại các câu chào mở đầu rập khuôn như "Chào Nhà thám hiểm! Raccoon đây!". Hãy trả lời trực tiếp vào câu hỏi).';

    for (const modelName of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${effectiveKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${SYSTEM_PROMPT}${turnInstruction}\n\nHọc sinh hỏi: "${userQuestion}"\n\nHãy trả lời Raccoon ngắn gọn, chính xác, kèm icon sinh động:` }
                ]
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return formatResponse(text);
        } else {
          const errBody = await response.json().catch(() => ({}));
          console.warn(`Gemini API ${modelName} returned status ${response.status}:`, errBody);
        }
      } catch (err) {
        console.warn(`Gemini API ${modelName} call warning:`, err);
      }
    }
  }

  // 2. CHECK HISTORY MILESTONES SPECIFIC INTENT MATCH (E.g. "Vua Lý Thái Tổ dời đô...")
  for (let item of HISTORY_MILESTONES_MAP) {
    if (item.match && item.match(normalizedQ)) {
      return formatResponse(item.answer);
    }
  }

  // 3. CHECK TOPIC & RESOURCE KNOWLEDGE (E.g., "than đá", "dầu khí", "bô xít", "cà phê")
  for (let topic of TOPIC_KNOWLEDGE_MAP) {
    if (topic.keywords.some(kw => normalizedQ.includes(kw))) {
      return formatResponse(topic.answer);
    }
  }

  // 4. CHECK REGION / GEOGRAPHY SPECIFIC INTENT MATCH (E.g. "đắc lắc thuộc miền nào ?")
  const isRegionQuery = normalizedQ.includes("mien nao") || 
                        normalizedQ.includes("vung nao") || 
                        normalizedQ.includes("o dau") || 
                        normalizedQ.includes("thuoc mien") ||
                        normalizedQ.includes("nam o dau") ||
                        normalizedQ.includes("thuoc tinh nao") ||
                        normalizedQ.includes("o tinh nao") ||
                        normalizedQ.includes("dia danh nao");

  if (isRegionQuery || normalizedQ.includes("tinh ") || normalizedQ.includes("thanh pho ")) {
    for (let item of PROVINCE_REGION_MAP) {
      const isMatched = item.names.some(name => normalizedQ.includes(name));
      if (isMatched) {
        if (isRegionQuery) {
          return formatResponse(`Tỉnh/địa danh ${item.province} thuộc ${item.macroRegion} (${item.region}) của Việt Nam 🗺️!\n\n${item.details}`);
        }
        return formatResponse(`Tỉnh/địa danh ${item.province} nằm ở vùng ${item.region} (${item.macroRegion}) ✨.\n\n${item.details}`);
      }
    }
  }

  // 5. Search dynamic lessons database
  let activeLessons = lessons;
  if (!activeLessons || activeLessons.length === 0) {
    try {
      const { getAllLessons } = await import('./api.js');
      activeLessons = await getAllLessons();
    } catch (e) {
      activeLessons = [];
    }
  }
  const matchedLesson = (activeLessons || []).find(l => {
    const normLoc = normalizeVietnameseText(l.location_name || l.name || '');
    const normProv = normalizeVietnameseText(l.province_name || l.location_name || '');
    return (normLoc && normalizedQ.includes(normLoc)) || (normProv && normalizedQ.includes(normProv));
  });

  if (matchedLesson) {
    if (isRegionQuery) {
      return formatResponse(`Địa danh ${matchedLesson.location_name} thuộc vùng ${matchedLesson.region} của Việt Nam 🗺️!\n\n${matchedLesson.intro_text || matchedLesson.subtitle}`);
    }
    return formatResponse(`Raccoon biết về địa danh ${matchedLesson.location_name} nè: ${matchedLesson.intro_text || matchedLesson.subtitle} 📍. Nơi này nằm thuộc vùng ${matchedLesson.region}! Bạn hãy mở cột mốc ${matchedLesson.location_name} trên bản đồ để thi đấu nhé ⭐!`);
  }

  // 6. Products / Specialties Query Intent
  if (normalizedQ.includes("san vat") || normalizedQ.includes("dac san") || normalizedQ.includes("co gi ngon") || normalizedQ.includes("khoang san")) {
    return formatResponse(`Việt Nam ta có 63 tỉnh thành với tài nguyên & sản vật phong phú: Than đá (Quảng Ninh), Dầu khí (Bà Rịa - Vũng Tàu), Cà phê (Đắk Lắk), Chè (Thái Nguyên), Dừa (Bến Tre), Cua (Cà Mau)... Hãy hỏi Raccoon về tài nguyên/địa danh cụ thể để Raccoon giải đáp chi tiết cho bạn nhé ⛏️☕!`);
  }

  // 7. Intelligent contextual default response
  return formatResponse(`Raccoon đã ghi nhận câu hỏi: "${userQuestion}". Việt Nam ta gồm 63 tỉnh thành giàu đẹp với lịch sử hào hùng và 3 miền Bắc - Trung - Nam 📜🗺️. Bạn hãy thử hỏi Raccoon về các sự kiện lịch sử (Điện Biên Phủ, Dời đô Thăng Long, 30/4/1975...) hoặc địa danh (Đắk Lắk, Hà Nội, Huế...) nhé!`);
}

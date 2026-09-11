// AI Assistant Engine for "Vừa Đi Vừa Học" - Raccoon Thám Hiểm (Gemini AI API + Rich Knowledge Engine)
import { INITIAL_LESSONS, INITIAL_QUESTIONS } from './mockData';
import { normalizeVietnameseText } from '../utils/textUtils';

const SYSTEM_PROMPT = `
Bạn là "Gấu Trúc Raccoon Thám Hiểm" - Trợ lý AI thông minh, thân thiện, hào hứng của ứng dụng học tập "Vừa Đi Vừa Học" dành cho học sinh THCS tại Việt Nam.
Nhiệm vụ của bạn:
1. Giải đáp các thắc mắc về Lịch Sử và Địa Lý Việt Nam (đặc biệt là 63 tỉnh thành, các di tích lịch sử, danh lam thắng cảnh, sản vật địa phương, văn hóa dân tộc).
2. Trả lời với giọng văn vui vẻ, khuyến khích học sinh khám phá, súc tích (dưới 150 từ), dễ hiểu với lứa tuổi THCS.
3. Luôn xưng là "Raccoon" và gọi học sinh là "Nhà thám hiểm" hoặc "bạn".
4. Sử dụng icon/emoji sinh động (📜, 🗺️, ⛰️, ⭐, 🦝, ⚔️, ☕, 🐘, 🌾).
`;

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

  // ĐÔNG NAM BỘ
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

export async function askRaccoonAI(userQuestion, apiKey = '') {
  if (!userQuestion || !userQuestion.trim()) return '';

  const normalizedQ = normalizeVietnameseText(userQuestion);

  // 1. Try Gemini REST API if apiKey configured
  const effectiveKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (effectiveKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${SYSTEM_PROMPT}\n\nHọc sinh hỏi: "${userQuestion}"\n\nHãy trả lời Raccoon:` }
              ]
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (err) {
      console.warn("Gemini API call warning, using intelligent local engine:", err);
    }
  }

  // 2. CHECK REGION / GEOGRAPHY SPECIFIC INTENT MATCH (E.g. "đắc lắc thuộc miền nào ?")
  const isRegionQuery = normalizedQ.includes("mien nao") || 
                        normalizedQ.includes("vung nao") || 
                        normalizedQ.includes("o dau") || 
                        normalizedQ.includes("thuoc mien") ||
                        normalizedQ.includes("nam o đâu");

  for (let item of PROVINCE_REGION_MAP) {
    const isMatched = item.names.some(name => normalizedQ.includes(name));
    if (isMatched) {
      if (isRegionQuery) {
        return `🦝 Chào Nhà thám hiểm! Tỉnh/địa danh ${item.province} thuộc ${item.macroRegion} (${item.region}) của Việt Nam 🗺️!\n\n${item.details}`;
      }
      return `🦝 Chào Nhà thám hiểm! Raccoon rất vui được giải đáp: Tỉnh/địa danh ${item.province} nằm ở vùng ${item.region} (${item.macroRegion}) ✨.\n\n${item.details}`;
    }
  }

  // 3. Search dynamic lessons database (INITIAL_LESSONS)
  const matchedLesson = INITIAL_LESSONS.find(l => {
    const normLoc = normalizeVietnameseText(l.location_name);
    const normProv = normalizeVietnameseText(l.province_name);
    return normalizedQ.includes(normLoc) || normalizedQ.includes(normProv);
  });

  if (matchedLesson) {
    if (isRegionQuery) {
      return `🦝 Chào Nhà thám hiểm! Địa danh ${matchedLesson.location_name} thuộc vùng ${matchedLesson.region} của Việt Nam 🗺️!\n\n${matchedLesson.intro_text || matchedLesson.subtitle}`;
    }
    return `🦝 Chào Nhà thám hiểm! Raccoon biết về địa danh ${matchedLesson.location_name} nè: ${matchedLesson.intro_text || matchedLesson.subtitle} 📍. Nơi này nằm thuộc vùng ${matchedLesson.region}! Bạn hãy mở cột mốc ${matchedLesson.location_name} trên bản đồ để thi đấu nhé ⭐!`;
  }

  // 4. Products / Specialties Query Intent
  if (normalizedQ.includes("san vat") || normalizedQ.includes("dac san") || normalizedQ.includes("co gi ngon")) {
    return `🦝 Chào Nhà thám hiểm! Việt Nam ta có 63 tỉnh thành với hàng ngàn sản vật phong phú: Cà phê & Ca cao Tây Nguyên (Đắk Lắk), Chè Tân Cương (Thái Nguyên), Chả mực (Quảng Ninh), Dừa (Bến Tre), Cua (Cà Mau)... Hãy nhập tên tỉnh thành cụ thể để Raccoon giải đáp chi tiết cho bạn nhé 🌾☕!`;
  }

  // 5. Intelligent contextual default response
  return `🦝 Chào Nhà thám hiểm! Raccoon đã ghi nhận câu hỏi: "${userQuestion}". Việt Nam ta gồm 63 tỉnh thành giàu đẹp với 3 miền Bắc - Trung - Nam và vùng Tây Nguyên hùng vĩ 📜🗺️. Bạn hãy thử hỏi Raccoon về các địa danh như Đắk Lắk, Điện Biên, Hà Nội, Đà Nẵng, Bến Tre, Cà Mau... nhé!`;
}

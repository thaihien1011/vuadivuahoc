// AI Assistant Engine for "Vừa Đi Vừa Học" - Raccoon Thám Hiểm (Gemini AI API + Rich Knowledge Engine)
import { INITIAL_LESSONS, INITIAL_QUESTIONS } from './mockData';

const SYSTEM_PROMPT = `
Bạn là "Gấu Trúc Raccoon Thám Hiểm" - Trợ lý AI thông minh, thân thiện, hào hứng của ứng dụng học tập "Vừa Đi Vừa Học" dành cho học sinh THCS tại Việt Nam.
Nhiệm vụ của bạn:
1. Giải đáp các thắc mắc về Lịch Sử và Địa Lý Việt Nam (đặc biệt là 63 tỉnh thành, các di tích lịch sử, danh lam thắng cảnh, sản vật địa phương, văn hóa dân tộc).
2. Trả lời với giọng văn vui vẻ, khuyến khích học sinh khám phá, súc tích (dưới 150 từ), dễ hiểu với lứa tuổi THCS.
3. Luôn xưng là "Raccoon" và gọi học sinh là "Nhà thám hiểm" hoặc "bạn".
4. Sử dụng icon/emoji sinh động (📜, 🗺️, ⛰️, ⭐, 🦝, ⚔️, ☕, 🐘, 🌾).
`;

const COMPREHENSIVE_KNOWLEDGE_MAP = [
  // TÂY NGUYÊN & ĐẮK LẮK
  {
    keywords: ["dac lac", "dak lak", "daklak", "buon ma thuot", "buon don"],
    answer: "Đắk Lắk là 'Thủ phủ Cà phê của Việt Nam' với thương hiệu Cà phê Buôn Ma Thuột nổi tiếng thế giới ☕! Ngoài ra, Đắk Lắk còn có các sản vật quý như: Ca cao, Hạt tiêu, Bơ sáp, Mật ong hoa cà phê, và Vải thổ cẩm. Nơi đây còn nổi tiếng với Văn hóa Cồng chiêng Tây Nguyên, Hội đua voi Buôn Đôn, Hồ Lắk và Thác Dray Nur hùng vĩ 🐘⛰️!"
  },
  {
    keywords: ["gia lai", "pleiku", "bien ho"],
    answer: "Gia Lai nổi tiếng với Biển Hồ Tơ Nưng (Đôi mắt Pleiku), Núi lửa Chư Đăng Ya rực rỡ hoa dại, cùng các sản vật đặc trưng như Cà phê, Mủ cao su, Chè Pleiku, Bò một nắng muối kiến vàng và Phở hai tô 🍵!"
  },
  {
    keywords: ["lam dong", "da lat", "langbiang"],
    answer: "Lâm Đồng sở hữu thành phố ngàn hoa Đà Lạt, Cao nguyên Di Linh và đỉnh Langbiang thơ mộng 🏔️. Sản vật nổi tiếng gồm: Trà Bảo Lộc, Cà phê Cầu Đất, Dâu tây, Rượu cần và hàng trăm loài hoa tươi 🍓🌸!"
  },
  {
    keywords: ["kon tum", "mang den"],
    answer: "Kon Tum nổi tiếng với Măng Đen - 'Đà Lạt thứ hai', Nhà thờ Gỗ cổ kính trăm năm và Cầu treo Kon Klor 🌉. Sản vật nổi bật có Sâm Ngọc Linh quý hiếm, Rượu cần và Măng khô 🌿!"
  },

  // TÂY BẮC & BẮC BỘ
  {
    keywords: ["dien bien", "muong thanh"],
    answer: "Điện Biên gắn liền với Thung lũng Mường Thanh và Chiến dịch Điện Biên Phủ năm 1954 'lừng lẫy năm châu, chấn động địa cầu' ⚔️! Sản vật nổi tiếng là Gạo nếp Nương Mường Thanh, Sâu bống Mường Lay và Thịt trâu gác bếp 🌾!"
  },
  {
    keywords: ["thai nguyen", "atk", "dinh hoa"],
    answer: "Thái Nguyên là Thủ đô gió ngàn An Toàn Khu (ATK) Định Hóa trong kháng chiến chống Pháp 📜. Nơi đây lừng danh với 'Đệ nhất danh trà' Chè Tân Cương Thái Nguyên ngát hương 🍵!"
  },
  {
    keywords: ["lai chau", "o quy ho"],
    answer: "Lai Châu nằm ở đầu nguồn Sông Đà hùng vĩ, nổi tiếng với Đèo Ô Quy Hồ, Bia đá cổ Vua Lê Thái Tổ (1431) và sản vật Rượu ngô Mẫu Sơn, Thịt lợn cắp nách, Chè Tam Đường 🏔️!"
  },
  {
    keywords: ["son la", "moc chau"],
    answer: "Sơn La nổi tiếng với Cao nguyên Mộc Châu trù phú, Nhà máy Thủy điện Sơn La lớn nhất Đông Nam Á và Di tích lịch sử Nhà tù Sơn La ⚡. Sản vật trứ danh gồm Sữa tươi Mộc Châu, Xoài tròn Yên Châu, Chè Oolong 🥛!"
  },
  {
    keywords: ["hoa binh"],
    answer: "Hòa Bình là cái nôi của Văn hóa Hòa Bình thời đồ đá, có Thủy điện Hòa Bình trên Sông Đà và sản vật Cam Cao Phong, Rượu cần Mường, Cơm lam Bản Lác 🌊!"
  },
  {
    keywords: ["ha noi", "thang long", "ho guom"],
    answer: "Hà Nội là Thủ đô ngàn năm văn hiến với 36 phố phường, Hồ Hoàn Kiếm, Văn Miếu Quốc Tử Giám 📜. Sản vật nổi tiếng gồm Cốm làng Vòng, Bún chả, Phở Hà Nội, Trà sen Tây Hồ 🌾!"
  },
  {
    keywords: ["quang ninh", "ha long"],
    answer: "Quảng Ninh sở hữu Vịnh Hạ Long - Kỳ quan thiên nhiên thế giới 🚢! Sản vật nổi tiếng bậc nhất gồm Chả mực Hạ Long, Sá sùng Vân Đồn, Rượu mơ Yên Tử 🦑!"
  },

  // MIỀN TRUNG
  {
    keywords: ["thua thien hue", "hue", "song huong"],
    answer: "Thừa Thiên Huế là Cố đô lịch sử với Quần thể di tích Cố đô Huế, Sông Hương núi Ngự 🏰. Sản vật đặc trưng gồm Mè xửng Huế, Tôm chua, Nón lá và Trà cung đình 🍵!"
  },
  {
    keywords: ["da nang", "ba na", "cau vang"],
    answer: "Đà Nẵng được mệnh danh là 'Thành phố đáng sống' với Cầu Vàng Bàn Tay, Ngũ Hành Sơn, Biển Mỹ Khê 🌊. Sản vật nổi tiếng có Bánh khô khổ Cẩm Lệ, Chả bò Đà Nẵng 🥩!"
  },
  {
    keywords: ["nghe an", "nam dan", "sen lang sen"],
    answer: "Nghệ An là quê hương của Chủ tịch Hồ Chí Minh kính yêu (Làng Sen, Nam Đàn) 📜. Sản vật nổi tiếng gồm Nhút Thanh Chương, Tương Nam Đàn, Cam Xã Đoài và Lươn xứ Nghệ 🍊!"
  },

  // MIỀN NAM & ĐỒNG BẰNG SÔNG CỬU LONG
  {
    keywords: ["ho chi minh", "sai gon"],
    answer: "TP. Hồ Chí Minh là trung tâm kinh tế năng động lớn nhất nước, với Dinh Độc Lập, Bến Nhà Rồng nơi Bác Hồ ra đi tìm đường cứu nước (1911) 🏢. Sản vật nổi tiếng có Cơm tấm Sài Gòn, Bánh mì, Trái cây Nam Bộ 🥭!"
  },
  {
    keywords: ["ca mau", "dat mui"],
    answer: "Cà Mầu là mảnh đất tận cùng phía Nam Tổ quốc với Đất Mũi Cà Mau, Rừng U Minh Hạ 🌲. Sản vật nổi tiếng gồm Cua Cà Mau tươi ngon, Mắm lóc, Khô cá sặc bổi và Tôm khô 🦀!"
  },
  {
    keywords: ["ben tre"],
    answer: "Bến Tre là Xứ Dừa Việt Nam gắn liền với Phong trào Đồng Khởi lịch sử 🥥. Sản vật nổi tiếng bậc nhất là Kẹo dừa Bến Tre, Dứa xiêm, Bánh tráng Mỹ Lồng 🌴!"
  },
  {
    keywords: ["can tho", "ninh kieu", "cai rang"],
    answer: "Cần Thơ là Tây Đô sông nước với Bến Ninh Kiều, Chợ nổi Cái Răng rộn rã 🚣‍♂️. Sản vật phong phú gồm Bánh tét lá cẩm, Trái cây Phong Điền, Nem nướng Cái Răng 🌾!"
  }
];

export async function askRaccoonAI(userQuestion, apiKey = '') {
  if (!userQuestion || !userQuestion.trim()) return '';

  const cleanQ = userQuestion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Try Gemini REST API if apiKey provided or configured
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
      console.warn("Gemini API call warning, falling back to smart local response:", err);
    }
  }

  // 2. Search COMPREHENSIVE_KNOWLEDGE_MAP
  for (let item of COMPREHENSIVE_KNOWLEDGE_MAP) {
    if (item.keywords.some(k => cleanQ.includes(k))) {
      return `Chào bạn! Raccoon rất vui được giải đáp: ${item.answer} Bạn có muốn cùng Raccoon làm quiz để tích lũy thêm ⭐ không nào?`;
    }
  }

  // 3. Search dynamic lessons database (INITIAL_LESSONS)
  const matchedLesson = INITIAL_LESSONS.find(l => 
    cleanQ.includes(l.location_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')) ||
    cleanQ.includes(l.province_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );

  if (matchedLesson) {
    return `Chào bạn! Raccoon biết về địa danh ${matchedLesson.location_name} nè: ${matchedLesson.intro_text || matchedLesson.subtitle} 📍. Nơi này nằm thuộc vùng ${matchedLesson.region}! Bạn hãy mở cột mốc ${matchedLesson.location_name} trên bản đồ để thi đấu nhé ⭐!`;
  }

  // 4. Default intelligent fallback for Geography & History questions
  if (cleanQ.includes("san vat") || cleanQ.includes("dac san")) {
    return `Chào bạn! Việt Nam ta có 63 tỉnh thành với hàng ngàn sản vật phong phú: Cà phê Tây Nguyên (Đắc Lắc), Chè Tân Cương (Thái Nguyên), Chả mực (Quảng Ninh), Dừa (Bến Tre), Cua (Cà Mau)... Hãy nhập tên tỉnh thành cụ thể để Raccoon giải đáp chi tiết cho bạn nhé 🌾☕!`;
  }

  return `Chào Nhà thám hiểm! Raccoon đã ghi nhận câu hỏi "${userQuestion}". Việt Nam ta có chiều dài lịch sử ngàn năm văn hiến và 63 tỉnh thành giàu đẹp. Bạn hãy thử hỏi Raccoon về các địa danh như Đắc Lắc, Điện Biên, Hà Nội, Bến Tre, Cà Mau... nhé 📜🗺️!`;
}


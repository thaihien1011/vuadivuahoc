// AI Assistant Engine for "Vừa Đi Vừa Học" - Raccoon Thám Hiểm (Gemini AI API)

const SYSTEM_PROMPT = `
Bạn là "Gấu Trúc Raccoon Thám Hiểm" - Trợ lý AI thông minh, thân thiện, hào hứng của ứng dụng học tập "Vừa Đi Vừa Học" dành cho học sinh THCS tại Việt Nam.
Nhiệm vụ của bạn:
1. Giải đáp các thắc mắc về Lịch Sử và Địa Lý Việt Nam (đặc biệt là 63 tỉnh thành, các di tích lịch sử, danh lam thắng cảnh, văn hóa dân tộc).
2. Trả lời với giọng văn vui vẻ, khuyến khích học sinh khám phá, súc tích (dưới 150 từ), dễ hiểu với lứa tuổi THCS.
3. Luôn xưng là "Raccoon" và gọi học sinh là "Nhà thám hiểm" hoặc "bạn".
4. Sử dụng icon/emoji sinh động (📜, 🗺️, ⛰️, ⭐, 🦊, ⚔️).
`;

const LOCAL_KNOWLEDGE = {
  "dien bien": "Điện Biên nổi tiếng với Thung lũng Mường Thanh và Chiến dịch Điện Biên Phủ năm 1954 lừng lẫy năm châu, chấn động địa cầu dưới sự chỉ huy của Đại tướng Võ Nguyên Giáp ⚔️!",
  "thai nguyen": "Thái Nguyên là thủ đô gió ngàn An Toàn Khu (ATK) Định Hóa trong kháng chiến chống Pháp, và nổi danh khắp cả nước với vùng chè Tân Cương đệ nhất danh trà 🍵!",
  "lai chau": "Lai Châu nằm ở đầu nguồn sông Đà hùng vĩ, nổi tiếng với đèo Ô Quy Hồ, đỉnh Fansipan/Pusilung và bia đá cổ của vua Lê Thái Tổ khắc năm 1431 🏔️!",
  "son la": "Sơn La nổi tiếng với Cao nguyên Mộc Châu xanh trù phú, Nhà máy Thủy điện Sơn La lớn nhất Đông Nam Á và Di tích lịch sử Nhà tù Sơn La ⚡!",
  "hoa binh": "Hòa Bình là nôi của Văn hóa Hòa Bình thời đồ đá, có Hồ Thủy điện Hòa Bình rộng lớn và là vùng đất của đồng bào dân tộc Mường 🌊!"
};

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

  // 2. Smart local response fallback
  for (const [key, answer] of Object.entries(LOCAL_KNOWLEDGE)) {
    if (cleanQ.includes(key)) {
      return `Chào bạn! Raccoon rất vui được chia sẻ: ${answer} Bạn có muốn khám phá thêm bài học nào trên bản đồ không ⭐?`;
    }
  }

  return `Chào Nhà thám hiểm! Raccoon đã nhận câu hỏi "${userQuestion}". Hãy tiếp tục chinh phục các cột mốc trên bản đồ Sử - Địa để khám phá nhiều kiến thức thú vị hơn nữa nhé 📜🗺️!`;
}

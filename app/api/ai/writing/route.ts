import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Khởi tạo Gemini client với API Key từ biến môi trường
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    // Nếu không có API Key, báo lỗi luôn để tránh sập app
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Chưa cấu hình GEMINI_API_KEY trên server.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { taskType, topic, essay, topicImage } = body;

    if (!taskType || (!topic && !topicImage) || !essay) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp đủ đề bài (text hoặc ảnh) và bài làm.' },
        { status: 400 }
      );
    }

    // Model được cấu hình bên dưới phần gọi API bằng cơ chế fallback

    // Prompt siêu chi tiết ép Gemini trả về JSON
    const prompt = `
Bạn là một cựu giám khảo IELTS vô cùng khắt khe và công tâm.
Nhiệm vụ của bạn là chấm điểm bài viết IELTS ${taskType.toUpperCase()} dưới đây theo ĐÚNG 4 TIÊU CHÍ (Task Response/Task Achievement, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy).

Đề bài: "${topic}"

Bài làm của học viên:
"${essay}"

BẠN BẮT BUỘC PHẢI TRẢ VỀ KẾT QUẢ DƯỚI DẠNG CHUỖI JSON HỢP LỆ (KHÔNG bọc trong markdown \`\`\`json). Cấu trúc JSON phải chính xác như sau:
{
  "overallBand": 6.5,
  "scores": {
    "TR": 6.0,
    "CC": 6.5,
    "LR": 7.0,
    "GRA": 6.5
  },
  "feedback": {
    "TR": "PHÂN TÍCH RẤT SÂU: Giải thích cặn kẽ tại sao bài viết được điểm này, phân tích từng đoạn văn xem đã trả lời trọn vẹn câu hỏi chưa. Chỉ ra chính xác luận điểm nào hời hợt, luận điểm nào tốt. (ít nhất 4-5 câu)",
    "CC": "PHÂN TÍCH RẤT SÂU: Đánh giá cực kỳ chi tiết về sự mạch lạc giữa các câu và các đoạn. Chỉ ra những chỗ chuyển ý bị gượng ép, hoặc lặp từ nối quá nhiều. Đưa ra gợi ý cấu trúc mạch lạc hơn. (ít nhất 4-5 câu)",
    "LR": "PHÂN TÍCH RẤT SÂU: Nhận xét chi tiết về vốn từ vựng, mức độ sử dụng collocation và idiomatic expressions. Chỉ ra đích danh những cụm từ dùng sai ngữ cảnh hoặc không tự nhiên, và khen ngợi những cụm từ xuất sắc. (ít nhất 4-5 câu)",
    "GRA": "PHÂN TÍCH RẤT SÂU: Phân tích độ phức tạp của cấu trúc câu (câu đơn, câu ghép, câu phức). Chỉ ra những lỗi sai ngữ pháp lặp đi lặp lại hoặc lỗi chia thì, giới từ. Đánh giá về sự đa dạng ngữ pháp. (ít nhất 4-5 câu)"
  },
  "grammarErrors": [
    {
      "error": "Trích dẫn lại chính xác câu/cụm từ bị sai trong bài",
      "correction": "Sửa lại cho đúng",
      "explanation": "Giải thích cặn kẽ luật ngữ pháp và tại sao lỗi này lại làm giảm điểm (bằng tiếng Việt)"
    }
  ],
  "vocabularyUpgrades": [
    {
      "original": "Từ/cụm từ cơ bản trong bài (vd: very happy)",
      "upgrade": "Từ/cụm từ Band 8-9 thay thế siêu đỉnh (vd: ecstatic, over the moon)",
      "explanation": "Nghĩa tiếng Việt, sắc thái nghĩa và ví dụ cách dùng trong câu."
    }
  ],
  "generalComment": "NHẬN XÉT SIÊU CHI TIẾT (dài khoảng 2-3 đoạn văn): Tổng kết toàn diện về ưu điểm, khuyết điểm cốt lõi. Đưa ra lộ trình hành động (actionable advice) cực kỳ rõ ràng để thí sinh nâng ngay lập tức 0.5 - 1.0 band trong bài viết tới."
}
`;

    // Chuẩn bị payload (có thể là multi-modal nếu có ảnh)
    const parts: any[] = [prompt];
    
    if (topicImage && taskType === 'task1') {
      const matches = topicImage.match(/^data:(image\/\w+);base64,(.*)$/);
      if (matches && matches.length === 3) {
        parts.push({
          inlineData: {
            data: matches[2],
            mimeType: matches[1]
          }
        });
      }
    }

    // Mảng các model dự phòng xếp theo thứ tự ưu tiên (Dựa trên danh sách API Key thực tế)
    const fallbackModels = [
      'gemini-flash-latest',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-pro-latest'
    ];

    let result;
    let lastError;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(parts);
        if (result) {
          console.log(`Đã dùng thành công model: ${modelName}`);
          break; // Thoát vòng lặp ngay nếu thành công
        }
      } catch (e: any) {
        lastError = e;
        console.warn(`Model ${modelName} bị lỗi hoặc quá tải: ${e.message}`);
      }
    }

    if (!result) {
      throw lastError; // Văng lỗi ra nếu không có model nào hoạt động
    }
    const response = await result.response;
    let text = response.text();

    // Dọn dẹp chuỗi trả về (đôi khi Gemini tự thêm ```json ... ```)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseError) {
      console.error('Lỗi Parse JSON từ Gemini:', text);
      return NextResponse.json(
        { error: 'AI trả về định dạng lỗi: ' + text.slice(0, 100) + '...' },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedData, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi chấm AI Writing:', error);
    return NextResponse.json(
      { error: 'Lỗi AI: ' + (error.message || String(error)) },
      { status: 500 }
    );
  }
}

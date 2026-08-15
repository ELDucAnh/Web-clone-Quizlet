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

    // Chọn model (gemini-1.5-flash là model cực nhanh và đủ thông minh để chấm bài)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.7-flash' });

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
    "TR": "Giải thích chi tiết tại sao bài viết được điểm này, Bị mất điểm ở đâu (ví dụ: lack of examples, unclear position).",
    "CC": "Giải thích chi tiết về liên kết câu/đoạn, sử dụng mạo từ nối, chia đoạn hợp lý chưa.",
    "LR": "Giải thích chi tiết về vốn từ vựng, collocation, và các lỗi dùng từ sai ngữ cảnh.",
    "GRA": "Giải thích chi tiết về độ đa dạng ngữ pháp và các lỗi sai ngữ pháp cụ thể."
  },
  "grammarErrors": [
    {
      "error": "Trích dẫn lại chính xác câu/cụm từ bị sai trong bài",
      "correction": "Sửa lại cho đúng",
      "explanation": "Giải thích luật ngữ pháp (bằng tiếng Việt)"
    }
  ],
  "vocabularyUpgrades": [
    {
      "original": "Từ/cụm từ cơ bản trong bài (vd: very happy)",
      "upgrade": "Từ/cụm từ Band 8 thay thế (vd: ecstatic, over the moon)",
      "explanation": "Nghĩa tiếng Việt và ngữ cảnh sử dụng"
    }
  ],
  "generalComment": "Nhận xét tổng quan, khen ngợi và 2-3 lời khuyên cốt lõi nhất để tăng 0.5 band."
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

    // Gọi Gemini API
    const result = await model.generateContent(parts);
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

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY trên server.' }, { status: 500 });
    }

    const body = await req.json();
    const { part, topic, transcript } = body;

    if (!transcript) {
      return NextResponse.json({ error: 'Không nhận được nội dung bài nói (transcript).' }, { status: 400 });
    }

    // Model được cấu hình bên dưới bằng cơ chế fallback

    const prompt = `
Bạn là cựu giám khảo IELTS Speaking. Học viên vừa thực hiện bài nói IELTS Speaking Part ${part || 1}.
Chủ đề / Câu hỏi: "${topic || 'General conversation'}"

Dưới đây là phần text được bóc băng (transcribe) từ giọng nói thực tế của học viên:
"${transcript}"

Nhiệm vụ của bạn là chấm điểm bài nói này theo 4 tiêu chí chuẩn của IELTS Speaking (Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation). LƯU Ý VỀ PRONUNCIATION: Vì đây là bản text bóc băng từ phần mềm nhận diện giọng nói, hãy suy ra lỗi Pronunciation dựa trên việc phần mềm nhận diện sai từ ngữ (ví dụ học viên định nói 'think' nhưng phần mềm nhận thành 'sink', hoặc các từ bị dính vào nhau).

BẠN BẮT BUỘC TRẢ VỀ CHUỖI JSON HỢP LỆ (KHÔNG bọc trong \`\`\`json). Cấu trúc JSON phải chính xác như sau:
{
  "overallBand": 6.5,
  "scores": {
    "FC": 6.0,
    "LR": 6.5,
    "GRA": 7.0,
    "PR": 6.5
  },
  "feedback": {
    "FC": "Đánh giá chi tiết Fluency & Coherence. Chỉ ra các đoạn bị ngập ngừng, lặp từ, hoặc thiếu linking words.",
    "LR": "Đánh giá về Lexical Resource, các từ dùng sai ngữ cảnh.",
    "GRA": "Đánh giá về cấu trúc câu, lỗi chia thì, chia động từ.",
    "PR": "Đánh giá Pronunciation dựa trên các lỗi nhận diện của Speech-to-text hoặc các từ đọc sai hiển nhiên."
  },
  "grammarErrors": [
    {
      "error": "Câu/cụm từ sai ngữ pháp hoặc phát âm sai",
      "correction": "Cách nói đúng",
      "explanation": "Giải thích chi tiết (tiếng Việt)"
    }
  ],
  "vocabularyUpgrades": [
    {
      "original": "Từ vựng cơ bản",
      "upgrade": "Idiom hoặc từ vựng Band 8 thay thế",
      "explanation": "Nghĩa tiếng Việt và ngữ cảnh sử dụng trong văn nói"
    }
  ],
  "generalComment": "Nhận xét tổng quan và mẹo luyện tập để cải thiện kỹ năng Speaking."
}
`;

    let result;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3.7-flash' });
      result = await model.generateContent(prompt);
    } catch (aiError: any) {
      console.warn('gemini-3.7-flash đang quá tải hoặc lỗi, chuyển sang gemini-2.5-flash dự phòng...', aiError.message);
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      result = await fallbackModel.generateContent(prompt);
    }
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(text);

    return NextResponse.json(parsedData, { status: 200 });
  } catch (error: any) {
    console.error('Lỗi khi chấm AI Speaking:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra khi chấm bài Speaking.' }, { status: 500 });
  }
}

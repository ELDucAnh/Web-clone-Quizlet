import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GEMINI_API_KEY' }, { status: 500 });
    }

    const { text } = await req.json();
    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'Văn bản quá ngắn' }, { status: 400 });
    }

    const prompt = `
Trích xuất những từ vựng đắt giá (trình độ B2-C2, idioms, collocations, phrasal verbs...) từ văn bản tiếng Anh sau đây.
Yêu cầu trả về tối đa 20 thẻ (cards). Đối với mỗi thẻ:
- "term": từ vựng/cụm từ tiếng Anh nguyên gốc.
- "definition": Giải nghĩa tiếng Việt ngắn gọn, kèm phiên âm IPA và 1 câu ví dụ ngắn bằng tiếng Anh. Ví dụ: "(v) /əˈtʃiːv/ đạt được. Ex: She achieved her goals."
- Không lấy các từ vựng quá cơ bản (A1, A2).

Văn bản:
"""
${text}
"""
    `;

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text());

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[AI Generate Deck Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

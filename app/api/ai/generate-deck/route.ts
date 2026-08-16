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
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json"
          }
        });
        result = await model.generateContent(prompt);
        if (result) break;
      } catch (e: any) {
        lastError = e;
        console.warn(`Model ${modelName} failed: ${e.message}`);
      }
    }

    if (!result) {
      throw lastError || new Error('All models failed');
    }

    const response = await result.response;
    const rawText = response.text();
    const cleanText = rawText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleanText);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[AI Generate Deck Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

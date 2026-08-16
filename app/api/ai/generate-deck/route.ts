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
Bạn là một chuyên gia ngôn ngữ tiếng Anh. Hãy rà soát toàn bộ đoạn văn bản tiếng Anh dưới đây và trích xuất TOÀN BỘ những từ vựng khó, học thuật, idioms, collocations, phrasal verbs (trình độ B2, C1, C2). 
KHÔNG GIỚI HẠN số lượng từ, hãy quét thật kỹ và tìm ra nhiều từ khó nhất có thể.
Đối với mỗi từ, hãy trả về định dạng thẻ ghi nhớ (flashcard) vô cùng ngắn gọn:
- "term": từ vựng tiếng Anh nguyên bản.
- "definition": CHỈ trả về nghĩa tiếng Việt ngắn gọn, súc tích (1-2 từ). TUYỆT ĐỐI KHÔNG giải thích dài dòng, KHÔNG ghi chú từ loại, KHÔNG phiên âm, KHÔNG ví dụ. Ví dụ: "hoàn thành", "cung cấp", "chấp nhận".

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

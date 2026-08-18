import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Chưa cấu hình GROQ_API_KEY' }, { status: 500 });
    }

    const { text } = await req.json();
    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'Văn bản quá ngắn' }, { status: 400 });
    }

    const prompt = `
Bạn là một chuyên gia ngôn ngữ tiếng Anh. Hãy rà soát toàn bộ đoạn văn bản tiếng Anh dưới đây và trích xuất TOÀN BỘ những từ vựng khó, học thuật, idioms, collocations, phrasal verbs (trình độ B2, C1, C2). 
KHÔNG GIỚI HẠN số lượng từ, hãy quét thật kỹ và tìm ra nhiều từ khó nhất có thể.
Đối với mỗi từ, hãy tạo định dạng thẻ ghi nhớ (flashcard) vô cùng ngắn gọn:
- "term": từ vựng tiếng Anh nguyên bản.
- "definition": CHỈ trả về nghĩa tiếng Việt ngắn gọn, súc tích (1-2 từ). TUYỆT ĐỐI KHÔNG giải thích dài dòng, KHÔNG ghi chú từ loại, KHÔNG phiên âm, KHÔNG ví dụ. Ví dụ: "hoàn thành", "cung cấp", "chấp nhận".

Output MUST be a valid JSON object with a single key "cards" containing the array of word objects.

Format:
{
  "cards": [
    { "term": "word1", "definition": "nghĩa 1" },
    { "term": "word2", "definition": "nghĩa 2" }
  ]
}

Văn bản:
"""
${text}
"""`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are an expert English teacher. Output valid JSON only." },
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-70b-versatile",
      temperature: 0.5,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || "";
    const parsedData = JSON.parse(responseText);

    const cards = Array.isArray(parsedData) ? parsedData : (parsedData.cards || parsedData.items || Object.values(parsedData)[0]);

    return NextResponse.json(cards);
  } catch (error: any) {
    console.error('[AI Generate Deck Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

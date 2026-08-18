import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { words } = await req.json();

    if (!words || words.length === 0) {
      return NextResponse.json({ error: 'Missing words' }, { status: 400 });
    }

    const prompt = `You are an expert English teacher. 
Create an interactive 20-question English learning exercise based on the following vocabulary words:
${words.join(', ')}

IMPORTANT RULES:
- Generate EXACTLY 20 items.
- The items must alternate randomly between 3 types: "repeat_sentence", "translate_typing", and "listen_quiz".
- Every item MUST incorporate at least one vocabulary word from the list above.
- The output MUST be a JSON array of objects. Do not wrap in markdown \`\`\`json.

Format for each type:

1. Type "repeat_sentence" (User listens and repeats to practice pronunciation):
{
  "type": "repeat_sentence",
  "speaker": "A",
  "text": "A natural English sentence using the vocabulary."
}

2. Type "translate_typing" (User reads a Vietnamese sentence and types the English translation):
{
  "type": "translate_typing",
  "vietnamese": "Câu tiếng Việt cần dịch ra tiếng Anh.",
  "expectedEnglish": "The expected English translation using the vocabulary."
}

3. Type "listen_quiz" (User listens to a short dialogue, script hidden, and answers 2 multiple choice questions):
{
  "type": "listen_quiz",
  "dialogue": [
    { "speaker": "A", "text": "..." },
    { "speaker": "B", "text": "..." }
  ],
  "questions": [
    {
      "question": "A comprehension question about the dialogue?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": 0 // index of the correct option
    },
    {
      "question": "Another question?",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": 2
    }
  ]
}

GENERATE EXACTLY 20 ITEMS AS A JSON ARRAY.`;

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

    const responseText = result.response.text();
    
    // Parse JSON
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const conversation = JSON.parse(jsonStr);

    return NextResponse.json({ conversation });

  } catch (error: any) {
    console.error('Error generating conversation:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

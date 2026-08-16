import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // We fetch all relational data and construct a payload that matches Zustand store structure
    const payload: any = {
      decks: {},
      cards: {},
      cardsByDeck: {},
      progress: {},
      folders: {},
      sessions: [],
      studyHoursGoals: {},
      studyHoursLogs: [],
      writingSamples: {},
      speakingTopics: {},
      speakingSubmissions: {},
      settings: {}
    };

    const client = await db.connect();
    
    try {
      // 0. Fetch User Settings
      const { rows: userRows } = await client.query('SELECT daily_goal, settings FROM users WHERE id = $1', [userId]);
      if (userRows.length > 0) {
        payload.settings = {
          ...userRows[0].settings,
          dailyGoal: userRows[0].daily_goal
        };
      }
      // 1. Fetch Folders
      const { rows: folders } = await client.query('SELECT * FROM folders WHERE user_id = $1', [userId]);
      folders.forEach(f => {
        payload.folders[f.id] = {
          id: f.id,
          name: f.name,
          description: f.description || '',
          deckIds: [], // We will populate this below
          createdAt: new Date(f.created_at).getTime(),
          updatedAt: new Date(f.updated_at).getTime(),
        };
      });

      // 2. Fetch Decks
      const { rows: decks } = await client.query('SELECT * FROM decks WHERE user_id = $1', [userId]);
      decks.forEach(d => {
        payload.decks[d.id] = {
          id: d.id,
          name: d.name,
          description: d.description || '',
          cardCount: 0, // Will populate
          createdAt: new Date(d.created_at).getTime(),
          lastStudied: d.last_studied ? new Date(d.last_studied).getTime() : undefined,
          completedAt: d.completed_at ? new Date(d.completed_at).getTime() : undefined,
          color: d.color,
          folderId: d.folder_id || undefined,
        };
        payload.cardsByDeck[d.id] = [];
        
        if (d.folder_id && payload.folders[d.folder_id]) {
          payload.folders[d.folder_id].deckIds.push(d.id);
        }
      });

      // 3. Fetch Cards
      const { rows: cards } = await client.query('SELECT * FROM cards WHERE user_id = $1 ORDER BY sort_order ASC', [userId]);
      cards.forEach(c => {
        payload.cards[c.id] = {
          id: c.id,
          deckId: c.deck_id,
          term: c.term,
          definition: c.definition,
          starred: c.starred,
          createdAt: new Date(c.created_at).getTime(),
        };
        if (payload.cardsByDeck[c.deck_id]) {
          payload.cardsByDeck[c.deck_id].push(c.id);
        }
        if (payload.decks[c.deck_id]) {
          payload.decks[c.deck_id].cardCount += 1;
        }
      });

      // 4. Fetch Progress
      try {
        await client.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS learn_stage text`);
        await client.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS ease_factor numeric`);
        await client.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS interval_days integer`);
        await client.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS repetitions integer`);
        await client.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS correct_streak integer`);
        await client.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS total_answers integer`);
        await client.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS correct_answers integer`);
        await client.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS next_review timestamp`);
        await client.query(`ALTER TABLE card_progress ADD COLUMN IF NOT EXISTS last_answered timestamp`);
      } catch (e) {
        console.warn('[User Data] Schema auto-fix warning:', e);
      }
      const { rows: progress } = await client.query('SELECT * FROM card_progress WHERE user_id = $1', [userId]);
      progress.forEach(p => {
        payload.progress[p.card_id] = {
          cardId: p.card_id,
          deckId: p.deck_id,
          learnStage: p.learn_stage,
          easeFactor: parseFloat(p.ease_factor),
          interval: p.interval_days,
          repetitions: p.repetitions,
          correctStreak: p.correct_streak,
          totalAnswers: p.total_answers,
          correctAnswers: p.correct_answers,
          nextReview: p.next_review ? new Date(p.next_review).getTime() : 0,
          lastAnswered: p.last_answered ? new Date(p.last_answered).getTime() : undefined,
        };
      });

      // 5. Fetch Sessions
      const { rows: sessions } = await client.query('SELECT * FROM study_sessions WHERE user_id = $1 ORDER BY started_at ASC', [userId]);
      payload.sessions = sessions.map(s => ({
        id: s.id,
        deckId: s.deck_id,
        mode: s.mode,
        totalCards: s.total_cards,
        correctCount: s.correct_count,
        score: s.score,
        startedAt: new Date(s.started_at).getTime(),
        completedAt: s.completed_at ? new Date(s.completed_at).getTime() : undefined,
      }));

      // IELTS specific
      const { rows: goals } = await client.query('SELECT * FROM study_hours_goals WHERE user_id = $1', [userId]);
      goals.forEach(g => {
        payload.studyHoursGoals[g.id] = {
          id: g.id,
          skill: g.skill,
          targetHours: g.target_hours,
          deadline: g.deadline ? new Date(g.deadline).getTime() : undefined,
          createdAt: new Date(g.created_at).getTime(),
        };
      });

      const { rows: logs } = await client.query('SELECT * FROM study_hours_logs WHERE user_id = $1', [userId]);
      payload.studyHoursLogs = logs.map(l => ({
        id: l.id,
        goalId: l.goal_id,
        skill: l.skill,
        minutes: l.minutes,
        content: l.content,
        date: new Date(l.study_date).getTime(),
        createdAt: new Date(l.created_at).getTime(),
      }));

      const { rows: writing } = await client.query('SELECT * FROM writing_samples WHERE user_id = $1', [userId]);
      writing.forEach(w => {
        payload.writingSamples[w.id] = {
          id: w.id,
          task: w.task,
          title: w.title,
          topic: w.topic,
          content: w.content,
          band: w.band || undefined,
          tags: w.tags || [],
          aiFeedback: w.ai_feedback,
          createdAt: new Date(w.created_at).getTime(),
          updatedAt: new Date(w.updated_at).getTime(),
        };
      });

      const { rows: speaking } = await client.query('SELECT * FROM speaking_topics WHERE user_id = $1', [userId]);
      speaking.forEach(s => {
        payload.speakingTopics[s.id] = {
          id: s.id,
          part: s.part,
          topic: s.topic,
          questions: s.questions || [],
          sampleAnswer: s.sample_answer || undefined,
          keywords: s.keywords || [], 
          createdAt: new Date(s.created_at).getTime(),
          updatedAt: new Date(s.updated_at).getTime(),
        };
      });

      const { rows: speakingSubs } = await client.query('SELECT * FROM speaking_submissions WHERE user_id = $1', [userId]);
      speakingSubs.forEach(s => {
        payload.speakingSubmissions[s.id] = {
          id: s.id,
          part: s.part,
          topic: s.topic,
          transcript: s.transcript,
          band: s.band || undefined,
          aiFeedback: s.ai_feedback,
          createdAt: new Date(s.created_at).getTime(),
          updatedAt: new Date(s.updated_at).getTime(),
        };
      });
      
    } finally {
      client.release();
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('[UserData] Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

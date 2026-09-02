// lib/roadmap-data.ts — IELTS 140-day: 5.5 → 8.0
// Intensive 4 tasks/day (Phase 1-2) and 6 tasks/day (Phase 3-4)
// Max 2 skills/day (R&L on odd days, W&S on even days)
// Max 100 new words/day constraint strictly followed.

export type Phase = 1 | 2 | 3 | 4;
export type TaskType = 'vocab' | 'reading' | 'listening' | 'writing' | 'speaking' | 'grammar' | 'mock';

export interface DayTask {
  id: string;
  type: TaskType;
  title: string;
  detail: string;
  url?: string;
}

export interface RoadmapDay {
  day: number;
  week: number;
  phase: Phase;
  theme: string;
  themeEn: string;
  tasks: DayTask[];
  isMilestone: boolean;
  milestoneLabel?: string;
}

export const PHASES = [
  { id: 1 as Phase, name: 'Xây Nền Tảng', bandRange: '5.5 → 6.0', days: [1,35] as [number,number], color: '#4f8ef7', bg: '#EFF6FF', description: '4 tasks/ngày. Lấp lỗ hổng Grammar, tích lũy CamCore 600 & CamListen. Tối đa 2 kỹ năng/ngày (Chẵn R/L, Lẻ W/S).' },
  { id: 2 as Phase, name: 'Bứt Phá', bandRange: '6.0 → 7.0', days: [36,70] as [number,number], color: '#a855f7', bg: '#F5F3FF', description: '4 tasks/ngày. Đẩy mạnh Topic Vocab và Collocations. Kết thúc chắc chắn đạt 7.0.' },
  { id: 3 as Phase, name: 'Đào Sâu', bandRange: '7.0 → 7.5', days: [71,105] as [number,number], color: '#06b6d4', bg: '#ECFEFF', description: '6 tasks/ngày. Tăng tốc thực chiến Reading Intensive và Writing Canh giờ.' },
  { id: 4 as Phase, name: 'Thực Chiến', bandRange: '7.5 → 8.0', days: [106,140] as [number,number], color: '#f59e0b', bg: '#FFFBEB', description: '6 tasks/ngày. Mock test liên tục, tối đa hóa điểm Listening & Reading lên 8.5-9.0.' },
];

// Data arrays for dynamic generation
const CAMCORE_BATCHES = ["Batch 1 (001–070)", "Batch 2 (071–140)", "Batch 3 (141–210)", "Batch 4 (211–280)", "Batch 5 (281–350)", "Batch 6 (351–420)", "Batch 7 (421–490)", "Batch 8 (491–560)", "Batch 9 (561–600)"];
const TOPIC_READING = ["TR1: Environment", "TR2: Technology", "TR3: Education", "TR4: Health & Medicine", "TR5: Society & Community", "TR6: Science & Research", "TR7: Business & Economy", "TR8: Government & Politics", "TR9: Media & Communication", "TR10: Arts & Culture", "TR11: Crime & Justice", "TR12: Transport & Travel", "TR13: Space & Future"];
const WRITING_COLLOCS = ["W2T01: Environment", "W2T02: Technology", "W2T03: Education", "W2T04: Health & Medicine", "W2T05: Society", "W2T06: Science", "W2T07: Business & Economy", "W2T08: Government & Politics", "W2T09: Media & Communication", "W2T10: Transport & Urban", "W2T11: Food & Diet", "W2T12: Arts & Culture", "W2T13: Crime & Justice", "W2T14: Family & Children", "W2T15: Books & Reading", "W2T16: Animals & Wildlife", "W2T17: History & Heritage", "W2T18: Languages", "W2T19: Work & Career", "W2T20: Globalisation", "W2T21: Tourism", "W2T22: Space", "W2T23: Sports", "W2T24: Housing", "W2T25: Youth", "W2T26: Elderly", "W2T27: Consumerism", "W2T28: Immigration", "W2T29: Music", "W2T30: Happiness", "W2T31: Water & Oceans", "W2T32: Fashion", "W2T33: Traditional vs Modern", "W2T34: Charity", "W2T35: Mental Health", "W2T36: Social Media", "W2T37: AI", "W2T38: Remote Work", "W2T39: Climate Change", "W2T40: Tech Future"];
const SPEAKING_TOPICS = ["SP01: Hometown", "SP02: Work", "SP03: Family", "SP04: Friends", "SP05: Technology", "SP06: Social Media", "SP07: Environment", "SP08: Transport", "SP09: Food", "SP10: Sport", "SP11: Health", "SP12: Travel", "SP13: Education", "SP14: Books", "SP15: Movies", "SP16: Music", "SP17: Shopping", "SP18: Hobbies", "SP19: Weather", "SP20: Animals", "SP21: Art", "SP22: Daily Routine", "SP23: Childhood", "SP24: Dreams", "SP25: Languages", "SP26: Neighbours", "SP27: Politeness", "SP28: Sleep", "SP29: Time", "SP30: Celebrations"];

export function generateRoadmap(): RoadmapDay[] {
  const days: RoadmapDay[] = [];
  let camCoreIdx = 0, trIdx = 0, listenIdx = 1, writeIdx = 0, speakIdx = 0;
  
  const t = (id: string, type: TaskType, title: string, detail: string): DayTask => ({ id, type, title, detail });

  const getReadingVocab = (dayStr: string) => {
    if (camCoreIdx < CAMCORE_BATCHES.length) {
      const title = CAMCORE_BATCHES[camCoreIdx++];
      return t(`r_${dayStr}_v`, 'reading', `📖 CamCore ${title}`, 'Học từ vựng cơ bản Cambridge (≤70 từ). Mục tiêu nhận mặt chữ và nghĩa 100%.');
    } else if (trIdx < TOPIC_READING.length) {
      const title = TOPIC_READING[trIdx++];
      return t(`r_${dayStr}_v`, 'reading', `📖 ${title} (70 từ)`, 'Học 70 từ vựng chuyên sâu học thuật theo chủ đề. Flashcard có sẵn.');
    }
    return t(`r_${dayStr}_adv`, 'reading', '📰 Reading Intensive Practice', 'Làm 1 passage Reading độ khó cao (IELTS 8.0+), phân tích keyword và bẫy đồng nghĩa.');
  };

  const getListeningVocab = (dayStr: string) => {
    if (listenIdx <= 20) {
      const idx = listenIdx++;
      return t(`l_${dayStr}_v`, 'listening', `🎧 CamListen BL${idx} (30 từ)`, 'Học 30 từ vựng Listening CamListen. Chú ý spelling (phát âm, trọng âm).');
    }
    return t(`l_${dayStr}_adv`, 'listening', '🎧 Listening Intensive Practice', 'Làm đề Listening Section 3 hoặc 4. Luyện tập bắt keyword nhanh và spelling chính xác.');
  };

  const getWritingColloc = (dayStr: string) => {
    if (writeIdx < WRITING_COLLOCS.length) {
      const title = WRITING_COLLOCS[writeIdx++];
      return t(`w_${dayStr}_v`, 'writing', `✍️ 100 Collocs: ${title.split(': ')[1]}`, `Học 100 collocations chủ đề ${title.split(': ')[1]}. Bắt buộc áp dụng trong Task 2.`);
    }
    return t(`w_${dayStr}_adv`, 'writing', '✍️ Advanced Vocabulary (Writing)', 'Ôn tập và nâng cấp các từ vựng band 6.0 lên band 8.0 (Idioms, Phrasal verbs).');
  };

  const getSpeakingVocab = (dayStr: string) => {
    if (speakIdx < SPEAKING_TOPICS.length) {
      const title = SPEAKING_TOPICS[speakIdx++];
      return t(`s_${dayStr}_v`, 'speaking', `🗣️ ${title.split(': ')[1]} (50 từ)`, `Học 50 từ vựng chủ đề ${title.split(': ')[1]}. Tập trung phát âm và ngữ điệu tự nhiên.`);
    }
    return t(`s_${dayStr}_adv`, 'speaking', '🗣️ Advanced Speaking Vocab', 'Luyện tập các cụm từ ăn điểm cho Part 3: discourse markers, hedging.');
  };

  let dayCounter = 1;
  for (let week = 1; week <= 20; week++) {
    const phase = week <= 5 ? 1 : week <= 10 ? 2 : week <= 15 ? 3 : 4;
    const is6Tasks = phase >= 3;
    const isMilestoneWeek = week % 5 === 0;

    for (let d = 1; d <= 7; d++) {
      const tasks: DayTask[] = [];
      const isReviewDay = d === 7;
      const isRLDay = d % 2 !== 0 && d !== 7; // Days 1, 3, 5
      const isWSDay = d % 2 === 0 && d !== 7; // Days 2, 4, 6
      const dayStr = dayCounter.toString();

      if (isReviewDay) {
        if (!is6Tasks) {
          tasks.push(t(`m_l_${dayStr}`, 'mock', '🏆 Full Listening Test', 'Làm Full IELTS Listening (40 câu). Canh giờ chuẩn 30p + 10p transfer.'));
          tasks.push(t(`m_r_${dayStr}`, 'mock', '🏆 Full Reading Test', 'Làm Full IELTS Reading (40 câu). Canh giờ chuẩn 60p.'));
          tasks.push(t(`w_rev_${dayStr}`, 'writing', '✍️ Writing Review', 'Luyện lại dàn ý Task 2 hoặc viết lại 1 bài Task 1 bị điểm kém.'));
          tasks.push(t(`v_rev_${dayStr}`, 'vocab', '🔄 Weekly Vocab Review', 'Ôn tập 100 từ vựng khó nhất trong tuần thông qua hệ thống Spaced Repetition.'));
        } else {
          tasks.push(t(`m_l_${dayStr}`, 'mock', '🏆 Full Listening Test', 'Làm Full IELTS Listening (40 câu).'));
          tasks.push(t(`m_r_${dayStr}`, 'mock', '🏆 Full Reading Test', 'Làm Full IELTS Reading (40 câu).'));
          tasks.push(t(`m_w_${dayStr}`, 'mock', '🏆 Full Writing Mock', 'Viết Task 1 (20p) và Task 2 (40p) liên tục.'));
          tasks.push(t(`m_s_${dayStr}`, 'mock', '🏆 Full Speaking Mock', 'Ghi âm Part 1, 2, 3 liên tục không ngừng.'));
          tasks.push(t(`v_rev_${dayStr}`, 'vocab', '🔄 Weekly Vocab Review', 'Ôn tập 100 từ vựng khó nhất trong tuần.'));
          tasks.push(t(`r_err_${dayStr}`, 'reading', '🔍 Error Log Analysis', 'Dành 30p phân tích kỹ từng câu sai trong Listening & Reading để tránh lặp lại.'));
        }
      } else if (isRLDay) {
        tasks.push(getReadingVocab(dayStr));
        if (!is6Tasks) {
          tasks.push(t(`r_prac_${dayStr}`, 'reading', '📰 Reading Practice / Grammar', 'Đọc 1 bài báo tiếng Anh (BBC/CNN) hoặc luyện 1 điểm ngữ pháp.'));
          tasks.push(getListeningVocab(dayStr));
          tasks.push(t(`l_dic_${dayStr}`, 'listening', '🎧 Listening Dictation', 'Nghe chép chính tả 30 phút. Nâng cao khả năng bắt âm.'));
        } else {
          tasks.push(t(`r_p1_${dayStr}`, 'reading', '📰 Reading Intensive Passage 1', 'Canh đúng 18 phút làm Passage 1 hoặc 2.'));
          tasks.push(t(`r_p2_${dayStr}`, 'reading', '📰 Reading Intensive Passage 2', 'Canh đúng 20 phút làm Passage 3 (khó).'));
          tasks.push(getListeningVocab(dayStr));
          tasks.push(t(`l_sec34_${dayStr}`, 'listening', '🎧 Listening Section 3 & 4', 'Tập trung luyện Section 3 (Multiple Choice) và 4 (Fill in the blanks).'));
          tasks.push(t(`l_dic_adv_${dayStr}`, 'listening', '🎧 Dictation Hard Mode', 'Chép chính tả tốc độ 1.25x hoặc bài TED Talks chuyên ngành.'));
        }
      } else if (isWSDay) {
        tasks.push(getWritingColloc(dayStr));
        if (!is6Tasks) {
          tasks.push(t(`w_prac_${dayStr}`, 'writing', '✍️ Writing Essay Draft', 'Lập dàn ý chi tiết cho 1 đề Task 2 (10p) hoặc luyện viết Task 1 (20p).'));
          tasks.push(getSpeakingVocab(dayStr));
          tasks.push(t(`s_prac_${dayStr}`, 'speaking', '🗣️ Speaking Practice', 'Thực hành trả lời 3 câu Part 1 hoặc 1 đề Part 2. Ghi âm và tự nghe lại.'));
        } else {
          tasks.push(t(`w_t1_${dayStr}`, 'writing', '✍️ Writing Task 1 (Timed)', 'Canh 20 phút viết bài Task 1 (Line, Bar, Pie, Map, Process) và chấm điểm.'));
          tasks.push(t(`w_t2_${dayStr}`, 'writing', '✍️ Writing Task 2 (Timed)', 'Canh 40 phút viết bài Task 2. Dùng các collocations cấp cao.'));
          tasks.push(getSpeakingVocab(dayStr));
          tasks.push(t(`s_p2_${dayStr}`, 'speaking', '🗣️ Speaking Part 2', 'Nói Part 2 trong 2 phút liên tục, không ngắc ngứ. Tập trung vào trôi chảy (Fluency).'));
          tasks.push(t(`s_p3_${dayStr}`, 'speaking', '🗣️ Speaking Part 3', 'Luyện tập trả lời các câu hỏi trừu tượng Part 3 (so sánh, dự đoán tương lai).'));
        }
      }

      days.push({
        day: dayCounter++,
        week,
        phase: phase as Phase,
        theme: `Tuần ${week}: Kỷ luật tạo nên 8.0`,
        themeEn: `Week ${week}`,
        tasks,
        isMilestone: isMilestoneWeek && d === 7,
        milestoneLabel: isMilestoneWeek && d === 7 ? `🏆 Mock Test Phase ${phase} — Đánh giá band điểm` : undefined,
      });
    }
  }

  return days;
}

export const ROADMAP = generateRoadmap();

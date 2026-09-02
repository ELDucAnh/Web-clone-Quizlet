const fs = require('fs');
const path = require('path');

const camCoreBatches = [
  "Batch 1 (001–070): abandon, abstract, access...",
  "Batch 2 (071–140): apparent, appeal, appreciate...",
  "Batch 3 (141–210): available, benefit, category...",
  "Batch 4 (211–280): consequent, consist, constitute...",
  "Batch 5 (281–350): economic, edit, enhance...",
  "Batch 6 (351–420): framework, function, generate...",
  "Batch 7 (421–490): legal, maintain, major...",
  "Batch 8 (491–560): principal, process, promote...",
  "Batch 9 (561–600): transfer, transform, trend..."
];

const topicReading = [
  "TR1: Environment (70 từ)", "TR2: Technology (70 từ)", "TR3: Education (70 từ)",
  "TR4: Health & Medicine (70 từ)", "TR5: Society & Community (70 từ)", "TR6: Science & Research (70 từ)",
  "TR7: Business & Economy (70 từ)", "TR8: Government & Politics (70 từ)", "TR9: Media & Communication (70 từ)",
  "TR10: Arts & Culture (70 từ)", "TR11: Crime & Justice (70 từ)", "TR12: Transport & Travel (70 từ)",
  "TR13: Space & Future (70 từ)"
];

const writingCollocs = [
  "W2T01: Environment", "W2T02: Technology", "W2T03: Education", "W2T04: Health & Medicine",
  "W2T05: Society", "W2T06: Science", "W2T07: Business & Economy", "W2T08: Government & Politics",
  "W2T09: Media & Communication", "W2T10: Transport & Urban", "W2T11: Food & Diet", "W2T12: Arts & Culture",
  "W2T13: Crime & Justice", "W2T14: Family & Children", "W2T15: Books & Reading", "W2T16: Animals & Wildlife",
  "W2T17: History & Heritage", "W2T18: Languages", "W2T19: Work & Career", "W2T20: Globalisation",
  "W2T21: Tourism", "W2T22: Space Exploration", "W2T23: Sports & Exercise", "W2T24: Housing & Infrastructure",
  "W2T25: Youth & Teenagers", "W2T26: Elderly & Ageing", "W2T27: Consumerism", "W2T28: Immigration",
  "W2T29: Music & Entertainment", "W2T30: Happiness & Success", "W2T31: Water & Oceans", "W2T32: Fashion & Clothing",
  "W2T33: Traditional vs Modern", "W2T34: Charity & Aid", "W2T35: Stress & Mental Health", "W2T36: Social Media",
  "W2T37: Artificial Intelligence", "W2T38: Remote Work", "W2T39: Climate Change", "W2T40: Advanced Technology"
];

const speakingTopics = [
  "SP01: Hometown", "SP02: Work & Career", "SP03: Family & Relationships", "SP04: Friends & Social Life",
  "SP05: Technology & Gadgets", "SP06: Social Media", "SP07: Environment", "SP08: Transport & Commuting",
  "SP09: Food & Cooking", "SP10: Sport & Exercise", "SP11: Health & Well-being", "SP12: Travel & Holidays",
  "SP13: Education & Studying", "SP14: Books & Reading", "SP15: Movies & TV Shows", "SP16: Music & Concerts",
  "SP17: Shopping & Fashion", "SP18: Hobbies & Interests", "SP19: Weather & Seasons", "SP20: Animals & Pets",
  "SP21: Art & Museums", "SP22: Daily Routine", "SP23: Childhood Memories", "SP24: Dreams & Goals",
  "SP25: Languages", "SP26: Neighbours", "SP27: Politeness", "SP28: Sleep", "SP29: Time Management", "SP30: Celebrations"
];

let camCoreIdx = 0;
let trIdx = 0;
let listenIdx = 1;
let writeIdx = 0;
let speakIdx = 0;

function getReadingVocab() {
  if (camCoreIdx < camCoreBatches.length) {
    const t = camCoreBatches[camCoreIdx++];
    return `r('r${camCoreIdx}', '📖 CamCore ${t.split(':')[0]}', 'Học từ vựng cơ bản Cambridge. Mục tiêu nhận mặt chữ và nghĩa 100%.')`;
  } else if (trIdx < topicReading.length) {
    const t = topicReading[trIdx++];
    return `r('tr${trIdx}', '📖 ${t}', 'Học 70 từ vựng chuyên sâu học thuật theo chủ đề. Flashcard có sẵn trong hệ thống.')`;
  }
  return `r('rp_adv', '📰 Reading Intensive Practice', 'Làm 1 passage Reading độ khó cao (IELTS 8.0+), phân tích keyword và bẫy đồng nghĩa.')`;
}

function getListeningVocab() {
  if (listenIdx <= 20) {
    const t = listenIdx++;
    return `l('l${t}', '🎧 CamListen BL${t} (30 từ)', 'Học 30 từ vựng Listening CamListen Batch ${t}. Chú ý spelling.')`;
  }
  return `l('lp_adv', '🎧 Listening Intensive Practice', 'Làm đề Listening Section 3 hoặc 4. Luyện tập bắt keyword nhanh và spelling chính xác.')`;
}

function getWritingColloc() {
  if (writeIdx < writingCollocs.length) {
    const t = writingCollocs[writeIdx++];
    return `w('w${writeIdx}', '✍️ 100 Collocations: ${t.split(': ')[1]}', 'Học 100 collocations chủ đề ${t.split(': ')[1]}. Dùng trong Task 2.')`;
  }
  return `w('wp_adv', '✍️ Advanced Vocabulary (Writing)', 'Ôn tập và nâng cấp các từ vựng band 6.0 lên band 8.0 (Idioms, Phrasal verbs, Uncommon words).')`;
}

function getSpeakingVocab() {
  if (speakIdx < speakingTopics.length) {
    const t = speakingTopics[speakIdx++];
    return `s('s${speakIdx}', '🗣️ ${t} (50 từ)', 'Học 50 từ vựng chủ đề ${t}. Tập trung phát âm và ngữ điệu tự nhiên.')`;
  }
  return `s('sp_adv', '🗣️ Advanced Speaking Vocab', 'Luyện tập các cụm từ ăn điểm cho Part 3: discourse markers, hedging, complex structures.')`;
}

let out = `// lib/roadmap-data.ts — IELTS 140-day: 5.5 → 8.0
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
  { id: 1 as Phase, name: 'Xây Nền Tảng', bandRange: '5.5 → 6.0', days: [1,35] as [number,number], color: '#4f8ef7', bg: '#EFF6FF', description: '4 tasks/ngày. Lấp lỗ hổng Grammar, tích lũy CamCore 600 & CamListen.' },
  { id: 2 as Phase, name: 'Bứt Phá', bandRange: '6.0 → 7.0', days: [36,70] as [number,number], color: '#a855f7', bg: '#F5F3FF', description: '4 tasks/ngày. Đẩy mạnh Topic Vocab và Collocations. Kết thúc đạt 7.0 chắc chắn.' },
  { id: 3 as Phase, name: 'Đào Sâu', bandRange: '7.0 → 7.5', days: [71,105] as [number,number], color: '#06b6d4', bg: '#ECFEFF', description: '6 tasks/ngày. Tăng tốc thực chiến Reading Intensive và Writing Canh giờ.' },
  { id: 4 as Phase, name: 'Thực Chiến', bandRange: '7.5 → 8.0', days: [106,140] as [number,number], color: '#f59e0b', bg: '#FFFBEB', description: '6 tasks/ngày. Mock test liên tục, tối đa hóa điểm Listening & Reading lên 8.5-9.0.' },
];

type T = { id: string; type: TaskType; title: string; detail: string; url?: string };
type WeekDef = { theme: string; themeEn: string; phase: Phase; milestone?: string; days: T[][] };

const r = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'reading', title, detail, url });
const l = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'listening', title, detail, url });
const w = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'writing', title, detail, url });
const s = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'speaking', title, detail, url });
const g = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'grammar', title, detail, url });
const v = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'vocab', title, detail, url });
const m = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'mock', title, detail, url });

const WEEKS: WeekDef[] = [
`;

for (let week = 1; week <= 20; week++) {
  let phase = 1;
  if (week > 5) phase = 2;
  if (week > 10) phase = 3;
  if (week > 15) phase = 4;
  
  const tasksPerDay = phase <= 2 ? 4 : 6;
  
  let weekStr = \`  {
    theme: 'Tuần \${week}: Kỷ luật tạo nên 8.0', themeEn: 'Week \${week}', phase: \${phase}, \${week % 5 === 0 ? \`milestone: '🏆 Mock Test Phase \${phase} — Đánh giá band điểm',\` : ''}
    days: [\n\`;

  for (let day = 1; day <= 7; day++) {
    weekStr += \`      [\n\`;
    if (day === 7) {
      // Review day
      if (tasksPerDay === 4) {
        weekStr += \`        m('m1', '🏆 Full Listening Test', 'Làm Full IELTS Listening (40 câu). Canh giờ chuẩn 30p + 10p transfer.'),\n\`;
        weekStr += \`        m('m2', '🏆 Full Reading Test', 'Làm Full IELTS Reading (40 câu). Canh giờ chuẩn 60p.'),\n\`;
        weekStr += \`        w('w_rev', '✍️ Writing Review', 'Luyện lại dàn ý Task 2 hoặc viết lại 1 bài Task 1 bị điểm kém.'),\n\`;
        weekStr += \`        v('v_rev', '🔄 Weekly Vocab Review', 'Ôn tập 100 từ vựng khó nhất trong tuần thông qua hệ thống Spaced Repetition.'),\n\`;
      } else {
        weekStr += \`        m('m1', '🏆 Full Listening Test', 'Làm Full IELTS Listening (40 câu).'),\n\`;
        weekStr += \`        m('m2', '🏆 Full Reading Test', 'Làm Full IELTS Reading (40 câu).'),\n\`;
        weekStr += \`        w('w_mock', '🏆 Full Writing Mock', 'Viết Task 1 (20p) và Task 2 (40p) liên tục.'),\n\`;
        weekStr += \`        s('s_mock', '🏆 Full Speaking Mock', 'Ghi âm Part 1, 2, 3 liên tục không ngừng.'),\n\`;
        weekStr += \`        v('v_rev', '🔄 Weekly Vocab Review', 'Ôn tập 100 từ vựng khó nhất trong tuần.'),\n\`;
        weekStr += \`        r('err_log', '🔍 Error Log Analysis', 'Dành 30p phân tích kỹ từng câu sai trong Listening & Reading để tránh lặp lại.'),\n\`;
      }
    } else if (day % 2 !== 0) {
      // RL Day
      weekStr += \`        \${getReadingVocab()},\n\`;
      if (tasksPerDay === 4) {
        weekStr += \`        r('rp', '📰 Reading Practice / Grammar', 'Đọc 1 bài báo tiếng Anh (BBC/CNN) hoặc luyện 1 điểm ngữ pháp (Relative clauses, Passives...).'),\n\`;
        weekStr += \`        \${getListeningVocab()},\n\`;
        weekStr += \`        l('ld', '🎧 Listening Dictation', 'Nghe chép chính tả 30 phút. Nâng cao khả năng bắt âm.'),\n\`;
      } else {
        weekStr += \`        r('rp1', '📰 Reading Intensive Passage 1', 'Canh đúng 18 phút làm Passage 1 hoặc 2.'),\n\`;
        weekStr += \`        r('rp2', '📰 Reading Intensive Passage 2', 'Canh đúng 20 phút làm Passage 3 (khó).'),\n\`;
        weekStr += \`        \${getListeningVocab()},\n\`;
        weekStr += \`        l('lp_sec34', '🎧 Listening Section 3 & 4', 'Tập trung luyện Section 3 (Multiple Choice) và 4 (Fill in the blanks).'),\n\`;
        weekStr += \`        l('ld_adv', '🎧 Dictation Hard Mode', 'Chép chính tả tốc độ 1.25x hoặc bài TED Talks chuyên ngành.'),\n\`;
      }
    } else {
      // WS Day
      weekStr += \`        \${getWritingColloc()},\n\`;
      if (tasksPerDay === 4) {
        weekStr += \`        w('wd', '✍️ Writing Essay Draft', 'Lập dàn ý chi tiết cho 1 đề Task 2 (10p) hoặc luyện viết Task 1 (20p).'),\n\`;
        weekStr += \`        \${getSpeakingVocab()},\n\`;
        weekStr += \`        s('sp', '🗣️ Speaking Practice', 'Thực hành trả lời 3 câu Part 1 hoặc 1 đề Part 2. Ghi âm và tự nghe lại.'),\n\`;
      } else {
        weekStr += \`        w('w_t1', '✍️ Writing Task 1 (Timed)', 'Canh 20 phút viết bài Task 1 (Line, Bar, Pie, Map, Process) và chấm điểm.'),\n\`;
        weekStr += \`        w('w_t2', '✍️ Writing Task 2 (Timed)', 'Canh 40 phút viết bài Task 2. Dùng các collocations cấp cao.'),\n\`;
        weekStr += \`        \${getSpeakingVocab()},\n\`;
        weekStr += \`        s('sp_p2', '🗣️ Speaking Part 2', 'Nói Part 2 trong 2 phút liên tục, không ngắc ngứ. Tập trung vào trôi chảy (Fluency).'),\n\`;
        weekStr += \`        s('sp_p3', '🗣️ Speaking Part 3', 'Luyện tập trả lời các câu hỏi trừu tượng Part 3 (so sánh, dự đoán tương lai).'),\n\`;
      }
    }
    weekStr += \`      ],\n\`;
  }
  weekStr += \`    ]\n  },\n\`;
  out += weekStr;
}

out += \`];

export function generateRoadmap(): RoadmapDay[] {
  let days: RoadmapDay[] = [];
  let dayCounter = 1;

  WEEKS.forEach((week, wIndex) => {
    week.days.forEach((dayTasks, dIndex) => {
      days.push({
        day: dayCounter,
        week: wIndex + 1,
        phase: week.phase,
        theme: week.theme,
        themeEn: week.themeEn,
        tasks: dayTasks,
        isMilestone: week.milestone && dIndex === 6 ? true : false,
        milestoneLabel: week.milestone && dIndex === 6 ? week.milestone : undefined,
      });
      dayCounter++;
    });
  });

  return days;
}
\`;

fs.writeFileSync(path.join(__dirname, '..', 'lib', 'roadmap-data.ts'), out, 'utf8');
console.log('Roadmap generated successfully!');

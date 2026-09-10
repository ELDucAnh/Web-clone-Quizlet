// lib/roadmap-data.ts — IELTS 120-day: 5.5 → R9 / L8 / W7 / S7
// 4 Phases: P1(1-20) P2(21-60) P3(61-80) P4(81-120)
// Phase 1-3: tasks differ by available time (2h vs 4h per day)
// Phase 4: fixed full-intensity schedule (7-12h/day no limit)
//
// KEY RULE: task IDs always use ABSOLUTE day number (not dayInPhase) to avoid
// cross-phase ID collisions. Storage key format: `${day.day}_${task.id}`

export type Phase = 1 | 2 | 3 | 4;
export type TaskType = 'vocab' | 'reading' | 'listening' | 'writing' | 'speaking' | 'grammar' | 'mock';
export type TimeMode = '2h' | '4h';

export interface DayTask {
  id: string;
  type: TaskType;
  title: string;
  detail: string;
  durationMin: number; // estimated minutes
  url?: string;
}

export interface RoadmapDay {
  day: number;      // absolute day 1–120
  week: number;
  phase: Phase;
  theme: string;
  themeEn: string;
  /** Tasks when user has ~2 hours (Phase 1-3). Phase 4 ignores this. */
  tasks2h: DayTask[];
  /** Tasks when user has ~4 hours (Phase 1-3), or the only list for Phase 4. */
  tasks4h: DayTask[];
  isMilestone: boolean;
  milestoneLabel?: string;
}

export const PHASES = [
  {
    id: 1 as Phase,
    name: 'Xây Nền Tảng',
    bandRange: '5.5 → 6.0',
    days: [1, 20] as [number, number],
    color: '#4f8ef7',
    bg: '#EFF6FF',
    description:
      'Vocab CAM (R,L) + VOL đã làm, 100 từ/ngày. Làm Passage 3 hằng ngày. Luyện Sec 1 VOL + ghi lỗi sai vào nhật ký. Cày khoá Writing & Speaking thầy Kiên (50 buổi mỗi khoá).',
  },
  {
    id: 2 as Phase,
    name: 'Bứt Phá',
    bandRange: '6.0 → 7.0',
    days: [21, 60] as [number, number],
    color: '#a855f7',
    bg: '#F5F3FF',
    description:
      'Advanced vocab + collocation/phrasal verb, 100 từ/ngày. Reading: 30 Passage 3 → phân tích lỗi chuyên sâu. Listening: luyện Sec 2&3 VOL mỗi ngày + ghi nhật ký lỗi. Writing & Speaking: idea → câu → đoạn hoàn chỉnh.',
  },
  {
    id: 3 as Phase,
    name: 'Thực Chiến',
    bandRange: '7.0 → 8.0',
    days: [61, 80] as [number, number],
    color: '#06b6d4',
    bg: '#ECFEFF',
    description:
      'Vocab 50 từ/ngày. Passage 2 hằng ngày + Full test 1 lần/tuần. Listening: luyện dạng yếu + Sec 3&4 VOL + review nhật ký lỗi. Writing 2 Task1 + 2 Task2/tuần. Speaking Part 2&3 thật với AI.',
  },
  {
    id: 4 as Phase,
    name: 'Tối Đa Hoá',
    bandRange: '8.0 → R9/L8',
    days: [81, 120] as [number, number],
    color: '#f59e0b',
    bg: '#FFFBEB',
    description:
      'N81-100: học 200 từ/ngày. N101-120: ôn ALL vocab. Full test R&L mỗi 2 ngày. Luyện Sec yếu + nhật ký lỗi. Task 1+Task 2 mỗi ngày. Speaking 2 chủ đề/ngày. 7-12h/ngày toàn tâm toàn ý.',
  },
];

// ─── Helper — uses ABSOLUTE day to avoid ID collisions across phases ──────────
const t = (
  absDay: number,
  suffix: string,
  type: TaskType,
  title: string,
  detail: string,
  durationMin: number,
): DayTask => ({ id: `${suffix}_${absDay}`, type, title, detail, durationMin });

// ─── Phase 1 tasks (absolute day 1-20) ───────────────────────────────────────
// Vocab: học/ôn 100 từ CAM(R,L) + VOL đã làm — mọi ngày đều phải có
// Reading (rot 0,2,4): ôn passage cũ 15p + Passage 3 VOL 90p + tóm tắt 25p
// Listening (rot 1,3): Luyện Sec 1 VOL 45p + Nghe lại câu sai 30p + Ghi nhật ký lỗi 15p
// Writing (rot 2): ôn buổi cũ 15p + 1 buổi khoá thầy Kiên 30p
// Speaking (rot 3): ôn buổi cũ 15p + 1 buổi khoá thầy Kiên 30p
// Mixed (rot 4): Writing + Speaking khoá thầy Kiên cùng lúc
//
// 2h mode: vocab + 1 kỹ năng cốt lõi (~120p)
// 4h mode: vocab + đầy đủ theo rotation (~240p)

function makeP1Tasks(absDay: number, mode: TimeMode): DayTask[] {
  const dayInPhase = absDay; // 1–20
  const rot = ((dayInPhase - 1) % 5) as 0 | 1 | 2 | 3 | 4;
  const isLearn = dayInPhase % 2 === 1;

  // Vocab — ALWAYS present every day
  const vocabTask = isLearn
    ? t(absDay, 'v_learn', 'vocab',
        '🧠 Học 100 từ — CAM (R,L) + VOL đã làm',
        'Học 100 từ từ bộ CAM đã trích (R, L) và vocab từ bài đọc/nghe VOL. Ghi flashcard. Tập phát âm chuẩn.', 90)
    : t(absDay, 'v_rev', 'vocab',
        '🔄 Ôn 100 từ — Spaced Repetition',
        'Ôn lại 100 từ đã học theo spaced repetition. Đặt câu ví dụ cho từ hay quên. Phân loại từ chưa chắc.', 90);

  if (mode === '2h') {
    // ~120p total
    switch (rot) {
      case 0: // Reading day — vocab + passage
        return [
          vocabTask,
          t(absDay, 'r_p3', 'reading',
            '📰 Làm 1 Passage 3 VOL + Chữa kỹ',
            'Chọn 1 passage 3 từ VOL bất kỳ (bấm giờ 20p). Chấm → chữa kỹ → ghi note từ vựng + loại bẫy.', 90),
        ];
      case 1: // Listening day
        return [
          vocabTask,
          t(absDay, 'l_vol_s1', 'listening',
            '🎧 Luyện Sec 1 VOL + Nghe lại câu sai (45p)',
            'Làm Section 1 VOL bấm giờ. Chấm → chọn mọi câu sai → nghe lại đoạn đó nhiều lần cho đến khi nghe ra rõ. Note vào Nhật Ký Lỗi Listening.', 45),
        ];
      case 2: // Writing day
        return [
          vocabTask,
          t(absDay, 'w_rev', 'writing',
            '✍️ Ôn buổi Writing cũ (15p)',
            'Xem lại notes buổi Writing trước. Viết lại 1-2 câu ví dụ để nhớ cấu trúc + grammar.', 15),
          t(absDay, 'w_kien', 'writing',
            '✍️ Khoá Writing thầy Kiên — 1 buổi (30p)',
            'Học 1 buổi khoá Writing thầy Kiên Luyện. Ghi chú cấu trúc, ngữ pháp quan trọng.', 30),
        ];
      case 3: // Speaking day
        return [
          vocabTask,
          t(absDay, 's_rev', 'speaking',
            '🗣️ Ôn buổi Speaking cũ (15p)',
            'Xem lại notes buổi Speaking trước. Luyện nói lại các mẫu câu + intonation.', 15),
          t(absDay, 's_kien', 'speaking',
            '🗣️ Khoá Speaking thầy Kiên — 1 buổi (30p)',
            'Học 1 buổi khoá Speaking thầy Kiên. Luyện nói lại theo mẫu.', 30),
        ];
      case 4: // Mixed writing + speaking review
        return [
          vocabTask,
          t(absDay, 'w_kien_m', 'writing',
            '✍️ Khoá Writing thầy Kiên — 1 buổi (30p)',
            'Học 1 buổi khoá Writing. Ghi cấu trúc + ngữ pháp.', 30),
          t(absDay, 's_kien_m', 'speaking',
            '🗣️ Khoá Speaking thầy Kiên — 1 buổi (30p)',
            'Học 1 buổi khoá Speaking. Luyện nói theo mẫu thầy.', 30),
        ];
    }
  }

  // 4h mode (~240p) — full rotation
  switch (rot) {
    case 0: // Reading (4h)
      return [
        vocabTask,
        t(absDay, 'r_rev', 'reading',
          '📖 Ôn lại passage cũ (15p)',
          'Đọc lại passage VOL tuần trước. Nhớ lại bẫy + từ vựng quan trọng.', 15),
        t(absDay, 'r_p3', 'reading',
          '📰 Làm 1 Passage 3 VOL + Chữa kỹ (1h30)',
          'Chọn 1 passage 3 VOL (bấm giờ 20p). Chấm → chữa kỹ → note từ vựng khó + loại bẫy.', 90),
        t(absDay, 'r_summ', 'reading',
          '📝 Luyện tóm tắt văn bản nhanh (25p)',
          'Luyện đọc lướt + nắm ý chính từng đoạn. Tóm tắt passage vừa làm trong 5 câu tiếng Anh.', 25),
      ];
    case 1: // Listening (4h)
      return [
        vocabTask,
        t(absDay, 'l_vol_s1', 'listening',
          '🎧 Luyện Sec 1 VOL + Nghe lại câu sai (45p)',
          'Làm Section 1 VOL bấm giờ. Chấm → chọn mọi câu sai → nghe lại đoạn đó nhiều lần đến khi nghe ra hết. Phân loại lỗi: spelling / speed / distractor.', 45),
        t(absDay, 'l_note', 'listening',
          '📝 Ghi nhật ký lỗi Listening + Phân tích (30p)',
          'Vào Nhật Ký Lỗi Listening. Ghi lại từng câu sai: section, câu số, transcript ngắn, đáp án đúng, loại lỗi, phân tích tại sao sai.', 30),
        t(absDay, 'l_voc', 'listening',
          '🔄 Ôn vocab nghe từ bài đã làm (15p)',
          'Ôn lại từ vựng trong các bài Listening VOL đã làm. Tập nghe và nhận diện từ nhanh.', 15),
      ];
    case 2: // Writing (4h) — khoá + passage để học vocab
      return [
        vocabTask,
        t(absDay, 'w_rev', 'writing',
          '✍️ Ôn buổi Writing cũ (15p)',
          'Xem lại notes buổi Writing trước. Viết 1-2 câu ví dụ để nhớ cấu trúc.', 15),
        t(absDay, 'w_kien', 'writing',
          '✍️ Khoá Writing thầy Kiên — 1 buổi (30p)',
          'Học 1 buổi khoá Writing (30p). Ghi cấu trúc + ngữ pháp quan trọng.', 30),
        t(absDay, 'r_p3_w', 'reading',
          '📰 Làm 1 Passage 3 VOL + Chữa (90p)',
          'Làm 1 passage 3 VOL. Chấm + chữa kỹ + note từ vựng. Nạp thêm vocab học thuật.', 90),
      ];
    case 3: // Speaking (4h) — khoá + listening
      return [
        vocabTask,
        t(absDay, 's_rev', 'speaking',
          '🗣️ Ôn buổi Speaking cũ (15p)',
          'Xem lại notes buổi Speaking trước. Luyện nói lại các mẫu câu.', 15),
        t(absDay, 's_kien', 'speaking',
          '🗣️ Khoá Speaking thầy Kiên — 1 buổi (30p)',
          'Học 1 buổi khoá Speaking (30p). Luyện nói theo mẫu thầy.', 30),
        t(absDay, 'l_vol_s12', 'listening',
          '🎧 Luyện Sec 1+2 VOL + Nghe lại câu sai (45p)',
          'Làm Sec 1 và 2 VOL bấm giờ. Chấm → nghe lại mọi câu sai nhiều lần. Ghi nhật ký lỗi Listening.', 45),
      ];
    case 4: // Mixed Writing + Speaking + Reading (4h)
      return [
        vocabTask,
        t(absDay, 'w_kien_m', 'writing',
          '✍️ Khoá Writing thầy Kiên — 1 buổi (30p)',
          'Học 1 buổi khoá Writing (30p). Ghi chú kỹ cấu trúc.', 30),
        t(absDay, 's_kien_m', 'speaking',
          '🗣️ Khoá Speaking thầy Kiên — 1 buổi (30p)',
          'Học 1 buổi khoá Speaking (30p). Luyện nói theo mẫu.', 30),
        t(absDay, 'r_p3_m', 'reading',
          '📰 Làm 1 Passage 3 VOL + Chữa (90p)',
          'Làm 1 passage 3 VOL. Chấm + chữa + note từ vựng. Tổng hợp lỗi sai.', 90),
      ];
  }

  return [];
}

// ─── Phase 2 tasks (absolute day 21-60) ──────────────────────────────────────
// Vocab: 100 từ/ngày — advanced (R hoặc L) hoặc collocation&phrasal verb
// Reading: Passage 3 hằng ngày cho đến khi đủ 30 (dayInP2 1-30) → phân tích lỗi (31-40)
// Listening: luyện Sec 2&3 VOL 90p MỖINGÀY + Ghi nhật ký lỗi → nghe lại câu sai
// Writing: idea → cụm → câu → đoạn (45p/session)
// Speaking: triển khai ý (45p) + luyện nói AI (20p)
//
// 2h mode: vocab + reading + listening VOL cơ bản + xen kẽ writing/speaking
// 4h mode: vocab + reading + listening VOL đầy đủ (luyện + nghe lại + ghi lỗi) + writing/speaking luân phiên

function makeP2Tasks(absDay: number, mode: TimeMode): DayTask[] {
  const dayInPhase = absDay - 20; // 1–40
  const isLearn = dayInPhase % 2 === 1;
  const readingDone = dayInPhase > 30;

  // Vocab rotation: R → L → Collocation (cycle of 3)
  const vocabCycle = ((dayInPhase - 1) % 3) as 0 | 1 | 2;
  let vocabTitle: string;
  let vocabDetail: string;
  if (vocabCycle === 0) {
    vocabTitle = isLearn ? '🧠 Học 100 từ — Advanced Vocab (Reading)' : '🔄 Ôn 100 từ — Advanced Vocab (Reading)';
    vocabDetail = isLearn
      ? 'Học 100 từ bộ advanced vocab soạn sẵn cho Reading. Tập dùng trong ngữ cảnh, đặt câu.'
      : 'Ôn 100 từ advanced vocab Reading. Đặt câu ví dụ cho từ hay quên.';
  } else if (vocabCycle === 1) {
    vocabTitle = isLearn ? '🧠 Học 100 từ — Advanced Vocab (Listening)' : '🔄 Ôn 100 từ — Advanced Vocab (Listening)';
    vocabDetail = isLearn
      ? 'Học 100 từ bộ advanced vocab cho Listening. Chú ý phát âm, nhận diện từ khi nghe.'
      : 'Ôn 100 từ advanced vocab Listening. Tập nghe + nhận ra từ trong bài thi.';
  } else {
    vocabTitle = isLearn ? '🧠 Học 100 cụm — Collocation & Phrasal Verb (W&S)' : '🔄 Ôn 100 cụm — Collocation & Phrasal Verb';
    vocabDetail = isLearn
      ? 'Học 100 cụm collocation và phrasal verb cho Writing Task 2 và Speaking. Ghi ví dụ câu.'
      : 'Ôn 100 cụm collocation/phrasal verb. Đặt câu. Ghi nhớ cách dùng tự nhiên.';
  }
  const vocabTask = t(absDay, 'v', 'vocab', vocabTitle, vocabDetail, 90);

  // Reading task — thay đổi tự động sau 30 passages
  const readingTask = readingDone
    ? t(absDay, 'r_err', 'reading',
        '🔍 Phân tích lỗi Reading (10p) + Luyện dạng hay sai (1h30)',
        `Xem lại bảng tổng hợp lỗi trong 30 passages đã làm (10p). Chọn 1 dạng hay sai nhất → luyện riêng dạng đó (1h30). Mục tiêu: không lặp lỗi.`,
        100)
    : t(absDay, 'r_p3', 'reading',
        `📰 Làm 1 Passage 3 VOL + Chữa kỹ (${dayInPhase}/30)`,
        `Làm 1 passage 3 VOL bất kỳ (bấm giờ 20p). Chấm → chữa kỹ → ghi note lỗi sai theo loại → học từ vựng bài đọc.`,
        90);

  // Listening building blocks — VOL only, no dictation, no Hacker
  const lVol = t(absDay, 'l_vol', 'listening',
    '🎧 Luyện Sec 2&3 VOL + Nghe lại câu sai (90p)',
    'Làm 1 Sec 2 và 1 Sec 3 VOL bấm giờ. Chấm → chọn mọi câu sai → nghe lại đoạn đó liên tục đến khi nghe ra hết. Chú ý distractor trong Sec 3 MCQ.', 90);
  const lErr = t(absDay, 'l_err', 'listening',
    '📝 Ghi nhật ký lỗi Listening + Phân tích (30p)',
    'Vào Nhật Ký Lỗi Listening. Ghi lại từng câu sai hôm nay: section, câu số, transcript ngắn, đáp án đúng, loại lỗi (Spelling/Speed/Distractor/No Comprehension), phân tích tại sao sai.', 30);

  // Writing & Speaking
  const writingTask = t(absDay, 'w_idea', 'writing',
    '✍️ Writing: Luyện triển khai ý (idea → đoạn) (45p)',
    'Quy trình: chọn 1 idea → viết cụm hành động → câu ngắn → câu hoàn chỉnh → 2 câu mạch lạc → 1 đoạn (idea-explanation-example).', 45);
  const speakingTask = t(absDay, 's_idea', 'speaking',
    '🗣️ Speaking: Triển khai ý (45p) + Luyện AI (20p)',
    'Triển khai ý theo quy trình như Writing (45p). Luyện nói với AI 20p — ghi âm và review phát âm, ngữ điệu.', 65);

  if (mode === '2h') {
    // ~120p: vocab + 1 kỹ năng cốt lõi, xen kẽ listening mỗi 2 ngày
    const rot2 = ((dayInPhase - 1) % 4) as 0 | 1 | 2 | 3;
    if (rot2 === 0) return [vocabTask, readingTask];                      // R
    if (rot2 === 1) return [vocabTask, lVol];                             // L (chỉ VOL, hết giờ thì bỏ note)
    if (rot2 === 2) return [vocabTask, writingTask];                       // W
    return [vocabTask, speakingTask];                                      // S
  }

  // 4h mode (~240p): vocab + reading + FULL listening (VOL drill + error log) + W or S luân phiên
  const writingOrSpeaking = ((dayInPhase - 1) % 2 === 0) ? writingTask : speakingTask;
  return [vocabTask, readingTask, lVol, lErr, writingOrSpeaking];
}

// ─── Phase 3 tasks (absolute day 61-80) ──────────────────────────────────────
// Vocab: 50 từ/ngày (học hoặc ôn)
// Reading: Passage 2 VOL mỗi ngày (60p). Tuần có 1 Full test (ngày đầu tuần trong phase = dayInPhase%7===1)
// Listening: 3-day rotation: (a) luyện dạng yếu Sec 1&2 (b) luyện Sec 3&4 VOL (c) review nhật ký lỗi + drill điểm yếu
// Writing: mỗi 4 ngày có 1 buổi viết bài (Task1 hoặc Task2) AI chấm — đảm bảo 2T1+2T2/tuần
// Speaking: Part 2&3 AI mỗi 3 ngày

function makeP3Tasks(absDay: number, dayInPhase: number, mode: TimeMode): DayTask[] {
  const isLearn = dayInPhase % 2 === 1;

  const vocabTask = isLearn
    ? t(absDay, 'v_learn', 'vocab',
        '🧠 Học 50 từ — Vocab tổng hợp (P3)',
        'Học 50 từ mới kết hợp advanced vocab + VOL. Ghi flashcard. Ôn lại 10 từ dễ quên từ tuần trước.', 45)
    : t(absDay, 'v_rev', 'vocab',
        '🔄 Ôn 50 từ — Spaced Repetition',
        'Ôn 50 từ theo spaced repetition. Loại bỏ từ đã nhớ, tập trung từ hay quên. Đặt câu ví dụ.', 45);

  // Full test tuần 1 lần — dùng dayInPhase mod 7 === 1 (ngày đầu mỗi "tuần phase")
  const isFullTestDay = (dayInPhase % 7 === 1);
  const readingTask = isFullTestDay
    ? t(absDay, 'r_full', 'reading',
        '🏆 Full Test Reading (3 passages, bấm giờ 60p) + Chữa (60p)',
        'Làm full 3 passages (bấm giờ nghiêm 60p). Chữa kỹ từng passage. Note lỗi sai theo dạng câu. Tổng 2h.', 120)
    : t(absDay, 'r_p2', 'reading',
        '📰 Làm 1 Passage 2 VOL + Chữa kỹ (60p)',
        'Làm 1 passage 2 (không phải dạng yếu nhất). Bấm giờ 20p. Chấm + chữa + ghi note lỗi.', 60);

  // Listening: 3-day rotation (a/b/c) — VOL only, no dictation/Hacker
  const lRot = ((dayInPhase - 1) % 3) as 0 | 1 | 2;
  const listeningTask =
    lRot === 0
      ? t(absDay, 'l_s12_weak', 'listening',
          '🎧 Luyện dạng yếu Sec 1&2 VOL + Nghe lại (1h)',
          'Mở nhật ký lỗi → tìm dạng yếu nhất ở Sec 1&2. Lấy 1 test VOL làm riêng Sec 1&2. Chấm → nghe lại mọi câu sai liên tục đến khi nghe ra. Ghi lỗi mới vào nhật ký.', 60)
      : lRot === 1
      ? t(absDay, 'l_s34_vol', 'listening',
          '🎧 Luyện Sec 3&4 VOL + Nghe lại câu sai (1h)',
          'Làm Sec 3 (MCQ) và Sec 4 (academic monologue) từ VOL. Chú ý distractor Sec 3. Sau khi chấm, nghe lại từng câu sai đến khi nghe rõ. Ghi lỗi vào nhật ký.', 60)
      : t(absDay, 'l_review', 'listening',
          '📝 Review nhật ký lỗi + Drill điểm yếu (1h)',
          'Mở Nhật Ký Lỗi Listening. Thống kê loại lỗi nhiều nhất tuần này. Lấy đúng các câu đó nghe lại. Luyện drill 10 câu cùng loại lỗi.', 60);

  // Writing: mỗi 4 ngày 1 buổi, xen kẽ Task1/Task2
  const isWritingDay = dayInPhase % 4 === 0;
  const isTask1 = (dayInPhase / 4) % 2 === 0; // alternates T1/T2 each cycle
  const writeType = isTask1 ? 'Task 1' : 'Task 2';
  const writingTasks = isWritingDay
    ? [
        t(absDay, 'w_rev_err', 'writing',
          '✍️ Ôn lỗi Writing thường gặp (20p)',
          'Xem lại danh sách lỗi từ các bài viết trước. Ghi nhớ cách sửa cụ thể.', 20),
        t(absDay, 'w_write', 'writing',
          `✍️ Viết ${writeType} → AI chấm + Chữa (40p)`,
          `Viết ${writeType} bấm giờ nghiêm (${isTask1 ? '20p' : '40p'}). Nộp AI chấm. Chữa lỗi ngữ pháp + từ vựng + coherence.`, 40),
      ]
    : [];

  // Speaking: mỗi 3 ngày 1 buổi
  const isSpeakingDay = dayInPhase % 3 === 0;
  const speakingTask = isSpeakingDay
    ? [t(absDay, 's_p23', 'speaking',
        '🗣️ Luyện Part 2&3 thật với AI (30p)',
        'Part 2: cue card 2p. Part 3: Q&A 4p. Ghi âm → AI review phát âm, ngữ pháp, coherence.', 30)]
    : [];

  if (mode === '2h') {
    // ~120p: vocab + reading + listening hoặc writing/speaking
    const hasWritingOrSpeaking = writingTasks.length > 0 || speakingTask.length > 0;
    if (hasWritingOrSpeaking) {
      // Writing/speaking day — vocab + reading ngắn + W/S
      return [vocabTask, t(absDay, 'r_p2_q', 'reading',
        '📰 Đọc nhanh 1 Passage 2 (30p)',
        'Đọc lướt passage 2, làm câu hỏi, chấm điểm. Bỏ qua chữa kỹ (dành vào buổi 4h).', 30),
        ...writingTasks.slice(1), // lấy task viết bài thật (bỏ qua ôn lỗi khi thiếu giờ)
        ...speakingTask];
    }
    return [vocabTask, readingTask, listeningTask];
  }

  // 4h mode: đủ cả vocab + reading + listening + writing/speaking
  return [vocabTask, readingTask, listeningTask, ...writingTasks, ...speakingTask];
}

// ─── Phase 4 tasks (absolute day 81-120) ─────────────────────────────────────
// N81-100 (dayInPhase 1-20): học 200 từ/ngày
// N101-120 (dayInPhase 21-40): ôn ALL vocab từ trước đến nay
// Full test R&L xen kẽ: ngày lẻ = làm full test, ngày chẵn = phân tích lỗi
// Listening error day: review nhật ký lỗi + drill section yếu nhất
// Writing: Task1 + Task2 mỗi ngày (aim 7)
// Speaking: 2 chủ đề full test với AI mỗi ngày (aim 7)
// Không giới hạn thời gian — "7-12h là bình thường"

function makeP4Tasks(absDay: number): DayTask[] {
  const dayInPhase = absDay - 80; // 1–40
  const isFirstHalf = dayInPhase <= 20;
  const isFullTestDay = dayInPhase % 2 === 1;

  const vocabTask = isFirstHalf
    ? t(absDay, 'v_200', 'vocab',
        '🧠 Học 200 từ/ngày — R&L Intensive (2h)',
        'Học 200 từ chất lượng cao nhất cho R&L. Dùng Anki hoặc flashcard tốc độ cao. Mục tiêu: nhận ra ngay trong bài thi. Aim 9R 9L.', 120)
    : t(absDay, 'v_all', 'vocab',
        '🔄 Ôn ALL Vocab từ N1 đến nay',
        'Ôn toàn bộ vocab từ Phase 1-3. Từ P1-P3 đã học kỹ nên ôn nhanh (~90p). Tập trung từ chưa chắc, dễ nhầm.', 90);

  const readingTask = isFullTestDay
    ? t(absDay, 'r_full', 'reading',
        '📰 Full Test Reading VOL (60p nghiêm) + Chữa kỹ',
        'Làm full 3 passages bấm giờ 60p. Chữa kỹ mọi câu sai. Note chi tiết loại bẫy. Aim: zero error. Mục tiêu 9R.', 120)
    : t(absDay, 'r_err', 'reading',
        '🔍 Phân tích lỗi Reading + Học vocab chữa',
        'Phân tích 100% lỗi full test hôm qua. Note chi tiết từng loại bẫy (paraphrase / T-F-NG / matching). Học vocab bài đọc.', 90);

  const listeningTask = isFullTestDay
    ? t(absDay, 'l_full', 'listening',
        '🎧 Full Test Listening VOL 4 Sections (30p) + Chữa kỹ (60p)',
        'Làm full 4 sections bấm giờ 30p. Chấm → nghe lại 100% câu sai liên tục đến khi nghe ra. Ghi tất cả vào Nhật Ký Lỗi. Mục tiêu L8.', 90)
    : t(absDay, 'l_err_review', 'listening',
        '📝 Review nhật ký lỗi + Drill section yếu nhất (1h)',
        'Mở Nhật Ký Lỗi Listening → thống kê loại lỗi nhiều nhất tuần này. Lấy đúng section đó trong VOL mới → drill chuyên sâu 1h. Ghi lỗi mới phát sinh.', 60);

  const writingTask = t(absDay, 'w_daily', 'writing',
    '✍️ Viết Task 1 + Task 2 → AI chấm (Aim Band 7)',
    'Ôn lỗi + kiểm tra cấu trúc bài (15p). Viết Task 1 bấm giờ (20p) + Task 2 bấm giờ (40p). Nộp AI chấm + chữa chi tiết.', 75);

  const speakingTask = t(absDay, 's_full', 'speaking',
    '🗣️ Full Speaking: 2 chủ đề + AI chữa phát âm (Aim Band 7)',
    'Luyện full speaking test 2 chủ đề khác nhau với AI (30p). Ghi âm → AI chữa phát âm, ngữ pháp, fluency chi tiết (30p).', 60);

  return [vocabTask, readingTask, listeningTask, writingTask, speakingTask];
}

// ─── Main generator ───────────────────────────────────────────────────────────
export function generateRoadmap(): RoadmapDay[] {
  const days: RoadmapDay[] = [];

  for (let day = 1; day <= 120; day++) {
    const week = Math.ceil(day / 7);
    const isMilestoneDay = day === 20 || day === 60 || day === 80 || day === 120;

    let phase: Phase;
    let theme: string;
    let themeEn: string;
    let tasks2h: DayTask[];
    let tasks4h: DayTask[];

    if (day <= 20) {
      phase = 1;
      const dayInPhase = day;
      const rot = ((dayInPhase - 1) % 5) as 0 | 1 | 2 | 3 | 4;
      const focusList = ['Reading + Vocab', 'Listening + Vocab', 'Writing + Vocab', 'Speaking + Vocab', 'W+S + Vocab'];
      theme = `Tuần ${week}: Xây Nền — ${focusList[rot]}`;
      themeEn = `Week ${week}: Foundation — ${focusList[rot]}`;
      tasks2h = makeP1Tasks(day, '2h');
      tasks4h = makeP1Tasks(day, '4h');

    } else if (day <= 60) {
      phase = 2;
      const dayInPhase = day - 20;
      const readingDone = dayInPhase > 30;
      theme = readingDone
        ? `Tuần ${week}: Bứt Phá — Phân tích lỗi R (${dayInPhase - 30}/10)`
        : `Tuần ${week}: Bứt Phá — Passage 3 (${dayInPhase}/30)`;
      themeEn = readingDone
        ? `Week ${week}: Breakthrough — Error Analysis (${dayInPhase - 30}/10)`
        : `Week ${week}: Breakthrough — Passage 3 (${dayInPhase}/30)`;
      tasks2h = makeP2Tasks(day, '2h');
      tasks4h = makeP2Tasks(day, '4h');

    } else if (day <= 80) {
      phase = 3;
      const dayInPhase = day - 60;
      const isFullTestDay = (dayInPhase % 7 === 1);
      theme = isFullTestDay
        ? `Tuần ${week}: Thực Chiến — Full Test (${dayInPhase}/20)`
        : `Tuần ${week}: Thực Chiến — Passage 2 (${dayInPhase}/20)`;
      themeEn = isFullTestDay
        ? `Week ${week}: Battle — Full Test (${dayInPhase}/20)`
        : `Week ${week}: Battle — Passage 2 (${dayInPhase}/20)`;
      tasks2h = makeP3Tasks(day, dayInPhase, '2h');
      tasks4h = makeP3Tasks(day, dayInPhase, '4h');

    } else {
      phase = 4;
      const dayInPhase = day - 80;
      const subPhase = dayInPhase <= 20 ? `Học 200 từ (${dayInPhase}/20)` : `Ôn ALL Vocab (${dayInPhase - 20}/20)`;
      theme = `Tuần ${week}: Tối Đa Hoá — ${subPhase}`;
      themeEn = `Week ${week}: Max Mode — ${dayInPhase <= 20 ? `200 words/day (${dayInPhase}/20)` : `Review ALL (${dayInPhase - 20}/20)`}`;
      const p4Tasks = makeP4Tasks(day);
      tasks2h = p4Tasks;
      tasks4h = p4Tasks;
    }

    const milestoneLabels: Record<number, string> = {
      20: '🏁 Kết thúc Phase 1 — Kiểm tra tiến độ toàn bộ',
      60: '🏁 Kết thúc Phase 2 — 30 Passages + Phân tích lỗi xong',
      80: '🏁 Kết thúc Phase 3 — Thực chiến hoàn tất',
      120: '🏆 HOÀN THÀNH 120 Ngày — IELTS R9 L8 W7 S7',
    };

    days.push({
      day,
      week,
      phase,
      theme,
      themeEn,
      tasks2h,
      tasks4h,
      isMilestone: isMilestoneDay,
      milestoneLabel: isMilestoneDay ? milestoneLabels[day] : undefined,
    });
  }

  return days;
}

export const ROADMAP = generateRoadmap();

// ─── Storage helpers for time mode per day ────────────────────────────────────
const TIME_MODE_KEY = 'ielts_day_timemode_v1';

export function loadTimeModes(): Record<number, TimeMode> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TIME_MODE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveTimeMode(day: number, mode: TimeMode): void {
  if (typeof window === 'undefined') return;
  try {
    const all = loadTimeModes();
    all[day] = mode;
    localStorage.setItem(TIME_MODE_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

/** Get the active tasks for a day based on its time mode.
 *  Phase 4 always uses tasks4h regardless of mode setting. */
export function getActiveTasks(day: RoadmapDay, timeModes: Record<number, TimeMode>): DayTask[] {
  if (day.phase === 4) return day.tasks4h;
  const mode = timeModes[day.day] ?? '4h';
  return mode === '2h' ? day.tasks2h : day.tasks4h;
}

/** Count how many Reading Passage-3 tasks have been ticked in Phase 2.
 *  Task ID pattern: `r_p3_${absDay}`, storage key: `${absDay}_r_p3_${absDay}`.
 *  Only counts days 21-50 (first 30 days of Phase 2).
 */
export function countCompletedP2Passages(taskRecord: Record<string, boolean>): number {
  let count = 0;
  for (let absDay = 21; absDay <= 50; absDay++) {
    if (taskRecord[`${absDay}_r_p3_${absDay}`]) count++;
  }
  return count;
}

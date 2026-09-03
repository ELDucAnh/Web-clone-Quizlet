// lib/roadmap-data.ts — IELTS 140-day: 5.5 → 8.5+ (R 9 L 9 W 7 S 6.5)
// Intensive extreme R&L strategy based on user requirements.

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
  { id: 1 as Phase, name: 'Xây Nền Tảng', bandRange: '5.5 → 6.5', days: [1,35] as [number,number], color: '#4f8ef7', bg: '#EFF6FF', description: 'Cày cuốc R&L cực hạn (1h30p dictation, Passage 3). Cuối tuần tập trung Writing & Speaking.' },
  { id: 2 as Phase, name: 'Bứt Phá', bandRange: '6.5 → 7.5', days: [36,70] as [number,number], color: '#a855f7', bg: '#F5F3FF', description: 'Duy trì cường độ R&L. Tích lũy đủ cụm từ vựng Writing 30 chủ đề Task 2.' },
  { id: 3 as Phase, name: 'Thực Chiến', bandRange: '7.5 → 8.0', days: [71,105] as [number,number], color: '#06b6d4', bg: '#ECFEFF', description: 'Full Mock R&L liên tục. Luyện kỹ năng Listening 1.25x và Reading ép thời gian 50p.' },
  { id: 4 as Phase, name: 'Tối Đa Hoá', bandRange: '8.0 → 8.5+', days: [106,140] as [number,number], color: '#f59e0b', bg: '#FFFBEB', description: 'Phân tích bẫy chuyên sâu. Đảm bảo Reading 9.0, Listening 9.0. Duy trì W 7.0 S 6.5.' },
];

const WRITING_TOPICS = [
  "Technology & Society", "Education & Youth", "Environment & Climate Change", "Health & Lifestyle", 
  "Media & Advertising", "Globalisation & Culture", "Crime & Punishment", "Work & Employment", 
  "Transport & Urban Planning", "Gender & Equality", "Social Media & Communication", "Science & Research",
  "Tourism & Heritage", "Food & Agriculture", "Family & Parenting", "Sport & Competition",
  "Animals & Ethics", "Arts & Creativity", "Space & Future Technology", "Ageing & Demographics",
  "Government & Politics", "Consumerism & Economics", "Languages & Traditions", "Housing & Infrastructure",
  "Charity & Aid", "Water & Oceans", "Traditional vs Modern", "Remote Work", "Mental Health", "AI & Automation"
];

export function generateRoadmap(): RoadmapDay[] {
  const days: RoadmapDay[] = [];
  let dayCounter = 1;
  let writeTopicIdx = 0;
  
  const t = (id: string, type: TaskType, title: string, detail: string): DayTask => ({ id, type, title, detail });

  for (let week = 1; week <= 20; week++) {
    const phase = week <= 5 ? 1 : week <= 10 ? 2 : week <= 15 ? 3 : 4;
    const isMilestoneWeek = week % 5 === 0;
    
    // In Phase 1 & 2, we pick 2 topics per week for writing
    let t1 = "General Topic";
    let t2 = "General Topic";
    if (phase <= 2 && writeTopicIdx < WRITING_TOPICS.length - 1) {
      t1 = WRITING_TOPICS[writeTopicIdx++];
      t2 = WRITING_TOPICS[writeTopicIdx++];
    }

    for (let d = 1; d <= 7; d++) {
      const tasks: DayTask[] = [];
      const dayStr = dayCounter.toString();

      if (phase <= 2) {
        // PHASE 1 & 2 LOGIC
        if (d >= 1 && d <= 5) {
          // THỨ 2 ĐẾN THỨ 5 (Tập trung R&L)
          tasks.push(t(`r_vocab_${dayStr}`, 'reading', '📖 Học 30 từ vựng Reading', 'Chọn 30 từ vựng học thuật. Ghi chép định nghĩa, từ loại, đồng nghĩa/trái nghĩa.'));
          tasks.push(t(`l_vocab_${dayStr}`, 'listening', '🎧 Học 30 từ vựng Listening', 'Tập trung phát âm chuẩn, tránh nhầm lẫn minimal pairs và spelling.'));
          tasks.push(t(`r_prac_${dayStr}`, 'reading', '📰 Làm 2 bài Reading Passage 3 & Học từ vựng', 'Làm 2 bài Passage 3 cực khó (40p). Tra cứu toàn bộ từ vựng và phân tích bẫy Paraphrase.'));
          tasks.push(t(`l_prac_${dayStr}`, 'listening', '🎧 Nghe chép chính tả liên tục 1h30 phút', 'Chép chính tả liên tục 1h30p. Đối chiếu transcript, đánh dấu từ sai. Luyện tốc độ tự nhiên.'));
          tasks.push(t(`g_chill_${dayStr}`, 'grammar', '📚 Học 1 chủ đề ngữ pháp (nhẹ nhàng)', 'Học 1 chủ đề ngữ pháp nhẹ nhàng. Viết 2-3 câu ví dụ.'));
        } else if (d === 6) {
          // THỨ 7 (Tập trung Writing)
          tasks.push(t(`w_vocab_${dayStr}`, 'writing', `✍️ Học 60 cụm từ dài cho Writing Task 2`, `Học 30 cụm từ dài x 2 chủ đề (${t1} & ${t2}). Học cách dùng ngữ cảnh.`));
          tasks.push(t(`w_prac_${dayStr}`, 'writing', `✍️ Viết 1 bài Essay Task 2 (bấm giờ 40 phút)`, `Viết 1 bài Essay bấm giờ 40p. Mục tiêu dùng tối thiểu 10 cụm từ vừa học.`));
          tasks.push(t(`g_chill_${dayStr}`, 'grammar', '📚 Học 1 chủ đề ngữ pháp (nhẹ nhàng)', 'Học 1 điểm ngữ pháp nhẹ nhàng có thể áp dụng vào Writing.'));
        } else if (d === 7) {
          // CHỦ NHẬT (Review & Writing & Speaking)
          tasks.push(t(`w_vocab_${dayStr}`, 'writing', `✍️ Học 30 cụm từ dài cho Writing Task 2`, `Ôn tập và học thêm cụm từ chủ đề ${t2}. Tìm điểm chung giữa 2 chủ đề tuần này.`));
          tasks.push(t(`w_prac_${dayStr}`, 'writing', '✍️ Luyện tập viết ứng dụng 2 chủ đề vocab', `Viết 1 bài hoàn chỉnh kết hợp cụm từ của cả 2 chủ đề (${t1} & ${t2}). Bấm giờ 40p.`));
          tasks.push(t(`s_prac_${dayStr}`, 'speaking', '🗣️ Luyện nói 40 phút với AI về 4 chủ đề từ vựng', `Đóng vai thi Speaking thật. Tích cực ép dùng 120 cụm từ đã học (từ các tuần trước). Ghi âm lại.`));
          tasks.push(t(`v_rev_${dayStr}`, 'vocab', '🔄 Ôn tập toàn bộ từ vựng trong tuần (Spaced Repetition)', 'Ôn tập toàn bộ từ vựng R, L, W trong tuần. Không để cụm nào bị quên.'));
          tasks.push(t(`g_chill_${dayStr}`, 'grammar', '📚 Học 1 chủ đề ngữ pháp (nhẹ nhàng)', 'Ôn lại ngữ pháp cuối tuần thật nhẹ nhàng.'));
        }
      } else {
        // PHASE 3 & 4 LOGIC
        if (d === 1 || d === 3 || d === 5) {
          // THỨ 2, 4, 6 (Full Test & Phân tích bẫy R&L)
          tasks.push(t(`m_list_${dayStr}`, 'mock', '🎧 Full Mock Test Listening (Tốc độ 1.25x)', 'Làm 4 sections (40 câu) nghiêm ngặt tốc độ 1.25x để quen áp lực. Không dừng audio.'));
          tasks.push(t(`m_read_${dayStr}`, 'mock', '📰 Full Mock Test Reading (Ép thời gian 50-55 phút)', 'Ép thời gian xuống 50-55 phút. Tăng tốc độ đọc và chọn đáp án.'));
          tasks.push(t(`r_err_${dayStr}`, 'reading', '🔍 Phân tích sâu 100% các câu sai Reading', 'Tra cứu 100% câu sai, xác định bẫy Paraphrase. Ghi cặp Paraphrase vào sổ tay.'));
          tasks.push(t(`l_err_${dayStr}`, 'listening', '🔍 Phân tích sâu bẫy Listening Section 3', 'Phân tích sâu Section 3 (Multiple Choice & Matching). Xác định distractors.'));
          tasks.push(t(`s_prac_${dayStr}`, 'speaking', '🗣️ Luyện Speaking Part 1 & 2', 'Duy trì phản xạ 6.5. Trả lời Part 1 (3-4p) và 1 cue card Part 2 (2p) ghi âm lại.'));
        } else if (d === 2 || d === 4) {
          // THỨ 3, 5 (Kỹ năng khó R&L + Writing)
          tasks.push(t(`r_adv_${dayStr}`, 'reading', '📰 Luyện tập riêng biệt các dạng câu hỏi dễ sai nhất (8.5+)', 'Drill sâu T/F/NG và Matching Headings độ khó 8.5+. Tập trung phân biệt F và NG.'));
          tasks.push(t(`l_adv_${dayStr}`, 'listening', '🎧 Luyện nghe Section 4 (Fill in the blanks)', 'Nghe liên tục không nghỉ, chép chính tả tốc độ cao bài giảng học thuật.'));
          tasks.push(t(`w_prac_${dayStr}`, 'writing', `✍️ Viết Task ${d === 2 ? '1' : '2'} bấm giờ nghiêm ngặt`, `Bấm giờ cực ngặt (${d === 2 ? '20p Task 1' : '40p Task 2'}). Tự review lỗi ngữ pháp và từ vựng.`));
          tasks.push(t(`w_vocab_${dayStr}`, 'writing', '✍️ Nâng cấp từ vựng Writing band 7.0+', 'Học sophisticated collocations, nuanced expressions, hedging language.'));
        } else {
          // THỨ 7, CN (Mock Test & Speaking)
          tasks.push(t(`m_full_${dayStr}`, 'mock', '🏆 Thi thử Mock Test 4 kỹ năng chuẩn format thi thật', 'Mô phỏng thi thật: Sáng L (30p), R (60p), W (60p). Chiều S (14p). Không tra từ điển.'));
          tasks.push(t(`s_mock_${dayStr}`, 'mock', '🗣️ Ghi âm Full Mock Speaking Part 1, 2, 3 liên tục', 'Ghi âm Part 1,2,3 liên tục. Dùng AI chấm điểm Fluency, Coherence, Pronunciation.'));
          tasks.push(t(`v_rev_${dayStr}`, 'vocab', '🔄 Ôn tập toàn bộ từ vựng nâng cao đã sai', 'Tổng hợp toàn bộ từ vựng ghi sai trong Mock Test (đặc biệt từ Reading/Listening). Ôn lặp lại.'));
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

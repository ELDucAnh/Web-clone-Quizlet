// lib/roadmap-data.ts
// 140-day IELTS study plan: 5.5 → 7.5 | 3h/day
// Target: R 6→8, L 5→8, W 5→7, S 6→7

export type Phase = 1 | 2 | 3 | 4;
export type Skill = 'vocab' | 'listening' | 'reading' | 'writing' | 'speaking' | 'grammar' | 'mock';

export interface DayTask {
  skill: Skill;
  emoji: string;
  duration: number; // minutes
  description: string;
}

export interface RoadmapDay {
  day: number;
  week: number;
  phase: Phase;
  theme: string;         // chủ đề tiếng Việt
  themeEn: string;
  dayTitle: string;
  tasks: DayTask[];
  isMilestone: boolean;
  milestoneLabel?: string;
}

export const PHASES = [
  { id: 1 as Phase, name: 'Xây Nền Tảng', bandRange: '5.5 → 6.0', days: [1, 35], color: '#10B981', bg: '#ECFDF5', description: 'Nắm vững format IELTS, chiến lược cơ bản và từ vựng học thuật nền tảng' },
  { id: 2 as Phase, name: 'Bứt Tốc',      bandRange: '6.0 → 6.5', days: [36, 70], color: '#3B82F6', bg: '#EFF6FF', description: 'Chinh phục các dạng câu hỏi khó, xây dựng chiến lược thi bài bản' },
  { id: 3 as Phase, name: 'Đào Sâu',      bandRange: '6.5 → 7.0', days: [71, 105], color: '#8B5CF6', bg: '#F5F3FF', description: 'Nâng cao tất cả 4 kỹ năng lên tầm Band 7 với từ vựng học thuật nâng cao' },
  { id: 4 as Phase, name: 'Thực Chiến',   bandRange: '7.0 → 7.5', days: [106, 140], color: '#F59E0B', bg: '#FFFBEB', description: 'Luyện đề full mock test, phân tích lỗi sai và tinh chỉnh từng điểm yếu' },
];

// 20 weekly themes
const WEEK_THEMES = [
  // Phase 1 (W1-5)
  { week: 1,  theme: 'Môi trường & Khí hậu',        themeEn: 'Environment & Climate Change' },
  { week: 2,  theme: 'Công nghệ & Đổi mới',          themeEn: 'Technology & Innovation' },
  { week: 3,  theme: 'Giáo dục & Học tập',            themeEn: 'Education & Learning' },
  { week: 4,  theme: 'Sức khỏe & Y tế',              themeEn: 'Health & Medicine' },
  { week: 5,  theme: 'Xã hội & Cộng đồng',           themeEn: 'Society & Community' },
  // Phase 2 (W6-10)
  { week: 6,  theme: 'Khoa học & Nghiên cứu',        themeEn: 'Science & Research' },
  { week: 7,  theme: 'Kinh doanh & Kinh tế',          themeEn: 'Business & Economics' },
  { week: 8,  theme: 'Nghệ thuật & Văn hóa',          themeEn: 'Arts & Culture' },
  { week: 9,  theme: 'Giao thông & Hạ tầng',          themeEn: 'Transport & Infrastructure' },
  { week: 10, theme: 'Pháp luật & Tội phạm',          themeEn: 'Law & Crime' },
  // Phase 3 (W11-15)
  { week: 11, theme: 'Thực phẩm & Nông nghiệp',      themeEn: 'Food & Agriculture' },
  { week: 12, theme: 'Chính phủ & Chính trị',         themeEn: 'Government & Politics' },
  { week: 13, theme: 'Truyền thông & Báo chí',        themeEn: 'Media & Journalism' },
  { week: 14, theme: 'Tâm lý & Hành vi',              themeEn: 'Psychology & Behavior' },
  { week: 15, theme: 'Đô thị & Nông thôn',            themeEn: 'Urban & Rural Life' },
  // Phase 4 (W16-20)
  { week: 16, theme: 'Năng lượng & Bền vững',         themeEn: 'Energy & Sustainability' },
  { week: 17, theme: 'Ngôn ngữ & Giao tiếp',          themeEn: 'Language & Communication' },
  { week: 18, theme: 'Toàn cầu hóa & Di dân',         themeEn: 'Globalization & Migration' },
  { week: 19, theme: 'Ôn tập tổng hợp',               themeEn: 'Comprehensive Review' },
  { week: 20, theme: 'Luyện đề thực chiến',            themeEn: 'Exam Simulation' },
];

// Listening progression by week
const L_TOPICS: Record<number, string[]> = {
  1:  ['Section 1: điền form đặt chỗ, ghi tên địa chỉ', 'Section 1: hội thoại mua đồ, ghi số điện thoại', 'Section 2: bài giới thiệu địa điểm', 'Section 2: hướng dẫn trên bản đồ', 'Section 1+2: luyện 2 phần liên tiếp', 'Section 1+2 ôn lại, tập nhận diện từ khoá', 'Mini-test S1+S2: điền form + MCQ'],
  2:  ['Section 1: đặt khách sạn, điền thông tin', 'Section 2: thuyết trình sự kiện công nghệ', 'Section 1+2: luyện note-taking', 'Section 2: MCQ về hội thảo tech', 'Section 1: câu hỏi ghi chú số liệu', 'Ôn S1+S2: nhận diện bẫy (distractor)', 'Mini-test S1+S2 có tính giờ'],
  3:  ['Section 3: thảo luận nhóm sinh viên (intro)', 'Section 3: MCQ bài học ở đại học', 'Section 3: điền notes về đề án học tập', 'Section 3: nhận diện ý kiến nhiều người nói', 'Section 2+3 kết hợp luyện tập', 'Ôn Section 3: signpost language (firstly, however…)', 'Mini-test S2+S3'],
  4:  ['Section 4: bài giảng y tế (intro)', 'Section 4: sentence completion bài giảng', 'Section 4: diagram labeling – mô hình cơ thể', 'Section 3+4: thảo luận + bài giảng', 'Section 4: MCQ bài giảng dài', 'Ôn S4: kỹ năng dự đoán trước khi nghe', 'Mini-test S3+S4'],
  5:  ['Section 1–4: ôn tổng hợp dạng điền form', 'Section 2: map/plan labeling khu phố', 'Section 3: list selection (chọn 3 trong 7)', 'Section 4: flow-chart completion', 'Luyện nghe có transcript – phân tích lỗi', 'Ôn toàn bộ S1–S4: tốc độ & độ chính xác', 'Phase 1 Milestone: Listening S1–S4 full'],
  6:  ['Section 3+4: thảo luận khoa học', 'Section 4: bài giảng nghiên cứu phức tạp', 'Section 3: multiple speaker distinction', 'Section 4: điền notes – academic lecture', 'Section 3+4: luyện inference (suy luận)', 'Ôn listening với vocabulary khoa học', 'Mini-test S3+S4: khoa học'],
  7:  ['Section 1+2: kinh doanh – phỏng vấn việc làm', 'Section 3: thảo luận chiến lược kinh doanh', 'Section 4: bài giảng kinh tế học', 'Section 2: bài giới thiệu công ty', 'Section 3+4: phân tích số liệu', 'Ôn từ kinh doanh trong nghe', 'Mini-test kinh doanh: S1+S2+S3'],
  8:  ['Section 2: hướng dẫn bảo tàng/triển lãm', 'Section 3: thảo luận nghệ thuật học thuật', 'Section 4: bài giảng lịch sử âm nhạc', 'Section 2: diagram labeling – sơ đồ toà nhà', 'Section 3: note completion – nghệ thuật', 'Ôn S2+S3 nghệ thuật & văn hoá', 'Mini-test: map + thảo luận'],
  9:  ['Section 2: giao thông đô thị – hướng dẫn', 'Section 4: bài giảng phát triển hạ tầng', 'Section 3: thảo luận dự án xây dựng', 'Section 1: đặt vé tàu/xe', 'Section 4: flow-chart giao thông', 'Ôn tổng S1–S4: giao thông', 'Mini-test: S2+S4 hạ tầng'],
  10: ['Section 3: thảo luận pháp luật', 'Section 4: bài giảng về tội phạm học', 'Section 2: giới thiệu chương trình hỗ trợ tội phạm', 'Section 3: tranh luận nhiều quan điểm', 'Section 4: bài giảng hệ thống tư pháp', 'Ôn toàn bộ S1–S4: trọng tâm S3+S4', 'Phase 2 Milestone: Full Listening Test'],
  11: ['Section 2: tham quan nông trại', 'Section 4: bài giảng nông nghiệp bền vững', 'Section 3: thảo luận an ninh lương thực', 'Section 1: đặt bàn nhà hàng', 'Section 4: diagram labeling – quy trình sản xuất', 'Ôn S3+S4 nông nghiệp', 'Mini-test: S1+S2+S4'],
  12: ['Section 4: bài giảng về hệ thống chính trị', 'Section 3: thảo luận chính sách công', 'Section 2: giới thiệu chương trình cộng đồng', 'Section 4: flow-chart luật pháp', 'Section 3: inference + paraphrase chính trị', 'Ôn S3+S4 với từ vựng chính trị', 'Mini-test: S3+S4 chính trị'],
  13: ['Section 4: bài giảng về truyền thông kỹ thuật số', 'Section 3: thảo luận về báo chí đạo đức', 'Section 2: giới thiệu chương trình phát thanh', 'Section 3: note-taking – phỏng vấn nhà báo', 'Section 4: sentence completion – social media', 'Ôn S3+S4 với từ vựng truyền thông', 'Mini-test: thảo luận + bài giảng'],
  14: ['Section 4: bài giảng tâm lý nhận thức', 'Section 3: thảo luận hành vi con người', 'Section 2: chương trình tư vấn tâm lý', 'Section 4: diagram labeling – não bộ', 'Section 3: multiple speaker – nghiên cứu', 'Ôn S3+S4: tâm lý học', 'Mini-test: tâm lý học đầy đủ'],
  15: ['Section 2: bản đồ đô thị – hướng dẫn', 'Section 4: bài giảng phát triển đô thị', 'Section 3: thảo luận nông thôn vs đô thị', 'Section 4: flow-chart quy hoạch', 'Section 3+4: inference nâng cao', 'Ôn tổng hợp S1–S4', 'Phase 3 Milestone: Full Listening Test nâng cao'],
  16: ['Section 4: bài giảng năng lượng tái tạo', 'Section 3: thảo luận về biến đổi khí hậu', 'Section 2: tour nhà máy điện mặt trời', 'Section 4: diagram – quy trình sản xuất năng lượng', 'Section 3: MCQ chính sách năng lượng', 'Ôn từ năng lượng trong nghe', 'Mock Test 1: Listening Full (40 câu – 30p)'],
  17: ['Section 4: bài giảng ngôn ngữ học', 'Section 3: thảo luận đa ngôn ngữ', 'Section 2: giới thiệu khoá học ngoại ngữ', 'Section 4: note completion – linguistics', 'Section 3: phân tích lỗi nghe thường gặp', 'Ôn S1–S4: tổng hợp chủ đề', 'Mock Test 2: Listening Full'],
  18: ['Listening: dạng điền form nâng cao', 'Listening: MCQ khó (3 distractors)', 'Listening: diagram/plan labeling phức tạp', 'Listening: flow-chart nhiều bước', 'Listening: list selection 3/7', 'Ôn toàn bộ dạng câu hỏi Listening', 'Mock Test 3: Listening Full'],
  19: ['Listening: tập trung khu vực điểm thấp', 'Listening: speed dictation luyện nghe nhanh', 'Listening: phân tích đáp án sai mock 1-2-3', 'Listening: accent khác nhau (British, Australian)', 'Listening: luyện đề cao cấp Band 8', 'Listening: tổng ôn chiến lược', 'Mock Test 4: Listening Full'],
  20: ['Listening: đề thi chính thức Practice 1', 'Listening: đề thi chính thức Practice 2', 'Listening: phân tích lỗi sai lần cuối', 'Listening: tổng ôn nước rút', 'Listening: đề thực chiến Band 8 target', 'Ngày nghỉ ngơi – nghe podcast/phim không áp lực', 'Mock Test 5: Listening Full + chữa bài'],
};

const R_TOPICS: Record<number, string[]> = {
  1:  ['Kỹ thuật skim (đọc lướt) và scan (tìm từ khoá)', 'Multiple Choice cơ bản – đọc câu hỏi trước', 'True/False/Not Given – phân biệt 3 loại đáp án', 'Short Answer Questions – giới hạn số từ', 'Sentence Completion – đoán từ loại cần điền', 'Luyện tổng hợp: 1 bài đọc 650 từ có tính giờ', 'Mini-test: 1 passage đầy đủ (13 câu – 20 phút)'],
  2:  ['Matching Information – tìm đoạn chứa ý', 'T/F/NG nâng cao – bẫy "Not Given"', 'Vocabulary in Context – đoán nghĩa từ qua ngữ cảnh', 'Summary Completion – điền vào đoạn tóm tắt', 'MCQ nâng cao với câu hỏi về toàn bài', 'Đọc nhanh 1 passage công nghệ – phân tích cấu trúc', 'Mini-test: passage công nghệ (13 câu)'],
  3:  ['Matching Headings – ghép tiêu đề với đoạn văn', 'Y/N/NG (với bài opinion/argument) – giới thiệu', 'Note/Table/Flow-chart Completion', 'Matching Headings: bẫy headings không xuất hiện', 'Summary + Sentence Completion kết hợp', 'Đọc timed: 1 passage giáo dục – 20 phút', 'Mini-test: passage giáo dục'],
  4:  ['Diagram Labeling – mô tả hình/quy trình', 'List Selection – chọn đúng số lượng câu trả lời', 'Matching Information (harder – 2 đoạn/câu)', 'Short Answer nâng cao – chi tiết cụ thể', '1 Passage đầy đủ: sức khoẻ – 13 câu tính giờ', 'Phân tích lỗi sai và chiến lược cải thiện', 'Mini-test: passage sức khoẻ'],
  5:  ['Ôn tổng hợp tất cả dạng câu P1', 'Luyện đọc 2 passage liên tiếp (40 phút)', 'Chiến lược phân bổ thời gian 3 passage', 'Tập trung từ vựng học thuật (AWL list 1-2)', 'Luyện tốc độ đọc: tăng từ 200 lên 250 wpm', 'Full Reading Practice: 2 passages – 40 phút', 'Phase 1 Milestone: Full Reading (3 passages – 60p)'],
  6:  ['Matching Headings khoa học: đọc abstract', 'T/F/NG: phân biệt fact vs opinion trong khoa học', 'Sentence Completion: số liệu nghiên cứu', 'MCQ nâng cao: tìm ý chính bài giảng khoa học', 'Đọc 2 passages khoa học liên tiếp', 'AWL list 3-4: từ vựng học thuật nâng cao', 'Mini-test: 2 passages khoa học'],
  7:  ['Matching Information: đoạn văn kinh doanh', 'Summary Completion: báo cáo tài chính', 'Y/N/NG: bài luận kinh tế học', 'List Selection: chính sách kinh tế', '1 Passage kinh doanh tính giờ: 20 phút', 'Phân tích từ vựng collocations kinh doanh', 'Mini-test: 2 passages kinh doanh'],
  8:  ['Matching Headings: nghệ thuật & lịch sử', 'Diagram Labeling: sơ đồ/kiến trúc', 'Note Completion: bài giảng văn hoá', 'T/F/NG: nhận định về nghệ thuật', 'Sentence Completion: mô tả tác phẩm', 'Đọc 2 passages: nghệ thuật – 40 phút', 'Mini-test: nghệ thuật & văn hoá'],
  9:  ['Matching Information: bài phân tích giao thông', 'Y/N/NG: quan điểm về phát triển hạ tầng', 'Flow-chart Completion: quy trình xây dựng', 'MCQ: số liệu thống kê giao thông', 'Đọc 2 passages: giao thông – 40 phút', 'AWL list 5-6: từ vựng hạ tầng', 'Mini-test: 2 passages giao thông'],
  10: ['Matching Headings: tội phạm học', 'Summary Completion: hệ thống tư pháp', 'Y/N/NG nâng cao: luật pháp quốc tế', 'MCQ phức tạp: đọc phân tích số liệu', 'Đọc 2 passages: pháp luật – 40 phút', 'Ôn tổng hợp Phase 2 Reading', 'Phase 2 Milestone: Full Reading (3 passages – 60p)'],
  11: ['Matching Info: nông nghiệp bền vững', 'Diagram Labeling: quy trình sản xuất thực phẩm', 'T/F/NG nâng cao: khó nhất không tìm thấy thông tin', 'Sentence Completion nâng cao: điền cụm từ', 'Đọc 2 passages: thực phẩm – 40 phút', 'AWL list 7-8: từ vựng khoa học thực phẩm', 'Mini-test: nông nghiệp & thực phẩm'],
  12: ['Y/N/NG nâng cao: phân tích chính sách', 'Matching Headings: bài dài 8 đoạn', 'Summary + Flow-chart kết hợp', 'MCQ khó: ý chính ẩn trong đoạn', 'Đọc 2 passages: chính trị – 40 phút', 'Luyện đọc abstract nhanh', 'Mini-test: chính phủ & chính sách'],
  13: ['Matching Information: bài phân tích truyền thông', 'List Selection: yếu tố ảnh hưởng báo chí', 'Note Completion: xu hướng media kỹ thuật số', 'T/F/NG khó: phân biệt fact vs opinion', 'Đọc 2 passages: truyền thông – 40 phút', 'Ôn AWL list 9-10', 'Mini-test: media & communication'],
  14: ['Matching Headings: bài tâm lý học phức tạp', 'Y/N/NG: lý thuyết tâm lý', 'Diagram Labeling: sơ đồ thực nghiệm', 'MCQ nâng cao: suy luận (inference)', 'Đọc 2 passages: tâm lý – 40 phút', 'Luyện suy luận từ ngữ cảnh', 'Mini-test: tâm lý học'],
  15: ['Tất cả dạng câu hỏi: ôn tổng hợp', 'Luyện 3 passages liên tiếp không nghỉ – 60 phút', 'Phân tích lỗi sai điển hình Reading Band 6-7', 'Tập trung câu hỏi khó nhất: Matching Headings', 'Tập trung câu hỏi khó nhất: Y/N/NG', 'Luyện tốc độ đọc: target 280+ wpm', 'Phase 3 Milestone: Full Reading (3 passages – 60p tính giờ)'],
  16: ['Matching Headings: năng lượng & môi trường', 'Y/N/NG nâng cao: chính sách năng lượng', 'Summary Completion: công nghệ xanh', 'MCQ phức tạp: số liệu năng lượng', 'Full Reading Practice: 3 passages – 60p', 'Phân tích điểm số và khu vực sai', 'Mock Test 1: Full Reading (40 câu – 60p)'],
  17: ['Matching Information: ngôn ngữ học', 'Diagram Labeling: cấu trúc ngôn ngữ', 'T/F/NG khó: ngôn ngữ học', 'Sentence Completion: nghiên cứu ngôn ngữ', 'Full Reading Practice: 3 passages – 60p', 'Phân tích lỗi sai mock 1', 'Mock Test 2: Full Reading'],
  18: ['Luyện passage khó nhất: Band 8-9 level', 'Luyện đọc trong 55 phút (thay vì 60)', 'Dạng câu hỏi: list selection nâng cao', 'Dạng câu hỏi: matching information khó nhất', 'Full Reading Practice: 3 passages – 60p', 'Ôn tổng hợp tất cả dạng câu', 'Mock Test 3: Full Reading'],
  19: ['Phân tích lỗi sai tổng hợp 3 mock', 'Tập trung khu vực yếu nhất', 'Reading: luyện vocabulary nâng cao AWL', 'Reading: đề Band 7.5-8.0 target', 'Reading: chiến lược cuối thi', 'Reading: tổng ôn nước rút', 'Mock Test 4: Full Reading'],
  20: ['Reading: đề chính thức Practice Test 1', 'Reading: đề chính thức Practice Test 2', 'Reading: phân tích lỗi sai cuối cùng', 'Reading: tổng hợp chiến lược ngày thi', 'Reading: đề thực chiến Band 8', 'Nghỉ ngơi – đọc báo/tạp chí tiếng Anh nhẹ nhàng', 'Mock Test 5: Full Reading + chữa bài tổng kết'],
};

const W_TOPICS: Record<number, string[]> = {
  1:  ['Task 1: cấu trúc mở bài + giới thiệu xu hướng biểu đồ cột', 'Task 1: miêu tả xu hướng biểu đồ đường – từ vựng tăng/giảm', 'Task 1: so sánh biểu đồ tròn – phần trăm & phân số', 'Task 1: bảng số liệu (table) – so sánh & tóm tắt', 'Task 1: sơ đồ quy trình (process diagram) – passive voice', 'Task 2: cấu trúc opinion essay 4 đoạn', 'Mini-test: Task 1 biểu đồ – 20 phút'],
  2:  ['Task 1: ôn luyện tổng hợp biểu đồ kết hợp (bar+line)', 'Task 2: lập dàn ý opinion essay về công nghệ', 'Task 2: viết đoạn body 1 với luận điểm + ví dụ', 'Task 2: viết đoạn body 2 + counterargument', 'Task 2: viết intro + conclusion chuẩn', 'Task 2: timed essay – 40 phút viết hoàn chỉnh', 'Mini-test: Task 2 opinion essay – 40 phút'],
  3:  ['Task 2: discussion essay (cả hai quan điểm) – cấu trúc', 'Task 2: dàn ý + viết body thảo luận', 'Task 2: discussion essay hoàn chỉnh', 'Task 1: tổng ôn biểu đồ – cải thiện từ vựng', 'Task 2: tự chấm điểm bằng tiêu chí IELTS', 'Task 2: timed – discussion essay 40 phút', 'Mini-test: Task 2 discussion – 40 phút'],
  4:  ['Task 2: advantage/disadvantage essay – cấu trúc', 'Task 2: viết A/D essay về y tế & công nghệ', 'Task 2: problem/solution essay – cấu trúc', 'Task 2: viết P/S essay về sức khoẻ cộng đồng', 'Task 1: process diagram – y tế', 'Task 2: timed A/D essay – 40 phút', 'Mini-test: Task 1 + Task 2 liên tiếp – 60 phút'],
  5:  ['Task 2: two-part question (2 câu hỏi riêng) – cấu trúc', 'Task 2: viết essay 2 câu hỏi – xã hội', 'Task 1: ôn luyện tất cả dạng biểu đồ', 'Task 2: review tiêu chí TA, CC, LR, GRA', 'Task 2: timed tổng hợp 4 dạng – 40 phút', 'Full Writing Practice: T1 (20p) + T2 (40p)', 'Phase 1 Milestone: T1 + T2 full timed – 60 phút'],
  6:  ['Task 2: ôn opinion với từ vựng khoa học', 'Task 2: dàn ý advanced – specific examples', 'Task 1: map/plan – so sánh trước và sau', 'Task 1: map miêu tả thay đổi – từ vựng địa lý', 'Task 2: problem/solution về nghiên cứu khoa học', 'Task 2: nâng cao coherence – discourse markers', 'Mini-test: Task 1 map + Task 2 – 60 phút'],
  7:  ['Task 2: argument essay cấp độ nâng cao', 'Task 2: xây dựng luận điểm với số liệu thực tế', 'Task 1: kết hợp 2 biểu đồ (pie + bar)', 'Task 2: lexical resource – paraphrase đề bài', 'Task 2: GRA – câu phức, bị động, mệnh đề quan hệ', 'Task 2: timed – nâng cao Band 6.5', 'Mini-test: T1+T2 kinh doanh – 60p tính giờ'],
  8:  ['Task 2: discussion nâng cao – nghệ thuật & xã hội', 'Task 1: ôn quy trình và so sánh', 'Task 2: lexical resource – collocations nâng cao', 'Task 2: coherence & cohesion – pronoun reference', 'Task 2: timed discussion về văn hoá – 40 phút', 'Task 1: map timed – 20 phút', 'Mini-test: T1+T2 nghệ thuật – 60 phút'],
  9:  ['Task 2: two-part question về giao thông', 'Task 1: process diagram giao thông', 'Task 2: nâng cao GRA – conditionals & modals', 'Task 2: timed 2-part question – 40 phút', 'Task 1: tổng ôn – biểu đồ khó Band 7', 'Full Writing Practice: T1+T2 – 60 phút', 'Mini-test: T1+T2 giao thông – 60 phút'],
  10: ['Task 2: ôn tổng hợp 5 dạng essay', 'Task 2: tự chấm và phân tích điểm yếu', 'Task 1+Task 2: kết hợp tính giờ cả 2 task', 'Task 2: Band 6.5 essay vs Band 7 essay – so sánh', 'Task 2: chiến lược viết nhanh và đúng cấu trúc', 'Full Writing Mock: T1+T2 – 60p', 'Phase 2 Milestone: Full Writing Mock timed'],
  11: ['Task 2: opinion essay nâng cao – Band 7 target', 'Task 2: advanced lexical resource – rare vocab', 'Task 2: advanced coherence – linkers đa dạng', 'Task 1: tổng ôn biểu đồ khó – Band 7', 'Task 2: timed opinion – 40p cải thiện Band 7', 'Task 2: peer review technique – tự chấm', 'Mini-test: T1+T2 nông nghiệp – 60 phút'],
  12: ['Task 2: advanced discussion – politics', 'Task 2: argument with concession (nhượng bộ)', 'Task 2: introduction – hook câu đầu ấn tượng', 'Task 2: conclusion – không lặp lại intro', 'Task 1+T2: timed – chính trị 60 phút', 'Task 2: tập trung GRA nâng cao', 'Mini-test: T1+T2 – chính trị 60 phút'],
  13: ['Task 2: 2-part question về truyền thông', 'Task 2: P/S essay – fake news', 'Task 2: advanced vocabulary – media', 'Task 1: mixed charts nâng cao', 'Task 2: timed nâng cao – 40 phút', 'Full Writing Practice: T1+T2 – 60p', 'Mini-test: T1+T2 truyền thông – 60p'],
  14: ['Task 2: opinion – con người & hành vi', 'Task 2: advanced coherence – Band 7 features', 'Task 2: GRA hoàn thiện – viết không lỗi ngữ pháp', 'Task 2: lexical resource – academic collocations', 'Task 2: timed tổng hợp – 40 phút', 'Full Writing Practice: T1+T2 – 60p', 'Mini-test: T1+T2 tâm lý – 60p'],
  15: ['Task 2: tổng ôn 5 dạng essay', 'Task 2: phân tích Band 7 essay mẫu', 'Task 2: tự cải thiện GRA và LR', 'Task 1: tổng ôn nâng cao tất cả dạng', 'Full Writing Practice: T1+T2 – 60p có tính điểm', 'Task 2: chiến lược nâng Band 7', 'Phase 3 Milestone: Full Writing Mock (60p) – tự chấm điểm'],
  16: ['Task 2: opinion nâng cao về năng lượng', 'Task 1: biểu đồ phức tạp – năng lượng', 'Task 2: A/D về năng lượng tái tạo', 'Full Writing Practice: T1+T2 – 60p', 'Task 2: phân tích và viết lại', 'Task 2: Band 7 target – tự đánh giá', 'Mock Test 1: Full Writing (60p) – T1+T2'],
  17: ['Task 2: P/S essay nâng cao', 'Task 1: mixed charts nâng cao', 'Task 2: timed – nhắm Band 7 chuẩn', 'Phân tích essay mẫu Band 7.5', 'Full Writing Practice: T1+T2 – 60p', 'Task 2: hoàn thiện GRA + LR', 'Mock Test 2: Full Writing (60p)'],
  18: ['Task 2: tất cả dạng – luyện random', 'Task 1: biểu đồ khó nhất', 'Task 2: phân tích lỗi từ Mock 1-2', 'Full Writing Practice: T1+T2 – 60p', 'Task 2: tinh chỉnh từng tiêu chí', 'Task 2: tổng ôn nước rút', 'Mock Test 3: Full Writing (60p)'],
  19: ['Task 2: tập trung TA và CC', 'Task 1: tập trung LR mô tả số liệu', 'Task 2: hoàn thiện GRA không lỗi', 'Full Writing Practice: T1+T2 – 60p', 'Task 2: tinh chỉnh Band 7 essay', 'Chiến lược ngày thi – phân bổ thời gian', 'Mock Test 4: Full Writing (60p)'],
  20: ['Mock Test Writing: đề chính thức Practice 1', 'Mock Test Writing: đề chính thức Practice 2', 'Phân tích lỗi sai lần cuối', 'Writing: tổng ôn và chiến lược cuối', 'Writing: đề thực chiến Band 7+ target', 'Nghỉ ngơi – viết nhật ký tiếng Anh nhẹ nhàng', 'Mock Test 5: Full Writing + chữa bài tổng kết'],
};

const S_TOPICS: Record<number, string[]> = {
  1:  ['Part 1: giới thiệu bản thân – tên, quê quán, nghề nghiệp', 'Part 1: gia đình & bạn bè – câu trả lời 2-3 câu', 'Part 1: sở thích cá nhân – câu trả lời đầy đủ', 'Part 1: môi trường sống, thời tiết, du lịch', 'Part 1: chiến lược – luôn mở rộng câu trả lời', 'Part 1: luyện nói 5 chủ đề không chuẩn bị', 'Mini Speaking: Part 1 record & review'],
  2:  ['Part 1 nâng cao: công nghệ, mạng xã hội, điện thoại', 'Part 1: shopping, fashion, food – mở rộng', 'Part 2 intro: cue card – cấu trúc WHAT/WHERE/WHEN/WHY', 'Part 2: lập dàn ý trong 1 phút', 'Part 2: talk about a person you admire', 'Part 2: ghi âm – luyện nói 2 phút không dừng', 'Mini Speaking: Part 2 record 2 phút'],
  3:  ['Part 1 ôn luyện: trường học, thầy cô, kỳ thi', 'Part 2: talk about a place you like', 'Part 2: chiến lược nói đủ 2 phút', 'Part 2: talk about a book/film you like', 'Part 2: talk about a memorable event', 'Part 2: ghi âm và tự chấm fluency', 'Mini Speaking: Part 1+2 record'],
  4:  ['Part 1: health, exercise, diet, stress', 'Part 2: talk about a health challenge/achievement', 'Part 2: talk about someone who helps others', 'Part 2: chiến lược – thì quá khứ trong Part 2', 'Part 2: talk about a piece of technology', 'Luyện phát âm: stress patterns trong từ dài', 'Mini Speaking: Part 2 topic health'],
  5:  ['Part 1 ôn tổng hợp: tất cả chủ đề đã học', 'Part 2 ôn luyện: 5 cue cards ngẫu nhiên', 'Part 3 intro: câu hỏi trừu tượng – cấu trúc trả lời', 'Part 3: "Do you think…?" – give opinion + reason', 'Part 3: "What are the advantages of…?" – list + explain', 'Phát âm: intonation và sentence stress', 'Phase 1 Milestone: Part 1+2+3 tự ghi âm hoàn chỉnh'],
  6:  ['Part 3: thảo luận về khoa học & nghiên cứu', 'Part 3: "How has X changed?" – compare + opinion', 'Part 2: talk about a scientific discovery', 'Part 3: nâng cao fluency – filler phrases tự nhiên', 'Part 2: talk about a time you learned something', 'Part 3: luyện hedging language (It depends on…)', 'Mini Speaking: P2+P3 record – khoa học'],
  7:  ['Part 3: thảo luận về kinh tế & việc làm', 'Part 2: talk about your dream job', 'Part 3: "What are the problems with…?" – structured answer', 'Part 2: talk about a successful businessperson', 'Part 3: luyện vocabulary kinh tế trong nói', 'Phát âm: từ hai âm tiết – stress đúng vị trí', 'Mini Speaking: P2+P3 kinh doanh'],
  8:  ['Part 2: talk about an art form you like', 'Part 3: "Is art important in modern society?"', 'Part 2: talk about a cultural event/festival', 'Part 3: thảo luận đa quan điểm về văn hoá', 'Luyện nói tự nhiên: discourse markers (Moreover, On the other hand)', 'Part 2: talk about a music/film that moved you', 'Mini Speaking: P2+P3 nghệ thuật'],
  9:  ['Part 2: talk about a form of transport you use', 'Part 3: "Should cities reduce private cars?"', 'Part 2: talk about a place with traffic problems', 'Part 3: infrastructure & city planning – opinion', 'Phát âm: linking words khi nói (want_to → "wanna")', 'Luyện speaking Band 6.5: tốc độ + độ chính xác', 'Mini Speaking: P2+P3 giao thông'],
  10: ['Part 2: talk about a crime-related news story', 'Part 3: "Why do people commit crimes?"', 'Part 2: talk about a law you agree/disagree with', 'Part 3: "Is punishment always effective?"', 'Ôn tổng hợp Part 1+2+3 Phase 2', 'Phân tích lỗi speaking thường gặp Band 5-6', 'Phase 2 Milestone: Full Speaking Mock (Part 1+2+3)'],
  11: ['Part 2: talk about a type of food you enjoy', 'Part 3: "How have eating habits changed?"', 'Part 2: talk about a traditional dish/festival food', 'Part 3: "What are the effects of fast food culture?"', 'Luyện nói: complex sentence structures', 'Part 3: sử dụng conditionals trong nói (If I were…)', 'Mini Speaking: P2+P3 thực phẩm'],
  12: ['Part 3: "Should government control social media?"', 'Part 2: talk about a change in your country', 'Part 3: "How important is voting?"', 'Part 2: talk about a leader you admire', 'Luyện nói: academic vocabulary trong speaking', 'Part 3: nâng cao GRA trong nói – ít lỗi hơn', 'Mini Speaking: P2+P3 chính trị'],
  13: ['Part 3: "How has internet changed communication?"', 'Part 2: talk about a TV show/podcast', 'Part 3: "Are social media influencers good role models?"', 'Part 2: talk about fake news impact', 'Luyện nói: paraphrase câu hỏi trước khi trả lời', 'Part 3: collocations truyền thông trong nói', 'Mini Speaking: P2+P3 truyền thông'],
  14: ['Part 3: "What motivates people to succeed?"', 'Part 2: talk about a stressful experience', 'Part 3: "How important is mental health awareness?"', 'Part 2: talk about a habit you want to change', 'Luyện nói: hedging và speculating (might, could, tend to)', 'Part 3: tổng hợp cấu trúc nâng cao trong nói', 'Mini Speaking: P2+P3 tâm lý'],
  15: ['Ôn tổng hợp Part 3: tất cả chủ đề', 'Full Speaking Mock: Part 1+2+3 tự ghi âm', 'Phân tích lỗi: fluency, coherence, vocab, pronunciation', 'Tập trung cải thiện pronunciation nâng cao', 'Luyện nói Band 7: tốc độ + accuracy + variety', 'Full Speaking Mock lần 2: so sánh tiến bộ', 'Phase 3 Milestone: Full Speaking Mock (chấm điểm)'],
  16: ['Part 3 nâng cao: energy & environment', 'Part 2: talk about an environmental initiative', 'Part 3: "Should renewable energy be subsidised?"', 'Luyện nói Band 7 target: complex GRA + collocations', 'Full Speaking Practice: P1+P2+P3', 'Phân tích và cải thiện 1 tiêu chí yếu nhất', 'Mock Test 1: Full Speaking (ghi âm + chấm)'],
  17: ['Part 3 nâng cao: language & identity', 'Part 2: talk about a language you want to learn', 'Part 3: "Is English too dominant globally?"', 'Full Speaking Practice: P1+P2+P3', 'Phân tích lỗi mock 1', 'Luyện nói: phong cách tự nhiên hơn', 'Mock Test 2: Full Speaking'],
  18: ['Speaking: tổng ôn tất cả chủ đề Phase 4', 'Speaking: luyện random topics – không chuẩn bị', 'Speaking: pronunciation hoàn thiện', 'Full Speaking Practice: P1+P2+P3', 'Speaking: tập trung fluency & coherence', 'Speaking: tổng ôn chiến lược', 'Mock Test 3: Full Speaking'],
  19: ['Speaking: phân tích lỗi sai 3 mock vừa qua', 'Speaking: tập trung khu vực yếu nhất', 'Speaking: luyện Band 7 target specific topics', 'Full Speaking Practice: P1+P2+P3', 'Speaking: tổng ôn nước rút', 'Chiến lược ngày thi – quản lý căng thẳng', 'Mock Test 4: Full Speaking'],
  20: ['Mock Speaking: đề chính thức Practice 1', 'Mock Speaking: đề chính thức Practice 2', 'Phân tích lỗi sai lần cuối', 'Speaking: chiến lược ngày thi cuối cùng', 'Speaking: luyện đề thực chiến Band 7+', 'Nghỉ ngơi – nói chuyện tiếng Anh tự nhiên', 'Mock Test 5: Full Speaking + tổng kết lộ trình'],
};

const V_TOPICS: Record<number, string[]> = {
  1:  ['20 từ chủ đề môi trường: pollution, ecosystem, biodiversity...', '20 từ: climate change, emission, greenhouse effect...', 'Collocations môi trường: tackle climate change, reduce emissions...', '20 từ: conservation, sustainable, renewable energy...', 'Word forms: environment→environmental→environmentally...', 'Ôn tập 80 từ tuần 1: flashcard review', 'Review + quiz: 80 từ môi trường'],
  2:  ['20 từ: digital revolution, artificial intelligence, algorithm...', '20 từ: automation, robotics, machine learning, data...', 'Collocations công nghệ: access the internet, upgrade software...', '20 từ: cybersecurity, privacy, social media, influencer...', 'Word forms: technology→technological→technologically...', 'Ôn tập 80 từ tuần 2', 'Review + quiz: 80 từ công nghệ'],
  3:  ['20 từ: curriculum, pedagogy, tuition, scholarship...', '20 từ: higher education, vocational training, literacy...', 'Collocations: pursue a degree, attend a lecture, pass an exam...', '20 từ: academic achievement, cognitive development, critical thinking...', 'Word forms: educate→education→educational→educator...', 'Ôn tập 80 từ tuần 3', 'Review + quiz: 80 từ giáo dục'],
  4:  ['20 từ: disease, treatment, prescription, medication...', '20 từ: mental health, anxiety, depression, well-being...', 'Collocations y tế: seek medical advice, undergo surgery...', '20 từ: healthcare system, public health, epidemic, vaccine...', 'Word forms: medicate→medication→medical...', 'Ôn tập 80 từ tuần 4', 'Review + quiz: 80 từ sức khoẻ'],
  5:  ['20 từ: inequality, discrimination, community, solidarity...', '20 từ: social welfare, poverty, migration, diversity...', 'Collocations xã hội: address inequality, promote diversity...', 'Academic Word List (AWL) list 1: analyse, approach, area...', 'Grammar: câu phức với although, despite, whereas...', 'Ôn 80 từ + AWL list 1', 'Review + quiz tổng hợp Phase 1'],
  6:  ['20 từ: hypothesis, experiment, methodology, findings...', '20 từ: breakthrough, innovation, laboratory, specimen...', 'Collocations khoa học: conduct research, draw conclusions...', 'AWL list 2: benefit, concept, context, data...', 'Grammar: Passive voice nâng cao (researches were conducted...)', 'Ôn 80 từ khoa học + AWL list 2', 'Review + quiz: khoa học'],
  7:  ['20 từ: entrepreneur, profit, investment, revenue...', '20 từ: supply chain, merger, shareholder, dividend...', 'Collocations kinh doanh: launch a product, generate revenue...', 'AWL list 3: establish, evaluate, evidence, export...', 'Grammar: Conditionals (If the company invests, it will...)', 'Ôn 80 từ kinh tế + AWL list 3', 'Review + quiz: kinh doanh'],
  8:  ['20 từ: heritage, aesthetics, curator, exhibition...', '20 từ: architecture, sculpture, genre, creativity...', 'Collocations: foster creativity, preserve heritage...', 'AWL list 4: function, identify, income, indicate...', 'Grammar: Relative clauses (The artist who/which/whose...)', 'Ôn 80 từ nghệ thuật + AWL list 4', 'Review + quiz: nghệ thuật'],
  9:  ['20 từ: infrastructure, congestion, commuter, transit...', '20 từ: emission, pedestrian, vehicle, urban planning...', 'Collocations: ease congestion, expand infrastructure...', 'AWL list 5: individual, interpret, involve, maintain...', 'Grammar: Comparison structures (far more, significantly less...)', 'Ôn 80 từ giao thông + AWL list 5', 'Review + quiz: giao thông'],
  10: ['20 từ: legislation, judiciary, offence, rehabilitation...', '20 từ: deterrent, prosecution, sentence, bail...', 'Collocations pháp luật: commit a crime, enforce the law...', 'AWL list 6: participate, perceive, policy, principle...', 'Grammar: Modal verbs (should, must, ought to, might...)', 'Ôn 80 từ pháp luật + AWL list 6', 'Review + quiz Phase 2'],
  11: ['20 từ: pesticide, harvest, irrigation, livestock...', '20 từ: organic, genetically modified, food security...', 'Collocations nông nghiệp: grow crops, rear livestock...', 'AWL list 7: procedure, require, research, respond...', 'Grammar: Reported speech (Scientists say that/claim that...)', 'Ôn 80 từ nông nghiệp + AWL list 7', 'Review + quiz: thực phẩm'],
  12: ['20 từ: governance, democracy, legislation, constitution...', '20 từ: corruption, bureaucracy, policymaker, referendum...', 'Collocations chính trị: implement a policy, hold an election...', 'AWL list 8: significant, source, specific, structure...', 'Grammar: Cleft sentences (It is the government that should...)', 'Ôn 80 từ chính trị + AWL list 8', 'Review + quiz: chính phủ'],
  13: ['20 từ: journalism, broadcast, censorship, propaganda...', '20 từ: editorial, subscription, clickbait, algorithm...', 'Collocations truyền thông: spread information, filter news...', 'AWL list 9: theory, transfer, vary, significant...', 'Grammar: Concession clauses (even though, in spite of...)', 'Ôn 80 từ truyền thông + AWL list 9', 'Review + quiz: truyền thông'],
  14: ['20 từ: cognitive, perception, stimulus, motivation...', '20 từ: bias, subconscious, resilience, empathy...', 'Collocations tâm lý: influence behaviour, boost confidence...', 'AWL list 10: attitude, challenge, chapter, comment...', 'Grammar: Advanced conditionals (Were I to..., Had they...)', 'Ôn 80 từ tâm lý + AWL list 10', 'Review + quiz: tâm lý học'],
  15: ['Ôn tập toàn bộ AWL list 1-10', 'Collocations nâng cao: 50 cụm quan trọng nhất', 'Từ vựng theo band: so sánh Band 6 vs Band 7 vocabulary', 'Word families: 30 từ gốc quan trọng', 'Từ vựng chủ đề: ôn 15 chủ đề Phases 1-3', 'Luyện sử dụng từ vựng trong bài viết', 'Review tổng hợp AWL + chủ đề Phase 3'],
  16: ['20 từ: carbon footprint, fossil fuel, solar panel...', '20 từ: biodegradable, emission, grid, turbine...', 'Collocations năng lượng: harness solar power, reduce carbon...', 'Idioms tiếng Anh học thuật: in the long run, take into account...', 'Phrasal verbs quan trọng: carry out, set up, look into...', 'Ôn tập toàn bộ vocabulary 16 tuần', 'Review + quiz: năng lượng'],
  17: ['20 từ: bilingual, dialect, fluency, acquisition...', '20 từ: semantics, syntax, pragmatics, corpus...', 'Collocations ngôn ngữ: acquire a language, master a skill...', 'Idioms cho writing & speaking: by and large, as a rule...', 'Ôn vocabulary tổng hợp theo band target', 'Vocabulary: chuẩn bị từ nước rút Phase 4', 'Review + quiz: ngôn ngữ'],
  18: ['Ôn tập 400 từ quan trọng nhất – random quiz', 'Collocations tổng hợp: 60 cụm hay nhất', 'Từ vựng theo kỹ năng: vocabulary cho Writing Task 2', 'Từ vựng theo kỹ năng: vocabulary cho Speaking Part 3', 'AWL tổng ôn: 100 từ quan trọng nhất', 'Idioms & phrases tổng ôn', 'Quiz lớn: 100 từ vựng tổng hợp'],
  19: ['Vocabulary: phân tích lỗi từ vựng sai trong mock tests', 'Vocabulary: từ vựng theo chủ đề đề thi thực tế', 'Vocabulary: hoàn thiện collocations yếu nhất', 'Vocabulary: 50 từ dễ nhầm (affect/effect, principal/principle...)', 'Ôn vocabulary cuối: từ hay quên nhất', 'Chiến lược dùng từ đúng trong khi thi', 'Quiz nước rút: 80 từ vựng chiến lược'],
  20: ['Vocabulary: ôn 20 từ mới nhất từ đề thi thực chiến', 'Vocabulary: tổng ôn và củng cố lần cuối', 'Vocabulary: từ vựng cho từng kỹ năng ngày thi', 'Vocabulary: từ vựng band target 7.5', 'Ôn tổng hợp lần cuối', 'Nghỉ ngơi – không học từ mới, chỉ ôn lại', 'Tổng kết hành trình 140 ngày 🏆'],
};

const DAY_TITLES: Record<number, string[]> = {
  1: ['Ngày Khởi Đầu', 'Bứt Phá Ngày 2', 'Xây Nền Vững', 'Đào Sâu Kiến Thức', 'Chinh Phục Kỹ Năng', 'Tổng Hợp & Luyện Tập', '✅ Ôn Tập Tuần'],
  2: ['Chiến Lược Mới', 'Nâng Cao Kỹ Năng', 'Làm Chủ Từ Vựng', 'Luyện Đề Thực Tế', 'Phân Tích Chuyên Sâu', 'Tổng Luyện', '✅ Mini Test Tuần 2'],
  3: ['Bứt Phá Tiếp Theo', 'Chinh Phục Chiến Lược', 'Nâng Tầm Kỹ Năng', 'Luyện Tập Có Hệ Thống', 'Tổng Hợp Nâng Cao', 'Luyện Đề Thực Chiến', '✅ Review Tuần 3'],
  4: ['Học Sâu Hơn', 'Chiến Lược Thi Cử', 'Nâng Cao Toàn Diện', 'Luyện Kỹ Năng Đỉnh Cao', 'Tổng Hợp Chiến Thuật', 'Thi Thử & Đánh Giá', '✅ Mini Mock Tuần 4'],
};

function getTitle(week: number, dayOfWeek: number): string {
  const titles = DAY_TITLES[Math.min(week, 4)];
  return titles[dayOfWeek - 1];
}

export function generateRoadmap(): RoadmapDay[] {
  const days: RoadmapDay[] = [];

  for (let day = 1; day <= 140; day++) {
    const week = Math.ceil(day / 7);
    const dayOfWeek = ((day - 1) % 7) + 1; // 1–7
    const phase: Phase = day <= 35 ? 1 : day <= 70 ? 2 : day <= 105 ? 3 : 4;
    const weekInfo = WEEK_THEMES[week - 1];
    const isReview = dayOfWeek === 7;
    const isMilestone = day === 35 || day === 70 || day === 105 || day === 140;
    const milestoneLabels: Record<number, string> = {
      35: '🏆 Thi Thử Phase 1', 70: '🏆 Thi Thử Phase 2',
      105: '🏆 Thi Thử Phase 3', 140: '🎓 Hoàn Thành Lộ Trình!',
    };

    const lDesc = L_TOPICS[week]?.[dayOfWeek - 1] ?? 'Luyện Listening tổng hợp';
    const rDesc = R_TOPICS[week]?.[dayOfWeek - 1] ?? 'Luyện Reading tổng hợp';
    const wDesc = W_TOPICS[week]?.[dayOfWeek - 1] ?? 'Luyện Writing tổng hợp';
    const sDesc = S_TOPICS[week]?.[dayOfWeek - 1] ?? 'Luyện Speaking tổng hợp';
    const vDesc = V_TOPICS[week]?.[dayOfWeek - 1] ?? 'Ôn tập từ vựng';

    let tasks: DayTask[];

    if (isMilestone) {
      tasks = [
        { skill: 'mock', emoji: '🎯', duration: 60, description: 'Listening: Full test (40 câu – 30 phút)' },
        { skill: 'mock', emoji: '📖', duration: 60, description: 'Reading: Full test (40 câu – 60 phút)' },
        { skill: 'mock', emoji: '✍️', duration: 30, description: 'Writing: Task 1 + Task 2 một phần (30 phút)' },
        { skill: 'mock', emoji: '🗣️', duration: 30, description: 'Speaking: Tự ghi âm Part 1 + Part 2 + Part 3' },
      ];
    } else if (isReview) {
      tasks = [
        { skill: 'vocab', emoji: '🧠', duration: 40, description: vDesc },
        { skill: 'listening', emoji: '🎧', duration: 50, description: lDesc },
        { skill: 'reading', emoji: '📖', duration: 50, description: rDesc },
        { skill: week % 2 === 0 ? 'speaking' : 'writing', emoji: week % 2 === 0 ? '🗣️' : '✍️', duration: 40, description: week % 2 === 0 ? sDesc : wDesc },
      ];
    } else {
      // Alternate W/S based on day of week
      const isWritingDay = dayOfWeek <= 4;
      tasks = [
        { skill: 'vocab', emoji: '🧠', duration: 35, description: vDesc },
        { skill: 'listening', emoji: '🎧', duration: 45, description: lDesc },
        { skill: 'reading', emoji: '📖', duration: 55, description: rDesc },
        {
          skill: isWritingDay ? 'writing' : 'speaking',
          emoji: isWritingDay ? '✍️' : '🗣️',
          duration: 45,
          description: isWritingDay ? wDesc : sDesc,
        },
      ];
    }

    days.push({
      day,
      week,
      phase,
      theme: weekInfo.theme,
      themeEn: weekInfo.themeEn,
      dayTitle: getTitle(Math.min(week, 4), dayOfWeek),
      tasks,
      isMilestone,
      milestoneLabel: milestoneLabels[day],
    });
  }

  return days;
}

export const ROADMAP: RoadmapDay[] = generateRoadmap();

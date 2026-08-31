// lib/roadmap-data.ts — IELTS 140-day roadmap: 5.5 → 7.5, 3h/day

export type Phase = 1 | 2 | 3 | 4;
export type TaskType = 'vocab' | 'reading' | 'listening' | 'writing' | 'speaking' | 'grammar' | 'mock';

export interface DayTask {
  id: string;       // unique per-day key for checkbox tracking
  type: TaskType;
  title: string;    // short title shown in checklist
  detail: string;   // full description shown in modal
  url?: string;     // resource URL
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
  { id: 1 as Phase, name: 'Xây Nền Tảng',  bandRange: '5.5 → 6.0', days: [1,35]   as [number,number], color: '#4f8ef7', bg: '#EFF6FF', description: 'Nắm format IELTS, chiến lược cơ bản và từ vựng nền tảng cho 5 chủ đề đầu.' },
  { id: 2 as Phase, name: 'Bứt Phá',       bandRange: '6.0 → 6.5', days: [36,70]  as [number,number], color: '#a855f7', bg: '#F5F3FF', description: 'Chinh phục dạng câu khó, xây chiến lược thi bài bản, nâng vocab học thuật.' },
  { id: 3 as Phase, name: 'Đào Sâu',       bandRange: '6.5 → 7.0', days: [71,105] as [number,number], color: '#06b6d4', bg: '#ECFEFF', description: 'Nâng cao 4 kỹ năng lên Band 7: inference, complex grammar, academic style.' },
  { id: 4 as Phase, name: 'Thực Chiến',    bandRange: '7.0 → 7.5', days: [106,140] as [number,number], color: '#f59e0b', bg: '#FFFBEB', description: 'Full mock test, phân tích lỗi sai từng tiêu chí, tinh chỉnh đến ngày thi.' },
];

// ─── URL Constants ──────────────────────────────────────────
const BBC6   = 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english';
const BCG    = 'https://learnenglish.britishcouncil.org/grammar';
const BCR    = 'https://learnenglish.britishcouncil.org/reading';
const BCL    = 'https://learnenglish.britishcouncil.org/listening';
const VOA    = 'https://learningenglish.voanews.com/';
const BBCENV = 'https://www.bbc.com/news/science-environment';
const BBCTECH= 'https://www.bbc.com/news/technology';
const BBCHLTH= 'https://www.bbc.com/news/health';
const BBCBIZ = 'https://www.bbc.com/news/business';
const BBCWRD = 'https://www.bbc.com/news/world';
const IELTS  = 'https://ieltsonlinetests.com/';
const TED    = 'https://ed.ted.com/';

// ─── Week Data (20 weeks × 7 days × 3 tasks) ────────────────
type T = { id: string; type: TaskType; title: string; detail: string; url?: string };
type WeekDef = { theme: string; themeEn: string; phase: Phase; milestone?: string; days: [T,T,T][] };

const WEEKS: WeekDef[] = [

  // ════════════════════════════════════════════════════════════
  //  PHASE 1 — XÂY NỀN TẢNG (Days 1–35)
  // ════════════════════════════════════════════════════════════

  // ── Week 1: Environment & Climate Change ──────────────────
  {
    theme: 'Môi trường & Biến đổi khí hậu', themeEn: 'Environment & Climate Change', phase: 1,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng ô nhiễm & hệ sinh thái',     detail:'Học 20 từ: pollution, contamination, ecosystem, biodiversity, habitat, deforestation, erosion, toxic, emissions, greenhouse, fossil fuel, ozone layer, carbon footprint, sustainable, conservation, extinction, acid rain, smog, landfill, pesticide. Đặt 5 câu ví dụ.' },
        { id:'g', type:'grammar', title:'Câu điều kiện loại 1 & 2',            detail:'Lý thuyết & bài tập: Type 1 – If we reduce emissions, temperatures will fall. Type 2 – If governments invested more, the situation would improve. Viết 5 câu điều kiện về môi trường, kiểm tra tại British Council Grammar.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Cá nhân vs Chính phủ bảo vệ MT', detail:'Đề: "Some people think individuals should be responsible for protecting the environment. Others believe governments should. Discuss both views and give your own opinion." Lập outline (10p) → viết full essay (40p, ≥250 từ).' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations môi trường',              detail:'Học 20 cụm: tackle climate change, reduce carbon emissions, combat deforestation, implement green policies, raise awareness, harness solar energy, curb pollution, protect endangered species, preserve habitats, go carbon neutral. Dùng trong câu.' },
        { id:'r', type:'reading', title:'BBC: Tác động của ô nhiễm không khí',  detail:'Đọc tin tức mới nhất trên BBC Science & Environment về air pollution. Xác định main idea mỗi đoạn, ghi 8 từ học thuật mới, tìm 3 câu passive voice. Tóm tắt bài bằng 3 câu tiếng Anh.', url: BBCENV },
        { id:'s', type:'speaking',title:'Part 2: Vấn đề môi trường địa phương', detail:'Cue card: "Describe an environmental problem in your local area. Say: what it is, what causes it, what effects it has, what should be done." 1 phút chuẩn bị → 2 phút nói → ghi âm → nghe lại & nhận xét fluency.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng năng lượng tái tạo',           detail:'Học 20 từ: renewable energy, solar power, wind turbine, hydroelectric, geothermal, nuclear energy, carbon neutral, net zero, energy efficiency, biomass, tidal power, photovoltaic, off-grid, sustainability, clean energy, grid, subsidy, incentive, transition, decarbonisation.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Climate change',   detail:'Vào BBC 6 Minute English, tìm episode chủ đề climate/environment. Nghe lần 1 không transcript (ghi key words). Nghe lần 2 với transcript. Trả lời câu hỏi mở đầu episode. Ghi 5 cụm từ hữu ích.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 1: Biểu đồ CO₂ emissions',        detail:'Mô tả line chart: CO₂ emissions (tonnes/capita) của UK, USA, China từ 1990–2020. Tự tra số liệu thực (Our World in Data) hoặc dùng số liệu giả định. Viết 20 phút, focus vào overview + key trends, dùng so sánh.' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Plastic pollution',      detail:'Làm 1 reading passage về plastic pollution trên ieltsonlinetests.com. Tập trung dạng T/F/NG và Matching Information. Tính giờ (20 phút), chấm điểm, phân tích câu sai. Ghi lại từ không biết.', url: IELTS },
        { id:'g', type:'grammar', title:'Thể bị động học thuật',                 detail:'Passive voice trong IELTS: "Millions of tonnes of CO₂ are released each year." "The Paris Agreement was signed by 195 countries." Chuyển 10 câu active → passive về chủ đề môi trường. Luyện trên British Council Grammar.', url: BCG },
        { id:'s', type:'speaking',title:'Part 3: Trách nhiệm môi trường',        detail:'Thảo luận 3 câu: (1) Who is more responsible for climate change—individuals, corporations, or governments? (2) Is it too late to reverse environmental damage? (3) What lifestyle changes can reduce carbon footprint? Mỗi câu nói ≥1 phút, dùng hedging: "It seems to me...", "One could argue..."' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng chính sách môi trường',        detail:'Học 15 từ: regulation, legislation, carbon tax, green subsidy, Paris Agreement, Kyoto Protocol, international cooperation, NGO, activist, environmental impact assessment, remediation, mitigation, adaptation, carbon trading, cap-and-trade. Tìm hiểu nghĩa và ví dụ.' },
        { id:'l', type:'listening',title:'VOA: Climate change solutions',        detail:'Vào VOA Learning English, tìm story về climate change solutions/renewable energy. Nghe và ghi: 3 giải pháp được đề cập, specific numbers/statistics, tên tổ chức/người được nhắc. Tóm tắt bằng 4 câu.', url: VOA },
        { id:'s', type:'speaking',title:'Part 1: Thói quen bảo vệ môi trường',  detail:'Luyện 8 Part 1 questions: "Do you recycle?" / "How do you help the environment?" / "Do you think electric cars are important?" / "Is your city polluted?" / "What can individuals do about climate change?" Mỗi câu 2-3 câu trả lời, tự nhiên, ghi âm.' },
      ],
      [
        { id:'r', type:'reading', title:'British Council B2: Environment',       detail:'Làm bài đọc B2 trên British Council LearnEnglish. Ghi chú cách tác giả dùng linking words (however, furthermore, as a result). Xác định thesis + supporting arguments. Tóm tắt structure của bài.', url: BCR },
        { id:'w', type:'writing', title:'Task 2: Tăng giá xăng dầu',            detail:'Đề: "The only way to solve traffic and pollution problems in cities is to increase the price of petrol. To what extent do you agree?" Viết full essay 40 phút (≥250 từ). Tự chấm: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammar (mỗi tiêu chí 1–9).' },
        { id:'g', type:'grammar', title:'Relative clauses nâng cao',             detail:'Defining vs non-defining: "The Amazon, which covers 60% of Brazil, is shrinking." / "Countries that fail to meet targets will face penalties." Viết 6 câu về môi trường, 3 defining + 3 non-defining. Kiểm tra dấu phẩy.', url: BCG },
      ],
      [
        { id:'v', type:'vocab',   title:'Ôn 80 từ tuần 1 – Environment',        detail:'Flashcard quiz không nhìn từ: viết nghĩa tiếng Việt của 80 từ đã học tuần 1. Lọc ra 15 từ khó nhất → học lại. Đặt 3 câu IELTS-style dùng từ bạn thường quên nhất.' },
        { id:'l', type:'listening',title:'IELTS Listening S4: Môi trường',      detail:'Làm IELTS Listening Section 4 (bài giảng academic về environmental science) trên ieltsonlinetests.com. Tính giờ (30 phút cho 40 câu), chấm điểm, phân tích lỗi sai từng câu.', url: IELTS },
        { id:'r', type:'reading', title:'Full IELTS Reading passage: Climate',  detail:'Làm 1 full IELTS Reading passage về climate change (13 câu, 20 phút). Tập trung Matching Headings + T/F/NG. Sau khi làm, đọc transcript và highlight paraphrasing (cách đề hỏi khác văn bản).', url: IELTS },
      ],
    ],
  },

  // ── Week 2: Technology & Innovation ──────────────────────
  {
    theme: 'Công nghệ & Đổi mới', themeEn: 'Technology & Innovation', phase: 1,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng AI & tự động hóa',             detail:'Học 20 từ: artificial intelligence, machine learning, algorithm, automation, robotics, data analytics, neural network, deep learning, cloud computing, cybersecurity, digital transformation, disruptive technology, innovation, prototype, scalable, interface, coding, software, hardware, app development.' },
        { id:'g', type:'grammar', title:'Noun clauses & mệnh đề danh ngữ',      detail:'"It is clear that AI will transform employment." / "What concerns many people is the lack of regulation." / "The fact that robots can perform surgery is remarkable." Viết 6 câu noun clauses về công nghệ. Phân biệt: that-clauses, wh-clauses.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: AI và nguy cơ mất việc làm',   detail:'Đề: "Artificial intelligence is a threat to jobs and employment. To what extent do you agree or disagree?" Viết outline (10p) + full essay (40p). Chú ý: dùng conditionals, hedging language, academic vocabulary.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations công nghệ',                detail:'Học 20 cụm: develop an app, launch a product, upgrade software, access the internet, store data, hack a system, boost productivity, streamline processes, implement technology, adopt innovation, disrupt an industry, integrate systems, process data, run an algorithm, deploy AI.' },
        { id:'r', type:'reading', title:'BBC Technology: Tin tức công nghệ',     detail:'Đọc 1 bài mới nhất trên BBC Technology về AI, robotics hoặc social media. Ghi chú: main argument, supporting evidence, author\'s stance. Xác định 5 collocations mới. Đặt 2 câu dùng chúng.', url: BBCTECH },
        { id:'s', type:'speaking',title:'Part 2: Mô tả thiết bị công nghệ',     detail:'Cue card: "Describe a piece of technology that you find very useful. Say: what it is, how long you have used it, how you use it, and why it is useful to you." Ghi âm 2 phút, chú ý: past tense (how long), present habit, reasons with because/since.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng mạng xã hội & truyền thông',  detail:'Học 20 từ: social media, influencer, viral content, algorithm, echo chamber, digital literacy, misinformation, privacy, cyberbullying, online community, streaming, subscription, platform, engagement, follower, hashtag, filter bubble, fake news, content creator, digital footprint.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Technology',        detail:'Tìm BBC 6 Minute English episode về technology/social media/AI. Nghe không transcript lần 1, ghi key arguments. Lần 2 với transcript: highlight hedging phrases (could be, might, seems to), ghi 5 útil expressions.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 1: Biểu đồ sử dụng internet',     detail:'Mô tả bar chart: % người dùng internet theo độ tuổi ở 3 quốc gia năm 2023. Tự tra hoặc dùng số liệu giả định. Chú ý: so sánh groups, dùng language of proportion (the majority, a minority, nearly half).' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Social media impact',   detail:'Làm passage IELTS về social media và mental health trên ieltsonlinetests.com. 20 phút, 13 câu. Focus: Matching Information + Short Answer. Sau đó phân tích từ vựng học thuật trong passage.', url: IELTS },
        { id:'g', type:'grammar', title:'So sánh nâng cao',                      detail:'Comparison structures: "significantly more/less than", "considerably higher/lower", "roughly twice as many as", "the fastest-growing". Viết 8 câu so sánh dùng dữ liệu công nghệ giả định. Dùng trong Task 1 writing.', url: BCG },
        { id:'s', type:'speaking',title:'Part 3: Tác động xã hội của mạng XH',  detail:'Discuss 3 questions: (1) How has social media changed the way people communicate? (2) Do you think social media does more harm than good? (3) Should governments regulate social media platforms? Dùng: "On the one hand...", "There is a strong case for..."' },
      ],
      [
        { id:'v', type:'vocab',   title:'Word forms – Technology',               detail:'Luyện word families: innovate→innovation→innovative→innovator / automate→automation→automated→automatic / digital→digitise→digitisation / communicate→communication→communicative. Viết 8 câu dùng đúng word form, sửa lỗi phổ biến.' },
        { id:'l', type:'listening',title:'TED-Ed: The future of technology',     detail:'Vào TED-Ed, xem 1 video về AI, robotics hoặc the future of work (mục Science → Technology). Ghi 3 main arguments của speaker, 5 academic expressions, 1 statistic. Viết 100 từ tóm tắt bằng tiếng Anh.', url: TED },
        { id:'s', type:'speaking',title:'Part 1: Công nghệ trong cuộc sống',    detail:'Luyện: "What technology do you use every day?" / "Do you think children use technology too much?" / "How has technology changed your daily life?" / "Do you prefer reading physical books or e-books?" Mỗi câu mở rộng ít nhất 3 câu.' },
      ],
      [
        { id:'r', type:'reading', title:'British Council: Technology B2',        detail:'Đọc bài B2 British Council về technology. Phân tích cấu trúc argument: claim → evidence → example → conclusion. Highlight: opinion phrases (arguably, it can be argued that), concession phrases (although, despite this).', url: BCR },
        { id:'w', type:'writing', title:'Task 2: Công nghệ và sự riêng tư',     detail:'Đề: "Advances in technology mean that it is becoming increasingly easy for governments to monitor people\'s activities. Is this a positive or negative development?" Viết 40 phút. Dùng passive voice và hedging language.' },
        { id:'g', type:'grammar', title:'Gerunds vs Infinitives',                detail:'"Using social media can be addictive." vs "It is important to protect your privacy." vs "People tend to spend more time online." Viết 10 câu về technology dùng đúng gerund/infinitive sau: enjoy, avoid, seem, manage, recommend, encourage, refuse, admit.', url: BCG },
      ],
      [
        { id:'v', type:'vocab',   title:'Ôn 80 từ tuần 2 – Technology',         detail:'Random quiz: flashcard test 80 từ tech tuần 2. Chia 2 nhóm: từ đã thuộc (xanh) và từ cần học lại (đỏ). Học lại nhóm đỏ, đặt câu ví dụ cho 5 từ khó nhất.' },
        { id:'l', type:'listening',title:'IELTS Listening S3+S4: Technology',   detail:'Làm IELTS Section 3 (thảo luận sinh viên về tech project) + Section 4 (bài giảng về AI) trên ieltsonlinetests.com. Chú ý: Section 3 – multiple speakers, distinguish opinions. Section 4 – predict from headings.', url: IELTS },
        { id:'r', type:'reading', title:'Full IELTS Reading: Technology topic',  detail:'Làm 1 IELTS Reading passage về technology innovation (20 phút, 13 câu). Dùng: skim title/headings trước (1 phút), scan cho keywords, đọc câu hỏi trước khi đọc đoạn liên quan.', url: IELTS },
      ],
    ],
  },

  // ── Week 3: Education & Learning ─────────────────────────
  {
    theme: 'Giáo dục & Học tập', themeEn: 'Education & Learning', phase: 1,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng hệ thống giáo dục',            detail:'Học 20 từ: curriculum, pedagogy, tuition, scholarship, literacy, vocational training, higher education, undergraduate, postgraduate, academic achievement, grade, assessment, examination, peer learning, critical thinking, rote learning, extracurricular, dropout, enrolment, faculty.' },
        { id:'g', type:'grammar', title:'Modal verbs: should, must, ought to',  detail:'"Students should be encouraged to think critically." / "Education must be accessible to all." / "Teachers ought to provide feedback regularly." Phân biệt must (obligation) vs should (recommendation) vs ought to (moral duty). Viết 8 câu về education policy.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Học online vs truyền thống',   detail:'Đề: "Some people believe that online education is as valuable as traditional classroom education. To what extent do you agree?" Outline (10p) + viết (40p). Chú ý: balanced argument với cả 2 mặt, dùng contrast connectors.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations giáo dục',                 detail:'Học 20 cụm: pursue a degree, attend a lecture, sit an exam, pass/fail a test, drop out of school, gain qualifications, foster critical thinking, broaden knowledge, develop skills, lifelong learning, teaching methodology, student-centred learning, standardised testing, tuition fees, student loan.' },
        { id:'r', type:'reading', title:'BBC/VOA: Hệ thống giáo dục toàn cầu',  detail:'Đọc bài trên BBC hoặc VOA về education systems (PISA rankings, university education, skills gap). Phân tích: what problem is identified? What solution is proposed? Ghi 6 academic phrases.', url: VOA },
        { id:'s', type:'speaking',title:'Part 2: Người thầy ấn tượng nhất',     detail:'Cue card: "Describe a teacher who has had a great influence on you. Say: who they are, what subject they taught, what made them special, and explain how they influenced you." 1p chuẩn bị → 2p nói. Dùng past tenses, specific examples.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng tâm lý học tập',               detail:'Học 15 từ: motivation, self-discipline, cognitive development, metacognition, growth mindset, learning style, attention span, concentration, procrastination, reinforcement, feedback, collaboration, constructivism, scaffolding, differentiated instruction. Tìm examples trong thực tế.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Education',         detail:'Tìm BBC 6 Min English episode về education (university, learning languages, memory). Nghe và ghi: 3 facts/statistics, 2 expert opinions, 1 question posed to listener. Trả lời câu hỏi đó bằng tiếng Anh.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 1: Biểu đồ số lượng SV đại học', detail:'Mô tả bar chart: số sinh viên đại học nam/nữ ở UK năm 2000, 2010, 2020. Tự tạo số liệu hợp lý hoặc tra real data. Focus: so sánh gender gap, describe overall trend, use language of change.' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Education system',       detail:'Làm IELTS Reading passage về education reform hoặc distance learning trên ieltsonlinetests.com. 20 phút. Sau khi làm: đọc explanation của từng câu sai, ghi lý do sai (misread, vocabulary, not found, etc).', url: IELTS },
        { id:'g', type:'grammar', title:'Articles (a/an/the/zero article)',      detail:'Nguyên tắc: "Education is important" (zero) / "The education system in Vietnam" (specific) / "a university" (first mention). Viết đoạn 100 từ về education, tự check articles. Ghi 5 fixed expressions: "on the whole", "in general", "by and large".', url: BCG },
        { id:'s', type:'speaking',title:'Part 3: Triết lý giáo dục',            detail:'Discuss: (1) Should university education be free? (2) Do you think exams are the best way to measure students\' ability? (3) How can schools better prepare students for the modern workplace? Dùng cleft: "What I believe is that..." / "It is the role of teachers to..."' },
      ],
      [
        { id:'v', type:'vocab',   title:'Academic Word List (AWL) – Batch 1',   detail:'Học 20 từ AWL quan trọng nhất: analyse, approach, assess, assume, authority, available, benefit, concept, consist, context, constitute, create, data, define, derive, distribute, economy, environment, establish, evaluate. Tra CollinsDictionary.com cho collocations.' },
        { id:'l', type:'listening',title:'British Council: Education listening', detail:'Làm bài listening B2 trên British Council LearnEnglish (chủ đề education/school). Sau khi làm: nghe lại và đọc transcript đồng thời, highlight những chỗ bạn nghe sai, phân tích lý do (accent, speed, vocabulary).', url: BCL },
        { id:'s', type:'speaking',title:'Part 1: Trường học và sở thích',       detail:'Luyện 8 questions: "What was your favourite subject at school?" / "Do you think it\'s important to study a foreign language?" / "Did you enjoy studying as a child?" / "What do you think is the best way to learn a new language?" Expand every answer.' },
      ],
      [
        { id:'r', type:'reading', title:'British Council: Education B2',         detail:'Làm reading task B2 về education. Phân tích 5 techniques: (1) read question first, (2) skim passage for structure, (3) underline keywords in question, (4) locate answer area, (5) verify with exact words. Viết tóm tắt technique bạn học được.', url: BCR },
        { id:'w', type:'writing', title:'Task 2: Giáo dục và thị trường lao động', detail:'Đề: "Some people argue that education systems should focus on providing students with the skills they need to find employment. Others believe education should have broader goals. Discuss both views." Viết 40p, dùng parallel structure và transitional phrases.' },
        { id:'g', type:'grammar', title:'Reported speech trong học thuật',       detail:'"Researchers claim that..." / "The study argues that..." / "Critics suggest that..." Chuyển 8 câu direct speech → reported speech. Lưu ý: backshift tenses, reporting verbs (argue, claim, suggest, maintain, note, state).', url: BCG },
      ],
      [
        { id:'v', type:'vocab',   title:'Ôn 80 từ tuần 3 – Education',          detail:'Quiz tổng hợp: viết 10 collocations với từ "education", định nghĩa 10 từ AWL, đặt 5 câu IELTS-style dùng từ vựng tuần 3. Kiểm tra bằng cách giải thích từng từ bằng tiếng Anh (monolingual thinking).' },
        { id:'l', type:'listening',title:'IELTS Listening S3+S4: Education',    detail:'Làm IELTS S3 (thảo luận giữa sinh viên và giáo viên về luận văn) và S4 (bài giảng về learning theories). Sau đó nghe lại và đọc full script, highlight từ/cụm bạn không nghe được.', url: IELTS },
        { id:'r', type:'reading', title:'IELTS Reading: Learning & memory',     detail:'Làm passage IELTS về how people learn / memory research (20 phút). Xác định: Which paragraph mentions X? (Matching Information). Sau đó: viết 50 từ tóm tắt main argument của bài đọc.', url: IELTS },
      ],
    ],
  },

  // ── Week 4: Health & Medicine ─────────────────────────────
  {
    theme: 'Sức khỏe & Y tế', themeEn: 'Health & Medicine', phase: 1,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng bệnh tật & điều trị',          detail:'Học 20 từ: disease, disorder, treatment, prescription, medication, symptoms, diagnosis, surgery, therapy, rehabilitation, chronic illness, acute, contagious, infectious, epidemic, pandemic, vaccination, immunity, fatality rate, mortality. Phân biệt: disease vs illness vs disorder.' },
        { id:'g', type:'grammar', title:'Cause & effect connectors',             detail:'"Smoking leads to lung disease." / "Due to poor diet, obesity rates are rising." / "As a result of stress, many people suffer insomnia." / "Consequently, healthcare costs increase." Học: because of, due to, as a result (of), therefore, consequently, hence, thus. Viết 8 câu.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Thuế đồ ăn không lành mạnh', detail:'Đề: "Some people think that governments should tax unhealthy food to reduce obesity. To what extent do you agree or disagree?" Viết outline + essay 40 phút. Dùng cause-effect language từ grammar bài hôm nay.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng sức khỏe tâm thần',            detail:'Học 20 từ: mental health, anxiety, depression, stress, burnout, well-being, therapy, counselling, resilience, mindfulness, disorder, phobia, trauma, stigma, awareness campaign, suicide prevention, self-care, work-life balance, psychological support, emotional intelligence.' },
        { id:'r', type:'reading', title:'BBC Health: Sức khỏe tâm thần hiện đại', detail:'Đọc bài BBC Health về mental health (stress at work, youth mental health crisis, etc). Ghi: 3 causes, 3 effects, 3 proposed solutions. Xác định mức độ formal của bài (formal/semi-formal) và dẫn chứng.', url: BBCHLTH },
        { id:'s', type:'speaking',title:'Part 2: Thói quen sức khỏe',           detail:'Cue card: "Describe a healthy habit you have. Say: what the habit is, when you started it, how it has affected you, and explain why you think it is important." 1p prep → 2p speak. Dùng present perfect (I have been doing this for...) + past simple (I started because...).' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng hệ thống y tế',                detail:'Học 15 từ: healthcare system, public health, primary care, specialist, hospital, clinic, GP (general practitioner), NHS, universal healthcare, private sector, health insurance, medical research, pharmaceutical industry, clinical trial, patient, ward, A&E, triage, prescription, over-the-counter.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Health topic',     detail:'Nghe BBC 6 Min English về health (diet, exercise, mental health, or medicine). Lần 1: viết 5 key words. Lần 2 với transcript: (1) tìm câu dùng passive, (2) ghi reported speech examples, (3) note how speakers express opinions.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 1: Biểu đồ béo phì',              detail:'Mô tả line chart về obesity rates (%) ở 4 quốc gia từ 1990–2020. Tập trung: overall trend, significant peaks, comparisons between countries. Dùng: "reached a peak of", "declined steadily", "remained relatively stable".' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Modern medicine',        detail:'Làm IELTS Reading passage về modern medicine/clinical research trên ieltsonlinetests.com. Focus: Matching Features (kết hợp người/tổ chức với ý kiến). Ghi 8 từ academic mới sau bài làm.', url: IELTS },
        { id:'g', type:'grammar', title:'Purpose clauses: so that, in order to', detail:'"Doctors recommend exercise in order to reduce the risk of heart disease." / "Governments invest in healthcare so that citizens can receive treatment." / "The drug was developed so as to combat antibiotic resistance." Viết 8 câu về health.', url: BCG },
        { id:'s', type:'speaking',title:'Part 3: Chính sách y tế',              detail:'Discuss: (1) Should governments spend more money on preventive healthcare or treating existing conditions? (2) Why do you think stress-related illnesses are increasing in modern society? (3) What role can technology play in improving healthcare? Dùng examples cụ thể.' },
      ],
      [
        { id:'v', type:'vocab',   title:'AWL – Batch 2 (Health focus)',         detail:'Học 20 từ AWL: factor, finance, focus, formula, function, identify, impact, indicate, interpret, involve, issue, labour, legal, maintain, major, method, occur, policy, procedure, process. Dùng trong câu về healthcare.' },
        { id:'l', type:'listening',title:'VOA: Healthcare and medicine',         detail:'Nghe VOA Learning English về healthcare (new medical discoveries, disease prevention, public health campaigns). Lấy ra: 1 main claim, 2 supporting examples, specific vocabulary về medicine. Viết 80 từ tóm tắt.', url: VOA },
        { id:'s', type:'speaking',title:'Part 1: Sức khỏe cá nhân',             detail:'Luyện: "Do you exercise regularly? What kind of exercise?" / "How do you maintain a healthy diet?" / "How do you deal with stress?" / "Have you ever been seriously ill?" / "What do you do to keep fit?" Avoid "Yes/No" answers, always expand with detail.' },
      ],
      [
        { id:'r', type:'reading', title:'British Council: Health B2',            detail:'Làm reading task B2 British Council về health/wellbeing. Sau đó: đọc lại bài và ghi (1) 3 hedging expressions, (2) 3 fact-presenting phrases (According to research..., Studies show..., It has been found that...), (3) 3 opinion phrases.', url: BCR },
        { id:'w', type:'writing', title:'Task 2: Lối sống lành mạnh',           detail:'Đề: "Many people believe that following a healthy diet and doing regular exercise are sufficient to stay healthy. Others think it is also necessary to avoid stress and get enough sleep. Discuss both views and give your opinion." 40 phút.' },
        { id:'g', type:'grammar', title:'Mixed conditionals & hypotheticals',   detail:'"If people exercised more, the healthcare system would not be under so much pressure." (Type 2) / "If the vaccine had been developed earlier, thousands of lives would have been saved." (Type 3). Viết 6 câu về health hypotheticals.', url: BCG },
      ],
      [
        { id:'v', type:'vocab',   title:'Ôn 80 từ tuần 4 – Health',            detail:'Quiz tổng hợp: test flashcards 80 từ health vocabulary. Focus: word forms (healthy/health/healthily, diagnose/diagnosis/diagnostic). Đặt 5 câu hoàn chỉnh về healthcare system dùng từ vựng tuần này.' },
        { id:'l', type:'listening',title:'IELTS Listening S3+S4: Health',       detail:'Làm IELTS Section 3 (sinh viên y thảo luận về dissertation về mental health) + S4 (bài giảng về public health campaign). Phân tích: những câu nào bạn sai vì paraphrase? Những câu nào sai vì không nghe kịp?', url: IELTS },
        { id:'r', type:'reading', title:'IELTS Reading: Healthcare passage',    detail:'Làm 1 IELTS Reading passage về healthcare/medicine (20 phút, 13 câu). Sau đó: tìm tất cả paraphrase trong bài (cách câu hỏi nói khác so với passage), viết 5 cặp paraphrase bạn tìm được.', url: IELTS },
      ],
    ],
  },

  // ── Week 5: Society & Community + MILESTONE ──────────────
  {
    theme: 'Xã hội & Cộng đồng', themeEn: 'Society & Community', phase: 1,
    milestone: '🏆 Mock Test Phase 1',
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng bất bình đẳng xã hội',        detail:'Học 20 từ: inequality, discrimination, poverty, social mobility, exclusion, marginalised groups, welfare state, safety net, social justice, privilege, diversity, inclusion, racism, gender pay gap, homelessness, charitable organisation, solidarity, community cohesion, integration, assimilation.' },
        { id:'g', type:'grammar', title:'Concession: although, despite, even if', detail:'"Although poverty has declined globally, inequality remains high in many countries." / "Despite significant progress, women are still underrepresented in leadership." / "Even though charities provide support, government intervention is essential." Viết 8 câu về social issues.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Bất bình đẳng xã hội',        detail:'Đề: "In many countries, the gap between rich and poor is growing. What causes this, and what can be done to reduce the problem?" Viết 40 phút. Problem-solution structure: para 1 intro, para 2 causes, para 3 solutions, para 4 conclusion.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations xã hội',                   detail:'Học 20 cụm: address inequality, promote diversity, tackle homelessness, reduce crime rates, implement social policy, strengthen community ties, foster social cohesion, empower individuals, break the cycle of poverty, provide social safety nets, raise living standards, bridge the digital divide, engage with the community.' },
        { id:'r', type:'reading', title:'VOA: Social issues',                    detail:'Đọc bài VOA về social issues (homelessness, immigration, inequality). Phân tích: author\'s position (neutral/biased?), types of evidence used (statistics, expert opinion, anecdote). Ghi 5 discourse markers mới.', url: VOA },
        { id:'s', type:'speaking',title:'Part 2: Sự kiện cộng đồng',            detail:'Cue card: "Describe a community event you participated in or heard about. Say: what the event was, where and when it took place, what people did, and explain what impact it had." Sử dụng detailed narrative structure với past tenses + adjectives for description.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng di cư & nhập cư',               detail:'Học 20 từ: immigration, emigration, refugee, asylum seeker, migrant worker, integration, multiculturalism, host country, cultural identity, diaspora, border control, visa, citizenship, naturalization, xenophobia, social cohesion, brain drain, remittance, displaced persons, humanitarian aid.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Society',           detail:'Nghe episode BBC 6 Min English về social issues (migration, social media, volunteering, etc). Ghi: (1) the question posed at the start, (2) 3 main points, (3) the answer to the question. Kiểm tra transcript.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 2: Ưu nhược điểm của toàn cầu hóa', detail:'Đề: "Globalisation has both benefits and drawbacks. To what extent do the advantages outweigh the disadvantages?" Viết 40 phút. Dùng: "On balance...", "The benefits far outweigh the drawbacks because..."' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Society passage',        detail:'Làm IELTS Reading passage về social issues / urbanisation / migration. 20 phút. Focus: câu hỏi Matching Headings – đọc headings trước, xác định key word của mỗi heading, tìm paragraph nào match.', url: IELTS },
        { id:'g', type:'grammar', title:'Quantifiers nâng cao',                  detail:'"The vast majority of...", "a significant minority of...", "relatively few...", "hardly any...", "an increasing number of...", "a growing proportion of..." Viết 8 câu về social statistics dùng quantifiers. Khác nhau giữa "much/many", "a lot of/lots of" trong formal writing.', url: BCG },
        { id:'s', type:'speaking',title:'Part 3: Các vấn đề xã hội',            detail:'Discuss: (1) What can be done to reduce crime in cities? (2) Is it the government\'s responsibility to help people who live in poverty? (3) How has immigration affected your country? Sử dụng specific country examples, statistics nếu có.' },
      ],
      [
        { id:'v', type:'vocab',   title:'AWL – Batch 3 + Review Phase 1',      detail:'Học AWL Batch 3: publish, range, region, require, research, respond, role, section, seek, show, significant, similar, source, specific, structure, theory, transfer, vary. Ôn lại AWL Batch 1+2 bằng cách viết 1 paragraph sử dụng 10 từ AWL.' },
        { id:'l', type:'listening',title:'Full IELTS Listening: Society',       detail:'Làm Full IELTS Listening Test (40 câu, 4 sections, 30 phút) về chủ đề xã hội trên ieltsonlinetests.com. Tính giờ nghiêm túc, không tạm dừng. Chấm điểm và ghi band score dự đoán.', url: IELTS },
        { id:'s', type:'speaking',title:'Part 1+2+3: Society topics',           detail:'Full Speaking Practice: Part 1 (4p): questions about your hometown, community, neighbours. Part 2 (3p): describe a social problem you are concerned about. Part 3 (4p): discuss government\'s role in social welfare. Ghi âm toàn bộ, nghe lại.' },
      ],
      [
        { id:'r', type:'reading', title:'Full IELTS Reading: 2 passages',       detail:'Làm 2 IELTS Reading passages liên tiếp (40 phút, 26 câu). Áp dụng chiến lược: mỗi passage 20 phút, ưu tiên câu dễ trước. Ghi điểm, phân tích khu vực yếu nhất (dạng câu nào sai nhiều nhất?).', url: IELTS },
        { id:'w', type:'writing', title:'Task 1+2 Full Practice',               detail:'Task 1 (20 phút): mô tả pie chart về household expenditure. Task 2 (40 phút): "In many countries, volunteering is becoming more popular. Why is this? Is this a positive development?" Viết không dừng, tự chấm sau.', },
        { id:'g', type:'grammar', title:'Ôn toàn bộ ngữ pháp Phase 1',         detail:'Review 10 grammar points đã học: conditionals, passive, relative clauses, cause-effect, purpose, modals, articles, reported speech, concession, quantifiers. Với mỗi point: viết 1 câu example về chủ đề khác nhau. Tổng hợp vào 1 cheatsheet.', url: BCG },
      ],
      // Day 35: MILESTONE — Phase 1 Mock Test
      [
        { id:'m1', type:'mock', title:'Mock Test: Listening (Full – 40 câu)', detail:'Làm Full IELTS Listening Test nghiêm túc (30 phút + 10 phút chuyển đáp án). Dùng đề thật từ Cambridge IELTS Books hoặc ieltsonlinetests.com. Ghi điểm, band score, phân tích sai.', url: IELTS },
        { id:'m2', type:'mock', title:'Mock Test: Reading (Full – 40 câu)',  detail:'Làm Full IELTS Reading Test (60 phút, 3 passages). Dùng timer nghiêm túc. Sau khi làm: chấm điểm, ghi lỗi sai theo loại câu hỏi (Matching Headings, T/F/NG, MCQ...), estimate band score.', url: IELTS },
        { id:'m3', type:'mock', title:'Mock Test: Writing + Speaking Review', detail:'Writing: Task 1 (20p) + Task 2 (40p) về bất kỳ chủ đề Phase 1. Speaking: ghi âm Part 1+2+3 hoàn chỉnh (~15p). Tự review hoặc dùng IELTS band descriptor checklist. Ghi notes cải thiện cho Phase 2.' },
      ],
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  PHASE 2 — BỨT PHÁ (Days 36–70)
  // ════════════════════════════════════════════════════════════

  // ── Week 6: Science & Research ───────────────────────────
  {
    theme: 'Khoa học & Nghiên cứu', themeEn: 'Science & Research', phase: 2,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng phương pháp nghiên cứu',       detail:'Học 20 từ: hypothesis, methodology, empirical, quantitative, qualitative, variable, sample, data, findings, conclusion, peer review, experiment, control group, longitudinal study, randomised trial, correlation, causation, bias, reproducibility, peer-reviewed journal. Phân biệt: theory vs hypothesis vs law.' },
        { id:'r', type:'reading', title:'IELTS Reading: Scientific research',   detail:'Làm IELTS passage về scientific discovery hoặc research methodology. Focus: câu Summary Completion – phân tích cách từ trong summary paraphrase từ trong passage. Ghi 8 paraphrase pairs.', url: IELTS },
        { id:'w', type:'writing', title:'Task 2: Đầu tư khoa học',              detail:'Đề: "Governments should invest more money in scientific research, even if this means reducing funding for other public services. To what extent do you agree?" Viết 40p, sử dụng specific examples (space exploration, medical research, etc).' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng phát minh & khám phá',         detail:'Học 20 từ: discovery, invention, breakthrough, innovation, patent, prototype, develop, pioneer, laboratory, specimen, microscope, telescope, genome, DNA, antibiotic, vaccine, nanotechnology, gene editing, CRISPR, space exploration. Phân biệt: discovery (existing thing found) vs invention (new thing created).' },
        { id:'l', type:'listening',title:'TED-Ed: Science & discovery',          detail:'Xem TED-Ed video về a scientific breakthrough (biology, physics, chemistry, or space). Ghi: (1) main claim, (2) evidence presented, (3) implications for the future. Viết 100 từ tóm tắt bằng tiếng Anh, dùng academic style.', url: TED },
        { id:'s', type:'speaking',title:'Part 2: Khám phá khoa học thú vị',    detail:'Cue card: "Describe a scientific discovery or invention that you think is particularly important. Say: what it is, who discovered/invented it, how it changed the world, and whether you think it has had a positive or negative impact." 2 phút nói.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations khoa học',                 detail:'Học 20 cụm: conduct research, carry out an experiment, draw conclusions, publish findings, analyse data, test a hypothesis, fund research, peer-review a paper, challenge assumptions, replicate results, apply for a grant, report results, identify patterns, establish a theory, question conventional wisdom.' },
        { id:'g', type:'grammar', title:'Advanced passive & impersonal sentences', detail:'"It has been argued that..." / "It is widely believed that..." / "Research suggests that..." / "It remains unclear whether..." / "There is growing evidence to suggest that..." Viết 10 câu về science dùng impersonal structures.', url: BCG },
        { id:'w', type:'writing', title:'Task 1: Biểu đồ quy trình khoa học',  detail:'Mô tả a process diagram (flow chart) về water purification hoặc the scientific method. Dùng: passive voice (is filtered, is treated), sequencing words (first, subsequently, following this, finally), precise vocabulary.' },
      ],
      [
        { id:'r', type:'reading', title:'BBC Science: Khoa học đương đại',       detail:'Đọc bài BBC Science/Environment về recent scientific breakthrough (genetics, space, environment). Phân tích: how does the author make the argument credible? (statistics, expert quotes, comparisons). Ghi 6 academic phrases.', url: BBCENV },
        { id:'l', type:'listening',title:'BBC 6 Min English: Science',           detail:'Nghe BBC 6 Min English về science topic. Chú ý: cách speakers hedge uncertainty ("may", "could", "might", "it seems that"). Ghi 5 hedging expressions và viết 5 câu dùng chúng về scientific topics.', url: BBC6 },
        { id:'s', type:'speaking',title:'Part 3: Tương lai của khoa học',       detail:'Discuss: (1) Should science be guided by what is useful or by pure curiosity? (2) Is it ethical to conduct experiments on animals? (3) How has technology changed the way scientists work? Dùng: "It could be argued that...", "From a scientific perspective..."' },
      ],
      [
        { id:'v', type:'vocab',   title:'AWL – Batch 4 (Science focus)',         detail:'AWL Batch 4: chapter, commission, community, complex, concept, conclude, conduct, consequence, construct, consume, contract, create, culture, define, denote, design, distinct, emerge, emphasis, ensure. Tìm examples trong scientific writing.' },
        { id:'g', type:'grammar', title:'Complex noun phrases',                  detail:'"A rapidly growing body of evidence suggests..." / "The latest peer-reviewed studies indicate..." / "An unprecedented level of scientific collaboration..." Học cách xây noun phrases phức tạp, thực hành viết 8 sentences về science với complex NPs.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Ethical dilemmas in science',  detail:'Đề: "Some people think that it is acceptable to use animals in scientific research. Others believe this is wrong. Discuss both views and give your opinion." Dùng: "Proponents argue...", "Critics contend...", "A compelling counterargument is..."' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Science passage nâng cao', detail:'Làm IELTS Reading passage Band 7 level về science (astronomy, biology, physics). Focus: câu MCQ "Which of the following best describes the author\'s view?" – cần đọc toàn bài để nắm overall argument.', url: IELTS },
        { id:'l', type:'listening',title:'VOA: Science & technology',            detail:'Nghe VOA Learning English về space exploration, medical science, hoặc environmental research. Ghi: specific names (scientists, organisations, places), key statistics, timeline of events. Tóm tắt 100 từ.', url: VOA },
        { id:'s', type:'speaking',title:'Part 1+2: Science trong đời thường',   detail:'Part 1: "Are you interested in science? What is your favourite branch of science? Do you read about scientific discoveries?" Part 2 (cue card): "Describe a time when you learned something interesting from science classes or the internet."' },
      ],
      [
        { id:'v', type:'vocab',   title:'Ôn 80 từ tuần 6 – Science',           detail:'Tổng quiz: test 80 từ, focus word forms. Đặc biệt: experiment (n/v), analyse (v)/analysis (n)/analytical (adj), research (n/v), hypothesis (singular)/hypotheses (plural). Viết 100 từ đoạn về the importance of scientific research dùng vocabulary tuần này.' },
        { id:'r', type:'reading', title:'IELTS Reading: Full passage + analysis', detail:'Làm 2 IELTS Reading passages về science (40 phút total). Sau đó: dùng 10 phút phân tích và ghi lại paraphrase patterns (synonym substitution, structural change, active→passive, positive→negative với NOT).', url: IELTS },
        { id:'w', type:'writing', title:'Review Task 1 + Task 2 science essays', detail:'Đọc lại 2 bài viết về science (tuần 6 ngày 1 và 5). Tự sửa bằng rubric IELTS: Task Achievement, Coherence, Lexical Resource, Grammar. Viết improved version cho đoạn yếu nhất.' },
      ],
    ],
  },

  // ── Week 7: Business & Economics ─────────────────────────
  {
    theme: 'Kinh doanh & Kinh tế', themeEn: 'Business & Economics', phase: 2,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng kinh doanh cốt lõi',           detail:'Học 20 từ: entrepreneur, profit, revenue, expenditure, investment, shareholder, merger, acquisition, startup, venture capital, supply chain, market share, brand, stakeholder, CEO, corporation, dividend, bankruptcy, liability, asset. Phân biệt: revenue vs profit vs income vs earnings.' },
        { id:'g', type:'grammar', title:'Conditionals trong kinh doanh',         detail:'"If the company raises prices, sales will decline." (Type 1) / "Were the government to reduce taxes, businesses would invest more." (Type 2 formal) / "Had the firm diversified earlier, it would not have collapsed." (Type 3). Viết 8 business conditionals.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Globalisation và doanh nghiệp', detail:'Đề: "Large multinational companies are becoming more and more powerful. Some people think this is a positive development. Others disagree. Discuss both views and give your opinion." Viết 40p với balanced discussion structure.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations kinh doanh',               detail:'Học 20 cụm: launch a product, generate revenue, cut costs, boost productivity, expand into new markets, attract investors, streamline operations, achieve targets, gain competitive advantage, go public, merge with a competitor, outsource work, file for bankruptcy, rebrand a company, enter a joint venture.' },
        { id:'r', type:'reading', title:'BBC Business: Tin tức kinh tế',         detail:'Đọc 1 bài BBC Business về corporate news, economic policy, hoặc market trends. Ghi: main topic, key stakeholders, economic impact. Xác định 5 economic terms và tra nghĩa. Tóm tắt 3 câu.', url: BBCBIZ },
        { id:'s', type:'speaking',title:'Part 2: Doanh nhân thành công',        detail:'Cue card: "Describe a successful businessperson you admire. Say: who they are, what business they are in, what they have achieved, and explain what qualities make them successful." Dùng: admire, dedicated, innovative, visionary, persistent.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng kinh tế vĩ mô',                 detail:'Học 20 từ: GDP, inflation, deflation, interest rate, exchange rate, trade deficit, trade surplus, fiscal policy, monetary policy, recession, economic growth, unemployment, labour market, consumer confidence, export, import, protectionism, free trade, economic inequality, poverty line.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Business',          detail:'Nghe BBC 6 Min English episode về business/economics (work, money, career, globalisation). Ghi: how speakers use hedging to discuss economic forecasts ("may", "it is possible that", "analysts predict"). Write 5 forecast sentences about the economy.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 1: Biểu đồ GDP hoặc trade',       detail:'Mô tả line graph: GDP growth rate (%) của 4 quốc gia từ 2005–2023. Focus: describe fluctuations (peaked, plummeted, recovered), make comparisons, write overview noting the most significant trend.' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Business strategy',     detail:'Làm IELTS Reading passage về corporate strategy hoặc economic development. Focus: câu hỏi Y/N/NG (Yes = agrees with writer\'s view, No = contradicts, NG = not mentioned). Phân biệt kỹ YES vs NG.', url: IELTS },
        { id:'l', type:'listening',title:'VOA: Global economy',                  detail:'Nghe VOA về global economic issues (trade wars, inflation, job market). Chú ý: cách speaker organise information (problem → cause → effect → solution). Ghi lại structure này và áp dụng trong speaking Part 3.', url: VOA },
        { id:'s', type:'speaking',title:'Part 3: Kinh tế và việc làm',          detail:'Discuss: (1) What are the advantages and disadvantages of working for a large corporation versus a small company? (2) Is entrepreneurship encouraged enough in your country? (3) How has globalisation affected employment in your country?' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng thị trường lao động',           detail:'Học 20 từ: employment, unemployment, labour force, gig economy, freelancer, remote work, job security, minimum wage, trade union, collective bargaining, automation, redundancy, redundancy package, internship, career progression, skills gap, reskilling, upskilling, human capital, productivity.' },
        { id:'g', type:'grammar', title:'Discourse markers cho writing',          detail:'Học và luyện: "In contrast to this...", "Furthermore, it should be noted that...", "Notwithstanding this...", "With regard to...", "It is worth noting that...", "This is particularly evident in...", "A key argument in favour of this is..." Viết 1 đoạn body paragraph dùng 5 discourse markers.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Automation và việc làm',       detail:'Đề: "Automation and artificial intelligence are taking over many jobs previously done by humans. What are the causes and effects of this trend? What measures could be taken to deal with this situation?" Problem-cause-solution structure.' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Economics passage nâng cao', detail:'Làm IELTS Reading passage về economic policy hoặc international trade (Band 7 level). Focus: câu Matching Information – đọc mỗi statement, xác định keyword, scan từng paragraph cho keyword/paraphrase của keyword.', url: IELTS },
        { id:'l', type:'listening',title:'BBC 6 Min English: Career & work',    detail:'Nghe BBC 6 Min English về career advice, workplace culture, hoặc the future of work. Ghi: 3 main takeaways, 3 phrasal verbs/idioms liên quan đến work, các cách express contrast (on the other hand, however, nevertheless).', url: BBC6 },
        { id:'s', type:'speaking',title:'Part 1+2+3: Business full practice',   detail:'Full Speaking session: Part 1 (work/career questions), Part 2 (describe your ideal job), Part 3 (job market in your country). Ghi âm toàn bộ 15 phút. Sau đó nghe lại và tự đánh giá: fluency, vocabulary range, grammar accuracy.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Ôn 80 từ tuần 7 – Business',          detail:'Flashcard review: 80 từ business vocabulary. Tập trung collocation test: cho từ (investment), liệt kê 5 collocations (attract investment, return on investment, foreign direct investment, make an investment, investment portfolio).' },
        { id:'r', type:'reading', title:'IELTS Reading: 2 business passages',   detail:'2 passages liên tiếp (40 phút total): 1 về business ethics, 1 về economic development. Analyze: which question types appeared most? Which were hardest? Write 3 lessons learned về Reading strategies.', url: IELTS },
        { id:'w', type:'writing', title:'Peer review: Business essays',         detail:'Đọc lại tất cả Task 2 essays tuần 7. Kiểm tra mỗi bài: (1) Does intro paraphrase the question? (2) Are there 2-3 supporting points per body paragraph? (3) Are examples specific? (4) Is there a clear conclusion? Viết improved intro cho bài yếu nhất.' },
      ],
    ],
  },

  // ── Week 8: Arts & Culture ────────────────────────────────
  {
    theme: 'Nghệ thuật & Văn hóa', themeEn: 'Arts & Culture', phase: 2,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng nghệ thuật & di sản',          detail:'Học 20 từ: heritage, aesthetics, curator, exhibition, artefact, sculpture, architecture, genre, abstract, contemporary, classical, avant-garde, masterpiece, gallery, museum, conservation, restoration, patronage, cultural identity, intangible heritage. Phân biệt aesthetic (adj) vs aesthetics (n).' },
        { id:'g', type:'grammar', title:'Câu mệnh đề cleft (Cleft sentences)',  detail:'"It is the government that should fund the arts." / "What I find most striking about modern art is its ambiguity." / "It was not until the Renaissance that art became secular." Viết 8 cleft sentences về arts and culture. Emphasise với cleft sentences.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Chính phủ tài trợ nghệ thuật', detail:'Đề: "Government funding for the arts reduces the need for commercial funding. Some argue this decreases the quality of art. To what extent do you agree?" Viết 40p. Dùng cleft sentences và complex grammar.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations nghệ thuật & văn hóa',    detail:'Học 20 cụm: foster creativity, preserve cultural heritage, promote cultural exchange, attend a performance, appreciate fine art, commission a work, exhibit paintings, fund the arts, develop artistic talent, stage a production, mount an exhibition, cultivate a culture, acknowledge cultural diversity, blend cultures.' },
        { id:'r', type:'reading', title:'IELTS Reading: Art & culture passage', detail:'Làm IELTS Reading passage về the role of art, cultural heritage, hoặc music history. Focus: câu Note/Table/Flow-chart Completion – điền chính xác từ từ passage (không paraphrase), đúng word limit.', url: IELTS },
        { id:'s', type:'speaking',title:'Part 2: Loại hình nghệ thuật yêu thích', detail:'Cue card: "Describe a type of art or music that you particularly enjoy. Say: what type it is, how long you have been interested in it, how it makes you feel, and explain why you think it is valuable." Dùng: evocative, expressive, moving, thought-provoking.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng phim ảnh & âm nhạc',           detail:'Học 20 từ: cinematography, soundtrack, screenplay, director, producer, genre (thriller, documentary, romance), plot, protagonist, antagonist, theme, motif, score, composition, lyrics, melody, harmony, rhythm, improvisation, recording, album release.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Arts & culture',   detail:'Tìm BBC 6 Min English về arts, culture, music hoặc literature. Nghe và ghi: (1) how do speakers express personal taste (I find it..., I can\'t help but..., There\'s something about...), (2) 3 vocabulary items for evaluating art, (3) the cultural question discussed.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 2: Vai trò của nghệ thuật trong XH', detail:'Đề: "Art is considered an important part of society. However, many people today consider watching television or playing computer games to be a more valuable use of time. Discuss both views." Viết 40p.' },
      ],
      [
        { id:'r', type:'reading', title:'BBC: Culture & Arts news',              detail:'Đọc bài BBC Arts về a cultural event, new film/art exhibition, atau cultural controversy. Xác định tone (celebratory, critical, neutral). Ghi 3 evaluative adjectives (groundbreaking, divisive, acclaimed). Viết 3 câu opinion về chủ đề.', url: BBCWRD },
        { id:'l', type:'listening',title:'VOA: Arts & entertainment',            detail:'Nghe VOA story về arts (film industry, music, cultural festivals). Chú ý: signposting language (moving on to..., turning to..., to illustrate this...). Ghi các cụm này để dùng trong Speaking.', url: VOA },
        { id:'s', type:'speaking',title:'Part 3: Nghệ thuật và xã hội',         detail:'Discuss: (1) Should governments spend money on arts when there are more pressing social needs? (2) Do you think art is becoming less important in modern society? (3) How has technology affected the way art is created and experienced?' },
      ],
      [
        { id:'v', type:'vocab',   title:'AWL – Batch 5 (Arts context)',          detail:'AWL Batch 5: achieve, acquire, administrate, affect, agency, alter, ambiguous, append, appreciate, aspect, attain, attribute, civil, clarify, classic, code, comment, commit, concentrate, confirm. Sử dụng mỗi từ trong 1 câu về arts/culture.' },
        { id:'g', type:'grammar', title:'Ellipsis & substitution (cohesion)',    detail:'Ellipsis: "Some people love contemporary art; others do not [love it]." Substitution: "Traditional music is popular. So is folk dancing." / "Art is subjective, and so is music appreciation." Viết đoạn 100 từ về cultural diversity dùng ellipsis/substitution cho cohesion.', url: BCG },
        { id:'w', type:'writing', title:'Task 1: Process diagram – book publishing', detail:'Mô tả flow chart về the process of publishing a book: manuscript → editor → revisions → design → printing → distribution. Dùng passive voice và process sequencing language (is submitted, is reviewed, are made, is sent).' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Culture passage nâng cao', detail:'Làm IELTS Reading passage về cultural globalisation hoặc indigenous cultures (Band 7). Focus: câu List Selection (Choose 3 answers from 7) – đọc câu hỏi kỹ, tìm tất cả relevant parts of text, verify each option.', url: IELTS },
        { id:'l', type:'listening',title:'Full IELTS Listening: Cultural topics', detail:'Làm IELTS Listening S2 (tour guide về cultural site) + S3 (thảo luận về arts project) + S4 (bài giảng về cultural anthropology). Phân tích: S2 – map labeling; S3 – distinguish 2 speakers\' opinions; S4 – predict headings.', url: IELTS },
        { id:'s', type:'speaking',title:'Full Speaking Mock: Arts & Culture',   detail:'Full 15-minute mock: Part 1 (do you enjoy going to museums? have you been to any concerts?), Part 2 (describe a memorable cultural experience), Part 3 (discuss the value of cultural exchange). Ghi âm, nghe lại, so sánh với Band 7 criteria.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Ôn 80 từ tuần 8 – Arts & Culture',    detail:'Vocab quiz: flashcard test 80 từ. Focus: synonyms – beautiful (stunning, breathtaking, exquisite), old (ancient, antiquated, time-honoured). Viết 1 đoạn review của 1 bộ phim hoặc bài nhạc bạn thích, dùng 15 từ vựng tuần 8.' },
        { id:'r', type:'reading', title:'2 IELTS passages: Arts & Culture',     detail:'Làm 2 passages (40 phút): 1 về music history, 1 về digital art. Ghi lại 10 academic collocations từ passages (e.g. "significant cultural impact", "widespread artistic movement"). Dùng 5 trong câu của bạn.', url: IELTS },
        { id:'w', type:'writing', title:'Review + improve Task 2 essays',       detail:'Đọc lại 3 Task 2 essays tuần 8. Áp dụng checklist: (1) intro paraphrase OK? (2) Each body paragraph has 1 main idea? (3) Used hedging language? (4) Varied sentence structures? (5) Conclusion restates position + broader implication? Cải thiện 1 bài.' },
      ],
    ],
  },

  // ── Week 9: Transport & Infrastructure ───────────────────
  {
    theme: 'Giao thông & Hạ tầng', themeEn: 'Transport & Infrastructure', phase: 2,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng giao thông đô thị',             detail:'Học 20 từ: congestion, commute, public transport, infrastructure, urban planning, pedestrian, cyclist, traffic flow, mass transit, metro, tram, bus lane, carpooling, road network, flyover, underpass, roundabout, speed limit, vehicle emission, electric vehicle.' },
        { id:'g', type:'grammar', title:'Inversion cho nhấn mạnh',               detail:'"Not only does congestion increase journey times, but it also raises pollution levels." / "Rarely has a city solved its traffic problems so effectively." / "Under no circumstances should cars be allowed in city centres." Viết 8 inverted sentences về transport.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Phương tiện cá nhân vs công cộng', detail:'Đề: "Car ownership has increased so rapidly over the past thirty years that many cities around the world are now gridlocked. What measures can governments take to improve traffic conditions?" Viết 40p. Problem-solution structure.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng hạ tầng & quy hoạch',           detail:'Học 20 từ: infrastructure, urban development, urban sprawl, zoning, land use, smart city, sustainable development, green space, public amenity, housing density, mixed-use development, pedestrianisation, cycle lane, park-and-ride, congestion charge, toll, bridge, tunnel, high-speed rail, aviation.' },
        { id:'r', type:'reading', title:'IELTS Reading: Urban transport passage', detail:'Làm IELTS passage về urban transport systems hoặc smart cities. Focus: câu hỏi Diagram Labeling – đọc labels trước, tìm area of text describing diagram, điền từ chính xác từ text.', url: IELTS },
        { id:'s', type:'speaking',title:'Part 2: Hệ thống giao thông',          detail:'Cue card: "Describe a form of transport that you use regularly. Say: what type of transport it is, when you first started using it, what you find good and bad about it, and explain why you would recommend it to others." Dùng comparison: compared to, unlike, whereas.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations giao thông',               detail:'Học 20 cụm: ease traffic congestion, expand the road network, invest in public transport, reduce carbon emissions from vehicles, improve road safety, build cycling infrastructure, implement congestion pricing, extend the metro line, promote walking, reduce car dependency, introduce park-and-ride schemes, electrify the rail network.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Transport',         detail:'Nghe BBC 6 Min English về transport/cities/urban living. Ghi: (1) main argument về transport policy, (2) any statistics mentioned, (3) speakers\' tone (optimistic/pessimistic about solutions). Practice using the same expressions in speaking.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 1: Sơ đồ bản đồ – Urban development', detail:'Mô tả 2 maps của một thị trấn: năm 2000 và năm 2023 sau khi phát triển. Dùng: "A road has been built...", "The park was replaced by...", "Where there was once a field, there is now...", language of change và comparison.' },
      ],
      [
        { id:'r', type:'reading', title:'BBC: Smart cities & transport',         detail:'Đọc bài BBC về smart city transport innovations (autonomous vehicles, congestion charging, electric buses). Phân tích: Is the author in favour or against the innovation? What evidence is given? Đặt 3 IELTS-style questions về bài đọc.', url: BBCWRD },
        { id:'l', type:'listening',title:'VOA: Transport & environment',         detail:'Nghe VOA về electric vehicles, aviation emissions, hoặc sustainable transport. Ghi: numbers and statistics (%, km, dollars), names of programmes or policies, expert opinions. Create 3 MCQ questions from the audio.', url: VOA },
        { id:'s', type:'speaking',title:'Part 3: Giao thông và môi trường',     detail:'Discuss: (1) What are the main challenges facing public transport in your city? (2) Do you think self-driving cars will be common in the near future? (3) How can governments encourage people to use public transport instead of private cars? Use specific examples.' },
      ],
      [
        { id:'v', type:'vocab',   title:'AWL – Batch 6 (Transport context)',     detail:'AWL Batch 6: constitute, context, contract, contribute, convene, coordinate, correspond, criteria, deduce, demonstrate, denote, derive, design, devise, differentiate, distinct, document, domain, dynamic, eliminate. Viết 10 câu về transport infrastructure.' },
        { id:'g', type:'grammar', title:'Expressing cause & effect nâng cao',   detail:'Advanced causal language: "One contributing factor to congestion is..." / "Traffic gridlock stems from a failure to invest in public transport." / "Poor infrastructure has the knock-on effect of..." / "The consequences of urban sprawl are far-reaching." Viết 8 sentences.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Xe hơi cá nhân trong đô thị',  detail:'Đề: "Some people think that the best way to solve global warming is to stop using cars. To what extent do you agree or disagree?" Viết 40p. Dùng: concession structure (While it is true that..., it is also important to consider...).' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Infrastructure passage', detail:'Làm IELTS passage về infrastructure development (Band 7 level). Focus: Matching Headings – mỗi heading cần match với 1 paragraph\'s main idea (không nhất thiết phải là câu đầu). Test 8 headings cho 6 paragraphs (có 2 headings dư).', url: IELTS },
        { id:'l', type:'listening',title:'IELTS Listening: Transport S2+S4',    detail:'Làm S2 (tour guide giới thiệu hệ thống giao thông thành phố) + S4 (bài giảng về urban planning). S2: Map labeling challenge. S4: Note completion từ bài giảng học thuật. Chấm điểm, phân tích.', url: IELTS },
        { id:'s', type:'speaking',title:'Full Speaking Mock: Transport',         detail:'Full 15-minute mock: Part 1 (how do you travel to work/school? Do you drive?), Part 2 (describe a long journey you have made), Part 3 (discuss the future of transport). Self-evaluate using IELTS criteria: Fluency, Vocabulary, Grammar, Pronunciation.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Ôn 80 từ tuần 9 – Transport',         detail:'Rapid-fire quiz: viết 1 sentence cho mỗi trong 20 từ khó nhất tuần 9. Focus: prepositions with transport words (travel by car, on foot, via public transport, by air). Viết paragraph 120 từ về ideal transport system.' },
        { id:'r', type:'reading', title:'2 IELTS passages: Transport',           detail:'Làm 2 IELTS passages về transport và urban planning (40 phút). Focus trên tốc độ: target ≥11/13 mỗi passage. Sau đó: ghi 5 academic expressions từ passages và dùng trong viết.', url: IELTS },
        { id:'w', type:'writing', title:'Task 1 + Task 2: Transport topic',     detail:'Task 1 (20p): bar chart về passenger transport usage (car/bus/train/plane %) ở các năm. Task 2 (40p): "The best way to reduce traffic congestion is for governments to provide free public transport." Discuss.' },
      ],
    ],
  },

  // ── Week 10: Law & Crime + MILESTONE ─────────────────────
  {
    theme: 'Pháp luật & Tội phạm', themeEn: 'Law & Crime', phase: 2,
    milestone: '🏆 Mock Test Phase 2',
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng tội phạm học',                  detail:'Học 20 từ: crime, offence, criminal, victim, perpetrator, suspect, witness, evidence, motive, alibi, arrest, charge, prosecution, defence, verdict, sentence, imprisonment, fine, parole, rehabilitation. Phân biệt: crime (act) vs criminal (person) vs criminality (phenomenon).' },
        { id:'g', type:'grammar', title:'Adverb clauses of concession & contrast', detail:'"Although crime rates have fallen, public fear of crime remains high." / "While some offenders rehabilitate successfully, others reoffend." / "Notwithstanding stricter laws, drug trafficking continues." / "However severe the punishment, deterrence is not guaranteed." 8 sentences.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Phạt tù vs cải tạo',            detail:'Đề: "Prisons are overcrowded with non-violent offenders. Many experts believe that rehabilitation is more effective than punishment. To what extent do you agree?" Viết 40p. Dùng: "Proponents of this view argue...", "Critics, however, contend..."' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng hệ thống tư pháp',              detail:'Học 20 từ: judiciary, legislature, constitution, court, magistrate, jury, barrister, solicitor, judge, prosecution, defendant, plaintiff, appeal, acquittal, conviction, damages, injunction, due process, rule of law, civil rights, human rights.' },
        { id:'r', type:'reading', title:'IELTS Reading: Criminal justice',       detail:'Làm IELTS passage về criminal justice reform hoặc crime statistics. Focus: câu Short Answer Questions – câu hỏi bắt đầu bằng How many/much/long/often → phải tìm number hoặc quantity từ text. Đọc kỹ word limit (e.g. NO MORE THAN TWO WORDS).', url: IELTS },
        { id:'s', type:'speaking',title:'Part 2: Tin tức tội phạm',             detail:'Cue card: "Describe a story about a crime you heard about or read in the news. Say: what happened, where and when it took place, what was the outcome, and explain how you felt about this story." Dùng past tenses, crime vocabulary, hedging ("allegedly", "reportedly").' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng tội phạm mạng & hiện đại',     detail:'Học 20 từ: cybercrime, fraud, identity theft, hacking, ransomware, phishing, money laundering, corruption, bribery, terrorism, organised crime, drug trafficking, human trafficking, white-collar crime, financial crime, surveillance, data breach, digital forensics, dark web, extortion.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Law & crime',      detail:'Nghe BBC 6 Min English về crime, law, justice hoặc punishment. Ghi: (1) the main argument presented, (2) opposing view mentioned, (3) speaker\'s conclusion. Practice: present both sides of an argument about crime prevention in speaking.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 2: Nguyên nhân tội phạm',         detail:'Đề: "Many people believe that poverty is the root cause of crime. Others argue that crime results from individual moral failings. Discuss both views and give your own opinion." Viết 40p. Dùng: "Arguably...", "It is often contended that..."' },
      ],
      [
        { id:'r', type:'reading', title:'BBC/VOA: Crime & justice',              detail:'Đọc bài BBC hoặc VOA về a criminal case, prison reform, hoặc crime prevention. Phân tích: cách bài báo maintain balance (presenting facts vs opinions). Ghi 6 phrases for presenting evidence (statistics show, research indicates, experts argue, according to...).' , url: BBCWRD },
        { id:'l', type:'listening',title:'VOA: Law enforcement',                 detail:'Nghe VOA về policing, criminal justice, hoặc international law. Ghi: proper nouns (case names, organisations, countries), specific outcomes (sentences, verdicts, fines), expert quotes. Create 3 T/F/NG statements from the listening.', url: VOA },
        { id:'s', type:'speaking',title:'Part 3: Hệ thống pháp luật',          detail:'Discuss: (1) What do you think are the most effective ways to prevent crime? (2) Is it fair for criminals to receive the same punishment regardless of their background? (3) Do you think the media portrays crime accurately? Develop each answer for 1 full minute.' },
      ],
      [
        { id:'v', type:'vocab',   title:'AWL – Batch 7 + Review Phase 2',       detail:'AWL Batch 7: equate, evaluate, evident, evolve, expand, expose, external, facilitate, factor, feature, final, focus, framework, function, generate, global, goal, grade, guarantee, identify. Review Phase 2 vocabulary: write 1 paragraph using 10 AWL words from any topic.' },
        { id:'g', type:'grammar', title:'Grammar review Phase 2',               detail:'Review Phase 2 grammar: (1) advanced passives, (2) complex noun phrases, (3) inversion, (4) concession clauses, (5) cause-effect language, (6) ellipsis, (7) cleft sentences. Viết 7 sentences, mỗi câu dùng 1 structure từ Phase 2.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: CCTV và quyền riêng tư',       detail:'Đề: "Some people think that the government should install CCTV cameras in all public spaces in order to reduce crime. Others are concerned about the invasion of privacy this would cause. Discuss both views and give your opinion." Viết 40p.' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: 2 Law/Crime passages',  detail:'Làm 2 passages (40 phút): 1 về criminal psychology, 1 về international law. Analyze: what percentage did you get right? Which question type was hardest? Set a specific target for Phase 3 (e.g., improve Matching Headings by practicing 2 per week).', url: IELTS },
        { id:'l', type:'listening',title:'Full IELTS Listening: Phase 2 review', detail:'Làm Full IELTS Listening test (30+10 phút). Compare score with Phase 1 mock. Ghi: (1) sections improved, (2) sections still weak, (3) 1 specific strategy to implement in Phase 3 (e.g., "predict answers from question keywords before listening").', url: IELTS },
        { id:'s', type:'speaking',title:'Full Speaking: Phase 2 Review',        detail:'Full mock Part 1+2+3 về any Phase 2 topic (law/crime, business, science, etc). Ghi âm. Compare with Phase 1 recording: Is fluency better? More sophisticated vocabulary? Fewer grammar errors? Write 3 specific improvements for Phase 3.' },
      ],
      // Day 70: MILESTONE Phase 2 Mock Test
      [
        { id:'m1', type:'mock', title:'Mock Test: Full Listening (Band 7 target)', detail:'Làm Full IELTS Listening test (Cambridge IELTS Books 13-16 hoặc recent tests). Nghiêm túc: 30p listening + 10p transfer. Target: ≥30/40 (Band 7). Chấm điểm, phân tích câu sai theo section.', url: IELTS },
        { id:'m2', type:'mock', title:'Mock Test: Full Reading (Band 7 target)', detail:'Full Reading test 60 phút, 3 passages. Target: ≥30/40 (Band 7). Sau khi làm: ghi lại câu sai và lý do sai. Nếu T/F/NG sai – xem lại text để hiểu tại sao. Nếu MH sai – đọc lại paragraph main idea.', url: IELTS },
        { id:'m3', type:'mock', title:'Mock Test: Writing + Speaking Band 7',  detail:'Writing: Full Task 1 (20p) + Task 2 (40p) nghiêm túc không tra internet. Speaking: Full Part 1+2+3 (ghi âm 15p). Tự chấm hoặc nhờ người chấm. Ghi target score band cho Phase 3: R, L, W, S.' },
      ],
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  PHASE 3 — ĐÀO SÂU (Days 71–105)
  // ════════════════════════════════════════════════════════════

  // ── Week 11: Food & Agriculture ──────────────────────────
  {
    theme: 'Thực phẩm & Nông nghiệp', themeEn: 'Food & Agriculture', phase: 3,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng nông nghiệp bền vững',         detail:'Học 20 từ: pesticide, fertiliser, irrigation, livestock, crop yield, harvest, organic farming, genetically modified (GM), food security, arable land, deforestation for agriculture, monoculture, biodiversity loss, soil erosion, subsistence farming, commercial farming, food chain, food sovereignty, agroforestry, permaculture.' },
        { id:'r', type:'reading', title:'IELTS Reading: Food security',          detail:'Làm IELTS passage về global food security hoặc agricultural innovation. Focus: câu Yes/No/Not Given – distinguish: Yes (writer explicitly agrees), No (writer explicitly disagrees), NG (writer doesn\'t comment on this). Test 8 YNG statements.', url: IELTS },
        { id:'w', type:'writing', title:'Task 2: An ninh lương thực toàn cầu',  detail:'Đề: "The world has enough food to feed everyone, yet millions suffer from hunger. What are the main reasons for this, and what measures could help solve the problem?" Viết 40p. Dùng precise vocabulary và specific examples (regions, statistics if known).' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng văn hóa ẩm thực',              detail:'Học 20 từ: cuisine, culinary tradition, gastronomy, staple food, processed food, fast food, junk food, dietary habits, nutrition, micronutrient deficiency, obesity, food labelling, food miles, farm-to-table, veganism, vegetarianism, food allergy, intolerances, fermentation, artisan food.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Food & diet',      detail:'Nghe episode về food, diet, nutrition, hoặc farming. Ghi: (1) how does the presenter use examples to support arguments? (2) 3 topic-specific idioms or expressions (e.g. food for thought, a bitter pill to swallow). Mimic the speaker\'s intonation.', url: BBC6 },
        { id:'s', type:'speaking',title:'Part 2+3: Food & culture',             detail:'Part 2: "Describe a traditional dish from your country that you particularly enjoy. Say: what it contains, how it is prepared, when people usually eat it, and explain why you like it." Part 3: "How have eating habits changed in your country over the past 50 years?"' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations thực phẩm & nông nghiệp', detail:'Học 20 cụm: grow crops, rear livestock, implement crop rotation, apply fertiliser, use irrigation systems, combat food waste, ensure food safety, address nutritional deficiencies, promote sustainable agriculture, adopt GM crops, reduce food miles, increase crop yield, maintain soil quality, fight world hunger, develop food policy.' },
        { id:'g', type:'grammar', title:'Nominalization (danh từ hóa) học thuật', detail:'"Farmers produce food" → "The production of food by farmers..." / "Scientists discovered..." → "The discovery of..." / "The government failed..." → "The government\'s failure to..." Nominalization makes writing more formal. Chuyển 10 câu về food/farming sang nominalized form.', url: BCG },
        { id:'w', type:'writing', title:'Task 1: Quy trình sản xuất thực phẩm', detail:'Mô tả process diagram: how bread is made (from wheat grain to packaged loaf). Dùng passive voice, sequencing, precise process verbs (is harvested, is milled, is mixed, is baked, is packaged). Viết ≥150 từ trong 20 phút.' },
      ],
      [
        { id:'r', type:'reading', title:'VOA/BBC: Modern farming technology',   detail:'Đọc bài về precision agriculture, vertical farming, hoặc lab-grown meat. Phân tích argument structure: (1) introduce problem, (2) propose solution, (3) address counterarguments, (4) conclusion. Outline argument structure bằng 5 bullet points.', url: VOA },
        { id:'l', type:'listening',title:'VOA: Global food issues',              detail:'Nghe VOA về world hunger, food prices, hoặc agricultural policy. Ghi specific data: regions affected, percentage changes, time frames, named organisations. Practice: use this data in a speaking Part 3 discussion.', url: VOA },
        { id:'s', type:'speaking',title:'Part 3: Thực phẩm và xã hội',         detail:'Discuss: (1) What factors influence people\'s food choices? (2) Should governments do more to promote healthy eating? (3) How has the globalisation of food chains affected local food cultures? Sử dụng sophisticated vocabulary và structures.' },
      ],
      [
        { id:'v', type:'vocab',   title:'AWL – Batch 8 (Academic precision)',   detail:'AWL Batch 8: impact, implement, imply, impose, indicate, individual, inevitable, infrastructure, initial, instance, integrate, internal, interpret, intervene, involve, isolate, issue, justify, label, layer. Write 10 sentences using these words in academic contexts.' },
        { id:'g', type:'grammar', title:'Advanced sentence structure variety',   detail:'Practice: (1) compound-complex sentences, (2) fronted adverbials ("Despite rising costs, demand for organic food continues to grow."), (3) embedded clauses, (4) parallel structure ("Organic farming preserves soil quality, reduces chemical use, and supports biodiversity."). Write paragraph mixing 4 structures.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Nên ăn ít thịt hơn không?',   detail:'Đề: "Many nutritionists and environmentalists argue that people in developed countries should eat much less meat. How far do you agree with this view?" Viết 40p. Dùng nominalization, fronted adverbials và parallel structures từ bài grammar hôm nay.' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Agriculture Band 7',    detail:'Làm IELTS passage về agricultural innovation hoặc global food trade (Band 7 difficulty). Focus: Summary Completion (choose from a box of words, not from text) – read full list of options first, eliminate clearly wrong ones, look for grammatical fit.', url: IELTS },
        { id:'l', type:'listening',title:'TED-Ed: Food & sustainability',       detail:'Xem TED-Ed về food systems, food waste, hoặc sustainable eating. Ghi: (1) shocking statistic, (2) counter-intuitive finding, (3) call to action. Then: give a 2-minute Speaking Part 3-style response about the topic.', url: TED },
        { id:'s', type:'speaking',title:'Full Speaking Mock: Food & Agriculture', detail:'Full 15-minute mock: Part 1 (cooking habits, favourite food, diet), Part 2 (describe a meal you ate at a restaurant), Part 3 (food security, sustainable eating, global food distribution). Target: Band 7 – use sophisticated vocabulary without pausing to search for words.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Ôn 80 từ tuần 11 – Food & Agriculture', detail:'Quiz: test all 80 words. Advanced challenge: for 10 random words, produce a collocation AND a sentence in an IELTS writing style (e.g. "crop yield": "Rising crop yields in Southeast Asia have contributed to regional food security.")' },
        { id:'r', type:'reading', title:'2 IELTS passages: Food & farming',     detail:'2 passages (40 phút): 1 về food culture, 1 về agricultural policy. Practice time management: each passage = 20 mins (13 questions = ~90 seconds per question). If stuck, move on and come back.', url: IELTS },
        { id:'w', type:'writing', title:'Review Task 1 process + Task 2 essays', detail:'Review bài writing tuần 11. Specific focus: (1) Is Task 1 process accurately described with correct sequencing? (2) Task 2: is there a clear thesis statement in the introduction? (3) Does each body paragraph begin with a topic sentence? Rewrite weakest paragraph.' },
      ],
    ],
  },

  // ── Week 12: Government & Politics ───────────────────────
  {
    theme: 'Chính phủ & Chính trị', themeEn: 'Government & Politics', phase: 3,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng hệ thống chính trị',            detail:'Học 20 từ: democracy, dictatorship, monarchy, republic, parliament, senate, constitution, legislation, policy, coalition, opposition, referendum, election, ballot, constituency, electoral system, proportional representation, majority vote, political party, manifesto.' },
        { id:'g', type:'grammar', title:'Abstract noun phrases (advanced)',      detail:'"The lack of political transparency undermines public trust." / "The failure of governments to address inequality has led to widespread discontent." / "An increasing tendency towards populism has emerged in many democracies." Write 8 abstract noun phrase sentences about politics.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Vai trò chính phủ trong kinh tế', detail:'Đề: "Some people believe that the government should control major industries and public services. Others argue that private companies should manage these areas. Discuss both views and give your opinion." Dùng abstract noun phrases và hedging language.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng tham nhũng & quản trị',         detail:'Học 20 từ: corruption, accountability, transparency, governance, bureaucracy, red tape, lobbying, civil servant, public sector, nepotism, bribery, whistleblower, oversight, checks and balances, rule of law, independent judiciary, freedom of press, civil liberties, human rights, geopolitics.' },
        { id:'r', type:'reading', title:'BBC World: Political news',              detail:'Đọc bài BBC World về a political issue (election, government policy, international relations). Identify: (1) the political actors mentioned, (2) their stated positions, (3) potential consequences mentioned. Write 3 IELTS Y/N/NG statements from this article.', url: BBCWRD },
        { id:'s', type:'speaking',title:'Part 2: Nhà lãnh đạo bạn ngưỡng mộ',  detail:'Cue card: "Describe a leader you admire. Say: who they are, what their achievements are, what qualities they possess, and explain why you think they are an effective leader." Use: visionary, principled, decisive, empathetic, perseverant. 2 minutes.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng chính sách công',               detail:'Học 20 từ: implement policy, draft legislation, pass a bill, repeal a law, enforce regulations, allocate budget, introduce tax reform, cut public spending, subsidise industries, regulate markets, address social inequality, promote social welfare, fund public services, decriminalise activities, ban substances.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Politics',          detail:'Tìm BBC 6 Min English về politics, democracy, voting, or government policy. Ghi: (1) how speakers express opinions about politics (diplomatically, using hedging), (2) 3 political vocabulary items used, (3) what question the episode asks. Answer it in 1 minute.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 2: Bỏ phiếu có nên bắt buộc?',   detail:'Đề: "Voting in elections should be compulsory. To what extent do you agree or disagree?" Viết 40p. Challenge: use at least 1 nominalization, 1 inversion, 1 cleft sentence, and 1 concession clause. Mark them with [N], [I], [C], [CC] in your essay.' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Political science',      detail:'Làm IELTS passage về political science hoặc international relations (Band 7.5). Focus: Matching Information with paragraphs. Strategy: read each information statement, identify 2-3 keywords, scan paragraphs quickly for those keywords or paraphrases.', url: IELTS },
        { id:'l', type:'listening',title:'VOA: Government & society',           detail:'Nghe VOA về government policy, political reform, hoặc civic engagement. Ghi: policy names, % or statistics, countries/organisations involved, outcomes. Practice restating these facts in your own words (paraphrase for Speaking Part 3).', url: VOA },
        { id:'s', type:'speaking',title:'Part 3: Nền dân chủ & chính trị',     detail:'Discuss: (1) To what extent do you think politicians can be trusted? (2) Why do you think voter turnout is declining in many countries? (3) How important is it for ordinary citizens to be involved in politics? Aim for Band 7+ vocabulary: accountability, civic engagement, transparency.' },
      ],
      [
        { id:'v', type:'vocab',   title:'AWL – Batch 9 (Government & policy)',  detail:'AWL Batch 9: legislate, liberal, likely, link, locate, major, maintain, manifest, mature, mediate, method, minimise, monitor, motive, mutual, network, notwithstanding, obtain, oppose, orient. Write 10 sentences in political contexts.' },
        { id:'g', type:'grammar', title:'Hypothetical & speculative language',   detail:'"Were the government to invest more in education, long-term productivity would increase." / "It could be speculated that corruption undermines economic growth." / "One might argue that..." / "It seems plausible that..." Practice: write 6 speculative sentences about political issues.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Sức mạnh của chính phủ',       detail:'Đề: "Some people think that governments should do more to control the activities of large corporations. Others argue that businesses should be allowed to operate as freely as possible. Discuss both views." Viết 40p. Aim for Band 7 in all 4 criteria.' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Full practice Band 7.5', detail:'Làm 2 IELTS passages (40 phút): topics including government/politics. Trước khi làm: time yourself (20 min per passage). Sau khi làm: for each wrong answer, write a 1-sentence explanation of why the right answer is correct.', url: IELTS },
        { id:'l', type:'listening',title:'Full IELTS Listening: Political topics', detail:'Làm Full IELTS Listening test về social/political topics. Challenge: predict the type of word needed for each blank before you listen (noun/verb/number/adjective). Check how many predictions were correct.', url: IELTS },
        { id:'s', type:'speaking',title:'Full Speaking Mock: Politics',         detail:'Full 15-minute mock about politics: Part 1 (interest in politics, voting), Part 2 (describe a political event you followed in the news), Part 3 (role of government, democracy, international politics). Focus: use sophisticated vocabulary without hesitation.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Ôn 80 từ tuần 12 – Government',       detail:'Advanced review: For 15 key words from week 12, write: (1) definition in English, (2) 1 collocation, (3) 1 antonym or related word. E.g. "corruption: the abuse of power for private gain; widespread/endemic corruption; transparency (antonym)."' },
        { id:'r', type:'reading', title:'2 passages: Government & policy',      detail:'2 passages (40 phút) về political and policy topics. This week\'s challenge: attempt Matching Headings passages without reading the passage first—just read headings and first sentence of each paragraph. Compare score with full-reading strategy.', url: IELTS },
        { id:'w', type:'writing', title:'Task 1+2: Government topics',          detail:'Task 1 (20p): pie charts về government spending distribution in 2 countries. Task 2 (40p): "International cooperation is essential to solving global problems. To what extent do you agree?" Aim for essay with no grammar errors.' },
      ],
    ],
  },

  // ── Week 13: Media & Journalism ──────────────────────────
  {
    theme: 'Truyền thông & Báo chí', themeEn: 'Media & Journalism', phase: 3,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng báo chí & truyền thông',       detail:'Học 20 từ: journalism, broadcast, censorship, propaganda, editorial, subscription, click-bait, algorithm, misinformation, disinformation, fact-checking, media bias, echo chamber, filter bubble, freedom of press, independent media, tabloid, broadsheet, investigative journalism, press release.' },
        { id:'g', type:'grammar', title:'Hedging language cho học thuật',        detail:'"It could be argued that media bias distorts public understanding." / "There is some evidence to suggest that social media exacerbates polarisation." / "This claim appears to be supported by..." / "It remains unclear to what extent...". Write 8 hedged sentences about media.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Fake news và trách nhiệm',     detail:'Đề: "The rise of fake news is the most serious problem affecting journalism today. To what extent do you agree?" Viết 40p. Dùng hedging language và evidence-based arguments.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng digital media & social media', detail:'Học 20 từ: content creator, influencer, viral content, engagement rate, monetisation, algorithm, digital platform, streaming, podcast, vlog, user-generated content, data analytics, targeted advertising, online community, hashtag trend, fact-checker, digital literacy, media consumption, news feed, paywall.' },
        { id:'r', type:'reading', title:'IELTS Reading: Media & communication',  detail:'Làm IELTS passage về media influence, journalism ethics, hoặc social media impact. Focus: flow-chart completion. Strategy: headings/labels in diagram show the sequence; find relevant text section and read for detailed information to fill blanks.', url: IELTS },
        { id:'s', type:'speaking',title:'Part 2+3: Chương trình TV yêu thích', detail:'Part 2: "Describe a TV show, podcast, or online channel you enjoy watching/listening to. Say: what it is about, how you discovered it, why you enjoy it, and whether you would recommend it." Part 3: "How has digital media changed the way people consume news?"' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations truyền thông',             detail:'Học 20 cụm: spread misinformation, consume news, access information, publish an article, edit content, regulate social media, monitor online activity, produce investigative reports, combat fake news, ensure press freedom, challenge media bias, engage with content, share a post, go viral, gain followers.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Media',             detail:'Nghe episode về media, journalism, hoặc social media. Ghi: (1) how speakers evaluate sources of information, (2) any examples of fake news or media bias mentioned, (3) what solutions are discussed. Practice critical analysis of media in speaking.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 2: Mạng xã hội: có lợi hay có hại?', detail:'Đề: "Social media has had more negative effects on society than positive ones. To what extent do you agree or disagree?" Viết 40p. Aim: varied sentence openers (Every paragraph starts differently: one with concession, one with statistics, one with example, one with question).' },
      ],
      [
        { id:'r', type:'reading', title:'VOA/BBC: Media industry changes',      detail:'Đọc bài về the decline of print media, rise of podcasts, hoặc social media regulation. Identify: (1) main problem described, (2) causes given, (3) solutions proposed. Compare: how does the author\'s tone differ from an IELTS passage (more journalistic vs more academic)?', url: BBCTECH },
        { id:'l', type:'listening',title:'VOA: Journalism & media',              detail:'Nghe VOA về press freedom, journalism in crisis countries, hoặc media regulation. Ghi: countries mentioned + their media situation, any laws or policies named, expert opinions. Use this info in a Part 3 discussion about press freedom.', url: VOA },
        { id:'s', type:'speaking',title:'Part 3: Tự do báo chí & truyền thông', detail:'Discuss: (1) Should governments be allowed to control what media publishes? (2) Are social media companies responsible for the content posted on their platforms? (3) How can people identify fake news? Use: "From a journalistic perspective...", "In a democratic society..."' },
      ],
      [
        { id:'v', type:'vocab',   title:'AWL – Batch 10 (Communication focus)', detail:'AWL Batch 10: output, overall, parallel, participate, perceive, positive, potential, previous, primary, principle, prior, professional, prohibit, proportion, publish, purchase, range, ratio, react, remove. Practice in sentences about media and communication.' },
        { id:'g', type:'grammar', title:'Advanced grammar: sentence variety audit', detail:'Take your last 3 Task 2 essays. Analyse: (1) How many sentence types? (simple/compound/complex/compound-complex) (2) Do all sentences start the same way? (3) Any grammar errors? Mark errors, categorize (tense/agreement/article/punctuation), count each type. Set a grammar goal for remainder of Phase 3.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Ảnh hưởng của TV với trẻ em',  detail:'Đề: "Watching television is bad for children. To what extent do you agree or disagree?" Advanced challenge: Aim for Band 7.5 – use at least 2 nominalisations, 1 inversion, sophisticated cohesive devices (as a result of which, in light of which).' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Media passage Band 7.5', detail:'Làm IELTS Reading passage về media studies (Band 7.5 difficulty). After completing: analyse the passage itself—identify the author\'s argument, find the topic sentence of each paragraph, notice how evidence is introduced (According to..., Research by X shows...).', url: IELTS },
        { id:'l', type:'listening',title:'IELTS Listening: Media S3+S4',        detail:'Làm S3 (thảo luận về media project) + S4 (bài giảng về history of communication). S3: listen for agreement/disagreement between speakers. S4: predict academic vocabulary that might be used based on section headings.', url: IELTS },
        { id:'s', type:'speaking',title:'Full Speaking Mock: Media',             detail:'Full 15-min mock: Part 1 (news consumption habits, social media use), Part 2 (describe a news story that interested you), Part 3 (media influence, journalism ethics, social media regulation). Record, self-assess, specifically target: Are you using hedging language? Academic vocabulary?' },
      ],
      [
        { id:'v', type:'vocab',   title:'Ôn 80 từ tuần 13 – Media',            detail:'Advanced quiz: define 20 terms in English (no Vietnamese). Then: write 3 IELTS-level sentences using words from Week 13 that you frequently misuse or forget. Practise saying sentences aloud.' },
        { id:'r', type:'reading', title:'2 IELTS passages: Media',              detail:'2 passages about media and communication (40 minutes). New challenge: after completing, re-read each passage and write a 50-word summary of the author\'s main argument. This improves both reading comprehension and academic writing.', url: IELTS },
        { id:'w', type:'writing', title:'Task 1+2: Media statistics',           detail:'Task 1 (20p): tables showing news source usage (%) by age group in 2015 and 2023. Task 2 (40p): "Freedom of the press is essential to a healthy democracy. Do you agree?" Review your essay against Band 7 descriptors.' },
      ],
    ],
  },

  // ── Week 14: Psychology & Behaviour ──────────────────────
  {
    theme: 'Tâm lý & Hành vi', themeEn: 'Psychology & Behaviour', phase: 3,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng tâm lý học nhận thức',         detail:'Học 20 từ: cognition, perception, stimulus, motivation, behaviour, attitude, personality, resilience, empathy, bias, subconscious, consciousness, memory, attention, emotion, intelligence (EQ/IQ), self-esteem, identity, intrinsic motivation, extrinsic motivation.' },
        { id:'g', type:'grammar', title:'Advanced grammar: mixed conditionals', detail:'"If he had studied psychology, he would understand human behaviour better." (past condition, present result). / "If she were more empathetic, she would have dealt with the conflict differently." (present condition, past result). Write 6 mixed conditionals about psychology/behaviour.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Hành vi của con người có thay đổi?', detail:'Đề: "Human nature is fixed and cannot be changed. Therefore, we should not try to improve people through education or rehabilitation. To what extent do you agree?" Viết 40p. Dùng mixed conditionals để express hypotheticals.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng hành vi xã hội',               detail:'Học 20 từ: conformity, peer pressure, groupthink, social norm, deviance, altruism, competition, cooperation, conflict, negotiation, leadership, authority, obedience, persuasion, propaganda, manipulation, social influence, bystander effect, herd mentality, in-group/out-group.' },
        { id:'r', type:'reading', title:'IELTS Reading: Psychology research',   detail:'Làm IELTS passage về psychological research (e.g. famous experiments: Milgram, Zimbardo, Bandura). Focus: matching features (people with their research findings). Write a 3-sentence explanation of each psychological concept encountered.', url: IELTS },
        { id:'s', type:'speaking',title:'Part 2+3: Thói quen muốn thay đổi',  detail:'Part 2: "Describe a habit you would like to change. Say: what it is, when it started, how it affects you, and explain what you could do to change it." Part 3: (1) Why is it so difficult for people to change their behaviour? (2) What role does society play in shaping individual behaviour?' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations tâm lý học',               detail:'Học 20 cụm: conduct a psychological study, observe behaviour, measure cognitive ability, apply behavioural theory, understand mental processes, influence decision-making, reinforce positive behaviour, challenge negative assumptions, develop emotional intelligence, overcome psychological barriers, improve self-awareness, manage stress effectively.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Mind & psychology', detail:'Nghe BBC 6 Min English về psychology, brain science, hoặc human behaviour. Ghi: (1) any psychological research mentioned, (2) surprising finding, (3) practical application. Then: give a 90-second speaking response about whether you agree with the findings.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 2: Áp lực đồng trang lứa',        detail:'Đề: "Young people\'s behaviour is influenced more by peer pressure than by their parents. To what extent do you agree?" Viết 40p. Dùng: psychological terminology, academic hedging, complex sentence structures. Focus on cohesion (no repetition of ideas).' },
      ],
      [
        { id:'r', type:'reading', title:'TED-Ed: Psychology & decision-making', detail:'Xem TED-Ed về cognitive biases, decision-making, hoặc social psychology. Ghi: (1) the bias/phenomenon described, (2) the research evidence, (3) how it affects everyday life. Write 100 words summarising in academic style.', url: TED },
        { id:'l', type:'listening',title:'VOA: Mental health & wellbeing',      detail:'Nghe VOA về mental health awareness, stress management, hoặc psychological research. Ghi: specific conditions mentioned, treatment approaches, statistics about mental health globally. Discuss: How has mental health awareness changed in your country?', url: VOA },
        { id:'s', type:'speaking',title:'Part 3: Sức khỏe tâm thần & XH',     detail:'Discuss: (1) Why do you think mental health problems are becoming more common? (2) Should employers be responsible for their employees\' mental health? (3) How can communities better support people with mental health issues? Aim for 90 seconds+ per answer.' },
      ],
      [
        { id:'v', type:'vocab',   title:'AWL – Batch 11 (Academic breadth)',    detail:'AWL Batch 11: release, relevant, reluctance, remove, require, research, resolve, resource, response, restrict, retain, reveal, revise, role, route, scenario, section, seek, select, sequence. Write sentences about psychology or human behaviour.' },
        { id:'g', type:'grammar', title:'Sophisticated grammar: full review',   detail:'Comprehensive Phase 3 grammar audit: Choose your best essay from Phase 3. Mark: [1] each use of advanced grammar (inversion, cleft, nominalisation, mixed conditional), [2] any remaining errors. Count score. Target: ≥5 advanced structures and 0 basic errors.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Hạnh phúc và thành công',      detail:'Đề: "People today spend too much time worrying about the future and not enough time enjoying the present. Do you agree?" Advanced target: write introduction with a challenging/provocative opening, not just paraphrase the question.' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: Psychology Band 7.5',  detail:'Làm 2 IELTS passages about psychology and human behaviour (40 min). Advanced practice: for each question you get wrong, write not just the right answer but WHY the other options were wrong (eliminate each distractor). This is the key to reaching Band 8 in Reading.', url: IELTS },
        { id:'l', type:'listening',title:'IELTS Listening: Psychology S4',     detail:'Làm IELTS Section 4 (bài giảng về a branch of psychology). Strategy: before listening, read all questions carefully and predict topic, terminology, and types of answers needed. Check how many correct. Aim: S4 ≥8/10.', url: IELTS },
        { id:'s', type:'speaking',title:'Full Speaking Mock: Psychology',       detail:'Full 15-min mock: Part 1 (stress, how you relax, interests), Part 2 (describe a challenging experience and how you dealt with it), Part 3 (psychology of motivation, peer pressure, societal influence on behaviour). Push yourself: no filler words like "um" or "uh"—replace with "Well...", "That\'s an interesting question...", "It seems to me that..."' },
      ],
      [
        { id:'v', type:'vocab',   title:'Ôn 80 từ tuần 14 – Psychology',       detail:'Advanced quiz: for 20 psychology terms, write: word, definition (English), related word (e.g. motivate/motivation/motivational), and 1 collocation. E.g. "resilience: the ability to recover from difficulties; psychological resilience; build/develop resilience".' },
        { id:'r', type:'reading', title:'Full Reading practice + analysis',     detail:'Làm 3 IELTS Reading passages (60 phút, full exam simulation). After: detailed analysis—(1) which passage was hardest? (2) which question type was weakest? (3) how much time did you spend per passage? Set specific Phase 4 reading strategy.', url: IELTS },
        { id:'w', type:'writing', title:'Full Writing practice: timed',         detail:'Full Writing simulation (60 min total): Task 1 (20p): bar chart về workplace stress levels. Task 2 (40p): "The increase in work-related stress is largely due to the introduction of technology into the workplace. To what extent do you agree?" Write, then self-mark all 4 criteria.' },
      ],
    ],
  },

  // ── Week 15: Urban & Rural Life + MILESTONE ──────────────
  {
    theme: 'Đô thị & Nông thôn', themeEn: 'Urban & Rural Life', phase: 3,
    milestone: '🏆 Mock Test Phase 3',
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng quy hoạch đô thị',             detail:'Học 20 từ: urbanisation, metropolis, suburb, urban sprawl, gentrification, smart city, public amenities, green space, housing density, affordable housing, homelessness, commuter belt, city centre, mixed-use development, zoning, regeneration, infrastructure, population density, social mobility, urban decay.' },
        { id:'g', type:'grammar', title:'Extended writing: thesis + evidence + analysis', detail:'Academic paragraph formula: TEEL – Topic sentence → Explanation → Evidence (with hedging) → Link back. Practice: write 2 body paragraphs about urbanisation using TEEL structure. Each paragraph: 80-100 words, 1 complex grammar structure.', url: BCG },
        { id:'w', type:'writing', title:'Task 2: Đô thị hóa và môi trường',    detail:'Đề: "As cities expand, the surrounding countryside is increasingly being built upon. What problems does this cause and what can be done about it?" Viết 40p using TEEL structure for each body paragraph.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng nông thôn & di cư',            detail:'Học 20 từ: rural area, countryside, village, agricultural community, depopulation, brain drain, migration, urbanisation, rural infrastructure, isolation, community spirit, tradition, sustainable farming, eco-tourism, countryside regeneration, rural poverty, lack of amenities, work opportunity, quality of life, cultural identity.' },
        { id:'r', type:'reading', title:'IELTS Reading: Urban planning',         detail:'Làm IELTS passage về urban planning, smart cities, hoặc rural development. Focus: List Selection questions (Choose 2/3 from 6/7 options) – read options first, eliminate clearly wrong, verify remaining options with text evidence. Mark text for each answer.', url: IELTS },
        { id:'s', type:'speaking',title:'Part 2+3: Sống ở thành phố vs nông thôn', detail:'Part 2: "Describe the town or village where you grew up. Say: where it is, what it looks like, what there is to do, and explain how you feel about it." Part 3: (1) What are the advantages and disadvantages of living in a big city? (2) Why do many young people move from rural to urban areas?' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations đô thị/nông thôn',        detail:'Học 20 cụm: tackle urban sprawl, promote sustainable development, revitalise urban areas, preserve green spaces, improve public transport links, combat gentrification, attract investment to rural areas, bridge the urban-rural divide, develop affordable housing, enhance quality of life, reduce social inequality, build community centres, encourage rural tourism.' },
        { id:'l', type:'listening',title:'BBC 6 Min English: Urban life',       detail:'Nghe BBC 6 Min English về cities, housing, urban problems hoặc countryside. Ghi: specific urban/rural issues mentioned, proposed solutions, any surprising statistics. Apply: use 3 expressions from episode in speaking Part 3 discussion about cities.', url: BBC6 },
        { id:'w', type:'writing', title:'Task 1: Sơ đồ thay đổi thị trấn',    detail:'Mô tả 2 maps: a small town in 1995 and 2025. Changes: new road built, shops replaced by apartments, park removed, new school added. Viết 20 phút. Focus: spatial language (to the north of, adjacent to, where the X once stood, the area formerly known as...).' },
      ],
      [
        { id:'r', type:'reading', title:'VOA/BBC: Urbanisation challenges',     detail:'Đọc bài về rapid urbanisation in developing countries hoặc housing crisis in major cities. Analyse: what evidence does the author use? Are all claims supported? Identify 1 unsupported claim. Write a 50-word critical response.', url: BBCWRD },
        { id:'l', type:'listening',title:'IELTS Listening: Urban planning',     detail:'Làm IELTS S2 (guide talking about new city development plan) + S4 (lecture về consequences of urbanisation). S2: Map labeling—listen for directional language (opposite, next to, adjacent to, behind, to the east). S4: Notes completion from lecture.', url: IELTS },
        { id:'s', type:'speaking',title:'Part 3: Tương lai của đô thị',        detail:'Discuss: (1) How might cities look different in 50 years? (2) Is it the government\'s responsibility to control urban growth? (3) What can individuals do to make cities more sustainable? Use future speculation: "It seems likely that...", "Cities could potentially..."' },
      ],
      [
        { id:'v', type:'vocab',   title:'Comprehensive Phase 3 vocabulary review', detail:'Phase 3 mega-review: from weeks 11-15, select your 30 most difficult words. Test yourself: definition, collocation, sentence. For any you get wrong: write 3 different sentences using the word in different contexts.' },
        { id:'g', type:'grammar', title:'Grammar: final Phase 3 mastery check', detail:'Write a 200-word academic paragraph about urban development. Include: 1 inversion, 1 cleft sentence, 1 nominalization, 1 hedging phrase, 1 fronted adverbial, 1 mixed conditional. Review for errors. This should feel natural by Phase 4.', url: BCG },
        { id:'w', type:'writing', title:'Full Writing: timed pre-mock',         detail:'Full 60-minute Writing simulation: Task 1 (20p) pie charts on urban/rural population distribution. Task 2 (40p): "Governments should encourage businesses and individuals to move out of cities to reduce overcrowding and the pressure on urban services. Do you agree?" Aim: Band 7 across all criteria.' },
      ],
      [
        { id:'r', type:'reading', title:'Reading: Phase 3 full strategy review', detail:'Làm 3 IELTS Reading passages (60 min) mixed topics from Phase 3. After: Write a 100-word "Reading Strategy Review"—what works for you, what doesn\'t. Create your personal checklist for Phase 4: specific things to do in each of the 3 passages.', url: IELTS },
        { id:'l', type:'listening',title:'Listening: Full Phase 3 review',      detail:'Làm Full IELTS Listening test. After: identify and categorise all wrong answers: (1) distractor (wrong word chosen), (2) spelling error, (3) vocabulary not known, (4) too slow to write. For each category, plan a specific improvement strategy for Phase 4.', url: IELTS },
        { id:'s', type:'speaking',title:'Phase 3 Speaking: self-analysis',      detail:'Listen back to your speaking recordings from Phase 3 (at least 3 recordings). Compare with Band 7 criteria: (1) Fluency: fewer pauses? (2) Vocabulary: more sophisticated words? (3) Grammar: more complex structures? (4) Pronunciation: clearer? Write 3 specific Phase 4 targets.' },
      ],
      // Day 105: MILESTONE Phase 3 Mock Test
      [
        { id:'m1', type:'mock', title:'Mock Test: Full Listening (Band 7.5 target)', detail:'Full IELTS Listening (30+10 min). Use a Cambridge 15/16/17 test. Target: ≥33/40 (Band 7.5). After: analyse each wrong answer. Identify: is the problem vocabulary, speed of speech, or not recognising paraphrase? Plan solution for each.', url: IELTS },
        { id:'m2', type:'mock', title:'Mock Test: Full Reading (Band 7.5 target)', detail:'Full IELTS Reading (60 min, 3 passages). Target: ≥33/40. Strict timing: 20 min per passage. After: full analysis—which passage type was hardest? Which question type failed most? Write your "Reading attack plan" for Phase 4.', url: IELTS },
        { id:'m3', type:'mock', title:'Mock Test: Writing + Speaking Phase 3',  detail:'Full Writing (60 min) + Full Speaking (15 min, recorded). Get your writing assessed (use IELTS band descriptor or ask a teacher). Compare speaking to previous mocks: has your vocabulary sophistication improved? Document current band scores for W and S.' },
      ],
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  PHASE 4 — THỰC CHIẾN (Days 106–140)
  // ════════════════════════════════════════════════════════════

  // ── Week 16: Energy & Sustainability ─────────────────────
  {
    theme: 'Năng lượng & Bền vững', themeEn: 'Energy & Sustainability', phase: 4,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng năng lượng tái tạo nâng cao', detail:'Học 20 từ: carbon footprint, fossil fuel, solar energy, wind power, tidal energy, nuclear fission, energy grid, off-peak hours, smart meter, peak demand, energy storage, battery technology, hydrogen fuel cell, carbon capture, net-zero emissions, decarbonisation, renewable portfolio, energy transition, feed-in tariff, green bond.' },
        { id:'r', type:'reading', title:'IELTS Reading: Energy transition',     detail:'Làm IELTS passage về energy policy hoặc renewable energy transition (Band 7.5-8). Practice: timing 20 minutes strictly. If you don\'t know an answer, write your best guess and mark it. After: compare guesses vs answers to understand your uncertainty handling.', url: IELTS },
        { id:'w', type:'writing', title:'Task 2: Năng lượng hạt nhân',          detail:'Đề: "Nuclear power is a clean, safe, and reliable source of energy. Therefore, it should be developed and used more. To what extent do you agree or disagree?" Aim for a Band 7.5 essay. Self-mark each criterion 1-9.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Collocations energy & environment',    detail:'Học 20 cụm: harness renewable energy, reduce carbon footprint, implement green policy, transition to clean energy, achieve net zero, invest in solar infrastructure, phase out fossil fuels, adopt sustainable practices, promote energy efficiency, combat climate change, deploy wind turbines, introduce carbon pricing, develop green hydrogen, retrofit buildings, decarbonise industry.' },
        { id:'l', type:'listening',title:'Full IELTS Listening: Energy',        detail:'Full 40-question IELTS Listening about energy topics. Phase 4 strategy: for each section, read questions (30 seconds). During listening: don\'t panic if you miss one—move to next. After: score, analyse, specifically note if you are making spelling errors (deduct marks for these).', url: IELTS },
        { id:'s', type:'speaking',title:'Part 2+3: Energy & environment',       detail:'Part 2: "Describe an environmental initiative or green project you have heard about." Part 3: (1) Do you think renewable energy can fully replace fossil fuels? (2) What should governments prioritise: economic growth or environmental protection? (3) How can individuals reduce their energy consumption?' },
      ],
      [
        { id:'v', type:'vocab',   title:'AWL – Final Batch + exam vocabulary',  detail:'Final AWL review: Batch 12 – schedule, sector, significant, similar, source, specific, strategy, structure, style, sufficient, summary, text, theme, theory, traditional, transfer, volume. Review all 12 batches—rapid-fire: say collocation + sentence for each. Focus on any still uncertain.' },
        { id:'g', type:'grammar', title:'Grammar: precision and error-free',    detail:'Phase 4 goal: ZERO grammar errors. Write 200 words about energy sustainability. Check: (1) article usage (a/an/the/zero), (2) verb tenses consistent, (3) subject-verb agreement, (4) prepositions correct, (5) uncountable nouns correctly used. Any error = rewrite that sentence.', url: BCG },
        { id:'w', type:'writing', title:'Task 1+2: Energy statistics',          detail:'Task 1 (20p): mixed chart (bar + line) showing electricity generation by source (%) and total consumption (GW) from 2005–2020. Task 2 (40p): "The world\'s increasing demand for energy can only be met through nuclear power." Discuss both sides. Aim for Band 7.5.' },
      ],
      [
        { id:'r', type:'reading', title:'IELTS Reading: 2 energy passages',    detail:'Làm 2 IELTS passages (40 min): energy + environment. Phase 4 strategy: for Matching Headings, use the "umbrella concept" – the heading must cover ALL the content of the paragraph, not just mention one point. Test with 8-heading passage.', url: IELTS },
        { id:'l', type:'listening',title:'IELTS Listening: Energy S3+S4',      detail:'S3: discussion about a renewable energy project between students. S4: academic lecture about carbon capture technology. Focus: S4 – use headings/subheadings on question paper to predict the structure of the lecture before it starts.', url: IELTS },
        { id:'s', type:'speaking',title:'Full Speaking: Energy & environment',  detail:'Full 15-min mock. Phase 4 focus: eliminate these common errors—(1) saying "I think" repeatedly (vary with "In my view", "It seems to me", "I would argue"), (2) starting every sentence with "It" or "The", (3) using basic vocabulary when sophisticated terms exist (not "good" but "beneficial", "advantageous").' },
      ],
      [
        { id:'r', type:'reading', title:'Reading: Phase 4 speed training',     detail:'Reading speed drill: Take an IELTS passage. Read once (10 min) and answer Matching Headings. Then re-read (5 min) and answer T/F/NG. Total: 15 min for 2 question sets (faster than usual). Check if accuracy drops—balance speed vs accuracy.', url: IELTS },
        { id:'l', type:'listening',title:'Listening: Accent exposure training', detail:'Listen to IELTS listening with non-British accents (Australian, North American). Note: which words did you miss due to accent? Look for IELTS tests featuring different accents and practice with them. Aim: no score drop between different accent types.', url: IELTS },
        { id:'w', type:'writing', title:'Task 2: Sustainability Band 7.5 target', detail:'Write a Band 7.5 essay about sustainability. After writing: compare against the IELTS Band 7 Writing descriptors. For each descriptor, mark whether you met it: TA (addressed all parts?), CC (clear progression?), LR (wide range, few errors?), GRA (variety, few errors?).' },
      ],
      [
        { id:'r', type:'reading', title:'Full Reading: 3 passages timed',      detail:'Full IELTS Reading exam simulation (60 min). Use a Cambridge IELTS 17/18 test you haven\'t seen before. Strict conditions: no stopping, no checking. After: detailed score analysis. Note: are you stronger on passages 1, 2, or 3? This affects time strategy on exam day.', url: IELTS },
        { id:'l', type:'listening',title:'Full Listening: exam conditions',    detail:'Full IELTS Listening exam simulation. Strict conditions. After: score, note any section where you missed ≥3 questions (this is your weak section). For that section: do additional practice sets this week.', url: IELTS },
        { id:'w', type:'writing', title:'Full Writing: timed + self-mark',    detail:'Full Writing sim (60 min). After: use IELTS Band descriptors to self-mark. Write your estimated band for each criterion. Identify: what is your lowest criterion? Focus practice on that in Week 17-18.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Vocabulary consolidation: Phase 4 W1', detail:'Phase 4 vocabulary audit: From all 16 weeks, what are your 20 "most improved" words? (Words you struggled with but now use easily.) And your 10 "still uncertain" words? Deep-dive the uncertain ones: find 3 real-world examples of each being used.' },
        { id:'r', type:'reading', title:'Reading: analyse past mistakes',       detail:'Review all wrong answers from your Phase 4 reading practices this week. Categorise: (1) vocabulary problem, (2) misread paraphrase, (3) time pressure, (4) question type weakness. For each category: write 1 specific fix you will apply in exam.', url: IELTS },
        { id:'s', type:'speaking',title:'Speaking: vocabulary upgrade drills', detail:'Choose 20 "basic" words you still use in speaking (good, bad, important, get, make, use). For each: find 2-3 sophisticated replacements. (good → beneficial, advantageous, worthwhile). Practice speaking 5 minutes using ONLY upgraded vocabulary.' },
      ],
    ],
  },

  // ── Week 17: Language & Communication ────────────────────
  {
    theme: 'Ngôn ngữ & Giao tiếp', themeEn: 'Language & Communication', phase: 4,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng ngôn ngữ học',                 detail:'Học 20 từ: bilingual, multilingual, lingua franca, dialect, accent, fluency, proficiency, syntax, grammar, semantics, pragmatics, language acquisition, native speaker, second language, mother tongue, code-switching, language policy, linguistic diversity, endangered language, translation.' },
        { id:'r', type:'reading', title:'IELTS Reading: Language & communication', detail:'Làm IELTS passage về language acquisition, multilingualism, hoặc the role of English globally (Band 7.5-8). New strategy to practice: for Short Answer questions, the answer appears in the same order as the questions—use this to locate answers faster.', url: IELTS },
        { id:'w', type:'writing', title:'Task 2: Tiếng Anh như ngôn ngữ quốc tế', detail:'Đề: "It would be better if the world had one language. To what extent do you agree?" Aim: Band 7.5+ essay with perfect task achievement (directly address prompt), clear paragraph structure, sophisticated vocabulary (lingua franca, cultural identity, linguistic homogenisation).' },
      ],
      [
        { id:'v', type:'vocab',   title:'Advanced vocabulary: idioms & formal equivalents', detail:'Học các cặp idiom/formal: "bite the bullet" = endure a painful situation; "at the end of the day" = ultimately; "think outside the box" = approach creatively. Note: NEVER use idioms in IELTS writing—always use formal equivalents. Practice identifying and replacing idioms in essay drafts.' },
        { id:'l', type:'listening',title:'Full IELTS Listening: Language topics', detail:'Full IELTS Listening 40 questions. Phase 4 focus: listen for paraphrase—when a word in the question appears in the audio as a synonym. E.g. question says "benefit" and audio says "advantage". Practice identifying paraphrase pairs in 3 S4 answers.', url: IELTS },
        { id:'s', type:'speaking',title:'Part 3: Role of language in identity', detail:'Discuss: (1) Do you think it is possible to fully understand a culture without speaking its language? (2) Should minority languages be preserved even if it is expensive to do so? (3) Is the spread of English a threat to other languages? Aim for 90 seconds per answer.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Vocabulary: precision – avoid vague words', detail:'Banned words in IELTS writing this week: very, a lot, big, small, good, bad, many, few. For each: find 3 precise replacements. E.g. very → considerably, remarkably, substantially. Write 10 sentences that previously used vague words, now using precise vocabulary.' },
        { id:'g', type:'grammar', title:'Writing: sentence openings variety',   detail:'Challenge: write a 250-word essay where every sentence starts differently. No two sentences can begin the same way. Try: infinitive ("To address this..."), present participle ("Considering the evidence..."), adverb ("Interestingly, ..."), cleft ("It is this tendency that...").' , url: BCG },
        { id:'w', type:'writing', title:'Task 2: Non-native speakers & global English', detail:'Đề: "Some people argue that in order to be an effective global language, English needs to change to accommodate non-native speakers. To what extent do you agree?" Aim: every sentence opens differently (practice from grammar exercise).' },
      ],
      [
        { id:'r', type:'reading', title:'Reading: advanced speed + accuracy',  detail:'3 IELTS passages (60 min) but with a twist: For passage 1, spend only 15 min. For passage 2, spend 20 min. For passage 3, spend 25 min (hardest). Note if this timing strategy helps compared to equal 20 min per passage.', url: IELTS },
        { id:'l', type:'listening',title:'IELTS Listening: intensive review',  detail:'Do 4 IELTS S4 sections (one each day Mon-Thu). For each: (1) listen without pause, (2) check answers, (3) listen again with transcript, (4) mark every word you missed (underline in transcript), (5) practise saying those sentences aloud. Target: S4 ≥9/10.', url: IELTS },
        { id:'s', type:'speaking',title:'Speaking: Part 2 intensive practice', detail:'Do 5 Part 2 cue cards from different topics (one per day this week). Time: exactly 2 minutes each. After each: listen back and count: (1) filler words used, (2) grammar errors, (3) vocabulary sophistication (boring vs interesting words). Improve systematically.' },
      ],
      [
        { id:'r', type:'reading', title:'Reading: mock under pressure',        detail:'IELTS Reading practice with added pressure: timer alarmed every 20 min (strict passage switch). If you haven\'t finished a passage, move on. Note: does pressure affect accuracy? If yes: practice more timed drills. Target: consistent ≥34/40 (Band 8 range).', url: IELTS },
        { id:'l', type:'listening',title:'Listening: distractor analysis',     detail:'Redo 1 full IELTS Listening test you\'ve done before. Focus on: why each wrong answer seemed correct (the IELTS distractor technique—they often mention the wrong option clearly BEFORE giving the right answer). Write 5 distractor examples you identified.', url: IELTS },
        { id:'w', type:'writing', title:'Writing review: all Phase 4 essays',  detail:'Review all Task 2 essays from Phase 4 (Weeks 16-17). Create a personal error log: list your most common errors by type (article, verb tense, subject-verb agreement, word form, spelling). Write 10 sentences specifically practising your top 3 error types.' },
      ],
      [
        { id:'r', type:'reading', title:'Reading: full simulation Band 8 target', detail:'Full IELTS Reading (60 min). Target: ≥36/40 (Band 8). After: for each wrong answer, spend 2 minutes understanding exactly why the correct answer is correct and all others are wrong. This analytical approach is essential for Band 8.', url: IELTS },
        { id:'l', type:'listening',title:'Full Listening: Band 7.5-8 target',  detail:'Full IELTS Listening (40 min). Target: ≥35/40 (Band 8). After: if score is below target, identify: which Section (1-4) has most errors? That section is your focus for Week 18 intensive practice.', url: IELTS },
        { id:'s', type:'speaking',title:'Full Speaking Mock: assess Band level', detail:'Full 15-min Speaking mock. Record. Self-assess using IELTS Speaking criteria. Then: have someone (teacher or native speaker) assess it, or compare your performance with YouTube examples of Band 7 speaking. Target: solid Band 7 in all 4 criteria.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Vocabulary: final gaps identification', detail:'From all 17 weeks of vocabulary study: identify the 3 themes where you feel least confident. For each theme: write 20 words from memory, check against original list, re-learn the ones you missed. This targeted review is more effective than general review.' },
        { id:'r', type:'reading', title:'Reading: question type mastery review', detail:'This week: only practice your 2 weakest question types. Do 10 sets of those question types specifically. (e.g. if Matching Headings and Y/N/NG are weakest: do 10 passages focusing only on these types.) Track accuracy improvement.', url: IELTS },
        { id:'w', type:'writing', title:'Writing: Task 1 speed and precision',  detail:'Task 1 intensive: do 5 different Task 1 types this week (bar chart, line graph, table, pie chart, process diagram). Each one: maximum 20 minutes. Focus: does your overview paragraph capture the 2 most significant features? Is every number accurately referenced?' },
      ],
    ],
  },

  // ── Week 18: Globalisation & Migration ───────────────────
  {
    theme: 'Toàn cầu hóa & Di dân', themeEn: 'Globalisation & Migration', phase: 4,
    days: [
      [
        { id:'v', type:'vocab',   title:'Từ vựng toàn cầu hóa',                 detail:'Học 20 từ: globalisation, free trade, protectionism, tariff, trade agreement, multinational corporation, supply chain, outsourcing, offshoring, cultural homogenisation, consumerism, global village, interdependence, economic integration, foreign direct investment, currency exchange, economic bloc (EU, ASEAN), diaspora, brain gain, soft power.' },
        { id:'r', type:'reading', title:'IELTS Reading: Globalisation',         detail:'Làm IELTS passage về globalisation (Band 7.5-8). Challenge: attempt without reading the passage first. Read only questions. Then scan passage for answers. Compare score with your usual method. Determine which method is faster and more accurate for you.', url: IELTS },
        { id:'w', type:'writing', title:'Task 2: Globalisation và văn hóa',    detail:'Đề: "The spread of international businesses and multinational companies is having a negative impact on local culture. To what extent do you agree?" This is a classic IELTS globalisation topic. Aim: no errors, Band 7.5+ in all criteria. Write, pause, review.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Từ vựng di cư & nhập cư (nâng cao)',  detail:'Học 20 từ: migration, immigration, emigration, refugee, asylum seeker, undocumented migrant, economic migrant, host country, source country, integration, multiculturalism, xenophobia, brain drain, remittance, social cohesion, deportation, human trafficking, border control, cultural assimilation, multicultural society.' },
        { id:'l', type:'listening',title:'Full IELTS Listening: Globalisation', detail:'Full 40-question test about globalisation/migration topics. Focus particularly on S1 form filling (most students miss spelling). Write answers, then check: did you spell all names/addresses correctly? Did you write the right type of word (number vs word)?', url: IELTS },
        { id:'s', type:'speaking',title:'Part 3: Globalisation & migration',    detail:'Discuss: (1) Is globalisation ultimately beneficial for developing countries? (2) What are the challenges that immigrants face when settling in a new country? (3) How has globalisation changed your own life or culture? Aim: sophisticated vocabulary, no basic words.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Vocabulary: collocations for exam day', detail:'Final collocation review for the most common IELTS topics: environment, technology, education, health, society, business. For each topic: 5 essential collocations (e.g. environment: tackle climate change, reduce carbon emissions, protect biodiversity, combat deforestation, promote sustainability). MEMORISE these for exam day.' },
        { id:'g', type:'grammar', title:'Grammar: final exam-day checklist',   detail:'Create your personal grammar checklist for exam day. Include: (1) my most common error type + example of correct form, (2) 3 complex structures I will use in Task 2, (3) 3 structures I will use in Task 1. Write this checklist on paper—refer to it on exam day.', url: BCG },
        { id:'w', type:'writing', title:'Task 1+2: Globalisation statistics',  detail:'Task 1 (20p): line graph showing global trade volume growth 1970-2020. Task 2 (40p): "International cooperation between countries is more important now than ever before. To what extent do you agree?" Final target: above 7.0 in all Writing criteria.' },
      ],
      [
        { id:'r', type:'reading', title:'Reading: Band 8 target drills',       detail:'Do IELTS Reading Passage 3 (hardest passage, abstract academic text) × 3 repetitions. Each time: time yourself, note score. Passage 3 should be attempted with 25 minutes (not 20) because of difficulty. Identify specific patterns in Band 8 passages (more inference questions).', url: IELTS },
        { id:'l', type:'listening',title:'Listening: S1 & S2 accuracy boost', detail:'Focus this session on S1 and S2 (often underestimated). Do 5 S1+S2 sections. In S1: practice writing while listening without stopping to think (the audio won\'t wait). In S2: map/diagram labeling—listen for exactly which direction the speaker says.', url: IELTS },
        { id:'s', type:'speaking',title:'Speaking: pronunciation intensive',   detail:'Record yourself speaking for 5 minutes about globalisation. Listen back: (1) identify 5 words you mispronounced, look up correct pronunciation on Cambridge Dictionary, (2) identify 3 intonation patterns that sound unnatural, (3) note where you paused unnecessarily. Repeat.' },
      ],
      [
        { id:'r', type:'reading', title:'Reading: final weakest areas',        detail:'Identify your 2 weakest Reading question types from all Phase 4 practice. This session: only practice those types. Do 3 sets of 6 questions each. After: what % did you get right? Has it improved since you started focused practice? Set exam-day expectation.', url: IELTS },
        { id:'l', type:'listening',title:'Listening: exam-day simulation',     detail:'Full Listening exam (40 min, strict exam conditions). After: calculate band score. If below target: identify which section(s) to improve in Week 19. If on target: focus on maintaining consistency in Week 19-20. Write your exam-day listening strategy in 5 bullet points.', url: IELTS },
        { id:'w', type:'writing', title:'Writing: pre-exam final essay',       detail:'Write your single best Task 2 essay yet. Choose any topic you feel most confident with. Spend 5 minutes planning, 35 minutes writing. Aim: Band 7.5+ that you are proud of. Keep this essay as your "reference essay" to remind yourself of what you can achieve.' },
      ],
      [
        { id:'r', type:'reading', title:'Full Reading: final Band assessment',  detail:'Full IELTS Reading (60 min, strict). Use Cambridge IELTS 18 or 19 (very recent). Note your score. Compare with Phase 1 mock (Day 35). Calculate improvement. Write 3 "Reading lessons learned" that you would tell yourself at the start of the course.', url: IELTS },
        { id:'l', type:'listening',title:'Full Listening: final Band assessment', detail:'Full IELTS Listening (40 min). Use Cambridge IELTS 18 or 19. Score and compare with Phase 1. Calculate improvement in each section (S1, S2, S3, S4). Write specific exam-day notes: "In S1 I will... In S4 I will..."', url: IELTS },
        { id:'s', type:'speaking',title:'Speaking: final mock + self-analysis',detail:'Final 15-min Speaking mock. Record. This time: assess yourself on ALL 4 criteria (Fluency, Vocabulary, Grammar, Pronunciation) using IELTS descriptors. Assign a band (6.0-7.5) for each. Write: "On exam day, I will specifically focus on improving [weakest criterion] by [specific action]."' },
      ],
      [
        { id:'v', type:'vocab',   title:'Vocabulary: exam-day mental rehearsal', detail:'Read through your collocation cheat sheets from each of the 20 themes. Don\'t learn new words. Just refresh and confirm you can access them quickly. Time yourself: can you produce 3 collocations for any given IELTS topic within 10 seconds? That\'s exam-ready.' },
        { id:'r', type:'reading', title:'Reading: Review + mental strategy prep', detail:'Re-read your Reading strategy notes from all phases. Write your final "IELTS Reading attack plan" in 5 steps: (1) skim titles/headings, (2) read questions first, (3) [your specific strategy for weak question type], (4) timing per passage, (5) what to do if stuck. Memorise this plan.', url: IELTS },
        { id:'w', type:'writing', title:'Writing: Task 1 & 2 rapid practice',  detail:'Write: 1 Task 1 (20p) and 1 Task 2 outline only (5p). Task 1: describe a pie chart. Task 2 outline: "Some countries have experienced rapid population ageing. What problems might this cause and what measures could be taken?" Evaluate outline quality without writing full essay.' },
      ],
    ],
  },

  // ── Week 19: Comprehensive Review ────────────────────────
  {
    theme: 'Ôn Tập Tổng Hợp', themeEn: 'Comprehensive Review', phase: 4,
    days: [
      [
        { id:'v', type:'vocab',   title:'Vocabulary: Top 100 IELTS words review', detail:'From all 20 weeks, identify your personal "Top 100 words" – the ones most likely to appear and most useful in all 4 skills. Review them: say definition, collocation, and example sentence. No writing—purely oral review for fluency and automaticity.' },
        { id:'r', type:'reading', title:'Full Reading: Band 7.5-8 simulation',  detail:'Full IELTS Reading (60 min). Use an unseen test. Strict conditions. Aim: ≥34/40. After: spend 20 min analysing every wrong answer. Key question: "What did I misread or misunderstand?" Document answers in a "Final Reading Error Log".', url: IELTS },
        { id:'w', type:'writing', title:'Task 2: Random topic timed',           detail:'Take a random IELTS question (use an exam bank). No preparation. Plan for 5 min, write for 35 min. Focus: does the essay address ALL parts of the question? (Task Achievement is often the easiest criterion to boost—just answer the FULL question carefully.)' },
      ],
      [
        { id:'v', type:'vocab',   title:'Vocabulary: Topic-specific drills',   detail:'Final topical vocabulary sprint: For each of the 10 most common IELTS topics, write 5 essential words/phrases from memory: Environment, Technology, Education, Health, Society, Science, Business, Arts, Transport, Government. 50 words total. Check accuracy.' },
        { id:'l', type:'listening',title:'Full Listening: Band 8 simulation',  detail:'Full IELTS Listening (40 min). Target: ≥36/40 (Band 8). After: listen again with transcript. For every question you got right, confirm your understanding. For every question wrong: analyse if it was (1) speed, (2) vocabulary, (3) distractor. Note your exam-day adjustment.', url: IELTS },
        { id:'s', type:'speaking',title:'Speaking: Part 3 intensive drill',    detail:'Do 10 Part 3 questions from various topics (2 per topic: environment, technology, society, education, culture). Each answer: minimum 60 seconds. Record and listen: Are you developing ideas fully? Giving examples? Using academic vocabulary? Vary response openers.' },
      ],
      [
        { id:'r', type:'reading', title:'Reading: Matching Headings mastery',  detail:'3 Matching Headings passages (one full set each). Practice the "topic sentence method": read only the first and last sentence of each paragraph to identify its main idea. Compare score using this method vs reading full paragraphs. Which is more accurate AND faster?', url: IELTS },
        { id:'l', type:'listening',title:'Listening: S3 intensive practice',  detail:'S3 (discussion between 2-3 speakers) is often hardest because you must distinguish speakers\' opinions. Do 4 S3 sections. After each: write which speaker believed what. Practise: in S3, as soon as a new speaker starts, mentally note "Speaker A says X" before processing the next point.', url: IELTS },
        { id:'w', type:'writing', title:'Writing: Task 1 variety review',      detail:'In 60 minutes: write brief Task 1 responses for 4 different chart types (bar, line, table, pie). Each: just 2 paragraphs (overview + most significant detail). This "compressed" practice improves efficiency. Check: does each overview sentence capture the most important feature?' },
      ],
      [
        { id:'v', type:'vocab',   title:'Vocabulary: speaking upgrade final',  detail:'Speaking vocabulary sprint: replace 15 boring words/phrases with sophisticated alternatives in speaking contexts: good (beneficial, valuable, advantageous), people (individuals, the population, society at large), important (crucial, fundamental, pivotal), get (obtain, acquire, receive), think (argue, contend, maintain).' },
        { id:'r', type:'reading', title:'Reading: T/F/NG & Y/N/NG mastery',   detail:'Do 5 T/F/NG and 5 Y/N/NG sets. Focus on NOT GIVEN: This is not saying the info isn\'t in the passage—it means the specific claim is neither confirmed nor denied. "NG" ≠ "wrong"—the text simply doesn\'t discuss it. Practise identifying the difference.', url: IELTS },
        { id:'s', type:'speaking',title:'Speaking: fluency & natural flow',   detail:'Do 3 Part 1 practice sessions (10 questions each) focusing ONLY on fluency—don\'t stop to think. If you don\'t know a word, paraphrase or use a simpler word and keep going. Fluency is more important than precision. Record and compare: is the flow improving?' },
      ],
      [
        { id:'r', type:'reading', title:'Reading: Band 8 reasoning practice',  detail:'Take 10 MCQ (multiple choice) Reading questions. For each: before selecting an answer, eliminate wrong options one by one with a reason (e.g. "Option A is wrong because the text says... not..."). This eliminates guessing and builds Band 8 analytical skills.', url: IELTS },
        { id:'l', type:'listening',title:'Listening: pre-exam review',         detail:'Do 4 full IELTS Listening sections (S1, S2, S3, S4 – one from each, mixed topics). Score each section separately. Which section consistently scores highest? Which lowest? Your exam-day strategy: give extra focus to weak section (read those questions first during preview time).', url: IELTS },
        { id:'w', type:'writing', title:'Writing: Grammar zero-error essay',   detail:'Write a 280-word Task 2 essay. After: proofread specifically for grammar (not content). Check every sentence for: (1) subject-verb agreement, (2) tense consistency, (3) article errors, (4) preposition errors, (5) word form errors. Aim: ZERO grammar errors.' },
      ],
      [
        { id:'r', type:'reading', title:'Reading: full timed with review',    detail:'Final pre-exam full reading simulation (60 min). After finishing: spend 15 minutes reviewing your most uncertain answers only. If you changed answers during review, note: did it improve or worsen your score? This tells you whether to trust your first instinct on exam day.', url: IELTS },
        { id:'l', type:'listening',title:'Listening: exam preparation notes',  detail:'Write your final exam-day Listening preparation notes (on paper): (1) what to do during preview time (30 seconds per section), (2) how to handle missing an answer (don\'t panic, leave blank and continue), (3) how to use transfer time (check spelling, form vs number), (4) which section to focus most on.' },
        { id:'s', type:'speaking',title:'Speaking: full pre-exam simulation',  detail:'Full 15-min Speaking mock under exam conditions. No notes. No preparation time. Answer as if in the real exam. Record. This is your benchmark before the final exam week. Assessment: compare this to your Week 1 recording. How far have you come?' },
      ],
      [
        { id:'v', type:'vocab',   title:'Vocabulary: relaxed review day',      detail:'Light vocabulary review day—no new words. Just read through your collocation cheat sheets slowly, enjoy them. Say sentences aloud. This is maintenance, not cramming. Your vocabulary is built. Trust the process.' },
        { id:'r', type:'reading', title:'Reading: confidence-building session', detail:'Do 1 IELTS Reading passage (any topic) under 15 minutes (less than usual). Aim to get ≥11/13. This quick win builds exam confidence. After: read the full passage leisurely, appreciate the language, enjoy the academic text. You\'re ready.', url: IELTS },
        { id:'s', type:'speaking',title:'Speaking: positive rehearsal',        detail:'Spend 15 minutes speaking about your favourite topics (not necessarily IELTS-related). Speak in full sentences, use academic vocabulary where natural. This builds confidence and fluency without pressure. Enjoy the language.' },
      ],
    ],
  },

  // ── Week 20: Exam Simulation + FINAL MILESTONE ───────────
  {
    theme: 'Luyện Đề Thực Chiến', themeEn: 'Exam Simulation', phase: 4,
    milestone: '🎓 Hoàn Thành 140 Ngày!',
    days: [
      [
        { id:'v', type:'vocab',   title:'Vocabulary: Day before activation',   detail:'Read aloud your Top 100 IELTS words with their collocations. Speak sentences using them. This is "activation" not memorisation—you\'re priming your brain to access this vocabulary automatically in the exam. 30 minutes maximum, then rest.' },
        { id:'r', type:'reading', title:'Mock Exam 5: Reading (Official conditions)', detail:'Full IELTS Reading exam simulation with official Cambridge test (60 min). Treat it like the real exam: no phone, no breaks, sit at a desk. Score immediately after. Target: ≥35/40. This is your final benchmark before exam day.', url: IELTS },
        { id:'l', type:'listening',title:'Mock Exam 5: Listening (Official conditions)', detail:'Full IELTS Listening (40 min total: 30 listening + 10 transfer). Official conditions. Target: ≥35/40. Score immediately. Final pre-exam analysis: are you consistently hitting your target band? Confidence check.', url: IELTS },
      ],
      [
        { id:'r', type:'reading', title:'Reading: final error review',         detail:'Review all wrong answers from the Week 20 Day 1 mock. Write 5 final insights: "I now understand that [question type X] requires [specific strategy Y]." Keep this insight sheet—read it the morning of your exam.', url: IELTS },
        { id:'l', type:'listening',title:'Listening: final error review',      detail:'Review wrong answers from Week 20 Day 1 mock. For each wrong answer: listen to that specific moment again. Understand exactly what caused the error (speed, vocabulary, distractor). Write your final Listening strategy for exam day.', url: IELTS },
        { id:'w', type:'writing', title:'Mock Exam 5: Writing (Official conditions)', detail:'Full IELTS Writing simulation (60 min, Task 1 + Task 2). Strict conditions: no dictionary, no online resources. Treat as the real exam. After: self-assess using Band descriptors. This is your final Writing benchmark.' },
      ],
      [
        { id:'r', type:'reading', title:'Reading: relax and confidence build', detail:'One easy IELTS Reading passage (Band 6 level). Complete in 15 minutes without pressure. This is about building confidence, not challenging yourself. Finish with ≥12/13. Remind yourself: you have prepared for 140 days. You are ready.', url: IELTS },
        { id:'l', type:'listening',title:'Listening: light practice + enjoy',  detail:'Listen to BBC 6 Minute English for pleasure. No note-taking, no pressure. Just enjoy understanding natural English. This reinforces your listening ability without stress and keeps your ear "warm" before the exam.', url: BBC6 },
        { id:'s', type:'speaking',title:'Mock Exam 5: Speaking (Final mock)',   detail:'Final Speaking mock (15 min, recorded). Part 1 + 2 + 3 on topics you feel most confident with. After: listen back and appreciate how far you\'ve come from Day 1. Note: 3 things you do very well now. Write these as affirmations to read before the exam.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Vocabulary: exam eve review',         detail:'The evening before exam-style day: light vocabulary review. Re-read your personal collocations cheatsheet. Do NOT learn new things. Just reassure yourself of what you know. Then: rest. Your brain consolidates during sleep.' },
        { id:'r', type:'reading', title:'Reading: exam strategy final read',   detail:'Read your personal "IELTS Reading Attack Plan" that you wrote in Week 19. Visualise yourself executing it perfectly in the exam: skimming headings, reading questions first, timing passages, staying calm when stuck. Mental rehearsal works.', url: IELTS },
        { id:'w', type:'writing', title:'Writing: task 1 & 2 strategy review',  detail:'Read your Task 1 and Task 2 templates/structures. Review: introduction formula for each essay type (opinion, discussion, two-part), your overused cohesive devices to avoid, your top-performing vocabulary for writing. Visualise writing a perfect essay.' },
      ],
      [
        { id:'r', type:'reading', title:'Reading: confidence final session',   detail:'Final Reading session: 1 IELTS passage, your choice, untimed. Read it for enjoyment. Appreciate the academic language. Note any new vocabulary you encounter. This is your last academic reading before the exam. Enjoy it—you earned this moment.', url: IELTS },
        { id:'l', type:'listening',title:'Listening: relax with English audio', detail:'Listen to your favourite English podcast, YouTube channel, or movie for 30 minutes. No notes, no analysis. Pure enjoyment. You have built 140 days of listening skills—trust them. Relax and let your English flow naturally.' },
        { id:'s', type:'speaking',title:'Speaking: light conversation practice', detail:'Speak English for 15 minutes about anything you enjoy—your hobbies, your future plans, something interesting you learned in this 140-day journey. Natural, relaxed, flowing English. This is how IELTS Band 7+ speakers sound: natural and confident.' },
      ],
      [
        { id:'v', type:'vocab',   title:'Rest day: light vocabulary activation', detail:'Gentle vocabulary review only: Read your "Top 100 IELTS collocations" slowly and enjoyably. Don\'t test yourself—just let the language wash over you. Do this for 20 minutes maximum. Then: eat well, sleep well. Your exam performance depends on how rested you are.' },
        { id:'r', type:'reading', title:'Rest day: no intensive practice',     detail:'Today: NO intense IELTS practice. If you need to do something: read a newspaper article in English for 15 minutes. Enjoy it. Keep your mind engaged but not stressed. Trust your 140 days of preparation. You are ready.' },
        { id:'s', type:'speaking',title:'Rest day: positive self-talk',        detail:'Today: speak positively about your IELTS journey. Tell a friend or family member (in English or Vietnamese) about your 140-day journey and what you\'ve learned. Recall your favourite vocabulary. Affirm: "I am prepared. I am confident. I will achieve 7.5."' },
      ],
      // Day 140: FINAL MILESTONE
      [
        { id:'m1', type:'mock', title:'🏆 Final Mock: Listening + Reading', detail:'Full IELTS exam simulation (Listening 40 min + Reading 60 min). Use the best Cambridge test you have. Official conditions. Score both immediately. Compare with your Day 35, 70, 105 scores. Calculate your improvement. CELEBRATE how far you\'ve come!', url: IELTS },
        { id:'m2', type:'mock', title:'🏆 Final Mock: Writing + Analysis',  detail:'Full Writing simulation (60 min). Task 1 + Task 2. After: comprehensive self-assessment. Write your band estimates for all criteria. This is your final practice before the real exam. You have done 140 days of preparation. Trust your work.' },
        { id:'m3', type:'mock', title:'🎓 140 Days Complete – Final Review',  detail:'You have completed 140 days of intensive IELTS preparation. Today: (1) Calculate your progress (compare Phase 4 scores vs Phase 1), (2) Write 3 things you\'re most proud of improving, (3) Review your exam-day strategy one final time, (4) Believe in yourself. 목표: 7.5. You\'ve earned it. 화이팅! 🏆' },
      ],
    ],
  },

];

// ─── Generator ───────────────────────────────────────────────
export function generateRoadmap(): RoadmapDay[] {
  const days: RoadmapDay[] = [];
  WEEKS.forEach((week, wi) => {
    week.days.forEach((dayTasks, di) => {
      const dayNum = wi * 7 + di + 1;
      const isMilestone = [35, 70, 105, 140].includes(dayNum);
      days.push({
        day: dayNum,
        week: wi + 1,
        phase: week.phase,
        theme: week.theme,
        themeEn: week.themeEn,
        tasks: dayTasks.map(t => ({ ...t })),
        isMilestone,
        milestoneLabel: isMilestone ? week.milestone : undefined,
      });
    });
  });
  return days;
}

export const ROADMAP: RoadmapDay[] = generateRoadmap();

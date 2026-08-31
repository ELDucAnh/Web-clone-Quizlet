// lib/roadmap-data.ts — IELTS 140-day: 5.5 → 7.5
// Vocab rules: ≤150 new words/day OR ≤150 review words/day
// Reading: CamCore 600 (B1-B9, 70/batch) → Topic vocab (TR1-TR13, 70/topic) → Cambridge IELTS practice
// Listening: CamListen 600 (BL1-BL20, 30/batch + 40p dictation) → Intensive drill
// Writing T2: 40 topics × 100 collocations + 1 full essay (2 sessions/week)
// Writing T1: 2 essays/session (1 session/week)
// Speaking: 30 topics × 50 vocab + pronunciation + Part 2 AI (2 sessions/week, weeks 1-15)
// Grammar: systematic weekly point

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
  { id: 1 as Phase, name: 'Xây Nền Tảng', bandRange: '5.5 → 6.0', days: [1,35] as [number,number], color: '#4f8ef7', bg: '#EFF6FF', description: 'CamCore 600 Batch 1-9 (nền tảng từ vựng) + CamListen BL1-10 + Writing T01-T10 + Speaking SP01-10.' },
  { id: 2 as Phase, name: 'Bứt Phá', bandRange: '6.0 → 6.5', days: [36,70] as [number,number], color: '#a855f7', bg: '#F5F3FF', description: 'Topic Reading TR1-TR11 + CamListen BL11-BL20 (hoàn thành 600!) + Writing T11-T20 + Speaking SP11-20.' },
  { id: 3 as Phase, name: 'Đào Sâu', bandRange: '6.5 → 7.0', days: [71,105] as [number,number], color: '#06b6d4', bg: '#ECFEFF', description: 'Topic Reading TR12-TR13 → Cambridge IELTS Reading practice + Dictation intensive + Writing T21-T30 + Speaking SP21-30.' },
  { id: 4 as Phase, name: 'Thực Chiến', bandRange: '7.0 → 7.5', days: [106,140] as [number,number], color: '#f59e0b', bg: '#FFFBEB', description: 'Full mock test + Writing T31-T40 + Speaking mock (SP done!) + 4 tasks/day tuần 19-20.' },
];

const BBC6   = 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english';
const BCG    = 'https://learnenglish.britishcouncil.org/grammar';
const CAMDICT= 'https://dictionary.cambridge.org/';
const IELTS  = 'https://ieltsonlinetests.com/';
const BBCENV = 'https://www.bbc.com/news/science-environment';

type T = { id: string; type: TaskType; title: string; detail: string; url?: string };
type WeekDef = { theme: string; themeEn: string; phase: Phase; milestone?: string; days: T[][] };

// ─── Helpers ─────────────────────────────────────────────────
const r = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'reading', title, detail, url });
const l = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'listening', title, detail, url });
const w = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'writing', title, detail, url });
const s = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'speaking', title, detail, url });
const g = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'grammar', title, detail, url });
const v = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'vocab', title, detail, url });
const m = (id: string, title: string, detail: string, url?: string): T => ({ id, type: 'mock', title, detail, url });

const WEEKS: WeekDef[] = [

  // ════════════════════════════════════════════════════════════
  //  PHASE 1 — XÂY NỀN TẢNG (Days 1–35)
  // ════════════════════════════════════════════════════════════

  // ── Week 1: Môi trường & CamCore B1-B2 ─────────────────────
  {
    theme: 'Môi trường & Từ vựng nền', themeEn: 'Environment & Core Vocab', phase: 1,
    days: [
      [
        r('r','📖 CamCore Batch 1 (001–070)','Học 70 từ Cambridge Core 600 Batch 1. Flashcard trong app. Mục tiêu: nhận mặt chữ + nghĩa 100% trong 60p. Từ tiêu biểu: abandon, abstract, access, accommodate, achieve, acquire, adapt, adequate, adjacent, adjust, advocate, aggregate, aid, allocate, alter...', CAMDICT),
        l('l','🎧 CamListen BL1 (001–030) + Chép CT 40p','[30p] Học 30 từ CamListen Batch 1 (#001–030). [40p] Nghe BBC 6 Minute English (environment) → chép chính tả không tạm dừng → check transcript, note từ nghe sai.', BBC6),
        g('g','📝 Ngữ pháp: Điều kiện Type 1 & 2','Type 1: "If we reduce emissions, temperatures will stabilise." Type 2: "If governments invested more, the situation would improve." Viết 5 câu mỗi loại về môi trường.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Environment (W2T01)','Học 100 collocations môi trường (flashcard bộ W2T01): tackle climate change, reduce carbon emissions, combat deforestation, implement green policies, harness solar energy, curb pollution, protect endangered species, achieve net-zero, address environmental degradation, phase out fossil fuels... (100 colloc đầy đủ trong bộ W2T01).'),
        w('w2','✍️ Task 2 Essay: Environment','Đề: "Individuals rather than governments should be responsible for protecting the environment. To what extent do you agree?" Outline 5p → Draft 40p → Proofread 5p. Dùng tối đa collocations W2T01.'),
        v('ck','🔍 Tự chấm essay Environment','Chấm theo 4 tiêu chí: TA (trả lời đủ chưa?), CC (có progression rõ?), LR (dùng được bao nhiêu colloc?), GRA (có lỗi không?). Ghi band tự đánh giá.'),
      ],
      [
        s('s1','🗣️ SP01: Hometown (50 từ) + Phát âm','Học 50 từ Speaking Topic 1 Hometown (flashcard SP01): neighbourhood, residential area, outskirts, urban sprawl, community spirit, local amenities, vibrant atmosphere, cosmopolitan, infrastructure, suburban, multicultural... Sau đó phát âm từng từ theo Cambridge Dictionary.', CAMDICT),
        s('s2','🗣️ Part 2: Hometown Cue Card','Cue card: "Describe your hometown. Say: where it is, what it\'s like, what you like most, and how it has changed." 1p chuẩn bị → 2p nói với AI hoặc ghi âm → nghe lại, note 3 cải thiện.'),
        v('rv','🔄 Ôn nhanh SP01 (50 từ)','Quiz SP01 Hometown: 50 từ — che nghĩa, đọc từ, nói nghĩa tiếng Anh. Target ≥45/50. Từ sai → đặt vào 1 câu ví dụ.'),
      ],
      [
        r('r','📖 CamCore Batch 2 (071–140)','Học 70 từ CamCore Batch 2 (#071–140). Tiêu biểu: ambiguous, amend, analogous, apparent, appeal, appreciate, appropriate, approximate, arbitrary, area, ascertain, aspect, assemble, assess, assign, assume, attain, attitude, attribute, authority...', CAMDICT),
        l('l','🎧 CamListen BL2 (031–060) + Chép CT 40p','[30p] Học 30 từ CamListen BL2 (#031–060). [40p] Nghe IELTS Listening S1 (form-filling) → chép chính tả → check, ghi lỗi chính tả số điện thoại, tên riêng.', IELTS),
        g('g','📝 Ngữ pháp: Điều kiện Type 3 & Mixed','Type 3: "If the policy had been implemented, emissions would have fallen." Mixed: "If we had acted sooner, the planet would be healthier now." Viết 5 câu mỗi loại.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Technology (W2T02)','Học 100 collocations công nghệ (flashcard W2T02): develop cutting-edge technology, harness artificial intelligence, automate repetitive tasks, disrupt traditional industries, enhance productivity, pose ethical concerns, infringe on privacy, revolutionise communication, narrow the digital divide, raise cybersecurity awareness...'),
        w('w2','✍️ Task 2 Essay: Technology','Đề: "Artificial intelligence is a threat to jobs. To what extent do you agree or disagree?" Outline 5p → Draft 40p → Proofread 5p. Dùng tối đa collocations W2T02.'),
        v('ck','🔍 Tự chấm essay Technology','Kiểm tra: (1) intro có paraphrase câu hỏi không? (2) mỗi body para có 1 main idea? (3) conclusion có restate opinion? Ghi lỗi để tránh.'),
      ],
      [
        s('s1','🗣️ SP02: Work & Career (50 từ) + Phát âm','Học 50 từ SP02 Work/Career (flashcard SP02): occupation, profession, vocation, career prospects, work-life balance, remote working, job satisfaction, competitive salary, promotion, redundancy, entrepreneur, freelancer, internship, collaborate, deadline... Phát âm từng từ.', CAMDICT),
        s('s2','🗣️ Part 2: Future Job Cue Card','Cue card: "Describe a job you would like to do in the future. Say: what it is, what it involves, what skills are needed, and why." 1p prep → 2p nói → ghi âm.'),
        w('t1','📊 Task 1: 2 bài Bar Chart','Bài 1 (25p): bar chart số SV đại học theo ngành 2000–2020. Bài 2 (25p): bar chart carbon emissions by sector. Cấu trúc: overview 2 câu + 2 body paragraphs. Tự chấm sau.'),
      ],
      [
        v('rev','🔄 Ôn tập: CamCore B1+B2 (140 từ)','Quiz flashcard CamCore B1 (001–070) + B2 (071–140) = 140 từ. Target ≥90%. Từ sai: ghi vào error list, đặt câu ví dụ. Đây là spaced repetition lần 1.'),
        r('rd','📰 Đọc tin BBC Environment (20p)','Đọc 1 bài BBC Science & Environment. Ghi: main argument, 5 từ academic mới, 3 collocations dùng được trong Writing.', BBCENV),
        v('pl','💡 Tổng kết tuần 1','Tuần này đã nạp: CamCore 140 từ + CamListen 60 từ + Writing 200 colloc + Speaking 100 từ = 500. Ghi điểm yếu nhất để chú ý tuần 2.'),
      ],
    ],
  },

  // ── Week 2: Công nghệ & CamCore B3-B4 ──────────────────────
  {
    theme: 'Công nghệ & Giáo dục', themeEn: 'Technology & Education', phase: 1,
    days: [
      [
        r('r','📖 CamCore Batch 3 (141–210)','Học 70 từ CamCore B3 (#141–210). Tiêu biểu: available, benefit, category, chapter, circumstance, clarify, clause, coherent, coincide, commence, community, compatible, compensate, compile, complex, comprehensive, comprise, concentrate, confirm, conflict...', CAMDICT),
        l('l','🎧 CamListen BL3 (061–090) + Chép CT 40p','[30p] Học 30 từ CamListen BL3 (#061–090). [40p] Nghe IELTS Listening S2 (talk/monologue) → chép chính tả → check transcript.', IELTS),
        g('g','📝 Ngữ pháp: Passive Voice học thuật','It has been argued that... / Research suggests that... / It is widely believed that... Viết 8 câu passive về công nghệ. Tập trung: passive không cần agent khi subject unknown.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Education (W2T03)','Học 100 colloc giáo dục (W2T03): pursue a degree, foster critical thinking, enhance academic performance, promote lifelong learning, implement student-centred learning, standardise assessment, bridge the skills gap, reform the curriculum, increase access to education, develop vocational training...'),
        w('w2','✍️ Task 2 Essay: Education','Đề: "Some people believe online education is as valuable as traditional classroom education. To what extent do you agree?" Outline 5p → Draft 40p → Proofread 5p.'),
        v('ck','🔍 Tự chấm essay Education','Chú ý: bài này yêu cầu "to what extent" → không phải binary agree/disagree, phải có nuance. Kiểm tra: có nêu 2 sides không? Band tự chấm?'),
      ],
      [
        s('s1','🗣️ SP03: Family & Relationships (50 từ)','Học 50 từ SP03 Family (flashcard SP03): extended family, nuclear family, close-knit, generation gap, upbringing, sibling rivalry, parental guidance, domestic responsibilities, filial piety, breadwinner, single-parent, foster care, adopt, cherish, unconditional love... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Important Family Member','Cue card: "Describe a family member who has had a great influence on you. Say: who, what they did, how they influenced you, and how you feel about them." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn nhanh SP03 (50 từ)','Quiz SP03 Family: 50 từ. Target ≥45/50. Từ sai → đặt câu.'),
      ],
      [
        r('r','📖 CamCore Batch 4 (211–280)','Học 70 từ CamCore B4 (#211–280). Tiêu biểu: consequent, consist, constitute, construct, contrast, contribute, controversy, convention, coordinate, create, criteria, crucial, data, debate, deduce, define, deny, derive, differentiate, diminish, discharge, dominate...', CAMDICT),
        l('l','🎧 CamListen BL4 (091–120) + Chép CT 40p','[30p] Học 30 từ CamListen BL4 (#091–120). [40p] Nghe IELTS S3 (discussion) → chép chính tả → note cách phân biệt giọng 2-3 speaker.', IELTS),
        g('g','📝 Ngữ pháp: Reported Speech học thuật','The study argues that... / Researchers claim that... / It has been demonstrated that... Chuyển 8 câu direct → reported, dùng các reporting verbs: argue, claim, suggest, note, state, propose.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Health & Medicine (W2T04)','Học 100 colloc sức khỏe (W2T04): promote public health, prevent chronic diseases, reduce obesity rates, implement healthcare reform, expand access to healthcare, address mental health issues, combat antimicrobial resistance, fund medical research, improve health literacy, regulate junk food...'),
        w('w2','✍️ Task 2 Essay: Health','Đề: "Governments should tax unhealthy food to reduce obesity. To what extent do you agree or disagree?" Outline 5p → Draft 40p → Proofread 5p.'),
        v('ck','🔍 Tự chấm + ghi lỗi W2','Ghi bảng lỗi riêng: (1) lỗi ngữ pháp hay mắc, (2) từ vựng hay dùng sai, (3) cấu trúc essay cần cải thiện. Đây là bảng lỗi để theo dõi suốt 140 ngày.'),
      ],
      [
        s('s1','🗣️ SP04: Friends & Social Life (50 từ)','Học 50 từ SP04 Friends (flashcard SP04): acquaintance, companion, mutual interests, peer pressure, social circle, reliable, trustworthy, supportive, long-distance friendship, meaningful connection, socialise, bond, networking, introvert, extrovert... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: A Good Friend','Cue card: "Describe a good friend of yours. Say: how you met, what they are like, what you do together, and explain why they are a good friend." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: 2 bài Line Graph','Bài 1 (25p): line graph CO₂ emissions 1990–2020 (UK, USA, China). Bài 2 (25p): line graph số lượng SV du học toàn cầu 2000–2015. Overview + 2 body paragraphs. Tự chấm.'),
      ],
      [
        v('rev','🔄 Ôn tập: CamCore B3+B4 (140 từ)','Quiz flashcard CamCore B3 (141–210) + B4 (211–280) = 140 từ. Target ≥90%. Ghi error list. Spaced repetition lần 1 cho B3+B4.'),
        l('lv','🎧 Ôn CamListen BL1+BL2 (60 từ)','Ôn 60 từ CamListen BL1+BL2. Quiz: nghe và viết từ (spelling check). Target ≥55/60. Note từ sai chính tả.'),
        v('pl','💡 Tổng kết tuần 2','CamCore 280 từ tổng (B1-B4) + CamListen 120 từ (BL1-BL4) + Writing T01-T04 = 400 colloc + Speaking SP01-SP04 = 200 từ. Đang đúng lộ trình!'),
      ],
    ],
  },

  // ── Week 3: Giáo dục & CamCore B5-B6 ──────────────────────
  {
    theme: 'Y tế & Ngữ pháp nâng cao', themeEn: 'Health & Grammar', phase: 1,
    days: [
      [
        r('r','📖 CamCore Batch 5 (281–350)','Học 70 từ CamCore B5 (#281–350). Tiêu biểu: economic, edit, enhance, environment, establish, evaluate, evident, evolve, exclude, exhibit, expand, explicit, expose, external, facilitate, factor, feature, finite, fluctuate, format, formulate, foundation...', CAMDICT),
        l('l','🎧 CamListen BL5 (121–150) + Chép CT 40p','[30p] Học 30 từ CamListen BL5 (#121–150). [40p] Nghe IELTS S4 (academic lecture) → chép chính tả → đây là section khó nhất, chú ý predict từ loại trước khi nghe.', IELTS),
        g('g','📝 Ngữ pháp: Relative Clauses','Defining: "Countries that fail to act will face penalties." Non-defining: "The Amazon, which covers 60% of Brazil, is shrinking." Viết 6 câu (3+3) về health hoặc education. Chú ý dấu phẩy.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Society (W2T05)','Học 100 colloc xã hội (W2T05): address inequality, promote social cohesion, tackle homelessness, bridge the wealth gap, empower marginalised groups, strengthen community ties, reduce crime rates, implement social welfare, foster civic participation, combat discrimination...'),
        w('w2','✍️ Task 2 Essay: Society','Đề: "In many countries, the gap between rich and poor is growing. What are the causes, and what can be done?" Cấu trúc: causes para + solutions para. Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm essay Society','Kiểm tra: Problem-solution structure — mỗi cause có linked solution không? CC: có "This is because..." / "Therefore..." / "As a result..." không?'),
      ],
      [
        s('s1','🗣️ SP05: Technology & Gadgets (50 từ)','Học 50 từ SP05 Technology (flashcard SP05): smartphone, laptop, tablet, wearable device, artificial intelligence, virtual reality, augmented reality, social media platform, app, gadget, innovation, upgrade, software, hardware, connectivity, bandwidth... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Useful Technology','Cue card: "Describe a piece of technology you find very useful. Say: what it is, how long you have used it, how you use it, and why it is useful." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP01+SP02 (100 từ)','Quiz SP01 Hometown + SP02 Work = 100 từ. Target ≥90%. Đây là lần ôn thứ 2 (spaced repetition tuần 3).'),
      ],
      [
        r('r','📖 CamCore Batch 6 (351–420)','Học 70 từ CamCore B6 (#351–420). Tiêu biểu: framework, function, generate, global, guarantee, hypothesis, identify, illustrate, impact, implement, imply, impose, indicate, individual, influence, inherent, integrate, internal, interpret, investigate, justify, label...', CAMDICT),
        l('l','🎧 CamListen BL6 (151–180) + Chép CT 40p','[30p] Học 30 từ CamListen BL6 (#151–180). [40p] Nghe IELTS S1 map-labelling → chép directional language: opposite, adjacent to, next to, to the left of, turn right at...', IELTS),
        g('g','📝 Ngữ pháp: Articles (a/an/the/zero)','Rules: "Education is important" (zero) / "The education system in Vietnam" (specific) / "a university" (first mention). Viết đoạn 100 từ về health, tự check articles.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Science (W2T06)','Học 100 colloc khoa học (W2T06): conduct research, carry out experiments, draw conclusions, publish findings, test a hypothesis, peer-review a paper, fund scientific research, challenge conventional wisdom, apply for a grant, replicate results, identify patterns, quantify data...'),
        w('w2','✍️ Task 2 Essay: Science','Đề: "Governments should invest more in scientific research, even if it means cutting other public services. To what extent do you agree?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm + kiểm tra word forms','Sau khi viết: highlight tất cả các từ bạn dùng từ W2T06. Có ít nhất 8 collocations không? Kiểm tra word forms: research (n/v), scientific (adj), researcher (n).'),
      ],
      [
        s('s1','🗣️ SP06: Social Media & Internet (50 từ)','Học 50 từ SP06 Social Media (flashcard SP06): social media platform, influencer, viral content, online community, digital literacy, misinformation, cyberbullying, echo chamber, filter bubble, privacy settings, algorithm, engagement, hashtag, content creator, digital footprint... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Social Media Experience','Cue card: "Describe a time when social media had a positive effect on you or someone you know. Say: what happened, how social media was involved, and what you learned from it." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: 2 bài Pie Chart','Bài 1 (25p): pie chart nguồn điện ở 2 quốc gia năm 2020. Bài 2 (25p): pie chart chi tiêu hộ gia đình tại UK. Overview: "Overall, the most notable feature is..." Tự chấm.'),
      ],
      [
        v('rev','🔄 Ôn CamListen BL1-BL4 (120 từ)','Ôn 4 batch đầu CamListen: BL1 (001-030) + BL2 (031-060) + BL3 (061-090) + BL4 (091-120) = 120 từ. Quiz: nghe và viết (spelling). Target ≥108/120 (90%).'),
        r('rd','📰 Đọc IELTS Reading 1 passage (20p)','Làm 1 IELTS Reading passage (13 câu, 20 phút) trên ieltsonlinetests.com. Đây là practice nhẹ, không cần tính điểm — chỉ làm quen format.', IELTS),
        v('pl','💡 Tổng kết tuần 3','CamCore: 420 từ (B1-B6 done!) + CamListen: 180 từ (BL1-BL6 done) + Writing: T01-T06 = 600 colloc + Speaking: SP01-SP06 = 300 từ. Vẫn đúng tiến độ.'),
      ],
    ],
  },

  // ── Week 4: Kinh doanh & CamCore B7-B8 ─────────────────────
  {
    theme: 'Khoa học & Kinh doanh', themeEn: 'Science & Business', phase: 1,
    days: [
      [
        r('r','📖 CamCore Batch 7 (421–490)','Học 70 từ CamCore B7 (#421–490). Tiêu biểu: legal, maintain, major, mechanism, minimise, modify, monitor, mutual, negate, network, norm, objective, obtain, offset, optimise, orient, paradigm, participant, perceive, persist, phenomenon, pose, predict, predominant, presume...', CAMDICT),
        l('l','🎧 CamListen BL7 (181–210) + Chép CT 40p','[30p] Học 30 từ CamListen BL7 (#181–210). [40p] Nghe IELTS S4 academic lecture → chép, chú ý: headings/subheadings giúp predict content. Lần này cố gắng không nghe lại lần 2.', IELTS),
        g('g','📝 Ngữ pháp: Cause & Effect Connectors','because of, due to, as a result of, therefore, consequently, hence, thus. "Smoking leads to lung disease." / "Due to poor diet, obesity rates are rising." Viết 8 câu về health/business.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Business & Economy (W2T07)','Học 100 colloc kinh doanh (W2T07): boost economic growth, stimulate the economy, generate employment, attract foreign investment, enhance competitiveness, streamline operations, launch a startup, disrupt the market, manage cash flow, address income inequality, implement fiscal policy, privatise state assets...'),
        w('w2','✍️ Task 2 Essay: Business','Đề: "Large multinational companies have too much power in today\'s world. To what extent do you agree?" Outline 5p → Draft 40p. Dùng tối đa W2T07.'),
        v('ck','🔍 Tự chấm + kiểm tra hedging','Sau khi viết: tìm và highlight tất cả hedging language: "It could be argued that...", "Some might suggest...", "Evidence suggests...". IELTS Band 7+ cần hedging.'),
      ],
      [
        s('s1','🗣️ SP07: Environment & Nature (50 từ)','Học 50 từ SP07 Environment (flashcard SP07): biodiversity, ecosystem, habitat destruction, carbon footprint, renewable energy, climate change, global warming, pollution, conservation, sustainability, endangered species, deforestation, natural resources, greenhouse gas, wildlife... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Environmental Problem','Cue card: "Describe an environmental problem in your country. Say: what the problem is, what causes it, how it affects people, and what you think should be done." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP03+SP04 (100 từ)','Quiz SP03 Family + SP04 Friends = 100 từ. Spaced repetition tuần 4. Target ≥90%.'),
      ],
      [
        r('r','📖 CamCore Batch 8 (491–560)','Học 70 từ CamCore B8 (#491–560). Tiêu biểu: principal, process, promote, proportion, propose, regulate, reinforce, relevant, require, restrict, retain, reveal, scope, sector, sequence, significant, simulate, specify, stabilise, stipulate, strategy, subsidy, substitute, supplement, sustain...', CAMDICT),
        l('l','🎧 CamListen BL8 (211–240) + Chép CT 40p','[30p] Học 30 từ CamListen BL8 (#211–240). [40p] Nghe IELTS S2 (talk with map/plan) → chép directional + descriptive language. Luyện S2 vì hay bị mất điểm do map labelling.', IELTS),
        g('g','📝 Ngữ pháp: Purpose Clauses','in order to, so that, so as to, with the aim of. "Doctors recommend exercise in order to reduce heart disease risk." / "Governments invest in healthcare so that citizens receive treatment." Viết 8 câu về business hoặc science.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Government & Politics (W2T08)','Học 100 colloc chính trị (W2T08): implement public policy, enact legislation, regulate the market, enforce the law, fund social programmes, promote democratic values, address corruption, ensure transparency, uphold human rights, strengthen international cooperation, impose sanctions, reform the tax system...'),
        w('w2','✍️ Task 2 Essay: Government','Đề: "The role of government is to serve the needs of society, not to control individuals. To what extent do you agree?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm essay Government','Kiểm tra cấu trúc: Intro (2-3 câu) + Body 1 (pro govt control) + Body 2 (anti) + Conclusion (1-2 câu). Mỗi body có: claim + evidence + example không?'),
      ],
      [
        s('s1','🗣️ SP08: Transport & Commuting (50 từ)','Học 50 từ SP08 Transport (flashcard SP08): public transport, commute, traffic congestion, infrastructure, pedestrian, cyclist, carpooling, ride-sharing, electric vehicle, carbon emissions, urban planning, road network, subway, tram, ferry, aviation... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Transport in Your City','Cue card: "Describe the transportation system in your city. Say: what options are available, what you use, any problems with it, and how it could be improved." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: 2 bài Table','Bài 1 (25p): table showing employment rates by sector in 3 countries. Bài 2 (25p): table comparing education spending (% GDP) in 5 countries 2010/2020. Tự chấm: có overview chứa 2 key features không?'),
      ],
      [
        v('rev','🔄 Ôn CamCore B5+B6 (140 từ)','Quiz CamCore B5 (281–350) + B6 (351–420) = 140 từ. Spaced repetition lần 1 cho B5+B6. Target ≥90%.'),
        v('rev2','🔄 Ôn Writing Colloc T01+T02 (key 50)','Ôn 50 collocations quan trọng nhất từ W2T01 (Environment) + W2T02 (Technology). Không cần ôn hết 200 — chỉ 25 colloc hay dùng nhất của mỗi topic.'),
        v('pl','💡 Tổng kết tuần 4','CamCore: 560 từ (B1-B8 done!) + CamListen: 240 từ (BL1-BL8) + Writing: T01-T08 = 800 colloc + Speaking: SP01-SP08 = 400 từ. 1 tuần nữa xong CamCore 600!'),
      ],
    ],
  },

  // ── Week 5: Hoàn thành CamCore + Milestone 1 ───────────────
  {
    theme: 'Truyền thông & Giao thông + Milestone 1', themeEn: 'Media, Transport & Milestone 1', phase: 1,
    milestone: '🏆 Mock Test Phase 1 — Đánh giá band điểm đầu tiên',
    days: [
      [
        r('r','📖 CamCore Batch 9 (561–600) — DONE! ✅','Học 40 từ cuối CamCore B9 (#561–600). Tiêu biểu: transfer, transform, trend, undergo, undermine, uniform, utilise, valid, variation, verify, whereas, widespread. ĐÃ HOÀN THÀNH Cambridge Core 600! Từ hôm nay chuyển sang Topic Vocab.', CAMDICT),
        l('l','🎧 CamListen BL9 (241–270) + Chép CT 40p','[30p] Học 30 từ CamListen BL9 (#241–270). [40p] Nghe IELTS S4 — lần này target: viết đúng ≥8/10 câu mà không nghe lại.', IELTS),
        g('g','📝 Ngữ pháp: Modals (should, must, ought to)','should (recommendation), must (obligation), ought to (moral duty), might (possibility), could (suggestion). Viết 8 câu về media hoặc transport dùng đúng modal.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Media & Communication (W2T09)','Học 100 colloc truyền thông (W2T09): spread misinformation, regulate social media, promote media literacy, censure online content, protect press freedom, combat fake news, influence public opinion, monetise content, broadcast live, conduct interviews, analyse data journalism, ensure editorial independence...'),
        w('w2','✍️ Task 2 Essay: Media','Đề: "Social media is more harmful than beneficial to society. To what extent do you agree?" Outline 5p → Draft 40p. Dùng W2T09.'),
        v('ck','🔍 Tự chấm essay Media','Kiểm tra LR đặc biệt: có ít nhất 5 collocations từ W2T09 không? Có dùng academic vocabulary thay vì basic words không? (good→beneficial, say→argue, use→utilise).'),
      ],
      [
        s('s1','🗣️ SP09: Food & Cooking (50 từ)','Học 50 từ SP09 Food (flashcard SP09): cuisine, delicacy, ingredient, recipe, flavour, nutritious, processed food, organic, fast food, dietary habit, vegetarian, vegan, culinary tradition, food security, sustainable farming, appetising, portion, feast, snack... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Favourite Food/Meal','Cue card: "Describe a dish from your country that you enjoy. Say: what it is, how it is prepared, when people eat it, and why you like it." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP05+SP06 (100 từ)','Quiz SP05 Technology + SP06 Social Media = 100 từ. Spaced repetition tuần 5.'),
      ],
      [
        r('r','📖 Topic Reading TR1: Environment (70 từ học thuật)','Học 70 từ academic theo chủ đề Environment (flashcard TR1): anthropogenic, biodegradable, carbon sequestration, deforestation, desertification, ecological footprint, eutrophication, greenhouse effect, hydrocarbon, industrialisation, methane, mitigation, ozone depletion, particulate matter, photosynthesis, remediation, sustainability... (70 từ đầy đủ trong flashcard TR1).', CAMDICT),
        l('l','🎧 CamListen BL10 (271–300) + Chép CT 40p','[30p] Học 30 từ CamListen BL10 (#271–300). [40p] Nghe IELTS S3 discussion → chép, chú ý: distinguish speakers — ghi "Speaker A says..." / "Speaker B disagrees...".', IELTS),
        g('g','📝 Ngữ pháp: Concession (although, despite)','Although poverty has declined, inequality remains. / Despite progress, challenges remain. / Even though charities help, government intervention is needed. Viết 8 câu dùng 3 loại concession.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Transport & Urban (W2T10)','Học 100 colloc giao thông (W2T10): alleviate traffic congestion, expand public transportation, introduce congestion charges, promote cycling infrastructure, develop smart cities, implement urban planning, reduce carbon emissions from vehicles, build sustainable housing, enhance road safety, encourage carpooling...'),
        w('w2','✍️ Task 2 Essay: Transport','Đề: "The only way to solve traffic and pollution problems in cities is to increase the price of petrol. To what extent do you agree?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm essay Transport','Essay này cần: (1) acknowledge the claim nhưng (2) argue other solutions also needed. Kiểm tra: có "While it is true that..., there are other equally effective measures such as..." không?'),
      ],
      [
        s('s1','🗣️ SP10: Sport & Exercise (50 từ)','Học 50 từ SP10 Sport (flashcard SP10): physical fitness, competitive sport, amateur, professional athlete, endurance, agility, stamina, team sport, individual sport, tournament, championship, coach, training regimen, injury, sportsmanship, recreation, outdoor activity... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Sport or Physical Activity','Cue card: "Describe a sport or physical activity you enjoy. Say: what it is, how often you do it, how you got into it, and why you enjoy it." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: Process Diagram + Map','Bài 1 (25p): process diagram — water treatment process. Dùng passive + sequencing words: first, subsequently, following this, finally. Bài 2 (25p): map showing changes to a town centre 1990–2020. Tự chấm.'),
      ],
      // Day 35 = MILESTONE
      [
        m('m1','🏆 Mock Test: Listening (Full — 40 câu)','Làm Full IELTS Listening Test (30p nghe + 10p transfer). Dùng ieltsonlinetests.com. Điều kiện nghiêm túc. Chấm điểm → band score → ghi: S1, S2, S3, S4 mỗi section sai bao nhiêu câu.', IELTS),
        m('m2','🏆 Mock Test: Reading (Full — 40 câu)','Làm Full IELTS Reading Test (60p, 3 passages). Timer nghiêm túc. Sau khi làm: chấm điểm, ghi lỗi sai theo loại câu (Matching Headings, T/F/NG, MCQ...).', IELTS),
        m('m3','🏆 Mock Test: Writing + Speaking Review','Writing: Task 1 (20p) + Task 2 (40p). Speaking: ghi âm Part 1+2+3 (~14p). Tự review bằng IELTS Band Descriptors. GHI LẠI band score Phase 1 để so sánh với Phase 4!'),
      ],
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  PHASE 2 — BỨT PHÁ (Days 36–70)
  // ════════════════════════════════════════════════════════════

  // ── Week 6: Topic TR2-TR3 + CamListen BL11-BL12 ───────────
  {
    theme: 'Topic Reading: Công nghệ & Giáo dục', themeEn: 'Topic Vocab: Technology & Education', phase: 2,
    days: [
      [
        r('r','📖 Topic TR2: Technology (70 từ học thuật)','Học 70 từ academic chủ đề Technology (flashcard TR2): algorithm, automation, bandwidth, biometrics, cloud computing, cybersecurity, digitalisation, disruptive, encryption, firmware, genomics, hyperconnected, interface, latency, machine learning, nanotechnology, open-source, prototype, scalable, semiconductor...', CAMDICT),
        l('l','🎧 CamListen BL11 (301–330) + Chép CT 40p','[30p] Học 30 từ CamListen BL11 (#301–330). [40p] Nghe IELTS S4 về công nghệ → chép → target: ≥8/10, không nghe lại lần 2.', IELTS),
        g('g','📝 Ngữ pháp: Advanced Passive + Impersonal','It has been shown that... / It remains unclear whether... / There is growing evidence to suggest that... / It is increasingly recognised that... Viết 8 impersonal sentences về technology.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Food & Diet (W2T11)','Học 100 colloc ăn uống (W2T11): adopt a balanced diet, combat malnutrition, promote food security, reduce food waste, regulate junk food advertising, support sustainable agriculture, encourage healthy eating habits, address childhood obesity, ban harmful additives, improve nutritional labelling...'),
        w('w2','✍️ Task 2 Essay: Food & Diet','Đề: "Junk food is so popular that it is having a detrimental effect on people\'s health. What can governments and individuals do about this?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm essay Food','Bài này là "two groups question" (governments + individuals). Kiểm tra: có para riêng cho governments và individuals không? Hoặc trộn hợp lý?'),
      ],
      [
        s('s1','🗣️ SP11: Health & Well-being (50 từ)','Học 50 từ SP11 Health (flashcard SP11): well-being, mental health, chronic disease, preventive healthcare, physical fitness, nutrition, immune system, stress management, healthcare system, GP, specialist, medication, therapy, rehabilitation, sedentary lifestyle, obesity, mindfulness... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Healthy Habit','Cue card: "Describe a healthy habit you have. Say: what the habit is, when you started, how it has benefited you, and why you think it is important." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP07+SP08 (100 từ)','Quiz SP07 Environment + SP08 Transport = 100 từ. Target ≥90%.'),
      ],
      [
        r('r','📖 Topic TR3: Education (70 từ học thuật)','Học 70 từ academic Education (flashcard TR3): academic achievement, cognitive development, curriculum design, constructivism, differentiated instruction, empirical learning, formative assessment, growth mindset, holistic education, inclusive education, interdisciplinary, learner autonomy, metacognition, pedagogical, peer assessment, scaffolding, self-regulated learning, standardised testing, teacher-centred, vocational...', CAMDICT),
        l('l','🎧 CamListen BL12 (331–360) + Chép CT 40p','[30p] Học 30 từ CamListen BL12 (#331–360). [40p] Nghe IELTS S3 discussion → chú ý: trong S3 có distractors — speaker đôi khi thay đổi ý kiến. Ghi "initially...then changed to..."', IELTS),
        g('g','📝 Ngữ pháp: Complex Noun Phrases','A rapidly growing body of evidence... / The latest peer-reviewed studies indicate... / An unprecedented level of collaboration... Viết 8 sentences về education dùng complex NPs.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Arts & Culture (W2T12)','Học 100 colloc nghệ thuật (W2T12): promote cultural heritage, preserve traditional art forms, support creative industries, fund arts programmes, boost cultural tourism, foster cultural exchange, celebrate diversity, combat cultural appropriation, encourage artistic expression, revitalise historical sites...'),
        w('w2','✍️ Task 2 Essay: Arts','Đề: "Government money should be spent on science and technology rather than arts. To what extent do you agree?" Outline 5p → Draft 40p. Dùng W2T12.'),
        v('ck','🔍 Tự chấm essay Arts','Checking LR: có dùng synonyms để tránh lặp "arts" không? (creative industries / cultural sector / the humanities / artistic endeavours)'),
      ],
      [
        s('s1','🗣️ SP12: Travel & Holidays (50 từ)','Học 50 từ SP12 Travel (flashcard SP12): itinerary, destination, sightseeing, backpacking, eco-tourism, package tour, adventure travel, cultural immersion, jet lag, hostel, accommodation, visa, tourist attraction, souvenir, exchange rate, travel insurance, expedition... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Memorable Trip','Cue card: "Describe a trip or holiday you enjoyed. Say: where you went, who you went with, what you did, and explain why it was memorable." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: 2 bài Mixed (Bar + Line)','Bài 1 (25p): bar chart về tourist arrivals by region. Bài 2 (25p): line graph về art museum attendance 2010–2020. Tự chấm: overview cho mixed charts cần so sánh 2 datasets.'),
      ],
      [
        v('rev','🔄 Ôn CamCore B7+B8 (140 từ)','Quiz CamCore B7 (421–490) + B8 (491–560) = 140 từ. Spaced repetition. Target ≥90%. Note: B7+B8 là những từ academic phức tạp nhất.'),
        v('rev2','🔄 Ôn CamListen BL5+BL6 (60 từ)','Quiz CamListen BL5 + BL6 = 60 từ (spelling check). Target ≥54/60.'),
        v('pl','💡 Tổng kết tuần 6','Phase 2 bắt đầu tốt! Topic Reading: TR1 (Env) + TR2 (Tech) + TR3 (Edu) done. CamListen: 360 từ (BL1-BL12 done). Writing: T11-T12. Speaking: SP11-12.'),
      ],
    ],
  },

  // ── Week 7: Topic TR4-TR5 + CamListen BL13-BL14 ───────────
  {
    theme: 'Tội phạm & Gia đình', themeEn: 'Crime, Family & Topic Vocab', phase: 2,
    days: [
      [
        r('r','📖 Topic TR4: Health & Medicine (70 từ)','Học 70 từ academic Health (flashcard TR4): aetiology, antibody, carcinogen, clinical trial, comorbidity, contraindication, diagnosis, epidemic, epidemiology, euthanasia, genome, immunisation, morbidity, mortality, neuroscience, oncology, palliative care, pathogen, pharmacology, prognosis, psychotherapy, quarantine, rehabilitation, remission, triage...', CAMDICT),
        l('l','🎧 CamListen BL13 (361–390) + Chép CT 40p','[30p] Học 30 từ CamListen BL13 (#361–390). [40p] Nghe S4 lecture về health → chép, chú ý academic hedging: "may indicate", "appears to suggest", "it is hypothesised that..."', IELTS),
        g('g','📝 Ngữ pháp: Comparison Structures','significantly more/less than, considerably higher/lower, roughly twice as many as, the fastest-growing, in contrast to, relative to. Viết 8 câu so sánh về health data (làm quen Task 1).', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Crime & Justice (W2T13)','Học 100 colloc tội phạm (W2T13): combat organised crime, reduce recidivism, impose stricter sentencing, rehabilitate offenders, prevent juvenile delinquency, enforce the law, deter criminal behaviour, address root causes of crime, strengthen border controls, combat human trafficking, reform the prison system...'),
        w('w2','✍️ Task 2 Essay: Crime','Đề: "The best way to reduce crime is to give longer prison sentences. To what extent do you agree?" Outline 5p → Draft 40p. Dùng W2T13.'),
        v('ck','🔍 Tự chấm essay Crime','Kiểm tra: có alternative solutions không? (education, rehabilitation, community programmes). Essay chỉ say "longer sentences = bad" mà không đề xuất alternatives sẽ thiếu Task Achievement.'),
      ],
      [
        s('s1','🗣️ SP13: Education & Studying (50 từ)','Học 50 từ SP13 Education (flashcard SP13): curriculum, scholarship, tuition fees, academic pressure, extracurricular activities, learning outcomes, critical thinking, peer learning, distance education, graduate, undergraduate, dissertation, thesis, lecture, seminar, tutorial, campus life... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Memorable Teacher','Cue card: "Describe a teacher who has had a positive influence on you. Say: who, what subject, what made them special, and how they influenced you." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP09+SP10 (100 từ)','Quiz SP09 Food + SP10 Sport = 100 từ. Spaced repetition tuần 7. Target ≥90%.'),
      ],
      [
        r('r','📖 Topic TR5: Society & Community (70 từ)','Học 70 từ academic Society (flashcard TR5): assimilation, civil society, collective identity, communitarianism, cosmopolitanism, demographic transition, diaspora, egalitarianism, gentrification, globalisation, hegemony, integration, marginalisation, meritocracy, multiculturalism, nationalism, neoliberalism, patriarchy, pluralism, polarisation, populism, social capital, stratification, xenophobia...', CAMDICT),
        l('l','🎧 CamListen BL14 (391–420) + Chép CT 40p','[30p] Học 30 từ CamListen BL14 (#391–420). [40p] Nghe IELTS S2 (map + directions) → chép directional language. S2 map là dạng hay bị mất điểm do không quen.', IELTS),
        g('g','📝 Ngữ pháp: Gerunds vs Infinitives','enjoy/avoid/suggest/recommend + gerund. want/need/decide/manage/fail + infinitive. "It is important to protect privacy." vs "Using social media can be addictive." Viết 10 câu.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Family & Children (W2T14)','Học 100 colloc gia đình (W2T14): raise children, instil values, foster independence, build strong family bonds, address family breakdown, support single parents, tackle domestic violence, promote parental involvement, ensure child welfare, reduce teenage pregnancy, provide childcare, balance work and family life...'),
        w('w2','✍️ Task 2 Essay: Family','Đề: "In many countries, grandparents are often responsible for raising grandchildren. What are the advantages and disadvantages of this?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm essay Family','Bài advantages/disadvantages: kiểm tra cân bằng (không được quá thiên về 1 phía). Mỗi point có example cụ thể không (specific country/situation)?'),
      ],
      [
        s('s1','🗣️ SP14: Books & Reading (50 từ)','Học 50 từ SP14 Books (flashcard SP14): novel, fiction, non-fiction, bestseller, author, genre, plot, character development, narrative, biography, autobiography, bookstore, e-book, audiobook, literary criticism, reading habit, book club, classic literature, contemporary, publication... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Favourite Book or Film','Cue card: "Describe a book you have read that you found interesting. Say: what it is, what it is about, why you chose to read it, and what you liked about it." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: 2 bài Mixed (Pie + Table)','Bài 1 (25p): pie charts so sánh household spending 2000 vs 2020. Bài 2 (25p): table về crime rates by type in 3 cities. Tự chấm: với Table — có identify most/least notable features không?'),
      ],
      [
        v('rev','🔄 Ôn CamListen BL7+BL8 (60 từ)','Quiz CamListen BL7 + BL8 = 60 từ. Target ≥54/60.'),
        v('rev2','🔄 Ôn Topic TR1+TR2 (140 từ)','Quiz Topic TR1 Environment + TR2 Technology = 140 từ học thuật. Spaced repetition. Target ≥90%.'),
        v('pl','💡 Tổng kết tuần 7','Topic Reading: TR4+TR5 done. CamListen: 420 từ (BL1-BL14 done). Writing: T13+T14. Speaking: SP13+14.'),
      ],
    ],
  },

  // ── Week 8: Công việc & Ngôn ngữ ──────────────────────────
  {
    theme: 'Công việc & Ngôn ngữ', themeEn: 'Work, Language & Topic Vocab', phase: 2,
    days: [
      [
        r('r','📖 Topic TR6: Science & Research (70 từ)','Học 70 từ academic Science (flashcard TR6): causality, confounding variable, control group, cross-sectional study, data triangulation, empirical evidence, extrapolation, falsifiability, longitudinal study, meta-analysis, observational study, operationalisation, paradigm shift, peer review, placebo, qualitative, quantitative, randomised controlled trial, replication, sampling bias, statistical significance, systematic review...', CAMDICT),
        l('l','🎧 CamListen BL15 (421–450) + Chép CT 40p','[30p] Học 30 từ CamListen BL15 (#421–450). [40p] Nghe IELTS S4 → lần này viết đúng ≥9/10 câu. S4 là key section để đạt L Band 7+.', IELTS),
        g('g','📝 Ngữ pháp: Noun Clauses','It is clear that... / The fact that robots perform surgery is remarkable. / What concerns many is the lack of regulation. Viết 6 noun clause sentences về science.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Work & Employment (W2T15)','Học 100 colloc công việc (W2T15): enhance job security, address unemployment, promote work-life balance, combat workplace discrimination, improve employee well-being, increase minimum wage, foster entrepreneurship, develop vocational skills, reduce gender pay gap, implement flexible working arrangements...'),
        w('w2','✍️ Task 2 Essay: Work','Đề: "Some people think that it is better to work for yourself or run your own business than to be an employee. To what extent do you agree?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm: LR nâng cao','Essay này về Work: dùng bao nhiêu synonyms cho "work": employment, occupation, livelihood, career, vocation. Dùng bao nhiêu synonyms cho "business": enterprise, venture, company, firm, organisation.'),
      ],
      [
        s('s1','🗣️ SP15: Music & Entertainment (50 từ)','Học 50 từ SP15 Music (flashcard SP15): genre, melody, rhythm, lyrics, composer, orchestra, concert, album, playlist, streaming, live performance, music festival, instrument, folk music, classical, contemporary, pop culture, entertainment industry, celebrity, fandom... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Favourite Music/Singer','Cue card: "Describe a singer or band you enjoy listening to. Say: who they are, what kind of music they make, how you discovered them, and why you like them." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP11+SP12 (100 từ)','Quiz SP11 Health + SP12 Travel = 100 từ. Target ≥90%.'),
      ],
      [
        r('r','📖 Topic TR7: Business & Economics (70 từ)','Học 70 từ academic Business (flashcard TR7): amortisation, arbitrage, bear market, bond, bull market, capital expenditure, cartel, commodity, comparative advantage, depreciation, derivative, diversification, dividend, elasticity, fiscal policy, GDP, hedge fund, inflation, interest rate, liquidity, macroeconomics, monopoly, oligopoly, outsourcing, quantitative easing...', CAMDICT),
        l('l','🎧 CamListen BL16 (451–480) + Chép CT 40p','[30p] Học 30 từ CamListen BL16 (#451–480). [40p] Nghe IELTS S3 discussion về work/business → chép + ghi speaker opinions riêng biệt.', IELTS),
        g('g','📝 Ngữ pháp: Cleft Sentences','It is the government that... / What I believe is that... / What the data shows is... / It was in 2020 that... Cleft sentences tạo emphasis — Band 7+ Writing cần dùng.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Language & Communication (W2T16)','Học 100 colloc ngôn ngữ (W2T16): achieve fluency, acquire a second language, develop communication skills, overcome language barriers, promote multilingualism, preserve endangered languages, implement language policy, foster intercultural understanding, master pronunciation, expand vocabulary, translate accurately...'),
        w('w2','✍️ Task 2 Essay: Language','Đề: "Some people think it is better to learn a global language such as English rather than preserve local languages. Discuss both views." Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm: "Discuss both views" structure','Bài Discuss Both Views: para 1 = view A (argue with examples), para 2 = view B (argue with examples), para 3 (optional) = own opinion. Kiểm tra: có trình bày CẢ HAI views công bằng không?'),
      ],
      [
        s('s1','🗣️ SP16: Art & Design (50 từ)','Học 50 từ SP16 Art (flashcard SP16): painting, sculpture, architecture, photography, digital art, gallery, exhibition, artwork, artistic style, abstract, impressionism, contemporary art, craft, design, aesthetic, creative process, artistic talent, cultural significance, art appreciation, commission... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Artwork or Building','Cue card: "Describe a work of art or a building that you find impressive. Say: what it is, where it is, what it looks like, and explain why you find it impressive." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: Process Diagram + Bar','Bài 1 (25p): process diagram — how paper is recycled. Bài 2 (25p): bar chart cho Cambridge IELTS (tìm 1 bài từ Cambridge Books 13-17). Tự chấm cả 2.'),
      ],
      [
        v('rev','🔄 Ôn Topic TR3+TR4 (140 từ)','Quiz TR3 Education + TR4 Health = 140 từ. Spaced repetition. Target ≥90%.'),
        v('rev2','🔄 Ôn CamListen BL9+BL10 (60 từ)','Quiz CamListen BL9 + BL10 = 60 từ. Target ≥54/60.'),
        v('pl','💡 Tổng kết tuần 8','TR6+TR7 done. CamListen: 480 từ (BL1-BL16 done — 80% hoàn thành!). Writing: T15+T16. Speaking: SP15+16. Tuần sau BL17-18, tuần 10 BL19-20 là xong 600 từ Listening!'),
      ],
    ],
  },

  // ── Week 9: Du lịch & Nhà ở ────────────────────────────────
  {
    theme: 'Du lịch & Nhà ở', themeEn: 'Tourism, Housing & Topic Vocab', phase: 2,
    days: [
      [
        r('r','📖 Topic TR8: Government & Law (70 từ)','Học 70 từ academic Government (flashcard TR8): accountability, bicameral, bureaucracy, civil liberties, constitution, democracy, devolution, due process, egalitarianism, electoral system, federalism, geopolitics, governance, habeas corpus, hegemony, jurisdiction, legislation, lobbyist, meritocracy, parliamentary, referendum, sovereignty, totalitarianism, treaty...', CAMDICT),
        l('l','🎧 CamListen BL17 (481–510) + Chép CT 40p','[30p] Học 30 từ CamListen BL17 (#481–510). [40p] Nghe IELTS S4 về government/law → target: ≥9/10. Chú ý proper nouns và dates — thường là trap.', IELTS),
        g('g','📝 Ngữ pháp: Mixed Conditionals','If + past perfect → would/could present (past condition, present result). "If I had studied law, I would be a lawyer now." Viết 6 mixed conditionals về government policies.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Tourism & Travel (W2T17)','Học 100 colloc du lịch (W2T17): boost tourism revenue, develop eco-tourism, protect cultural heritage sites, promote sustainable travel, address overtourism, improve tourist infrastructure, attract foreign visitors, regulate the hospitality industry, foster cultural exchange, enhance the visitor experience...'),
        w('w2','✍️ Task 2 Essay: Tourism','Đề: "Tourism has both positive and negative effects on local communities. What are these, and how can negative effects be minimised?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm essay Tourism','Câu hỏi "what are these AND how can..." = 2 parts! Kiểm tra: có answer BOTH parts không? Task Achievement = answer all parts of question.'),
      ],
      [
        s('s1','🗣️ SP17: Fashion & Clothing (50 từ)','Học 50 từ SP17 Fashion (flashcard SP17): wardrobe, outfit, trend, designer, haute couture, fast fashion, sustainable fashion, accessories, textile, fabric, brand, retail, style, minimalist, vintage, second-hand, fashion industry, model, runway, dress code... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Clothing/Fashion Topic','Cue card: "Describe a piece of clothing you own that is important to you. Say: what it is, where you got it, when you wear it, and why it is important to you." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP13+SP14 (100 từ)','Quiz SP13 Education + SP14 Books = 100 từ. Target ≥90%.'),
      ],
      [
        r('r','📖 Topic TR9: Media & Communication (70 từ)','Học 70 từ academic Media (flashcard TR9): algorithm, broadcast, censorship, clickbait, convergence, crowdsourcing, cyberbullying, disinformation, editorial, framing, gatekeeping, hashtag, hyperlink, infographic, journalism, livestream, misinformation, monetisation, podcast, propaganda, sensationalism, social network, streaming, surveillance capitalism, viral...', CAMDICT),
        l('l','🎧 CamListen BL18 (511–540) + Chép CT 40p','[30p] Học 30 từ CamListen BL18 (#511–540). [40p] Nghe IELTS S1 (telephone conversation) → chép numbers, names, email addresses chính xác. S1 spelling errors = hay mất điểm.', IELTS),
        g('g','📝 Ngữ pháp: Discourse Markers','Adding: furthermore, moreover, in addition. Contrasting: however, nevertheless, on the other hand. Concluding: therefore, consequently, as a result. Exemplifying: for instance, to illustrate. Viết paragraph 150 từ dùng 6 discourse markers.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Housing & Urban Dev. (W2T18)','Học 100 colloc nhà ở (W2T18): address the housing shortage, build affordable housing, regulate property prices, tackle homelessness, improve urban infrastructure, develop smart cities, promote mixed-use development, reduce urban sprawl, revitalise city centres, increase housing density, implement planning regulations...'),
        w('w2','✍️ Task 2 Essay: Housing','Đề: "In many cities, the cost of housing is becoming unaffordable for ordinary people. What are the causes and what measures could be taken?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm essay Housing','Causes & Measures: kiểm tra link giữa cause và measure (cause: land shortage → measure: increase urban density). Có ít nhất 2 causes + 2 measures với examples không?'),
      ],
      [
        s('s1','🗣️ SP18: Festivals & Celebrations (50 từ)','Học 50 từ SP18 Festivals (flashcard SP18): tradition, ceremony, ritual, parade, fireworks, commemorate, cultural heritage, public holiday, religious festival, festive season, gathering, costumes, folklore, customary, ancestor worship, lunar calendar, national day, thanksgiving, carnival, decoration... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Festival or Celebration','Cue card: "Describe a festival or celebration that is important in your culture. Say: what it is, how it is celebrated, who participates, and explain why it is important." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: Cambridge IELTS T1 Practice','Làm 1 Task 1 từ Cambridge IELTS Books (tìm bài chưa làm). 20 phút tính giờ. Sau đó: so sánh với model answer — học 5 expressions bạn chưa dùng.', IELTS),
      ],
      [
        v('rev','🔄 Ôn Topic TR5+TR6 (140 từ)','Quiz TR5 Society + TR6 Science = 140 từ. Target ≥90%.'),
        v('rev2','🔄 Ôn CamListen BL11+BL12 (60 từ)','Quiz CamListen BL11 + BL12 = 60 từ. Target ≥54/60.'),
        v('pl','💡 Tổng kết tuần 9','TR8+TR9 done. CamListen: 540 từ (BL1-BL18 done — 90%!). Writing: T17+T18. Speaking: SP17+18. Tuần 10: 2 batch listening cuối cùng → XONG Cambridge 600!'),
      ],
    ],
  },

  // ── Week 10: Toàn cầu hóa + Milestone 2 ───────────────────
  {
    theme: 'Toàn cầu hoá & Milestone 2', themeEn: 'Globalisation & Milestone 2', phase: 2,
    milestone: '🏆 Mock Test Phase 2 — Đánh giá tiến bộ',
    days: [
      [
        r('r','📖 Topic TR10: Transport & Urban (70 từ)','Học 70 từ academic Transport (flashcard TR10): autonomous vehicle, carbon-neutral, congestion charge, decarbonisation, electrification, flyover, gentrification, high-speed rail, hyperloop, infrastructure, intermodal, light rail, logistics, mass transit, mobility-as-a-service, pedestrianisation, smart grid, sustainable mobility, traffic management, urban density, walkability, zero-emission...', CAMDICT),
        l('l','🎧 CamListen BL19 (541–570) + Chép CT 40p','[30p] Học 30 từ CamListen BL19 (#541–570). [40p] Nghe IELTS S4 về transport/urban planning → target ≥9/10. Gần xong 600 từ Listening rồi!', IELTS),
        g('g','📝 Ngữ pháp: Quantifiers học thuật','the vast majority of, a significant minority, relatively few, an increasing proportion of, a growing number of, hardly any. Viết 8 câu về globalisation dùng quantifiers. Khác nhau formal/informal.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Globalisation (W2T19)','Học 100 colloc toàn cầu hóa (W2T19): drive economic integration, promote free trade, reduce trade barriers, foster international cooperation, address global inequality, regulate multinational corporations, protect local industries, encourage cultural exchange, tackle climate change collectively, harmonise international standards...'),
        w('w2','✍️ Task 2 Essay: Globalisation','Đề: "Globalisation has more advantages than disadvantages. To what extent do you agree?" Outline 5p → Draft 40p. Dùng W2T19.'),
        v('ck','🔍 Tự chấm: "Outweigh" structure','Outweigh essay: nhất thiết phải have clear position. Nếu agree: body 1+2 = advantages (strong) + body 3 = acknowledge disadvantage nhưng refute. Kiểm tra position của mình có consistent không?'),
      ],
      [
        s('s1','🗣️ SP19: Shopping & Consumerism (50 từ)','Học 50 từ SP19 Shopping (flashcard SP19): consumer, retail, purchase, brand loyalty, impulse buying, online shopping, e-commerce, discount, bargain, second-hand, sustainable consumption, advertising, marketing, luxury goods, materialism, quality, refund, customer service... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Shopping Experience','Cue card: "Describe a shopping centre or market you enjoy visiting. Say: where it is, what it sells, how often you go, and why you enjoy going there." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP15+SP16 (100 từ)','Quiz SP15 Music + SP16 Art = 100 từ. Target ≥90%.'),
      ],
      [
        r('r','📖 Topic TR11: Food & Agriculture (70 từ)','Học 70 từ academic Food (flashcard TR11): agrochemicals, agroecology, aquaculture, biofortification, crop yield, deforestation-linked agriculture, food security, genetically modified organisms, hydroponics, intensive farming, irrigation, livestock, malnutrition, monoculture, organic farming, permaculture, pesticide, plant-based protein, precision agriculture, soil degradation, subsistence farming, supply chain...', CAMDICT),
        l('l','🎧 CamListen BL20 (571–600) + Chép CT 40p 🎉','[30p] Học 30 từ CamListen BL20 (#571–600). ĐÃ HOÀN THÀNH Cambridge Listening 600 từ! [40p] Final dictation: Nghe 1 IELTS S4 lecture → target ≥9/10. Từ tuần 11: KHÔNG học vocab mới cho Listening — chỉ luyện nghe thuần.', IELTS),
        g('g','📝 Ngữ pháp: Phase 2 Grammar Review','Ôn lại 5 grammar points Phase 2: (1) Advanced Passive, (2) Complex Noun Phrases, (3) Gerunds/Infinitives, (4) Cleft Sentences, (5) Mixed Conditionals. Viết 1 câu example cho mỗi type.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Immigration (W2T20)','Học 100 colloc di cư (W2T20): integrate immigrants, promote cultural diversity, address illegal immigration, grant asylum, process visa applications, reduce discrimination, facilitate language learning, recognise foreign qualifications, combat human trafficking, strengthen border control, support refugee resettlement...'),
        w('w2','✍️ Task 2 Essay: Immigration','Đề: "Some countries have large numbers of immigrants. Is this a positive or negative development?" Outline 5p → Draft 40p. Dùng W2T20.'),
        v('ck','🔍 Tự chấm essay Immigration','Balanced essay — kiểm tra: có represent BOTH sides fairly không? "Positive or negative" = usually both, then overall position. GRA: có subject-verb agreement errors không?'),
      ],
      [
        s('s1','🗣️ SP20: Accommodation & Living (50 từ)','Học 50 từ SP20 Accommodation (flashcard SP20): apartment, detached house, furnished, unfurnished, rent, lease, mortgage, landlord, tenant, utilities, neighbourhood, amenities, commute, urban area, suburb, shared house, dormitory, studio, compact living, high-rise... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Ideal Home','Cue card: "Describe the type of home you would like to live in. Say: where it would be, what it would look like, who you would live with, and explain why you would like to live there." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: Cambridge T1 (timed practice)','Làm 1 Task 1 từ Cambridge IELTS (chưa làm). 20 phút tính giờ nghiêm túc. Sau đó: so sánh với sample answer, ghi 5 expressions hay dùng.', IELTS),
      ],
      // Day 70 = MILESTONE
      [
        m('m1','🏆 Phase 2 Mock: Listening (Full)','Full IELTS Listening (40 câu, 40p). Điều kiện thi nghiêm túc. Chấm điểm → compare với Day 35 score. CamListen 600 hoàn thành — kết quả phải cải thiện!', IELTS),
        m('m2','🏆 Phase 2 Mock: Reading (Full)','Full IELTS Reading (60p, 3 passages). Điều kiện thi nghiêm túc. Chấm điểm → compare với Day 35. Topic vocab đã làm phong phú hơn nhiều.', IELTS),
        m('m3','🏆 Phase 2 Mock: Writing + Speaking','Writing: T1+T2 (60p). Speaking: ghi âm Part 1+2+3 (14p). So sánh với Phase 1. Ghi band score Phase 2. Xem xét: kỹ năng nào improve nhiều nhất?'),
      ],
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  PHASE 3 — ĐÀO SÂU (Days 71–105)
  // ════════════════════════════════════════════════════════════

  // ── Week 11: TR12-TR13 (Reading vocab DONE!) ───────────────
  {
    theme: 'Nghèo đói & Bình đẳng + Hoàn thành Topic Vocab', themeEn: 'Poverty, Equality & Topic Vocab Complete', phase: 3,
    days: [
      [
        r('r','📖 Topic TR12: Arts & Culture (70 từ)','Học 70 từ academic Arts (flashcard TR12): aesthetics, avant-garde, baroque, cinematic, contemporary, cultural imperialism, cultural patrimony, dramaturgy, ethnomusicology, heritage, iconography, impressionism, indigenous, intangible heritage, linguistics, modernism, musicology, narrative, neoclassicism, oral tradition, postmodernism, renaissance, semiotics, surrealism, symbolism...', CAMDICT),
        l('l','🎧 Dictation: IELTS S4 × 2 (không học vocab mới)','CamListen 600 hoàn thành! Từ hôm nay: KHÔNG học vocab mới cho Listening. Chỉ luyện nghe. [80p] Nghe 2 IELTS Section 4 liên tiếp → chép chính tả → check transcript. Target: ≥9/10 cho mỗi S4.', IELTS),
        g('g','📝 Ngữ pháp: Fronting & Inversion','Inversion after negative adverbials: "Never have I seen such...", "Not only did they...", "Rarely is it the case that..." Fronting: "Particularly concerning is the rise of..." Viết 6 câu về poverty/inequality.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Poverty & Inequality (W2T21)','Học 100 colloc nghèo đói (W2T21): reduce poverty rates, address income inequality, implement social safety nets, eradicate extreme poverty, promote economic empowerment, provide access to education, combat social exclusion, ensure food security, strengthen welfare systems, break the cycle of poverty...'),
        w('w2','✍️ Task 2 Essay: Poverty','Đề: "In many countries, there is a growing gap between the rich and the poor. What factors contribute to this, and what can be done to reduce the gap?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm: Phase 3 Writing Standard','Phase 3 target: Band 7.0 writing. Checklist: (1) Complex sentences (relative clauses, conditionals)? (2) Wide vocab range (no repetition)? (3) Clear progression (each paragraph builds on previous)? (4) Error-free grammar?'),
      ],
      [
        s('s1','🗣️ SP21: Weather & Climate (50 từ)','Học 50 từ SP21 Weather (flashcard SP21): temperature, humidity, precipitation, drought, flood, heatwave, blizzard, forecast, climate change, seasons, monsoon, tropical, temperate, arid, maritime, continental, meteorology, extreme weather, storm, natural disaster... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Favourite Season or Weather','Cue card: "Describe the type of weather you like best. Say: what weather it is, when it usually occurs, what you like to do in this weather, and why you prefer it." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP17+SP18 (100 từ)','Quiz SP17 Fashion + SP18 Festivals = 100 từ. Target ≥90%.'),
      ],
      [
        r('r','📖 Topic TR13: Global Issues (70 từ) — READING VOCAB DONE! ✅','Học 70 từ cuối: Global Issues (flashcard TR13): arms proliferation, climate refugee, cyber warfare, demographic dividend, disinformation, geopolitics, humanitarian crisis, inequality, international law, pandemics, peace negotiation, populism, protectionism, sanction, terrorism, transnational, UN, war crime, xenophobia... ĐÃ HOÀN THÀNH 1500 từ học thuật (600 CamCore + 900 Topic)! Từ tuần 12: Reading = Cambridge IELTS practice!', CAMDICT),
        l('l','🎧 Dictation: IELTS S3 × 2 intensive','[80p] Nghe 2 IELTS Section 3 (discussion between speakers) → chép chính tả → check → note: phân biệt opinions của từng speaker như thế nào? S3 thường có distractors.', IELTS),
        g('g','📝 Ngữ pháp: Hedging Language','may, might, could, tend to, appear to, seem to, it is possible that, evidence suggests, arguably. "This may indicate..." / "It could be argued that..." / "The data suggests...". Viết 8 hedging sentences về global issues.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Gender & Equality (W2T22)','Học 100 colloc bình đẳng (W2T22): promote gender equality, close the gender pay gap, empower women, challenge gender stereotypes, combat sexual harassment, increase female representation, support LGBTQ+ rights, address gender-based violence, implement equal opportunity policies, foster inclusive workplaces...'),
        w('w2','✍️ Task 2 Essay: Gender Equality','Đề: "In many societies, men are still given more opportunities than women in the workplace. What are the causes and what can be done to address this?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm: GRA tiêu chí Band 7','Band 7 Grammar: "uses a variety of complex structures with some flexibility and accuracy." Kiểm tra: (1) có ít nhất 3 loại complex structure không? (2) Lỗi ngữ pháp có ảnh hưởng đến meaning không?'),
      ],
      [
        s('s1','🗣️ SP22: Language Learning (50 từ)','Học 50 từ SP22 Language Learning (flashcard SP22): bilingual, multilingual, fluency, proficiency, vocabulary, grammar, syntax, pronunciation, accent, mother tongue, second language, immersion, language exchange, translation, interpretation, linguistic, dialect, idiomatic expression, language acquisition, polyglot... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Learning a Language','Cue card: "Describe your experience of learning a foreign language. Say: what language, how you learned it, what challenges you faced, and whether you think it has been worth the effort." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: All 4 chart types practice','Làm 4 mini-Task 1 (10p each) với 4 chart types khác nhau: bar, line, pie, table. Chỉ viết 2 đoạn cho mỗi bài (overview + 1 body). Luyện tốc độ và versatility.'),
      ],
      [
        v('rev','🔄 Ôn Topic TR7+TR8 (140 từ)','Quiz TR7 Business + TR8 Government = 140 từ. Spaced repetition Phase 3. Target ≥90%.'),
        v('rev2','🔄 Ôn CamListen BL13+BL14 (60 từ)','Quiz CamListen BL13 + BL14 = 60 từ (spelling). Target ≥54/60.'),
        v('pl','💡 Tổng kết tuần 11 — MILESTONE vocab!','ĐÃ HOÀN THÀNH: ✅ CamCore 600 (tuần 5) ✅ CamListen 600 (tuần 10) ✅ Topic Reading 900 (tuần 11). Tổng 1500 từ học thuật! Từ tuần 12: Reading = Cambridge IELTS practice thực chiến.'),
      ],
    ],
  },

  // ── Week 12: Cambridge IELTS Reading Practice ──────────────
  {
    theme: 'Youth & Energy + Cambridge Reading Practice', themeEn: 'Youth, Energy & Cambridge Reading', phase: 3,
    days: [
      [
        r('r','📖 Cambridge IELTS Reading Practice (90p) — Bắt đầu!','Làm 1 bộ Cambridge IELTS Academic Reading test (3 passages, 40 câu, 60p tính giờ). Sau khi làm: chấm điểm, phân tích từng câu sai, ghi error type (vocab/paraphrase/inference/time). Target Phase 3 cuối: ≥34/40.', IELTS),
        l('l','🎧 Dictation: IELTS S4 intensive (40p)','Nghe IELTS Section 4 → chép chính tả không nghe lại → check → phân loại lỗi: (a) không nghe kịp, (b) từ vựng không biết, (c) spelling sai. Lỗi nào nhiều nhất? Plan cải thiện.', IELTS),
        g('g','📝 Ngữ pháp: Advanced Comparison','significantly more/less, considerably higher, roughly twice, the highest proportion of, compared with/to, relative to, in contrast. Viết 6 câu so sánh dùng data về youth/energy.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Youth & Elderly (W2T23)','Học 100 colloc thanh niên (W2T23): empower young people, address youth unemployment, tackle ageing population, support elderly care, bridge the generation gap, promote intergenerational dialogue, reduce youth crime, provide mentorship programmes, address digital divide among elderly, create age-friendly communities...'),
        w('w2','✍️ Task 2 Essay: Youth','Đề: "Young people today are more concerned with their own careers and personal success than with contributing to society as a whole. To what extent do you agree?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm: Band 7 TA Checklist','TA Band 7: "addresses all parts of the task, presents a clear position throughout, presents, extends and supports main ideas." Mỗi body paragraph: có 1 clear claim + 2 supporting sentences + 1 example không?'),
      ],
      [
        s('s1','🗣️ SP23: Volunteering & Community (50 từ)','Học 50 từ SP23 Volunteering (flashcard SP23): volunteer, charity, community service, non-profit organisation, fundraising, donation, social responsibility, humanitarian aid, grassroots movement, civic engagement, altruism, philanthropy, social enterprise, mentoring, outreach programme, environmental cleanup... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Volunteering Experience','Cue card: "Describe a time when you volunteered or helped others without payment. Say: what you did, who you helped, how long for, and explain how you felt about it." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP19+SP20 (100 từ)','Quiz SP19 Shopping + SP20 Accommodation = 100 từ. Target ≥90%.'),
      ],
      [
        r('r','📖 Cambridge IELTS Reading Practice (90p)','Làm Cambridge IELTS Reading test mới (3 passages, 40 câu, 60p). Focus tuần này: Matching Headings — đọc only first + last sentence của mỗi paragraph để identify umbrella concept. Check score + analyse.', IELTS),
        l('l','🎧 Dictation: IELTS S3 × 2 (80p)','Nghe 2 IELTS S3 liên tiếp → chép → check. S3 key skill: identify "distractor" — speaker mentions A but then changes mind to B. Phân tích: câu nào bị distractor lừa?', IELTS),
        g('g','📝 Ngữ pháp: Parallel Structures','Both X and Y, either X or Y, not only X but also Y, neither X nor Y. "Both renewable energy AND energy efficiency are essential." Viết 8 sentences với parallel structures về youth/energy.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Energy & Sustainability (W2T24)','Học 100 colloc năng lượng (W2T24): harness renewable energy, transition to clean energy, achieve net-zero emissions, decarbonise industry, invest in solar infrastructure, phase out coal, develop green hydrogen, improve energy efficiency, promote energy storage, combat energy poverty, implement carbon pricing...'),
        w('w2','✍️ Task 2 Essay: Energy','Đề: "Nuclear power is the most practical solution to the world\'s energy needs. To what extent do you agree?" Outline 5p → Draft 40p. Dùng W2T24.'),
        v('ck','🔍 Tự chấm: LR Band 7 standard','LR Band 7: "uses a sufficient range of vocabulary to allow flexibility and precision." Kiểm tra: có ít nhất 8 collocations từ W2T24? Có dùng nominalisation (use→utilisation, grow→growth)?'),
      ],
      [
        s('s1','🗣️ SP24: Future Plans & Ambitions (50 từ)','Học 50 từ SP24 Future (flashcard SP24): ambition, aspiration, career goal, personal development, long-term plan, short-term goal, milestone, achievement, opportunity, challenge, determination, perseverance, optimistic, realistic, pursue, accomplish, prioritise, sacrifice, compromise, envision... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Future Plan or Dream','Cue card: "Describe something you hope to do in the future. Say: what it is, when you plan to do it, what steps you are taking, and why this is important to you." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: Cambridge IELTS T1 timed','Làm Cambridge IELTS Task 1 thật (20p tính giờ). Sau khi làm: so sánh với model answer, ghi 3 structures bạn không dùng nhưng model answer dùng. Học và apply lần sau.', IELTS),
      ],
      [
        v('rev','🔄 Ôn Topic TR9+TR10 (140 từ)','Quiz TR9 Media + TR10 Transport = 140 từ. Target ≥90%.'),
        v('rev2','🔄 Ôn CamListen BL15+BL16 (60 từ)','Quiz CamListen BL15 + BL16 = 60 từ. Target ≥54/60.'),
        v('pl','💡 Tổng kết tuần 12','Cambridge Reading practice started! Writing: T23+T24. Speaking: SP23+24. Đang Phase 3 — cần tăng tốc để đạt Band 7 writing.'),
      ],
    ],
  },

  // ── Week 13: Animal Rights & Freedom ──────────────────────
  {
    theme: 'Động vật & Tự do', themeEn: 'Animal Rights & Freedom', phase: 3,
    days: [
      [
        r('r','📖 Cambridge IELTS Reading (90p) — Matching Headings focus','Làm Cambridge Reading test (60p). Focus: T/F/NG — "NOT GIVEN" có nghĩa là KHÔNG được confirm NOR deny bởi passage (không phải "text doesn\'t mention it"). Chấm + analyse câu T/F/NG sai.', IELTS),
        l('l','🎧 Dictation: S4 × 2 — Band 8 Target (≥9/10)','Nghe 2 IELTS S4 liên tiếp → chép → target: ≥9/10 cho MỖI section. Nếu không đạt: nghe lại đoạn sai và phân tích tại sao miss.', IELTS),
        g('g','📝 Ngữ pháp: Grammar for Speaking Fluency','Connected speech: "used to" /juːstə/, "going to" /ɡənə/, "want to" /wɒnə/. Linking words in speaking: "As I was saying...", "Building on that...", "What I mean is...". Luyện nói 5 câu dùng natural connected speech.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Animal Rights (W2T25)','Học 100 colloc động vật (W2T25): protect animal rights, ban animal testing, combat illegal wildlife trade, preserve biodiversity, prevent species extinction, regulate factory farming, promote veganism, raise awareness of animal cruelty, enforce wildlife protection laws, support conservation programmes...'),
        w('w2','✍️ Task 2 Essay: Animal Rights','Đề: "Some people argue that it is acceptable to use animals in medical research. Others strongly disagree. Discuss both views and give your own opinion." Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm: "Discuss Both Views + Opinion" format','Cấu trúc: intro (both views + your position) + body 1 (view A) + body 2 (view B) + body 3 (own opinion/evaluation) + conclusion. Kiểm tra: opinion ở body 3 có trùng với intro không (phải nhất quán!)?'),
      ],
      [
        s('s1','🗣️ SP25: Memories & Past Events (50 từ)','Học 50 từ SP25 Memories (flashcard SP25): childhood, nostalgia, recollection, memorable, unforgettable, significant, turning point, milestone, anniversary, reminisce, flashback, souvenir, keepsake, photograph, diary, reunion, tradition, legacy, generation, bittersweet... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Memorable Childhood Memory','Cue card: "Describe a happy memory from your childhood. Say: what happened, where you were, who was with you, and explain why this memory is important to you." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP21+SP22 (100 từ)','Quiz SP21 Weather + SP22 Language Learning = 100 từ. Target ≥90%.'),
      ],
      [
        r('r','📖 Cambridge IELTS Reading (90p) — MCQ focus','Làm Cambridge Reading test (60p). Focus: Multiple Choice — eliminate wrong options one by one before selecting. "Option A is wrong because..." technique. Chấm + analyse.', IELTS),
        l('l','🎧 Dictation: S1+S2+S3+S4 full (80p)','Full IELTS Listening dictation (tất cả 4 sections). Target: S1=10/10, S2=9/10, S3=8/10, S4=8/10. Phân tích section nào yếu nhất sau đó.', IELTS),
        g('g','📝 Ngữ pháp: Grammar for Writing Precision','Zero-error rule: viết 150 từ về animal rights. Sau đó: kiểm tra (1) subject-verb agreement, (2) article errors, (3) preposition errors, (4) word form errors. Sửa từng lỗi. Target: ≤2 errors.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Freedom & Human Rights (W2T26)','Học 100 colloc tự do (W2T26): protect civil liberties, uphold human rights, combat censorship, promote freedom of expression, ensure due process, fight discrimination, safeguard privacy, challenge authoritarian regimes, support democracy, strengthen rule of law, protect whistleblowers...'),
        w('w2','✍️ Task 2 Essay: Freedom','Đề: "In some countries, governments are increasingly monitoring their citizens\' activities. Is this a positive or negative development?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm: Band 7+ checklist tổng hợp','Band 7 Writing: (1) TA: fully addressed; (2) CC: clear progression; (3) LR: wide range, few errors; (4) GRA: variety of complex structures, few errors. Tự rate mỗi tiêu chí 1-9 và ghi.'),
      ],
      [
        s('s1','🗣️ SP26: Animals & Pets (50 từ)','Học 50 từ SP26 Animals (flashcard SP26): domestic animal, wild animal, endangered species, habitat, instinct, prey, predator, breeding, veterinarian, pet ownership, companion animal, wildlife conservation, zoo, aquarium, migration, nocturnal, hibernation, biodiversity, ecosystem... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Pet or Animal You Like','Cue card: "Describe an animal you find interesting. Say: what it is, where you saw it or learned about it, what is special about it, and why you find it interesting." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: Full IELTS T1 mock + review','Làm 1 Task 1 Cambridge IELTS (20p nghiêm túc). Sau đó: viết lại bài hoặc edit dựa trên model answer. "Re-write" strategy: học expressions từ model answer, integrate vào bài của mình.', IELTS),
      ],
      [
        v('rev','🔄 Ôn Topic TR11+TR12 (140 từ)','Quiz TR11 Food + TR12 Arts = 140 từ. Target ≥90%.'),
        v('rev2','🔄 Ôn CamListen BL17+BL18 (60 từ)','Quiz CamListen BL17 + BL18 = 60 từ. Target ≥54/60.'),
        v('pl','💡 Tổng kết tuần 13','Writing: T25+T26 done. Speaking: SP25+26 done. Cambridge Reading tiến triển tốt. Listening dictation: check band estimate (số câu đúng TB / 40 × 9 ≈ band score).'),
      ],
    ],
  },

  // ── Week 14: Space & Climate ───────────────────────────────
  {
    theme: 'Không gian & Chính sách khí hậu', themeEn: 'Space, Climate Policy', phase: 3,
    days: [
      [
        r('r','📖 Cambridge IELTS Reading (Band 7.5 target: ≥32/40)','Làm Cambridge IELTS Reading (60p). Target hôm nay: ≥32/40. Nếu không đạt: dành 30p phân tích tất cả câu sai — paraphrase technique hoặc vocabulary vấn đề?', IELTS),
        l('l','🎧 Dictation: S4 × 2 (Band 8: ≥9/10 mỗi section)','Nghe 2 IELTS S4 → chép → target: ≥9/10 mỗi. S4 Band 8 yêu cầu nghe đúng cả những chi tiết nhỏ (dates, percentages, technical terms). Ghi error log chi tiết.', IELTS),
        g('g','📝 Ngữ pháp: Error Analysis — Top 5 lỗi của bạn','Mở error log từ tuần 1-13. Xác định 5 lỗi ngữ pháp hay mắc nhất. Viết 5 câu đúng cho từng loại lỗi. Đây là "personal grammar checklist" để đọc trước ngày thi.'),
      ],
      [
        w('w1','✍️ 100 Collocations: Space & Technology (W2T27)','Học 100 colloc không gian (W2T27): explore outer space, launch a satellite, conduct space research, develop space technology, colonise Mars, address space debris, privatise space exploration, fund astronomical research, achieve a Moon landing, advance scientific understanding of the universe...'),
        w('w2','✍️ Task 2 Essay: Space','Đề: "Space exploration is a waste of money. The vast amounts of funding should be spent on tackling problems on Earth. To what extent do you agree?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm: Prioritisation argument structure','"Waste of money" argument: cần (1) acknowledge benefits of space, (2) BUT argue prioritising earth problems is MORE important, (3) counter-argue: space research HAS earth benefits. Kiểm tra structure phức tạp này.'),
      ],
      [
        s('s1','🗣️ SP27: News & Current Affairs (50 từ)','Học 50 từ SP27 News (flashcard SP27): headline, breaking news, journalist, reporter, correspondent, editorial, opinion piece, feature, investigative journalism, press release, media bias, censorship, freedom of press, social media, viral news, fake news, source, credibility, broadcast... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: News Story','Cue card: "Describe a news story that interested you recently. Say: what the story was about, how you found out about it, why it interested you, and what you think about it." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP23+SP24 (100 từ)','Quiz SP23 Volunteering + SP24 Future Plans = 100 từ. Target ≥90%.'),
      ],
      [
        r('r','📖 Cambridge IELTS Reading — Matching Headings Mastery','Làm Cambridge Reading test (60p). Focus: Matching Headings — heading phải cover ALL content of paragraph (umbrella concept), không chỉ một điểm. Làm xong: viết note về technique cho loại câu này.', IELTS),
        l('l','🎧 Full IELTS Listening dictation (80p)','Full 4 sections IELTS Listening → chép → check. Ghi điểm từng section. So sánh với tuần 13: có improve không? S4 target: ≥8/10.', IELTS),
        g('g','📝 Ngữ pháp: Band 7 Grammar Checklist','Tự tạo checklist ngữ pháp cá nhân: (1) tenses tôi hay sai, (2) articles tôi hay quên, (3) prepositions tôi hay nhầm. Viết checklist lên giấy và đặt cạnh bàn viết essay.'),
      ],
      [
        w('w1','✍️ 100 Collocations: Climate Action (W2T28)','Học 100 colloc khí hậu (W2T28): implement the Paris Agreement, achieve net-zero targets, transition to renewable energy, adopt carbon pricing, increase climate finance, adapt to climate change impacts, strengthen international cooperation, hold polluters accountable, protect vulnerable communities, phase out fossil fuel subsidies...'),
        w('w2','✍️ Task 2 Essay: Climate Policy','Đề: "International cooperation is the only effective way to tackle climate change. To what extent do you agree?" Outline 5p → Draft 40p. Dùng W2T28.'),
        v('ck','🔍 Tự chấm: Cohesion & Coherence Band 7','CC Band 7: "uses cohesive devices effectively, but there may be some inconsistency." Kiểm tra: có overused "however" và "furthermore" không? Vary connectors (nevertheless, that said, by contrast, not only...but also).'),
      ],
      [
        s('s1','🗣️ SP28: Happiness & Success (50 từ)','Học 50 từ SP28 Happiness (flashcard SP28): well-being, contentment, fulfillment, satisfaction, joy, positivity, optimism, resilience, gratitude, mindfulness, work-life balance, achievement, purpose, meaningful, prosperity, flourish, thrive, mental health, inner peace, social connection... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Happy Memory or Event','Cue card: "Describe something that has made you particularly happy recently. Say: what it was, when it happened, who was involved, and explain why it made you happy." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: Band 7 target practice','Làm Cambridge IELTS Task 1 (20p). Target: tự chấm ≥7 cho mỗi tiêu chí. Focus đặc biệt: LR — có dùng at least 4 different ways để describe trends (rose sharply, surged, grew significantly, increased dramatically)?', IELTS),
      ],
      [
        v('rev','🔄 Ôn CamListen BL19+BL20 (60 từ)','Quiz CamListen BL19 + BL20 = 60 từ. Final Cambridge Listening vocab review! Target ≥54/60.'),
        v('rev2','🔄 Ôn Topic TR13 + CamCore B9 (110 từ)','Quiz TR13 Global Issues (70 từ) + CamCore B9 (40 từ) = 110 từ. Target ≥99/110 (90%).'),
        v('pl','💡 Tổng kết tuần 14','Writing: T27+T28 done. Speaking: SP27+28 done. 28/30 speaking topics hoàn thành! Tuần tới: SP29+SP30 = SPEAKING VOCAB DONE! Chỉ còn 1 tuần Phase 3 nữa.'),
      ],
    ],
  },

  // ── Week 15: Digital & Milestone 3 ─────────────────────────
  {
    theme: 'Digital & Tiêu dùng + Milestone 3', themeEn: 'Digital World & Milestone 3', phase: 3,
    milestone: '🏆 Mock Test Phase 3 — Đánh giá Band 7 target',
    days: [
      [
        r('r','📖 Cambridge IELTS Reading — 3 passages timed (60p strict)','Làm full Cambridge Reading test, điều kiện thi thật. Target Phase 3: ≥34/40. Sau khi làm: phân tích kỹ mỗi câu sai. Ghi: câu sai vì (a) vocab, (b) paraphrase, (c) inference, (d) time. Đây là benchmark Phase 3.', IELTS),
        l('l','🎧 Dictation: 2×S4 (Band 8 benchmark)','Nghe 2 IELTS S4 → chép → target: ≥9/10 cho cả 2. Đây là Phase 3 benchmark cho Listening. Ghi band estimate.', IELTS),
        g('g','📝 Ngữ pháp: Phase 3 Review','Ôn tất cả grammar points Phase 3: Fronting/Inversion, Hedging, Comparison, Parallel Structures. Viết 1 paragraph 150 từ dùng ít nhất 1 example của mỗi type. Kiểm tra zero errors.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Digital World & Privacy (W2T29)','Học 100 colloc thế giới số (W2T29): protect personal data, regulate digital platforms, combat cybercrime, ensure digital privacy, address the digital divide, promote digital inclusion, tackle online misinformation, develop digital literacy, implement data protection laws, monetise user data, enable contactless payment...'),
        w('w2','✍️ Task 2 Essay: Digital World','Đề: "Governments should collect data on their citizens to protect them from crime and terrorism. To what extent do you agree?" Outline 5p → Draft 40p. Dùng W2T29.'),
        v('ck','🔍 Tự chấm: Phase 3 Writing standard','Phase 3 target: Band 7.0 writing. Checklist cuối Phase 3: (1) TA ≥7, (2) CC ≥7, (3) LR ≥7, (4) GRA ≥7. Ghi band tự chấm. Nếu bất kỳ tiêu chí nào <7: Phase 4 phải tập trung vào tiêu chí đó.'),
      ],
      [
        s('s1','🗣️ SP29: Culture & Traditions (50 từ)','Học 50 từ SP29 Culture (flashcard SP29): cultural heritage, tradition, custom, ritual, folklore, indigenous culture, cultural identity, multiculturalism, globalisation, modernisation, preservation, generation, ceremony, artifact, costume, cuisine, language, belief, values, social norms... Phát âm.', CAMDICT),
        s('s2','🗣️ Part 2: Cultural Tradition','Cue card: "Describe a tradition or custom from your country that you think is interesting. Say: what it is, how it is practised, who participates, and explain why you think it is important to preserve." 1p prep → 2p nói.'),
        v('rv','🔄 Ôn SP25+SP26 (100 từ)','Quiz SP25 Memories + SP26 Animals = 100 từ. Target ≥90%.'),
      ],
      [
        r('r','📖 Cambridge IELTS Reading — MCQ intensive (Band 8 prep)','Làm Cambridge Reading test (60p). Focus: MCQ — eliminate wrong options với reason: "Option A incorrect because text says X, not Y." Technique này tăng accuracy từ 70% lên 90%+.', IELTS),
        l('l','🎧 Dictation: S3 × 2 intensive','Nghe 2 IELTS S3 (multi-speaker discussions) → chép → check. S3 key: phân biệt giọng speakers + note khi speaker CHANGES opinion. Band 8 Listening = ≥35/40 tổng.', IELTS),
        g('g','📝 Ngữ pháp: Grammar Exam Practice','Làm 20 grammar multiple choice questions (British Council Grammar / IELTS Grammar Practice). Sau đó: xem lại tất cả câu sai. Những loại câu sai nhiều nhất = weakest grammar area cần tập trung Phase 4.', BCG),
      ],
      [
        w('w1','✍️ 100 Collocations: Consumerism (W2T30)','Học 100 colloc tiêu dùng (W2T30): promote sustainable consumption, combat overconsumption, reduce planned obsolescence, encourage ethical purchasing, support fair trade, address advertising manipulation, limit single-use plastics, develop a circular economy, shift towards minimalism, counter materialism...'),
        w('w2','✍️ Task 2 Essay: Consumerism','Đề: "Advertising encourages people to buy things they do not need and has a negative impact on society. To what extent do you agree?" Outline 5p → Draft 40p.'),
        v('ck','🔍 Tự chấm: Phase 3 final essay assessment','Đây là essay cuối Phase 3. Chấm nghiêm túc theo Band Descriptors. Ghi band tự đánh giá. So sánh với essay đầu tiên (Tuần 1 W2T01). Đã cải thiện bao nhiêu?'),
      ],
      [
        s('s1','🗣️ SP30: Urban & Rural Life (50 từ) — SP DONE! ✅','Học 50 từ SP30 Urban/Rural (flashcard SP30): urban sprawl, gentrification, commute, infrastructure, amenities, rural community, agricultural, isolated, migration, urbanisation, density, neighbourhood, metropolitan, suburb, village, countryside, green space, public transport, housing shortage, community spirit... ĐÃ HOÀN THÀNH 30 Speaking Topics!', CAMDICT),
        s('s2','🗣️ Part 2: City vs Countryside','Cue card: "Describe a place in the countryside you have visited. Say: where it is, how you got there, what you did, and explain why you enjoyed it or not." 1p prep → 2p nói.'),
        w('t1','📊 Task 1: Phase 3 Mock T1 + review','Làm Cambridge Task 1 (20p). Sau đó: viết detailed self-assessment: TA, CC, LR, GRA — mỗi tiêu chí ghi band tự đánh giá VÀ 1 điều cần cải thiện. Đây là baseline cho Phase 4.', IELTS),
      ],
      // Day 105 = MILESTONE
      [
        m('m1','🏆 Phase 3 Mock: Listening (Full Band 8 target)','Full IELTS Listening (40 câu, 40p). Target: ≥35/40. Nếu đạt: đang đúng hướng Band 8! Nếu chưa: note specific sections cần tập trung Phase 4.', IELTS),
        m('m2','🏆 Phase 3 Mock: Reading (Band 8 target: ≥34/40)','Full IELTS Reading (60p). Target: ≥34/40. Chấm điểm + compare với Day 35 và Day 70. Visualise: R6→R8 progression.', IELTS),
        m('m3','🏆 Phase 3 Mock: Writing + Speaking','Writing T1+T2 (60p). Speaking Part 1+2+3 (14p ghi âm). Tự chấm. Ghi band Phase 3. ĐÃ HOÀN THÀNH: ✅ Reading vocab 1500 từ ✅ Listening vocab 600 từ ✅ Writing 30 topics ✅ Speaking 30 topics. Phase 4: THỰC CHIẾN!'),
      ],
    ],
  },

  // ════════════════════════════════════════════════════════════
  //  PHASE 4 — THỰC CHIẾN (Days 106–140)
  // ════════════════════════════════════════════════════════════

  // ── Week 16: Hạnh phúc & Đạo đức ──────────────────────────
  {
    theme: 'Hạnh phúc & Đạo đức', themeEn: 'Happiness, Ethics & Phase 4 Start', phase: 4,
    days: [
      [
        r('r','📖 Cambridge IELTS Reading (Band 8: ≥34/40)','Làm Cambridge Reading test (60p). Phase 4 target: ≥34/40. Sau khi làm: 20p phân tích TỪNG câu sai chi tiết. Key question: "What paraphrase did I miss?"', IELTS),
        l('l','🎧 Full IELTS Listening (Band 8: ≥35/40)','Full 40-câu IELTS Listening (40p). Target: ≥35/40. Sau khi làm: nghe lại với transcript, highlight từng chỗ nghe sai. Phân loại lỗi.', IELTS),
        v('rev','🔄 Ôn Writing T01-T05 key colloc (100 from)','Ôn 100 colloc quan trọng nhất từ W2T01-T05 (Env, Tech, Edu, Health, Society). Rapid-fire: nói colloc không nhìn sách. Target: ≥90/100 nhớ được.'),
      ],
      [
        w('w1','✍️ 100 Collocations: Happiness & Well-being (W2T31)','Học 100 colloc hạnh phúc (W2T31): promote mental well-being, achieve work-life balance, foster personal growth, cultivate meaningful relationships, address mental health stigma, encourage mindfulness, reduce stress, improve quality of life, pursue passions, develop emotional resilience, prioritise self-care...'),
        w('w2','✍️ Task 2 Essay: Happiness','Đề: "Many people believe that happiness is the most important thing in life. However, others think that duty and obligation are more important. Discuss both views and give your own opinion." Outline 5p → Draft 40p. Phase 4 target: Band 7.5.'),
        v('ea','🔍 Error Analysis: Writing log review','Mở error log từ Phase 1-3. Xác định TOP 3 recurring Writing errors. Viết 3 "anti-patterns": "Instead of [wrong] → Write [correct]." Đọc lại trước mỗi essay Phase 4.'),
      ],
      [
        s('s1','🗣️ Speaking Mock: Full Part 1+2+3 (14p ghi âm)','SP vocab đã hoàn thành! Từ nay Speaking = Mock practice. Full mock: Part 1 (4p: personal questions), Part 2 (3p: cue card về urban/rural hoặc happiness), Part 3 (4p: societal questions). Ghi âm → nghe lại → tự chấm 4 tiêu chí.'),
        s('s2','🗣️ Pronunciation intensive: Band 7 target','Nghe lại recording vừa xong. Identify 5 từ phát âm chưa đúng → tra Cambridge Dictionary → luyện lại. Kiểm tra: (1) word stress, (2) weak forms (/ə/ sound), (3) connected speech. Band 7 Pronunciation = "uses a range of pronunciation features with some lapses."', CAMDICT),
        v('rv','🔄 Ôn Speaking SP01-SP10 rapid-fire (50 từ key)','Quiz nhanh: 5 từ key nhất của mỗi SP01-SP10. Chỉ cần nói từ và 1 collocation trong 5 giây. Mục đích: đảm bảo vocab accessible khi speaking.'),
      ],
      [
        r('r','📖 Cambridge IELTS Reading — S.Reading Inference drill','Làm Cambridge Reading (60p). Focus: inference questions — answer không stated directly trong text, phải infer từ context. Đây là dạng câu phân biệt Band 7 và Band 8.', IELTS),
        l('l','🎧 IELTS S4 × 2 intensive (Band 8 drill)','Nghe 2 IELTS S4 → chép → target ≥9/10. S4 là key section cho L Band 8. Nếu chưa đạt: nghe lại đoạn sai, phân tích exactly tại sao miss.', IELTS),
        v('rev2','🔄 Ôn Topic TR1-TR3 (150 từ — max)','Quiz TR1 Environment + TR2 Technology + TR3 Education = 210 từ... quá 150. Chỉ ôn TR1+TR2 = 140 từ hôm nay. TR3 ôn ngày khác. Target ≥90%.'),
      ],
      [
        w('w1','✍️ 100 Collocations: Ethics & Philosophy (W2T32)','Học 100 colloc đạo đức (W2T32): address ethical dilemmas, uphold moral principles, debate philosophical questions, challenge moral relativism, promote social justice, ensure accountability, combat corruption, protect individual rights, balance competing interests, foster ethical decision-making...'),
        w('w2','✍️ Task 2 Essay: Ethics','Đề: "Technology is making ethical decisions easier because it removes human bias. To what extent do you agree?" Outline 5p → Draft 40p. Target: Band 7.5 self-assessment.'),
        v('ck','🔍 Tự chấm Band 7.5 target','Band 7.5 = mid-point Band 7 và 8. LR 7.5: không repetition, collocations natural and appropriate. GRA 7.5: <2 grammar errors per 250 words. TA 7.5: fully addressed với clear position. CC 7.5: seamless cohesion.'),
      ],
      [
        s('s3','🗣️ Speaking: Part 3 intensive drill (10 questions)','Do 10 Part 3 questions (2 per topic: happiness, ethics, technology, society, environment). Each answer ≥60 seconds. Record. Listen back: developing ideas fully? Using collocations? Varying openers ("That\'s an interesting point...", "I would argue that...", "In my experience...").'),
        w('t1','📊 Task 1: Cambridge T1 (Band 7 target — tự chấm ≥7)','Làm Cambridge Task 1 (20p tính giờ). Tự chấm ≥7 cho mỗi tiêu chí. Nếu LR chưa ≥7: viết thêm 5 synonyms cho "increase/decrease". Nếu GRA chưa ≥7: check article/preposition errors cụ thể.', IELTS),
        v('rev3','🔄 Ôn TR4+TR5 (140 từ)','Quiz TR4 Health + TR5 Society = 140 từ. Target ≥90%.'),
      ],
      [
        v('rev','🔄 Ôn CamListen BL1-BL4 (120 từ)','Quiz CamListen BL1 (001-030) + BL2 (031-060) + BL3 (061-090) + BL4 (091-120) = 120 từ. Phần này có nhớ không sau nhiều tuần? Spelling check.'),
        r('rd','📖 Reading: Tự phân tích điểm yếu','Review tất cả Cambridge Reading tests đã làm Phase 4. Categorise câu sai: (1) vocab/paraphrase, (2) inference, (3) Matching Headings error, (4) T/F/NG confusion. Loại nào nhiều nhất → chiến lược specific.', IELTS),
        v('pl','💡 Tổng kết tuần 16','Phase 4 Week 1 done. Writing: T31+T32 (38/40 topics done!). Speaking: Full mock mode. Chỉ còn 2 tuần nữa là T33-T40. Tập trung Band 8 Listening + Band 7.5 Writing.'),
      ],
    ],
  },

  // ── Week 17: Thể thao & Sức khỏe tâm thần ─────────────────
  {
    theme: 'Thể thao & Sức khoẻ tâm thần', themeEn: 'Sport, Mental Health & Mock Drill', phase: 4,
    days: [
      [
        r('r','📖 Full IELTS Reading (60p) — ≥35/40 target','Làm Full Cambridge Reading. Target: ≥35/40 (Band 8). Sau khi làm: 20p analyse câu sai. Ghi cumulative error log: so sánh với tuần 16 — có giảm số lỗi không?', IELTS),
        l('l','🎧 Full IELTS Listening (40p) — ≥36/40 target','Full IELTS Listening. Target: ≥36/40. Sau khi làm: nghe lại với transcript. Note specific moments where you missed. Pattern analysis.', IELTS),
        v('rev','🔄 Ôn Writing T06-T10 key colloc (100)','Ôn 100 colloc quan trọng nhất từ W2T06-T10 (Science, Business, Govt, Media, Transport). Rapid-fire không nhìn sách. Target ≥90/100.'),
      ],
      [
        w('w1','✍️ 100 Collocations: Sport & Health (W2T33)','Học 100 colloc thể thao (W2T33): promote physical activity, combat sedentary lifestyle, improve athletic performance, develop team spirit, host international competitions, address doping in sport, encourage grassroots sports, invest in sports infrastructure, foster healthy competition, prevent sports injuries...'),
        w('w2','✍️ Task 2 Essay: Sport','Đề: "Competitive sport teaches people valuable lessons and should be compulsory in schools. To what extent do you agree?" Outline 5p → Draft 40p. Phase 4 target: zero grammar errors.'),
        v('ea2','🔍 Writing error log Phase 4','Sau khi viết: check 5 personal grammar errors từ error log. Có mắc phải không? Ghi progress: tuần này đã reduce errors từ N xuống M.'),
      ],
      [
        s('s1','🗣️ Speaking Full Mock + Video Analysis','Full Speaking mock 15 phút (ghi video nếu có thể). Xem lại: (1) Eye contact/posture ảnh hưởng confidence, (2) Filler words ("um", "like", "you know") — replace với "Well...", "Let me think...", "That\'s an interesting question...", (3) Vocabulary upgrade: any "basic" words to replace?'),
        s('s2','🗣️ Speaking: Vocabulary Upgrade Drill','20 "basic" words bạn still dùng trong speaking. For each: tìm 2-3 sophisticated replacements. (important→crucial/pivotal/fundamental, good→beneficial/advantageous, people→individuals/the public/society). Practice: nói 5 phút chỉ dùng upgraded vocab.'),
        v('rev','🔄 Ôn TR6+TR7 (140 từ)','Quiz TR6 Science + TR7 Business = 140 từ. Target ≥90%.'),
      ],
      [
        r('r','📖 Cambridge Reading — Band 8 MCQ Elimination','Làm Cambridge Reading (60p). Focus: MCQ elimination technique — before selecting, ELIMINATE all wrong options with written reasons. "A is wrong because...", "B is wrong because...". Target: ≥35/40.', IELTS),
        l('l','🎧 IELTS S4 × 2 — Band 8 streak (≥9/10 both)','Nghe 2 IELTS S4 → target: ≥9/10 CẢ HAI. S4 ≥9/10 consistently = L Band 8 territory. Ghi error log: sau 2+ tuần Phase 4, pattern câu sai đã thay đổi chưa?', IELTS),
        v('rev2','🔄 Ôn TR8+TR9 (140 từ)','Quiz TR8 Government + TR9 Media = 140 từ. Target ≥90%.'),
      ],
      [
        w('w1','✍️ 100 Collocations: Mental Health (W2T34)','Học 100 colloc sức khỏe tâm thần (W2T34): address mental health stigma, promote psychological well-being, provide counselling services, tackle depression and anxiety, improve mental health literacy, ensure access to therapy, support trauma survivors, implement workplace mental health policies, reduce burnout, foster emotional resilience...'),
        w('w2','✍️ Task 2 Essay: Mental Health','Đề: "Mental health problems are increasing in modern society. What are the main causes and what can be done to address them?" Outline 5p → Draft 40p. Self-mark: aim TA≥7, CC≥7, LR≥7, GRA≥7.'),
        v('ck','🔍 Band 7+ checklist final review','Band 7+ requires: (1) No basic errors, (2) Academic collocations natural, (3) Clear position maintained throughout, (4) Seamless paragraph transitions. Score yourself 0/1 for each. 4/4 = Band 7+.'),
      ],
      [
        s('s3','🗣️ Speaking Part 3: 5 topic deep-dive','Chọn 5 topics yêu thích (từ SP01-SP30). Mỗi topic: trả lời 2 Part 3 questions (min 60 seconds each). Record. Review: (1) Developing ideas — có give concrete example không? (2) Cohesion — có linking words không? (3) Sophisticated vocab?'),
        w('t1','📊 Task 1: Full mock all chart types review','Làm 4 mini-Task 1 (10p each): bar, line, pie, process. Sau đó: review lần lượt, cho mỗi bài ghi 1 điểm cần improve. Đây là "Task 1 audit" trước ngày thi.'),
        v('rev3','🔄 Ôn CamListen BL5-BL8 (120 từ)','Quiz CamListen BL5+BL6+BL7+BL8 = 120 từ. Spelling check. Target ≥108/120.'),
      ],
      [
        v('rev','🔄 Ôn TR10+TR11 (140 từ)','Quiz TR10 Transport + TR11 Food = 140 từ. Target ≥90%.'),
        r('rd','📖 Reading: paraphrase practice','Lấy 1 IELTS Reading passage đã làm. Đọc lại và tìm TẤT CẢ paraphrase pairs (câu hỏi nói khác thế nào so với passage). Viết 10 cặp paraphrase. Đây là kỹ năng chốt cho Reading Band 8.', IELTS),
        v('pl','💡 Tổng kết tuần 17','Writing: T33+T34 (40 topics — DONE sau tuần 20!). Listening: tracking Band 8 progress. Reading: targeting ≥35/40. 3 tuần cuối: full mock mode.'),
      ],
    ],
  },

  // ── Week 18: Nước & Đa dạng sinh học ──────────────────────
  {
    theme: 'Nước & Đa dạng sinh học', themeEn: 'Water, Biodiversity & Intensive Mock', phase: 4,
    days: [
      [
        r('r','📖 Full Cambridge IELTS Reading (≥35/40)','Full Reading test (60p strict). Target: ≥35/40. Sau đó: compare với tuần 16 và 17. Tracking progress. Nếu score plateau: xác định specific question type còn yếu.', IELTS),
        l('l','🎧 Full IELTS Listening (≥36/40)','Full Listening (40p). Target: ≥36/40. Ghi score. So sánh với tuần 16,17. Consistent improvement?', IELTS),
        v('rev','🔄 Ôn Writing T11-T15 key colloc (100)','Ôn 100 colloc từ W2T11-T15 (Food, Arts, Crime, Family, Work). Rapid-fire. Target ≥90/100.'),
      ],
      [
        w('w1','✍️ 100 Collocations: Water & Resources (W2T35)','Học 100 colloc nước (W2T35): address water scarcity, ensure access to clean water, combat water pollution, implement water management strategies, promote water conservation, desalinate seawater, recycle wastewater, reduce water consumption, protect aquifers, develop sustainable irrigation...'),
        w('w2','✍️ Task 2 Essay: Water Resources','Đề: "Water scarcity is a growing problem that threatens the future of humanity. What are the main causes, and what can be done?" Outline 5p → Draft 40p. Target: Band 7.5.'),
        v('ea','🔍 Phase 4 Error Log Review','Review ALL writing errors so far Phase 4. Top 3 persistent errors: đã giảm chưa? Nếu vẫn mắc: viết 10 câu luyện đặc biệt cho loại lỗi đó. Đây là "error elimination sprint."'),
      ],
      [
        s('s1','🗣️ Speaking: Full Mock (fluency + accuracy focus)','Full Speaking mock 15p. Sau khi ghi âm: đánh giá riêng FLUENCY (có dừng dài >2 giây không?) vs ACCURACY (có lỗi ngữ pháp lớn không?). Phase 4 target: fluency không bị interrupt, accuracy ≤2 lỗi/phút.'),
        s('s2','🗣️ Pronunciation: Connected Speech intensive','Luyện 10 phút connected speech: "I used to do it" /aɪ juːstə duːɪt/, "I want to go" /aɪ wɒnə ɡəʊ/, "What do you think?" /wɒdəjə θɪŋk/. Sau đó: đọc 1 paragraph IELTS Model Answer với natural connected speech. Record.'),
        v('rv','🔄 Ôn TR12+TR13 (140 từ)','Quiz TR12 Arts + TR13 Global Issues = 140 từ. Đây là spaced repetition lần cuối cho Topic vocab. Target ≥90%.'),
      ],
      [
        r('r','📖 Cambridge Reading — Matching Headings mastery final','Làm Cambridge Reading (60p). Focus hôm nay: TẤT CẢ câu hỏi Matching Headings phải dùng "umbrella concept technique" — heading = covers ALL ideas in paragraph, not just 1 detail. Target ≥35/40.', IELTS),
        l('l','🎧 IELTS S3 × 4 intensive (120p total)','Nghe 4 IELTS S3 liên tiếp (mỗi S3 ~5-8p). Sau mỗi S3: ghi speaker opinions riêng biệt. Phân tích: có bị distractor nào lừa không? S3 Band 8 yêu cầu: phân biệt subtle opinion changes.', IELTS),
        v('rev2','🔄 Ôn CamListen BL9-BL12 (120 từ)','Quiz CamListen BL9+BL10+BL11+BL12 = 120 từ. Target ≥108/120.'),
      ],
      [
        w('w1','✍️ 100 Collocations: Biodiversity (W2T36)','Học 100 colloc đa dạng sinh học (W2T36): preserve biodiversity, combat habitat destruction, protect endangered species, establish nature reserves, restore degraded ecosystems, promote reforestation, address invasive species, implement conservation strategies, regulate wildlife trade, support indigenous land rights...'),
        w('w2','✍️ Task 2 Essay: Biodiversity','Đề: "Biodiversity is being lost at an alarming rate. Why is this, and what are the consequences?" Outline 5p → Draft 40p. Zero grammar errors goal.'),
        v('ck','🔍 Tự chấm: Zero-error grammar drill','Sau khi viết: đọc LẠI chỉ để check grammar (không check content). Từng câu: kiểm tra (1) S-V agreement, (2) tense consistency, (3) articles, (4) prepositions, (5) word forms. Target: ZERO errors.'),
      ],
      [
        s('s3','🗣️ Speaking: Part 2 rapid-fire (6 cue cards, 45p)','Làm 6 cue cards trong 45p (1p prep + 2p speak + 4.5p review mỗi cue card). Topics: person who inspires you, place you visited, skill you want to learn, challenging experience, book/film that influenced you, technology you find useful. Record tất cả. Focus: no filler words.'),
        w('t1','📊 Task 1 full mock + model answer comparison','Làm Cambridge Task 1 (20p strict). Sau khi làm: đọc model answer và ghi CỤ THỂ 5 expressions bạn không dùng nhưng model answer dùng. Integrate vào bài tiếp theo.', IELTS),
        v('rev3','🔄 Ôn CamCore B1+B2 (140 từ) — final spaced rep','Quiz CamCore B1+B2 = 140 từ. Đây là spaced repetition lần cuối cùng. Target ≥130/140 (93%). Từ sai: đặt câu và commit to memory.'),
      ],
      [
        v('rev','🔄 Ôn Writing T16-T20 key colloc (100)','Ôn 100 colloc từ W2T16-T20 (Language, Tourism, Housing, Globalisation, Immigration). Rapid-fire. Target ≥90/100.'),
        r('rd','📖 Reading: Self-analysis final report','Viết "Reading Attack Plan" cá nhân: (1) chiến lược cho Matching Headings, (2) chiến lược cho T/F/NG, (3) chiến lược cho MCQ, (4) timing: [X] phút/passage, (5) what to do if stuck. Học thuộc kế hoạch này — đây là chiến lược ngày thi.'),
        v('pl','💡 Tổng kết tuần 18','2 tuần cuối! Writing: T35+T36 done. Speaking: vocab hoàn thành + full mock mode. Tuần 19-20: 4 TASKS/NGÀY. Chuẩn bị tinh thần: cường độ tăng lên.'),
      ],
    ],
  },

  // ── Week 19: Ôn tập tổng hợp (4 tasks/day) ────────────────
  {
    theme: 'Ôn tập tổng hợp — 4 tasks/ngày', themeEn: 'Comprehensive Review — 4 tasks/day', phase: 4,
    days: [
      [
        r('r','📖 Full Reading (≥35/40) — Band 8 target','Full Cambridge Reading (60p strict). Target: ≥35/40. 20p phân tích câu sai sau.', IELTS),
        l('l','🎧 Full Listening (≥36/40) — Band 8 target','Full IELTS Listening (40p strict). Target: ≥36/40. Phân tích error sau.', IELTS),
        w('w1','✍️ 100 Collocations: Leadership (W2T37)','Học 100 colloc lãnh đạo (W2T37): demonstrate strong leadership, inspire and motivate others, promote collaborative decision-making, address organisational challenges, implement strategic vision, delegate responsibilities, foster innovation, build high-performing teams, drive positive change, develop leadership skills...'),
        w('w2','✍️ Task 2 Essay: Leadership','Đề: "Good leaders are born, not made. To what extent do you agree?" Outline 5p → Draft 40p. Target Band 7.5+.'),
      ],
      [
        r('r2','📖 Reading: Error review + Inference drill','Review câu sai từ hôm qua. Làm thêm 10 inference-type questions. Inference = answer not stated, must be implied. Viết 5 "inference reasoning" notes: "The text says X, which implies Y."', IELTS),
        l('l2','🎧 S4 × 2 (≥9/10 streak)','Nghe 2 IELTS S4 → target ≥9/10 mỗi. S4 Band 8 streak = mục tiêu của tuần này.', IELTS),
        w('w3','✍️ 100 Collocations: Volunteering (W2T38)','Học 100 colloc tình nguyện (W2T38): engage in voluntary work, support charitable organisations, promote community service, foster civic responsibility, coordinate volunteer programmes, raise funds for good causes, tackle social issues through volunteering, build social capital, inspire others to give back...'),
        w('w4','✍️ Task 2 Essay: Volunteering','Đề: "Volunteering should be made compulsory for young people. To what extent do you agree?" Outline 5p → Draft 40p. Self-mark ngay sau khi viết.'),
      ],
      [
        r('r','📖 Cambridge Reading (60p) — T/F/NG mastery','Focus hôm nay: T/F/NG — NOT GIVEN chỉ khi specific claim neither confirmed nor denied. Làm 15 T/F/NG questions và note reasoning for each. Target: ≥13/15.', IELTS),
        l('l','🎧 Full IELTS Listening (≥37/40)','Full Listening. Target hôm nay: ≥37/40. Nếu đạt: đang ở Band 8 territory! Ghi milestone.', IELTS),
        w('t1','📊 Task 1: 4 mini-essays (10p each)','Viết 4 mini Task 1 (10p mỗi bài, chỉ overview + 1 body): bar, line, pie, process. Focus: tốc độ và accuracy. Sau đó: review TẤT CẢ 4 — note common errors.'),
        s('s1','🗣️ Speaking: Part 2 rapid-fire (8 cue cards, 60p)','8 cue cards trong 60p. Topics khác nhau từ SP01-SP30. Record từng bài. Review: filler words giảm chưa? Vocabulary sophisticated hơn không?'),
      ],
      [
        r('r','📖 Cambridge Reading — Band 8 reasoning','Làm Cambridge Reading (60p). Target ≥36/40. MCQ: eliminate wrong options với written reason cho mỗi option. Matching Headings: umbrella concept. T/F/NG: precise evidence.', IELTS),
        l('l','🎧 S1+S2 accuracy drill (10/10 target)','Làm 4 IELTS S1 + 4 IELTS S2. S1 target: 10/10 (form filling = free marks!). S2 target: 9/10 (map labelling focus). Note: S1 spelling errors = 1 mất = 0.25 band. Không được mất.', IELTS),
        w('w2','✍️ Writing: Zero-error grammar essay','Viết Task 2 280 từ về bất kỳ topic nào. Sau khi viết: proofread CHỈ cho grammar. Mỗi câu: kiểm tra từng trong 5 error types. Target: ZERO grammar errors.'),
        s('s2','🗣️ Speaking: Full mock (14p) + self-mark','Full Part 1+2+3 ghi âm. Sau đó tự chấm 4 tiêu chí. So sánh với tuần 16 mock. Có cải thiện không? Ghi band estimate Phase 4 cho Speaking.'),
      ],
      [
        r('r','📖 Cambridge Reading confidence session','Làm Cambridge Reading (60p). Lần này: tin vào chiến lược. Không lo lắng. Target ≥35/40. Sau khi làm: 10p review câu sai, không spend quá nhiều thời gian phân tích.', IELTS),
        l('l','🎧 Full Listening (≥36/40)','Full Listening. Ghi score. Compare với score tuần 16+17+18+19D1+D3. Có consistent improvement không?', IELTS),
        w('w1','✍️ 100 Collocations: Music & Entertainment (W2T39)','Học 100 colloc âm nhạc (W2T39): promote cultural industries, support independent artists, combat music piracy, develop streaming platforms, foster creative expression, address gender diversity in entertainment, preserve folk music traditions, invest in arts education, expand access to cultural events...'),
        s('s3','🗣️ Speaking: Vocabulary upgrade drill (15p)','Liệt kê 15 "basic" words còn dùng trong speaking. Thay thế bằng sophisticated alternatives. Thực hành: nói 5 phút CHỈ dùng upgraded vocabulary. Record và compare với recording 2 tuần trước.'),
      ],
      [
        r('r','📖 Reading: exam strategy final rehearsal','Đọc lại "Reading Attack Plan" cá nhân từ tuần 18. Visualise từng bước. Sau đó: làm 1 passage (20p) áp dụng chính xác plan đó. Check: có follow plan không?', IELTS),
        l('l','🎧 Listening strategy card final','Viết Listening Strategy Card (1 trang): (1) Preview 30s: đọc questions, predict answer type. (2) During: ghi luôn, không chờ chắc chắn. (3) Transfer time: check spelling. (4) Nếu miss 1 câu: không panic. (5) Section yếu nhất: [điền vào]. Học thuộc.'),
        w('w2','✍️ 100 Collocations: Architecture (W2T40) — DONE! ✅','Học 100 colloc kiến trúc (W2T40): design sustainable buildings, promote green architecture, preserve historical buildings, develop smart urban infrastructure, implement energy-efficient design, revitalise urban spaces, blend traditional and modern styles, enhance the built environment... ĐÃ HOÀN THÀNH 40 Writing Topics!'),
        w('w3','✍️ Task 2 Essay: Architecture & Urban Design','Đề: "Historical buildings should be preserved even if they are expensive to maintain. To what extent do you agree?" Outline 5p → Draft 40p. Final Writing T40!'),
      ],
      [
        v('rev','🔄 Ôn CamCore B3+B4 (140 từ)','Quiz CamCore B3+B4 = 140 từ. Final spaced repetition. Target ≥130/140.'),
        l('lr','🎧 Ôn CamListen BL13-BL16 (120 từ)','Quiz CamListen BL13+BL14+BL15+BL16 = 120 từ. Target ≥108/120.'),
        s('sv','🗣️ Speaking: Positive rehearsal','Nói tiếng Anh 15 phút về chủ đề yêu thích. Tự nhiên, không áp lực. Đây là dạng speaking khi bạn đạt Band 7+: natural and confident.'),
        v('pl','💡 Tổng kết tuần 19','✅ 40 Writing Topics done! ✅ 30 Speaking Topics done! ✅ Cambridge Core 600 + Topic 900 + Listening 600 done! Tuần 20: FINAL EXAM SIMULATION. Chỉ còn 1 tuần. 💪'),
      ],
    ],
  },

  // ── Week 20: Luyện đề thực chiến (4 tasks/day + MILESTONE) ─
  {
    theme: 'Luyện Đề Thực Chiến', themeEn: 'Final Exam Simulation', phase: 4,
    milestone: '🎓 Hoàn Thành 140 Ngày IELTS!',
    days: [
      [
        v('va','Vocab: Collocation activation (20p)','Đọc to collocation cheat sheets (20 topics quan trọng nhất). Rapid-fire: 3 collocations + 1 câu ví dụ cho mỗi topic không nhìn. Activation, không nhồi nhét. 20p tối đa.'),
        r('r','📖 Mock Exam 5: Reading (Official conditions)','Full IELTS Reading (60p). Điều kiện thi thật: không điện thoại, không nghỉ, ngồi thẳng lưng. Target: ≥35/40. Benchmark cuối cùng.', IELTS),
        l('l','🎧 Mock Exam 5: Listening (Official conditions)','Full IELTS Listening (30p nghe + 10p transfer). Điều kiện thi thật. Target: ≥35/40. Chấm ngay sau khi làm.', IELTS),
        w('we','✍️ Error Log: Top 5 Writing Mistakes','Đọc lại ALL writing error logs Phase 4. Top 5 lỗi hay mắc nhất. Viết 5 câu mẫu đúng. Đây là tài liệu đọc buổi sáng ngày thi.'),
      ],
      [
        r('re','📖 Reading: Final error review','Review câu sai từ Mock 5 Reading. Viết 5 insights: "Câu X sai vì... → Lần sau tôi sẽ...". Đây là insight sheet để đọc sáng ngày thi.', IELTS),
        l('le','🎧 Listening: Error review + S4 drill','Review lỗi Mock 5 Listening. Nghe lại đúng đoạn bị sai. Sau đó: 1 IELTS S4 thêm để maintain accuracy. Target ≥9/10.', IELTS),
        w('wm','✍️ Mock Exam 5: Writing (Official conditions)','Full Writing (60p, T1+T2). Điều kiện thi thật: không từ điển. Tự chấm với Band descriptors. Aim: TA≥7, CC≥7, LR≥7, GRA≥7.'),
        s('sm','🗣️ Speaking: Mock + Video self-analysis','Full Speaking mock 15p (ghi video). Xem lại: chấm 4 tiêu chí. So sánh với Tuần 1. Ghi 3 điều tiến bộ nhất. Confidence fuel cho ngày thi.'),
      ],
      [
        r('re','📖 Reading: Easy passage confidence build','1 IELTS passage Band 6 level (15p, không áp lực). Target: ≥12/13. Để xây tự tin, không để thách thức. Sau đó: đọc lại bài vì thích, không vì học. Bạn đã sẵn sàng.', IELTS),
        l('le','🎧 Listening: Light enjoyment (BBC 6 Min)','Nghe BBC 6 Minute English vì thích. Không ghi chép. Chỉ thưởng thức. Giữ ear "warm" mà không tạo áp lực.', BBC6),
        s('sm','🗣️ Mock Exam 5: Speaking (Final mock)','Final Speaking mock 15p (ghi âm). Topics bạn tự tin nhất. Sau đó: nghe lại và trân trọng sự tiến bộ từ Ngày 1. Ghi 3 điều bạn làm rất tốt.'),
        v('vr','Vocab rapid recap: 10 topics (50 colloc, 15p)','Nói nhanh không nhìn 5 collocations cho mỗi trong 10 topics quan trọng nhất (Env, Tech, Edu, Health, Society, Science, Business, Govt, Media, Transport). 50 collocations trong 15 phút.'),
      ],
      [
        v('ve','Vocab: Exam eve review (light)','Đọc chậm Personal Collocation Cheatsheet. KHÔNG học từ mới. Chỉ confirm những gì đã biết. Sau đó: ngủ sớm — não consolidate trong khi ngủ.'),
        r('rs','📖 Reading: Exam strategy final visualisation','Đọc "Reading Attack Plan" cá nhân. Visualise thực hiện từng bước. Sau đó: không làm Reading nữa hôm nay. Prepare mentally.', IELTS),
        w('ws','✍️ Writing: Strategy final review','Đọc lại template intro/body/conclusion. Review: 3 essay types (opinion/discussion/two-part). Visualise viết perfect essay. Mental preparation.'),
        l('ls','🎧 Listening: Strategy card review','Đọc Listening Strategy Card: (1) 30s preview: predict answer type. (2) Ghi luôn khi nghe. (3) Transfer time: check spelling. (4) Miss 1 câu: không panic, tiếp tục. (5) Section yếu: [điền]. Học thuộc lòng.'),
      ],
      [
        r('rf','📖 Reading: Final enjoyment session','1 passage IELTS chủ đề bạn thích, không tính giờ. Đọc vì hứng thú. Đây là lần đọc học thuật cuối trước kỳ thi. Trân trọng khoảnh khắc — bạn đã build kỹ năng này qua 140 ngày cần mẫn.', IELTS),
        l('le','🎧 Listening: Relax with English media','Nghe 30p: podcast hoặc YouTube tiếng Anh yêu thích. Không ghi chép. Thuần túy thưởng thức. 140 ngày training — hãy tin vào những kỹ năng đã xây.'),
        s('sc','🗣️ Speaking: Casual English conversation (15p)','Nói tiếng Anh 15p về bất cứ điều gì: sở thích, kế hoạch. Tự nhiên, không áp lực. Đây là Band 7+ speaking: natural and confident.'),
        v('va','Affirmation: "Tôi đã sẵn sàng!"','Đọc to 10 câu IELTS-level đẹp nhất bạn từng viết (tìm trong notes). Sau đó nói: "Tôi đã học 140 ngày. Tôi có đủ vocab, ngữ pháp và chiến lược. Tôi sẽ đạt 7.5." Tin vào bản thân. 💪'),
      ],
      [
        v('vl','Rest day: Light collocation read-through','Đọc chậm Top 100 IELTS collocations (20p max). Không test. Chỉ để ngôn ngữ thấm vào. Sau đó: ăn tốt, nghỉ ngơi.'),
        r('rl','Rest day: Light newspaper English (15p)','Đọc 1 bài báo tiếng Anh ngắn (BBC, Guardian). Thưởng thức. Không phân tích. Giữ mind active không stress.'),
        l('ll','Rest day: English audio enjoyment','Nghe nhạc tiếng Anh hoặc podcast ngắn. Không ghi chép. Để tiếng Anh "chạy nền" trong đầu.', BBC6),
        s('sl','Rest day: Positive self-talk (5p)','Nói tiếng Anh 5p về hành trình 140 ngày. "I started at 5.5 and have trained for 140 days. I am ready for 7.5." Niềm tin vào bản thân là kỹ năng cuối cùng. 🎯'),
      ],
      // Day 140 = FINAL MILESTONE
      [
        m('m1','🏆 Final Mock: Listening + Reading','Full IELTS simulation (L 40p + R 60p). Cambridge test tốt nhất bạn có. Điều kiện thi thật. Chấm cả 2 ngay sau. So sánh với Day 35, 70, 105. Tính improvement. ĂN MỪNG! 🎉', IELTS),
        m('m2','🏆 Final Mock: Writing + Speaking','Full Writing (60p, T1+T2) + Full Speaking (15p ghi âm). Tự chấm Writing với Band descriptors. Nghe lại Speaking và assign band cho 4 tiêu chí. So sánh với Phase 1. Ghi improvement bằng số.'),
        m('m3','🎓 Tổng kết 140 ngày hành trình','(1) So sánh Phase 4 vs Phase 1 scores, (2) Viết 3 điều tự hào nhất, (3) Đọc chiến lược thi lần cuối. Mục tiêu: R8, L8, W7, S7, Overall 7.5. Bạn đã làm đủ rồi. Hãy đi thi và chinh phục! 🏆'),
        m('x','📋 Exam Day Checklist','✅ Ăn sáng đầy đủ. ✅ Mang đủ giấy tờ (CMND/HC, xác nhận đăng ký). ✅ Đến sớm 30 phút. ✅ L: preview 30 giây/section. ✅ R: 20 phút/passage. ✅ W: 20p T1 + 40p T2. ✅ S: "That\'s an interesting question..." nếu cần thời gian. TỰ TIN! 140 ngày đã chuẩn bị bạn cho khoảnh khắc này! 🎯'),
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

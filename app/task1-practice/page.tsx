'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Loader2, Sparkles, RefreshCw, ChevronRight, BarChart2, TrendingUp,
  PieChart, Table2, Workflow, Map, CheckCircle, AlertCircle, Clock,
  Send, Info, History, Trash2
} from 'lucide-react';
import { LoadingScreen } from '@/components/LoadingScreen';

// ─── Types ───────────────────────────────────────────────────────────────────
type ChartData = {
  type: 'bar' | 'line' | 'pie' | 'table' | 'process' | 'map';
  title: string;
  context: string;
  prompt: string;
  keyFeatures?: string[];
  writingTips?: string;
  xLabel?: string;
  yLabel?: string;
  categories?: string[];
  series?: { name: string; values: number[] }[];
  xValues?: string[];
  year?: string;
  unit?: string;
  segments?: { label: string; value: number }[];
  headers?: string[];
  rows?: string[][];
  steps?: { id: number; label: string; description: string }[];
  location?: string;
  period1?: string;
  period2?: string;
  features1?: { name: string; position: string; icon: string; description: string }[];
  features2?: { name: string; position: string; icon: string; description: string }[];
  changes?: string[];
};

type PracticeSession = {
  id: string;
  chartData: ChartData;
  sentences: string[];
  wordCount: number;
  savedAt: number;
};

const CHART_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6',
];

// ─── TYPE_META: color only (no JSX at module level to avoid SSR issues) ──────
const TYPE_META: Record<string, { label: string; color: string }> = {
  bar:     { label: 'Bar Chart',       color: '#6366f1' },
  line:    { label: 'Line Graph',      color: '#3b82f6' },
  pie:     { label: 'Pie Chart',       color: '#ec4899' },
  table:   { label: 'Table',           color: '#10b981' },
  process: { label: 'Process Diagram', color: '#f59e0b' },
  map:     { label: 'Map',             color: '#ef4444' },
};

function TypeIcon({ type, size = 15 }: { type: string; size?: number }) {
  switch (type) {
    case 'bar':     return <BarChart2 size={size} />;
    case 'line':    return <TrendingUp size={size} />;
    case 'pie':     return <PieChart size={size} />;
    case 'table':   return <Table2 size={size} />;
    case 'process': return <Workflow size={size} />;
    case 'map':     return <Map size={size} />;
    default:        return <BarChart2 size={size} />;
  }
}

// ─── BAR CHART ──────────────────────────────────────────────────────────────
function BarChart({ data }: { data: ChartData }) {
  const { series = [], categories = [], xLabel, yLabel } = data;
  if (!series.length || !categories.length) return null;

  const allValues = series.flatMap(s => s.values);
  const maxVal = Math.max(...allValues, 1);
  const W = 560, H = 250, PL = 52, PR = 16, PT = 16, PB = 62;
  const cW = W - PL - PR, cH = H - PT - PB;
  const gW = cW / categories.length;
  const bW = Math.min((gW / (series.length + 1)) * 0.9, 38);

  // Bug fix: ensure yMax is always > maxVal so bars don't touch the top
  const tStep = Math.max(Math.ceil(maxVal / 5 / 10) * 10, 10);
  const yMax = tStep * (Math.ceil(maxVal / tStep) + 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: 'Inter,sans-serif' }}>
      {Array.from({ length: 6 }, (_, i) => {
        const v = (i / 5) * (yMax * 5 / 6); // only show up to ~83% of yMax range
        const y = PT + cH - (v / yMax) * cH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={PL + cW} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
            <text x={PL - 5} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{Math.round(v)}</text>
          </g>
        );
      })}
      <line x1={PL} y1={PT} x2={PL} y2={PT + cH} stroke="#d1d5db" strokeWidth="1.5" />
      <line x1={PL} y1={PT + cH} x2={PL + cW} y2={PT + cH} stroke="#d1d5db" strokeWidth="1.5" />

      {categories.map((cat, ci) => {
        const gX = PL + ci * gW + gW / 2;
        const totW = series.length * bW + (series.length - 1) * 3;
        return (
          <g key={ci}>
            {series.map((s, si) => {
              const val = s.values[ci] ?? 0;
              const bH = Math.max((val / yMax) * cH, 0);
              const x = gX - totW / 2 + si * (bW + 3);
              const y = PT + cH - bH;
              return (
                <g key={si}>
                  <rect x={x} y={y} width={bW} height={bH} fill={CHART_COLORS[si]} rx={3} opacity={0.88} />
                  {bH > 18 && <text x={x + bW / 2} y={y + 13} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">{val}</text>}
                </g>
              );
            })}
            <text x={gX} y={PT + cH + 14} textAnchor="middle" fontSize="10" fill="#6b7280">
              {cat.length > 11 ? cat.slice(0, 10) + '…' : cat}
            </text>
          </g>
        );
      })}

      {xLabel && <text x={PL + cW / 2} y={H - 2} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">{xLabel}</text>}
      {yLabel && <text transform={`translate(11,${PT + cH / 2})rotate(-90)`} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">{yLabel}</text>}

      {series.length > 1 && series.map((s, si) => (
        <g key={si} transform={`translate(${PL + si * 130},${H - 6})`}>
          <rect width="11" height="11" fill={CHART_COLORS[si]} rx="2" />
          <text x={14} y={9} fontSize="10" fill="#374151">{s.name.length > 14 ? s.name.slice(0, 13) + '…' : s.name}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── LINE CHART ─────────────────────────────────────────────────────────────
function LineChart({ data }: { data: ChartData }) {
  const { series = [], xValues = [], xLabel, yLabel } = data;
  if (!series.length || !xValues.length) return null;

  const allV = series.flatMap(s => s.values);
  const maxV = Math.max(...allV, 1);
  const minV = Math.min(...allV, 0);
  const W = 560, H = 260, PL = 52, PR = 16, PT = 16, PB = 68;
  const cW = W - PL - PR, cH = H - PT - PB;
  const range = maxV - minV || 1;
  const tStep = Math.max(Math.ceil(range / 5 / 5) * 5, 5);
  const yMin = Math.floor(minV / tStep) * tStep;
  const yMax = yMin + tStep * (Math.ceil((maxV - yMin) / tStep) + 1);

  const xS = (i: number) => PL + (i / Math.max(xValues.length - 1, 1)) * cW;
  const yS = (v: number) => PT + cH - ((v - yMin) / (yMax - yMin)) * cH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ fontFamily: 'Inter,sans-serif' }}>
      {Array.from({ length: 6 }, (_, i) => {
        const v = yMin + i * tStep;
        const y = yS(v);
        if (y < PT - 5 || y > PT + cH + 5) return null;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={PL + cW} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
            <text x={PL - 5} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{Math.round(v)}</text>
          </g>
        );
      })}
      <line x1={PL} y1={PT} x2={PL} y2={PT + cH} stroke="#d1d5db" strokeWidth="1.5" />
      <line x1={PL} y1={PT + cH} x2={PL + cW} y2={PT + cH} stroke="#d1d5db" strokeWidth="1.5" />

      {xValues.map((v, i) => (
        <text key={i} x={xS(i)} y={PT + cH + 14} textAnchor="middle" fontSize="10" fill="#6b7280">{v}</text>
      ))}

      {series.map((s, si) => {
        const color = CHART_COLORS[si];
        const pts = s.values.map((v, i) => `${xS(i)},${yS(v)}`).join(' ');
        return (
          <g key={si}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {s.values.map((v, i) => (
              <circle key={i} cx={xS(i)} cy={yS(v)} r={4} fill={color} stroke="white" strokeWidth="2" />
            ))}
          </g>
        );
      })}

      {xLabel && <text x={PL + cW / 2} y={H - 2} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">{xLabel}</text>}
      {yLabel && <text transform={`translate(11,${PT + cH / 2})rotate(-90)`} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">{yLabel}</text>}

      {series.map((s, si) => (
        <g key={si} transform={`translate(${PL + si * 145},${H - 6})`}>
          <line x1={0} y1={5} x2={14} y2={5} stroke={CHART_COLORS[si]} strokeWidth="2.5" />
          <circle cx={7} cy={5} r={3} fill={CHART_COLORS[si]} />
          <text x={18} y={9} fontSize="10" fill="#374151">{s.name.length > 15 ? s.name.slice(0, 14) + '…' : s.name}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── PIE CHART ──────────────────────────────────────────────────────────────
function PieChartViz({ data }: { data: ChartData }) {
  const { segments = [], unit } = data;
  if (!segments.length) return null;

  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const cx = 120, cy = 120, r = 100;

  // Bug fix: single-segment case — draw a full circle instead of a degenerate arc
  if (segments.length === 1) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <svg viewBox="0 0 240 240" className="w-[180px] flex-shrink-0">
          <circle cx={cx} cy={cy} r={r} fill={CHART_COLORS[0]} />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="14" fill="white" fontWeight="bold">
            {segments[0].value}{unit || '%'}
          </text>
        </svg>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: CHART_COLORS[0] }} />
          <span className="text-sm text-gray-700">{segments[0].label}</span>
          <span className="text-sm font-bold ml-1">{segments[0].value}{unit || '%'}</span>
        </div>
      </div>
    );
  }

  let ang = -Math.PI / 2;
  const slices = segments.map((seg, i) => {
    const a = (seg.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
    // Bug fix: clamp to avoid floating-point overshoot past 2π
    const endAng = ang + a - 0.0001;
    const x2 = cx + r * Math.cos(endAng), y2 = cy + r * Math.sin(endAng);
    const mid = ang + a / 2;
    const lx = cx + r * 0.65 * Math.cos(mid), ly = cy + r * 0.65 * Math.sin(mid);
    const large = a > Math.PI ? 1 : 0;
    ang += a;
    return { x1, y1, x2, y2, lx, ly, large, color: CHART_COLORS[i % CHART_COLORS.length], ...seg };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <svg viewBox="0 0 240 240" className="w-[180px] flex-shrink-0" style={{ fontFamily: 'Inter,sans-serif' }}>
        {slices.map((s, i) => (
          <path key={i}
            d={`M ${cx} ${cy} L ${s.x1} ${s.y1} A ${r} ${r} 0 ${s.large} 1 ${s.x2} ${s.y2} Z`}
            fill={s.color} stroke="white" strokeWidth="2" />
        ))}
        {slices.map((s, i) => (
          s.value / total > 0.07 && (
            <text key={i} x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
              fontSize="11" fill="white" fontWeight="bold">
              {s.value}{unit || '%'}
            </text>
          )
        ))}
      </svg>
      <div className="flex flex-col gap-1.5 flex-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{s.label}</span>
            <span className="text-sm font-bold text-gray-900 flex-shrink-0">{s.value}{unit || '%'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TABLE VIZ ──────────────────────────────────────────────────────────────
function TableViz({ data }: { data: ChartData }) {
  const { headers = [], rows = [], unit } = data;
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-50 to-purple-50">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2.5 text-left font-bold text-indigo-800 border-b border-indigo-100 whitespace-nowrap text-xs">
                {h}{i > 0 && unit ? ` (${unit})` : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-gray-700 border-b border-gray-100 font-medium text-sm">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── PROCESS VIZ ────────────────────────────────────────────────────────────
function ProcessViz({ data }: { data: ChartData }) {
  const { steps = [] } = data;
  return (
    <div className="flex flex-wrap gap-y-4 gap-x-2 items-start justify-center py-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center gap-1.5 w-[88px]">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md"
              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}>
              {step.id}
            </div>
            <p className="font-bold text-[11px] text-gray-800 text-center leading-tight">{step.label}</p>
            <p className="text-[10px] text-gray-500 text-center leading-tight line-clamp-2">{step.description}</p>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mb-6" />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── MAP VIZ (Panel extracted to module level to avoid remount on re-render) ─
const POS: Record<string, { top: string; left: string }> = {
  north:     { top: '10%', left: '50%' }, south:     { top: '80%', left: '50%' },
  east:      { top: '50%', left: '78%' }, west:      { top: '50%', left: '22%' },
  center:    { top: '48%', left: '50%' }, northeast: { top: '18%', left: '74%' },
  northwest: { top: '18%', left: '26%' }, southeast: { top: '78%', left: '74%' },
  southwest: { top: '78%', left: '26%' },
};

type MapFeature = { name: string; position: string; icon: string; description: string };

function MapPanel({ features, period, color }: { features: MapFeature[]; period?: string; color: string }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold mb-2 shadow-sm"
        style={{ background: color }}>{period}</div>
      <div className="relative w-full" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0 rounded-xl border-2 bg-green-50/50 overflow-hidden"
          style={{ borderColor: color + '55' }}>
          <div className="absolute top-1.5 right-1.5 text-[9px] font-black text-gray-400 bg-white/80 rounded px-1">N↑</div>
          <svg className="absolute inset-0 w-full h-full opacity-10">
            {[1, 2, 3, 4].map(i => <line key={`h${i}`} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`} stroke="#666" strokeWidth="0.5" />)}
            {[1, 2, 3, 4].map(i => <line key={`v${i}`} x1={`${i * 20}%`} y1="0" x2={`${i * 20}%`} y2="100%" stroke="#666" strokeWidth="0.5" />)}
          </svg>
          {features.map((f, i) => {
            const p = POS[f.position?.toLowerCase()] || POS.center;
            return (
              <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ top: p.top, left: p.left }} title={`${f.name}: ${f.description}`}>
                <span className="text-xl leading-none drop-shadow-sm">{f.icon}</span>
                <span className="text-[8px] font-bold text-gray-700 bg-white/90 px-1 py-0.5 rounded shadow-sm text-center leading-tight max-w-[56px]">{f.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MapViz({ data }: { data: ChartData }) {
  const { features1 = [], features2 = [], period1, period2, changes = [] } = data;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <MapPanel features={features1} period={period1} color="#6366f1" />
        <MapPanel features={features2} period={period2} color="#f59e0b" />
      </div>
      {changes.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">Key Changes</p>
          <ul className="space-y-1">
            {changes.map((c, i) => (
              <li key={i} className="text-xs text-amber-900 flex gap-1.5">
                <span className="text-amber-500 font-bold">→</span><span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ChartRenderer({ data }: { data: ChartData }) {
  switch (data.type) {
    case 'bar':     return <BarChart data={data} />;
    case 'line':    return <LineChart data={data} />;
    case 'pie':     return <PieChartViz data={data} />;
    case 'table':   return <TableViz data={data} />;
    case 'process': return <ProcessViz data={data} />;
    case 'map':     return <MapViz data={data} />;
    default: return <p className="text-gray-400 text-sm italic">Loại biểu đồ không xác định.</p>;
  }
}

// ─── PLACEHOLDER HINTS ──────────────────────────────────────────────────────
const HINTS: Record<string, string[]> = {
  bar:     ['Overall, the bar chart illustrates...', '[Category X] recorded the highest value of...', 'By contrast, [Y] had the lowest figure at...', '[Group A] figures ranged from ... to ...', 'A notable difference can be seen between ... and ...', '[X] was approximately ... times higher/lower than [Y].', 'While [A] stood at ..., [B] was considerably ... at ...', 'The gap between [X] and [Y] was most pronounced in ...', 'It is worth noting that ...', 'Overall, the data reveals a clear pattern of ...'],
  line:    ['Overall, the graph shows trends in ... over the period.', 'In [year], [subject] stood at ... and subsequently ...', 'The sharpest increase/decline was seen in ..., rising/falling from ... to ...', '[A] and [B] followed a similar/contrasting trend, with ...', 'A steady upward/downward trend was observed in ... throughout ...', 'The two lines converged/diverged around [year], when ...', 'By the end of the period, [subject] peaked/troughed at ...', '[Subject] fluctuated between ... and ... during ...', 'In contrast, [B] remained relatively stable at around ...', 'Overall, [subject] ended the period significantly higher/lower than it began.'],
  pie:     ['Overall, the chart shows that ... accounted for the largest share at ...', 'The smallest proportion was [X], making up only ...%.', 'Together, [A] and [B] comprised approximately ...% of the total.', '[Category] dominated the chart, constituting roughly ...%.', '[A] and [B] each accounted for a relatively minor share.', 'It is notable that the two largest categories combined for over half the total.', '[Category] represented ...%, making it the second largest segment.', 'The remaining ...% was distributed among several smaller categories.', 'Compared to [A], [B] contributed a considerably smaller proportion.', 'Overall, the distribution was dominated by [X], with others being considerably smaller.'],
  table:   ['Overall, the table presents data on ... across several categories.', '[X] consistently recorded the highest figures throughout the period.', 'In contrast, [Y] showed the lowest values across all time points.', 'Between [year1] and [year2], [subject] grew/declined by approximately ...', 'The most significant increase was observed in [X], rising from ... to ...', 'By [year], [X] had reached its highest/lowest point at ...', '[A] and [B] showed similar patterns, both experiencing a ... trend.', 'The gap between the highest and lowest was most pronounced in [year].', 'Notably, [X] was the only category to show a consistent ... trend.', 'Overall, the data reveals a general trend of ...'],
  process: ['Overall, the diagram illustrates a ...-stage process for ...', 'The process begins with ..., where [material] is [action].', 'In the second stage, [material] is [action], resulting in ...', 'Subsequently, [material] undergoes ..., which involves ...', 'Once [stage X] is complete, the product moves to [next stage].', '[Stage Y] is a critical phase in which ... takes place.', 'Following [stage], the product is then [transformed/tested].', 'The penultimate step involves ..., where [outcome].', 'Finally, the [product] is [last action], completing the process.', 'Overall, the process requires ... distinct stages before the final product is ready.'],
  map:     ['Overall, the maps show that [location] underwent significant transformation.', 'In [period1], the area was predominantly characterised by [feature].', 'By [period2], several major changes had occurred, most notably ...', 'The [northern/southern] area, previously [feature], was replaced by [new feature].', 'One of the most striking changes was the construction of ...', 'The [original feature] was demolished/relocated to accommodate ...', 'In contrast to [period1], [period2] saw the addition of ...', 'The [area] appears to have remained unchanged throughout both periods.', 'A new [road/building] was established [where], connecting ... to ...', 'Overall, the key change was the shift from [old] to [new], suggesting ...'],
};

// ─── LOCAL STORAGE ────────────────────────────────────────────────────────────
const LS_KEY = 'task1_sessions_v1';
function loadSessions(): PracticeSession[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveSessions(s: PracticeSession[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s.slice(0, 20))); } catch { }
}
function makeSentences() { return Array.from({ length: 10 }, () => ''); }

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function Task1PracticePage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<'practice' | 'history'>('practice');

  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [sentences, setSentences] = useState<string[]>(makeSentences);
  const [phase, setPhase] = useState<'idle' | 'writing' | 'done'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [showTips, setShowTips] = useState(false);

  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    setSessions(loadSessions());
  }, []);

  // Bug fix: stopTimer does NOT depend on any state, only on the ref
  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Bug fix: startTimer captures stopTimer via ref so it never goes stale
  const stopTimerRef = useRef(stopTimer);
  useEffect(() => { stopTimerRef.current = stopTimer; }, [stopTimer]);

  const startTimer = useCallback((seconds: number) => {
    stopTimerRef.current();
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopTimerRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const generateChart = useCallback(async () => {
    setIsGenerating(true);
    setError('');
    setChartData(null);
    setPhase('idle');
    setSentences(makeSentences());
    setShowTips(false);
    stopTimerRef.current();
    try {
      const res = await fetch('/api/ai/task1-generate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi server');
      setChartData(data);
      setPhase('writing');
      startTimer(20 * 60);
    } catch (e: any) {
      setError(e.message || 'Không thể tạo đề bài. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  }, [startTimer]);

  const handleSubmit = () => {
    if (!chartData) return;
    stopTimerRef.current();
    setPhase('done');
    const wc = sentences.reduce((sum, s) => sum + (s.trim() ? s.trim().split(/\s+/).length : 0), 0);
    const session: PracticeSession = {
      id: Date.now().toString(),
      chartData,
      sentences: sentences.filter(s => s.trim()),
      wordCount: wc,
      savedAt: Date.now(),
    };
    const updated = [session, ...sessions];
    setSessions(updated);
    saveSessions(updated);
    // Switch to history AFTER state updates to avoid stale session list
    setTimeout(() => {
      setTab('history');
      setSelectedSession(session);
    }, 0);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
    if (selectedSession?.id === id) setSelectedSession(null);
  };

  // Bug fix: "Luyện đề mới" from history — switch tab first, THEN generate
  const handleNewFromHistory = useCallback(() => {
    setTab('practice');
    // Use setTimeout so the tab state updates before generateChart runs
    setTimeout(() => generateChart(), 0);
  }, [generateChart]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const filled = sentences.filter(s => s.trim()).length;
  const wordCount = sentences.reduce((sum, s) => sum + (s.trim() ? s.trim().split(/\s+/).length : 0), 0);

  if (!mounted) return <LoadingScreen />;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full animate-fade-in pb-16">

      {/* ── Hero ── */}
      <div className="relative flex flex-col items-center text-center gap-3 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-8 rounded-3xl shadow-lg overflow-hidden border border-indigo-100/60">
        <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{ boxShadow: '0 0 0 1.5px rgba(99,102,241,0.22), 0 0 50px 6px rgba(99,102,241,0.09)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
        <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-indigo-600 mb-1 z-10 ring-1 ring-indigo-100">
          <BarChart2 size={28} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight z-10">Luyện IELTS Task 1</h1>
        <p className="text-gray-500 max-w-xl z-10 text-[14px] leading-relaxed">
          AI ngẫu nhiên tạo <b>bar, line, pie, table, process, map</b>. Bạn viết <b>10 câu</b> mô tả theo phong cách IELTS Academic trong 20 phút.
        </p>

        <div className="flex gap-2 bg-white/70 backdrop-blur-sm p-1 rounded-xl shadow-sm ring-1 ring-gray-200/60 z-10 mt-1">
          <button onClick={() => setTab('practice')}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'practice' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
            <BarChart2 size={15} /> Luyện tập
          </button>
          <button onClick={() => setTab('history')}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-bold text-sm transition-all ${tab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
            <History size={15} /> Lịch sử
            {sessions.length > 0 && (
              <span className="ml-1 bg-indigo-100 text-indigo-700 text-xs font-black px-1.5 rounded-full">{sessions.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── PRACTICE TAB ── */}
      {tab === 'practice' && (
        <>
          <div className="flex justify-center">
            <button onClick={generateChart} disabled={isGenerating}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100">
              {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {isGenerating ? 'AI đang tạo đề...' : chartData ? <><RefreshCw size={16} /> Tạo đề mới</> : 'Bắt đầu luyện tập'}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle size={17} className="flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {chartData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left: Chart */}
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100"
                    style={{ background: (TYPE_META[chartData.type]?.color ?? '#6366f1') + '12' }}>
                    <span style={{ color: TYPE_META[chartData.type]?.color }}>
                      <TypeIcon type={chartData.type} size={15} />
                    </span>
                    <span className="font-bold text-sm" style={{ color: TYPE_META[chartData.type]?.color }}>
                      {TYPE_META[chartData.type]?.label}
                    </span>
                    <span className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                      style={{ background: TYPE_META[chartData.type]?.color }}>IELTS Task 1</span>
                  </div>

                  <div className="p-4">
                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 mb-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-bold text-blue-800">Đề bài: </span>{chartData.context}
                      </p>
                    </div>
                    <ChartRenderer data={chartData} />
                    <p className="mt-3 text-xs text-gray-400 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      {chartData.prompt}
                    </p>
                  </div>
                </div>

                {/* Tips accordion */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <button onClick={() => setShowTips(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Info size={15} className="text-amber-500" />
                      <span className="font-bold text-sm text-gray-700">Gợi ý & Key Features</span>
                    </div>
                    <ChevronRight size={15} className={`text-gray-400 transition-transform ${showTips ? 'rotate-90' : ''}`} />
                  </button>
                  {showTips && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
                      {(chartData.keyFeatures?.length ?? 0) > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Những điểm chính cần đề cập:</p>
                          <ul className="space-y-1.5">
                            {chartData.keyFeatures!.map((f, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {chartData.writingTips && (
                        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-sm text-amber-900">
                          <span className="font-bold">Mẹo: </span>{chartData.writingTips}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Writing */}
              <div className="flex flex-col gap-3">
                {/* Stats bar */}
                <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-200">
                  <div className={`flex items-center gap-1.5 font-black text-base tabular-nums ${timeLeft > 0 && timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`}>
                    <Clock size={15} />{fmt(timeLeft)}
                  </div>
                  <div className="h-3.5 w-px bg-gray-200" />
                  <span className="text-sm text-gray-500">{filled}/10 câu</span>
                  <div className="h-3.5 w-px bg-gray-200" />
                  <span className="text-sm text-gray-500">{wordCount} words</span>
                  <div className="ml-auto flex gap-1">
                    {sentences.map((s, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-colors ${s.trim() ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>

                {/* Sentences */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50/80 to-teal-50/50">
                    <p className="font-bold text-sm text-gray-700">Viết 10 câu mô tả biểu đồ <span className="text-gray-400 font-normal text-xs">(mỗi câu 1 ý)</span></p>
                  </div>

                  <div className="p-3 flex flex-col gap-2 overflow-y-auto max-h-[500px] custom-scrollbar">
                    {sentences.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-2 transition-colors ${s.trim() ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {i + 1}
                        </span>
                        <textarea
                          rows={2}
                          disabled={phase === 'done'}
                          placeholder={HINTS[chartData.type]?.[i] ?? 'Write a sentence...'}
                          value={s}
                          onChange={e => {
                            const val = e.target.value;
                            setSentences(prev => {
                              const n = [...prev];
                              n[i] = val;
                              return n;
                            });
                          }}
                          className="flex-1 resize-none text-[13px] p-2 rounded-xl border border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 focus:bg-white placeholder:text-gray-300 text-gray-800 disabled:opacity-60"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <button onClick={handleSubmit} disabled={phase === 'done' || filled < 5}
                      className="w-full py-2.5 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 text-sm">
                      <Send size={15} />
                      {phase === 'done' ? '✓ Đã lưu bài' : `Nộp & Lưu (${filled}/10 câu)`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions when idle */}
          {!chartData && !isGenerating && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '🎲', title: 'AI tạo đề ngẫu nhiên', desc: 'Gemini tạo 1 trong 6 dạng: Bar chart, Line graph, Pie chart, Table, Process diagram, Map — dữ liệu thực tế như đề thi IELTS.' },
                { icon: '✍️', title: 'Luyện viết theo ý', desc: 'Mỗi ô là 1 câu, mỗi câu 1 ý. Không phải dịch. Luyện tư duy overview → detail → comparison.' },
                { icon: '📋', title: 'Tự review có checklist', desc: 'Sau khi nộp, đối chiếu bài viết với danh sách key features AI gợi ý. Lưu lịch sử luyện tập.' },
              ].map((c, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                  <div className="text-3xl mb-3">{c.icon}</div>
                  <h3 className="font-bold text-gray-800 mb-1.5 text-[15px]">{c.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
              <p className="font-bold text-sm text-gray-700">Lịch sử luyện tập</p>
            </div>
            {sessions.length === 0 ? (
              <div className="p-8 text-center">
                <History size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Chưa có bài luyện nào.</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[580px] custom-scrollbar divide-y divide-gray-100">
                {sessions.map(sess => {
                  const meta = TYPE_META[sess.chartData.type];
                  const isSelected = selectedSession?.id === sess.id;
                  return (
                    <div key={sess.id}
                      onClick={() => setSelectedSession(sess)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: meta?.color ?? '#6366f1' }}>
                        <TypeIcon type={sess.chartData.type} size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{sess.chartData.title || meta?.label}</p>
                        <p className="text-[10px] text-gray-400">{sess.sentences.length} câu · {sess.wordCount} words · {new Date(sess.savedAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); deleteSession(sess.id); }}
                        className="p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {!selectedSession ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                <History size={36} className="text-gray-200 mb-3" />
                <p className="text-gray-400 font-medium">Chọn một phiên luyện để xem lại</p>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="px-5 py-4 border-b border-gray-100"
                  style={{ background: (TYPE_META[selectedSession.chartData.type]?.color ?? '#6366f1') + '0F' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ color: TYPE_META[selectedSession.chartData.type]?.color }}>
                      <TypeIcon type={selectedSession.chartData.type} size={15} />
                    </span>
                    <h2 className="font-bold text-gray-800">{selectedSession.chartData.title}</h2>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedSession.savedAt).toLocaleString('vi-VN')} · {selectedSession.sentences.length} câu · {selectedSession.wordCount} từ
                  </p>
                </div>

                <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[560px] custom-scrollbar">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <ChartRenderer data={selectedSession.chartData} />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bài làm của bạn</p>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-1.5">
                      {selectedSession.sentences.map((s, i) => (
                        <p key={i} className="text-[14px] text-gray-800 leading-relaxed">
                          <span className="font-bold text-indigo-500 mr-1.5">[{i + 1}]</span>{s}
                        </p>
                      ))}
                    </div>
                  </div>

                  {(selectedSession.chartData.keyFeatures?.length ?? 0) > 0 && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2.5">Tự kiểm tra: Đã đề cập chưa?</p>
                      <div className="space-y-2">
                        {selectedSession.chartData.keyFeatures!.map((f, i) => (
                          <label key={i} className="flex items-start gap-2.5 cursor-pointer">
                            <input type="checkbox" className="mt-0.5 accent-amber-500 w-3.5 h-3.5 flex-shrink-0" />
                            <span className="text-sm text-amber-900">{f}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bug fix: use handleNewFromHistory instead of inline async */}
                  <button onClick={handleNewFromHistory}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all text-sm">
                    <RefreshCw size={15} /> Luyện đề mới
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

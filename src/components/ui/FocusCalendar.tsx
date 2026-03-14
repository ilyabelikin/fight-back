import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Trophy, Skull } from "lucide-react";
import { useAppStore } from "../../store/appStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayRecord {
  date: Date;
  socialMinutes: number;
  focusScore: number;
  won: boolean;
}

// ─── Constants & data generation ─────────────────────────────────────────────

const DAILY_LIMIT = 60;

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function buildRecord(date: Date, socialMinutes: number): DayRecord {
  const won = socialMinutes <= DAILY_LIMIT;
  const excess = Math.max(0, socialMinutes - DAILY_LIMIT);
  const focusScore = Math.max(0, Math.min(100, Math.round(100 - (excess / DAILY_LIMIT) * 100)));
  return { date, socialMinutes, focusScore, won };
}

function generateBaseHistory(): DayRecord[] {
  const records: DayRecord[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate past 364 days (skip today — it will be injected live)
  for (let i = 364; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const base = isWeekend ? 80 : 55;
    const socialMinutes = Math.max(10, Math.min(180, Math.round(base + seededRand(seed) * 80 - 20)));
    records.push(buildRecord(date, socialMinutes));
  }

  return records;
}

// Stable historical data (past days, never changes)
const BASE_HISTORY = generateBaseHistory();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Tab = "week" | "month" | "year";

function calcStreak(history: DayRecord[]): number {
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].won) streak++;
    else break;
  }
  return streak;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreDot({
  record,
  size = "md",
  selected = false,
  onClick,
}: {
  record: DayRecord;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
}) {
  const sizeClass =
    size === "sm" ? "w-6 h-6 text-[9px]" : size === "lg" ? "w-11 h-11 text-sm" : "w-9 h-9 text-xs";
  const color = record.won
    ? "bg-emerald-500/80 border-emerald-400/60"
    : record.focusScore >= 50
    ? "bg-amber-500/80 border-amber-400/60"
    : "bg-red-500/80 border-red-400/60";
  const ring = selected ? "ring-2 ring-white ring-offset-1 ring-offset-[#0a0a0f]" : "";

  return (
    <button
      onClick={onClick}
      className={`${sizeClass} ${color} ${ring} rounded-full border flex items-center justify-center font-bold text-white transition-all`}
    >
      {size !== "sm" && record.focusScore}
    </button>
  );
}

function DayDetailCard({ record }: { record: DayRecord }) {
  const isToday = isSameDay(record.date, new Date());
  const label = isToday
    ? "Today"
    : record.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 mt-3"
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${record.won ? "bg-emerald-500/20" : "bg-red-500/20"}`}
      >
        {record.won ? (
          <Trophy className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />
        ) : (
          <Skull className="w-6 h-6 text-red-400" strokeWidth={1.5} />
        )}
      </div>
      <div className="flex-1">
        <p className="text-white font-semibold text-sm">{label}</p>
        <p className="text-[#707088] text-xs mt-0.5">
          {record.socialMinutes}m social · Score {record.focusScore}
        </p>
      </div>
      <div
        className={`text-sm font-bold px-3 py-1 rounded-full ${record.won ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}
      >
        {record.won ? "W" : "L"}
      </div>
    </motion.div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({ history }: { history: DayRecord[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDay, setSelectedDay] = useState<DayRecord | null>(null);

  // Last 5 weeks × 7 days
  const weeks: DayRecord[][] = [];
  for (let w = 4; w >= 0; w--) {
    const week: DayRecord[] = [];
    for (let d = 6; d >= 0; d--) {
      const target = new Date(today);
      target.setDate(today.getDate() - w * 7 - d);
      const rec = history.find((r) => isSameDay(r.date, target));
      if (rec) week.push(rec);
    }
    weeks.push(week);
  }

  const thisWeek = weeks[weeks.length - 1];
  const wins = thisWeek.filter((d) => d.won).length;
  const avgScore = Math.round(thisWeek.reduce((s, d) => s + d.focusScore, 0) / Math.max(thisWeek.length, 1));

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "This week", value: `${wins}/7`, sub: "days won" },
          { label: "Avg score", value: avgScore, sub: "this week" },
          { label: "Streak", value: `${calcStreak(history)}d`, sub: "current" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-3 text-center">
            <p className="text-[#606078] text-xs">{label}</p>
            <p className="text-white font-bold text-xl mt-0.5">{value}</p>
            <p className="text-[#606078] text-xs">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map((d) => (
            <p key={d} className="text-center text-[#606078] text-xs">{d}</p>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
            {week.map((rec) => {
              const isToday = isSameDay(rec.date, today);
              return (
                <div key={rec.date.toISOString()} className="flex justify-center">
                  <ScoreDot
                    record={rec}
                    size="md"
                    selected={selectedDay ? isSameDay(selectedDay.date, rec.date) : isToday}
                    onClick={() => setSelectedDay(rec)}
                  />
                </div>
              );
            })}
          </div>
        ))}

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/8">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[#606078] text-xs">Won</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="text-[#606078] text-xs">Close</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="text-[#606078] text-xs">Lost</span>
          </div>
          <p className="ml-auto text-[#606078] text-xs">Score inside dot</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedDay && <DayDetailCard key={selectedDay.date.toISOString()} record={selectedDay} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({ history }: { history: DayRecord[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<DayRecord | null>(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthRecords = history.filter(
    (r) => r.date.getFullYear() === year && r.date.getMonth() === month
  );

  const wins = monthRecords.filter((r) => r.won).length;
  const losses = monthRecords.filter((r) => !r.won).length;
  const avgScore = monthRecords.length
    ? Math.round(monthRecords.reduce((s, r) => s + r.focusScore, 0) / monthRecords.length)
    : 0;

  const canGoForward =
    year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth());

  const navigate = (dir: -1 | 1) => {
    setSelectedDay(null);
    setMonth((m) => {
      const next = m + dir;
      if (next < 0) { setYear((y) => y - 1); return 11; }
      if (next > 11) { setYear((y) => y + 1); return 0; }
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-white" strokeWidth={2} />
        </button>
        <p className="text-white font-semibold">
          {MONTH_LABELS[month]} {year}
        </p>
        <button
          onClick={() => navigate(1)}
          disabled={!canGoForward}
          className={`w-8 h-8 rounded-full flex items-center justify-center ${canGoForward ? "bg-white/8" : "opacity-30 cursor-not-allowed"}`}
        >
          <ChevronRight className="w-4 h-4 text-white" strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Won", value: wins, color: "text-emerald-400" },
          { label: "Lost", value: losses, color: "text-red-400" },
          { label: "Avg score", value: avgScore, color: "text-violet-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-3 text-center">
            <p className="text-[#606078] text-xs">{label}</p>
            <p className={`font-bold text-xl mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map((d) => (
            <p key={d} className="text-center text-[#606078] text-xs">{d}</p>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const cellDate = new Date(year, month, dayNum);
            cellDate.setHours(0, 0, 0, 0);
            const rec = monthRecords.find((r) => r.date.getDate() === dayNum);
            const isFuture = cellDate > today;
            const isToday = isSameDay(cellDate, today);

            if (isFuture) {
              return (
                <div key={dayNum} className="flex flex-col items-center gap-0.5 py-0.5">
                  <div className="w-7 h-7 rounded-full bg-white/4 flex items-center justify-center">
                    <span className="text-[#404058] text-xs">{dayNum}</span>
                  </div>
                </div>
              );
            }

            if (!rec) return null;

            const dotColor = rec.won
              ? "bg-emerald-500"
              : rec.focusScore >= 50
              ? "bg-amber-500"
              : "bg-red-500";
            const isSelected = selectedDay ? isSameDay(selectedDay.date, cellDate) : false;

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(rec)}
                className="flex flex-col items-center gap-0.5 py-0.5"
              >
                <div
                  className={`w-7 h-7 rounded-full ${dotColor} flex items-center justify-center transition-all ${
                    isSelected || isToday ? "ring-2 ring-white ring-offset-1 ring-offset-[#0a0a0f]" : "opacity-80"
                  }`}
                >
                  <span className="text-white text-[10px] font-bold">{dayNum}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selectedDay && <DayDetailCard key={selectedDay.date.toISOString()} record={selectedDay} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Year View ────────────────────────────────────────────────────────────────

function YearView({ history }: { history: DayRecord[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, setYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const yearRecords = history.filter((r) => r.date.getFullYear() === year);
  const totalWins = yearRecords.filter((r) => r.won).length;
  const totalDays = yearRecords.length;
  const avgScore = totalDays
    ? Math.round(yearRecords.reduce((s, r) => s + r.focusScore, 0) / totalDays)
    : 0;
  const winRate = totalDays ? Math.round((totalWins / totalDays) * 100) : 0;
  const canGoForward = year < today.getFullYear();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { setSelectedMonth(null); setYear((y) => y - 1); }} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-white" strokeWidth={2} />
        </button>
        <p className="text-white font-semibold">{year}</p>
        <button
          onClick={() => { setSelectedMonth(null); setYear((y) => y + 1); }}
          disabled={!canGoForward}
          className={`w-8 h-8 rounded-full flex items-center justify-center ${canGoForward ? "bg-white/8" : "opacity-30 cursor-not-allowed"}`}
        >
          <ChevronRight className="w-4 h-4 text-white" strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Days won", value: `${totalWins}/${totalDays}`, color: "text-emerald-400" },
          { label: "Win rate", value: `${winRate}%`, color: "text-violet-400" },
          { label: "Avg score", value: avgScore, color: "text-blue-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-3 text-center">
            <p className="text-[#606078] text-xs">{label}</p>
            <p className={`font-bold text-lg mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
        <div className="grid grid-cols-3 gap-3">
          {MONTH_LABELS.map((label, mi) => {
            const monthRecs = yearRecords.filter((r) => r.date.getMonth() === mi);
            const mWins = monthRecs.filter((r) => r.won).length;
            const mTotal = monthRecs.length;
            const mAvg = mTotal ? Math.round(monthRecs.reduce((s, r) => s + r.focusScore, 0) / mTotal) : null;
            const isFuture = year === today.getFullYear() && mi > today.getMonth();
            const isSelected = selectedMonth === mi;
            const winFrac = mTotal ? mWins / mTotal : 0;

            return (
              <button
                key={label}
                disabled={isFuture || mTotal === 0}
                onClick={() => setSelectedMonth(isSelected ? null : mi)}
                className={`rounded-2xl p-3 text-left transition-all border ${
                  isSelected
                    ? "bg-violet-500/20 border-violet-500/40"
                    : isFuture
                    ? "bg-white/3 border-white/5 opacity-40 cursor-not-allowed"
                    : "bg-white/5 border-white/8 hover:border-white/20"
                }`}
              >
                <p className="text-[#a0a0b8] text-xs font-medium mb-2">{label}</p>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${winFrac >= 0.7 ? "bg-emerald-500" : winFrac >= 0.4 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${winFrac * 100}%` }}
                  />
                </div>
                {mAvg !== null ? (
                  <>
                    <p className="text-white font-bold text-base">{mAvg}</p>
                    <p className="text-[#606078] text-xs">{mWins}/{mTotal} W</p>
                  </>
                ) : (
                  <p className="text-[#404058] text-xs">No data</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedMonth !== null && (() => {
          const monthRecs = yearRecords.filter((r) => r.date.getMonth() === selectedMonth);
          if (!monthRecs.length) return null;
          const mWins = monthRecs.filter((r) => r.won).length;
          const mAvg = Math.round(monthRecs.reduce((s, r) => s + r.focusScore, 0) / monthRecs.length);
          return (
            <motion.div
              key={selectedMonth}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-3"
            >
              <p className="text-white font-semibold mb-3">
                {MONTH_LABELS[selectedMonth]} {year}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {monthRecs.map((rec) => (
                  <div
                    key={rec.date.toISOString()}
                    title={`${rec.date.getDate()} — Score ${rec.focusScore}`}
                    className={`w-5 h-5 rounded-full ${rec.won ? "bg-emerald-500/80" : rec.focusScore >= 50 ? "bg-amber-500/80" : "bg-red-500/80"}`}
                  />
                ))}
              </div>
              <p className="text-[#a0a0b8] text-sm">
                Won <span className="text-white font-semibold">{mWins}</span> of{" "}
                <span className="text-white font-semibold">{monthRecs.length}</span> days · Avg score{" "}
                <span className="text-violet-300 font-semibold">{mAvg}</span>
              </p>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

export default function FocusCalendar() {
  const { socialMediaMinutes } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>("month");
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Build today's live record from the simulation state
  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayRecord = useMemo(
    () => buildRecord(todayDate, socialMediaMinutes),
    [todayDate, socialMediaMinutes]
  );

  // Merge live today into the historical data so all views stay in sync
  const liveHistory = useMemo(
    () => [...BASE_HISTORY, todayRecord],
    [todayRecord]
  );

  const streak = calcStreak(liveHistory);

  return (
    <div>
      {/* Header summary — reflects live simulation */}
      <div className="flex items-stretch gap-3 mb-5">
        <motion.div
          animate={{
            backgroundColor: todayRecord.won ? "rgba(6,78,59,0.2)" : "rgba(69,10,10,0.2)",
            borderColor: todayRecord.won ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
          }}
          transition={{ duration: 0.5 }}
          className="flex-1 rounded-2xl p-4 border"
        >
          <p className="text-[#606078] text-xs font-medium uppercase tracking-wide">Today</p>
          <div className="flex items-center gap-2 mt-1">
            <AnimatePresence mode="wait">
              {todayRecord.won ? (
                <motion.div key="trophy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                  <Trophy className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
                </motion.div>
              ) : (
                <motion.div key="skull" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                  <Skull className="w-5 h-5 text-red-400" strokeWidth={1.5} />
                </motion.div>
              )}
            </AnimatePresence>
            <motion.span
              animate={{ color: todayRecord.won ? "#6ee7b7" : "#fca5a5" }}
              className="text-xl font-bold"
            >
              {todayRecord.won ? "You're winning!" : "You're losing"}
            </motion.span>
          </div>
          <p className="text-[#606078] text-xs mt-1">
            Score{" "}
            <motion.span
              key={todayRecord.focusScore}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              className="text-white font-medium"
            >
              {todayRecord.focusScore}
            </motion.span>
            {" "}· {socialMediaMinutes}m social · limit {DAILY_LIMIT}m
          </p>
        </motion.div>

        <div className="w-24 rounded-2xl p-4 border bg-white/5 border-white/8 flex flex-col items-center justify-center text-center">
          <p className="text-[#606078] text-xs font-medium uppercase tracking-wide">Streak</p>
          <p className="text-white font-bold text-2xl mt-1">{streak}</p>
          <p className="text-[#606078] text-xs">days 🔥</p>
        </div>
      </div>

      {/* Tab bar */}
      <div ref={tabBarRef} className="flex bg-white/5 rounded-2xl p-1 mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
              activeTab === tab.id ? "text-white" : "text-[#606078] hover:text-[#a0a0b8]"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="calTabBg"
                className="absolute inset-0 bg-white/10 rounded-xl"
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content — all views receive the live-patched history */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "week" && <WeekView history={liveHistory} />}
          {activeTab === "month" && <MonthView history={liveHistory} />}
          {activeTab === "year" && <YearView history={liveHistory} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

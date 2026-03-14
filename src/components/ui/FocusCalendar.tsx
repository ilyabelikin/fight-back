import { useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Skull,
  X,
  Pencil,
  PersonStanding,
  BookOpen,
  Brain,
} from "lucide-react";
import { AVATAR_COLORS, FRIENDS, useAppStore } from "../../store/appStore";

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

function buildRecord(date: Date, socialMinutes: number, activityOffset = 0): DayRecord {
  const excess = Math.max(0, socialMinutes - DAILY_LIMIT);
  const effectiveExcess = Math.max(0, excess - activityOffset);
  const won = effectiveExcess <= 0;
  const focusScore = Math.max(0, Math.min(100, Math.round(100 - (effectiveExcess / DAILY_LIMIT) * 100)));
  return { date, socialMinutes, focusScore, won };
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function generateBaseHistory(): DayRecord[] {
  const records: DayRecord[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
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

const BASE_HISTORY = generateBaseHistory();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// How much activity time an excess minute of social media demands
function activitySuggestion(excess: number) {
  if (excess <= 0) return null;
  return {
    running: Math.ceil(excess * 0.4),
    reading: Math.ceil(excess * 0.6),
    meditating: Math.ceil(excess * 0.5),
  };
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

// ─── Day Editor Sheet ─────────────────────────────────────────────────────────

function DayEditorSheet({
  record,
  isToday,
  onSave,
  onClose,
}: {
  record: DayRecord;
  isToday: boolean;
  onSave: (minutes: number) => void;
  onClose: () => void;
}) {
  const [minutes, setMinutes] = useState(record.socialMinutes);
  const preview = buildRecord(record.date, minutes);
  const excess = Math.max(0, minutes - DAILY_LIMIT);
  const suggestions = activitySuggestion(excess);
  const label = isToday
    ? "Today"
    : record.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const dotColor = preview.won
    ? "from-emerald-500 to-teal-500"
    : "from-red-500 to-rose-600";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="relative w-full max-w-md mx-auto bg-[#111118] border border-white/10 rounded-t-3xl overflow-hidden"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[#606078] text-xs uppercase tracking-wide font-medium">
                {isToday ? "Simulating today" : "Simulating day"}
              </p>
              <p className="text-white font-semibold mt-0.5">{label}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" strokeWidth={2} />
            </button>
          </div>

          {/* Score preview ring */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <motion.circle
                  cx="40" cy="40" r="32"
                  fill="none"
                  stroke="url(#editorGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 32 * (1 - preview.focusScore / 100)}` }}
                  transition={{ duration: 0.3 }}
                />
                <defs>
                  <linearGradient id="editorGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={preview.won ? "#10b981" : "#ef4444"} />
                    <stop offset="100%" stopColor={preview.won ? "#14b8a6" : "#e11d48"} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{preview.focusScore}</span>
              </div>
            </div>

            <div className="flex-1">
              <motion.div
                animate={{ opacity: 1 }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${dotColor} mb-2`}
              >
                {preview.won
                  ? <Trophy className="w-4 h-4 text-white" strokeWidth={1.5} />
                  : <Skull className="w-4 h-4 text-white" strokeWidth={1.5} />}
                <span className="text-white text-sm font-semibold">
                  {preview.won ? "Win" : "Loss"}
                </span>
              </motion.div>
              <p className="text-[#a0a0b8] text-sm">
                Focus score <span className="text-white font-medium">{preview.focusScore}</span>
              </p>
              <p className="text-[#606078] text-xs mt-0.5">
                {preview.won
                  ? `${DAILY_LIMIT - minutes}m under daily limit`
                  : `${excess}m over daily limit`}
              </p>
            </div>
          </div>

          {/* Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#a0a0b8] text-sm font-medium">Social media time</p>
              <p className="text-white font-bold tabular-nums">{minutes}m</p>
            </div>
            <input
              type="range"
              min={5}
              max={180}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${
                  preview.won ? "#10b981" : "#ef4444"
                } ${((minutes - 5) / 175) * 100}%, rgba(255,255,255,0.1) ${((minutes - 5) / 175) * 100}%)`,
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-[#404058] text-xs">5m</span>
              <span className={`text-xs font-medium ${preview.won ? "text-emerald-400" : "text-[#404058]"}`}>
                limit {DAILY_LIMIT}m
              </span>
              <span className="text-[#404058] text-xs">3h</span>
            </div>
          </div>

          {/* Activity suggestions */}
          {suggestions && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4 mb-5">
              <p className="text-[#606078] text-xs uppercase tracking-wide font-medium mb-3">
                To compensate this day
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { key: "running", Icon: PersonStanding, label: "Run", color: "text-orange-400" },
                    { key: "reading", Icon: BookOpen, label: "Read", color: "text-blue-400" },
                    { key: "meditating", Icon: Brain, label: "Meditate", color: "text-emerald-400" },
                  ] as const
                ).map(({ key, Icon, label, color }) => (
                  <div key={key} className="text-center">
                    <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} strokeWidth={1.5} />
                    <p className="text-white font-bold text-sm">{suggestions[key]}m</p>
                    <p className="text-[#606078] text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { onSave(minutes); onClose(); }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-base shadow-xl shadow-violet-900/30"
          >
            {isToday ? "Apply to Today" : "Save Simulation"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Score Dot ────────────────────────────────────────────────────────────────

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
    : "bg-red-500/80 border-red-400/60";
  const ring = selected ? "ring-2 ring-white ring-offset-1 ring-offset-[#0a0a0f]" : "";

  return (
    <button
      onClick={onClick}
      className={`${sizeClass} ${color} ${ring} rounded-full border flex items-center justify-center font-bold text-white transition-all active:scale-90`}
    >
      {size !== "sm" && record.focusScore}
    </button>
  );
}

// Seeded pick: which friends reacted to a given day
function getReactingFriends(date: Date, selectedFriends: string[], count: number): string[] {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const shuffled = [...selectedFriends].sort((a, b) => {
    const ra = Math.sin(seed + Number(a)) * 10000;
    const rb = Math.sin(seed + Number(b)) * 10000;
    return (ra - Math.floor(ra)) - (rb - Math.floor(rb));
  });
  return shuffled.slice(0, count);
}

const WIN_REACTIONS = ["👍", "🙌", "🔥", "💪", "⭐️"];

// ─── Day Detail Card (read-only, shown after edit) ────────────────────────────

function DayDetailCard({
  record,
  selectedFriends,
  onEdit,
}: {
  record: DayRecord;
  selectedFriends: string[];
  onEdit: () => void;
}) {
  const isToday = isSameDay(record.date, new Date());
  const label = isToday
    ? "Today"
    : record.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  // Pick 1-2 friends who reacted, seeded by date
  const reactCount = Math.min(selectedFriends.length, record.focusScore > 80 ? 2 : 1);
  const reactingIds = record.won ? getReactingFriends(record.date, selectedFriends, reactCount) : [];
  const reactingFriends = reactingIds.map((id) => FRIENDS.find((f) => f.id === id)).filter(Boolean);

  // Pick an emoji per friend, seeded
  function emojiFor(id: string) {
    const seed = Number(id) + record.date.getDate();
    return WIN_REACTIONS[seed % WIN_REACTIONS.length];
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl p-4 mt-3 ${record.won ? "bg-emerald-950/20 border-emerald-500/15" : "bg-white/5 border-white/10"}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${record.won ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
          {record.won
            ? <Trophy className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />
            : <Skull className="w-6 h-6 text-red-400" strokeWidth={1.5} />}
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{label}</p>
          <p className="text-[#707088] text-xs mt-0.5">
            {record.socialMinutes}m social · Score {record.focusScore}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center"
        >
          <Pencil className="w-3.5 h-3.5 text-[#a0a0b8]" strokeWidth={1.5} />
        </button>
        <div className={`text-sm font-bold px-3 py-1 rounded-full ${record.won ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
          {record.won ? "W" : "L"}
        </div>
      </div>

      {/* Friend reactions for winning days */}
      {reactingFriends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-3 pt-3 border-t border-white/8 flex flex-col gap-2"
        >
          {reactingFriends.map((friend) => {
            if (!friend) return null;
            const emoji = emojiFor(friend.id);
            return (
              <div key={friend.id} className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${AVATAR_COLORS[friend.id]} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                  {friend.avatar}
                </div>
                <p className="text-[#a0a0b8] text-xs flex-1">
                  <span className="text-white font-medium">{friend.name.split(" ")[0]}</span>
                  {" reacted to your day"}
                </p>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2, stiffness: 300 }}
                  className="text-lg"
                >
                  {emoji}
                </motion.span>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({
  history,
  selectedFriends,
  onEditDay,
}: {
  history: DayRecord[];
  selectedFriends: string[];
  onEditDay: (record: DayRecord) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDay, setSelectedDay] = useState<DayRecord | null>(null);

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

  // Keep selectedDay in sync when history changes (e.g. after edit)
  const syncedSelected = selectedDay
    ? history.find((r) => isSameDay(r.date, selectedDay.date)) ?? null
    : null;

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
              const isSel = syncedSelected ? isSameDay(syncedSelected.date, rec.date) : isToday;
              return (
                <div key={rec.date.toISOString()} className="flex justify-center">
                  <ScoreDot
                    record={rec}
                    size="md"
                    selected={isSel}
                    onClick={() => setSelectedDay(rec)}
                  />
                </div>
              );
            })}
          </div>
        ))}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/8">
          {[["bg-emerald-500/80", "Won"], ["bg-red-500/80", "Lost"]].map(([cls, lbl]) => (
            <div key={lbl} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${cls}`} />
              <span className="text-[#606078] text-xs">{lbl}</span>
            </div>
          ))}
          <p className="ml-auto text-[#606078] text-xs">Tap dot to edit</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {syncedSelected && (
          <DayDetailCard
            key={syncedSelected.date.toISOString()}
            record={syncedSelected}
            selectedFriends={selectedFriends}
            onEdit={() => onEditDay(syncedSelected)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Month View ───────────────────────────────────────────────────────────────

function MonthView({
  history,
  selectedFriends,
  onEditDay,
}: {
  history: DayRecord[];
  selectedFriends: string[];
  onEditDay: (record: DayRecord) => void;
}) {
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

  const syncedSelected = selectedDay
    ? monthRecords.find((r) => isSameDay(r.date, selectedDay.date)) ?? null
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-white" strokeWidth={2} />
        </button>
        <p className="text-white font-semibold">{MONTH_LABELS[month]} {year}</p>
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
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const cellDate = new Date(year, month, dayNum);
            cellDate.setHours(0, 0, 0, 0);
            const rec = monthRecords.find((r) => r.date.getDate() === dayNum);
            const isFuture = cellDate > today;
            const isToday = isSameDay(cellDate, today);
            const isSelected = syncedSelected ? isSameDay(syncedSelected.date, cellDate) : false;

            if (isFuture) return (
              <div key={dayNum} className="flex items-center justify-center py-0.5">
                <div className="w-7 h-7 rounded-full bg-white/4 flex items-center justify-center">
                  <span className="text-[#404058] text-xs">{dayNum}</span>
                </div>
              </div>
            );

            if (!rec) return null;

            const dotColor = rec.won ? "bg-emerald-500" : "bg-red-500";

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(rec)}
                className="flex items-center justify-center py-0.5"
              >
                <div className={`w-7 h-7 rounded-full ${dotColor} flex items-center justify-center transition-all ${isSelected || isToday ? "ring-2 ring-white ring-offset-1 ring-offset-[#0a0a0f]" : "opacity-80"}`}>
                  <span className="text-white text-[10px] font-bold">{dayNum}</span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-center text-[#404058] text-xs mt-3">Tap a day to simulate</p>
      </div>

      <AnimatePresence mode="wait">
        {syncedSelected && (
          <DayDetailCard
            key={syncedSelected.date.toISOString()}
            record={syncedSelected}
            selectedFriends={selectedFriends}
            onEdit={() => onEditDay(syncedSelected)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Year View ────────────────────────────────────────────────────────────────

function YearView({
  history,
  selectedFriends,
  onEditDay,
}: {
  history: DayRecord[];
  selectedFriends: string[];
  onEditDay: (record: DayRecord) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, setYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayRecord | null>(null);

  const yearRecords = history.filter((r) => r.date.getFullYear() === year);
  const totalWins = yearRecords.filter((r) => r.won).length;
  const totalDays = yearRecords.length;
  const avgScore = totalDays ? Math.round(yearRecords.reduce((s, r) => s + r.focusScore, 0) / totalDays) : 0;
  const winRate = totalDays ? Math.round((totalWins / totalDays) * 100) : 0;
  const canGoForward = year < today.getFullYear();

  const syncedSelected = selectedDay
    ? yearRecords.find((r) => isSameDay(r.date, selectedDay.date)) ?? null
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { setSelectedMonth(null); setSelectedDay(null); setYear((y) => y - 1); }} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-white" strokeWidth={2} />
        </button>
        <p className="text-white font-semibold">{year}</p>
        <button
          onClick={() => { setSelectedMonth(null); setSelectedDay(null); setYear((y) => y + 1); }}
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
                onClick={() => { setSelectedDay(null); setSelectedMonth(isSelected ? null : mi); }}
                className={`rounded-2xl p-3 text-left transition-all border ${isSelected ? "bg-violet-500/20 border-violet-500/40" : isFuture ? "bg-white/3 border-white/5 opacity-40 cursor-not-allowed" : "bg-white/5 border-white/8 hover:border-white/20"}`}
              >
                <p className="text-[#a0a0b8] text-xs font-medium mb-2">{label}</p>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${winFrac >= 0.5 ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${winFrac * 100}%` }} />
                </div>
                {mAvg !== null ? (
                  <>
                    <p className="text-white font-bold text-base">{mAvg}</p>
                    <p className="text-[#606078] text-xs">{mWins}/{mTotal} W</p>
                  </>
                ) : <p className="text-[#404058] text-xs">No data</p>}
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
              <p className="text-white font-semibold mb-3">{MONTH_LABELS[selectedMonth]} {year}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {monthRecs.map((rec) => {
                  const isSel = syncedSelected ? isSameDay(syncedSelected.date, rec.date) : false;
                  return (
                    <button
                      key={rec.date.toISOString()}
                      title={`${rec.date.getDate()} — Score ${rec.focusScore}`}
                      onClick={() => setSelectedDay(rec)}
                      className={`w-5 h-5 rounded-full transition-all active:scale-90 ${rec.won ? "bg-emerald-500/80" : "bg-red-500/80"} ${isSel ? "ring-2 ring-white ring-offset-1 ring-offset-[#0a0a0f]" : ""}`}
                    />
                  );
                })}
              </div>
              <p className="text-[#a0a0b8] text-sm">
                Won <span className="text-white font-semibold">{mWins}</span> of{" "}
                <span className="text-white font-semibold">{monthRecs.length}</span> days · Avg{" "}
                <span className="text-violet-300 font-semibold">{mAvg}</span>
              </p>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {syncedSelected && (
          <DayDetailCard
            key={syncedSelected.date.toISOString()}
            record={syncedSelected}
            selectedFriends={selectedFriends}
            onEdit={() => onEditDay(syncedSelected)}
          />
        )}
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

export default function FocusCalendar({ activityOffset = 0 }: { activityOffset?: number }) {
  const { socialMediaMinutes, setSocialMediaMinutes, selectedFriends } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>("month");
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Per-day overrides: dateKey → socialMinutes (for past-day simulation)
  const [overrides, setOverrides] = useState<Record<string, number>>({});

  // Day currently open in the editor sheet
  const [editingRecord, setEditingRecord] = useState<DayRecord | null>(null);

  const todayDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Social minutes stay raw; activity offset only influences score/won for today
  const todayRecord = useMemo(
    () => buildRecord(todayDate, socialMediaMinutes, activityOffset),
    [todayDate, socialMediaMinutes, activityOffset]
  );

  // Merge overrides into history, then append live today
  const liveHistory = useMemo(() => {
    const patched = BASE_HISTORY.map((r) => {
      const key = dateKey(r.date);
      return key in overrides ? buildRecord(r.date, overrides[key]) : r;
    });
    return [...patched, todayRecord];
  }, [overrides, todayRecord]);

  const streak = calcStreak(liveHistory);

  const handleSave = useCallback((record: DayRecord, minutes: number) => {
    if (isSameDay(record.date, todayDate)) {
      setSocialMediaMinutes(minutes);
    } else {
      setOverrides((prev) => ({ ...prev, [dateKey(record.date)]: minutes }));
    }
  }, [todayDate, setSocialMediaMinutes]);

  const openEditor = useCallback((record: DayRecord) => {
    // Get the freshest version from liveHistory
    setEditingRecord(record);
  }, []);

  return (
    <div>
      {/* Header summary */}
      <div className="flex items-stretch gap-3 mb-5">
        <motion.div
          animate={{
            backgroundColor: todayRecord.won ? "rgba(6,78,59,0.2)" : "rgba(69,10,10,0.2)",
            borderColor: todayRecord.won ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
          }}
          transition={{ duration: 0.5 }}
          className="flex-1 rounded-2xl p-4 border cursor-pointer"
          onClick={() => setEditingRecord(todayRecord)}
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
            <motion.span animate={{ color: todayRecord.won ? "#6ee7b7" : "#fca5a5" }} className="text-xl font-bold">
              {todayRecord.won ? "You're winning!" : "You're losing"}
            </motion.span>
          </div>
          <p className="text-[#606078] text-xs mt-1">
            Score{" "}
            <motion.span key={todayRecord.focusScore} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-white font-medium">
              {todayRecord.focusScore}
            </motion.span>
            {" "}· {socialMediaMinutes}m social
            {activityOffset > 0 && (
              <>
                {" "}·{" "}
                <motion.span key={activityOffset} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="text-emerald-400 font-medium">
                  +{activityOffset}m activity
                </motion.span>
              </>
            )}
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
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${activeTab === tab.id ? "text-white" : "text-[#606078] hover:text-[#a0a0b8]"}`}
          >
            {activeTab === tab.id && (
              <motion.div layoutId="calTabBg" className="absolute inset-0 bg-white/10 rounded-xl" />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "week" && <WeekView history={liveHistory} selectedFriends={selectedFriends} onEditDay={openEditor} />}
          {activeTab === "month" && <MonthView history={liveHistory} selectedFriends={selectedFriends} onEditDay={openEditor} />}
          {activeTab === "year" && <YearView history={liveHistory} selectedFriends={selectedFriends} onEditDay={openEditor} />}
        </motion.div>
      </AnimatePresence>

      {/* Day editor sheet */}
      <AnimatePresence>
        {editingRecord && (
          <DayEditorSheet
            key={editingRecord.date.toISOString()}
            record={liveHistory.find((r) => isSameDay(r.date, editingRecord.date)) ?? editingRecord}
            isToday={isSameDay(editingRecord.date, todayDate)}
            onSave={(minutes) => handleSave(editingRecord, minutes)}
            onClose={() => setEditingRecord(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

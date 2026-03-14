import { motion } from "framer-motion";
import {
  Shield,
  PersonStanding,
  BookOpen,
  Brain,
  Users,
  TrendingUp,
  Smartphone,
  Trophy,
} from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const features = [
  {
    icon: Smartphone,
    title: "Screen time awareness",
    desc: "See exactly where your hours go — Instagram, TikTok, YouTube, Twitter.",
  },
  {
    icon: PersonStanding,
    title: "Fight back with habits",
    desc: "Replace scrolling with running, reading, or meditating. Smart suggestions adjust to your usage.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Users,
    title: "Accountability crew",
    desc: "Your friends get a gentle nudge when you've been scrolling too long.",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: TrendingUp,
    title: "Focus history",
    desc: "Track wins and losses across every day, week, month, and year.",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Trophy,
    title: "Win the day",
    desc: "Activity time offsets your excess. Beat social media at its own game.",
    gradient: "from-emerald-500 to-teal-500",
  },
];

const stats = [
  { value: "2h 24m", label: "avg daily social media" },
  { value: "4h 37m", label: "avg total screen time" },
  { value: "12%", label: "productive time lost" },
];

const activities = [
  { icon: PersonStanding, label: "Running", gradient: "from-orange-500 to-red-500" },
  { icon: BookOpen, label: "Reading", gradient: "from-blue-500 to-indigo-500" },
  { icon: Brain, label: "Meditating", gradient: "from-emerald-500 to-teal-500" },
];

export default function AdPage() {
  return (
    <div className="min-h-dvh bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-60 -left-60 w-[600px] h-[600px] bg-violet-700/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] bg-fuchsia-700/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-60 left-1/3 w-[400px] h-[400px] bg-blue-700/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="pt-20 pb-16 text-center">
          <motion.div {...fadeUp(0)} className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-violet-900/60">
                <Shield className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#0a0a0f]" />
            </div>
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-6xl font-bold tracking-tight mb-4 leading-none">
            Un
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Scroll
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="text-2xl font-medium text-[#a0a0b8] mb-4 leading-snug">
            Turn screen time into{" "}
            <span className="text-white">healthy habits.</span>
          </motion.p>

          <motion.p {...fadeUp(0.3)} className="text-[#606078] text-base leading-relaxed max-w-sm mx-auto">
            The average person spends 2h 24m a day on social media.
            Unscroll helps you fight back — one run, one book, one breath at a time.
          </motion.p>

          {/* Activity pills */}
          <motion.div {...fadeUp(0.4)} className="flex justify-center gap-3 mt-8">
            {activities.map(({ icon: Icon, label, gradient }) => (
              <div
                key={label}
                className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${gradient} shadow-lg`}
              >
                <Icon className="w-4 h-4 text-white" strokeWidth={1.5} />
                <span className="text-white text-sm font-medium">{label}</span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────── */}
        <motion.section {...fadeUp(0.5)} className="mb-16">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 grid grid-cols-3 gap-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-[#606078] text-xs mt-1 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Mockup: score card ───────────────────────────────── */}
        <motion.section {...fadeUp(0.55)} className="mb-16">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            {/* glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[#606078] text-xs uppercase tracking-widest font-medium">Today's focus score</p>
                <p className="text-5xl font-bold text-white mt-1">84</p>
                <p className="text-emerald-400 text-sm mt-1 font-medium">You're winning! 🏆</p>
              </div>
              {/* Ring */}
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="32"
                  fill="none"
                  stroke="url(#adGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.84)}`}
                />
                <defs>
                  <linearGradient id="adGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {/* Mini breakdown */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Social media", value: "52m", sub: "8m under limit", color: "text-emerald-400" },
                { label: "Running", value: "30m", sub: "logged today", color: "text-orange-400" },
                { label: "Reading", value: "20m", sub: "logged today", color: "text-blue-400" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="bg-white/5 rounded-2xl p-3 text-center">
                  <p className={`font-bold text-lg ${color}`}>{value}</p>
                  <p className="text-white text-xs font-medium mt-0.5">{label}</p>
                  <p className="text-[#606078] text-xs mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section className="mb-16">
          <motion.h2 {...fadeUp(0.6)} className="text-2xl font-bold text-center mb-8">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              fight back
            </span>
          </motion.h2>
          <div className="flex flex-col gap-4">
            {features.map(({ icon: Icon, title, desc, gradient }, i) => (
              <motion.div
                key={title}
                {...fadeUp(0.65 + i * 0.08)}
                className="flex items-start gap-4 bg-white/5 border border-white/8 rounded-2xl p-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${gradient ?? "from-violet-500 to-fuchsia-500"}`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-[#a0a0b8] text-sm mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Crew mockup ──────────────────────────────────────── */}
        <motion.section {...fadeUp(1.05)} className="mb-16">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <p className="text-[#606078] text-xs uppercase tracking-widest font-medium mb-4">Your accountability crew</p>
            <div className="flex flex-col gap-3">
              {[
                { initials: "AC", name: "Alex Chen", msg: "You're crushing it today! 👊", gradient: "from-violet-500 to-purple-600", time: "2m ago" },
                { initials: "MS", name: "Maria Silva", msg: "Keep going, you got this 🔥", gradient: "from-pink-500 to-rose-600", time: "14m ago" },
                { initials: "MT", name: "Michael Tam", msg: "Saw you logged a run 💪", gradient: "from-sky-500 to-blue-600", time: "1h ago" },
              ].map(({ initials, name, msg, gradient, time }) => (
                <div key={name} className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                    {initials}
                  </div>
                  <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-sm px-3 py-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-white text-xs font-semibold">{name}</p>
                      <p className="text-[#404058] text-xs">{time}</p>
                    </div>
                    <p className="text-[#a0a0b8] text-sm">{msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <motion.section {...fadeUp(1.15)} className="pb-20 text-center">
          <div className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/30 border border-violet-500/20 rounded-3xl p-10">
            <h2 className="text-3xl font-bold mb-3">
              Ready to{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                unscroll?
              </span>
            </h2>
            <p className="text-[#a0a0b8] mb-8 leading-relaxed">
              Build healthy habits, beat social media, and keep your
              focus score climbing — with your crew by your side.
            </p>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-4 rounded-2xl shadow-2xl shadow-violet-900/50">
              <Shield className="w-5 h-5 text-white" strokeWidth={1.5} />
              <span className="text-white font-semibold text-lg">Get Unscroll</span>
            </div>
            <p className="text-[#404058] text-xs mt-5">Free · Your data stays on-device</p>
          </div>
        </motion.section>

      </div>
    </div>
  );
}

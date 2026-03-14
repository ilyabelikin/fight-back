import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PersonStanding,
  BookOpen,
  Brain,
  Smartphone,
  MapPin,
  Clock,
  Users,
  Bell,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Zap,
  Calendar,
  X,
  Navigation,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { Activity } from "../../store/appStore";
import { AVATAR_COLORS, FRIENDS, useAppStore } from "../../store/appStore";
import FocusCalendar from "../ui/FocusCalendar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Event {
  id: string;
  title: string;
  type: Activity;
  location: string;
  address: string;
  time: string;
  duration: string;
  attendees: number;
  distance: string;
  description: string;
  friendsGoing: string[]; // friend IDs
  rsvped: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAILY_LIMIT = 60; // minutes considered "healthy"

const ACTIVITY_META: Record<
  Activity,
  { icon: ElementType; label: string; color: string; gradient: string; unit: string }
> = {
  running: {
    icon: PersonStanding,
    label: "Running",
    color: "text-orange-400",
    gradient: "from-orange-500 to-red-500",
    unit: "min",
  },
  reading: {
    icon: BookOpen,
    label: "Reading",
    color: "text-blue-400",
    gradient: "from-blue-500 to-indigo-500",
    unit: "min",
  },
  meditating: {
    icon: Brain,
    label: "Meditation",
    color: "text-emerald-400",
    gradient: "from-emerald-500 to-teal-500",
    unit: "min",
  },
};

const SOCIAL_APPS = [
  { name: "Instagram", icon: "📸", share: 0.35 },
  { name: "TikTok",    icon: "🎵", share: 0.30 },
  { name: "Twitter",   icon: "🐦", share: 0.20 },
  { name: "YouTube",   icon: "▶️", share: 0.15 },
];

const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Morning 5K Run",
    type: "running",
    location: "Central Park, NYC",
    address: "Reservoir Loop, Central Park, New York, NY 10024",
    time: "Tomorrow 7:00 AM",
    duration: "45 min",
    attendees: 34,
    distance: "0.4 mi",
    description:
      "A welcoming community run around the Reservoir. All paces welcome — we don't leave anyone behind. Bring water and good vibes.",
    friendsGoing: ["1", "3"],
    rsvped: false,
  },
  {
    id: "2",
    title: "Mindfulness Meditation Circle",
    type: "meditating",
    location: "The Assemblage, NYC",
    address: "114 E 25th St, New York, NY 10010",
    time: "Sat 9:00 AM",
    duration: "60 min",
    attendees: 12,
    distance: "1.1 mi",
    description:
      "A guided group meditation session focused on breathwork and body scanning. Great for beginners. Cushions provided.",
    friendsGoing: ["2"],
    rsvped: false,
  },
  {
    id: "3",
    title: "Book Club: Deep Work",
    type: "reading",
    location: "McNally Jackson Books",
    address: "52 Prince St, New York, NY 10012",
    time: "Sun 3:00 PM",
    duration: "90 min",
    attendees: 8,
    distance: "0.8 mi",
    description:
      "We're reading Cal Newport's Deep Work — a manifesto for focused, distraction-free productivity. Come with thoughts on chapters 1–4.",
    friendsGoing: ["2", "5"],
    rsvped: false,
  },
  {
    id: "4",
    title: "Trail Running Group",
    type: "running",
    location: "Riverside Park",
    address: "Riverside Dr & W 83rd St, New York, NY 10024",
    time: "Sat 8:30 AM",
    duration: "75 min",
    attendees: 21,
    distance: "1.5 mi",
    description:
      "Weekly trail run through Riverside Park along the Hudson. Expect hills, dirt paths, and great views. 5–8 km distance.",
    friendsGoing: ["1", "5", "6"],
    rsvped: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSuggestions(
  minutes: number,
  activities: Activity[]
): Record<Activity, number> {
  const excess = Math.max(0, minutes - DAILY_LIMIT);
  const perActivity = activities.length > 0 ? Math.ceil(excess / activities.length) : 0;
  const result = {} as Record<Activity, number>;
  for (const a of activities) result[a] = Math.max(5, Math.min(90, perActivity));
  return result;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#606078] mb-3">
      {children}
    </h3>
  );
}

function NotificationToast({
  friends,
  onClose,
}: {
  friends: string[];
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a2e] border border-violet-500/30 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-2xl shadow-violet-900/30 min-w-64 max-w-xs"
    >
      <Bell className="w-4 h-4 text-violet-400 shrink-0" strokeWidth={1.5} />
      <p className="text-sm text-white">
        <span className="text-violet-300 font-medium">{friends[0]}</span> was
        notified to check in on you!
      </p>
    </motion.div>
  );
}

const WIN_MESSAGES = [
  "You're crushing it today! 👊",
  "That's the spirit, keep going!",
  "So proud of you right now!",
  "You beat the scroll — legend!",
];

function WinningToast({
  friendName,
  friendAvatar,
  avatarGradient,
  onClose,
}: {
  friendName: string;
  friendAvatar: string;
  avatarGradient: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const message = WIN_MESSAGES[Math.floor(Date.now() / 1000) % WIN_MESSAGES.length];

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -80, opacity: 0 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0d1f14] border border-emerald-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl shadow-emerald-900/30 min-w-72 max-w-xs"
    >
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
        {friendAvatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-emerald-400 font-medium">{friendName}</p>
        <p className="text-sm text-white leading-snug">{message}</p>
      </div>
      <span className="text-xl shrink-0">👍</span>
    </motion.div>
  );
}

// ─── Event Detail Sheet ───────────────────────────────────────────────────────

function EventDetailSheet({
  event,
  selectedFriends,
  onClose,
}: {
  event: Event;
  selectedFriends: string[];
  onClose: () => void;
}) {
  const meta = ACTIVITY_META[event.type];
  const Icon = meta.icon;
  const [rsvped, setRsvped] = useState(event.rsvped);

  // Friends from the user's crew who are going
  const crewGoing = event.friendsGoing.filter((id) =>
    selectedFriends.includes(id)
  );
  const crewGoingFriends = crewGoing.map((id) =>
    FRIENDS.find((f) => f.id === id)
  ).filter(Boolean);

  // Other attendees not in your crew
  const othersCount = event.attendees - event.friendsGoing.length;

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Sheet */}
      <motion.div
        className="relative w-full max-w-md mx-auto bg-[#111118] border border-white/10 rounded-t-3xl overflow-hidden"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header gradient band */}
        <div className={`mx-4 mt-2 rounded-2xl bg-gradient-to-br ${meta.gradient} p-5 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium uppercase tracking-wide">
                  {meta.label}
                </p>
                <h2 className="text-white font-bold text-lg leading-tight mt-0.5">
                  {event.title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" strokeWidth={2} />
            </button>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              {event.time}
            </div>
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <Navigation className="w-4 h-4" strokeWidth={1.5} />
              {event.distance} away
            </div>
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              {event.duration}
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 pt-4 flex flex-col gap-5">
          {/* Location */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/6 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-[#a0a0b8]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{event.location}</p>
              <p className="text-[#606078] text-xs mt-0.5">{event.address}</p>
            </div>
            <button className="ml-auto text-violet-400">
              <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Description */}
          <p className="text-[#a0a0b8] text-sm leading-relaxed">
            {event.description}
          </p>

          {/* Friends going from your crew */}
          {crewGoingFriends.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#606078] mb-3">
                Friends going
              </p>
              <div className="flex flex-col gap-2.5">
                {crewGoingFriends.map((friend) => {
                  if (!friend) return null;
                  return (
                    <div key={friend.id} className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[friend.id]} flex items-center justify-center text-xs font-bold text-white`}
                      >
                        {friend.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {friend.name}
                        </p>
                        <p className="text-[#606078] text-xs">Going ✓</p>
                      </div>
                      <div className="text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Total attendees summary */}
          <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-3">
            <Users className="w-4 h-4 text-[#a0a0b8]" strokeWidth={1.5} />
            <p className="text-[#a0a0b8] text-sm">
              <span className="text-white font-medium">{event.attendees}</span>{" "}
              going
              {crewGoingFriends.length > 0 && (
                <>
                  {" "}
                  —{" "}
                  <span className="text-violet-300 font-medium">
                    {crewGoingFriends.length} {crewGoingFriends.length === 1 ? "friend" : "friends"} going
                  </span>
                  {othersCount > 0 && `, ${othersCount} others`}
                </>
              )}
            </p>
          </div>

          {/* RSVP button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setRsvped((v) => !v)}
            className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 ${
              rsvped
                ? "bg-white/8 border border-white/15 text-[#a0a0b8]"
                : `bg-gradient-to-r ${meta.gradient} text-white shadow-xl`
            }`}
          >
            {rsvped ? (
              <>
                <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
                You're going!
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />
                Join this event
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { socialMediaMinutes, setSocialMediaMinutes, selectedActivities, selectedFriends } =
    useAppStore();

  const [isSimulating, setIsSimulating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastFriends, setToastFriends] = useState<string[]>([]);
  const [showWinToast, setShowWinToast] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeTimer, setActiveTimer] = useState<Activity | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<Partial<Record<Activity, number>>>({});
  const simulateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevOverLimitRef = useRef<boolean>(false);

  // Total minutes logged across all activities (tap-to-add + real timer)
  const totalActivityDone = Object.values(completedActivities).reduce((s, v) => s + (v ?? 0), 0);

  // Social media time is always the raw truth — activity boosts the score instead
  const suggestions = getSuggestions(socialMediaMinutes, selectedActivities);
  const overLimit = socialMediaMinutes > DAILY_LIMIT;
  const excess = Math.max(0, socialMediaMinutes - DAILY_LIMIT);

  // Activity compensates excess for scoring purposes only
  const effectiveExcess = Math.max(0, excess - totalActivityDone);

  // Win = activity fully compensated the excess (or never went over)
  const isWinning = effectiveExcess <= 0;

  // Score reflects activity compensation — you scrolled, but you fought back
  const overallScore = Math.max(0, 100 - Math.floor((effectiveExcess / DAILY_LIMIT) * 100));

  const notifyFriends = (minutes: number) => {
    if (minutes > DAILY_LIMIT + 15 && selectedFriends.length > 0) {
      const friend = FRIENDS.find((f) => f.id === selectedFriends[0]);
      if (friend) {
        setToastFriends([friend.name]);
        setShowToast(true);
      }
    }
  };

  // Simulate social media usage
  const simulateUsage = () => {
    if (isSimulating) {
      setIsSimulating(false);
      if (simulateRef.current) clearInterval(simulateRef.current);
      return;
    }
    setIsSimulating(true);
    let localMinutes = socialMediaMinutes;
    simulateRef.current = setInterval(() => {
      localMinutes = Math.min(180, localMinutes + 1);
      setSocialMediaMinutes(localMinutes);
      notifyFriends(localMinutes);
      if (localMinutes >= 180) {
        setIsSimulating(false);
        clearInterval(simulateRef.current!);
      }
    }, 300);
  };

  const resetUsage = () => {
    if (simulateRef.current) clearInterval(simulateRef.current);
    setIsSimulating(false);
    setSocialMediaMinutes(38);
    setShowToast(false);
    setShowWinToast(false);
  };

  // Activity timer
  const startTimer = (activity: Activity) => {
    if (activeTimer === activity) {
      setActiveTimer(null);
      if (timerRef.current) clearInterval(timerRef.current);
      if (timerSeconds > 0) {
        const minutes = Math.ceil(timerSeconds / 60);
        setCompletedActivities((prev) => ({
          ...prev,
          [activity]: (prev[activity] ?? 0) + minutes,
        }));
      }
      setTimerSeconds(0);
      return;
    }
    if (activeTimer) {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimerSeconds(0);
    }
    setActiveTimer(activity);
    let secs = 0;
    timerRef.current = setInterval(() => {
      secs += 1;
      setTimerSeconds(secs);
    }, 1000);
  };

  // Fire winning toast when we cross from losing → winning (activity compensated the excess)
  useEffect(() => {
    if (!prevOverLimitRef.current && isWinning && totalActivityDone > 0 && selectedFriends.length > 0) {
      setShowWinToast(true);
    }
    prevOverLimitRef.current = !isWinning;
  }, [isWinning, totalActivityDone, selectedFriends]);

  useEffect(() => {
    return () => {
      if (simulateRef.current) clearInterval(simulateRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const filteredEvents = MOCK_EVENTS.filter((e) =>
    selectedActivities.includes(e.type)
  );

  return (
    <div className="min-h-dvh pb-12">
      <AnimatePresence>
        {showWinToast && (() => {
          const friend = FRIENDS.find((f) => f.id === selectedFriends[0]);
          if (!friend) return null;
          return (
            <WinningToast
              key="win-toast"
              friendName={friend.name}
              friendAvatar={friend.avatar}
              avatarGradient={AVATAR_COLORS[friend.id]}
              onClose={() => setShowWinToast(false)}
            />
          );
        })()}
        {showToast && (
          <NotificationToast
            friends={toastFriends}
            onClose={() => setShowToast(false)}
          />
        )}
        {selectedEvent && (
          <EventDetailSheet
            key={selectedEvent.id}
            event={selectedEvent}
            selectedFriends={selectedFriends}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-[#606078] text-sm">Good morning 👋</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">Dashboard</h1>
          </div>
          <div className="flex -space-x-2">
            {selectedFriends.slice(0, 3).map((id) => {
              const friend = FRIENDS.find((f) => f.id === id);
              if (!friend) return null;
              return (
                <div
                  key={id}
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${AVATAR_COLORS[id]} border-2 border-[#0a0a0f] flex items-center justify-center text-xs font-bold text-white`}
                >
                  {friend.avatar}
                </div>
              );
            })}
            {selectedFriends.length > 3 && (
              <div className="w-9 h-9 rounded-full bg-white/10 border-2 border-[#0a0a0f] flex items-center justify-center text-xs font-bold text-white">
                +{selectedFriends.length - 3}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="px-6 flex flex-col gap-6 max-w-md mx-auto">
        {/* Screen Time Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-3xl p-5 border ${
            overLimit
              ? "bg-red-950/20 border-red-500/20"
              : "bg-white/5 border-white/8"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#a0a0b8]" strokeWidth={1.5} />
              <span className="text-[#a0a0b8] text-sm font-medium">
                Social Media Today
              </span>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={resetUsage}
                className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#a0a0b8]" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={simulateUsage}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isSimulating
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-white/8 text-[#a0a0b8] border border-white/10"
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-3 h-3" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" /> Simulate
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <div className="flex items-end justify-between mb-3">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{socialMediaMinutes}</span>
              <span className="text-[#a0a0b8] text-lg ml-0.5">min</span>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${overLimit ? "text-red-400" : "text-emerald-400"}`}>
                {overLimit ? `+${excess}m over limit` : "Within limit"}
              </p>
              {totalActivityDone > 0 && (
                <p className="text-emerald-400 text-xs">+{totalActivityDone}m activity logged</p>
              )}
              <p className="text-[#606078] text-xs">Daily goal: {DAILY_LIMIT}m</p>
            </div>
          </div>

          {/* Progress bar — always shows real social media usage */}
          <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${Math.min(100, (socialMediaMinutes / 180) * 100)}%` }}
              transition={{ duration: 0.4 }}
              className={`h-full rounded-full ${
                overLimit
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
              }`}
            />
          </div>

          {/* App breakdown */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {SOCIAL_APPS.map((app) => {
              const appMin = Math.round(socialMediaMinutes * app.share);
              return (
                <div key={app.name} className="text-center">
                  <div className="text-lg mb-0.5">{app.icon}</div>
                  <motion.div
                    key={appMin}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    className="text-white text-xs font-medium"
                  >
                    {appMin}m
                  </motion.div>
                  <div className="text-[#606078] text-xs truncate">{app.name}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Unscroll! */}
        {overLimit && selectedActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <SectionHeader>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 inline" />
                Unscroll!
              </span>
            </SectionHeader>
            <div
              className={`grid gap-3 ${selectedActivities.length === 1 ? "grid-cols-1" : selectedActivities.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
            >
              {selectedActivities.map((activity) => {
                const meta = ACTIVITY_META[activity];
                const Icon = meta.icon;
                const suggested = suggestions[activity];
                const done = completedActivities[activity] ?? 0;
                const progress = Math.min(1, done / suggested);
                const isActive = activeTimer === activity;

                return (
                  <motion.div
                    key={activity}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setCompletedActivities((prev) => ({
                        ...prev,
                        [activity]: (prev[activity] ?? 0) + 10,
                      }))
                    }
                    className="bg-white/5 border border-white/8 rounded-3xl p-4 flex flex-col gap-3 cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {meta.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${meta.color}`}>
                        {suggested}m suggested
                      </p>
                    </div>

                    {/* Progress ring / bar */}
                    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${progress * 100}%` }}
                        className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`}
                      />
                    </div>
                    <p className="text-[#606078] text-xs">{done}m done</p>

                    {/* Timer button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); startTimer(activity); }}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? `bg-gradient-to-r ${meta.gradient} text-white`
                          : "bg-white/8 text-[#a0a0b8] hover:bg-white/12"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Pause className="w-3 h-3" />
                          {formatTime(timerSeconds)}
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          Start
                        </>
                      )}
                    </button>

                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Focus Score */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/8 rounded-3xl p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <SectionHeader>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-violet-400 inline" />
                  Focus Score
                </span>
              </SectionHeader>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-white">{overallScore}</span>
                <span className="text-[#a0a0b8] mb-1">/100</span>
              </div>
              <p className="text-[#707088] text-sm mt-1">
                {overallScore >= 80
                  ? "Great job! Keep it up 🎉"
                  : overallScore >= 50
                  ? "Getting there — keep unscrolling!"
                  : "Time to reclaim your focus 💪"}
              </p>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="6"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="url(#scoreGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  animate={{
                    strokeDashoffset: `${2 * Math.PI * 32 * (1 - overallScore / 100)}`,
                  }}
                  transition={{ duration: 0.6 }}
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Events */}
        {filteredEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <SectionHeader>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-400 inline" />
                Events Near You
              </span>
            </SectionHeader>
            <div className="flex flex-col gap-3">
              {filteredEvents.map((event) => {
                const meta = ACTIVITY_META[event.type];
                const Icon = meta.icon;
                const crewCount = event.friendsGoing.filter((id) =>
                  selectedFriends.includes(id)
                ).length;
                return (
                  <motion.div
                    key={event.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-white/5 border border-white/8 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm truncate">
                          {event.title}
                        </p>
                        {crewCount > 0 && (
                          <span className="shrink-0 px-1.5 py-0.5 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-300 text-xs font-medium">
                            {crewCount} {crewCount === 1 ? "friend" : "friends"} going
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-[#707088]">
                          <MapPin className="w-3 h-3" strokeWidth={1.5} />
                          {event.distance}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#707088]">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#707088]">
                          <Users className="w-3 h-3" strokeWidth={1.5} />
                          {event.attendees}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#404058] shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Accountability */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/8 rounded-3xl p-5"
        >
          <SectionHeader>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-violet-400 inline" />
              Your Crew
            </span>
          </SectionHeader>
          <div className="flex flex-wrap gap-3">
            {selectedFriends.map((id) => {
              const friend = FRIENDS.find((f) => f.id === id);
              if (!friend) return null;
              return (
                <div key={id} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[id]} flex items-center justify-center text-xs font-bold text-white`}
                  >
                    {friend.avatar}
                  </div>
                  <span className="text-sm text-[#a0a0b8]">{friend.name.split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[#606078] text-xs mt-3">
            They'll be notified if you scroll past your daily limit.
          </p>
        </motion.div>

        {/* Focus History Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <SectionHeader>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-violet-400 inline" />
              Focus History
            </span>
          </SectionHeader>
          <FocusCalendar activityOffset={totalActivityDone} />
        </motion.div>
      </div>
    </div>
  );
}

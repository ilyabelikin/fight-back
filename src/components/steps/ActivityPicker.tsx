import type { ElementType } from "react";
import { motion } from "framer-motion";
import { PersonStanding, BookOpen, Brain, ChevronRight } from "lucide-react";
import type { Activity } from "../../store/appStore";
import { useAppStore } from "../../store/appStore";

const activities: {
  id: Activity;
  label: string;
  description: string;
  icon: ElementType;
  gradient: string;
  glow: string;
  benefit: string;
}[] = [
  {
    id: "running",
    label: "Running",
    description: "Replace doom-scrolling with a runner's high",
    icon: PersonStanding,
    gradient: "from-orange-500 to-red-500",
    glow: "shadow-orange-900/50",
    benefit: "Burns energy, boosts mood",
  },
  {
    id: "reading",
    label: "Reading",
    description: "Feed your mind with real stories, not feeds",
    icon: BookOpen,
    gradient: "from-blue-500 to-indigo-500",
    glow: "shadow-blue-900/50",
    benefit: "Builds focus, expands thinking",
  },
  {
    id: "meditating",
    label: "Meditating",
    description: "Reclaim your attention, one breath at a time",
    icon: Brain,
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-900/50",
    benefit: "Reduces anxiety, sharpens clarity",
  },
];

export default function ActivityPicker() {
  const { selectedActivities, toggleActivity, setStep } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-10">
          <p className="text-violet-400 font-medium text-sm tracking-wide uppercase mb-2">
            Step 1 of 2
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            How will you unscroll?
          </h2>
          <p className="text-[#a0a0b8]">
            Choose one or more habits to replace your social media time. We'll
            suggest the right amount based on your usage.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          {activities.map(
            (
              { id, label, description, icon: Icon, gradient, glow, benefit },
              i
            ) => {
              const isSelected = selectedActivities.includes(id);
              return (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleActivity(id)}
                  className={`relative w-full text-left rounded-3xl p-5 border transition-all duration-300 ${
                    isSelected
                      ? `bg-gradient-to-br ${gradient} border-transparent shadow-2xl ${glow}`
                      : "bg-white/5 border-white/8 hover:border-white/20 hover:bg-white/8"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-white/20" : `bg-gradient-to-br ${gradient} opacity-80`
                      }`}
                    >
                      <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-lg">
                          {label}
                        </h3>
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm mt-0.5 ${isSelected ? "text-white/80" : "text-[#a0a0b8]"}`}
                      >
                        {description}
                      </p>
                      <p
                        className={`text-xs mt-1.5 font-medium ${isSelected ? "text-white/60" : "text-[#707088]"}`}
                      >
                        ✦ {benefit}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            }
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={selectedActivities.length === 0}
          onClick={() => setStep("friends")}
          className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
            selectedActivities.length > 0
              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-xl shadow-violet-900/40"
              : "bg-white/8 text-[#606078] cursor-not-allowed"
          }`}
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}

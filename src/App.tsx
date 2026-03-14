import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "./store/appStore";
import Welcome from "./components/steps/Welcome";
import ActivityPicker from "./components/steps/ActivityPicker";
import FriendSelector from "./components/steps/FriendSelector";
import Dashboard from "./components/steps/Dashboard";
import AdPage from "./components/AdPage";

const PAGE_VARIANTS = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function App() {
  const { step } = useAppStore();

  if (window.location.pathname === "/ad") {
    return <AdPage />;
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0f]">
      {/* Subtle background gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-700/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div key="welcome" {...PAGE_VARIANTS} transition={{ duration: 0.35 }}>
              <Welcome />
            </motion.div>
          )}
          {step === "activity" && (
            <motion.div key="activity" {...PAGE_VARIANTS} transition={{ duration: 0.35 }}>
              <ActivityPicker />
            </motion.div>
          )}
          {step === "friends" && (
            <motion.div key="friends" {...PAGE_VARIANTS} transition={{ duration: 0.35 }}>
              <FriendSelector />
            </motion.div>
          )}
          {step === "dashboard" && (
            <motion.div key="dashboard" {...PAGE_VARIANTS} transition={{ duration: 0.35 }}>
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

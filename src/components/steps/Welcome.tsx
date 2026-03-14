import { motion } from "framer-motion";
import { Shield, Smartphone, Clock, TrendingDown } from "lucide-react";
import { useAppStore } from "../../store/appStore";

const stats = [
  { icon: Clock, label: "Avg daily screen time", value: "4h 37m" },
  { icon: Smartphone, label: "Social media alone", value: "2h 24m" },
  { icon: TrendingDown, label: "Productive time lost", value: "43%" },
];

export default function Welcome() {
  const { grantScreenTime, setStep } = useAppStore();

  const handleAllow = () => {
    grantScreenTime();
    setTimeout(() => setStep("activity"), 600);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-2xl shadow-violet-900/50">
              <Shield className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#0a0a0f] animate-pulse" />
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Un
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Scroll
            </span>
          </h1>
          <p className="text-[#a0a0b8] text-lg leading-relaxed">
            Turn your screen time into an opportunity to build habits that
            actually matter.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center"
            >
              <Icon
                className="w-5 h-5 text-violet-400 mx-auto mb-2"
                strokeWidth={1.5}
              />
              <div className="text-white font-bold text-lg leading-tight">
                {value}
              </div>
              <div className="text-[#707088] text-xs mt-1 leading-tight">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Permission card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/20 flex items-center justify-center shrink-0">
              <Smartphone
                className="w-5 h-5 text-violet-400"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">
                Screen Time Access
              </h3>
              <p className="text-[#a0a0b8] text-sm leading-relaxed">
                Unscroll needs to read your screen time data to understand
                your social media habits and suggest the right counter-habits
                for you.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAllow}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold text-lg shadow-xl shadow-violet-900/40 hover:shadow-violet-900/60 transition-shadow"
        >
          Allow Screen Time Access
        </motion.button>
        <p className="text-center text-[#606078] text-xs mt-4">
          Your data stays on-device and is never shared without your permission.
        </p>
      </motion.div>
    </div>
  );
}

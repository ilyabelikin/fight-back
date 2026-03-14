import { motion } from "framer-motion";
import { Bell, CheckCircle2, ChevronRight, Users } from "lucide-react";
import { AVATAR_COLORS, FRIENDS, useAppStore } from "../../store/appStore";

const statusColors = {
  online: "bg-emerald-400",
  busy: "bg-amber-400",
  offline: "bg-[#404058]",
};

export default function FriendSelector() {
  const { selectedFriends, toggleFriend, setStep } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8">
          <p className="text-violet-400 font-medium text-sm tracking-wide uppercase mb-2">
            Step 2 of 2
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Who's got your back?
          </h2>
          <p className="text-[#a0a0b8]">
            Select friends to notify when you're overusing social media. They'll
            get a nudge to check in on you.
          </p>
        </div>

        {/* Accountability pill */}
        <div className="flex items-center gap-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl px-4 py-3 mb-6">
          <Bell className="w-4 h-4 text-violet-400 shrink-0" strokeWidth={1.5} />
          <p className="text-violet-300 text-sm">
            Friends get a gentle ping when you've been scrolling too long — no
            details, just a check-in.
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          {FRIENDS.map((friend, i) => {
            const isSelected = selectedFriends.includes(friend.id);
            return (
              <motion.button
                key={friend.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 + 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleFriend(friend.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "bg-violet-500/15 border-violet-500/40"
                    : "bg-white/5 border-white/8 hover:border-white/20"
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[friend.id]} flex items-center justify-center text-white font-bold text-sm`}
                  >
                    {friend.avatar}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${statusColors[friend.status]} border-2 border-[#0a0a0f]`}
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="font-semibold text-white">{friend.name}</p>
                  <p className="text-sm capitalize text-[#707088]">
                    {friend.status}
                  </p>
                </div>

                {/* Check */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? "text-violet-400"
                      : "text-[#404058]"
                  }`}
                >
                  <CheckCircle2 className="w-6 h-6" strokeWidth={1.5} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {selectedFriends.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-4"
          >
            <Users className="w-4 h-4 text-violet-400" strokeWidth={1.5} />
            <p className="text-violet-300 text-sm">
              {selectedFriends.length} friend
              {selectedFriends.length > 1 ? "s" : ""} will keep you accountable
            </p>
          </motion.div>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={selectedFriends.length === 0}
          onClick={() => setStep("dashboard")}
          className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
            selectedFriends.length > 0
              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-xl shadow-violet-900/40"
              : "bg-white/8 text-[#606078] cursor-not-allowed"
          }`}
        >
          Go to Dashboard
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        <button
          onClick={() => setStep("activity")}
          className="w-full text-center text-[#606078] text-sm mt-4 hover:text-[#a0a0b8] transition-colors"
        >
          ← Back
        </button>
      </motion.div>
    </div>
  );
}

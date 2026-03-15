import { create } from "zustand";

export type Activity = "running" | "reading" | "meditating";

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "busy";
  onApp: boolean;
  activities?: Activity[];
  avgOffsetMinutes?: number; // average daily minutes saved from social media
}

export interface AppState {
  step: "welcome" | "activity" | "friends" | "dashboard";
  screenTimeGranted: boolean;
  selectedActivities: Activity[];
  selectedFriends: string[];
  socialMediaMinutes: number;

  setStep: (step: AppState["step"]) => void;
  grantScreenTime: () => void;
  toggleActivity: (activity: Activity) => void;
  toggleFriend: (id: string) => void;
  setSocialMediaMinutes: (minutes: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  step: "welcome",
  screenTimeGranted: false,
  selectedActivities: [],
  selectedFriends: [],
  socialMediaMinutes: 38,

  setStep: (step) => set({ step }),
  grantScreenTime: () => set({ screenTimeGranted: true }),
  toggleActivity: (activity) =>
    set((s) => ({
      selectedActivities: s.selectedActivities.includes(activity)
        ? s.selectedActivities.filter((a) => a !== activity)
        : [...s.selectedActivities, activity],
    })),
  toggleFriend: (id) =>
    set((s) => ({
      selectedFriends: s.selectedFriends.includes(id)
        ? s.selectedFriends.filter((f) => f !== id)
        : [...s.selectedFriends, id],
    })),
  setSocialMediaMinutes: (minutes) => set({ socialMediaMinutes: minutes }),
}));

export const FRIENDS: Friend[] = [
  {
    id: "1",
    name: "Alex Chen",
    avatar: "AC",
    status: "online",
    onApp: true,
    activities: ["running", "reading"],
    avgOffsetMinutes: 42,
  },
  {
    id: "6",
    name: "Lena Müller",
    avatar: "LM",
    status: "offline",
    onApp: false,
  },
  {
    id: "8",
    name: "Sertaç Mustafaoglu",
    avatar: "SM",
    status: "online",
    onApp: true,
    activities: ["meditating"],
    avgOffsetMinutes: 48,
  },
  {
    id: "4",
    name: "Priya Nair",
    avatar: "PN",
    status: "offline",
    onApp: false,
  },
  {
    id: "2",
    name: "Maria Silva",
    avatar: "MS",
    status: "online",
    onApp: true,
    activities: ["meditating"],
    avgOffsetMinutes: 28,
  },
  {
    id: "7",
    name: "Michael Tam",
    avatar: "MT",
    status: "online",
    onApp: true,
    activities: ["running"],
    avgOffsetMinutes: 55,
  },
  {
    id: "3",
    name: "Jake Torres",
    avatar: "JT",
    status: "busy",
    onApp: true,
    activities: ["running"],
    avgOffsetMinutes: 67,
  },
  {
    id: "5",
    name: "Sam Wilson",
    avatar: "SW",
    status: "online",
    onApp: true,
    activities: ["reading"],
    avgOffsetMinutes: 35,
  },
];

export const AVATAR_COLORS: Record<string, string> = {
  "1": "from-violet-500 to-purple-600",
  "2": "from-pink-500 to-rose-600",
  "3": "from-amber-500 to-orange-600",
  "4": "from-teal-500 to-cyan-600",
  "5": "from-blue-500 to-indigo-600",
  "6": "from-emerald-500 to-green-600",
  "7": "from-sky-500 to-blue-600",
  "8": "from-red-500 to-orange-600",
};

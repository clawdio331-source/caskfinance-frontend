export type Day = {
  id: string;
  number: number;
  category: string;
  title: string;
  subtitle: string;
  released: boolean;
};

export const DAYS: Day[] = [
  {
    id: "01",
    number: 1,
    category: "SWAP ROUTING",
    title: "v3 vs v4: how a swap routes",
    subtitle: "click run. watch the swap path.",
    released: true
  },
  {
    id: "02",
    number: 2,
    category: "WHAT'S A HOOK",
    title: "where a hook fires",
    subtitle: "drop a hook on a lifecycle moment. run it.",
    released: false
  },
  {
    id: "03",
    number: 3,
    category: "10 HOOK MOMENTS",
    title: "the callbacks, the address, the bits",
    subtitle: "tick callbacks. watch the address light up.",
    released: false
  },
  {
    id: "04",
    number: 4,
    category: "WHAT EACH UNLOCKS",
    title: "match the hook moment to the use case",
    subtitle: "5 callbacks. 5 superpowers. pair them.",
    released: false
  },
  {
    id: "05",
    number: 5,
    category: "HOOK ADDRESSES",
    title: "decode a hook by its address",
    subtitle: "paste an address. see what fires.",
    released: false
  },
  {
    id: "06",
    number: 6,
    category: "WHAT'S NEW IN v4",
    title: "v3 or v4?",
    subtitle: "5 quickfire rounds. score at the end.",
    released: false
  }
];

export const dayById = (id: string) => DAYS.find((day) => day.id === id);
export const RELEASED_DAYS = DAYS.filter((day) => day.released);
export const isReleasedDayNumber = (dayNumber: number) =>
  DAYS.some((day) => day.number === dayNumber && day.released);

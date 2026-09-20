
// Types
export interface TimerTabItem {
  name: string;
  roomId: number;
  time: string;
 
}

// export interface HistoryItem {
//   img: string;
//   number: number;
// }

export interface ButtonConfig {
  className: string;
  bgColor: string;
  select: string;
  btnColor: string;
  label: string;
  number: number;
}

export interface BallConfig {
  bgColor: string;
  className: string;
  select: string;
  btnColor: string;
  icon: string;
  alt: string;
  number: number;
}

export interface LobbyTab {
  id: number;
  label: string;
  roomId: number;
}

// Data
export const timerTabData: TimerTabItem[] = [
  {
    name: "Lottery",
    roomId: 101,
    time: "30s",
  },
  {
    name: "Lottery",
    time: "1Min",
    roomId: 102,

  },
];






export const formatTimeAsArray = (_p0: Date, _p1: string, time: number | null): string[] => {
  if (time == null || time < 1) return ["0", "0", ":", "0", "1"];
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`.split("");
};

export const Lobbytabs: LobbyTab[] = [
  { id: 0, label: "Lottery 60s", roomId: 101 },
  { id: 1, label: "Lottery 3Min", roomId: 102 },
];

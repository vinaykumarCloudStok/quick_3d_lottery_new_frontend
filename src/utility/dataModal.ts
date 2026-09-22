
export interface QueryParams {
    id?: string;
    game_id?: string;
}
export interface Info {
  data: any;
  user_id: string;
  operator_id: string;
  balance: string;
}

export interface Message {
  message: string;
  eventName: string;
  data: Info;
}


export const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  // Pad with zeros to always show two digits
  const pad = (num: number) => num.toString().padStart(2, '0');

  return {
    hours: pad(hrs),
    minutes: pad(mins),
    seconds: pad(secs),
  };
};


export interface QueryParams {
    id?: string;
    game_id?: string;
}
export interface Info {
    urId: string;
    urNm: string;
    bl: number; // balance
    operatorId: string;
    avatar: number;
}
export const lobbyTabData = [
    {
        number: "1",
        text: "Minutes"
    },
    {
        number: "3",
        text: "Minutes"
    },
]
export interface ColorData {
    raw: string;
    lobbyId: string;
    lobbyIdWithDash: string;
    status: string;
    parsedLobbyData: string;
    parsedRoomId: string;
}

export interface InfoMessage {
    eventName: "info";
    data: {
        user_id: string;
        operator_id: string;
        balance: string; // or number if you prefer
  };
}

export interface SettlementMessage {
  eventName: "settlement";
    data: any; // Replace `any` with your settlement data type if available
}

export interface BetErrorMessage {
    eventName: "betError";
    data: any; // Replace `any` with your bet error data type if available
}

export type MessageEvent = InfoMessage | SettlementMessage | BetErrorMessage;
export const timerTabData = [
    {
        name: "Lottery",
        roomId: 101,
        time: "1Min",
    },
    {
        name: "Lottery",
        time: "3Min",
        roomId: 102,

    },
]

export const formatTimeAsArray = (totalSeconds: number): [string, string, string] => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return [
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(seconds).padStart(2, '0')
    ]
}
export interface ModalData {
    className: string;
    bgColor: string;
    select: string;
    number: number;
}
// Define a type for the button config
export type ColorButtonConfig = {
    className: string;
    bgColor: string;
    select: string;
    number: number;
};

// Create the array with the specific type



// Define the type for the ball config
export type BallConfig = {
    className: string;
    bgColor: string;
    select: string;
    number: number;
};





export interface Result {
    color: string;
    winningNumber: number;
    category: string;
  }
  export interface  betMessage{
    message:string
  }
  // Define the structure of a game history item
 export  interface GameHistoryItem {
    lobby_id: string;
    result: Result;
  }
  export interface HistoryItem {
    roundId: any;
    roomId: number;
    result: number;
  }

  export interface Ball {
    id: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }

export interface betMessage {
  status: string;
  message: string;
  // Add other properties relevant to bet messages
}

// New: Define BetItem interface for centralized bet management
export interface BetItem {
  id: string;
  type: "single" | "double" | "triple";
  selectedNumbers: string | string[]; // Can be string like "123" or array ["1", "2", "3"]
  amount: number;
  rawLabels?: string[]; // e.g., ["A"], ["A", "B"], ["A", "B", "C"]
  lobbyId?: string; // <-- ADD THIS PROPERTY
  // Add other properties if needed (e.g., quantity if x1 is not always true)
}

export interface BetPayload {
  lobbyId: string;
  bets: {
    cat: 1 | 2 | 3; // 1 for single, 2 for double, 3 for triple
    chip: string; // Formatted string like '0:A', '1:A-2:B', '1:A-2:B-3:C'
    amt: number;
  }[];
}

export function formatBalance(amount?: number | null): string {
    if (amount === undefined || amount === null) return '--';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  export interface betMessage {
    message: string
}

// interface ApiGameHistoryItem {
//     lobby_id: string;
//     result: {
//         a: number;
//         b: number;
//         c: number;
//     };
//     created_at: string; 
// }

// const formatCreatedAt = (timestamp: string) => {
//     const date = new Date(timestamp);
//     const options: Intl.DateTimeFormatOptions = {
//         month: 'long', 
//         day: 'numeric', 
//         hour: 'numeric', 
//         minute: 'numeric', 
//         hour12: true 
//     };
//     return date.toLocaleString('en-US', options);
// };

// export interface myHistoryItem {
//     bet_id: string;
//     lobby_id: string;
//     room_name: string;
//     created_at: string;
//     status: string; // e.g., "loss", "win"
//     total: number;
//     user_bets: {
//         btAmt: number;
//         chip: string; // e.g., "2:A"
//         winAmt: number;
//         mult: number;
//         status: string; // e.g., "win"
//         chip_count: Record<string, number>; // e.g., { "A": 2 }
//         is_valid_chip: boolean;
//     }[];
//     result: {
//         a: number;
//         b: number;
//         c: number;
//     };
// }

export interface myHistoryItem {
  btAmt: number;
  chip: string; // The raw chip string (e.g., "2:A")
  winAmt: number;
  mult: number;
  status: "loss" | "win" | string; // Use string if other statuses are possible
  lobby_id: string;
  result: {
    a: number;
    b: number;
    c: number;
  };
  created_at: string; // ISO 8601 date string

  // Properties added by the component's transformation for user_bets
  user_bets: Array<{
    chip_string: string; // Transformed 'chip' for individual bet details
    btAmt: number;
    mult: number;
    winAmt: number;
    status: "loss" | "win" | string;
  }>;
  total: number; // Derived from btAmt in your component
  room_name: string; // Hardcoded in your component
}

export interface LobbyHistory {
  [lobbyId: string]: HistoryItem;
};


export type LotteryData = {
  gameId: string;
  roomId: string;
  time: string;
  status: string;
};

export interface DiceResult {
  dice: number[];
  total: number;
  size: string;
  cat: string;
}


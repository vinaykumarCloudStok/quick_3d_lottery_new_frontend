import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Header from "../components/header/Header";
import { createSocket } from "../utility/newSocket";
import type { Socket } from "socket.io-client";
import RulesModal from "../modals/RulesModal";
import SingleDigit from "../components/betInfo/SingleDigit";
import DoubleDigitGame from "../components/betInfo/DoubleDigitGame";
import TripleDigitGame from "../components/betInfo/TripleDigitGame";
import History from "../components/history/History";
import BetPanel from "../components/betInfo/BetPanel";
import ThreeDigitGameHeader from "../components/threeDigit/ThreeDigitGameHeader";
import {
  lobbyTabData,
  type betMessage,
  type HistoryItem,
  type Info,
  type BetItem,
  type BetPayload,
} from "../utility/dataModal";
import "./home.css";
import Lottie from "lottie-react";
import animationData from "../assets/lottie/anime.json";
import LoaderSocket from "../components/loader/LoaderSocket";
import ErrorModal from "../modals/ErrorModal";
import DotLoader from "../components/loader/DotLoader";
import BetCloseModal from "../modals/BetCloseModal";
import NetworkIssues from "../components/network_Issue/network_issue";
import CashoutModal from "../modals/CashoutModal";
import RotateImage from "./RotateImage";
import { useAppContext } from "../context/SoundContext";
import { pauseCut, playCut } from "../utility/gameSetting";

type QueryParams = {
  [key: string]: string;
};

type ResultData = {
  roomId: number;
  result: any;
};

interface homeProps {
  shouldShowRotateImage: boolean;
}

const Home: React.FC<homeProps> = ({ shouldShowRotateImage }) => {
  const rawQuery = location.search.substring(1);
  const decodedQuery = decodeURIComponent(rawQuery);
  const { sound } = useAppContext();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [info, setInfo] = useState<Info | Record<string, any>>({});
  const [error, setError] = useState<string>("");
  const [errorModal, setErrorModal] = useState<boolean>(false);
  const [betClose, setBetClose] = useState<boolean>(false);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [lobbyTab, setLobbyTab] = useState<number>(0);
  const [loadModal, setLoadModal] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [, setParsedData] = useState<HistoryItem[]>([]);

  let queryParams: QueryParams = {};
  try {
    queryParams = JSON.parse(
      '{"' + decodedQuery.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
      (key, value) => (key === "" ? value : decodeURIComponent(value))
    );
  } catch (e) {
    console.error("Error parsing query parameters:", e);
    queryParams = {};
  }
  const [timers, setTimers] = useState<Record<string, string | null>>({});
  const [lobby, setLobby] = useState<Record<string, string>>({});
  const [lobbyIds, setLobbyIds] = useState<Record<string, string>>({});
  const [, setRoomIds] = useState<Record<string, string>>({});
  const [historyData] = useState<HistoryItem[]>([]);
  const [cashoutData, setCashoutData] = useState<any>(null);
  const [cashoutModal, setCashoutModal] = useState<boolean>(false);
  const [, setBetMessage] = useState<betMessage | null>(null);
  const [, setBetModal] = useState<boolean>(false);
  const [dotLoaderModals, setDotLoaderModals] = useState<
    Record<number, boolean>
  >({
    101: false,
    102: false,
    103: false,
  });
  const [currentBets, setCurrentBets] = useState<BetItem[]>([]);
  const [placedBets, setPlacedBets] = useState<BetItem[]>([]);
  const placedBetIdsRef = useRef<Set<string>>(new Set());
  const placedBetKeysRef = useRef<Set<string>>(new Set());
  const userBalance = info?.balance || 0;

  const [disabledRowsByLobby, setDisabledRowsByLobby] = useState<{
    [key: number]: string[];
  }>({
    101: [],
    102: [],
    103: [],
  });

  const [round101Result, setRound101Result] = useState<any>(null);
  const [round102Result, setRound102Result] = useState<any>(null);
  const [round103Result, setRound103Result] = useState<any>(null);

  const historyRef = useRef<HTMLDivElement>(null);
  const betPanelCartIconRef = useRef<HTMLDivElement>(null);

  const onScrollToBottom = useCallback(() => {
    if (historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const resetTimer = useCallback((lobbyId: string) => {
    setTimers((prevTimers) => {
      const updatedTimers: { [x: string]: string | null } = { ...prevTimers };
      if (lobbyId === "101") updatedTimers.firstTime = null;
      if (lobbyId === "102") updatedTimers.secondTime = null;
      if (lobbyId === "103") updatedTimers.thirdTime = null;
      return updatedTimers;
    });
  }, []);

  const resetModal = useMemo(() => {
    return [timers?.firstTime, timers?.secondTime, timers?.thirdTime][lobbyTab];
  }, [lobbyTab, timers]);

  const handleAddBet = (newBet: BetItem) => {
    setCurrentBets((prevBets) => [...prevBets, newBet]);
  };

  const handleDisableRow = (lobbyId: number, rowLabel: string) => {
    setDisabledRowsByLobby((prev) => {
      const updated = { ...prev };
      updated[lobbyId] = [...(updated[lobbyId] || []), rowLabel];
      return updated;
    });
  };

  const handleRemoveBet = (idToRemove: string) => {
    setCurrentBets((prevBets) =>
      prevBets.filter((bet) => bet.id !== idToRemove)
    );
  };

  const handleUpdateBet = (idToUpdate: string, selectedNumbers: string) => {
    setCurrentBets((prevBets) =>
      prevBets.map((bet) =>
        bet.id === idToUpdate ? { ...bet, selectedNumbers } : bet
      )
    );
  };

  const clearUnplacedBetsForLobby = useCallback((roomId: string | number) => {
    setCurrentBets((prevBets) =>
      prevBets.filter((bet) => String(bet.lobbyId) !== String(roomId))
    );
    const roomPrefix = `${String(roomId)}:`;
    placedBetKeysRef.current.forEach((key) => {
      if (key.startsWith(roomPrefix)) {
        placedBetKeysRef.current.delete(key);
      }
    });
  }, []);

  const convertBetItemToChip = (
    bet: BetItem
  ): { cat: 1 | 2 | 3; chip: string; amt: number } => {
    let cat: 1 | 2 | 3;
    let chip: string;

    switch (bet.type) {
      case "single":
        cat = 1;
        chip = `${bet.selectedNumbers}:${bet.rawLabels?.[0] || ""}`;
        break;
      case "double":
        cat = 2;
        let d1 = "",
          d2 = "";
        if (typeof bet.selectedNumbers === "string") {
          d1 = bet.selectedNumbers.charAt(0);
          d2 = bet.selectedNumbers.charAt(1);
        } else if (Array.isArray(bet.selectedNumbers)) {
          d1 = bet.selectedNumbers[0] || "";
          d2 = bet.selectedNumbers[1] || "";
        }
        chip = `${d1}:${bet.rawLabels?.[0] || ""}-${d2}:${
          bet.rawLabels?.[1] || ""
        }`;
        break;
      case "triple":
        cat = 3;
        let t1 = "",
          t2 = "",
          t3 = "";
        if (typeof bet.selectedNumbers === "string") {
          t1 = bet.selectedNumbers.charAt(0);
          t2 = bet.selectedNumbers.charAt(1);
          t3 = bet.selectedNumbers.charAt(2);
        } else if (Array.isArray(bet.selectedNumbers)) {
          t1 = bet.selectedNumbers[0] || "";
          t2 = bet.selectedNumbers[1] || "";
          t3 = bet.selectedNumbers[2] || "";
        }
        chip = `${t1}:${bet.rawLabels?.[0] || ""}-${t2}:${
          bet.rawLabels?.[1] || ""
        }-${t3}:${bet.rawLabels?.[2] || ""}`;
        break;
      default:
        console.warn("Unknown bet type encountered:", bet.type);
        cat = 1;
        chip = "error:invalid";
        break;
    }
    return { cat, chip, amt: bet.amount };
  };

  const handleConfirmAllBets = (betsToConfirm: BetItem[]) => {
    if (socket && betsToConfirm.length > 0) {
      const selectedLobbyId = String([101, 102, 103][lobbyTab]);
      const getBetKey = (bet: BetItem) =>
        `${selectedLobbyId}:${bet.type}:${String(bet.selectedNumbers)}:${(bet.rawLabels || []).join(",")}`;
      const batchKeys = new Set<string>();
      const newBets = betsToConfirm.filter(
        (bet) => {
          const key = getBetKey(bet);
          if (
            placedBetIdsRef.current.has(bet.id) ||
            placedBetKeysRef.current.has(key) ||
            batchKeys.has(key)
          ) {
            return false;
          }
          batchKeys.add(key);
          return true;
        }
      );

      if (newBets.length === 0) {
        setCurrentBets([]);
        return;
      }

      const lobbyIdKeys = ["lobbyData101", "lobbyData102", "lobbyData103"];
      const selectedLobbyIdKey = lobbyIdKeys[lobbyTab];
      const currentLobbyId = lobbyIds[selectedLobbyIdKey];

      if (!currentLobbyId) {
        console.error("Lobby ID not found for current tab:", lobbyTab);
        alert("Game lobby not ready. Please wait or try again.");
        return;
      }

      const formattedBets = newBets.map(convertBetItemToChip);

      const betPayload: BetPayload = {
        lobbyId: currentLobbyId,
        bets: formattedBets,
      };

      console.log("Sending bet payload:", betPayload);
      socket.emit("bet", betPayload);

      newBets.forEach((bet) => placedBetIdsRef.current.add(bet.id));
      newBets.forEach((bet) => placedBetKeysRef.current.add(getBetKey(bet)));
      setPlacedBets((prevBets) => [...prevBets, ...newBets]);

      setBetModal(true);
      setTimeout(() => setBetModal(false), 3000);

      // setInfo((prevInfo) => ({
      //   ...prevInfo,
      //   balance: (prevInfo.balance || 0) - totalAmount,
      // }));

      setCurrentBets([]);
    } else {
      if (!socket) {
        console.warn("Socket not connected. Cannot place bets.");
        alert(
          "Network issue: Cannot connect to the game server. Please try again."
        );
      } else if (betsToConfirm.length === 0) {
        console.warn("No bets to confirm.");
      }
    }
  };

  const hasDuplicateBets = useCallback((bets: BetItem[]) => {
    const lobbyId = String([101, 102, 103][lobbyTab]);
    const keys = new Set<string>();

    return bets.some((bet) => {
      const key = `${lobbyId}:${bet.type}:${String(bet.selectedNumbers)}:${(bet.rawLabels || []).join(",")}`;
      if (keys.has(key) || placedBetKeysRef.current.has(key)) {
        return true;
      }
      keys.add(key);
      return false;
    });
  }, [lobbyTab]);

  useEffect(() => {
    if (!queryParams.id || !queryParams.game_id) {
      console.warn("Missing query parameters for socket connection.");
      setLoading(false);
      return;
    }

    const socketInstance = createSocket(queryParams.id, queryParams.game_id);
    setSocket(socketInstance);

    const handleSocketConnect = () => {
      setSocketConnected(true);
      setLoading(false);
    };

    const handleSocketDisconnect = () => {
      setSocketConnected(false);
    };

    const updateTimers = (
      room: string,
      lobbyIdWithDash: string,
      parsedLobbyData: string,
      lobbyID: string
    ) => {
      const timerConfig: Record<
        string,
        {
          timeSetter: string;
          dataSetter: string;
          roomSetter: string;
          lobbySetter: string;
        }
      > = {
        "101": {
          timeSetter: "firstTime",
          dataSetter: "parsedData101",
          roomSetter: "roomData101",
          lobbySetter: "lobbyData101",
        },
        "102": {
          timeSetter: "secondTime",
          dataSetter: "parsedData102",
          roomSetter: "roomData102",
          lobbySetter: "lobbyData102",
        },
        "103": {
          timeSetter: "thirdTime",
          dataSetter: "parsedData103",
          roomSetter: "roomData103",
          lobbySetter: "lobbyData103",
        },
      };

      const { timeSetter, dataSetter, roomSetter, lobbySetter } =
        timerConfig[room] || {};

      if (timeSetter) {
        setTimers((prev) => ({ ...prev, [timeSetter]: lobbyIdWithDash }));
        setLobby((prev) => ({ ...prev, [dataSetter]: parsedLobbyData }));
        setLobbyIds((prev) => ({ ...prev, [lobbySetter]: lobbyID }));
        setRoomIds((prev) => ({ ...prev, [roomSetter]: room }));
      }
    };

    const handleColorEvent = (data: string) => {
      try {
        const [lobbyId, lobbyIdWithDash] = data.split(":");
        const [parsedLobbyData, parsedRoomId] = lobbyId.split("-");
        if (/RESULT|ENDED/.test(data)) {
          setLoadModal(false);
          setDotLoaderModals((prev) => ({ ...prev, [parsedRoomId]: true }));
          resetTimer(parsedRoomId);
          clearUnplacedBetsForLobby(parsedRoomId);
        } else {
          setDotLoaderModals((prev) => ({ ...prev, [parsedRoomId]: false }));
          updateTimers(parsedRoomId, lobbyIdWithDash, parsedLobbyData, lobbyId);
        }
      } catch (err) {
        console.error("Error parsing lottery event message:", err);
      }
    };

    const handleInfo = (data: any) => {
      if (data?.eventName === "info") {
        setInfo(data?.data as Info);
        setLoading(false);
      }
    };

    const handleBetMessage = (data: any) => {
      if (data?.eventName === "bet") {
        setBetMessage(data.data);
      }
    };

    const handleCashout = (data: any) => {
      if (data?.eventName === "settlement") {
        setCashoutData(data.data);
        setCashoutModal(true);
        setTimeout(() => setCashoutModal(false), 5000);
      }
    };

    const handleError = (data: any) => {
      if (data?.eventName === "betError") {
        setError(data.data);
        setErrorModal(true);
        setBetClose(false);
        setLoadModal(false);
        setBetModal(false);
      }
    };

    // Correctly handles historical round results and updates state
    socketInstance.on("roundHistory", (data: any) => {
      data.forEach((item: any) => {
        try {
          const parsedResult = JSON.parse(item.result);
          switch (item.room_id) {
            case 101:
              setRound101Result(parsedResult);
              break;
            case 102:
              setRound102Result(parsedResult);
              break;
            case 103:
              setRound103Result(parsedResult);
              break;
            default:
              console.warn("Unhandled room_id:", item.room_id);
          }
        } catch (error) {
          console.error(
            "Failed to parse result for room_id:",
            item.room_id,
            error
          );
        }
      });
    });

    // ✅ CORRECTED: This handler will reset disabled rows for the specific room that receives a result.
    socketInstance.on("history", (rawData: string) => {
      try {
        const parsed: ResultData = JSON.parse(rawData);
        const roomId = parsed.roomId;

        // Reset the disabled rows for the specific room that just got a result.
        setDisabledRowsByLobby(prev => ({
          ...prev,
          [roomId]: [],
        }));
        setPlacedBets((prevBets) =>
          prevBets.filter((bet) => String(bet.lobbyId) !== String(roomId))
        );
        clearUnplacedBetsForLobby(roomId);

        // Update the result state for the specific room
        switch (roomId) {
          case 101:
            setRound101Result(parsed.result);
            break;
          case 102:
            setRound102Result(parsed.result);
            break;
          case 103:
            setRound103Result(parsed.result);
            break;
          default:
            console.warn("Unknown roomId received:", roomId);
        }
      } catch (error) {
        console.error("Failed to parse result data:", error);
      }
    });

    socketInstance.on("connect", handleSocketConnect);
    socketInstance.on("disconnect", handleSocketDisconnect);
    socketInstance.on("lottery", handleColorEvent);
    socketInstance.on("message", handleInfo);
    socketInstance.on("message", handleCashout);
    socketInstance.on("message", handleBetMessage);
    socketInstance.on("message", handleError);
    return () => {
      socketInstance.off("connect", handleSocketConnect);
      socketInstance.off("disconnect", handleSocketDisconnect);
      socketInstance.off("lottery", handleColorEvent);
      socketInstance.off("message", handleInfo);
      socketInstance.off("message", handleCashout);
      socketInstance.off("message", handleBetMessage);
      socketInstance.off("message", handleError);
      socketInstance.disconnect();
    };
  }, [queryParams.id, queryParams.game_id, resetTimer, clearUnplacedBetsForLobby]);

  const handleLobbyTab = (i: number) => {
    setLobbyTab(i);
  };

  useEffect(() => {
    setParsedData(historyData);
  }, [historyData]);

  useEffect(() => {
    if (resetModal === "3") {
      setLoadModal(true);
      if (sound) {
        playCut();
      }
      const timer = setTimeout(() => {
        setLoadModal(false);
        if (sound) {
          pauseCut();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (resetModal === "5") {
      clearUnplacedBetsForLobby([101, 102, 103][lobbyTab]);
      setBetClose(true);
      const closeBetCloseTimer = setTimeout(() => {
        setBetClose(false);
      }, 3000);
      return () => clearTimeout(closeBetCloseTimer);
    }
  }, [resetModal, sound, lobbyTab, clearUnplacedBetsForLobby]);

  const currentRoundResult = useMemo(() => {
    switch (lobbyTab) {
      case 0:
        return round101Result;
      case 1:
        return round102Result;
      case 2:
        return round103Result;
      default:
        return null;
    }
  }, [lobbyTab, round101Result, round102Result, round103Result]);

  const getBetPanelTargetPosition = useCallback(() => {
    if (betPanelCartIconRef.current) {
      return betPanelCartIconRef.current.getBoundingClientRect();
    }
    return null;
  }, []);

  const isBettingDisabled = useMemo(() => {
    return resetModal === "5";
  }, [resetModal]);

  if (loading || !socketConnected) {
    return <LoaderSocket />;
  }

  return (
    <>
      {shouldShowRotateImage ? (
        <RotateImage />
      ) : (
        <div className="game-container">
          {loadModal && (
            <div className="overlay" style={{ zIndex: "1000" }}>
              <Lottie
                animationData={animationData}
                loop
                autoplay
                style={{ width: "350px", height: "350px" }}
              />
            </div>
          )}
          {errorModal && (
            <ErrorModal
              error={error}
              setErrorModal={setErrorModal}
              errorModal={errorModal}
            />
          )}
          {dotLoaderModals[[101, 102, 103][lobbyTab]] && (
            <DotLoader
              onClose={() =>
                setDotLoaderModals((prev) => ({
                  ...prev,
                  [[101, 102, 103][lobbyTab]]: false,
                }))
              }
            />
          )}
          {betClose && (
            <BetCloseModal betClose={betClose} setBetClose={setBetClose} />
          )}
          {cashoutModal && (
            <CashoutModal
              cashoutData={cashoutData}
              cashoutModal={cashoutModal}
              setCashoutModal={setCashoutModal}
            />
          )}

          <ThreeDigitGameHeader info={info} queryParams={queryParams} />

          <div className="game-info">
            <NetworkIssues />
            <div className="game-info-body">
              <div className="lobby-tab-container">
                <div className="lobby-tab-content">
                  {lobbyTabData.map((el, i) => (
                    <div
                      key={i}
                      className={`lobby-tab ${
                        lobbyTab === i ? "lobby-tab-active" : ""
                      }`}
                      onClick={() => handleLobbyTab(i)}
                    >
                      <span
                        className={`number ${
                          lobbyTab === i ? "number-active" : ""
                        }`}
                      >
                        {el?.number}
                      </span>
                      <p
                        className={`minutes ${
                          lobbyTab === i ? "m-active" : ""
                        }`}
                      >
                        {el?.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {[101, 102].map((id, index) =>
                lobbyTab === index ? (
                  <Header
                    key={id}
                    lobby={lobby}
                    id={id}
                    timers={timers}
                    lobbyTab={lobbyTab}
                    // @ts-ignore
                    historyData={historyData}
                    onOpenRules={() => setShowRules(true)}
                    onOpenHistory={onScrollToBottom}
                    roundResult={currentRoundResult}
                  />
                ) : null
              )}

              <div className="game-info-content">
                <SingleDigit
                  onPlaceBet={handleAddBet}
                  userBalance={userBalance}
                  resetModal={resetModal}
                  getBetPanelTargetPosition={getBetPanelTargetPosition}
                  isBettingDisabled={isBettingDisabled}
                  lobbyId={[101, 102, 103][lobbyTab]}
                  disabledRows={
                    disabledRowsByLobby[[101, 102, 103][lobbyTab]] || []
                  }
                  onDisableRow={handleDisableRow}
                />
                <DoubleDigitGame
                  onPlaceBet={handleAddBet}
                  userBalance={userBalance}
                  resetModal={resetModal}
                  getBetPanelTargetPosition={getBetPanelTargetPosition}
                  isBettingDisabled={isBettingDisabled}
                  lobbyId={[101, 102, 103][lobbyTab]}
                  disabledRows={
                    disabledRowsByLobby[[101, 102, 103][lobbyTab]] || []
                  }
                  onDisableRow={handleDisableRow}
                />
                <TripleDigitGame
                  onPlaceBet={handleAddBet}
                  userBalance={userBalance}
                  resetModal={resetModal}
                  getBetPanelTargetPosition={getBetPanelTargetPosition}
                  isBettingDisabled={isBettingDisabled}
                  lobbyId={[101, 102, 103][lobbyTab]}
                  disabledRows={
                    (disabledRowsByLobby[[101, 102, 103][lobbyTab]] as string[]) || []
                  }
                  onDisableRow={handleDisableRow}
                />
              </div>
            </div>
            <History
              ref={historyRef}
              historyData={historyData}
              timers={timers}
              info={info}
              id={[101, 102, 103][lobbyTab]}
              lobbyIds={lobbyIds}
              lobbyTab={lobbyTab}
              placedBets={placedBets}
            />
          </div>
          <BetPanel
            currentBets={currentBets}
            onRemoveBet={handleRemoveBet}
            onUpdateBet={handleUpdateBet}
            onDeleteAllBets={() => setCurrentBets([])}
            onConfirmBets={handleConfirmAllBets}
            userBalance={userBalance}
            animationTargetRef={betPanelCartIconRef}
            isBettingDisabled={isBettingDisabled}
            hasDuplicateBets={hasDuplicateBets}
          />
        </div>
      )}

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </>
  );
};

export default Home;
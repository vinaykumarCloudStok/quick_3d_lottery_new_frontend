import  { useCallback, useEffect, useRef, useState, forwardRef } from "react";
import { getCaller } from "../../utility/api";
import "./history.css";
import LoadingComponent from "../loader/LoadingComponent";
import OrderData from "./OrderData";
import { timerTabData, type HistoryItem, type BetItem } from "../../utility/dataModal";

interface listProp {
  lobbyTab: number;
  historyData: HistoryItem[];
  timers: Record<string, string | null>;
  info: Record<string, any>;
  id: number;
  lobbyIds: Record<string, any>;
  placedBets: BetItem[];
}


interface ApiGameHistoryItem {
  lobby_id: string;
  result: {
    a: number;
    b: number;
    c: number;
  };
  created_at: string;
}

const History = forwardRef<HTMLDivElement, listProp>(
  ({ lobbyTab, info, historyData, id, lobbyIds, placedBets }, ref) => {
    const [gameHistory, setGameHistory] = useState<ApiGameHistoryItem[]>([]);
    const [gameLoading, setGameLoading] = useState(true);
    const [startIndex, setStartIndex] = useState(10);
    const activeRequest = useRef<string | null>(null);
    const activeRoomId = timerTabData[lobbyTab]?.roomId;
    const newLobbyIds = lobbyIds[`lobbyData${id}`];
    const loadCount = 10;
    const tabListData = [
      { name: "Current Bets" },
      { name: "My Order" },
      { name: "Result History" },
    ];
    const [betListTab, setBetListTab] = useState<number>(0);

    const handleList = (i: number) => {
      setBetListTab(i);
      setStartIndex(10);
    };

    const getGameHistory = useCallback(async (roomId: number, limit = 10) => {
      const requestKey = `${roomId}:${limit}`;
      if (activeRequest.current === requestKey) return;

      activeRequest.current = requestKey;
      setGameLoading(true);
      try {
        const res = await getCaller(`lobby-details?lobby_id=${roomId}&limit=${limit}`);
        const newData: ApiGameHistoryItem[] = (res?.data || []).map((item: any) => ({
          ...item,
          result: typeof item.result === "string" ? JSON.parse(item.result) : item.result,
          created_at: item.created_at || item.bet_created_at,
        }));
        setGameHistory(newData);
      } catch (error) {
        console.error("Failed to fetch result history:", error);
        setGameHistory([]);
      } finally {
        activeRequest.current = null;
        setGameLoading(false);
      }
    }, []);

    const getResultDetails = (result: { a: number; b: number; c: number }) => {
      const winningNumber = (result.a + result.b + result.c) % 10;
      let color = "Red";
      if (winningNumber === 0 || winningNumber === 5) {
        color = winningNumber === 0 ? "Green-Violet" : "Red-Violet";
      } else if (winningNumber % 2 === 0) {
        color = "Red";
      } else {
        color = "Green";
      }
      return { winningNumber, color };
    };

    const formatCreatedAt = (timestamp: string) => {
      const date = new Date(timestamp);
      return date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    };

    useEffect(() => {
      if (activeRoomId !== undefined && activeRoomId !== null) {
        getGameHistory(activeRoomId, loadCount);
      }
    }, [activeRoomId, loadCount, getGameHistory]);

    useEffect(() => {
      if (historyData.length > 0 && activeRoomId !== undefined && activeRoomId !== null) {
        const timer = setTimeout(() => {
          getGameHistory(activeRoomId, loadCount);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }, [historyData, activeRoomId, loadCount, getGameHistory]);

    const loadMoreData = () => {
      const nextStartIndex = startIndex + loadCount;
      getGameHistory(activeRoomId, nextStartIndex);
      setStartIndex(nextStartIndex);
    };

    return (
      <div className="bet-list" ref={ref}>
        <div className="bet-list-tab">
          <div className="bet-list-tab-body">
            {tabListData.map((el, i) => (
              <button
                key={i}
                onClick={() => handleList(i)}
                className={`list-tab ${betListTab === i ? "list-tab-active" : ""}`}
              >
                {betListTab === i && <span className="list-tab-span"></span>}
                <div className={`list-text ${betListTab === i ? "list-text-active" : ""}`}>
                  {el.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {betListTab === 2 && (
          <div className="bet-table-container">
            <div className="bet-table-container-body">
              <div className="bet-table-result">
                <div className="table-header">
                  <div className="table-header-body">
                    <div className="th-head-one">Issue</div>
                    <div className="th-head-two">Time</div>
                    <div className="th-head-three">Number</div>
                  </div>
                </div>

                {gameLoading ? (
                  <LoadingComponent />
                ) : gameHistory.length > 0 ? (
                  gameHistory.map((item, index) => {
                    const { color } = getResultDetails(item.result);
                    return (
                      <div className="table-row-container" key={index}>
                        <div className="table-row-body">
                          <div className="row-one">{item.lobby_id}</div>
                          <div className="created-name">
                            {formatCreatedAt(item.created_at)}
                          </div>
                          <div
                            className={`row-two ${
                              color === "Green" || color === "Green-Violet"
                                ? "green-text"
                                : "red-text"
                            }`}
                          >
                            <div className="abc-circles-container">
                              <span className="value-circle red-circle">{item.result.a}</span>
                              <span className="value-circle orange-circle">{item.result.b}</span>
                              <span className="value-circle blue-circle">{item.result.c}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="history-empty-state">No results available</div>
                )}
              </div>

              {!gameLoading && gameHistory.length > 0 && (
                <div className="show-more-data" onClick={loadMoreData}>
                  <button className="show-more">Show More</button>
                </div>
              )}
            </div>
          </div>
        )}

        {betListTab === 1 && (
          <OrderData
            newLobbyIds={newLobbyIds}
            historyData={historyData}
            info={info}
            lobbyTab={lobbyTab}
            placedBets={placedBets.filter((bet) => String(bet.lobbyId) === String(activeRoomId))}
          />
        )}

        {betListTab === 0 && (
          <div className="bet-table-container current-bets-tab">
            {placedBets.filter((bet) => String(bet.lobbyId) === String(activeRoomId)).length > 0 ? (
              placedBets
                .filter((bet) => String(bet.lobbyId) === String(activeRoomId))
                .map((bet) => (
                  <div className="table-row-container" key={bet.id}>
                    <div className="table-row-body">
                      <div className="row-one">{bet.type.toUpperCase()}</div>
                      <div className="created-name">{String(bet.selectedNumbers)}</div>
                      <div className="row-two">{bet.amount.toFixed(2)}</div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="history-empty-state">No bets placed</div>
            )}
          </div>
        )}
      </div>
    );
  }
);

export default History;

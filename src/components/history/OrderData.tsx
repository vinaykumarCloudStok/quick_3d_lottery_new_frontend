import React, { useEffect, useState } from "react";
import "./order.css"; // Ensure this path is correct
import { getCaller } from "../../utility/api"; // Ensure this path is correct
import { timerTabData, type HistoryItem } from "../../utility/dataModal"; // Assuming timerTabData is correctly imported
import { icon } from "../../utility/icon"; // Assuming 'icon' object has a 'noData' property

interface mylistProp {
  historyData: HistoryItem[];
  info: Record<string, any>;
  lobbyTab: number;
  newLobbyIds: any;
}

const parseChipData = (chipString: string) => {
  if (!chipString) return [];
  return chipString.split("-").map((chip) => {
    const [value, category] = chip.split(":");
    return { value: parseInt(value, 10), category };
  });
};

const getChipCircleClass = (category: string) => {
  switch (category) {
    case "A":
      return "red-order";
    case "B":
      return "orange-order";
    case "C":
      return "blue-order";
    default:
      return "default-order";
  }
};

const parseJson = <T,>(value: T | string, fallback: T): T => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const OrderData: React.FC<mylistProp> = ({ info, historyData, lobbyTab }) => {
  const [myBetLoading, setMyBetLoading] = useState(true);
  const [gameLoading, setGameLoading] = useState(false);
  const [myBetData, setMyBetData] = useState<any[]>([]);
  // Changed the type to string | number because index will be a number
  const [openAccordionKey, setOpenAccordionKey] = useState<string | null>(null); // Only store the key of the currently open accordion

  const [currentLoadCount, setCurrentLoadCount] = useState(10);

  const activeRoomId = timerTabData[lobbyTab]?.roomId;

  const lobbyTypeText =
    activeRoomId === 101
      ? "Quick 3D 1 min"
      : activeRoomId === 102
      ? "Quick 3D 3 min"
      : "Quick 3D";

  // Modified toggleAccordion logic:
  // It now stores only the *one* key of the open accordion, or null if none are open.
  const toggleAccordion = (key: string) => {
    setOpenAccordionKey((prevKey) => (prevKey === key ? null : key));
  };

  const fetchBetData = async (limit: number, roomId: number | undefined) => {
    if (!roomId) {
      console.warn("Room ID is undefined, cannot fetch bet data.");
      setMyBetData([]);
      setMyBetLoading(false);
      setGameLoading(false);
      return;
    }

    setGameLoading(true);
    try {
      const res = await getCaller(
        `bets/history/?user_id=${info.user_id}&operator_id=${info.operator_id}&limit=${limit}&lobby_id=${roomId}`
      );
      const newBets = (res?.data || []).filter(
        (item: any) => Number(item.room_id) === roomId
      );

      const transformedBets = newBets.map((item: any) => {
        const rawBets = parseJson<any[]>(item.user_bets, []);
        const settlements = parseJson<any[]>(item.settlement_user_bets, []);
        const bets = rawBets.length > 0 ? rawBets : [{ chip: item.chip, amt: item.btAmt }];

        return {
          ...item,
          result: parseJson(item.result, {}),
          created_at: item.created_at || item.bet_created_at,
          user_bets: bets.map((bet: any) => {
            const settlement = settlements.find((entry: any) => entry.chip === bet.chip);
            return {
              chip_string: bet.chip || bet.chip_string || "",
              btAmt: Number(bet.amt ?? bet.btAmt ?? 0),
              mult: Number(settlement?.mult ?? bet.mult ?? 0),
              winAmt: Number(settlement?.winAmt ?? bet.winAmt ?? 0),
              status: settlement?.status ?? item.status,
            };
          }),
          total: Number(item.total ?? item.bet_amount ?? item.btAmt ?? 0),
          room_name: "Game Lobby",
        };
      });

      setMyBetData(transformedBets);
      // When new data is fetched, close any currently open accordion
      setOpenAccordionKey(null);
    } catch (error) {
      console.error("Failed to fetch bet data:", error);
      setMyBetData([]);
    } finally {
      setGameLoading(false);
      setMyBetLoading(false);
    }
  };

  const loadMoreData = () => {
    setCurrentLoadCount((prevCount) => prevCount + 10);
  };

  useEffect(() => {
    if (info.user_id && info.operator_id && activeRoomId !== undefined) {
      fetchBetData(currentLoadCount, activeRoomId);
    }
  }, [currentLoadCount, info.user_id, info.operator_id, activeRoomId]);

  useEffect(() => {
    if (
      historyData.length > 0 &&
      info.user_id &&
      info.operator_id &&
      activeRoomId !== undefined
    ) {
      const timer = setTimeout(() => {
        fetchBetData(currentLoadCount, activeRoomId);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [
    historyData,
    currentLoadCount,
    info.user_id,
    info.operator_id,
    activeRoomId,
  ]);

  if (myBetLoading) {
    return (
      <div className="loader-container-order">
        <div className="loader-order"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (myBetData.length === 0 && !myBetLoading) {
    return (
      <div className="order-data-container no-data">
        <img src={icon.noData} alt="No Data" className="no-data-image" />
        <p>No bet data available for this lobby.</p>
      </div>
    );
  }

  const latestDrawInfo = myBetData[0];
  const latestDrawId = latestDrawInfo?.lobby_id || "N/A";
  const latestDrawResultA =
    latestDrawInfo?.result?.a !== undefined ? latestDrawInfo.result.a : "N/A";
  const latestDrawResultB =
    latestDrawInfo?.result?.b !== undefined ? latestDrawInfo.result.b : "N/A";
  const latestDrawResultC =
    latestDrawInfo?.result?.c !== undefined ? latestDrawInfo.result.c : "N/A";

  return (
    <div className="order-data-container">
      <div className="current-draw-header">
        <div className="" style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="current-lobby-min">
            <span className="draw-type">{lobbyTypeText}</span>
            <span className="draw-id-text">{latestDrawId}</span>
          </div>
          <div className="current-lobby-min">
            <span className="draw-results-label">Draw Results:</span>
            <div className="" style={{ display: "flex" }}>
              {latestDrawResultA !== "N/A" && (
                <span className="number-circle-screenshot red-order">
                  {latestDrawResultA}
                </span>
              )}
              {latestDrawResultB !== "N/A" && (
                <span className="number-circle-screenshot orange-order">
                  {latestDrawResultB}
                </span>
              )}
              {latestDrawResultC !== "N/A" && (
                <span className="number-circle-screenshot blue-order">
                  {latestDrawResultC}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bet-list-headers">
        <div className="col">NUMBER</div>
        <div className="col">TIME</div>
        <div className="col">BET</div>
        <div className="col">RESULT</div>
      </div>

      <div className="bet-items-list">
        {myBetData.map((orderItem, index) => {
          const bet = orderItem.user_bets[0];
          const parsedChips = parseChipData(bet.chip_string);

          const formattedTime = new Date(orderItem.created_at)
            .toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
            .toUpperCase();

          const formattedDate = new Date(
            orderItem.created_at
          ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          });

          // Create a unique key for each item using a combination of lobby_id and index
          const uniqueKey = `${orderItem.lobby_id}-${index}`;
          // Check if this specific accordion should be open
          const isOpen = openAccordionKey === uniqueKey;

          return (
            <React.Fragment key={uniqueKey}>
              <div
                className="bet-row"
                onClick={() => toggleAccordion(uniqueKey)} // Pass the unique key
                role="button"
                aria-expanded={isOpen} // Use the new isOpen variable
                tabIndex={0}
              >
                <div className="col number-col">
                  <div className="multi-chip-display">
                    {parsedChips.map((pc, pcIdx) => (
                      <span
                        key={pcIdx}
                        className={`number-circle-multi ${getChipCircleClass(
                          pc.category
                        )}`}
                        title={`Bet on ${pc.category}: ${pc.value}`}
                      >
                        {pc.value}
                      </span>
                    ))}
                    {parsedChips.length === 0 && (
                      <span className="number-circle-multi default-order">
                        N/A
                      </span>
                    )}
                  </div>
                </div>
                <div className="col time-col">{`${formattedDate} ${formattedTime}`}</div>
                <div className="col bet-col">{bet.btAmt.toFixed(2)}</div>
                <div className="col result-col">
                  <span
                    className={`result-status ${
                      bet.status === "win" ? "win-text" : "no-win-text"
                    }`}
                  >
                    {bet.status === "win" ? "Won" : "No Win"}
                  </span>
                  <span className="result-amount">
                    {bet.winAmt.toFixed(2)}
                  </span>
                  <span className="accordion-arrow">
                    {isOpen ? "▲" : "❯"} {/* Use isOpen */}
                  </span>
                </div>
              </div>
              {/* Conditional rendering based on isOpen */}
              {isOpen && (
                <div className="accordion-content">
                  <div className="detail-item">
                    <span>Betting Time:</span>
                    <span>
                      {new Date(orderItem.created_at).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span>Multiplier:</span>
                    <span>{bet.mult}x</span>
                  </div>
                  <div className="detail-item">
                    <span>Lobby ID:</span>
                    <span>{orderItem.lobby_id}</span>
                  </div>
                  <div className="detail-item">
                    <span>Total Payment:</span>
                    <span>{orderItem.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="show-more-data" onClick={loadMoreData}>
        {gameLoading ? (
          <div className="loader-small"></div>
        ) : (
          <button className="show-more">Show More</button>
        )}
      </div>
    </div>
  );
};

export default OrderData;
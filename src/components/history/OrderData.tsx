import React, { useEffect, useMemo, useState } from "react";
import "./order.css";
import { getCaller } from "../../utility/api";
import { timerTabData, type HistoryItem, type BetItem } from "../../utility/dataModal";
import { icon } from "../../utility/icon";

interface mylistProp {
  historyData: HistoryItem[];
  info: Record<string, any>;
  lobbyTab: number;
  newLobbyIds: any;
  placedBets: BetItem[];
}

const parseChipData = (chipString: string) => {
  if (!chipString) return [];
  return chipString
    .split("-")
    .map((chip) => {
      const [value, category] = chip.split(":");
      return { value: parseInt(value, 10), category: (category || "").trim() };
    })
    .filter((chip) => !Number.isNaN(chip.value));
};

const getChipCircleClass = (category: string) => {
  switch (category) {
    case "A":
      return "chip-a";
    case "B":
      return "chip-b";
    case "C":
      return "chip-c";
    default:
      return "chip-default";
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

const toAmount = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatAmount = (value: unknown) => toAmount(value).toFixed(2);

const OrderData: React.FC<mylistProp> = ({ info, historyData, lobbyTab, placedBets }) => {
  const [myBetLoading, setMyBetLoading] = useState(true);
  const [gameLoading, setGameLoading] = useState(false);
  const [myBetData, setMyBetData] = useState<any[]>([]);
  const [openAccordionKey, setOpenAccordionKey] = useState<string | null>(null);
  const [currentLoadCount, setCurrentLoadCount] = useState(10);

  const activeRoomId = timerTabData[lobbyTab]?.roomId;

  const lobbyTypeText =
    activeRoomId === 101
      ? "Instant Lottery 1 Min"
      : activeRoomId === 102
      ? "Instant Lottery 3 Min"
      : "Instant Lottery";

  const toggleAccordion = (key: string) => {
    setOpenAccordionKey((prevKey) => (prevKey === key ? null : key));
  };

  const fetchBetData = async (limit: number, roomId: number | undefined) => {
    if (!roomId) {
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
      const newBets = (res?.data || []).filter((item: any) => Number(item.room_id) === roomId);

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
              btAmt: toAmount(bet.amt ?? bet.btAmt),
              mult: toAmount(settlement?.mult ?? bet.mult),
              winAmt: toAmount(settlement?.winAmt ?? bet.winAmt),
              status: settlement?.status ?? item.status,
            };
          }),
          total: toAmount(item.total ?? item.bet_amount ?? item.btAmt),
          room_name: "Game Lobby",
        };
      });

      setMyBetData(transformedBets);
      setOpenAccordionKey(null);
    } catch (error) {
      console.error("Failed to fetch bet data:", error);
      // Keep the last successful response visible during temporary API failures.
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
    if (!info.user_id || !info.operator_id || activeRoomId === undefined) {
      return;
    }

    const refreshTimer = window.setInterval(() => {
      fetchBetData(currentLoadCount, activeRoomId);
    }, 5000);

    return () => window.clearInterval(refreshTimer);
  }, [currentLoadCount, info.user_id, info.operator_id, activeRoomId]);

  useEffect(() => {
    if (historyData.length > 0 && info.user_id && info.operator_id && activeRoomId !== undefined) {
      const timer = setTimeout(() => {
        fetchBetData(currentLoadCount, activeRoomId);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [historyData, currentLoadCount, info.user_id, info.operator_id, activeRoomId]);

  const orderRows = useMemo(() => {
    return myBetData.map((orderItem, index) => {
      const bets: any[] = Array.isArray(orderItem.user_bets) ? orderItem.user_bets : [];
      const chips = bets.flatMap((bet) => parseChipData(bet.chip_string));
      const betAmount = bets.reduce((sum, bet) => sum + toAmount(bet.btAmt), 0);
      const winAmount = bets.reduce((sum, bet) => sum + toAmount(bet.winAmt), 0);
      const multiplier = bets.reduce((max, bet) => Math.max(max, toAmount(bet.mult)), 0);
      const isWin =
        bets.some((bet) => String(bet.status ?? "").toLowerCase() === "win") || winAmount > 0;

      const createdAt = new Date(orderItem.created_at);
      const isValidDate = !Number.isNaN(createdAt.getTime());

      return {
        key: `${orderItem.lobby_id}-${index}`,
        lobbyId: orderItem.lobby_id,
        chips,
        bets,
        betAmount,
        winAmount,
        multiplier,
        isWin,
        total: toAmount(orderItem.total),
        time: isValidDate
          ? createdAt
              .toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
              .toUpperCase()
          : "--:--",
        date: isValidDate
          ? createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
          : "--",
        fullTime: isValidDate
          ? createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
          : "--",
      };
    });
  }, [myBetData]);

  if (myBetLoading && placedBets.length === 0) {
    return (
      <div className="order-data-container">
        <div className="order-skeleton-wrap">
          {[0, 1, 2, 3, 4].map((row) => (
            <div className="order-skeleton-row" key={row}>
              <span className="sk-block sk-chips" />
              <span className="sk-block sk-time" />
              <span className="sk-block sk-bet" />
              <span className="sk-block sk-result" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (myBetData.length === 0 && !myBetLoading) {
    return (
      <div className="order-data-container">
        <div className="order-empty-state">
          <img src={icon.noData} alt="No data" className="order-empty-image" />
          <p className="order-empty-title">No orders yet</p>
          <span className="order-empty-sub">Your placed bets will appear here.</span>
        </div>
      </div>
    );
  }

  const latestDrawInfo = myBetData[0];
  const latestDrawId = latestDrawInfo?.lobby_id ?? "N/A";
  const drawResults = [
    { value: latestDrawInfo?.result?.a, className: "chip-a" },
    { value: latestDrawInfo?.result?.b, className: "chip-b" },
    { value: latestDrawInfo?.result?.c, className: "chip-c" },
  ].filter((entry) => entry.value !== undefined && entry.value !== null);

  const canLoadMore = myBetData.length >= currentLoadCount;

  return (
    <div className="order-data-container">
      <div className="order-draw-card">
        <div className="order-draw-left">
          <span className="order-draw-type">{lobbyTypeText}</span>
          <span className="order-draw-id">{latestDrawId}</span>
        </div>
        <div className="order-draw-right">
          <span className="order-draw-label">Draw Results</span>
          <div className="order-draw-circles">
            {drawResults.length > 0 ? (
              drawResults.map((entry, idx) => (
                <span key={idx} className={`order-chip order-chip-lg ${entry.className}`}>
                  {entry.value}
                </span>
              ))
            ) : (
              <span className="order-chip order-chip-lg chip-default">?</span>
            )}
          </div>
        </div>
      </div>

      <div className="order-table">
        <div className="order-row order-row-head">
          <div className="ocol ocol-number">Number</div>
          <div className="ocol ocol-time">Time</div>
          <div className="ocol ocol-bet">Bet</div>
          <div className="ocol ocol-result">Result</div>
          <div className="ocol ocol-arrow" aria-hidden="true" />
        </div>

        <div className="order-row-list">
          {orderRows.map((row) => {
            const isOpen = openAccordionKey === row.key;

            return (
              <React.Fragment key={row.key}>
                <div
                  className={`order-row order-row-item ${row.isWin ? "is-win" : "is-lose"} ${
                    isOpen ? "is-open" : ""
                  }`}
                  onClick={() => toggleAccordion(row.key)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggleAccordion(row.key);
                    }
                  }}
                  role="button"
                  aria-expanded={isOpen}
                  tabIndex={0}
                >
                  <div className="ocol ocol-number">
                    <div className="order-chip-stack">
                      {row.chips.length > 0 ? (
                        row.chips.map((chip, chipIdx) => (
                          <span
                            key={chipIdx}
                            className={`order-chip ${getChipCircleClass(chip.category)}`}
                            title={`${chip.category || "Bet"} : ${chip.value}`}
                          >
                            {chip.value}
                          </span>
                        ))
                      ) : (
                        <span className="order-chip chip-default">-</span>
                      )}
                    </div>
                  </div>

                  <div className="ocol ocol-time">
                    <span className="order-time-main">{row.time}</span>
                    <span className="order-time-sub">{row.date}</span>
                  </div>

                  <div className="ocol ocol-bet">{formatAmount(row.betAmount)}</div>

                  <div className="ocol ocol-result">
                    <span className={`order-status ${row.isWin ? "is-won" : "is-nowin"}`}>
                      {row.isWin ? "Won" : "No Win"}
                    </span>
                    <span className={`order-win-amount ${row.isWin ? "is-won" : "is-nowin"}`}>
                      {row.isWin ? `+${formatAmount(row.winAmount)}` : formatAmount(row.winAmount)}
                    </span>
                  </div>

                  <div className="ocol ocol-arrow">
                    <svg viewBox="0 0 24 24" className="order-arrow" aria-hidden="true">
                      <path
                        d="M9 6l6 6-6 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {isOpen && (
                  <div className="order-detail">
                    <div className="order-detail-grid">
                      <div className="order-detail-item">
                        <span className="odi-label">Lobby ID</span>
                        <span className="odi-value">{row.lobbyId}</span>
                      </div>
                      <div className="order-detail-item">
                        <span className="odi-label">Betting Time</span>
                        <span className="odi-value">{row.fullTime}</span>
                      </div>
                      <div className="order-detail-item">
                        <span className="odi-label">Multiplier</span>
                        <span className="odi-value">{row.multiplier}x</span>
                      </div>
                      <div className="order-detail-item">
                        <span className="odi-label">Total Payment</span>
                        <span className="odi-value">{formatAmount(row.total)}</span>
                      </div>
                      <div className="order-detail-item">
                        <span className="odi-label">Win Amount</span>
                        <span className={`odi-value ${row.isWin ? "is-won" : "is-nowin"}`}>
                          {formatAmount(row.winAmount)}
                        </span>
                      </div>
                    </div>

                    {row.bets.length > 1 && (
                      <div className="order-detail-bets">
                        <span className="odb-title">Bet Breakdown</span>
                        {row.bets.map((bet: any, betIdx: number) => (
                          <div className="odb-row" key={betIdx}>
                            <span className="odb-chips">
                              {parseChipData(bet.chip_string).map((chip, chipIdx) => (
                                <span
                                  key={chipIdx}
                                  className={`order-chip order-chip-sm ${getChipCircleClass(
                                    chip.category
                                  )}`}
                                >
                                  {chip.value}
                                </span>
                              ))}
                            </span>
                            <span className="odb-amount">{formatAmount(bet.btAmt)}</span>
                            <span
                              className={`odb-win ${
                                toAmount(bet.winAmt) > 0 ? "is-won" : "is-nowin"
                              }`}
                            >
                              {formatAmount(bet.winAmt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {canLoadMore && (
        <div className="order-show-more">
          <button className="order-show-more-btn" onClick={loadMoreData} disabled={gameLoading}>
            {gameLoading ? <span className="order-btn-loader" /> : "Show More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderData;

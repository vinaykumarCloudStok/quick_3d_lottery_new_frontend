import React, { useState, useRef, useEffect, useCallback } from "react";
import type { BetItem } from "../../utility/dataModal";
import "./single.css";

// --- useCounterInput Hook ---
interface Counter {
  value: number | string;
  increase: () => void;
  decrease: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setValue: (val: number) => void;
}

const useCounterInput = ({
  min = 0,
  max = 999,
  defaultValue = 0,
}: {
  min?: number;
  max?: number;
  defaultValue?: number;
}): Counter => {
  const [value, setValue] = useState<number | string>(defaultValue);

  const increase = () => {
    const newValue = Number(value) || 0;
    if (newValue < max) setValue(newValue + 1);
  };

  const decrease = () => {
    const newValue = Number(value) || 0;
    if (newValue > min) setValue(newValue - 1);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input === "") {
      setValue("");
    } else if (/^\d+$/.test(input)) {
      const num = parseInt(input, 10);
      if (num >= min && num <= max) {
        setValue(num);
      } else if (num < min) {
        setValue(min);
      } else if (num > max) {
        setValue(max);
      }
    }
  };

  return {
    value,
    increase,
    decrease,
    onChange,
    setValue: (val: number) => setValue(val),
  };
};

// --- Props ---
interface SingleDigitProps {
  onPlaceBet: (bet: BetItem) => void;
  userBalance: number;
  resetModal: string | null;
  getBetPanelTargetPosition: () => DOMRect | null;
  isBettingDisabled: boolean;
  lobbyId: number; // 👈 from Home
  disabledRows: string[]; // 👈 from Home
  onDisableRow: (lobbyId: number, rowLabel: string) => void; // 👈 callback to Home
}

const data = [
  { label: "A", color: "red" },
  { label: "B", color: "orange" },
  { label: "C", color: "blue" },
];

const SingleDigit: React.FC<SingleDigitProps> = ({
  onPlaceBet,
  userBalance,
  resetModal,
  getBetPanelTargetPosition,
  isBettingDisabled,
  lobbyId,
  disabledRows,
}) => {
  const [showLowBalancePopup, setShowLowBalancePopup] = useState(false);
  const [circleValues, setCircleValues] = useState<string[]>(["-", "-", "-"]);
  const [displayValues, setDisplayValues] = useState<string[]>(["", "", ""]);
  const [errors, setErrors] = useState<string[]>(["", "", ""]);
  const [isButtonAnimating, setIsButtonAnimating] = useState(false);

  // Refs for inputs and buttons
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const addBtnRefs = [
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
    useRef<HTMLButtonElement>(null),
  ];

  const counters = data.map(() =>
    useCounterInput({ min: 0, max: 999, defaultValue: 0 })
  );

  const handleCloseLowBalancePopup = () => setShowLowBalancePopup(false);

  // --- Input Handlers ---
  const handleDisplayChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (isBettingDisabled) return;

    const inputValue = e.target.value;
    setErrors((prev) => {
      const updated = [...prev];
      updated[index] = "";
      return updated;
    });

    if (inputValue === "") {
      setDisplayValues((prev) => {
        const updated = [...prev];
        updated[index] = "";
        return updated;
      });
      setCircleValues((prev) => {
        const updated = [...prev];
        updated[index] = "";
        return updated;
      });
      counters[index].setValue(0);
    } else if (/^\d$/.test(inputValue)) {
      setDisplayValues((prev) => {
        const updated = [...prev];
        updated[index] = inputValue;
        return updated;
      });
      setCircleValues((prev) => {
        const updated = [...prev];
        updated[index] = inputValue;
        return updated;
      });

      if ((Number(counters[index].value) || 0) === 0) {
        counters[index].setValue(1);
      }
    }
  };

  const handleDisplayFocus = (index: number) => {
    if (isBettingDisabled) return;
    setErrors((prev) => {
      const updated = [...prev];
      updated[index] = "";
      return updated;
    });
    setDisplayValues((prev) => {
      const updated = [...prev];
      if (updated[index] === "-" || updated[index] === "") {
        updated[index] = "";
      }
      return updated;
    });
  };

  const handleDisplayBlur = (index: number) => {
    if (displayValues[index] === "") {
      setDisplayValues((prev) => {
        const updated = [...prev];
        updated[index] = "";
        return updated;
      });
      setCircleValues((prev) => {
        const updated = [...prev];
        updated[index] = "";
        return updated;
      });
    }
  };

  // --- Animation ---
  const triggerBallAnimation = useCallback(
    (startX: number, startY: number) => {
      const betPanelRect = getBetPanelTargetPosition();
      if (!betPanelRect) return;

      const ball = document.createElement("div");
      ball.className = "animating-bet-ball";
      ball.style.left = `${startX}px`;
      ball.style.top = `${startY}px`;
      document.body.appendChild(ball);
      ball.style.backgroundColor = "blue";

      const targetX = betPanelRect.left + betPanelRect.width / 2;
      const targetY = betPanelRect.top + betPanelRect.height / 2;

      requestAnimationFrame(() => {
        ball.style.transform = `translate(${targetX - startX}px, ${
          targetY - startY
        }px) scale(0.3)`;
        ball.style.opacity = "0";
      });

      ball.addEventListener("transitionend", () => {
        ball.remove();
      });
    },
    [getBetPanelTargetPosition]
  );

  // --- Place Bet ---
  const handleAddSpecificBet = (index: number) => {
    if (isBettingDisabled) return;

    const digit = circleValues[index];
    const isValidDigit = /^\d$/.test(digit);
    const numericValue = Number(counters[index].value) || 0;
    const pricePerTicket = 20;
    const amount = numericValue * pricePerTicket;

    if (!isValidDigit) {
      setErrors((prev) => {
        const updated = [...prev];
        updated[index] = "Enter a digit (0-9)";
        return updated;
      });
      return;
    }
    if (numericValue <= 0) {
      setErrors((prev) => {
        const updated = [...prev];
        updated[index] = "Minimum quantity is 1";
        return updated;
      });
      return;
    }
    if (userBalance < pricePerTicket || amount > userBalance) {
      setShowLowBalancePopup(true);
      return;
    }

    // Animation
    const buttonRect = addBtnRefs[index].current?.getBoundingClientRect();
    if (buttonRect) {
      triggerBallAnimation(
        buttonRect.left + buttonRect.width / 2,
        buttonRect.top + buttonRect.height / 2
      );
    }

    // Place Bet
    onPlaceBet({
      id: `single-${data[index].label}-${Date.now()}`,
      type: "single",
      selectedNumbers: digit,
      amount,
      rawLabels: [data[index].label],
      lobbyId: String(lobbyId),
    });

    // Reset inputs
    setCircleValues((prev) => {
      const updated = [...prev];
      updated[index] = "-";
      return updated;
    });
    setDisplayValues((prev) => {
      const updated = [...prev];
      updated[index] = "-";
      return updated;
    });
    counters[index].setValue(0);
  };

  const handleDecreaseAndClearSpecificCircle = (index: number) => {
    if (isBettingDisabled) return;
    const currentValue = Number(counters[index].value) || 0;
    counters[index].decrease();
    if (currentValue <= 1) {
      setCircleValues((prev) => {
        const updated = [...prev];
        updated[index] = "-";
        return updated;
      });
      setDisplayValues((prev) => {
        const updated = [...prev];
        updated[index] = "-";
        return updated;
      });
    }
  };

  const handleQuickGuess = () => {
    if (isBettingDisabled) return;
    setIsButtonAnimating(true);
    setTimeout(() => setIsButtonAnimating(false), 200);

    const newDisplayValues: string[] = [];
    const newCircleValues: string[] = [];
    const newErrors: string[] = ["", "", ""];

    data.forEach((_, index) => {
      if (!disabledRows.includes(data[index].label)) {
        const randomDigit = Math.floor(Math.random() * 10).toString();
        newDisplayValues[index] = randomDigit;
        newCircleValues[index] = randomDigit;
        counters[index].setValue(1);
      } else {
        newDisplayValues[index] = displayValues[index];
        newCircleValues[index] = circleValues[index];
      }
    });

    setDisplayValues(newDisplayValues);
    setCircleValues(newCircleValues);
    setErrors(newErrors);
  };

  // Reset when round ends
  useEffect(() => {
    if (resetModal === "5" || resetModal === "resetAll" || resetModal === "gameFinished") {
      setDisplayValues(["", "", ""]);
      setCircleValues(["-", "-", "-"]);
      setErrors(["", "", ""]);
      counters.forEach((c) => c.setValue(0));
      setIsButtonAnimating(false);
      setShowLowBalancePopup(false);
    }
  }, [resetModal, counters]);

  return (
    <div className="game-container-single-digit">
      <div className="game-header">
        <div className="title-double">
          <div>
            <span className="double-size"> Single Digit</span>{" "}
            <span className="win-tag">Win 9X/per bet</span>
          </div>
          <div className="ticket-price">
            <span className="strike">21.00</span>
            <span className="discounted">
              20.00<span className="ticket-info">/Per Ticket</span>
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleQuickGuess}
            className={`quick-guess-button ${isButtonAnimating ? "animating" : ""}`}
            disabled={isBettingDisabled}
          >
            Quick Guess
          </button>
        </div>
      </div>

      {data.map((item, index) => {
        const displayVal = displayValues[index];
        const storedVal = circleValues[index];
        const { value: quantityValue, increase } = counters[index];
        const onQuantityChange = counters[index].onChange;

        const isValidDigit = /^\d$/.test(storedVal);
        const numericQuantity = Number(quantityValue) || 0;

        const isRowDisabled = isBettingDisabled;
        const isAddDisabled = !isValidDigit || numericQuantity <= 0 || isRowDisabled;

        return (
          <div key={item.label} className={`game-row ${isRowDisabled ? "disabled-row" : ""}`}>
            <div className="game-label">
              <div className={`label label-red ${item.color}`}>{item.label}</div>
              <input
                type="text"
                maxLength={1}
                value={displayVal}
                onChange={(e) => handleDisplayChange(index, e)}
                onFocus={() => handleDisplayFocus(index)}
                onBlur={() => handleDisplayBlur(index)}
                className={`circle-button-input ${item.color}`}
                placeholder="-"
                inputMode="numeric"
                pattern="[0-9]"
                disabled={isRowDisabled}
                ref={inputRefs[index]}
                autoComplete="off"
              />
            </div>

            <div className="game-info-label" style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div className="counter-box">
                <button
                  onClick={() => handleDecreaseAndClearSpecificCircle(index)}
                  disabled={numericQuantity <= 0 || isRowDisabled}
                  className={numericQuantity > 0 && !isRowDisabled ? "gray-button" : "gray-button disabled"}
                >
                  -
                </button>
                <input
                  type="text"
                  value={quantityValue}
                  onChange={onQuantityChange}
                  className="count-input"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={isRowDisabled}
                  autoComplete="off"
                />
                <button
                  onClick={increase}
                  disabled={!isValidDigit || numericQuantity >= 999 || isRowDisabled}
                  className={isValidDigit && numericQuantity < 999 && !isRowDisabled ? "gray-button" : "gray-button disabled"}
                >
                  +
                </button>
              </div>

              <button
                ref={addBtnRefs[index]}
                onClick={() => handleAddSpecificBet(index)}
                className={`add-button ${!isAddDisabled ? "active-blue" : ""}`}
                disabled={isAddDisabled}
              >
                ADD
              </button>
            </div>

            {errors[index] && <p className="row-error">{errors[index]}</p>}
          </div>
        );
      })}

      {showLowBalancePopup && (
        <div className="low-balance-popup-overlay">
          <div className="low-balance-popup-content">
            <h3>Insufficient Balance</h3>
            <p>Your balance is less than ₹20 or not enough for this bet.</p>
            <button onClick={handleCloseLowBalancePopup}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleDigit;

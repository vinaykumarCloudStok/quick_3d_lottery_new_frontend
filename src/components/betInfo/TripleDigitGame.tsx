import React, { useState, useRef, useEffect, useCallback } from "react";
import "./triple.css";
import { useCounterInput } from "../../utility/useCount";
import type { BetItem } from "../../utility/dataModal";

interface TripleDigitGameProps {
  onPlaceBet: (bet: BetItem) => void;
  userBalance: number;
  resetModal: string | null;
  getBetPanelTargetPosition: () => DOMRect | null;
  isBettingDisabled: boolean;
  lobbyId: number; // 👈 from Home
  disabledRows: string[]; // 👈 from Home
  onDisableRow: (lobbyId: number, rowLabel: string) => void; // 👈 callback to Home
}

const TripleDigitGame: React.FC<TripleDigitGameProps> = ({
  onPlaceBet,
  userBalance,
  resetModal,
  getBetPanelTargetPosition,
  isBettingDisabled,
  onDisableRow,
  disabledRows,
  lobbyId,
}) => {
  const { value: inputValue, increase, decrease, onChange, setValue } =
    useCounterInput({ min: 0, max: 999 });

  const [circleValues, setCircleValues] = useState<string[]>(["-", "-", "-"]);
  const [displayValues, setDisplayValues] = useState<string[]>(["-", "-", "-"]);
  const [rowError, setRowError] = useState<string>("");
  const [showLowBalancePopup, setShowLowBalancePopup] = useState(false);
  const [isButtonAnimating, setIsButtonAnimating] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const [inputToFocusAndSetCursor, setInputToFocusAndSetCursor] =
    useState<number>(-1);

  const handleCloseLowBalancePopup = () => setShowLowBalancePopup(false);

  // Define a unique identifier for this row
  const rowLabel = 'triple';
  
  // Check if this specific row is disabled by the parent (Home.tsx)
  const isRowDisabled = disabledRows.includes(rowLabel);

  // Combine global betting state with this row's disabled state
  const isControlDisabled = isBettingDisabled || isRowDisabled;

  useEffect(() => {
    // Reset inputs on a new game round or after the game finishes
    if (["3", "2", "1", "gameFinished"].includes(resetModal ?? "")) {
      setCircleValues(["-", "-", "-"]);
      setDisplayValues(["-", "-", "-"]);
      setValue(0);
      setRowError("");
    }
  }, [resetModal, setValue]);

  useEffect(() => {
    // Automatically focus the next input field
    if (inputToFocusAndSetCursor !== -1) {
      const targetInput = inputRefs.current[inputToFocusAndSetCursor];
      if (targetInput) {
        requestAnimationFrame(() => {
          targetInput.focus();
          targetInput.setSelectionRange(0, 0);
          setInputToFocusAndSetCursor(-1);
        });
      }
    }
  }, [inputToFocusAndSetCursor]);

  const handleDisplayChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (isControlDisabled) return;
    const inputValueTyped = e.target.value;
    const filteredValue = inputValueTyped.replace(/[^0-9]/g, "");

    setRowError("");

    setDisplayValues((prevDisplay) => {
      const updatedDisplay = [...prevDisplay];
      updatedDisplay[index] = filteredValue;
      return updatedDisplay;
    });

    setCircleValues((prevCircles) => {
      const updatedCircles = [...prevCircles];
      if (filteredValue === "") {
        updatedCircles[index] = "-";
        setValue(0);
        setInputToFocusAndSetCursor(index);
      } else if (/^\d$/.test(filteredValue)) {
        updatedCircles[index] = filteredValue;
        if ((Number(inputValue) || 0) === 0) {
          setValue(1);
        }
        if (index < 2) setInputToFocusAndSetCursor(index + 1);
      }
      return updatedCircles;
    });
  };

  const handleDisplayFocus = (index: number) => {
    if (isControlDisabled) return;
    setRowError("");
    setDisplayValues((prevDisplay) => {
      const updatedDisplay = [...prevDisplay];
      if (updatedDisplay[index] === "-") updatedDisplay[index] = "";
      setInputToFocusAndSetCursor(index);
      return updatedDisplay;
    });
  };

  const handleDisplayBlur = (index: number) => {
    if (displayValues[index] === "") {
      setDisplayValues((prevDisplay) => {
        const updatedDisplay = [...prevDisplay];
        updatedDisplay[index] = "-";
        return updatedDisplay;
      });
      setCircleValues((prevCircles) => {
        const updatedCircles = [...prevCircles];
        updatedCircles[index] = "-";
        return updatedCircles;
      });
    }
  };

  const isValidInputCombination = circleValues.every((val) => /^\d$/.test(val));
  const selectedTripleNumber = isValidInputCombination ? circleValues.join("") : "";
  const pricePerTicket = 20;
  const itemAmount = parseFloat((Number(inputValue) * pricePerTicket).toFixed(2));

  const triggerBallAnimation = useCallback(
    (startX: number, startY: number) => {
      const betPanelRect = getBetPanelTargetPosition();
      if (!betPanelRect) return;

      const ball = document.createElement("div");
      ball.className = "animating-bet-ball";
      ball.style.left = `${startX}px`;
      ball.style.top = `${startY}px`;
      ball.style.backgroundColor = "blue";
      document.body.appendChild(ball);

      const targetX = betPanelRect.left + betPanelRect.width / 2;
      const targetY = betPanelRect.top + betPanelRect.height / 2;

      requestAnimationFrame(() => {
        ball.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.3)`;
        ball.style.opacity = "0";
      });

      ball.addEventListener("transitionend", () => ball.remove());
    },
    [getBetPanelTargetPosition]
  );

  const handleAddBet = () => {
    if (isControlDisabled) return;
    setRowError("");

    if (!isValidInputCombination) {
      setRowError("Please enter a valid digit (0-9) for A, B, and C.");
      return;
    }
    if (Number(inputValue) <= 0) {
      setRowError("Quantity must be at least 1.");
      return;
    }
    if (itemAmount > userBalance) {
      setShowLowBalancePopup(true);
      return;
    }

    const buttonRect = addBtnRef.current?.getBoundingClientRect();
    if (buttonRect) {
      triggerBallAnimation(buttonRect.left + buttonRect.width / 2, buttonRect.top + buttonRect.height / 2);
    }

    onPlaceBet({
      id: `triple-${selectedTripleNumber}-${Date.now()}-${Math.random()}`,
      type: "triple",
      selectedNumbers: selectedTripleNumber,
      amount: itemAmount,
      rawLabels: ["A", "B", "C"],
    });

    // Notify the parent to disable this specific row
    onDisableRow(lobbyId, rowLabel);

    setCircleValues(["-", "-", "-"]);
    setDisplayValues(["-", "-", "-"]);
    setValue(0);
  };
  
  const isAddButtonDisabled =
    !isValidInputCombination || Number(inputValue) <= 0 || isControlDisabled;

  const handleDecreaseAndClearCircles = () => {
    if (isControlDisabled) return;
    if (Number(inputValue) <= 1) {
      setCircleValues(["-", "-", "-"]);
      setDisplayValues(["-", "-", "-"]);
      setValue(0);
      setInputToFocusAndSetCursor(0);
    } else {
      decrease();
    }
  };

  const handleQuickGuess = () => {
    if (isControlDisabled) return;

    setIsButtonAnimating(true);
    setTimeout(() => setIsButtonAnimating(false), 200);

    const newValues = ["A", "B", "C"].map(() => Math.floor(Math.random() * 10).toString());

    setDisplayValues(newValues);
    setCircleValues(newValues);
    setValue(1);
    setRowError("");
    setInputToFocusAndSetCursor(-1);
  };

  return (
    <div className={`triple-digit-container ${isRowDisabled ? "disabled-row" : ""}`}>
      <div className="game-header-triple">
        <div className="title-double">
          <span className="double-size"> Triple Digit</span>{" "}
          <span className="win-tag">Win 900X/per bet</span>
          <div className="ticket-info">
            <span className="original-price">21.00</span>
            <span className="discounted-price">20.00</span>/Per Ticket
          </div>
        </div>
        <div className="game-header">
          <button
            type="button"
            onClick={handleQuickGuess}
            className={`quick-guess-button ${isButtonAnimating ? "animating" : ""}`}
            disabled={isControlDisabled}
          >
            Quick Guess
          </button>
        </div>
      </div>

      <div className="game-row-triple">
        <div className="label-circle-row">
          {["A", "B", "C"].map((label, index) => {
            const colors = ["red", "orange", "blue"];
            return (
              <div className="label-circle-group" key={label}>
                <div className={`label label-${colors[index]}`}>{label}</div>
                <input
                  type="text"
                  maxLength={1}
                  className={`circle-button-input circle-${colors[index]}`}
                  value={displayValues[index]}
                  onFocus={() => handleDisplayFocus(index)}
                  onBlur={() => handleDisplayBlur(index)}
                  onChange={(e) => handleDisplayChange(index, e)}
                  placeholder="-"
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  inputMode="numeric"
                  pattern="[0-9]"
                  disabled={isControlDisabled}
                  autoComplete="off"
                />
              </div>
            );
          })}
        </div>

        <div className="controls">
          <div className="label-circle-group">
            <div className="control-row-triple" style={{ display: "flex", gap: "10px" }}>
              <button
                className={`control-btn ${
                  Number(inputValue) > 0 && !isControlDisabled ? "gray-button" : "gray-button disabled"
                }`}
                onClick={handleDecreaseAndClearCircles}
                disabled={isControlDisabled || Number(inputValue) <= 0}
              >
                -
              </button>
              <input
                type="text"
                className="count-input"
                value={inputValue}
                onChange={onChange}
                min="0"
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={isControlDisabled}
                autoComplete="off"
              />
              <button
                className={`control-btn ${
                  isValidInputCombination && Number(inputValue) < 999 && !isControlDisabled
                    ? "gray-button"
                    : "gray-button disabled"
                }`}
                onClick={increase}
                disabled={isControlDisabled || !isValidInputCombination || Number(inputValue) >= 999}
              >
                +
              </button>
            </div>

            <div className="action-buttons">
              <button
                ref={addBtnRef}
                className={`add-button ${!isAddButtonDisabled ? "active-blue" : ""}`}
                onClick={handleAddBet}
                disabled={isAddButtonDisabled}
              >
                ADD
              </button>
            </div>
          </div>
        </div>
      </div>

      {rowError && <p className="row-error">{rowError}</p>}

      {showLowBalancePopup && (
        <div className="low-balance-popup-overlay">
          <div className="low-balance-popup-content">
            <h3>Insufficient Balance</h3>
            <p>Your balance is less than ₹{pricePerTicket} or not enough for this bet.</p>
            <button onClick={handleCloseLowBalancePopup}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripleDigitGame;
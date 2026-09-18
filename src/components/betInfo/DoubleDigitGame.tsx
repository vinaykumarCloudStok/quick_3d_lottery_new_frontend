import React, { useState, useRef, useEffect, useCallback } from "react";
import "./double.css";
import { useCounterInput } from "../../utility/useCount";
import type { BetItem } from "../../utility/dataModal";

// --- GameItemProps Interface ---
interface GameItemProps {
  labels: string[];
  colors: string[];
  onPlaceBet: (bet: BetItem) => void;
  userBalance: number;
  onShowLowBalancePopup: () => void;
  resetModal: string | null;
  onQuickGuessTriggered: boolean;
  onQuickGuessHandled: () => void;
  getBetPanelTargetPosition: () => DOMRect | null;
  isBettingDisabled: boolean;
  lobbyId: number;
  disabledRows: string[];
  onDisableRow: (lobbyId: number, rowLabel: string) => void;
}

const GameItem: React.FC<GameItemProps> = ({
  labels,
  colors,
  onPlaceBet,
  userBalance,
  onShowLowBalancePopup,
  resetModal,
  onQuickGuessTriggered,
  onQuickGuessHandled,
  getBetPanelTargetPosition,
  isBettingDisabled,
  lobbyId,
  disabledRows,
  onDisableRow,
}) => {
  const { value: inputValue, increase, decrease, onChange, setValue } =
    useCounterInput({ min: 0, max: 999 });

  const [circleValues, setCircleValues] = useState<string[]>(labels.map(() => "-"));
  const [displayValues, setDisplayValues] = useState<string[]>(labels.map(() => "-"));
  const [rowError, setRowError] = useState<string>("");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const [shouldSetCursorPosition, setShouldSetCursorPosition] = useState<number>(-1);

  const rowLabel = `${labels.join("")}`;

  useEffect(() => {
    if (["3", "2", "1", "gameFinished"].includes(resetModal ?? "")) {
      setCircleValues(labels.map(() => "-"));
      setDisplayValues(labels.map(() => "-"));
      setValue(0);
      setRowError("");
    }
  }, [resetModal, labels, setValue]);

  useEffect(() => {
    if (onQuickGuessTriggered && !disabledRows.includes(rowLabel)) {
      const newValues = labels.map(
        () => Math.floor(Math.random() * 10).toString()
      );
      setDisplayValues(newValues);
      setCircleValues(newValues);
      setValue(1);
      setRowError("");
      onQuickGuessHandled();
    } else if (onQuickGuessTriggered && disabledRows.includes(rowLabel)) {
      onQuickGuessHandled();
    }
  }, [onQuickGuessTriggered, disabledRows, rowLabel, labels, setValue, onQuickGuessHandled]);
  
  // FIX: This useEffect block is still necessary to ensure the cursor is properly managed
  useEffect(() => {
    if (shouldSetCursorPosition !== -1) {
      const targetInput = inputRefs.current[shouldSetCursorPosition];
      if (targetInput) {
        requestAnimationFrame(() => {
          targetInput.focus();
          targetInput.setSelectionRange(0, 0);
          setShouldSetCursorPosition(-1);
        });
      }
    }
  }, [shouldSetCursorPosition]);


  const isValidInputCombination = circleValues.every((val) => /^\d$/.test(val));
  const selectedDoubleNumber = isValidInputCombination ? circleValues.join("") : "";
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

      ball.addEventListener("transitionend", () => {
        ball.remove();
      });
    },
    [getBetPanelTargetPosition]
  );
  
  const handleDisplayChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValueTyped = e.target.value;
    const filteredValue = inputValueTyped.replace(/[^0-9]/g, "");

    setRowError("");

    setDisplayValues((prev) => {
      const updated = [...prev];
      updated[index] = filteredValue;
      return updated;
    });

    setCircleValues((prev) => {
      const updated = [...prev];
      if (filteredValue === "") {
        updated[index] = "-";
        setValue(0);
        setShouldSetCursorPosition(index);
      } else if (/^\d$/.test(filteredValue)) {
        updated[index] = filteredValue;
        if ((Number(inputValue) || 0) === 0) {
          setValue(1);
        }
        if (index < labels.length - 1) {
          setShouldSetCursorPosition(index + 1);
        }
      }
      return updated;
    });
  };

  const handleDisplayFocus = (index: number) => {
    setRowError("");
    setDisplayValues((prev) => {
      const updated = [...prev];
      if (updated[index] === "-") updated[index] = "";
      return updated;
    });
    setShouldSetCursorPosition(index);
  };

  const handleDisplayBlur = (index: number) => {
    if (displayValues[index] === "") {
      setDisplayValues((prev) => {
        const updated = [...prev];
        updated[index] = "-";
        return updated;
      });
      setCircleValues((prev) => {
        const updated = [...prev];
        updated[index] = "-";
        return updated;
      });
    }
  };

  const handleAddBet = () => {
    if (isControlDisabled) return; // Add this check to prevent placing a bet on a disabled row

    setRowError("");

    if (!isValidInputCombination) {
      setRowError(`Enter a digit (0–9) for both ${labels[0]} and ${labels[1]}.`);
      return;
    }

    if (Number(inputValue) <= 0) {
      setRowError("Quantity must be at least 1.");
      return;
    }

    if (userBalance < pricePerTicket || itemAmount > userBalance) {
      onShowLowBalancePopup();
      return;
    }

    const buttonRect = addBtnRef.current?.getBoundingClientRect();
    if (buttonRect) {
      triggerBallAnimation(buttonRect.left + buttonRect.width / 2, buttonRect.top + buttonRect.height / 2);
    }

    onPlaceBet({
      id: `double-${selectedDoubleNumber}-${Date.now()}-${Math.random()}`,
      type: "double",
      selectedNumbers: selectedDoubleNumber,
      amount: itemAmount,
      rawLabels: labels,
    });

    onDisableRow(lobbyId, rowLabel);

    setCircleValues(labels.map(() => "-"));
    setDisplayValues(labels.map(() => "-"));
    setValue(0);
  };

  const isRowGloballyDisabled = disabledRows.includes(rowLabel);
  const isControlDisabled = isBettingDisabled || isRowGloballyDisabled;
  const isAddButtonDisabled =
    !isValidInputCombination || Number(inputValue) <= 0 || isControlDisabled;

  const handleDecreaseAndClearCircles = () => {
    if (isControlDisabled) return; // Add this check
    if (Number(inputValue) <= 1) {
      setCircleValues(labels.map(() => "-"));
      setDisplayValues(labels.map(() => "-"));
      setValue(0);
      setShouldSetCursorPosition(0);
    } else {
      decrease();
    }
  };

  return (
    <div className={`game-row-double ${isRowGloballyDisabled ? "disabled-row" : ""}`}>
      <div className="label-container">
        <div className="label-double-text">
          {labels.map((label, index) => (
            <div key={label} className={`label label-${colors[index]}`}>
              {label}
            </div>
          ))}
        </div>

        <div className="label-container-circle">
          {labels.map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={displayValues[index]}
              // ❌ OLD: The onChange handler below was causing the issue.
              // onChange={(e) => {
              //   const val = e.target.value.replace(/[^0-9]/g, "");
              //   const updatedDisplay = [...displayValues];
              //   updatedDisplay[index] = val || "-";
              //   setDisplayValues(updatedDisplay);
              //   const updatedCircle = [...circleValues];
              //   updatedCircle[index] = val || "-";
              //   setCircleValues(updatedCircle);
              // }}
              // ✅ CORRECTED: Use the existing, more robust handleDisplayChange function.
              onChange={(e) => handleDisplayChange(index, e)}
              onFocus={() => handleDisplayFocus(index)}
              onBlur={() => handleDisplayBlur(index)}
              className={`circle-button-input circle-${colors[index]}`}
              placeholder="-"
              disabled={isControlDisabled}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              inputMode="numeric"
              pattern="[0-9]"
              autoComplete="off"
            />
          ))}
        </div>
      </div>

      <div className="controls">
        <div className="control-labels" style={{ display: "flex", gap: "10px" }}>
          <button
            // ✅ CORRECTED: Use the correct decrease handler
            onClick={handleDecreaseAndClearCircles}
            className={`control-btn ${
              Number(inputValue) > 0 && !isControlDisabled ? "gray-button" : "gray-button disabled"
            }`}
            disabled={isControlDisabled || Number(inputValue) <= 0}
          >
            -
          </button>
          <input
            type="text"
            className="count-input"
            value={Number(inputValue)}
            onChange={onChange}
            placeholder="0"
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={isControlDisabled}
            autoComplete="off"
          />
          <button
            onClick={increase}
            className={`control-btn ${
              isValidInputCombination && Number(inputValue) < 999 && !isControlDisabled
                ? "gray-button"
                : "gray-button disabled"
            }`}
            disabled={isControlDisabled || !isValidInputCombination || Number(inputValue) >= 999}
          >
            +
          </button>
        </div>

        <div className="amount-input-container" style={{ width: "100%" }}>
          <button
            ref={addBtnRef}
            onClick={handleAddBet}
            className={`add-button ${!isAddButtonDisabled ? "active-blue" : ""}`}
            disabled={isAddButtonDisabled}
          >
            ADD
          </button>
        </div>
      </div>

      {rowError && <p className="row-error">{rowError}</p>}
    </div>
  );
};

// --- Parent DoubleDigitGame ---
interface DoubleDigitGameProps {
  onPlaceBet: (newBet: BetItem) => void;
  userBalance: any;
  resetModal: string | null;
  getBetPanelTargetPosition: () => DOMRect | null;
  isBettingDisabled: boolean;
  lobbyId: number;
  disabledRows: string[];
  onDisableRow: (lobbyId: number, rowLabel: string) => void;
}

const DoubleDigitGame: React.FC<DoubleDigitGameProps> = ({
  onPlaceBet,
  userBalance,
  resetModal,
  getBetPanelTargetPosition,
  isBettingDisabled,
  lobbyId,
  disabledRows,
  onDisableRow,
}) => {
  const [showLowBalancePopup, setShowLowBalancePopup] = useState(false);
  const [quickGuessTrigger, setQuickGuessTrigger] = useState(false);
  const [quickGuessHandledCount, setQuickGuessHandledCount] = useState(0);

  const handleShowLowBalancePopup = () => setShowLowBalancePopup(true);
  const handleCloseLowBalancePopup = () => setShowLowBalancePopup(false);

  const handleQuickGuess = () => {
    if (isBettingDisabled) return;
    setQuickGuessTrigger(true);
    setQuickGuessHandledCount(0);
  };

  const handleGameItemQuickGuessHandled = useCallback(() => {
    setQuickGuessHandledCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (quickGuessTrigger && quickGuessHandledCount === 3) {
      setQuickGuessTrigger(false);
      setQuickGuessHandledCount(0);
    }
  }, [quickGuessTrigger, quickGuessHandledCount]);

  return (
    <div className="double-digit-container">
      <div className="game-header-double">
        <div className="title-double">
          <span className="double-size"> Double Digit</span>{" "}
          <span className="win-tag">Win 90X/per bet</span>
          <div className="ticket-info">
            <span className="original-price">21.00</span>
            <span className="discounted-price">20.00</span>/Per Ticket
          </div>
        </div>
        <div className="game-header">
          <button
            type="button"
            onClick={handleQuickGuess}
            className="quick-guess-button"
            disabled={isBettingDisabled}
          >
            Quick Guess
          </button>
        </div>
      </div>

      {/* 3 row instances */}
      <GameItem
        labels={["A", "B"]}
        colors={["red", "orange"]}
        onPlaceBet={onPlaceBet}
        userBalance={userBalance}
        onShowLowBalancePopup={handleShowLowBalancePopup}
        resetModal={resetModal}
        onQuickGuessTriggered={quickGuessTrigger}
        onQuickGuessHandled={handleGameItemQuickGuessHandled}
        getBetPanelTargetPosition={getBetPanelTargetPosition}
        isBettingDisabled={isBettingDisabled}
        lobbyId={lobbyId}
        disabledRows={disabledRows}
        onDisableRow={onDisableRow}
      />
      <GameItem
        labels={["A", "C"]}
        colors={["red", "blue"]}
        onPlaceBet={onPlaceBet}
        userBalance={userBalance}
        onShowLowBalancePopup={handleShowLowBalancePopup}
        resetModal={resetModal}
        onQuickGuessTriggered={quickGuessTrigger}
        onQuickGuessHandled={handleGameItemQuickGuessHandled}
        getBetPanelTargetPosition={getBetPanelTargetPosition}
        isBettingDisabled={isBettingDisabled}
        lobbyId={lobbyId}
        disabledRows={disabledRows}
        onDisableRow={onDisableRow}
      />
      <GameItem
        labels={["B", "C"]}
        colors={["orange", "blue"]}
        onPlaceBet={onPlaceBet}
        userBalance={userBalance}
        onShowLowBalancePopup={handleShowLowBalancePopup}
        resetModal={resetModal}
        onQuickGuessTriggered={quickGuessTrigger}
        onQuickGuessHandled={handleGameItemQuickGuessHandled}
        getBetPanelTargetPosition={getBetPanelTargetPosition}
        isBettingDisabled={isBettingDisabled}
        lobbyId={lobbyId}
        disabledRows={disabledRows}
        onDisableRow={onDisableRow}
      />

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

export default DoubleDigitGame;
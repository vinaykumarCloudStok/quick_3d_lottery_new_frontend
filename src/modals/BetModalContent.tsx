// components/betInfo/BetModalContent.tsx
import React from 'react';
import {
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineCheck,
} from 'react-icons/ai';
import type { BetItem } from '../utility/dataModal';
import BetChipDisplay from '../components/betInfo/BetChipDisplay';
import { icon } from '../utility/icon';

interface BetModalContentProps {
  currentBets: BetItem[];
  totalBetAmount: number;
  userBalance: number;
  onRemoveBet: (id: string) => void;
  onUpdateBet: (id: string, selectedNumbers: string) => void;
  onConfirmBets: (bets: BetItem[]) => void;
  onDeleteAllBets: () => void; // Prop for deleting all bets
  onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
};

const digitCountFor = (type: BetItem['type']) =>
  type === 'single' ? 1 : type === 'double' ? 2 : 3;

const formatMoney = (value: number) =>
  value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const BetModalContent: React.FC<BetModalContentProps> = ({
  currentBets,
  totalBetAmount,
  userBalance,
  onRemoveBet,
  onUpdateBet,
  onConfirmBets,
  onDeleteAllBets,
  onClose,
}) => {
  const [editingBetId, setEditingBetId] = React.useState<string | null>(null);
  const [editingNumber, setEditingNumber] = React.useState('');
  const [alertMessage, setAlertMessage] = React.useState<string | null>(null);

  const balanceAfterBet = userBalance - totalBetAmount;
  const isShortOnBalance = totalBetAmount > userBalance;

  // Function to render the chips as JSX
  const renderBetChips = (bet: BetItem): React.ReactNode => {
    const numbers = typeof bet.selectedNumbers === 'string'
      ? bet.selectedNumbers.split('')
      : (Array.isArray(bet.selectedNumbers) ? bet.selectedNumbers : []);

    const labels = bet.rawLabels || [];

    return (
      <div className="bet-chips-group">
        {numbers.map((digit, index) => (
          <BetChipDisplay
            key={index}
            digit={digit}
            label={labels[index]}
            colorClass={
                labels[index]?.toLowerCase() === 'a' ? 'red' :
                labels[index]?.toLowerCase() === 'b' ? 'orange' :
                labels[index]?.toLowerCase() === 'c' ? 'blue' : ''
            }
          />
        ))}
        <span className="bet-quantity">&times;1</span>
      </div>
    );
  };

  const startEditing = (bet: BetItem) => {
    setAlertMessage(null);
    setEditingBetId(bet.id);
    setEditingNumber(String(bet.selectedNumbers));
  };

  const saveEditing = (bet: BetItem) => {
    if (editingNumber.length !== digitCountFor(bet.type)) return;
    onUpdateBet(bet.id, editingNumber);
    setEditingBetId(null);
    setEditingNumber('');
  };

  const handlePlaceBetClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (currentBets.length === 0) {
      setAlertMessage('Add at least one number before placing the bet.');
      return;
    }

    if (isShortOnBalance) {
      setAlertMessage(
        `Short by ₹${formatMoney(totalBetAmount - userBalance)}. Remove a bet or top up your balance.`
      );
      return;
    }

    onConfirmBets(currentBets);
  };

  return (
    <>
      <div className="bet-slip-grabber" aria-hidden="true" />

      <div className="bet-slip-header">
        <div className="bet-slip-heading">
          <h2>Bet slip</h2>
          <span className="bet-slip-count">
            {currentBets.length} {currentBets.length === 1 ? 'bid' : 'bids'}
          </span>
        </div>
        <div className="bet-slip-header-actions">
          {currentBets.length > 0 && (
            <button
              className="bet-slip-clear-btn"
              type="button"
              onClick={() => {
                setEditingBetId(null);
                setAlertMessage(null);
                onDeleteAllBets();
              }}
            >
              <AiOutlineDelete aria-hidden="true" />
              <span>Clear all</span>
            </button>
          )}
          <button
            className="bet-slip-icon-btn bet-slip-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close bet slip"
          >
            <AiOutlineClose />
          </button>
        </div>
      </div>

      <div className="bet-slip-body">
        {currentBets.length === 0 ? (
          <div className="bet-slip-empty">
            <img src={icon.noData} alt="" />
            <p className="bet-slip-empty-title">Your slip is empty</p>
            <p className="bet-slip-empty-text">
              Pick numbers from the game table and they will show up here.
            </p>
            <button className="bet-slip-empty-btn" type="button" onClick={onClose}>
              Choose numbers
            </button>
          </div>
        ) : (
          <ul className="bet-slip-list">
            {currentBets.map((bet) => {
              const isEditing = editingBetId === bet.id;
              const expectedLength = digitCountFor(bet.type);

              return (
                <li key={bet.id} className={`bet-row${isEditing ? ' is-editing' : ''}`}>
                  <div className="bet-row-main">
                    <span className={`bet-type-badge is-${bet.type}`}>
                      {TYPE_LABEL[bet.type] || bet.type}
                    </span>
                    {isEditing ? (
                      <input
                        className="bet-edit-number-input"
                        value={editingNumber}
                        maxLength={expectedLength}
                        inputMode="numeric"
                        onChange={(event) => setEditingNumber(event.target.value.replace(/\D/g, ''))}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') saveEditing(bet);
                          if (event.key === 'Escape') setEditingBetId(null);
                        }}
                        aria-label={`Edit ${bet.type} number`}
                        autoFocus
                      />
                    ) : renderBetChips(bet)}
                  </div>

                  <div className="bet-row-amount">
                    <span className="bet-amount-visual">₹{formatMoney(bet.amount)}</span>
                    {isEditing && (
                      <span className="bet-row-hint">
                        {expectedLength} {expectedLength === 1 ? 'digit' : 'digits'}
                      </span>
                    )}
                  </div>

                  <div className="bet-row-actions">
                    {isEditing ? (
                      <>
                        <button
                          className="bet-slip-icon-btn is-confirm"
                          type="button"
                          onClick={() => saveEditing(bet)}
                          disabled={editingNumber.length !== expectedLength}
                          aria-label="Save number"
                        >
                          <AiOutlineCheck />
                        </button>
                        <button
                          className="bet-slip-icon-btn"
                          type="button"
                          onClick={() => setEditingBetId(null)}
                          aria-label="Cancel editing"
                        >
                          <AiOutlineClose />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="bet-slip-icon-btn"
                          type="button"
                          onClick={() => startEditing(bet)}
                          aria-label={`Edit ${bet.type} bet`}
                        >
                          <AiOutlineEdit />
                        </button>
                        <button
                          className="bet-slip-icon-btn is-danger"
                          type="button"
                          onClick={() => onRemoveBet(bet.id)}
                          aria-label={`Remove ${bet.type} bet`}
                        >
                          <AiOutlineDelete />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {currentBets.length > 0 && (
        <div className="bet-slip-footer">
          <dl className="bet-summary">
            <div className="bet-summary-row">
              <dt>Total bids</dt>
              <dd>{currentBets.length}</dd>
            </div>
            <div className="bet-summary-row">
              <dt>Wallet balance</dt>
              <dd>₹{formatMoney(userBalance)}</dd>
            </div>
            <div className={`bet-summary-row${isShortOnBalance ? ' is-negative' : ''}`}>
              <dt>Balance after bet</dt>
              <dd>₹{formatMoney(balanceAfterBet)}</dd>
            </div>
            <div className="bet-summary-row is-total">
              <dt>Total amount</dt>
              <dd>₹{formatMoney(totalBetAmount)}</dd>
            </div>
          </dl>

          {(alertMessage || isShortOnBalance) && (
            <p className="bet-slip-alert" role="alert">
              {alertMessage ||
                `Short by ₹${formatMoney(totalBetAmount - userBalance)}. Remove a bet or top up your balance.`}
            </p>
          )}

          <button
            className="bet-slip-confirm-btn"
            onClick={handlePlaceBetClick}
            disabled={currentBets.length === 0 || totalBetAmount === 0 || isShortOnBalance}
          >
            <span>Place bet</span>
            <span className="bet-slip-confirm-amount">₹{formatMoney(totalBetAmount)}</span>
          </button>
        </div>
      )}
    </>
  );
};

export default BetModalContent;

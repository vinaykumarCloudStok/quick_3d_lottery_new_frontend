// components/betInfo/BetModalContent.tsx
import React from 'react';
import { AiOutlineClose, AiOutlineDelete } from 'react-icons/ai';
import type { BetItem } from '../utility/dataModal';
import BetChipDisplay from '../components/betInfo/BetChipDisplay';
import { icon } from '../utility/icon';

interface BetModalContentProps {
  currentBets: BetItem[];
  totalBetAmount: number;
  userBalance: number;
  onRemoveBet: (id: string) => void;
  onConfirmBets: (bets: BetItem[]) => void;
  onDeleteAllBets: () => void; // Prop for deleting all bets
  onClose: () => void;
}

const BetModalContent: React.FC<BetModalContentProps> = ({
  currentBets,
  totalBetAmount,
  userBalance,
  onRemoveBet,
  onConfirmBets,
  onDeleteAllBets,
  onClose,
}) => {

  // Function to render the chips as JSX
  const renderBetChips = (bet: BetItem): React.ReactNode => {
    const numbers = typeof bet.selectedNumbers === 'string'
      ? bet.selectedNumbers.split('')
      : (Array.isArray(bet.selectedNumbers) ? bet.selectedNumbers : []);

    const labels = bet.rawLabels || [];

    return (
      <div className="bet-chips-group"> {/* Added a class for grouping chips */}
        {numbers.map((digit, index) => (
          <BetChipDisplay
            key={index} // Use index if no other unique key is available per digit
            digit={digit}
            label={labels[index]}
            colorClass={
                labels[index]?.toLowerCase() === 'a' ? 'red' :
                labels[index]?.toLowerCase() === 'b' ? 'orange' :
                labels[index]?.toLowerCase() === 'c' ? 'blue' : ''
            }
          />
        ))}
        <span className="bet-quantity">x1</span>
      </div>
    );
  };

  const handlePlaceBetClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (currentBets.length === 0) {
      alert("Please add some numbers to your bet slip first!");
      return;
    }

    if (totalBetAmount > userBalance) {
      alert(`Insufficient balance. Your balance is ₹${userBalance.toFixed(2)}, but your total bet is ₹${totalBetAmount.toFixed(2)}.`);
      return;
    }

    onConfirmBets(currentBets);
  };


  return (
    <>
      <div className="modal-header">
        <div>
          <span className="modal-kicker">BET SLIP</span>
          <h2>My Numbers</h2>
        </div>
        <div className="modal-header-actions">
          <button className="delete-all-bets-btn" type="button" onClick={onDeleteAllBets} aria-label="Delete all bets">
            <AiOutlineDelete />
          </button>
          <button className="close-modal-btn" type="button" onClick={onClose} aria-label="Close bet slip">
            <AiOutlineClose />
          </button>
        </div>
      </div>
      <div className="modal-body">
        {currentBets.length === 0 ? (
          <div className="no-data-container">
            <img src={icon.noData} alt="No Data" style={{ marginLeft: '4rem' }} />
            <p>No bets added yet.</p>
          </div>
        ) : (
          <div className="bets-list-container">
            <ul className="bets-list">
              {currentBets.map((bet) => (
                <li key={bet.id} className="bet-list-item-visual">
                  <div className="bet-display-group">
                    <span className="bet-type-label">{bet.type} bet</span>
                    {renderBetChips(bet)}
                  </div>
                  <div className="bet-amount-actions">
                    <span className="bet-amount-visual">{bet.amount.toFixed(2)}</span>
                    <button className="remove-bet-modal-btn" type="button" onClick={() => onRemoveBet(bet.id)} aria-label="Remove bet">
                      <AiOutlineDelete />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button
              className="modal-place-bet-btn"
              onClick={handlePlaceBetClick}
              disabled={currentBets.length === 0 || totalBetAmount === 0 || totalBetAmount > userBalance}
            >
              Confirm & Place Bet
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default BetModalContent;
// components/betInfo/BetModalContent.tsx
import React from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
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
}

const BetModalContent: React.FC<BetModalContentProps> = ({
  currentBets,
  totalBetAmount,
  userBalance,
  onRemoveBet,
  onConfirmBets,
  onDeleteAllBets,
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
        {/* Display quantity next to the chips */}
        <span className="bet-quantity">x1</span> {/* Assuming quantity is always 1 per BetItem for now */}
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
        <h2>My Numbers</h2>
        <button className="delete-all-bets-btn" onClick={onDeleteAllBets}>
          <AiOutlineDelete style={{ fontSize: '24px' }} />
        </button>
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
                    {renderBetChips(bet)}
                  </div>
                  <div className="bet-amount-actions"> {/* Group amount and delete button */}
                     {/* <span className="bet-amount-visual">₹{bet.amount.toFixed(2)}</span> Display individual bet amount if needed */}
                    <button className="remove-bet-modal-btn" onClick={() => onRemoveBet(bet.id)}>
                      {/* You might want an icon here, or just a simple 'X' */}
                      &times; {/* Example: simple 'X' for removal */}
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
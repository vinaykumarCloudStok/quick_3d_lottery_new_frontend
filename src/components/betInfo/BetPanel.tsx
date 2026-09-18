import React, { useState, useEffect } from 'react';
import './bet.css';
import { icon } from '../../utility/icon'; 
import Modal from '../modal/Modal'; 
import PaymentSuccessModal from '../../modals/PaymentSuccessModal'; 
import type { BetItem, Info } from '../../utility/dataModal'; 

interface BetPanelProps {
  currentBets: BetItem[];
  onRemoveBet: (id: string) => void; 
  onConfirmBets: (bets: BetItem[]) => void;
  userBalance: number;
  info?: Info | any;
  animationTargetRef?: React.RefObject<HTMLDivElement | null>;
  isBettingDisabled: boolean; // Add this prop
}

const BetPanel: React.FC<BetPanelProps> = ({
  currentBets,
  // onRemoveBet, // Commented out as it's not used in this specific logic flow
  onConfirmBets,
  userBalance,
  animationTargetRef, // Receive the new prop
  isBettingDisabled, // Destructure the new prop
}) => {
  const [isPaymentSuccessModalOpen, setIsPaymentSuccessModalOpen] = useState(false);
  const [totalBetAmount, setTotalBetAmount] = useState(0);
  const [totalBids, setTotalBids] = useState(0);
  const [doNotShowPaymentSuccessAgain, setDoNotShowPaymentSuccessAgain] = useState(false);

  // Calculate total bet amount and number of bids whenever currentBets changes
  useEffect(() => {
    const amount = currentBets.reduce((sum, bet) => sum + bet.amount, 0);
    setTotalBetAmount(amount);
    setTotalBids(currentBets.length);
  }, [currentBets]);

  // Load "Do not show again" preference from localStorage on component mount
  useEffect(() => {
    try {
      const preference = localStorage.getItem('doNotShowPaymentSuccessAgain');
      if (preference === 'true') {
        setDoNotShowPaymentSuccessAgain(true);
      }
    } catch (error) {
      console.error("Failed to load 'doNotShowPaymentSuccessAgain' from localStorage:", error);
    }
  }, []);

  const handlePlaceBetButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from propagating to parent elements

    // If betting is disabled globally, do not proceed
    if (isBettingDisabled) {
      console.warn("Attempted to place bet when betting is disabled.");
      return;
    }

    if (currentBets.length === 0) {
      alert("Please add some numbers to your bet slip first!");
      return;
    }

    if (totalBetAmount <= 0) {
        alert("Bet amount must be greater than zero.");
        return;
    }

    if (totalBetAmount > userBalance) {
      alert("Insufficient balance to place these bets.");
      return;
    }

    // If the "Do not show again" flag is set, bypass the modal and place the bet directly
    if (doNotShowPaymentSuccessAgain) {
      onConfirmBets(currentBets);
    } else {
      // Otherwise, open the PaymentSuccessModal
      setIsPaymentSuccessModalOpen(true);
    }
  };

  const handlePaymentSuccessOkClick = () => {
    setIsPaymentSuccessModalOpen(false); // Close the modal
    onConfirmBets(currentBets); // Now, place the bet!
  };

  return (
    <>
      <div className="bottom-cart-wrapper">
        <div className="bottom-cart-bar">
          <div className="cart-info">
            <div className="cart-icon" ref={animationTargetRef}> {/* Attach the ref here! */}
              <div className="icon-wrapper">
                <img
                  className="cart-img"
                  alt="cart"
                  src={icon.shopCart}
                  data-loaded="true"
                />
              </div>
            </div>
            <div className="cart-details">
              <span className="cart-price">
                {totalBetAmount.toFixed(2)}
              </span>
              <span className="cart-bids">{totalBids} BIDS</span>
            </div>
          </div>

          <button
            className="pay-now-button"
            type="button"
            onClick={handlePlaceBetButtonClick}
            // Disable button if no bets, amount is zero, insufficient balance, OR if betting is globally disabled
            disabled={currentBets.length === 0 || totalBetAmount === 0 || totalBetAmount > userBalance || isBettingDisabled}
          >
            Place Bet
          </button>
        </div>
      </div>

      {isPaymentSuccessModalOpen && (
        <Modal onClose={() => setIsPaymentSuccessModalOpen(false)} isOpen={true}>
          <PaymentSuccessModal
            onOkClick={handlePaymentSuccessOkClick}
            showDoNotShowAgain={true}
          />
        </Modal>
      )}
    </>
  );
};

export default BetPanel;

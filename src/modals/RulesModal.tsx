import React from "react";
import "./rules.css";
import { IoCloseOutline } from "react-icons/io5";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header-rule">
          <p>3-Digit Lottery (ABC Game)</p>
          <button onClick={onClose}>
            <IoCloseOutline style={{ fontSize: "28px" }} />
          </button>
        </div>

        <div className="rules-text">
          <p>
            The winning numbers are derived from the last three digits of the
            first prize number.
          </p>
        </div>

        {/* Single Digit Section */}
        <div className="single-digit-container">
          <p className="title">Single Digit</p>
          <p className="rules-text">
            Single digit games can be played on any board between A, B and C.
          </p>
          <div className="info-line">
            <span className="ticket-line">Ticket Price:</span>
            <span className="highlight">20.00</span>
          </div>
          <div className="info-line">
            <span className="ticket-line">Winning Amount:</span>
            <span className="highlight">9X of bet amount</span>
          </div>
        </div>

        {/* Double Digit Section */}
        <div className="double-digit-container-rules">
          <p className="title">Double Digit</p>
          <p className="rules-text">
            In the Two-Digit Game, players can select two digits from the last
            three digits of the result in the combinations of AB, BC, or AC.
          </p>
          <div className="info-line">
            <span className="ticket-line">Ticket Price:</span>
            <span className="highlight">20.00</span>
          </div>
          <div className="info-line">
            <span className="ticket-line">Winning Amount:</span>
            <span className="highlight">90X of bet amount</span>
          </div>
        </div>

        {/* Three Digit Section */}
        <div className="three-digit-container">
          <p className="title">Three Digit Game</p>
          <p className="rules-text">
            In the Three-Digit Game, players can place a bet on the ABC
            combination for a chance to win based on the last three digits of
            the result.
          </p>
          <div className="info-line">
            <span className="ticket-line">Ticket Price:</span>
            <span className="highlight">20.00</span>
          </div>
          <div className="info-line">
            <span className="ticket-line">Winning Amount:</span>
            <span className="ticket-line">Up to </span>
            <span className="highlight">900X of bet amount</span>
          </div>
        </div>

        <div className="single-digit-container">
          <p className="title">Game Limits</p>
          <ul className="rules-text">
            <li>Minimum Bet: 20.00</li>
            <li>Maximum Bet: 25,000.00 per bet</li>
            <li>Maximum Winning for one Round: 5,00,000.00</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;

// components/betInfo/BetChipDisplay.tsx
import React from 'react';
import './bet.css'; // Create this CSS file for styling

interface BetChipProps {
  digit: string;
  label?: string; // Optional for single digit where label is often implicit or not needed on the chip
  colorClass?: string; 
}

const BetChipDisplay: React.FC<BetChipProps> = ({ digit, label, colorClass }) => {
  // Determine color class based on label if not explicitly provided
  let chipColorClass = colorClass;
  if (!chipColorClass && label) {
    switch (label.toLowerCase()) {
      case 'a': chipColorClass = 'red'; break;
      case 'b': chipColorClass = 'orange'; break;
      case 'c': chipColorClass = 'blue'; break;
      default: chipColorClass = ''; // No specific color
    }
  }

  return (
    <span className={`bet-chip ${chipColorClass}`}>
      <span className="bet-chip-digit">{digit}</span>
      {label && <span className="bet-chip-label">{label}</span>}
    </span>
  );
};

export default BetChipDisplay;
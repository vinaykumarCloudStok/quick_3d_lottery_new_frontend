// components/Modal.tsx
import React from 'react';
import './modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-open" onClick={onClose}>
      <div className="modal-content-open" onClick={e => e.stopPropagation()}>
        {/* <button className="close-button" onClick={onClose}>X</button> */}
        {children}
      </div>
    </div>
  );
};

export default Modal;

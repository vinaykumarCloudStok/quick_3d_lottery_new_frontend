import React, { useEffect } from 'react'
import { FaExclamationCircle } from 'react-icons/fa'
import '../modals/modal.css'
interface betcloseprop {
    setBetClose: React.Dispatch<React.SetStateAction<boolean>>
    betClose: boolean
}
const BetCloseModal: React.FC<betcloseprop> = ({ betClose, setBetClose }) => {
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (betClose) {
            timer = setTimeout(() => {
                setBetClose(false);
            }, 2000);
        }
        return () => {
            clearTimeout(timer);
        };
    }, [betClose, setBetClose]);
    return (
        <div className="betmodal-placed">
            <div className="check-icon" style={{ background: "#b40000" }}>
                <FaExclamationCircle />
            </div>
            <p className="bet-placed-second" style={{fontSize:"1.3rem", textAlign:"center" }}>
                Betting closed in the last 5 seconds
            </p>
        </div>
    )
}

export default BetCloseModal
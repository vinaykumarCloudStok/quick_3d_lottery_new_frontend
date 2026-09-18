import React, { useEffect } from 'react'
import { FaCheck } from 'react-icons/fa'
import '../modals/modal.css'
import type { betMessage } from '../utility/dataModal'
interface betMsgProp {
    betMessage: betMessage | null
    setBetModal: React.Dispatch<React.SetStateAction<boolean>>
    betModal: boolean
}
const BetMessageModal: React.FC<betMsgProp> = ({ betMessage, setBetModal, betModal }) => {
  
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (betModal) {
            timer = setTimeout(() => {
                setBetModal(false);
            }, 2000);
        }
        return () => {
            clearTimeout(timer);
        };
    }, [betModal, setBetModal]);
    return (
        <div className="betmodal-placed">
            <div className="check-icon">
                <FaCheck />
            </div>
            <p style={{ color: "white", textTransform: "capitalize" }}>{betMessage?.message}</p>
        </div>
    )
}

export default BetMessageModal
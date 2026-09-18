import { useEffect, useState } from "react";
import '../modals/cashout.css';

interface cashProp {
    cashoutData: any;
    cashoutModal: boolean;
    setCashoutModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const CashoutModal: React.FC<cashProp> = ({ cashoutData, cashoutModal, setCashoutModal }) => {
    const [visibleClass, setVisibleClass] = useState<'show' | 'hide'>('hide');
    const isLoss = cashoutData?.status === "LOSS";
    const status = isLoss ? "Loss" : "Won";
    const statusClass = isLoss ? "lost" : "won";
    const emoji = isLoss ? "😞" : "🎉";

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        let hideTimer: ReturnType<typeof setTimeout>;

        if (cashoutModal) {
            setVisibleClass('show');
            timer = setTimeout(() => {
                setVisibleClass('hide');
                hideTimer = setTimeout(() => {
                    setCashoutModal(false);
                }, 600);
            }, 3000);
        }

        return () => {
            clearTimeout(timer);
            clearTimeout(hideTimer);
        };
    }, [cashoutModal, setCashoutModal]);

    return (
        <div className={`cashout-modal ${visibleClass}`}>
            <div className={`modal-content-container ${statusClass}-border`}>
                <div className="status-emoji">{emoji}</div>
                <p className={`status-message ${statusClass}`}>
                    {status === "Won" ? "Congratulations!" : "Unlucky!"}
                </p>
                <p className="sub-message">You have {status}</p>
                <p className="amount-display">
                    {status === "Won" ? `${cashoutData?.mywinningAmount}` : `${cashoutData?.lossAmount}`}
                </p>
            </div>
        </div>
    );
};

export default CashoutModal;

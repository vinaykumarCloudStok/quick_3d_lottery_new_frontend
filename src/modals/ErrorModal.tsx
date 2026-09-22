import React, { useEffect } from 'react'
import '../modals/modal.css'
import { FaExclamationCircle } from 'react-icons/fa';
type errorProps = {
    error: any;
    errorModal: boolean,
    setErrorModal: React.Dispatch<React.SetStateAction<boolean>>;

};

const ErrorModal: React.FC<errorProps> = ({ error, errorModal, setErrorModal }) => {
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (errorModal) {
            timer = setTimeout(() => {
                setErrorModal(false);
            }, 3000);
        }
        return () => {
            clearTimeout(timer);
        };
    }, [errorModal, setErrorModal]);
    return (
        <div className="betmodal-placed">
            <div className="check-icon" style={{ background: "#b40000" }}>
                <FaExclamationCircle />
            </div>
            <p style={{ color: "white", textTransform: "capitalize", fontSize: "1rem", textAlign: "center" }}>
                {error.message}
            </p>
        </div>

    )
}

export default ErrorModal
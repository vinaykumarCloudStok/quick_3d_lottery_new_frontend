// @ts-nocheck
import { useEffect, useState } from "react";
import "../modal/modal.css";
import { FaExclamationCircle } from "react-icons/fa";

const NetworkIssues = () => {
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);

  const checkNetworkSpeed = () => {
    if (navigator.connection) {
      const { effectiveType, downlink, rtt } = navigator.connection;
      const isReallySlowNetwork =
        effectiveType === "2g" || downlink < 0.3 || rtt > 300;
      setIsSlowNetwork(isReallySlowNetwork);
    }
  };

  useEffect(() => {
    checkNetworkSpeed();
    navigator.connection?.addEventListener("change", checkNetworkSpeed);

    return () => {
      navigator.connection?.removeEventListener("change", checkNetworkSpeed);
    };
  }, []);

  useEffect(() => {
    if (isSlowNetwork) {
      const timer = setTimeout(() => {
        setIsSlowNetwork(false);
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer); // Cleanup timeout if component unmounts or state changes
    }
  }, [isSlowNetwork]);

  return (
    <>
      {isSlowNetwork && (
        <div className="betmodal-placed">
          <div className="check-icon" style={{ background: "#b40000" }}>
            <FaExclamationCircle />
          </div>
          <div className="bet-placed-second">LOW INTERNET CONNECTION</div>
        </div>
      )}
    </>
  );
};

export default NetworkIssues;

// Header.tsx
import React from "react";
import "./header.css";
import { icon } from "../../utility/icon"; 
import Timer from "../timer/Timer";
import TimerBar from "../timer/TimerBar"; 

import type { HistoryItem } from "../../utility/dataModal";
type ResultType = { a: number; b: number; c: number };

interface HeaderProps {
  onOpenRules: () => void;
  onOpenHistory: () => void;
  timers: Record<string, string | null>;
  lobbyTab: number;
  id: number; 
  lobby: Record<string, any>;
  historyData: HistoryItem[];
  roundResult: ResultType | null; 
}

const Header: React.FC<HeaderProps> = ({
  onOpenRules,
  onOpenHistory,
  timers,
  lobbyTab,
  lobby,
  id,
  // historyData,
  roundResult, 
}) => {

  const renderTimer = () => {
    switch (lobbyTab) {
      case 0: 
        return <Timer time={timers?.firstTime} />;
      case 1: 
        return <Timer time={timers?.secondTime} />;
      default:
        return null;
    }
  };


  return (
    <>
      {lobbyTab === 0 && <TimerBar time={timers?.firstTime} totalTime={60} />}
      {lobbyTab === 1 && (
        <TimerBar time={timers?.secondTime} totalTime={180} />
      )}
      <div className="quick3d-container">
        <div className="quick3d-header">
          <div className="quick3d-title">
            <div className="quick3d-left">
              <div className="image-wrapper">
                <img
                  className="quick3d-image"
                  alt="Instant Lottery"
                  src={
                    lobbyTab === 0
                      ? icon.imgLogo // For 101
                      : lobbyTab === 1
                      ? icon.img3sec // For 102
                      : icon.imgLogo // Fallback, though usually one of the above
                  }
                  data-loaded="true"
                />
              </div>
              <div className="quick3d-text">
                <div className="quick3d-title">Instant Lottery</div>
                <div className="quick3d-subtitle">
                  <p className="bold-text-last">Current draw</p>
                  <span className="bold-text">{lobby[`parsedData${id}`]}</span>
                </div>
              </div>
            </div>

            <div className="quick3d-last-draw-result">
              <p className="last-draw-label">Last draw result</p>
              {roundResult ? (
                <div className="last-draw-item">
                  <div className="last-draw-numbers">
                    <div className="number-circle red-border">
                      <p className="number-text">{String(roundResult?.a)}</p>
                    </div>
                    <div className="number-circle orange-border">
                      <p className="number-text">{String(roundResult?.b)}</p>
                    </div>
                    <div className="number-circle blue-border">
                      <p className="number-text">{String(roundResult?.c)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p>No data</p>
              )}
            </div>
          </div>

          <div className="quick3d-footer">
            <div className="next-draw-info">
              <div className="next-draw-text">
                <p>Issue No</p>
                <p className="bold-text">{lobby[`parsedData${id}`]}</p>
              </div>
              {renderTimer()}
            </div>

            <div className="rules-section">
              <div className="rules-icon-text" onClick={onOpenRules}>
                <svg
                  className="rules-icon"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 18.75C14.8325 18.75 18.75 14.8325 18.75 10C18.75 5.16751 14.8325 1.25 10 1.25C5.16751 1.25 1.25 5.16751 1.25 10C1.25 14.8325 5.16751 18.75 10 18.75ZM9.97997 9.24892C9.32709 9.75353 8.59362 10.3204 8.73011 11.3409H10.2074C10.1158 10.5513 10.7013 10.1075 11.3052 9.64958C11.9007 9.19803 12.5142 8.73285 12.5142 7.90909C12.5142 6.39773 11.3097 5.625 9.66193 5.625C8.44602 5.625 7.44602 6.18182 6.71875 7.02273L7.65057 7.875C8.20739 7.29545 8.77557 6.97727 9.46875 6.97727C10.3665 6.97727 10.9119 7.36364 10.9119 8.05682C10.9119 8.52861 10.4685 8.87133 9.97997 9.24892ZM8.46875 13.3636C8.46875 13.9545 8.8892 14.375 9.48011 14.375C10.0483 14.375 10.4801 13.9545 10.4801 13.3636C10.4801 12.7727 10.0483 12.3636 9.48011 12.3636C8.90057 12.3636 8.46875 12.7727 8.46875 13.3636Z"
                    fill="currentColor"
                  />
                </svg>
                Rules
              </div>
              <div className="divider" />
              <div className="video-icon-wrapper" onClick={onOpenHistory}>
                <svg
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="video-icon"
                >
                  <path
                    d="M1.66602 18.834H18.3327"
                    stroke="var(--basic-color-white)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1.66602 11.334L4.99935 12.1673V16.334H1.66602V11.334Z"
                    fill="var(--basic-color-white)"
                  />
                  <path
                    d="M8.33398 10.5007L11.6673 8.83398V16.334H8.33398V10.5007Z"
                    fill="var(--basic-color-white)"
                  />
                  <path
                    d="M15 7.16667L18.3333 5.5V16.3333H15V7.16667Z"
                    fill="var(--basic-color-white)"
                  />
                  <path
                    d="M1.66602 7.99935L4.99935 8.83268L18.3327 2.16602H14.166"
                    stroke="var(--basic-color-white)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="dropdown-arrow"
                >
                  <path
                    d="M2.77778 5L5.88889 8.11111L9 5"
                    stroke="var(--basic-color-white)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="circle-left" />
            <div className="circle-right" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
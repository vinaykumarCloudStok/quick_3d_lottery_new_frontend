import React, { useEffect, useState } from "react";
import "./timer.css";

interface TimeProp {
  time: string | null;
  totalTime: number;
}

const TimerBar: React.FC<TimeProp> = ({ time, totalTime }) => {
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (!time) return;

    const parsedTime = parseInt(time, 10);
    setRemainingTime(parsedTime);

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  const progress = remainingTime <= 0 ? 0 : (remainingTime / totalTime) * 100;
  const transformValue = 100 - progress;
  return (
    <div
      className="progress-bar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${Math.round(progress)}%`}
    >
      <div className="inside-p-bar">
        <div
          className={`bar-color ${time==null?"bar-color-dis":""}`}
          style={{ transform: `translateX(-${Math.round(transformValue)}%)` }}
        ></div>
      </div>
    </div>
  );
};

export default TimerBar;

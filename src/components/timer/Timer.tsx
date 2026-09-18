import { formatTimeAsArray } from "../../utility/dataModal";

interface TimeProps {
  time: string | null;
  status?: string;
}

const Timer: React.FC<TimeProps> = ({ time, status }) => {
  const totalSeconds = (status === "ENDED" || status === "RESULT") ? 0 : parseInt(time || '0', 10);
  const [hours, minutes, seconds] = formatTimeAsArray(totalSeconds);
  
  return (
    <div className="timer-div">
      <div className="timer-box">
        <div className="time-box">{String(hours).padStart(2, '0')}</div>
        <div className="hou">HOU</div>
      </div>
      <span>:</span>
      <div className="timer-box">
        <div className="time-box">{String(minutes).padStart(2, '0')}</div>
        <div className="hou">MIN</div>
      </div>
      <span>:</span>
      <div className="timer-box">
        <div className="time-box">{String(seconds).padStart(2, '0')}</div>
        <div className="hou">SEC</div>
      </div>
    </div>
  );
};
export default Timer
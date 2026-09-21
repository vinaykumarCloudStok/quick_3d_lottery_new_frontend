import React, { useEffect, useRef } from "react";
import "./threeDigit.css"; // Assuming this CSS file exists
import { IoIosArrowBack } from "react-icons/io";
import { icon } from "../../utility/icon"; // Assuming this path is correct for icon assets
import { BiVolumeMute, BiSolidVolumeFull } from "react-icons/bi";

import {
  formatBalance,
  type Info,
  type QueryParams,
} from "../../utility/dataModal"; // Assuming these types and utility exist
import { useAppContext } from "../../context/SoundContext"; // **Important: You need to create this context**
import { muteAllSounds, playAllSounds } from "../../utility/gameSetting"; // Import sound control functions

// Define interfaces for props
interface ThreeDigitGameHeaderProps {
  info?: Info | any; // 'any' for flexibility, but it's better to type 'info' precisely
  queryParams: QueryParams;
}

const ThreeDigitGameHeader: React.FC<ThreeDigitGameHeaderProps> = ({
  info,
  queryParams,
}) => {
  const { sound, setSound } = useAppContext();
  const lastSoundState = useRef(sound);

  const toggleSound = () => {
    const newSoundState = !sound; // Calculate the new sound state
    setSound(newSoundState); // Update the sound state in the context
    newSoundState ? playAllSounds() : muteAllSounds();
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastSoundState.current = sound; // Store current sound state
        if (sound) {
          muteAllSounds();
        }
      } else {
        if (lastSoundState.current) {
          playAllSounds();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sound, setSound]); // Depend on 'sound' and 'setSound' to re-run if they change

  return (
    <div className="header-wrapper">
      <div className="header-spacer" />
      <div className="header-bar">
        <div className="header-left-wrapper">
          <div className="back-icon-wrapper">
            <div
              className="back-logo"
              onClick={(e) => {
                e.preventDefault();
                window.location.replace(
                  `${import.meta.env.VITE_APP_BASE_LOBBY_URL}?id=${queryParams?.id}&t=${Date.now()}`,
                );
              }}
            >
              <IoIosArrowBack style={{ fontSize: "28px", marginTop: "4px" }} />
            </div>
          </div>
          <div className="game-three">Instant Lottery</div>
          <div className="sound-icon" onClick={toggleSound}>
            {/* Conditionally render volume icon based on 'sound' state */}
            {sound ? <BiSolidVolumeFull /> : <BiVolumeMute />}
          </div>
        </div>

        <div className="header-right">
          <div className="balance-info">
            <div className="balance-section-head">
              <span className="bal">Balance</span>
              {/* Ensure info and balance exist before accessing */}
              <span className="bal-amount">
                {info?.balance ? formatBalance(info.balance) : "N/A"}
              </span>
            </div>
            <div className="relative">
              <img alt="wallet" src={icon.walletIcon} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDigitGameHeader;

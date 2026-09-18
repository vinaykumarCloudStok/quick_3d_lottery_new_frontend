import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home/Home";
import { SoundProvider } from "./context/SoundContext";
import { useEffect, useState } from "react";

function App() {
  const [shouldShowRotateImage, setShouldShowRotateImage] =
    useState<boolean>(false);

  useEffect(() => {
    const adjustHeight = () => {
      const userAgent = navigator.userAgent;
      const isLandscape = window.innerWidth > window.innerHeight;

      // Define thresholds for showing the rotate image
      // These values are examples; adjust them based on your design needs.
      const MIN_HEIGHT_FOR_LANDSCAPE = 550; // Example minimum height for landscape to be comfortable
      const MAX_WIDTH_FOR_ROTATE_PROMPT = 900; // Example max width where you'd show the prompt

      // Logic for showing the rotate image
      // Show rotate image if in landscape AND the screen is too small (height or width)
      if (
        isLandscape &&
        (window.innerHeight < MIN_HEIGHT_FOR_LANDSCAPE ||
          window.innerWidth < MAX_WIDTH_FOR_ROTATE_PROMPT)
      ) {
        setShouldShowRotateImage(true);
      } else {
        setShouldShowRotateImage(false);
      }

      // Adjust --viewport-height CSS variable
      if (isLandscape) {
        // In landscape, set viewport height to full window height
        document.documentElement.style.setProperty(
          "--viewport-height",
          `${window.innerHeight}px`,
        );
      } else {
        // In portrait, adjust for browser headers/footers
        let headerHeight = 0;
        const isIPhone = /iPhone/i.test(userAgent);
        const isAndroid = /Android/i.test(userAgent);
        const isSafari =
          isIPhone && /Safari/i.test(userAgent) && !/CriOS/i.test(userAgent);
        const isChromeiOS = isIPhone && /CriOS/i.test(userAgent);

        if (isSafari) {
          headerHeight = 79; // iPhone Safari
        } else if (isChromeiOS) {
          headerHeight = 0; // iPhone Chrome (often handles this differently)
        } else if (isAndroid) {
          headerHeight = 60; // Android (often has a consistent top bar)
        } else {
          headerHeight = 110; // Default for other browsers/desktops in portrait
        }

        const usableHeight = window.innerHeight - headerHeight;
        document.documentElement.style.setProperty(
          "--viewport-height",
          `${usableHeight}px`,
        );
      }
    };

    // Initial adjustment
    adjustHeight();

    // Add event listener for resize
    window.addEventListener("resize", adjustHeight);

    // Cleanup on component unmount
    return () => window.removeEventListener("resize", adjustHeight);
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    <SoundProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Home shouldShowRotateImage={shouldShowRotateImage} />}
          />
        </Routes>
      </BrowserRouter>
    </SoundProvider>
  );
}

export default App;

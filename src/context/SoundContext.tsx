import React, { createContext, useContext, useState, type ReactNode, } from "react";

// Define the shape of the context data
interface AppContextType {
  sound: boolean;
  setSound: React.Dispatch<React.SetStateAction<boolean>>;

}

// Create the context with a default value
const SoundContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sound, setSound] = useState<boolean>(false);
  return (
    <SoundContext.Provider value={{sound, setSound }}>
      {children} 
    </SoundContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useAppContext must be used within a SoundProvider");
  }
  return context;
};

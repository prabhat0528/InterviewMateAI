import React, { createContext, useState } from "react";

export const FlashContext = createContext();

export const FlashProvider = ({ children }) => {
  const [flash, setFlash] = useState(null);

  const showFlash = (message, type = "success") => {
    setFlash({ message, type });
    setTimeout(() => setFlash(null), 3000); 
  };

  return (
    <FlashContext.Provider value={{ flash, showFlash }}>
      {children}
    </FlashContext.Provider>
  );
};

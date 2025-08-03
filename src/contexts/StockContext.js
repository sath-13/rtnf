import React, { useState, createContext } from "react";

export const StockContext = createContext();

function StockProvider({ children }) {
  const [deviceCategory, setDeviceCategory] = useState("System");
  const [refreshstock, setRefreshstock] = useState(false);
  const toggleRefresh = () => setRefreshstock((prev) => !prev);

  return <StockContext.Provider value={{ deviceCategory, setDeviceCategory, refreshstock, toggleRefresh  }}>{children}</StockContext.Provider>;
}

export default StockProvider;

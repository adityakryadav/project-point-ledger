import React, { createContext, useMemo } from 'react';

export const AppContext = createContext({});

export default function AppProvider({ children, value }) {
  const contextValue = useMemo(() => value ?? {}, [value]);
  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}


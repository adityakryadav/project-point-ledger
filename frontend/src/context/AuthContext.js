import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    totalPoints: 0,
    walletBalance: 0,
    exchangedPoints: 0,
    activeRequests: 0,
    verifiedCredits: 0,
    pendingRequests: 0,
    platformFees: 0,
  });
  const [transactions, setTransactions] = useState([]);

  const dashboardKey = (email) => `dashboard_${email}`;
  const transactionsKey = (email) => `transactions_${email}`;

  const loadDashboard = (email) => {
    try {
      const raw = localStorage.getItem(dashboardKey(email));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      return null;
    }
    return null;
  };

  const saveDashboard = (email, data) => {
    if (!email) return;
    localStorage.setItem(dashboardKey(email), JSON.stringify(data));
  };

  const loadTransactions = (email) => {
    try {
      const raw = localStorage.getItem(transactionsKey(email));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
    return [];
  };

  const saveTransactions = (email, data) => {
    if (!email) return;
    localStorage.setItem(transactionsKey(email), JSON.stringify(data));
  };

  useEffect(() => {
    // Check localStorage for existing user session
    const storedUser = localStorage.getItem('point_ledger_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);

      const dashboardData = loadDashboard(parsedUser.email) || {
        totalPoints: 0,
        walletBalance: 0,
        exchangedPoints: 0,
        activeRequests: 0,
        verifiedCredits: 0,
        pendingRequests: 0,
        platformFees: 0,
      };
      setDashboard(dashboardData);

      const txData = loadTransactions(parsedUser.email);
      setTransactions(txData);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initDashboardForUser = (email) => {
    const init = {
      totalPoints: 0,
      walletBalance: 0,
      exchangedPoints: 0,
      activeRequests: 0,
      verifiedCredits: 0,
      pendingRequests: 0,
      platformFees: 0,
    };
    setDashboard(init);
    saveDashboard(email, init);
    return init;
  };

  const updateDashboard = (updates) => {
    if (!user?.email) return;
    setDashboard((current) => {
      const next = {
        ...current,
        ...updates,
      };
      saveDashboard(user.email, next);
      return next;
    });
  };

  const appendTransaction = (tx) => {
    if (!user?.email) return;
    const next = [...transactions, tx];
    setTransactions(next);
    saveTransactions(user.email, next);
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('point_ledger_user', JSON.stringify(userData));

    const existing = loadDashboard(userData.email);
    if (existing) {
      setDashboard(existing);
    } else {
      initDashboardForUser(userData.email);
    }

    const existingTx = loadTransactions(userData.email);
    setTransactions(existingTx);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setDashboard({
      totalPoints: 0,
      walletBalance: 0,
      exchangedPoints: 0,
      activeRequests: 0,
      verifiedCredits: 0,
      pendingRequests: 0,
      platformFees: 0,
    });
    setTransactions([]);
    localStorage.removeItem('point_ledger_user');
    // don't remove user-specific data; preserve for later
  };

  const signup = (userData) => {
    // In a mock setup, signup is same as login
    login(userData);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('point_ledger_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      dashboard,
      transactions,
      login,
      logout,
      signup,
      updateUser,
      initDashboardForUser,
      updateDashboard,
      appendTransaction,
      loading,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

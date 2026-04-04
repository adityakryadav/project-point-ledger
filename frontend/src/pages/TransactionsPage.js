import React, { useEffect, useState } from 'react';
import TransactionsTable from '../components/transactions/TransactionsTable';
import { useAuth } from '../context/AuthContext';

export default function TransactionsPage() {
  const { transactions } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setRows(transactions || []);
      setLoading(false);
    }, 150);
  }, [transactions]);

  return (
    <div className="space-y-6 ui-fade-in-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Transactions</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your recent point exchanges (live user data).</p>
      </div>

      <TransactionsTable
        rows={rows}
        loading={loading}
        error={error}
        onRetry={() => {
          setError(null);
          setLoading(true);
          setTimeout(() => {
            setRows(transactions || []);
            setLoading(false);
          }, 150);
        }}
      />
    </div>
  );
}


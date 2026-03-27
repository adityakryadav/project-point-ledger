import React from 'react';
import TransactionsTable from '../components/transactions/TransactionsTable';

function getMockRows() {
  return [
    { id: 'tx_1001', date: '2026-03-12', type: 'Exchange', amount: 2500, status: 'success' },
    { id: 'tx_1002', date: '2026-03-11', type: 'Exchange', amount: 980, status: 'pending' },
    { id: 'tx_1003', date: '2026-03-09', type: 'Exchange', amount: 15200, status: 'failed' },
    { id: 'tx_1004', date: '2026-03-08', type: 'Exchange', amount: 430, status: 'success' },
    { id: 'tx_1005', date: '2026-03-06', type: 'Exchange', amount: 6400, status: 'pending' },
    { id: 'tx_1006', date: '2026-03-05', type: 'Exchange', amount: 720, status: 'success' },
  ];
}

export default function TransactionsPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [rows, setRows] = React.useState([]);

  function load() {
    setLoading(true);
    setError(null);

    window.setTimeout(() => {
      const shouldError = Math.random() < 0.1;
      if (shouldError) {
        setError('Network timeout. Showing fallback error state.');
        setRows([]);
        setLoading(false);
        return;
      }

      setRows(getMockRows());
      setLoading(false);
    }, 700);
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 ui-fade-in-up">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Transactions</h1>
        <p className="mt-1 text-sm text-slate-400">Your recent point exchanges (mock data).</p>
      </div>

      <TransactionsTable rows={rows} loading={loading} error={error} onRetry={load} />
    </div>
  );
}


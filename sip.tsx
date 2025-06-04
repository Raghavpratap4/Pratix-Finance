import Link from 'next/link';
import { useState } from 'react';

export default function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);
  const [result, setResult] = useState(null);

  const calculateSIP = () => {
    const months = years * 12;
    const r = rate / 12 / 100;
    const amount = monthly * ((Math.pow(1 + r, months) - 1) * (1 + r)) / r;
    setResult(amount.toFixed(2));
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-blue-50 text-center">
      <Link href="/" className="bg-white px-4 py-2 rounded-xl shadow mb-4 border">🏠 Home</Link>
      <h1 className="text-2xl font-bold mb-4">SIP Calculator</h1>

      <div className="bg-white p-6 rounded-xl shadow-md w-80 flex flex-col gap-4">
        <input type="number" placeholder="Monthly SIP Amount (₹)" value={monthly} onChange={e => setMonthly(+e.target.value)} className="border p-2 rounded" />
        <input type="number" placeholder="Investment Duration (Years)" value={years} onChange={e => setYears(+e.target.value)} className="border p-2 rounded" />
        <input type="number" placeholder="Expected Annual Return Rate (%)" value={rate} onChange={e => setRate(+e.target.value)} className="border p-2 rounded" />
        <button onClick={calculateSIP} className="bg-blue-600 text-white py-2 rounded">Calculate SIP</button>
        {result && <div className="text-lg font-semibold">Estimated Returns: ₹{result}</div>}
      </div>
    </main>
  );
}
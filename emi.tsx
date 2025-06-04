import Link from 'next/link';
import { useState } from 'react';

export default function EMICalculator() {
  const [loan, setLoan] = useState(500000);
  const [rate, setRate] = useState(10);
  const [tenure, setTenure] = useState(5);
  const [emi, setEmi] = useState(null);

  const calculateEMI = () => {
    const monthlyRate = rate / 12 / 100;
    const months = tenure * 12;
    const emiVal = (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    setEmi(emiVal.toFixed(2));
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-blue-50 text-center">
      <Link href="/" className="bg-white px-4 py-2 rounded-xl shadow mb-4 border">🏠 Home</Link>
      <h1 className="text-2xl font-bold mb-4">EMI Calculator</h1>

      <div className="bg-white p-6 rounded-xl shadow-md w-80 flex flex-col gap-4">
        <input type="number" placeholder="Loan Amount (₹)" value={loan} onChange={e => setLoan(+e.target.value)} className="border p-2 rounded" />
        <input type="number" placeholder="Annual Interest Rate (%)" value={rate} onChange={e => setRate(+e.target.value)} className="border p-2 rounded" />
        <input type="number" placeholder="Loan Tenure (Years)" value={tenure} onChange={e => setTenure(+e.target.value)} className="border p-2 rounded" />
        <button onClick={calculateEMI} className="bg-blue-600 text-white py-2 rounded">Calculate EMI</button>
        {emi && <div className="text-lg font-semibold">Monthly EMI: ₹{emi}</div>}
      </div>
    </main>
  );
}
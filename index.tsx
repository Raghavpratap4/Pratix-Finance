import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-white to-blue-100 text-center">
      <img src="/logo.png" alt="Logo" className="w-24 mb-4" />
      <h1 className="text-4xl font-bold text-orange-600">Pratix <span className="text-gray-800">Finance</span></h1>
      <p className="text-gray-600 mt-2 mb-6">Finance Tools for Everyone</p>

      <div className="flex flex-col gap-4 w-72">
        <Link href="/emi" className="bg-white py-2 px-4 rounded-xl shadow text-lg font-medium border hover:bg-gray-50">
          🏠 EMI Calculator
        </Link>
        <Link href="/sip" className="bg-white py-2 px-4 rounded-xl shadow text-lg font-medium border hover:bg-gray-50">
          📈 SIP Calculator
        </Link>
      </div>

      <footer className="mt-12 text-sm text-gray-500">
        Crafted with ❤️ by Raghav Pratap • © 2025 Pratix Finance
      </footer>
    </main>
  );
}
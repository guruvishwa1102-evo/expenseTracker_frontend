import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, TrendingUp, TrendingDown, DollarSign, Wallet, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Tracker() {
  // 📊 State is now empty by default, waiting for the database
  const [transactions, setTransactions] = useState([]);

  // 📝 Form States
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Rip up the digital wristband
    navigate('/login'); // Kick them back to the login page
  };

  // 🌐 FETCH DATA FROM MONGODB ON LOAD
  useEffect(() => {
    fetch('https://expensetracker-api-nezd.onrender.com/api/expenses')
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  // 🧮 Calculations
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalBalance = income - expenses;

  // ➕ ADD TRANSACTION TO MONGODB (Upgraded Error Checking)
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    
    // 1. Check if fields are empty
    if (!text || !amount) {
      alert("Please enter both a description and an amount!");
      return;
    }

    const newTransaction = {
      text,
      amount: parseFloat(amount),
      type,
      category
    };

    try {
      const response = await fetch('https://expensetracker-api-nezd.onrender.com/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });
      
      const savedData = await response.json();
      
      // 🚨 NEW: If the database rejects it, show us why!
      if (!response.ok) {
        console.error("Backend Error:", savedData);
        alert("Database Error: " + savedData.error);
        return; 
      }
      
      // If success, update the screen!
      setTransactions([savedData, ...transactions]);
      setText('');
      setAmount('');
    } catch (err) {
      console.error("Network Error:", err);
      alert("Could not connect to the server!");
    }
  };

  // ❌ DELETE TRANSACTION FROM MONGODB
  const handleDeleteTransaction = async (id) => {
    try {
      await fetch(`https://expensetracker-api-nezd.onrender.com/api/expenses/${id}`, {
        method: 'DELETE'
      });
      
      // Remove it from the screen
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* 🌟 Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl text-slate-900">
              <Wallet size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Smart Expense Tracker</h1>
              <p className="text-sm text-slate-400">Monitor your income, expenses, and visual analytics</p>
            </div>
          </div>
          
          {/* 🚪 Logout Button */}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white font-bold py-2 px-4 rounded-xl transition-all duration-150 border border-rose-500/20"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </header>

        {/* 💳 Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-400">Total Balance</span>
              <DollarSign className="text-emerald-400" size={20} />
            </div>
            <h2 className={`text-3xl font-black ${totalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${totalBalance.toLocaleString()}
            </h2>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-400">Total Income</span>
              <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400">
                <TrendingUp size={18} />
              </div>
            </div>
            <h2 className="text-3xl font-black text-emerald-400">${income.toLocaleString()}</h2>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-400">Total Expenses</span>
              <div className="bg-rose-500/10 p-1.5 rounded-lg text-rose-400">
                <TrendingDown size={18} />
              </div>
            </div>
            <h2 className="text-3xl font-black text-rose-400">${expenses.toLocaleString()}</h2>
          </div>
        </div>

        {/* 🛠️ Main Content: Form & History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl h-fit">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle size={20} className="text-emerald-400" /> Add Transaction
            </h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <input 
                  type="text" 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g., Groceries, Salary, Gas" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amount ($)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Food">Food</option>
                    <option value="Salary">Salary</option>
                    <option value="Housing">Housing</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Investment">Investment</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-150 flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                Add Transaction
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Transaction History</h3>
            
            {transactions.length === 0 ? (
              <p className="text-slate-500 text-center py-12">No transactions recorded yet.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction._id} 
                    className="group bg-slate-900/60 border border-slate-700/40 rounded-xl p-4 flex justify-between items-center hover:border-slate-600/60 transition-all duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-10 rounded-full ${transaction.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div>
                        <p className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{transaction.text}</p>
                        <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-slate-400 font-medium mt-1 inline-block">
                          {transaction.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`font-bold text-lg ${transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                      </span>
                      <button 
                        onClick={() => handleDeleteTransaction(transaction._id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
                        title="Delete Transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
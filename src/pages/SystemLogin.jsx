import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, LogIn, Shield, Users, Layers, AlertCircle, ArrowRight } from 'lucide-react';

const SystemLogin = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      const role = res.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'sales_rep') navigate('/sales-rep');
      else if (role === 'storekeeper') navigate('/storekeeper');
      else navigate('/');
    } else {
      setError(res.error || 'البيانات المدخلة غير صحيحة');
    }
  };

  const handleQuickDemoLogin = (role, demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo123');
    switchDemoRole(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'sales_rep') navigate('/sales-rep');
    else if (role === 'storekeeper') navigate('/storekeeper');
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-200">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-3">
        <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-600/30">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">
          نظام أبيكس لإدارة المبيعات والمخازن
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          تسجيل الدخول السري للموظفين للوصول إلى لوحة التحكم
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@apex.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
            </button>
          </form>

          {/* Quick Demo Access Bar (Hidden logic can be here, but kept for evaluation) */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-center">
              دخول تجريبي سريع (لأغراض التقييم)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin', 'admin@apex.com')}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>التاجر (الإدارة)</span>
                <Shield className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('sales_rep', 'sami@apex.com')}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>المندوب</span>
                <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('storekeeper', 'tariq@apex.com')}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>أمين المخزن</span>
                <Users className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('customer', '')}
                className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-colors"
              >
                <span>الزبون</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default SystemLogin;

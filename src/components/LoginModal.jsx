import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Building2, LogIn, AlertCircle, X, Lock } from 'lucide-react';

const LoginModal = () => {
  const { login, isLoginModalOpen, closeLoginModal } = useAuth();
  const { users } = useData();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [gatewayPin, setGatewayPin] = useState('');
  
  const [selectedEmail, setSelectedEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize selected email when users load or modal opens
  useEffect(() => {
    if (isLoginModalOpen && users && users.length > 0 && !selectedEmail) {
      const activeStaff = users.filter(u => u.role !== 'customer' && u.isActive);
      if (activeStaff.length > 0) {
        setSelectedEmail(activeStaff[0].email);
      }
    }
  }, [isLoginModalOpen, users, selectedEmail]);

  if (!isLoginModalOpen) return null;

  const handleGatewaySubmit = (e) => {
    e.preventDefault();
    if (gatewayPin === '5555') {
      setError('');
      setStep(2);
    } else {
      setError('رمز البوابة غير صحيح');
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const paddedPin = pin.padEnd(6, pin.charAt(0) || '0');
    const res = await login(selectedEmail, paddedPin);
    setLoading(false);

    if (res.success) {
      const role = res.user.role;
      handleClose();
      
      // Redirect based on role
      if (role === 'admin') navigate('/admin');
      else if (role === 'sales_rep') navigate('/sales-rep');
      else if (role === 'storekeeper') navigate('/storekeeper');
      else navigate('/');
    } else {
      setError(res.error || 'البيانات المدخلة غير صحيحة');
    }
  };

  const handleClose = () => {
    setStep(1);
    setGatewayPin('');
    setPin('');
    setError('');
    closeLoginModal();
  };

  // Filter staff to show in dropdown
  const staffUsers = users.filter(u => u.role !== 'customer' && u.isActive);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 py-8">
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl shadow-xl shadow-indigo-600/30">
              {step === 1 ? <Lock className="w-6 h-6 text-white" /> : <Building2 className="w-6 h-6 text-white" />}
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              {step === 1 ? 'بوابة الموظفين' : 'قفل دخول الموظفين'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {step === 1 ? 'الرجاء إدخال رمز البوابة للعبور' : 'الرجاء تحديد هويتك وإدخال الرمز السري'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleGatewaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  رمز البوابة (Gateway PIN)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  value={gatewayPin}
                  onChange={(e) => setGatewayPin(e.target.value.replace(/\D/g, ''))}
                  maxLength="4"
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 text-center tracking-[1em] font-bold text-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  dir="ltr"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>التحقق من البوابة</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRoleSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اختر الموظف
                </label>
                <select
                  value={selectedEmail}
                  onChange={(e) => {
                    setSelectedEmail(e.target.value);
                    setPin('');
                    setError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {staffUsers.map(u => (
                    <option key={u.id} value={u.email}>
                      {u.name} ({u.role === 'admin' ? 'التاجر' : u.role === 'sales_rep' ? 'مندوب' : 'أمين المخزن'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الرمز السري (PIN Code)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  maxLength="6"
                  placeholder="••••"
                  className="w-full px-3.5 py-2.5 text-center tracking-[1em] font-bold text-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  dir="ltr"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'جاري التحقق...' : 'فتح القفل'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Building2, ShoppingCart, LogOut, LayoutDashboard, 
  Package, Users, Store, ArrowLeftRight, Layers, Receipt, Shield, Moon, Sun, Menu, X, Key, XCircle
} from 'lucide-react';

const Navbar = ({ cartCount = 0 }) => {
  const { currentUser, userRole, logout, openLoginModal } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActivePath = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              أبيكس للمبيعات
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 mr-2 px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800">
              ERP & POS
            </span>
          </div>
        </Link>

        {/* Role-Based Navigation Items */}
        <nav className="hidden md:flex items-center gap-1">
          {userRole === 'customer' && (
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isActivePath('/') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>كتالوج المنتجات</span>
            </Link>
          )}

          {userRole === 'admin' && (
            <>
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActivePath('/admin') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>لوحة تحكم التاجر</span>
              </Link>
              <Link
                to="/pos"
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActivePath('/pos') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>شاشة البيع</span>
              </Link>
            </>
          )}

          {userRole === 'sales_rep' && (
            <>
              <Link
                to="/sales-rep"
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActivePath('/sales-rep') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>مخزني الخاص</span>
              </Link>
              <Link
                to="/pos"
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActivePath('/pos') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>شاشة بيع المندوب</span>
              </Link>
            </>
          )}

          {userRole === 'storekeeper' && (
            <>
              <Link
                to="/storekeeper"
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActivePath('/storekeeper') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>المخزن الرئيسي</span>
              </Link>
              <Link
                to="/pos"
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isActivePath('/pos') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>بيع مباشر (أمين مخزن)</span>
              </Link>
            </>
          )}
        </nav>

        {/* Right Tools & Role Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="القائمة"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            title={isDarkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User Status / Logout (NO login link for public customers!) */}
          {currentUser && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold">{currentUser.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.email}</span>
              </div>
              <button
                onClick={handleLogout}
                title="تسجيل الخروج"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Drawer/Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 absolute top-16 left-0 right-0 shadow-2xl animate-in slide-in-from-top-2 z-50">
          <nav className="flex flex-col p-4 gap-2">
            {userRole === 'customer' && (
              <>
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                    isActivePath('/') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>كتالوج المنتجات</span>
                </Link>
                
                <div className="flex-1 mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openLoginModal();
                    }}
                    className="w-full text-right px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Shield className="w-5 h-5" />
                    <span>بوابة الموظفين</span>
                  </button>
                </div>
              </>
            )}

            {userRole === 'admin' && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                    isActivePath('/admin') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>لوحة تحكم التاجر</span>
                </Link>
                <Link
                  to="/pos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                    isActivePath('/pos') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Receipt className="w-5 h-5" />
                  <span>شاشة البيع</span>
                </Link>
              </>
            )}

            {userRole === 'sales_rep' && (
              <>
                <Link
                  to="/sales-rep"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                    isActivePath('/sales-rep') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                  <span>مخزني الخاص</span>
                </Link>
                <Link
                  to="/pos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                    isActivePath('/pos') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Receipt className="w-5 h-5" />
                  <span>شاشة بيع المندوب</span>
                </Link>
              </>
            )}

            {userRole === 'storekeeper' && (
              <>
                <Link
                  to="/storekeeper"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                    isActivePath('/storekeeper') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>المخزن الرئيسي</span>
                </Link>
                <Link
                  to="/pos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all ${
                    isActivePath('/pos') ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Receipt className="w-5 h-5" />
                  <span>بيع مباشر (أمين مخزن)</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;

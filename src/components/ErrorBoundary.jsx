import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4" dir="rtl">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex items-center gap-4 text-rose-500 mb-6">
              <AlertCircle className="w-10 h-10 shrink-0" />
              <h1 className="text-2xl font-bold">حدث خطأ غير متوقع (Crash)</h1>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400 mb-4 font-semibold text-sm">
              تفاصيل الخطأ التقني:
            </p>
            
            <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap border border-slate-200 dark:border-slate-800" dir="ltr">
              <div className="font-bold text-rose-600 dark:text-rose-400 mb-2">
                {this.state.error && this.state.error.toString()}
              </div>
              <div className="text-[10px] leading-relaxed text-slate-500">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </div>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

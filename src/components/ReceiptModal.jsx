import React from 'react';
import { Printer, X, CheckCircle2, Building2, Phone, MapPin } from 'lucide-react';

const ReceiptModal = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Action Header (Hidden during print) */}
        <div className="no-print flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>تمت العملية بنجاح</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الوصل</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div id="printable-receipt" className="p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
            <h1 className="text-xl font-bold tracking-tight uppercase">أبيكس للمبيعات والمخازن</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">حلول تجارة الجملة والتوزيع</p>
            <p className="text-xs text-slate-500 dark:text-slate-400" dir="ltr">Tel: +964 770 000 9999 | Baghdad</p>
            <div className="mt-3 inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs rounded-full border border-slate-200 dark:border-slate-700">
              رقم الوصل: {order.id}
            </div>
          </div>

          {/* Customer & Transaction Info */}
          <div className="py-4 text-xs space-y-1.5 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">التاريخ والوقت:</span>
              <span className="font-medium" dir="ltr">{new Date(order.createdAt).toLocaleString('en-GB')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">اسم البائع:</span>
              <span className="font-medium">{order.createdByName} ({order.sellerRole === 'storekeeper' ? 'أمين مخزن' : 'مندوب'})</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex justify-between font-semibold">
                <span>اسم الزبون (المحل):</span>
                <span>{order.customerName}</span>
              </div>
              {order.customerOwner && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>صاحب المحل:</span>
                  <span>{order.customerOwner}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>رقم الهاتف:</span>
                  <span dir="ltr">{order.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-4 border-b border-dashed border-slate-300 dark:border-slate-700">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-1">المادة</th>
                  <th className="py-1 text-center">الكمية</th>
                  <th className="py-1 text-left">السعر</th>
                  <th className="py-1 text-left">المجموع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {order.items && order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 pl-2 font-medium">{item.name}</td>
                    <td className="py-2 text-center text-slate-600 dark:text-slate-400 font-mono">{item.qty}</td>
                    <td className="py-2 text-left font-mono text-slate-600 dark:text-slate-300">${item.price.toFixed(2)}</td>
                    <td className="py-2 text-left font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      ${(item.price * item.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Financial Breakdown */}
          <div className="py-4 text-xs space-y-2 border-b border-dashed border-slate-300 dark:border-slate-700 font-mono">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>مجموع القائمة:</span>
              <span className="font-semibold">${(order.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-amber-600 dark:text-amber-400">
              <span>الديون السابقة:</span>
              <span className="font-semibold">+ ${(order.previousDebt || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>المجموع الكلي:</span>
              <span className="text-emerald-600 dark:text-emerald-400">${(order.grandTotal || order.totalAmount + order.previousDebt).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-1">
              <span>المبلغ الواصل:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">- ${(order.paidAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-rose-600 dark:text-rose-400 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>الباقي (الديون):</span>
              <span>${(order.remainingDebt || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p className="font-medium text-slate-700 dark:text-slate-300">شكراً لتعاملكم معنا!</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">تم استلام المواد بحالة جيدة. البضاعة المباعة لا ترد ولا تستبدل.</p>
          </div>
        </div>

        {/* Modal Footer (Hidden during print) */}
        <div className="no-print p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl text-sm transition-all cursor-pointer"
          >
            إغلاق الوصل
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReceiptModal;

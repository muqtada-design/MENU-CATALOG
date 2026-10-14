import React, { useRef } from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';
import { formatIQD } from '../utils/currency';

const ReceiptModal = ({ order, onClose }) => {
  const receiptRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  const grandTotal = order.grandTotal ?? ((order.totalAmount || 0) + (order.previousDebt || 0));

  return (
    <>
      {/*
        ─── PRINT STYLESHEET ────────────────────────────────────────────────
        Strategy: "visibility" trick – hide ALL body children, then un-hide
        only #apex-receipt and all its descendants. The element is already
        in the real DOM so no cloning / portal needed.
        ─────────────────────────────────────────────────────────────────────
      */}
      <style>{`
        @media print {
          /* 1. Force white background on html/body, never hide them */
          html, body {
            background: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 2. Collapse every element on the page */
          body * {
            visibility: hidden !important;
          }

          /* 3. Make only the receipt and its children visible */
          #apex-receipt,
          #apex-receipt * {
            visibility: visible !important;
          }

          /* 4. Position receipt at top-left so it fills the page */
          #apex-receipt {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 16px 20px !important;
            background: #fff !important;
            color: #000 !important;
            direction: rtl !important;
            font-family: 'Arial', 'Tahoma', sans-serif !important;
            font-size: 12px !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }

          /* 5. Force all text inside receipt to black */
          #apex-receipt h1,
          #apex-receipt h2,
          #apex-receipt h3,
          #apex-receipt p,
          #apex-receipt span,
          #apex-receipt td,
          #apex-receipt th,
          #apex-receipt div {
            color: #000 !important;
            background: transparent !important;
            border-color: #999 !important;
          }

          /* 6. Page settings */
          @page {
            size: A5 portrait;
            margin: 8mm 10mm;
          }
        }
      `}</style>

      {/* ── MODAL OVERLAY (screen only, hidden via visibility in print) ── */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
        dir="rtl"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-200">

          {/* ── ACTION HEADER (screen only) ── */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>تمت العملية بنجاح ✓</span>
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

          {/*
            ── PRINTABLE RECEIPT ──────────────────────────────────────────
            id="apex-receipt" is the target for the @media print rules above.
            ref is attached here for future react-to-print compatibility.
            ──────────────────────────────────────────────────────────────
          */}
          <div
            id="apex-receipt"
            ref={receiptRef}
            className="p-6 bg-white text-slate-900"
            style={{ direction: 'rtl', fontFamily: 'Arial, Tahoma, sans-serif' }}
          >
            {/* ── RECEIPT HEADER ── */}
            <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '1px dashed #aaa', marginBottom: '12px' }}>
              <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px', color: '#000' }}>
                أبيكس للمبيعات والمخازن
              </h1>
              <p style={{ fontSize: '11px', color: '#555', margin: '2px 0' }}>حلول تجارة الجملة والتوزيع</p>
              <p style={{ fontSize: '11px', color: '#555', margin: '2px 0', direction: 'ltr' }}>
                Tel: +964 770 000 9999 | Baghdad, Iraq
              </p>
              <div style={{ marginTop: '8px', display: 'inline-block', padding: '2px 10px', background: '#f3f4f6', border: '1px solid #ddd', borderRadius: '20px', fontSize: '10px', fontFamily: 'monospace', color: '#333' }}>
                رقم الوصل: {order.id}
              </div>
            </div>

            {/* ── CUSTOMER & TRANSACTION INFO ── */}
            <div style={{ fontSize: '11px', paddingBottom: '10px', borderBottom: '1px dashed #aaa', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ color: '#555' }}>التاريخ والوقت:</span>
                <span style={{ direction: 'ltr', fontWeight: '500', color: '#000' }}>
                  {new Date(order.createdAt).toLocaleString('en-GB')}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ color: '#555' }}>اسم البائع:</span>
                <span style={{ fontWeight: '500', color: '#000' }}>
                  {order.createdByName} ({order.sellerRole === 'storekeeper' ? 'أمين مخزن' : 'مندوب'})
                </span>
              </div>
              <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '2px' }}>
                  <span style={{ color: '#000' }}>اسم الزبون (المحل):</span>
                  <span style={{ color: '#000' }}>{order.customerName}</span>
                </div>
                {order.customerOwner && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ color: '#555' }}>صاحب المحل:</span>
                    <span style={{ color: '#000' }}>{order.customerOwner}</span>
                  </div>
                )}
                {order.customerPhone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#555' }}>رقم الهاتف:</span>
                    <span style={{ direction: 'ltr', color: '#000' }}>{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── ITEMIZED TABLE ── */}
            <div style={{ paddingBottom: '10px', borderBottom: '1px dashed #aaa', marginBottom: '10px' }}>
              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ccc' }}>
                    <th style={{ padding: '4px 2px', color: '#444', fontWeight: '600' }}>المادة</th>
                    <th style={{ padding: '4px 2px', textAlign: 'center', color: '#444', fontWeight: '600' }}>الكمية</th>
                    <th style={{ padding: '4px 2px', textAlign: 'left', color: '#444', fontWeight: '600' }}>السعر</th>
                    <th style={{ padding: '4px 2px', textAlign: 'left', color: '#444', fontWeight: '600' }}>المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '5px 2px', fontWeight: '500', color: '#000' }}>{item.name}</td>
                      <td style={{ padding: '5px 2px', textAlign: 'center', fontFamily: 'monospace', color: '#000' }}>{item.qty}</td>
                      <td style={{ padding: '5px 2px', textAlign: 'left', fontFamily: 'monospace', color: '#333' }}>{formatIQD(item.price)}</td>
                      <td style={{ padding: '5px 2px', textAlign: 'left', fontFamily: 'monospace', fontWeight: '600', color: '#000' }}>
                        {formatIQD(item.price * item.qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── TOTALS ── */}
            <div style={{ fontSize: '11px', paddingBottom: '10px', borderBottom: '1px dashed #aaa', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#555' }}>مجموع القائمة:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#000' }}>{formatIQD(order.totalAmount || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#886600' }}>الديون السابقة:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#886600' }}>+ {formatIQD(order.previousDebt || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px', padding: '4px 0', borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', marginBottom: '4px' }}>
                <span style={{ color: '#000' }}>المجموع الكلي:</span>
                <span style={{ fontFamily: 'monospace', color: '#005500' }}>{formatIQD(grandTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#555' }}>المبلغ الواصل:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#005500' }}>- {formatIQD(order.paidAmount || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', borderTop: '1px solid #ccc', paddingTop: '4px' }}>
                <span style={{ color: '#880000' }}>الباقي (الديون):</span>
                <span style={{ fontFamily: 'monospace', color: '#880000' }}>{formatIQD(order.remainingDebt || 0)}</span>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#555', paddingTop: '8px' }}>
              <p style={{ fontWeight: '600', color: '#000', margin: '0 0 4px' }}>شكراً لتعاملكم معنا!</p>
              <p style={{ fontSize: '10px', color: '#777', margin: '0 0 6px' }}>تم استلام المواد بحالة جيدة. البضاعة المباعة لا ترد ولا تستبدل.</p>
              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #ccc', fontSize: '10px', fontFamily: 'monospace', color: '#999', direction: 'ltr' }}>
                ** APEX DISTRIBUTION SYSTEM **
              </div>
            </div>
          </div>

          {/* ── MODAL FOOTER (screen only) ── */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl text-sm transition-all cursor-pointer"
            >
              إغلاق الوصل
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default ReceiptModal;

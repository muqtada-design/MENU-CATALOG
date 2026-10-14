/**
 * Iraqi Dinar (IQD) currency formatter
 * Formats numbers as: 1,500 د.ع
 */
export const formatIQD = (amount) => {
  const num = Number(amount) || 0;
  return num.toLocaleString('ar-IQ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + ' د.ع';
};

export default formatIQD;

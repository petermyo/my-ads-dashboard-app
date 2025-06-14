export const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MMK' }).format(value);
};

export const getCostMetricLabel = (objective, value) => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  let label = '';
  switch (objective) {
    case 'Impression': label = 'CPM'; break;
    case 'Click': label = 'CPC'; break;
    case 'Install': label = 'CPI'; break;
    case 'Engagement': label = 'CPE'; break;
    default: return 'N/A';
  }
  return `${formatCurrency(value)} (${label})`;
};

export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length > maxLength) {
    return `${text.substring(0, maxLength)}...`;
  }
  return text;
};

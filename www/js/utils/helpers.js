/**
 * General UI and Data Helper Functions
 */

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function filterDatesByRange(dates, rangeStr) {
  if (!dates || dates.length === 0) return { startIdx: 0, count: 0 };
  const total = dates.length;
  let months = total;
  if (rangeStr === '1Y' || rangeStr === '1J' || rangeStr === '1A') months = 12;
  else if (rangeStr === '3Y' || rangeStr === '3J' || rangeStr === '3A') months = 36;
  else if (rangeStr === '5Y' || rangeStr === '5J' || rangeStr === '5A') months = 60;
  else if (rangeStr === '10Y' || rangeStr === '10J' || rangeStr === '10A') months = 120;
  
  const startIdx = Math.max(0, total - months);
  return { startIdx, count: total - startIdx };
}

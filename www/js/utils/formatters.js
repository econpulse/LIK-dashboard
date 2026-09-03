/**
 * Number & Rate Formatters
 */

export function formatNum(val, decimals = 2, withSign = false) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const sign = withSign && val > 0 ? '+' : '';
  return sign + val.toFixed(decimals);
}

export function formatRateBadge(val) {
  if (val === null || val === undefined || isNaN(val)) {
    return `<span class="kpi-rate-badge rate-neutral">—</span>`;
  }
  const cls = val > 0 ? 'rate-up' : val < 0 ? 'rate-down' : 'rate-neutral';
  const sign = val > 0 ? '+' : '';
  const arrow = val > 0 ? '▲' : val < 0 ? '▼' : '▬';
  return `<span class="kpi-rate-badge ${cls}">${arrow} ${sign}${val.toFixed(1)}%</span>`;
}

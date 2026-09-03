/**
 * Detail Deep-Dive Modal (Single & Multi-Series Analysis) Component
 */
import { state } from '../state.js';
import { t } from '../i18n/index.js';
import { getItem, loadFullDataIfNeeded } from '../services/dataService.js';
import { getItemName, getBfsCode, getCoicopCode, getItemHistory } from '../utils/cpiHierarchy.js';
import { formatNum, formatRateBadge } from '../utils/formatters.js';
import { filterDatesByRange } from '../utils/helpers.js';

export const SERIES_COLOR_MAP = {
  '100_100': '#0f172a',      // Gesamtindex (Dunkelblau/Schwarz)
  'sp_1170_103': '#e11d48',  // Kern 1 (Rot)
  'sp_1170_302': '#f59e0b',  // Kern 2 (Orange)
  'sp_1819_118': '#059669',  // Inland (Grün)
  'sp_1819_119': '#2563eb',  // Import (Blau)
  'sp_110_101': '#8b5cf6',   // Waren (Lila)
  'sp_110_102': '#06b6d4'    // Dienstleistungen (Cyan)
};

export const DEFAULT_PALETTE = [
  '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#0891b2'
];

export async function openDetailModal(codes) {
  const modal = document.getElementById('detail-modal');
  if (!modal) return;

  const codeList = Array.isArray(codes) ? codes : [codes];
  let items = codeList.map(c => getItem(c)).filter(Boolean);
  if (items.length === 0) return;

  // Open modal immediately so user gets visual feedback
  state.modalItem = items;
  modal.classList.add('open');
  renderModalContent(items);

  // Lazy load full time series data if needed
  items = await loadFullDataIfNeeded(items);
  state.modalItem = items;
  renderModalContent(items);
}

export function renderModalContent(itemOrItems) {
  const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
  if (items.length === 0) return;

  const modalTitle = document.getElementById('modal-title');
  const modalCoicop = document.getElementById('modal-coicop');
  const statsContainer = document.getElementById('modal-stats-container');

  if (items.length === 1) {
    const item = items[0];
    if (modalTitle) modalTitle.textContent = getItemName(item);
    const coicop = getCoicopCode(item);
    if (modalCoicop) {
      modalCoicop.textContent = coicop ? `COICOP: ${coicop} | Code: ${getBfsCode(item)}` : `Code: ${getBfsCode(item)}`;
    }

    const historyObj = getItemHistory(item);
    const history = historyObj ? historyObj.yoy : [];
    let avg12 = '—', min12 = '—', max12 = '—';
    if (history && history.length > 0) {
      const last12 = history.slice(-12).filter(v => v !== null && !isNaN(v));
      if (last12.length > 0) {
        const sum = last12.reduce((a, b) => a + b, 0);
        avg12 = (sum / last12.length).toFixed(2) + '%';
        min12 = Math.min(...last12).toFixed(1) + '%';
        max12 = Math.max(...last12).toFixed(1) + '%';
      }
    }

    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="kpi-card" style="padding:0.75rem;">
          <span class="kpi-detail-label">${t('stat_latest')}</span>
          <span class="kpi-detail-val" style="font-size:1.1rem;">${formatNum(item.latest ? item.latest.index : 0, 2)} Pts</span>
        </div>
        <div class="kpi-card" style="padding:0.75rem;">
          <span class="kpi-detail-label">${t('yoy_rate')}</span>
          <span class="kpi-detail-val" style="font-size:1.1rem;">${formatRateBadge(item.latest ? item.latest.yoy : 0)}</span>
        </div>
        <div class="kpi-card" style="padding:0.75rem;">
          <span class="kpi-detail-label">${t('stat_avg12')}</span>
          <span class="kpi-detail-val" style="font-size:1.1rem;">${avg12}</span>
        </div>
        <div class="kpi-card" style="padding:0.75rem;">
          <span class="kpi-detail-label">${t('stat_min12')} / ${t('stat_max12')}</span>
          <span class="kpi-detail-val" style="font-size:1.1rem;">${min12} / ${max12}</span>
        </div>
        <div class="kpi-card" style="padding:0.75rem;">
          <span class="kpi-detail-label">${t('stat_weight')}</span>
          <span class="kpi-detail-val" style="font-size:1.1rem;">${item.weight || 0}%</span>
        </div>
      `;
    }
  } else {
    // Multiple items (e.g. Inland vs Import or Goods vs Services)
    const titles = items.map(it => getItemName(it)).join(' vs. ');
    if (modalTitle) modalTitle.textContent = titles;
    const codes = items.map(it => getBfsCode(it)).join(' / ');
    if (modalCoicop) modalCoicop.textContent = `Vergleich • Codes: ${codes}`;

    if (statsContainer) {
      const cardsHtml = items.map((it, idx) => {
        const color = SERIES_COLOR_MAP[it.code] || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
        return `
          <div class="kpi-card" style="padding:0.75rem; border-left: 4px solid ${color};">
            <div style="font-size:0.75rem; font-weight:700; color:${color}; margin-bottom:0.25rem;">${getItemName(it)}</div>
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.25rem;">
              <span class="kpi-detail-val" style="font-size:1.05rem;">${formatNum(it.latest ? it.latest.index : 0, 2)} Pts</span>
              ${formatRateBadge(it.latest ? it.latest.yoy : 0)}
            </div>
            <div style="font-size:0.7rem; color:var(--gray-500); display:flex; justify-content:space-between;">
              <span>MoM: <strong>${formatNum(it.latest ? it.latest.mom : 0, 1, true)}%</strong></span>
              <span>${t('weight')} <strong>${it.weight || 0}%</strong></span>
            </div>
          </div>
        `;
      }).join('');

      statsContainer.innerHTML = cardsHtml;
    }
  }

  renderModalChart(items);
}

export function renderModalChart(itemOrItems) {
  const items = Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
  const canvas = document.getElementById('modal-chart-canvas');
  if (!canvas || !window.Chart || items.length === 0 || !state.summaryData) return;

  const dates = state.summaryData.meta.dates;
  const { startIdx } = filterDatesByRange(dates, state.modalTimeframe);
  const chartDates = dates.slice(startIdx);
  const metricUnit = state.modalMetric === 'index' ? 'Pts' : '%';

  const datasets = items.map((it, idx) => {
    const historyObj = getItemHistory(it);
    const rawData = historyObj ? (historyObj[state.modalMetric] || []) : [];
    const dataSlice = rawData.slice(startIdx);
    const color = SERIES_COLOR_MAP[it.code] || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
    const isMulti = items.length > 1;

    return {
      label: getItemName(it),
      data: dataSlice,
      borderColor: color,
      backgroundColor: isMulti ? 'transparent' : 'rgba(37, 99, 235, 0.08)',
      borderWidth: isMulti ? 2.5 : 2,
      pointRadius: chartDates.length > 36 ? 0 : 2,
      pointHoverRadius: 5,
      tension: 0.15,
      fill: !isMulti
    };
  });

  if (state.charts.modal) {
    state.charts.modal.data.labels = chartDates;
    state.charts.modal.data.datasets = datasets;
    state.charts.modal.options.plugins.legend.display = items.length > 1;
    state.charts.modal.options.plugins.tooltip.callbacks.label = function (ctx) {
      const v = ctx.parsed.y;
      const lbl = ctx.dataset.label ? `${ctx.dataset.label}: ` : '';
      return ` ${lbl}${v !== null ? v.toFixed(2) + ' ' + metricUnit : '—'}`;
    };
    state.charts.modal.options.scales.y.ticks.callback = function (val) {
      return val.toFixed(1) + (state.modalMetric === 'index' ? '' : '%');
    };
    state.charts.modal.update('none');
    return;
  }

  state.charts.modal = new Chart(canvas, {
    type: 'line',
    data: {
      labels: chartDates,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 250 },
      normalized: true,
      plugins: {
        legend: {
          display: items.length > 1,
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12,
            font: { size: 11, weight: '600' },
            padding: 10
          }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const v = ctx.parsed.y;
              const lbl = ctx.dataset.label ? `${ctx.dataset.label}: ` : '';
              return ` ${lbl}${v !== null ? v.toFixed(2) + ' ' + metricUnit : '—'}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 10, font: { size: 10 } }
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            font: { size: 10 },
            callback: function (val) {
              return val.toFixed(1) + (state.modalMetric === 'index' ? '' : '%');
            }
          }
        }
      }
    }
  });
}

export function closeModal() {
  const modal = document.getElementById('detail-modal');
  if (modal) modal.classList.remove('open');
  state.modalItem = null;
  if (state.charts.modal) {
    state.charts.modal.destroy();
    state.charts.modal = null;
  }
}

export function initDetailModal() {
  const modal = document.getElementById('detail-modal');
  const btnClose = document.getElementById('btn-modal-close');
  const modalMetricBtns = document.querySelectorAll('[data-modal-metric]');
  const modalRangeBtns = document.querySelectorAll('[data-modal-range]');

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  modalMetricBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalMetricBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.modalMetric = btn.getAttribute('data-modal-metric');
      if (state.modalItem) renderModalChart(state.modalItem);
    });
  });

  modalRangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalRangeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.modalTimeframe = btn.getAttribute('data-modal-range');
      if (state.modalItem) renderModalChart(state.modalItem);
    });
  });
}

/**
 * Macro Comparison Chart Component
 */
import { state } from '../state.js';
import { getItem } from '../services/dataService.js';
import { getItemName } from '../utils/cpiHierarchy.js';
import { filterDatesByRange } from '../utils/helpers.js';

export const MACRO_SERIES_DEFINITIONS = [
  { code: '100_100', color: '#0f172a', width: 3 },       // Gesamtindex
  { code: 'sp_1170_103', color: '#e11d48', width: 2 },   // Kern 1
  { code: 'sp_1170_302', color: '#f59e0b', width: 2 },   // Kern 2
  { code: 'sp_1819_118', color: '#059669', width: 2 },   // Inland
  { code: 'sp_1819_119', color: '#2563eb', width: 2 },   // Import
  { code: 'sp_110_101', color: '#8b5cf6', width: 2 },    // Waren
  { code: 'sp_110_102', color: '#06b6d4', width: 2 }     // Dienstleistungen
];

export function renderMacroSeriesChips() {
  const container = document.getElementById('macro-series-chips');
  if (!container) return;
  container.innerHTML = '';

  MACRO_SERIES_DEFINITIONS.forEach(def => {
    const item = getItem(def.code);
    if (!item) return;
    const isActive = state.activeMacroSeries.includes(def.code);
    const chip = document.createElement('button');
    chip.className = `series-chip ${isActive ? 'active' : ''}`;
    chip.innerHTML = `<span class="chip-color-dot" style="background-color: ${def.color};"></span>${getItemName(item)}`;
    chip.onclick = () => {
      if (state.activeMacroSeries.includes(def.code)) {
        if (state.activeMacroSeries.length > 1) {
          state.activeMacroSeries = state.activeMacroSeries.filter(c => c !== def.code);
        }
      } else {
        state.activeMacroSeries.push(def.code);
      }
      renderMacroSeriesChips();
      renderMacroChart();
    };
    container.appendChild(chip);
  });
}

export function renderMacroChart() {
  const canvas = document.getElementById('macro-chart-canvas');
  if (!canvas || !state.summaryData || !window.Chart) return;

  const dates = state.summaryData.meta.dates;
  const { startIdx, count } = filterDatesByRange(dates, state.macroTimeframe);
  const chartDates = dates.slice(startIdx);

  const datasets = [];
  state.activeMacroSeries.forEach(code => {
    const item = getItem(code);
    const def = MACRO_SERIES_DEFINITIONS.find(d => d.code === code) || { color: '#64748b', width: 2 };
    if (!item || !item.history) return;

    const rawSeries = item.history[state.macroMetric] || [];
    const dataSlice = rawSeries.slice(startIdx);

    datasets.push({
      label: getItemName(item),
      data: dataSlice,
      borderColor: def.color,
      backgroundColor: def.color,
      borderWidth: def.width,
      pointRadius: count > 36 ? 0 : 2,
      pointHoverRadius: 5,
      tension: 0.15,
      fill: false
    });
  });

  const metricUnit = state.macroMetric === 'index' ? 'Pts' : '%';

  if (state.charts.macro) {
    state.charts.macro.data.labels = chartDates;
    state.charts.macro.data.datasets = datasets;
    state.charts.macro.options.scales.y.ticks.callback = function (val) {
      return val.toFixed(1) + (state.macroMetric === 'index' ? '' : '%');
    };
    state.charts.macro.update('none');
    return;
  }

  state.charts.macro = new Chart(canvas, {
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
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function (ctx) {
              const val = ctx.parsed.y;
              return ` ${ctx.dataset.label}: ${val !== null ? val.toFixed(2) + ' ' + metricUnit : '—'}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 12,
            font: { size: 11 }
          }
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            font: { size: 11 },
            callback: function (val) {
              return val.toFixed(1) + (state.macroMetric === 'index' ? '' : '%');
            }
          }
        }
      }
    }
  });
}

export function initMacroChart() {
  const macroMetricBtns = document.querySelectorAll('[data-macro-metric]');
  const macroRangeBtns = document.querySelectorAll('[data-macro-range]');

  macroMetricBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      macroMetricBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.macroMetric = btn.getAttribute('data-macro-metric');
      renderMacroChart();
    });
  });

  macroRangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      macroRangeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.macroTimeframe = btn.getAttribute('data-macro-range');
      renderMacroChart();
    });
  });
}

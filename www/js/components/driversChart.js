/**
 * 13 Main Groups & Inflation Drivers Chart Component
 */
import { state } from '../state.js';
import { t } from '../i18n/index.js';
import { getItemName } from '../utils/cpiHierarchy.js';

function getDriverVal(it, mode) {
  if (!it || !it.latest) return 0;
  if (mode === 'contr') {
    return it.latest.contr_mom !== undefined ? it.latest.contr_mom : (it.latest.contr || 0);
  } else if (mode === 'contr_yoy') {
    return it.latest.contr_yoy !== undefined ? it.latest.contr_yoy : 0;
  } else if (mode === 'delta_yoy') {
    return it.latest.delta_contr_yoy !== undefined ? it.latest.delta_contr_yoy : 0;
  } else if (mode === 'yoy') {
    return it.latest.yoy !== undefined ? it.latest.yoy : 0;
  } else if (mode === 'weight') {
    return it.weight || 0;
  }
  return 0;
}

export function renderDriversChart() {
  const canvas = document.getElementById('drivers-chart-canvas');
  if (!canvas || !state.summaryData || !window.Chart) return;
  const items = state.summaryData.items;

  // Filter main groups (100_1 to 100_13)
  const mainGroups = [];
  for (let i = 1; i <= 13; i++) {
    const code = `100_${i}`;
    if (items[code]) mainGroups.push(items[code]);
  }

  if (mainGroups.length === 0) return;

  // Total element (100_100) as baseline comparison
  const totalItem = items['100_100'];

  // Sort 13 main groups
  let sorted = [...mainGroups];
  sorted.sort((a, b) => getDriverVal(b, state.driversMode) - getDriverVal(a, state.driversMode));

  const displayList = totalItem ? [totalItem, ...sorted] : sorted;

  const labels = displayList.map(it => {
    if (it.code === '100_100') {
      return `★ ${t('parent_total')} (Headline)`;
    }
    return getItemName(it);
  });

  const values = displayList.map(it => getDriverVal(it, state.driversMode));

  const colors = displayList.map(it => {
    const isTotal = it.code === '100_100';
    const val = getDriverVal(it, state.driversMode);
    if (isTotal) {
      return '#0f172a'; // Dark slate for headline
    }
    if (state.driversMode === 'weight') {
      return '#2563eb';
    }
    return val >= 0 ? '#e11d48' : '#059669';
  });

  const unit = (state.driversMode === 'contr' || state.driversMode === 'contr_yoy' || state.driversMode === 'delta_yoy') ? ' %p' : ' %';

  const handleBarClick = (event, elements) => {
    if (elements.length > 0) {
      const idx = elements[0].index;
      const clickedItem = displayList[idx];
      if (clickedItem && window.cpiApp && typeof window.cpiApp.drillDown === 'function') {
        window.cpiApp.drillDown(clickedItem.code);
        const explorerSec = document.getElementById('explorer-section');
        if (explorerSec) explorerSec.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (state.charts.drivers) {
    state.charts.drivers.data.labels = labels;
    state.charts.drivers.data.datasets[0].data = values;
    state.charts.drivers.data.datasets[0].backgroundColor = colors;
    state.charts.drivers.options.scales.x.ticks.callback = function (val) {
      return val.toFixed(1) + unit;
    };
    state.charts.drivers.options.plugins.tooltip.callbacks.label = function (ctx) {
      return ` ${ctx.parsed.x.toFixed(3)}${unit}`;
    };
    state.charts.drivers.options.onClick = handleBarClick;
    state.charts.drivers.update('none');
    return;
  }

  state.charts.drivers = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return ` ${ctx.parsed.x.toFixed(3)}${unit}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#f1f5f9' },
          ticks: {
            font: { size: 10 },
            callback: function (val) {
              return val.toFixed(1) + unit;
            }
          }
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { size: 11, weight: '500' }
          }
        }
      },
      onClick: handleBarClick
    }
  });
}

export function initDriversChart() {
  const driversModeBtns = document.querySelectorAll('[data-drivers-mode]');
  driversModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      driversModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.driversMode = btn.getAttribute('data-drivers-mode');
      renderDriversChart();
    });
  });
}

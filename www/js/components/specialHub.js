/**
 * BFS Special Aggregates (Sondergliederungen Hub) Component
 */
import { state } from '../state.js';
import { getItem } from '../services/dataService.js';
import { getItemName } from '../utils/cpiHierarchy.js';
import { formatNum, formatRateBadge } from '../utils/formatters.js';

export function renderSpecialHub() {
  const grid = document.getElementById('special-grid');
  if (!grid || !state.summaryData) return;

  const specialGroups = state.summaryData.special_groups;
  const items = state.summaryData.items;

  const groupCodes = specialGroups[state.activeSpecialTab] || [];
  grid.innerHTML = '';

  if (groupCodes.length === 0) {
    grid.innerHTML = `<p style="color:var(--gray-500); grid-column:1/-1;">Keine Positionen in dieser Sondergruppe.</p>`;
    return;
  }

  groupCodes.forEach(code => {
    const it = items[code];
    if (!it) return;

    const card = document.createElement('div');
    card.className = 'special-card';
    card.onclick = () => {
      if (window.cpiApp && typeof window.cpiApp.openDetailModal === 'function') {
        window.cpiApp.openDetailModal(code);
      }
    };

    const yoyContrVal = it.latest ? it.latest.contr_yoy : 0;
    const deltaYoyVal = it.latest ? it.latest.delta_contr_yoy : 0;

    let deltaBadge = '';
    if (deltaYoyVal !== undefined && deltaYoyVal !== null && deltaYoyVal !== 0) {
      const sign = deltaYoyVal > 0 ? '+' : '';
      const dClass = deltaYoyVal > 0 ? 'delta-pos' : 'delta-neg';
      deltaBadge = `<span class="contr-delta-tag ${dClass}" style="font-weight:600;">&Delta; ${sign}${deltaYoyVal.toFixed(3)}</span>`;
    } else if (deltaYoyVal === 0 && (yoyContrVal || 0) !== 0) {
      deltaBadge = `<span class="contr-delta-tag delta-zero">&Delta; 0.000</span>`;
    }

    card.innerHTML = `
      <div class="special-card-header">
        <span>${it.bfs_code || it.code}</span>
        <span>${it.weight > 0 ? it.weight + '%' : ''}</span>
      </div>
      <div class="special-card-title">${getItemName(it)}</div>
      <div class="special-card-metrics">
        <span class="special-card-index">${formatNum(it.latest.index, 2)}</span>
        ${formatRateBadge(it.latest.yoy)}
      </div>
      <div class="special-card-contr-row">
        <span style="color:var(--gray-600);">Beitrag YoY: <strong class="special-contr-chip">${yoyContrVal !== 0 ? formatNum(yoyContrVal, 3, true) : '0.000'} %p</strong></span>
        ${deltaBadge}
      </div>
      <div style="margin-top:0.4rem; font-size:0.75rem; color:var(--gray-500); display:flex; justify-content:space-between;">
        <span>MoM: ${formatNum(it.latest.mom, 1, true)}%</span>
        <span style="color:var(--primary-600); font-weight:600;">Chart ansehen &rarr;</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

export function initSpecialHub() {
  const specialTabs = document.querySelectorAll('.special-tab-btn');
  specialTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      specialTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeSpecialTab = btn.getAttribute('data-special-tab');
      renderSpecialHub();
    });
  });
}

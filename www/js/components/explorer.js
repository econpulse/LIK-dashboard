/**
 * Hierarchical Detail & Category Explorer Component
 */
import { state } from '../state.js';
import { t } from '../i18n/index.js';
import { getItem } from '../services/dataService.js';
import {
  getItemName,
  getBfsCode,
  getCoicopCode,
  getItemChildren,
  hasDrilldownChildren,
  buildAncestralPath
} from '../utils/cpiHierarchy.js';
import { formatNum, formatRateBadge } from '../utils/formatters.js';
import { debounce } from '../utils/helpers.js';

export function renderBreadcrumbs() {
  const container = document.getElementById('breadcrumbs');
  if (!container) return;
  container.innerHTML = '';

  state.breadcrumbPath.forEach((code, idx) => {
    const isLast = idx === state.breadcrumbPath.length - 1;
    const item = getItem(code);
    const name = item ? getItemName(item) : (code === '100_100' ? t('parent_total') : code);

    const crumb = document.createElement('span');
    crumb.className = `breadcrumb-crumb ${isLast ? 'active' : ''}`;
    crumb.textContent = (idx === 0 ? '🏠 ' : '') + name;
    if (!isLast) {
      crumb.onclick = () => {
        state.breadcrumbPath = state.breadcrumbPath.slice(0, idx + 1);
        state.currentNodeCode = code;
        renderExplorer();
      };
    }
    container.appendChild(crumb);

    if (!isLast) {
      const sep = document.createElement('span');
      sep.className = 'breadcrumb-sep';
      sep.textContent = '›';
      container.appendChild(sep);
    }
  });
}

export function renderCurrentNodeSummary() {
  const summaryContainer = document.getElementById('current-node-summary');
  if (!summaryContainer) return;

  const item = getItem(state.currentNodeCode);
  if (!item) return;

  const childCodes = getItemChildren(item);
  const drillableChildren = childCodes.filter(c => getItem(c));
  const subCount = drillableChildren.length;

  summaryContainer.innerHTML = `
    <div>
      <div class="node-info-title">
        ${getCoicopCode(item) ? `<span class="node-info-coicop">${getCoicopCode(item)}</span>` : ''}
        ${getItemName(item)}
      </div>
      <div style="font-size:0.75rem; color:var(--gray-500); margin-top:2px;">
        ${subCount} ${t('items_count')} • Code: ${getBfsCode(item)}
      </div>
    </div>
    <div class="node-stats-group">
      <div class="node-stat-item">
        <span class="node-stat-label">${t('th_weight')}</span>
        <span class="node-stat-val">${item.weight}%</span>
      </div>
      <div class="node-stat-item">
        <span class="node-stat-label">${t('th_index')}</span>
        <span class="node-stat-val">${formatNum(item.latest.index, 2)}</span>
      </div>
      <div class="node-stat-item">
        <span class="node-stat-label">${t('th_mom')}</span>
        <span class="node-stat-val">${formatNum(item.latest.mom, 1, true)}%</span>
      </div>
      <div class="node-stat-item">
        <span class="node-stat-label">${t('th_yoy')}</span>
        <span class="node-stat-val">${formatRateBadge(item.latest.yoy)}</span>
      </div>
    </div>
  `;
}

export function renderTableRows() {
  const tableBody = document.getElementById('table-body');
  if (!tableBody) return;

  const parent = getItem(state.currentNodeCode);
  if (!parent) return;

  let itemsToDisplay = [];
  const searchTerm = state.activeSearchTerm.trim().toLowerCase();

  if (searchTerm.length >= 2) {
    // Global search across all items in active language
    const allItems = state.summaryData.items;
    Object.values(allItems).forEach(it => {
      const name = getItemName(it).toLowerCase();
      const code = (it.code || '').toLowerCase();
      const coicop = (it.coicop || '').toLowerCase();
      if (name.includes(searchTerm) || code.includes(searchTerm) || coicop.includes(searchTerm)) {
        itemsToDisplay.push(it);
      }
    });
  } else {
    // Normal hierarchical view: show children of current node
    const childCodes = getItemChildren(parent);
    childCodes.forEach(code => {
      const child = getItem(code);
      if (child) itemsToDisplay.push(child);
    });
  }

  // Apply Sorting
  itemsToDisplay.sort((a, b) => {
    let vA = 0, vB = 0;
    if (state.sortCol === 'weight') {
      vA = a.weight || 0; vB = b.weight || 0;
    } else if (state.sortCol === 'index') {
      vA = a.latest ? a.latest.index || 0 : 0; vB = b.latest ? b.latest.index || 0 : 0;
    } else if (state.sortCol === 'mom') {
      vA = a.latest ? a.latest.mom || 0 : 0; vB = b.latest ? b.latest.mom || 0 : 0;
    } else if (state.sortCol === 'yoy') {
      vA = a.latest ? a.latest.yoy || 0 : 0; vB = b.latest ? b.latest.yoy || 0 : 0;
    } else if (state.sortCol === 'contr' || state.sortCol === 'contr_mom') {
      vA = a.latest ? (a.latest.contr_mom !== undefined ? a.latest.contr_mom : a.latest.contr || 0) : 0;
      vB = b.latest ? (b.latest.contr_mom !== undefined ? b.latest.contr_mom : b.latest.contr || 0) : 0;
    } else if (state.sortCol === 'contr_yoy') {
      vA = a.latest ? (a.latest.contr_yoy || 0) : 0;
      vB = b.latest ? (b.latest.contr_yoy || 0) : 0;
    } else if (state.sortCol === 'name') {
      return state.sortAsc ? getItemName(a).localeCompare(getItemName(b)) : getItemName(b).localeCompare(getItemName(a));
    } else if (state.sortCol === 'code') {
      const cA = getBfsCode(a);
      const cB = getBfsCode(b);
      return state.sortAsc ? cA.localeCompare(cB, undefined, { numeric: true }) : cB.localeCompare(cA, undefined, { numeric: true });
    } else if (state.sortCol === 'coicop') {
      const cA = getCoicopCode(a) || getBfsCode(a);
      const cB = getCoicopCode(b) || getBfsCode(b);
      return state.sortAsc
        ? cA.localeCompare(cB, undefined, { numeric: true, sensitivity: 'base' })
        : cB.localeCompare(cA, undefined, { numeric: true, sensitivity: 'base' });
    }
    return state.sortAsc ? vA - vB : vB - vA;
  });

  let totalMatches = itemsToDisplay.length;
  let isSearchLimited = false;
  if (searchTerm.length >= 2 && itemsToDisplay.length > 80) {
    itemsToDisplay = itemsToDisplay.slice(0, 80);
    isSearchLimited = true;
  }

  tableBody.innerHTML = '';

  if (itemsToDisplay.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 2rem; color: var(--gray-500);">
          Keine Einträge gefunden.
        </td>
      </tr>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();

  itemsToDisplay.forEach(item => {
    const canDrill = hasDrilldownChildren(item, getItem);
    const tr = document.createElement('tr');
    if (canDrill) tr.classList.add('clickable-row');

    // Level badge text
    let levelLabel = '';
    if (item.level === 2) levelLabel = 'Hauptgruppe';
    else if (item.level === 3) levelLabel = 'Warengruppe';
    else if (item.level === 4) levelLabel = 'Untergruppe';
    else if (item.level >= 5) levelLabel = 'Produkt';

    const momContrVal = item.latest ? (item.latest.contr_mom !== undefined ? item.latest.contr_mom : item.latest.contr) : 0;
    const yoyContrVal = item.latest ? item.latest.contr_yoy : 0;
    const deltaYoyVal = item.latest ? item.latest.delta_contr_yoy : 0;

    // Delta styling
    let deltaHtml = '';
    if (deltaYoyVal !== undefined && deltaYoyVal !== null && deltaYoyVal !== 0) {
      const sign = deltaYoyVal > 0 ? '+' : '';
      const dClass = deltaYoyVal > 0 ? 'delta-pos' : 'delta-neg';
      deltaHtml = `<span class="contr-delta-tag ${dClass}" title="Veränderung des YoY-Beitrags zum Vormonat (Delta MoM)">&Delta; ${sign}${deltaYoyVal.toFixed(3)}</span>`;
    } else if (deltaYoyVal === 0 && (yoyContrVal || 0) !== 0) {
      deltaHtml = `<span class="contr-delta-tag delta-zero" title="Unverändert zum Vormonat">&Delta; 0.000</span>`;
    }

    tr.innerHTML = `
      <td class="col-coicop">${getCoicopCode(item) || '—'}</td>
      <td class="col-code">${getBfsCode(item)}</td>
      <td class="col-name">
        ${getItemName(item)}
        ${levelLabel ? `<span class="level-tag">${levelLabel}</span>` : ''}
      </td>
      <td class="col-num">${item.weight > 0 ? item.weight.toFixed(3) : '0.000'}</td>
      <td class="col-num" style="font-weight:700;">${formatNum(item.latest.index, 2)}</td>
      <td class="col-num">${formatNum(item.latest.mom, 1, true)}%</td>
      <td class="col-num">${formatRateBadge(item.latest.yoy)}</td>
      <td class="col-num">${momContrVal !== 0 ? formatNum(momContrVal, 3, true) : '0.000'}</td>
      <td class="col-num">
        <div class="contr-cell-yoy">
          <span class="contr-val-main">${yoyContrVal !== 0 ? formatNum(yoyContrVal, 3, true) : '0.000'}</span>
          ${deltaHtml}
        </div>
      </td>
      <td style="text-align: right; white-space: nowrap;">
        ${canDrill ? `
          <button class="drilldown-btn" onclick="event.stopPropagation(); window.cpiApp.drillDown('${item.code}')">
            <span>${t('action_drilldown')}</span> &rarr;
          </button>
        ` : ''}
        <button class="chart-btn" title="${t('action_chart')}" onclick="event.stopPropagation(); window.cpiApp.openDetailModal('${item.code}')">
          📊
        </button>
      </td>
    `;

    if (canDrill) {
      tr.onclick = () => drillDownToNode(item.code);
    } else {
      tr.onclick = () => {
        if (window.cpiApp && typeof window.cpiApp.openDetailModal === 'function') {
          window.cpiApp.openDetailModal(item.code);
        }
      };
    }

    fragment.appendChild(tr);
  });

  if (isSearchLimited) {
    const noticeTr = document.createElement('tr');
    noticeTr.innerHTML = `
      <td colspan="10" style="text-align: center; padding: 0.75rem; background-color: var(--gray-50); color: var(--gray-600); font-size: 0.8rem;">
        ℹ️ Zeige die ersten 80 von ${totalMatches} Treffern. Bitte verfeinere deine Suche für spezifischere Ergebnisse.
      </td>
    `;
    fragment.appendChild(noticeTr);
  }

  tableBody.appendChild(fragment);
}

export function drillDownToNode(code) {
  state.activeSearchTerm = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const item = getItem(code);
  if (!item) return;

  // If item has no meaningful sub-items, open detail chart modal directly!
  if (!hasDrilldownChildren(item, getItem)) {
    if (window.cpiApp && typeof window.cpiApp.openDetailModal === 'function') {
      window.cpiApp.openDetailModal(code);
    }
    return;
  }

  // Set correct node and construct clean ancestral breadcrumb path
  state.currentNodeCode = code;
  state.breadcrumbPath = buildAncestralPath(code, getItem);

  renderExplorer();
}

export function renderExplorer() {
  renderBreadcrumbs();
  renderCurrentNodeSummary();
  renderTableRows();
}

export function initExplorer() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    const handleSearchInput = debounce((e) => {
      state.activeSearchTerm = e.target.value;
      renderTableRows();
    }, 150);
    searchInput.addEventListener('input', handleSearchInput);
  }

  // Table Column Sorting
  document.querySelectorAll('.cpi-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.getAttribute('data-sort');
      if (state.sortCol === col) {
        state.sortAsc = !state.sortAsc;
      } else {
        state.sortCol = col;
        state.sortAsc = (col === 'name' || col === 'code');
      }
      renderTableRows();
    });
  });
}

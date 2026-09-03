/**
 * KPI Cards Component ("Auf einen Blick")
 */
import { state } from '../state.js';
import { t } from '../i18n/index.js';
import { formatNum, formatRateBadge } from '../utils/formatters.js';

export function renderKPIs() {
  const container = document.getElementById('kpi-cards-container');
  if (!container || !state.summaryData) return;

  const items = state.summaryData.items;
  const tot = items['100_100'];
  const core1 = items['sp_1170_103'];
  const inland = items['sp_1819_118'];
  const importGoods = items['sp_1819_119'];
  const goods = items['sp_110_101'];
  const services = items['sp_110_102'];

  if (!tot) return;

  const cardsHtml = `
    <!-- Card 1: Headline CPI -->
    <div class="kpi-card" onclick="window.cpiApp.openDetailModal('100_100')" style="cursor: pointer;">
      <div class="kpi-card-header">
        <span class="kpi-title">${t('kpi_headline')}</span>
        <span class="kpi-weight">${t('weight')} 100%</span>
      </div>
      <div class="kpi-main-metric">
        <span class="kpi-value">${formatNum(tot.latest.index, 2)}</span>
        <span class="kpi-unit">Pts</span>
        ${formatRateBadge(tot.latest.yoy)}
      </div>
      <div class="kpi-details-row">
        <div class="kpi-detail-item">
          <span class="kpi-detail-label">${t('mom_rate')}</span>
          <span class="kpi-detail-val">${formatNum(tot.latest.mom, 1, true)}%</span>
        </div>
        <div class="kpi-detail-item">
          <span class="kpi-detail-label">${t('prev_month')} (YoY)</span>
          <span class="kpi-detail-val">${formatNum(tot.latest.prev_yoy, 1, true)}%</span>
        </div>
        <div class="kpi-detail-item">
          <span class="kpi-detail-label">Beitrag MoM</span>
          <span class="kpi-detail-val">${formatNum(tot.latest.contr, 3, true)}</span>
        </div>
      </div>
    </div>

    <!-- Card 2: Core Inflation 1 -->
    <div class="kpi-card" onclick="window.cpiApp.openDetailModal('sp_1170_103')" style="cursor: pointer;">
      <div class="kpi-card-header">
        <span class="kpi-title">${t('kpi_core1')}</span>
        <span class="kpi-weight">${t('weight')} ${core1 ? core1.weight : '—'}%</span>
      </div>
      <div class="kpi-main-metric">
        <span class="kpi-value">${core1 ? formatNum(core1.latest.index, 2) : '—'}</span>
        <span class="kpi-unit">Pts</span>
        ${core1 ? formatRateBadge(core1.latest.yoy) : ''}
      </div>
      <div class="kpi-details-row">
        <div class="kpi-detail-item">
          <span class="kpi-detail-label">${t('mom_rate')}</span>
          <span class="kpi-detail-val">${core1 ? formatNum(core1.latest.mom, 1, true) + '%' : '—'}</span>
        </div>
        <div class="kpi-detail-item">
          <span class="kpi-detail-label">Beitrag YoY</span>
          <span class="kpi-detail-val">${core1 ? formatNum(core1.latest.contr_yoy, 3, true) + '%p' : '—'}</span>
        </div>
        <div class="kpi-detail-item">
          <span class="kpi-detail-label">&Delta; YoY MoM</span>
          <span class="kpi-detail-val">${core1 ? (core1.latest.delta_contr_yoy > 0 ? '+' : '') + formatNum(core1.latest.delta_contr_yoy, 3) + '%p' : '—'}</span>
        </div>
      </div>
    </div>

    <!-- Card 3: Domestic vs Imported -->
    <div class="kpi-card" onclick="window.cpiApp.openDetailModal(['sp_1819_118', 'sp_1819_119'])" style="cursor: pointer;">
      <div class="kpi-card-header">
        <span class="kpi-title">${t('kpi_origin')}</span>
        <span class="kpi-weight">77.8% / 22.2%</span>
      </div>
      <div class="kpi-main-metric" style="justify-content: space-between;">
        <div>
          <div style="font-size:0.75rem; color:var(--gray-500); font-weight:600;">${t('inland')} (77.8%)</div>
          <span style="font-size: 1.5rem; font-weight:800;">${inland ? formatNum(inland.latest.yoy, 1, true) + '%' : '—'}</span>
        </div>
        <div style="text-align: right;">
          <div style="font-size:0.75rem; color:var(--gray-500); font-weight:600;">${t('import')} (22.2%)</div>
          <span style="font-size: 1.5rem; font-weight:800; color:var(--primary-600);">${importGoods ? formatNum(importGoods.latest.yoy, 1, true) + '%' : '—'}</span>
        </div>
      </div>
      <div class="kpi-details-row">
        <div class="kpi-detail-item">
          <span class="kpi-detail-label">Inland MoM</span>
          <span class="kpi-detail-val">${inland ? formatNum(inland.latest.mom, 1, true) + '%' : '—'}</span>
        </div>
        <div class="kpi-detail-item">
          <span class="kpi-detail-label">Import MoM</span>
          <span class="kpi-detail-val">${importGoods ? formatNum(importGoods.latest.mom, 1, true) + '%' : '—'}</span>
        </div>
        <div class="kpi-detail-item">
          <span class="kpi-detail-label">Import Spread</span>
          <span class="kpi-detail-val">${inland && importGoods ? formatNum(importGoods.latest.yoy - inland.latest.yoy, 1, true) + '%p' : '—'}</span>
        </div>
      </div>
    </div>

    <!-- Card 4: Goods vs Services -->
    <div class="kpi-card" onclick="window.cpiApp.openDetailModal(['sp_110_101', 'sp_110_102'])" style="cursor: pointer;">
      <div class="kpi-card-header">
        <span class="kpi-title">${t('kpi_goods_services')}</span>
        <span class="kpi-weight">37.6% / 62.4%</span>
      </div>
      <div class="kpi-main-metric" style="justify-content: space-between;">
        <div>
          <div style="font-size:0.75rem; color:var(--gray-500); font-weight:600;">${t('goods')} (37.6%)</div>
          <span style="font-size: 1.5rem; font-weight:800;">${goods ? formatNum(goods.latest.yoy, 1, true) + '%' : '—'}</span>
        </div>
        <div style="text-align: right;">
          <div style="font-size:0.75rem; color:var(--gray-500); font-weight:600;">${t('services')} (62.4%)</div>
          <span style="font-size: 1.5rem; font-weight:800; color:var(--accent-blue);">${services ? formatNum(services.latest.yoy, 1, true) + '%' : '—'}</span>
        </div>
      </div>
      <div class="kpi-details-row">
        <div class="kpi-detail-item">
          <span class="kpi-detail-label">Waren MoM</span>
          <span class="kpi-detail-val">${goods ? formatNum(goods.latest.mom, 1, true) + '%' : '—'}</span>
        </div>
        <div class="kpi-detail-item">
          <span class="kpi-detail-label">Dienstl. MoM</span>
          <span class="kpi-detail-val">${services ? formatNum(services.latest.mom, 1, true) + '%' : '—'}</span>
        </div>
        <div class="kpi-detail-item">
          <span class="kpi-detail-label">Spread</span>
          <span class="kpi-detail-val">${goods && services ? formatNum(services.latest.yoy - goods.latest.yoy, 1, true) + '%p' : '—'}</span>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = cardsHtml;
}

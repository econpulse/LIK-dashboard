/**
 * Swiss CPI Dashboard - Frontend Application Logic
 * Pure Vanilla JavaScript + Chart.js
 * Multi-language support (DE, FR, IT, EN)
 */

(function () {
  'use strict';

  // ============================================================================
  // Translations Dictionary
  // ============================================================================
  const I18N = {
    de: {
      app_title: "Schweizer Landesindex der Konsumentenpreise (LIK)",
      app_subtitle: "BFS Makrodaten & Teuerungs-Dashboard",
      status_prefix: "Stand:",
      basis_prefix: "Basis:",
      source_prefix: "Quelle: BFS",
      upload_btn: "BFS-Datei hochladen (.xlsx)",
      overview_title: "Makro-Übersicht auf einen Blick",
      overview_desc: "Zentrale Indikatoren der Schweizer Inflation und Teuerungsentwicklung",
      kpi_headline: "Gesamtindex (LIK)",
      kpi_core1: "Kerninflation 1",
      kpi_origin: "Inland- vs. Importgüter",
      kpi_goods_services: "Waren vs. Dienstleistungen",
      weight: "Gewicht:",
      mom_rate: "MoM:",
      yoy_rate: "YoY:",
      prev_month: "Vormonat",
      prev_year: "Vorjahr",
      spread: "Spread zu Gesamt:",
      inland: "Inland",
      import: "Import",
      goods: "Waren",
      services: "Dienstleistungen",
      macro_chart_title: "Makro-Teuerungsverlauf im Zeitvergleich",
      macro_chart_desc: "Vergleich der zentralen Teuerungsaggregate",
      drivers_title: "Hauptgruppen: Beiträge & Gewichtung",
      drivers_desc: "Analyse der 13 COICOP-Hauptkategorien",
      btn_contr: "Beitrag MoM",
      btn_contr_yoy: "Beitrag YoY",
      btn_delta_yoy: "Δ Beitrag YoY",
      btn_yoy: "YoY-Teuerung (%)",
      btn_weight: "Gewichtung (%)",
      metric_yoy: "Vorjahresrate YoY (%)",
      metric_mom: "Monatsrate MoM (%)",
      metric_index: "Indexstand (100)",
      range_1y: "1J",
      range_3y: "3J",
      range_5y: "5J",
      range_10y: "10J",
      range_max: "Max",
      special_hub_title: "Spezial-Aggregate (Sondergliederungen)",
      special_hub_desc: "Offizielle BFS-Klassifizierungen nach Herkunft, Güterart und Kernraten",
      tab_core: "Kerninflation",
      tab_origin: "Herkunft (Inland/Import)",
      tab_goods: "Waren & Dienstleistungen",
      tab_admin: "Administrierte Preise",
      tab_exclusions: "Spezifische Ausschlüsse",
      explorer_title: "Hierarchischer Detail- & Kategorie-Explorer",
      explorer_desc: "Stufenloser Drilldown von den 13 Hauptgruppen bis auf Produktebene",
      search_placeholder: "Kategorie oder Produkt suchen (Name, COICOP, Code)...",
      th_coicop: "COICOP",
      th_code: "BFS-Code",
      th_name: "Bezeichnung",
      th_weight: "Gewicht (%)",
      th_index: "Index",
      th_mom: "MoM (%)",
      th_yoy: "YoY (%)",
      th_contr_mom: "Beitrag MoM",
      th_contr_yoy: "Beitrag YoY",
      th_actions: "Aktionen",
      action_drilldown: "Drilldown",
      action_chart: "Chart",
      items_count: "Unterpositionen",
      parent_total: "Gesamtindex",
      modal_chart_title: "Detailanalyse & Zeitreihe",
      stat_latest: "Letzter Stand",
      stat_avg12: "12M-Schnitt",
      stat_min12: "12M-Tief",
      stat_max12: "12M-Hoch",
      stat_weight: "Warenkorbgewicht",
      upload_modal_title: "Aktuelle BFS CPI Excel-Datei hochladen",
      dropzone_title: "Ziehe deine BFS-Excel-Datei hierher",
      dropzone_sub: "oder klicke zum Durchsuchen (.xlsx Dateien)",
      upload_processing: "Extrahiere Daten mit R Shiny Backend...",
      upload_success: "Daten erfolgreich aktualisiert!",
      btn_close: "Schließen",
      btn_cancel: "Abbrechen",
      footer_text: "LUKB Makrodaten CPI Dashboard • Bundesamt für Statistik (BFS) Landesindex der Konsumentenpreise"
    },
    fr: {
      app_title: "Indice suisse des prix à la consommation (IPC)",
      app_subtitle: "Données macroéconomiques OFS & Dashboard d'inflation",
      status_prefix: "État:",
      basis_prefix: "Base:",
      source_prefix: "Source: OFS",
      upload_btn: "Charger fichier OFS (.xlsx)",
      overview_title: "Aperçu macroéconomique",
      overview_desc: "Indicateurs clés de l'inflation suisse et dynamique des prix",
      kpi_headline: "Indice total (IPC)",
      kpi_core1: "Inflation sous-jacente 1",
      kpi_origin: "Produits indigènes vs. importés",
      kpi_goods_services: "Biens vs. Services",
      weight: "Poids:",
      mom_rate: "MoM:",
      yoy_rate: "YoY:",
      prev_month: "Mois préc.",
      prev_year: "Année préc.",
      spread: "Écart au total:",
      inland: "Indigènes",
      import: "Importés",
      goods: "Biens",
      services: "Services",
      macro_chart_title: "Évolution comparative de l'inflation",
      macro_chart_desc: "Comparaison des principaux agrégats de prix",
      drivers_title: "Groupes principaux: Contributions & Pondération",
      drivers_desc: "Analyse des 13 catégories principales COICOP",
      btn_contr: "Contrib. MoM",
      btn_contr_yoy: "Contrib. YoY",
      btn_delta_yoy: "Δ Contrib. YoY",
      btn_yoy: "Inflation YoY (%)",
      btn_weight: "Pondération (%)",
      metric_yoy: "Variation annuelle YoY (%)",
      metric_mom: "Variation mensuelle MoM (%)",
      metric_index: "Niveau d'indice (100)",
      range_1y: "1A",
      range_3y: "3A",
      range_5y: "5A",
      range_10y: "10A",
      range_max: "Max",
      special_hub_title: "Agrégats spécifiques (Subdivisions spéciales)",
      special_hub_desc: "Classifications officielles OFS par provenance, nature et sous-jacente",
      tab_core: "Inflation sous-jacente",
      tab_origin: "Provenance (Indigène/Importé)",
      tab_goods: "Biens & Services",
      tab_admin: "Prix administrés",
      tab_exclusions: "Exclusions spécifiques",
      explorer_title: "Explorateur hiérarchique & Drill-down",
      explorer_desc: "Navigation continue des 13 groupes principaux jusqu'au produit",
      search_placeholder: "Rechercher une catégorie ou produit (Nom, COICOP, Code)...",
      th_coicop: "COICOP",
      th_code: "Code OFS",
      th_name: "Désignation",
      th_weight: "Poids (%)",
      th_index: "Indice",
      th_mom: "MoM (%)",
      th_yoy: "YoY (%)",
      th_contr_mom: "Contrib. MoM",
      th_contr_yoy: "Contrib. YoY",
      th_actions: "Actions",
      action_drilldown: "Détails",
      action_chart: "Graphique",
      items_count: "Sous-postes",
      parent_total: "Indice total",
      modal_chart_title: "Analyse détaillée & Série chronologique",
      stat_latest: "Dernière valeur",
      stat_avg12: "Moyenne 12M",
      stat_min12: "Min 12M",
      stat_max12: "Max 12M",
      stat_weight: "Poids dans le panier",
      upload_modal_title: "Téléverser le fichier Excel IPC actuel de l'OFS",
      dropzone_title: "Glissez votre fichier Excel OFS ici",
      dropzone_sub: "ou cliquez pour sélectionner (.xlsx)",
      upload_processing: "Extraction des données avec le backend R Shiny...",
      upload_success: "Données mises à jour avec succès!",
      btn_close: "Fermer",
      btn_cancel: "Annuler",
      footer_text: "LUKB CPI Dashboard • Office fédéral de la statistique (OFS)"
    },
    it: {
      app_title: "Indice nazionale svizzero dei prezzi al consumo (IPC)",
      app_subtitle: "Dati macroeconomici UST & Dashboard rincaro",
      status_prefix: "Stato:",
      basis_prefix: "Base:",
      source_prefix: "Fonte: UST",
      upload_btn: "Carica file UST (.xlsx)",
      overview_title: "Panoramica macroeconomica",
      overview_desc: "Indicatori principali dell'inflazione svizzera e andamento dei prezzi",
      kpi_headline: "Indice totale (IPC)",
      kpi_core1: "Zoccolo dell'inflazione 1",
      kpi_origin: "Prodotti indigeni vs. importati",
      kpi_goods_services: "Beni vs. Servizi",
      weight: "Peso:",
      mom_rate: "MoM:",
      yoy_rate: "YoY:",
      prev_month: "Mese prec.",
      prev_year: "Anno prec.",
      spread: "Differenziale:",
      inland: "Indigeni",
      import: "Importati",
      goods: "Beni",
      services: "Servizi",
      macro_chart_title: "Andamento comparativo del rincaro",
      macro_chart_desc: "Confronto tra i principali aggregati dei prezzi",
      drivers_title: "Gruppi principali: Contributi & Ponderazione",
      drivers_desc: "Analisi delle 13 categorie principali COICOP",
      btn_contr: "Contrib. MoM",
      btn_contr_yoy: "Contrib. YoY",
      btn_delta_yoy: "Δ Contrib. YoY",
      btn_yoy: "Rincaro YoY (%)",
      btn_weight: "Ponderazione (%)",
      metric_yoy: "Tasso annuo YoY (%)",
      metric_mom: "Tasso mensile MoM (%)",
      metric_index: "Livello indice (100)",
      range_1y: "1A",
      range_3y: "3A",
      range_5y: "5A",
      range_10y: "10A",
      range_max: "Max",
      special_hub_title: "Aggregati speciali (Classificazioni supplementari)",
      special_hub_desc: "Classificazioni ufficiali UST per provenienza, natura e fondo",
      tab_core: "Zoccolo inflazione",
      tab_origin: "Provenienza (Indigeni/Importati)",
      tab_goods: "Beni & Servizi",
      tab_admin: "Prezzi amministrati",
      tab_exclusions: "Esclusioni specifiche",
      explorer_title: "Esploratore gerarchico & Drill-down",
      explorer_desc: "Navigazione dai 13 gruppi principali fino al singolo prodotto",
      search_placeholder: "Cerca categoria o prodotto (Nome, COICOP, Codice)...",
      th_coicop: "COICOP",
      th_code: "Codice UST",
      th_name: "Designazione",
      th_weight: "Peso (%)",
      th_index: "Indice",
      th_mom: "MoM (%)",
      th_yoy: "YoY (%)",
      th_contr_mom: "Contrib. MoM",
      th_contr_yoy: "Contrib. YoY",
      th_actions: "Azioni",
      action_drilldown: "Dettagli",
      action_chart: "Grafico",
      items_count: "Sottovoci",
      parent_total: "Indice totale",
      modal_chart_title: "Analisi dettagliata & Serie temporale",
      stat_latest: "Ultimo valore",
      stat_avg12: "Media 12M",
      stat_min12: "Min 12M",
      stat_max12: "Max 12M",
      stat_weight: "Peso nel paniere",
      upload_modal_title: "Carica il file Excel IPC attuale dell'UST",
      dropzone_title: "Trascina qui il file Excel UST",
      dropzone_sub: "oppure clicca per selezionare (.xlsx)",
      upload_processing: "Estrazione dati con R Shiny backend...",
      upload_success: "Dati aggiornati con successo!",
      btn_close: "Chiudi",
      btn_cancel: "Annulla",
      footer_text: "LUKB CPI Dashboard • Ufficio federale di statistica (UST)"
    },
    en: {
      app_title: "Swiss Consumer Price Index (CPI)",
      app_subtitle: "FSO Macroeconomic Data & Inflation Dashboard",
      status_prefix: "As of:",
      basis_prefix: "Base:",
      source_prefix: "Source: FSO",
      upload_btn: "Upload FSO File (.xlsx)",
      overview_title: "Macro Overview at a Glance",
      overview_desc: "Key indicators of Swiss inflation and price dynamics",
      kpi_headline: "Headline CPI (Total)",
      kpi_core1: "Core Inflation 1",
      kpi_origin: "Domestic vs. Imported Goods",
      kpi_goods_services: "Goods vs. Services",
      weight: "Weight:",
      mom_rate: "MoM:",
      yoy_rate: "YoY:",
      prev_month: "Prev Month",
      prev_year: "Prev Year",
      spread: "Spread to Headline:",
      inland: "Domestic",
      import: "Imported",
      goods: "Goods",
      services: "Services",
      macro_chart_title: "Comparative Inflation Trends",
      macro_chart_desc: "Time series comparison of core macro price aggregates",
      drivers_title: "Main Groups: Contributions & Weights",
      drivers_desc: "Breakdown of the 13 COICOP major categories",
      btn_contr: "Contribution MoM",
      btn_contr_yoy: "Contribution YoY",
      btn_delta_yoy: "Δ Contribution YoY",
      btn_yoy: "YoY Inflation (%)",
      btn_weight: "Weighting (%)",
      metric_yoy: "YoY Change (%)",
      metric_mom: "MoM Change (%)",
      metric_index: "Index Level (100)",
      range_1y: "1Y",
      range_3y: "3Y",
      range_5y: "5Y",
      range_10y: "10Y",
      range_max: "Max",
      special_hub_title: "Special Aggregates & Subdivisions",
      special_hub_desc: "Official FSO classifications by origin, goods type, and core rates",
      tab_core: "Core Inflation",
      tab_origin: "Origin (Domestic/Imported)",
      tab_goods: "Goods & Services",
      tab_admin: "Administered Prices",
      tab_exclusions: "Specific Exclusions",
      explorer_title: "Hierarchical Drill-Down Explorer",
      explorer_desc: "Seamless exploration from the 13 main groups down to product varieties",
      search_placeholder: "Search category or product (Name, COICOP, Code)...",
      th_coicop: "COICOP",
      th_code: "FSO Code",
      th_name: "Description",
      th_weight: "Weight (%)",
      th_index: "Index",
      th_mom: "MoM (%)",
      th_yoy: "YoY (%)",
      th_contr_mom: "Beitrag MoM",
      th_contr_yoy: "Beitrag YoY",
      th_actions: "Actions",
      action_drilldown: "Drill Down",
      action_chart: "Chart",
      items_count: "Sub-items",
      parent_total: "Total Index",
      modal_chart_title: "Detail Deep-Dive & Time Series",
      stat_latest: "Latest Level",
      stat_avg12: "12M Average",
      stat_min12: "12M Low",
      stat_max12: "12M High",
      stat_weight: "Basket Weight",
      upload_modal_title: "Upload Current FSO CPI Excel File",
      dropzone_title: "Drag & drop your FSO Excel file here",
      dropzone_sub: "or click to browse (.xlsx files)",
      upload_processing: "Extracting data with R Shiny Backend...",
      upload_success: "Data successfully updated!",
      btn_close: "Close",
      btn_cancel: "Cancel",
      footer_text: "LUKB Macro Data CPI Dashboard • Swiss Federal Statistical Office (FSO)"
    }
  };

  // ============================================================================
  // Application State
  // ============================================================================
  const state = {
    lang: 'de',
    summaryData: null,
    fullData: null,
    currentNodeCode: '100_100',
    breadcrumbPath: ['100_100'],
    macroTimeframe: '5Y',
    macroMetric: 'yoy', // 'yoy', 'mom', 'index'
    activeMacroSeries: ['100_100', 'sp_1170_103', 'sp_1819_118', 'sp_1819_119'],
    driversMode: 'contr', // 'contr', 'yoy', 'weight'
    activeSpecialTab: 'special_core',
    activeSearchTerm: '',
    sortCol: 'coicop',
    sortAsc: true,
    modalItem: null,
    modalMetric: 'yoy',
    modalTimeframe: '5Y',
    charts: {
      macro: null,
      drivers: null,
      modal: null
    }
  };

  // ============================================================================
  // DOM Elements
  // ============================================================================
  const dom = {
    statusBadgeText: document.getElementById('status-badge-text'),
    basisText: document.getElementById('basis-text'),
    langBtns: document.querySelectorAll('.lang-btn'),
    btnOpenUpload: document.getElementById('btn-open-upload'),
    uploadModal: document.getElementById('upload-modal'),
    btnCloseUpload: document.getElementById('btn-close-upload'),
    btnCancelUpload: document.getElementById('btn-cancel-upload'),
    dropzone: document.getElementById('dropzone'),
    fileInput: document.getElementById('hidden-file-input'),
    uploadSpinner: document.getElementById('upload-spinner'),
    uploadStatusMsg: document.getElementById('upload-status-msg'),
    kpiCardsContainer: document.getElementById('kpi-cards-container'),
    macroChartCanvas: document.getElementById('macro-chart-canvas'),
    macroMetricBtns: document.querySelectorAll('[data-macro-metric]'),
    macroRangeBtns: document.querySelectorAll('[data-macro-range]'),
    macroSeriesChips: document.getElementById('macro-series-chips'),
    driversChartCanvas: document.getElementById('drivers-chart-canvas'),
    driversModeBtns: document.querySelectorAll('[data-drivers-mode]'),
    specialTabs: document.querySelectorAll('.special-tab-btn'),
    specialGrid: document.getElementById('special-grid'),
    breadcrumbs: document.getElementById('breadcrumbs'),
    currentNodeSummary: document.getElementById('current-node-summary'),
    searchInput: document.getElementById('search-input'),
    tableBody: document.getElementById('table-body'),
    detailModal: document.getElementById('detail-modal'),
    btnModalClose: document.getElementById('btn-modal-close'),
    modalTitle: document.getElementById('modal-title'),
    modalCoicop: document.getElementById('modal-coicop'),
    modalChartCanvas: document.getElementById('modal-chart-canvas'),
    modalMetricBtns: document.querySelectorAll('[data-modal-metric]'),
    modalRangeBtns: document.querySelectorAll('[data-modal-range]'),
    modalStatsContainer: document.getElementById('modal-stats-container'),
    toastContainer: document.getElementById('toast-container')
  };

  // ============================================================================
  // Helpers & Formatters
  // ============================================================================
  function t(key) {
    const dict = I18N[state.lang] || I18N.de;
    return dict[key] || I18N.de[key] || key;
  }

  function getItemName(item) {
    if (!item || !item.names) return '';
    return item.names[state.lang] || item.names.de || item.code;
  }

  function getBfsCode(item) {
    if (!item) return '—';
    if (typeof item.bfs_code === 'string' && item.bfs_code.length > 0) return item.bfs_code;
    if (typeof item.code === 'string' && item.code.length > 0) return item.code;
    return '—';
  }

  function getCoicopCode(item) {
    if (!item) return '';
    if (typeof item.coicop === 'string') {
      return item.coicop.replace(/^'+/, '').trim();
    }
    return '';
  }

  function formatNum(val, decimals = 2, withSign = false) {
    if (val === null || val === undefined || isNaN(val)) return '—';
    const sign = withSign && val > 0 ? '+' : '';
    return sign + val.toFixed(decimals);
  }

  function formatRateBadge(val) {
    if (val === null || val === undefined || isNaN(val)) return `<span class="kpi-rate-badge rate-neutral">—</span>`;
    const cls = val > 0 ? 'rate-up' : val < 0 ? 'rate-down' : 'rate-neutral';
    const sign = val > 0 ? '+' : '';
    const arrow = val > 0 ? '▲' : val < 0 ? '▼' : '▬';
    return `<span class="kpi-rate-badge ${cls}">${arrow} ${sign}${val.toFixed(1)}%</span>`;
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  function filterDatesByRange(dates, rangeStr) {
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

  // ============================================================================
  // Data Loading
  // ============================================================================
  async function loadData(forceRefresh = false) {
    try {
      const cacheBust = forceRefresh ? `?_=${Date.now()}` : '';
      const summaryResp = await fetch(`data/cpi_summary.json${cacheBust}`);
      if (!summaryResp.ok) throw new Error('Could not load cpi_summary.json');
      state.summaryData = await summaryResp.json();
      
      // Update header info
      updateHeaderInfo();
      
      // Render components
      renderKPIs();
      renderMacroChart();
      renderDriversChart();
      renderSpecialHub();
      renderExplorer();

      // Lazy load full data for deep-dive charts if needed
      fetch(`data/cpi_data.json${cacheBust}`)
        .then(r => r.ok ? r.json() : null)
        .then(full => {
          if (full) state.fullData = full;
        })
        .catch(err => console.warn('Background full data load:', err));

    } catch (err) {
      console.error('Data load error:', err);
      showToast('Fehler beim Laden der CPI-Daten: ' + err.message, 'error');
    }
  }

  function getItem(code) {
    if (state.fullData && state.fullData.items && state.fullData.items[code]) {
      return state.fullData.items[code];
    }
    if (state.summaryData && state.summaryData.items && state.summaryData.items[code]) {
      return state.summaryData.items[code];
    }
    return null;
  }

  // ============================================================================
  // UI Translations Refresh
  // ============================================================================
  function refreshUITranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && I18N[state.lang][key]) {
        el.textContent = I18N[state.lang][key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && I18N[state.lang][key]) {
        el.placeholder = I18N[state.lang][key];
      }
    });

    updateHeaderInfo();
    renderKPIs();
    renderMacroChart();
    renderDriversChart();
    renderSpecialHub();
    renderExplorer();
    if (state.modalItem) renderModalContent(state.modalItem);
  }

  function updateHeaderInfo() {
    if (!state.summaryData || !state.summaryData.meta) return;
    const meta = state.summaryData.meta;
    dom.statusBadgeText.textContent = `${t('status_prefix')} ${meta.latest_date}`;
    dom.basisText.textContent = `${meta.base} | ${t('source_prefix')}`;
  }

  // ============================================================================
  // 1. KPI Cards ("Auf einen Blick")
  // ============================================================================
  function renderKPIs() {
    if (!state.summaryData) return;
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
      <div class="kpi-card">
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
      <div class="kpi-card">
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
      <div class="kpi-card">
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

    dom.kpiCardsContainer.innerHTML = cardsHtml;
  }

  // ============================================================================
  // 2. Macro Interactive Comparison Chart
  // ============================================================================
  const MACRO_SERIES_DEFINITIONS = [
    { code: '100_100', color: '#0f172a', width: 3 },       // Gesamtindex
    { code: 'sp_1170_103', color: '#e11d48', width: 2 },   // Kern 1
    { code: 'sp_1170_302', color: '#f59e0b', width: 2 },   // Kern 2
    { code: 'sp_1819_118', color: '#059669', width: 2 },   // Inland
    { code: 'sp_1819_119', color: '#2563eb', width: 2 },   // Import
    { code: 'sp_110_101', color: '#8b5cf6', width: 2 },    // Waren
    { code: 'sp_110_102', color: '#06b6d4', width: 2 }     // Dienstleistungen
  ];

  function renderMacroSeriesChips() {
    dom.macroSeriesChips.innerHTML = '';
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
      dom.macroSeriesChips.appendChild(chip);
    });
  }

  function renderMacroChart() {
    if (!state.summaryData || !window.Chart) return;
    renderMacroSeriesChips();

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

    if (state.charts.macro) {
      state.charts.macro.destroy();
    }

    const metricUnit = state.macroMetric === 'index' ? 'Pts' : '%';

    state.charts.macro = new Chart(dom.macroChartCanvas, {
      type: 'line',
      data: {
        labels: chartDates,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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

  // ============================================================================
  // 3. 13 Main Groups & Inflation Drivers Chart
  // ============================================================================
  function renderDriversChart() {
    if (!state.summaryData || !window.Chart) return;
    const items = state.summaryData.items;

    // Filter main groups (100_1 to 100_13)
    const mainGroups = [];
    for (let i = 1; i <= 13; i++) {
      const code = `100_${i}`;
      if (items[code]) mainGroups.push(items[code]);
    }

    if (mainGroups.length === 0) return;

    // Total-Element (100_100) als Vergleichsbasis holen
    const totalItem = items['100_100'];

    // Helper to get metric value per item according to mode
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

    // Sort 13 main groups
    let sorted = [...mainGroups];
    sorted.sort((a, b) => getDriverVal(b, state.driversMode) - getDriverVal(a, state.driversMode));

    // Optional: Total oben oder unten als Vergleichsbasis anfügen
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
        return '#0f172a'; // Prägnantes Schwarzblau für Total
      }
      if (state.driversMode === 'weight') {
        return '#2563eb';
      }
      return val >= 0 ? '#e11d48' : '#059669';
    });

    if (state.charts.drivers) {
      state.charts.drivers.destroy();
    }

    const unit = (state.driversMode === 'contr' || state.driversMode === 'contr_yoy' || state.driversMode === 'delta_yoy') ? ' %p' : ' %';

    state.charts.drivers = new Chart(dom.driversChartCanvas, {
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
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const clickedItem = displayList[idx];
            if (clickedItem) {
              drillDownToNode(clickedItem.code);
              document.getElementById('explorer-section').scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      }
    });
  }

  // ============================================================================
  // 4. Sondergliederungen Hub
  // ============================================================================
  function renderSpecialHub() {
    if (!state.summaryData) return;
    const specialGroups = state.summaryData.special_groups;
    const items = state.summaryData.items;

    const groupCodes = specialGroups[state.activeSpecialTab] || [];
    dom.specialGrid.innerHTML = '';

    if (groupCodes.length === 0) {
      dom.specialGrid.innerHTML = `<p style="color:var(--gray-500); grid-column:1/-1;">Keine Positionen in dieser Sondergruppe.</p>`;
      return;
    }

    groupCodes.forEach(code => {
      const it = items[code];
      if (!it) return;

      const card = document.createElement('div');
      card.className = 'special-card';
      card.onclick = () => window.cpiApp.openDetailModal(code);

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
      dom.specialGrid.appendChild(card);
    });
  }

  // ============================================================================
  // 5. Hierarchical Drilldown Explorer
  // ============================================================================
  function renderBreadcrumbs() {
    dom.breadcrumbs.innerHTML = '';
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
      dom.breadcrumbs.appendChild(crumb);

      if (!isLast) {
        const sep = document.createElement('span');
        sep.className = 'breadcrumb-sep';
        sep.textContent = '›';
        dom.breadcrumbs.appendChild(sep);
      }
    });
  }

  function renderCurrentNodeSummary() {
    const item = getItem(state.currentNodeCode);
    if (!item) return;

    const drillableChildren = (item.children || []).filter(c => getItem(c));
    const subCount = drillableChildren.length;

    dom.currentNodeSummary.innerHTML = `
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

  function renderTableRows() {
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
      const childCodes = parent.children || [];
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

    dom.tableBody.innerHTML = '';

    if (itemsToDisplay.length === 0) {
      dom.tableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 2rem; color: var(--gray-500);">
            Keine Einträge gefunden.
          </td>
        </tr>
      `;
      return;
    }

    itemsToDisplay.forEach(item => {
      const canDrill = hasDrilldownChildren(item);
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
        tr.onclick = () => window.cpiApp.openDetailModal(item.code);
      }

      dom.tableBody.appendChild(tr);
    });
  }

  // Reconstruct exact ancestral path for any node (from 100_100 down to code)
  function buildAncestralPath(code) {
    const path = [];
    let curr = getItem(code);
    while (curr) {
      path.unshift(curr.code);
      if (curr.code === '100_100' || !curr.parent) break;
      curr = getItem(curr.parent);
    }
    if (path.length === 0 || path[0] !== '100_100') {
      path.unshift('100_100');
    }
    return path;
  }

  // Check if an item has meaningful children to drill down into
  function hasDrilldownChildren(item) {
    if (!item || !item.children || item.children.length === 0) return false;
    // If it only has 1 child and that child has no children and has the exact same name, it's a leaf endpoint
    if (item.children.length === 1) {
      const singleChild = getItem(item.children[0]);
      if (!singleChild) return false;
      const childHasChildren = singleChild.children && singleChild.children.length > 0;
      const sameName = getItemName(singleChild).trim().toLowerCase() === getItemName(item).trim().toLowerCase();
      if (!childHasChildren && sameName) {
        return false;
      }
    }
    return true;
  }

  function drillDownToNode(code) {
    state.activeSearchTerm = '';
    dom.searchInput.value = '';

    const item = getItem(code);
    if (!item) return;

    // If item has no meaningful sub-items, open detail chart modal directly!
    if (!hasDrilldownChildren(item)) {
      window.cpiApp.openDetailModal(code);
      return;
    }

    // Set correct node and construct clean ancestral breadcrumb path
    state.currentNodeCode = code;
    state.breadcrumbPath = buildAncestralPath(code);

    renderExplorer();
  }

  function renderExplorer() {
    renderBreadcrumbs();
    renderCurrentNodeSummary();
    renderTableRows();
  }

  // ============================================================================
  // 6. Detail Deep-Dive Modal
  // ============================================================================
  async function openDetailModal(code) {
    let item = getItem(code);
    if (!item) return;

    // If item doesn't have full history, try to get it from fullData
    if (!item.history && state.fullData && state.fullData.items && state.fullData.items[code]) {
      item = state.fullData.items[code];
    } else if (!item.history) {
      // Fetch full data on demand
      try {
        const fullResp = await fetch('data/cpi_data.json');
        if (fullResp.ok) {
          state.fullData = await fullResp.json();
          if (state.fullData.items[code]) {
            item = state.fullData.items[code];
          }
        }
      } catch (e) {
        console.warn('Could not fetch full data for item:', e);
      }
    }

    state.modalItem = item;
    renderModalContent(item);
    dom.detailModal.classList.add('open');
  }

  function renderModalContent(item) {
    dom.modalTitle.textContent = getItemName(item);
    const coicop = getCoicopCode(item);
    dom.modalCoicop.textContent = coicop ? `COICOP: ${coicop} | Code: ${getBfsCode(item)}` : `Code: ${getBfsCode(item)}`;

    // Statistics
    const history = item.history ? item.history.yoy : [];
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

    dom.modalStatsContainer.innerHTML = `
      <div class="kpi-card" style="padding:0.75rem;">
        <span class="kpi-detail-label">${t('stat_latest')}</span>
        <span class="kpi-detail-val" style="font-size:1.1rem;">${formatNum(item.latest.index, 2)} Pts</span>
      </div>
      <div class="kpi-card" style="padding:0.75rem;">
        <span class="kpi-detail-label">${t('yoy_rate')}</span>
        <span class="kpi-detail-val" style="font-size:1.1rem;">${formatRateBadge(item.latest.yoy)}</span>
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
        <span class="kpi-detail-val" style="font-size:1.1rem;">${item.weight}%</span>
      </div>
    `;

    renderModalChart(item);
  }

  function renderModalChart(item) {
    if (!window.Chart || !item.history) return;

    const dates = state.summaryData.meta.dates;
    const { startIdx } = filterDatesByRange(dates, state.modalTimeframe);
    const chartDates = dates.slice(startIdx);
    const rawData = item.history[state.modalMetric] || [];
    const dataSlice = rawData.slice(startIdx);

    if (state.charts.modal) {
      state.charts.modal.destroy();
    }

    const metricUnit = state.modalMetric === 'index' ? 'Pts' : '%';

    state.charts.modal = new Chart(dom.modalChartCanvas, {
      type: 'line',
      data: {
        labels: chartDates,
        datasets: [{
          label: getItemName(item),
          data: dataSlice,
          borderColor: '#1d4ed8',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          borderWidth: 2,
          pointRadius: chartDates.length > 36 ? 0 : 2,
          pointHoverRadius: 5,
          tension: 0.15,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const v = ctx.parsed.y;
                return ` ${v !== null ? v.toFixed(2) + ' ' + metricUnit : '—'}`;
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

  function closeModal() {
    dom.detailModal.classList.remove('open');
    state.modalItem = null;
  }

  // ============================================================================
  // 7. Upload Modal & Shiny Backend Binding
  // ============================================================================
  function openUploadModal() {
    dom.uploadModal.classList.add('open');
    dom.uploadSpinner.style.display = 'none';
    dom.uploadStatusMsg.textContent = '';
  }

  function closeUploadModal() {
    dom.uploadModal.classList.remove('open');
    dom.uploadSpinner.style.display = 'none';
  }

  function handleFileSelected(file) {
    if (!file) return;
    if (!file.name.endsWith('.xlsx')) {
      alert('Bitte eine .xlsx Datei vom BFS auswählen.');
      return;
    }

    dom.uploadSpinner.style.display = 'inline-block';
    dom.uploadStatusMsg.textContent = `${t('upload_processing')} (${file.name})`;

    // Check if Shiny fileInput exists in the DOM
    const shinyFileInput = document.querySelector('input[type="file"][name="cpi_file_upload"]') ||
                           document.querySelector('#cpi_file_upload');

    if (shinyFileInput) {
      // Forward file to Shiny
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      shinyFileInput.files = dataTransfer.files;
      // Trigger shiny change event
      const event = new Event('change', { bubbles: true });
      shinyFileInput.dispatchEvent(event);
    } else {
      // Fallback: If run without Shiny server (e.g. standalone preview)
      setTimeout(() => {
        dom.uploadSpinner.style.display = 'none';
        dom.uploadStatusMsg.textContent = 'Hinweis: R Shiny Backend ist nicht aktiv. Lokale JSON-Dateien werden genutzt.';
        showToast('Keine R-Server-Verbindung aktiv. Bestehende Daten bleiben erhalten.', 'info');
      }, 1500);
    }
  }

  // ============================================================================
  // Event Listeners & Initialization
  // ============================================================================
  function setupEventListeners() {
    // Language Switcher
    dom.langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.lang = btn.getAttribute('data-lang');
        refreshUITranslations();
      });
    });

    // Upload Modal Controls
    dom.btnOpenUpload.addEventListener('click', openUploadModal);
    dom.btnCloseUpload.addEventListener('click', closeUploadModal);
    dom.btnCancelUpload.addEventListener('click', closeUploadModal);

    // Drag and Drop
    dom.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dom.dropzone.classList.add('dragover');
    });

    dom.dropzone.addEventListener('dragleave', () => {
      dom.dropzone.classList.remove('dragover');
    });

    dom.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dom.dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelected(e.dataTransfer.files[0]);
      }
    });

    dom.dropzone.addEventListener('click', () => {
      dom.fileInput.click();
    });

    dom.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelected(e.target.files[0]);
      }
    });

    // Macro Chart Controls
    dom.macroMetricBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.macroMetricBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.macroMetric = btn.getAttribute('data-macro-metric');
        renderMacroChart();
      });
    });

    dom.macroRangeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.macroRangeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.macroTimeframe = btn.getAttribute('data-macro-range');
        renderMacroChart();
      });
    });

    // Drivers Chart Controls
    dom.driversModeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.driversModeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.driversMode = btn.getAttribute('data-drivers-mode');
        renderDriversChart();
      });
    });

    // Special Tabs
    dom.specialTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.specialTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeSpecialTab = btn.getAttribute('data-special-tab');
        renderSpecialHub();
      });
    });

    // Search input
    dom.searchInput.addEventListener('input', (e) => {
      state.activeSearchTerm = e.target.value;
      renderTableRows();
    });

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

    // Detail Modal Controls
    dom.btnModalClose.addEventListener('click', closeModal);
    dom.detailModal.addEventListener('click', (e) => {
      if (e.target === dom.detailModal) closeModal();
    });

    dom.modalMetricBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.modalMetricBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.modalMetric = btn.getAttribute('data-modal-metric');
        if (state.modalItem) renderModalChart(state.modalItem);
      });
    });

    dom.modalRangeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        dom.modalRangeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.modalTimeframe = btn.getAttribute('data-modal-range');
        if (state.modalItem) renderModalChart(state.modalItem);
      });
    });

    // Keyboard ESC to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        closeUploadModal();
      }
    });

    // Listen for Shiny WebSocket Messages
    if (window.Shiny) {
      Shiny.addCustomMessageHandler('upload_complete', function (msg) {
        dom.uploadSpinner.style.display = 'none';
        if (msg.status === 'success') {
          showToast(msg.message, 'success');
          closeUploadModal();
          loadData(true);
        } else {
          dom.uploadStatusMsg.textContent = msg.message || 'Fehler beim Verarbeiten der Datei.';
          showToast(msg.message || 'Upload fehlgeschlagen', 'error');
        }
      });
    }
  }

  // Public API for HTML inline handlers
  window.cpiApp = {
    drillDown: drillDownToNode,
    openDetailModal: openDetailModal,
    showToast: showToast
  };

  // Bootstrap Application
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadData();
  });

})();

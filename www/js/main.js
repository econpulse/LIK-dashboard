/**
 * Swiss CPI Dashboard - Main Entry Point
 * ES6 Modular Architecture
 */
import { state } from './state.js';
import { applyStaticTranslations } from './i18n/index.js';
import { loadSummaryData } from './services/dataService.js';
import { initShinyBridge } from './services/shinyBridge.js';
import { showToast } from './utils/helpers.js';

// Components
import { initHeader, updateHeaderInfo } from './components/header.js';
import { renderKPIs } from './components/kpiCards.js';
import { initMacroChart, renderMacroSeriesChips, renderMacroChart } from './components/macroChart.js';
import { initDriversChart, renderDriversChart } from './components/driversChart.js';
import { initSpecialHub, renderSpecialHub } from './components/specialHub.js';
import { initExplorer, renderExplorer, drillDownToNode } from './components/explorer.js';
import { initDetailModal, openDetailModal, closeModal, renderModalContent } from './components/detailModal.js';
import { initUploadModal, closeUploadModal } from './components/uploadModal.js';

/**
 * Re-renders all views and charts based on current state & translations
 */
export function refreshUI() {
  applyStaticTranslations();
  updateHeaderInfo();
  renderKPIs();
  renderMacroSeriesChips();
  renderMacroChart();
  renderDriversChart();
  renderSpecialHub();
  renderExplorer();
  if (state.modalItem) {
    renderModalContent(state.modalItem);
  }
}

/**
 * Loads data from backend/json and triggers full render
 */
export async function loadAndRenderData(forceRefresh = false) {
  try {
    await loadSummaryData(forceRefresh);
    refreshUI();
  } catch (err) {
    console.error('Failed to load & render CPI data:', err);
  }
}

/**
 * Global API for HTML inline handlers & backwards compatibility
 */
window.cpiApp = {
  drillDown: drillDownToNode,
  openDetailModal: openDetailModal,
  showToast: showToast
};

/**
 * Global Keyboard & Shiny Event Setup
 */
function setupGlobalEvents() {
  // ESC key to close any open modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeUploadModal();
    }
  });

  // Listen for Shiny WebSocket Messages
  initShinyBridge({
    onUploadComplete: (msg) => {
      const uploadSpinner = document.getElementById('upload-spinner');
      const uploadStatusMsg = document.getElementById('upload-status-msg');
      if (uploadSpinner) uploadSpinner.style.display = 'none';

      if (msg.status === 'success') {
        showToast(msg.message, 'success');
        closeUploadModal();
        loadAndRenderData(true);
      } else {
        if (uploadStatusMsg) {
          uploadStatusMsg.textContent = msg.message || 'Fehler beim Verarbeiten der Datei.';
        }
        showToast(msg.message || 'Upload fehlgeschlagen', 'error');
      }
    }
  });
}

/**
 * Application Bootstrap
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Component Event Listeners
  initHeader(() => refreshUI());
  initMacroChart();
  initDriversChart();
  initSpecialHub();
  initExplorer();
  initDetailModal();
  initUploadModal();
  setupGlobalEvents();

  // Initial Data Load
  loadAndRenderData();
});

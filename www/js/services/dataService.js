/**
 * Data Service for Fetching and Caching CPI Datasets
 */
import { state } from '../state.js';
import { showToast } from '../utils/helpers.js';
import { getItemHistory } from '../utils/cpiHierarchy.js';

export async function loadSummaryData(forceRefresh = false) {
  try {
    if (forceRefresh) {
      state.fullData = null; // Cache bei explizitem Reload / Upload invalidieren
    }

    // Cache-Busting nur bei forceRefresh, sonst normale HTTP-Caching / ETags nutzen
    const cacheBust = forceRefresh ? `?v=${Date.now()}` : '';
    const summaryResp = await fetch(`data/cpi_summary.json${cacheBust}`);
    if (!summaryResp.ok) throw new Error('Could not load cpi_summary.json');
    state.summaryData = await summaryResp.json();
    return state.summaryData;
  } catch (err) {
    console.error('Data load error:', err);
    showToast('Fehler beim Laden der CPI-Daten: ' + err.message, 'error');
    throw err;
  }
}

export function getItem(code) {
  if (state.fullData && state.fullData.items && state.fullData.items[code]) {
    return state.fullData.items[code];
  }
  if (state.summaryData && state.summaryData.items && state.summaryData.items[code]) {
    return state.summaryData.items[code];
  }
  return null;
}

export async function loadFullDataIfNeeded(items) {
  const needsFullData = items.some(it => !getItemHistory(it));
  if (!needsFullData) return items;

  if (!state.fullData) {
    try {
      const fullResp = await fetch('data/cpi_data.json');
      if (fullResp.ok) {
        state.fullData = await fullResp.json();
      }
    } catch (e) {
      console.warn('Could not fetch full data for item:', e);
      showToast('Zeitreihendaten konnten nicht geladen werden', 'error');
    }
  }

  if (state.fullData && state.fullData.items) {
    return items.map(it => state.fullData.items[it.code] || it);
  }
  return items;
}

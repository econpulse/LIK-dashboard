/**
 * Data Service for Fetching, Caching, and Background Prefetching of CPI Datasets
 */
import { state } from '../state.js';
import { showToast } from '../utils/helpers.js';
import { getItemHistory } from '../utils/cpiHierarchy.js';

let fullDataFetchPromise = null;

export async function loadSummaryData(forceRefresh = false) {
  try {
    if (forceRefresh) {
      state.fullData = null; // Invalidate cache on explicit reload/upload
      fullDataFetchPromise = null;
    }

    // Cache-busting only on forceRefresh, otherwise standard HTTP caching/ETags
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

/**
 * Initiates background prefetching of the complete dataset during browser idle time
 */
export function prefetchFullData(forceRefresh = false) {
  if (state.fullData && !forceRefresh) {
    return Promise.resolve(state.fullData);
  }

  if (fullDataFetchPromise) {
    return fullDataFetchPromise;
  }

  const cacheBust = forceRefresh ? `?v=${Date.now()}` : '';
  fullDataFetchPromise = fetch(`data/cpi_data.json${cacheBust}`)
    .then(resp => {
      if (!resp.ok) throw new Error('Could not load cpi_data.json');
      return resp.json();
    })
    .then(data => {
      state.fullData = data;
      fullDataFetchPromise = null;
      return data;
    })
    .catch(err => {
      console.warn('Background prefetch failed (will retry on user demand):', err);
      fullDataFetchPromise = null;
    });

  return fullDataFetchPromise;
}

/**
 * Resolves full dataset for items needing full time series history
 */
export async function loadFullDataIfNeeded(items) {
  const needsFullData = items.some(it => !getItemHistory(it));
  if (!needsFullData) return items;

  if (!state.fullData) {
    try {
      if (fullDataFetchPromise) {
        await fullDataFetchPromise;
      } else {
        await prefetchFullData();
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

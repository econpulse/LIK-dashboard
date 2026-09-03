/**
 * Communication Bridge with R Shiny WebSocket Backend
 */
import { showToast } from '../utils/helpers.js';

export function initShinyBridge(callbacks = {}) {
  if (window.Shiny && typeof Shiny.addCustomMessageHandler === 'function') {
    Shiny.addCustomMessageHandler('upload_complete', function (msg) {
      if (typeof callbacks.onUploadComplete === 'function') {
        callbacks.onUploadComplete(msg);
      }
    });
  }
}

export function sendUploadToShiny(file, options = {}) {
  const shinyFileInput = document.querySelector('input[type="file"][name="cpi_file_upload"]') ||
                         document.querySelector('#cpi_file_upload');

  if (shinyFileInput) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    shinyFileInput.files = dataTransfer.files;
    const event = new Event('change', { bubbles: true });
    shinyFileInput.dispatchEvent(event);
  } else {
    // Fallback if standalone without Shiny backend
    if (typeof options.onStandaloneFallback === 'function') {
      options.onStandaloneFallback();
    } else {
      setTimeout(() => {
        showToast('Keine R-Server-Verbindung aktiv. Lokale JSON-Dateien werden genutzt.', 'info');
      }, 1000);
    }
  }
}

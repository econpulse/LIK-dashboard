/**
 * Communication Bridge with R Shiny WebSocket Backend
 */
import { showToast } from '../utils/helpers.js';

export function initShinyBridge(callbacks = {}) {
  let registered = false;

  function register() {
    if (registered) return;
    if (window.Shiny && typeof Shiny.addCustomMessageHandler === 'function') {
      Shiny.addCustomMessageHandler('upload_complete', function (msg) {
        if (typeof callbacks.onUploadComplete === 'function') {
          callbacks.onUploadComplete(msg);
        }
      });
      registered = true;
    }
  }

  // 1. If Shiny is already available
  register();

  // 2. Listen for Shiny connected event
  if (!registered) {
    if (window.$ && typeof $(document).on === 'function') {
      $(document).on('shiny:connected', register);
    }
    window.addEventListener('shiny:connected', register);
    document.addEventListener('shiny:connected', register);

    // 3. Fallback polling for asynchronous WebSocket connection
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      register();
      if (registered || attempts > 50) {
        clearInterval(interval);
      }
    }, 100);
  }
}

export function sendUploadToShiny(file, options = {}) {
  const shinyFileInput = document.querySelector('input[type="file"][name="cpi_file_upload"]') ||
                         document.querySelector('#cpi_file_upload');

  if (shinyFileInput) {
    try {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      shinyFileInput.files = dataTransfer.files;
    } catch (e) {
      console.warn('DataTransfer assignment failed:', e);
    }

    // Trigger both jQuery and native change events for Shiny's fileInputBinding
    if (window.$ && typeof $(shinyFileInput).trigger === 'function') {
      $(shinyFileInput).trigger('change');
    }
    const event = new Event('change', { bubbles: true, cancelable: true });
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

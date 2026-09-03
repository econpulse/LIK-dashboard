/**
 * Upload Modal Component
 */
import { t } from '../i18n/index.js';
import { showToast } from '../utils/helpers.js';
import { sendUploadToShiny } from '../services/shinyBridge.js';

export function openUploadModal() {
  const uploadModal = document.getElementById('upload-modal');
  const uploadSpinner = document.getElementById('upload-spinner');
  const uploadStatusMsg = document.getElementById('upload-status-msg');

  if (uploadModal) uploadModal.classList.add('open');
  if (uploadSpinner) uploadSpinner.style.display = 'none';
  if (uploadStatusMsg) uploadStatusMsg.textContent = '';
}

export function closeUploadModal() {
  const uploadModal = document.getElementById('upload-modal');
  const uploadSpinner = document.getElementById('upload-spinner');

  if (uploadModal) uploadModal.classList.remove('open');
  if (uploadSpinner) uploadSpinner.style.display = 'none';
}

export function handleFileSelected(file) {
  if (!file) return;
  if (!file.name.endsWith('.xlsx')) {
    alert('Bitte eine .xlsx Datei vom BFS auswählen.');
    return;
  }

  const uploadSpinner = document.getElementById('upload-spinner');
  const uploadStatusMsg = document.getElementById('upload-status-msg');

  if (uploadSpinner) uploadSpinner.style.display = 'inline-block';
  if (uploadStatusMsg) uploadStatusMsg.textContent = `${t('upload_processing')} (${file.name})`;

  sendUploadToShiny(file, {
    onStandaloneFallback: () => {
      setTimeout(() => {
        if (uploadSpinner) uploadSpinner.style.display = 'none';
        if (uploadStatusMsg) {
          uploadStatusMsg.textContent = 'Hinweis: R Shiny Backend ist nicht aktiv. Lokale JSON-Dateien werden genutzt.';
        }
        showToast('Keine R-Server-Verbindung aktiv. Bestehende Daten bleiben erhalten.', 'info');
      }, 1500);
    }
  });
}

export function initUploadModal() {
  const btnOpenUpload = document.getElementById('btn-open-upload');
  const btnCloseUpload = document.getElementById('btn-close-upload');
  const btnCancelUpload = document.getElementById('btn-cancel-upload');
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('hidden-file-input');

  if (btnOpenUpload) btnOpenUpload.addEventListener('click', openUploadModal);
  if (btnCloseUpload) btnCloseUpload.addEventListener('click', closeUploadModal);
  if (btnCancelUpload) btnCancelUpload.addEventListener('click', closeUploadModal);

  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelected(e.dataTransfer.files[0]);
      }
    });

    dropzone.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelected(e.target.files[0]);
      }
    });
  }

  const shinyFileInput = document.querySelector('input[type="file"][name="cpi_file_upload"]') ||
                         document.querySelector('#cpi_file_upload');
  if (shinyFileInput) {
    shinyFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const uploadSpinner = document.getElementById('upload-spinner');
        const uploadStatusMsg = document.getElementById('upload-status-msg');
        if (uploadSpinner) uploadSpinner.style.display = 'inline-block';
        if (uploadStatusMsg) uploadStatusMsg.textContent = `${t('upload_processing')} (${file.name})`;
      }
    });
  }
}

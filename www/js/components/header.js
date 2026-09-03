/**
 * Header Component (Status Badge, Base Date, Language Switcher)
 */
import { state } from '../state.js';
import { t } from '../i18n/index.js';

export function updateHeaderInfo() {
  const statusBadgeText = document.getElementById('status-badge-text');
  const basisText = document.getElementById('basis-text');

  if (!state.summaryData || !state.summaryData.meta) return;
  const meta = state.summaryData.meta;
  if (statusBadgeText) {
    statusBadgeText.textContent = `${t('status_prefix')} ${meta.latest_date}`;
  }
  if (basisText) {
    basisText.textContent = `${meta.base} | ${t('source_prefix')}`;
  }
}

export function initHeader(onLanguageChange) {
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.lang = btn.getAttribute('data-lang');
      if (typeof onLanguageChange === 'function') {
        onLanguageChange(state.lang);
      }
    });
  });
}

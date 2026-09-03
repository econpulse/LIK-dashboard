import { de } from './de.js';
import { fr } from './fr.js';
import { it } from './it.js';
import { en } from './en.js';
import { state } from '../state.js';

export const I18N = { de, fr, it, en };

export function t(key) {
  const currentLang = state.lang || 'de';
  const dict = I18N[currentLang] || I18N.de;
  return dict[key] || I18N.de[key] || key;
}

export function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && I18N[state.lang] && I18N[state.lang][key]) {
      el.textContent = I18N[state.lang][key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && I18N[state.lang] && I18N[state.lang][key]) {
      el.placeholder = I18N[state.lang][key];
    }
  });
}

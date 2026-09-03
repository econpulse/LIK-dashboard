/**
 * Central Application State
 */
export const state = {
  lang: 'de',
  summaryData: null,
  fullData: null,
  currentNodeCode: '100_100',
  breadcrumbPath: ['100_100'],
  macroTimeframe: '5Y',
  macroMetric: 'yoy', // 'yoy', 'mom', 'index'
  activeMacroSeries: ['100_100', 'sp_1170_103', 'sp_1819_118', 'sp_1819_119'],
  driversMode: 'contr', // 'contr', 'contr_yoy', 'delta_yoy', 'yoy', 'weight'
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

const defaultMarketPropertyTypes = [
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Studio', value: 'studio' },
  { label: 'Bedsitter', value: 'bedsitter' },
  { label: 'Single room', value: 'single-room' },
];

const defaultMarketBudgetRanges = [
  { label: 'Under KES 20,000', value: 'under-20000', min_price: 0, max_price: 19999 },
  { label: 'KES 20,000 - 40,000', value: '20000-40000', min_price: 20000, max_price: 40000 },
  { label: 'KES 40,000+', value: '40000-plus', min_price: 40001, max_price: null },
];

let marketSettingsCache = null;

async function loadMarketSettings() {
  if (marketSettingsCache) return marketSettingsCache;

  try {
    const response = await fetch('/api/settings');
    if (!response.ok) throw new Error('Settings unavailable');
    const settings = await response.json();
    marketSettingsCache = {
      locations: settings.locations || [],
      property_types: settings.property_types?.length ? settings.property_types : defaultMarketPropertyTypes,
      budget_ranges: settings.budget_ranges?.length ? settings.budget_ranges : defaultMarketBudgetRanges,
    };
  } catch (error) {
    marketSettingsCache = {
      locations: [],
      property_types: defaultMarketPropertyTypes,
      budget_ranges: defaultMarketBudgetRanges,
    };
  }

  return marketSettingsCache;
}

function renderOptions(select, items, firstLabel) {
  if (!select) return;

  const currentValue = select.value;
  const firstOption = firstLabel ? `<option value="">${firstLabel}</option>` : '';
  select.innerHTML = firstOption + items
    .map((item) => `<option value="${item.value}">${item.label}</option>`)
    .join('');
  select.value = items.some((item) => item.value === currentValue) ? currentValue : '';
}

async function renderMarketSettingSelects() {
  const settings = await loadMarketSettings();

  document.querySelectorAll('select[data-property-type-select]').forEach((select) => {
    renderOptions(select, settings.property_types, select.dataset.firstLabel || '');
  });

  document.querySelectorAll('select[data-budget-select]').forEach((select) => {
    renderOptions(select, settings.budget_ranges, select.dataset.firstLabel || 'All budgets');
  });

  document.dispatchEvent(new CustomEvent('thika:market-settings-loaded', { detail: settings }));
}

function getBudgetRange(value) {
  const ranges = marketSettingsCache?.budget_ranges || defaultMarketBudgetRanges;
  return ranges.find((range) => range.value === value);
}

function resetMarketSettingsCache() {
  marketSettingsCache = null;
}

document.addEventListener('DOMContentLoaded', renderMarketSettingSelects);

window.ThikaMarketSettings = {
  defaultMarketBudgetRanges,
  defaultMarketPropertyTypes,
  getBudgetRange,
  loadMarketSettings,
  renderMarketSettingSelects,
  resetMarketSettingsCache,
};

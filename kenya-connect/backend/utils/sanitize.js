function cleanString(value, maxLength = 500) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

function cleanEmail(value) {
  return cleanString(value, 254).toLowerCase();
}

function cleanArray(value, maxItems = 20) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanString(item, 50)).filter(Boolean).slice(0, maxItems);
}

module.exports = {
  cleanArray,
  cleanEmail,
  cleanString,
};

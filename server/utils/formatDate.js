// Converts whatever mysql2 gives us for a DATE column into a clean 'YYYY-MM-DD' string,
// avoiding timezone-shift bugs from JS Date object serialization.
function formatDateOnly(value) {
  if (!value) return value;
  if (typeof value === "string") return value.slice(0, 10);
  // It's a JS Date object — read UTC parts directly (mysql2 stores DATE as UTC-midnight)
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

module.exports = { formatDateOnly };
// Builds bookable time slots for a doctor on a given date, using
// doctor_availability rows (matched by day_of_week name) minus
// any times already booked in the appointments table.
//
// Each slot is returned as { time: '13:00', label: '1:00 PM' } —
// `time` is the raw 24-hour value used internally for booking/DB storage,
// `label` is the human-friendly 12-hour display version.
//
// All "current time" logic is calculated in Pakistan time (UTC+5) explicitly,
// so this works correctly regardless of the server's own system timezone.

const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const SLOT_DURATION_MINUTES = 30;
const PK_OFFSET_MINUTES = 5 * 60; // UTC+5, no daylight saving in Pakistan

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}:00`;
}

// Converts 'HH:MM' (24-hour) into a friendly '1:00 PM' style label
function formatLabel(time24) {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Returns the current date/time as if it were Pakistan local time,
// regardless of what timezone the server itself is running in.
function getPakistanNow() {
  const nowUtcMs = Date.now();
  const pkMs = nowUtcMs + PK_OFFSET_MINUTES * 60 * 1000;
  return new Date(pkMs);
}

function getDayName(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return DAY_NAMES[date.getUTCDay()];
}

/**
 * @param {Array} availabilityRows - rows from doctor_availability for this doctor + day_of_week
 * @param {Array} bookedSlots - array of 'HH:MM:SS' strings already taken on that date (non-cancelled)
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {Array<{time: string, label: string}>}
 */
function buildAvailableSlots(availabilityRows, bookedSlots, dateStr) {
  const slots = [];
  const bookedSet = new Set(bookedSlots.map((s) => s.toString().slice(0, 8)));

  const pkNow = getPakistanNow();
  const todayStr = `${pkNow.getUTCFullYear()}-${String(pkNow.getUTCMonth() + 1).padStart(2, "0")}-${String(pkNow.getUTCDate()).padStart(2, "0")}`;
  const isToday = dateStr === todayStr;
  const nowMinutes = pkNow.getUTCHours() * 60 + pkNow.getUTCMinutes();

  for (const row of availabilityRows) {
    const start = timeToMinutes(row.start_time);
    const end = timeToMinutes(row.end_time);

    for (let t = start; t + SLOT_DURATION_MINUTES <= end; t += SLOT_DURATION_MINUTES) {
      if (isToday && t <= nowMinutes) continue;
      const timeStr = minutesToTime(t);
      if (!bookedSet.has(timeStr)) {
        const time24 = timeStr.slice(0, 5); // 'HH:MM'
        slots.push({ time: time24, label: formatLabel(time24) });
      }
    }
  }

  return slots;
}

module.exports = { getDayName, buildAvailableSlots };
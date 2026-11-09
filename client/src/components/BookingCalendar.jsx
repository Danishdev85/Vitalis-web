import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Simple month-grid date picker for booking flow.
 * - Disables past dates
 * - Optionally disables specific weekdays (e.g. clinic closed Sundays)
 * - Optionally caps how many days ahead can be booked
 *
 * Usage:
 *   <BookingCalendar
 *     selectedDate={selectedDate}
 *     onSelectDate={setSelectedDate}
 *     disabledWeekdays={[0]}     // 0 = Sunday
 *     maxDaysAhead={60}
 *   />
 */
export default function BookingCalendar({
  selectedDate,
  onSelectDate,
  disabledWeekdays = [],
  maxDaysAhead = 60,
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + maxDaysAhead);
    return d;
  }, [today, maxDaysAhead]);

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay(); // 0-6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [viewDate]);

  const canGoPrev = viewDate > new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoNext = viewDate < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  function changeMonth(delta) {
    setViewDate((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));
  }

  function isDisabled(date) {
    if (!date) return true;
    if (date < today || date > maxDate) return true;
    if (disabledWeekdays.includes(date.getDay())) return true;
    return false;
  }

  return (
    <div className="neo-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => canGoPrev && changeMonth(-1)}
          disabled={!canGoPrev}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all
            ${canGoPrev ? 'shadow-neo-sm hover:shadow-neo text-teal' : 'text-deepblue/20 cursor-not-allowed'}`}
        >
          <FaChevronLeft className="text-xs" />
        </button>

        <AnimatePresence mode="wait">
          <motion.span
            key={monthLabel}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="font-display font-semibold text-deepblue"
          >
            {monthLabel}
          </motion.span>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => canGoNext && changeMonth(1)}
          disabled={!canGoNext}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all
            ${canGoNext ? 'shadow-neo-sm hover:shadow-neo text-teal' : 'text-deepblue/20 cursor-not-allowed'}`}
        >
          <FaChevronRight className="text-xs" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((d) => (
          <span key={d} className="text-center text-xs font-medium text-deepblue/40 py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />;

          const disabled = isDisabled(date);
          const isSelected = selectedDate && toDateKey(date) === toDateKey(selectedDate);
          const isToday = toDateKey(date) === toDateKey(today);

          return (
            <motion.button
              key={toDateKey(date)}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(date)}
              whileHover={!disabled ? { scale: 1.08 } : {}}
              whileTap={!disabled ? { scale: 0.92 } : {}}
              className={`aspect-square rounded-xl text-sm font-medium flex items-center justify-center
                transition-all duration-200 relative
                ${disabled ? 'text-deepblue/20 cursor-not-allowed' : 'text-deepblue/80 hover:shadow-neo-sm'}
                ${isSelected ? 'bg-teal text-white shadow-glow-teal' : ''}
                ${isToday && !isSelected ? 'ring-1 ring-teal/50' : ''}
              `}
            >
              {date.getDate()}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
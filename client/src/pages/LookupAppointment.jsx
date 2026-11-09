import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaUserMd, FaCalendarAlt, FaClock, FaTimesCircle,
  FaCheckCircle, FaHourglassHalf, FaBan, FaExclamationTriangle,
} from 'react-icons/fa';

import SectionReveal from '../components/SectionReveal.jsx';
import NeomorphicInput from '../components/NeomorphicInput.jsx';
import NeomorphicCard from '../components/NeomorphicCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { lookupAppointment, cancelAppointment } from '../api/api.js';

const statusStyles = {
  pending: { icon: FaHourglassHalf, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending Confirmation' },
  confirmed: { icon: FaCheckCircle, color: 'text-teal', bg: 'bg-mint/40', label: 'Confirmed' },
  cancelled: { icon: FaBan, color: 'text-red-500', bg: 'bg-red-50', label: 'Cancelled' },
  completed: { icon: FaCheckCircle, color: 'text-deepblue/60', bg: 'bg-skyblue/40', label: 'Completed' },
};

export default function LookupAppointment() {
  const [form, setForm] = useState({ code: '', contact: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [appointment, setAppointment] = useState(null);

  const [cancelling, setCancelling] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelError, setCancelError] = useState('');

  function validate() {
    const errs = {};
    if (!form.code.trim()) errs.code = 'Confirmation code is required';
    if (!form.contact.trim()) errs.contact = 'Phone or email is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setNotFound(false);
    setAppointment(null);
    try {
      const result = await lookupAppointment({
        confirmationCode: form.code.trim().toUpperCase(),
        contact: form.contact.trim(),
      });
      setAppointment(result);
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    setCancelError('');
    try {
      const updated = await cancelAppointment({
        confirmationCode: form.code.trim().toUpperCase(),
        contact: form.contact.trim(),
      });
      setAppointment(updated);
      setConfirmingCancel(false);
    } catch (err) {
      setCancelError(err.response?.data?.error || 'Could not cancel this appointment. Please try again.');
    } finally {
      setCancelling(false);
    }
  }

  const status = appointment ? statusStyles[appointment.status] : null;
  const StatusIcon = status?.icon;

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
      <SectionReveal className="text-center mb-10">
        <span className="inline-block bg-mint/60 text-deepblue text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
          My Appointment
        </span>
        <h1 className="font-display text-3xl lg:text-4xl font-semibold text-deepblue mb-3">
          Find Your Booking
        </h1>
        <p className="text-deepblue/60">
          Enter your confirmation code along with the phone or email you booked with.
        </p>
      </SectionReveal>

      {/* Search form — neomorphic */}
      <NeomorphicCard>
        <form onSubmit={handleSearch} className="space-y-5">
          <NeomorphicInput
            label="Confirmation Code"
            name="code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            error={errors.code}
            placeholder="VTL-XXXXX"
            className="font-mono uppercase tracking-wider"
          />
          <NeomorphicInput
            label="Phone or Email"
            name="contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            error={errors.contact}
            placeholder="+92 3XX XXXXXXX or you@email.com"
          />

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 bg-teal text-white font-medium py-3.5 rounded-xl shadow-md hover:shadow-glow-teal transition-all disabled:opacity-60"
          >
            {loading ? 'Searching...' : <>Find Appointment <FaSearch className="text-sm" /></>}
          </motion.button>
        </form>
      </NeomorphicCard>

      {/* Loading */}
      {loading && (
        <div className="mt-10">
          <LoadingSpinner label="Looking up your appointment..." />
        </div>
      )}

      {/* Not found */}
      <AnimatePresence>
        {notFound && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8 flex items-start gap-3 bg-red-50 text-red-600 rounded-2xl px-5 py-4"
          >
            <FaExclamationTriangle className="mt-0.5 shrink-0" />
            <p className="text-sm">
              We couldn't find a matching appointment. Double-check your
              confirmation code and the phone/email you used when booking.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {appointment && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-8 bg-white rounded-3xl border border-skyblue/60 p-7"
          >
            <div className={`inline-flex items-center gap-2 ${status.bg} ${status.color} text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6`}>
              <StatusIcon className="text-xs" /> {status.label}
            </div>

            <div className="space-y-4 mb-2">
              <div className="flex items-center gap-3 text-deepblue">
                <FaUserMd className="text-teal" />
                <span className="font-medium">{appointment.doctor_name}</span>
                <span className="text-deepblue/50 text-sm">· {appointment.specialty}</span>
              </div>
              <div className="flex items-center gap-3 text-deepblue">
                <FaCalendarAlt className="text-teal" />
                <span>
                  {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-deepblue">
                <FaClock className="text-teal" />
                <span>{appointment.time_slot?.slice(0, 5)}</span>
              </div>
            </div>

            {appointment.reason && (
              <p className="mt-4 pt-4 border-t border-skyblue/50 text-sm text-deepblue/60">
                <strong className="text-deepblue/80">Reason for visit:</strong> {appointment.reason}
              </p>
            )}

            {cancelError && (
              <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{cancelError}</p>
            )}

            {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
              <div className="mt-6 pt-6 border-t border-skyblue/50">
                {!confirmingCancel ? (
                  <button
                    onClick={() => setConfirmingCancel(true)}
                    className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    <FaTimesCircle /> Cancel this appointment
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-wrap items-center gap-3"
                  >
                    <span className="text-sm text-deepblue/70">Are you sure?</span>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="bg-red-500 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-60"
                    >
                      {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </button>
                    <button
                      onClick={() => setConfirmingCancel(false)}
                      className="text-sm font-medium text-deepblue/60 hover:text-deepblue transition-colors"
                    >
                      Keep Appointment
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mt-10">
        <Link to="/book" className="text-sm text-teal font-medium hover:underline">
          Need to book a new appointment instead?
        </Link>
      </div>
    </div>
  );
}
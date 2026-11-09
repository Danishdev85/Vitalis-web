import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheckCircle, FaArrowLeft, FaArrowRight, FaCopy, FaUserMd, FaStethoscope,
} from 'react-icons/fa';

import SectionReveal from '../components/SectionReveal.jsx';
import BookingCalendar from '../components/BookingCalendar.jsx';
import TimeSlotPicker from '../components/TimeSlotPicker.jsx';
import NeomorphicInput from '../components/NeomorphicInput.jsx';
import NeomorphicCard from '../components/NeomorphicCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  getDepartments, getDoctors, getDoctorAvailability, createAppointment,
} from '../api/api.js';

const STEPS = ['Doctor', 'Date & Time', 'Your Details', 'Confirmed'];

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const preselectedDoctor = searchParams.get('doctor');

  const [step, setStep] = useState(0);

  // Step 1 data
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeDept, setActiveDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Step 2 data
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 3 data
  const [form, setForm] = useState({ name: '', phone: '', email: '', reason: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Result
  const [confirmation, setConfirmation] = useState(null);

  // Load departments + doctors on mount
  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingDoctors(true);
    getDoctors(activeDept || undefined)
      .then((data) => {
        setDoctors(data);
        if (preselectedDoctor && !selectedDoctor) {
          const match = data.find((d) => String(d.id) === preselectedDoctor);
          if (match) setSelectedDoctor(match);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingDoctors(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDept]);

  // Load availability when doctor + date chosen
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    getDoctorAvailability(selectedDoctor.id, toDateKey(selectedDate))
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctor, selectedDate]);

  const canGoStep2 = !!selectedDoctor;
  const canGoStep3 = !!selectedDoctor && !!selectedDate && !!selectedSlot;

  function validateForm() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!/^[0-9+\-\s]{7,20}$/.test(form.phone.trim())) errs.phone = 'Enter a valid phone number';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      errs.email = 'A valid email is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await createAppointment({
        doctor_id: selectedDoctor.id,
        appointment_date: toDateKey(selectedDate),
        time_slot: selectedSlot,
        patient_name: form.name.trim(),
        patient_phone: form.phone.trim(),
        patient_email: form.email.trim(),
        reason: form.reason.trim() || null,
      });
      setConfirmation(result);
      setStep(3);
    } catch (err) {
      setSubmitError(
        err.response?.data?.error || 'Something went wrong. That slot may have just been taken — please pick another.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function copyCode() {
    if (confirmation?.confirmation_code) {
      navigator.clipboard.writeText(confirmation.confirmation_code);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
      <SectionReveal className="text-center mb-10">
        <span className="inline-block bg-mint/60 text-deepblue text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
          Book Appointment
        </span>
        <h1 className="font-display text-3xl lg:text-4xl font-semibold text-deepblue">
          Let's Get You Seen
        </h1>
      </SectionReveal>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-12">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300
                  ${
                    i < step
                      ? 'bg-teal text-white'
                      : i === step
                      ? 'bg-teal text-white shadow-glow-teal'
                      : 'bg-skyblue text-deepblue/40'
                  }`}
              >
                {i < step ? <FaCheckCircle className="text-sm" /> : i + 1}
              </div>
              <span className={`text-[11px] font-medium hidden sm:block ${i <= step ? 'text-deepblue' : 'text-deepblue/35'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 sm:w-16 h-[2px] mx-1 sm:mx-2 transition-colors duration-300 ${i < step ? 'bg-teal' : 'bg-skyblue'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 0 — Choose doctor */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-wrap gap-2.5 justify-center mb-8">
              <button
                onClick={() => setActiveDept('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !activeDept ? 'bg-teal text-white shadow-glow-teal' : 'bg-offwhite text-deepblue/70 shadow-neo-sm hover:shadow-neo'
                }`}
              >
                All
              </button>
              {departments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveDept(String(d.id))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeDept === String(d.id) ? 'bg-teal text-white shadow-glow-teal' : 'bg-offwhite text-deepblue/70 shadow-neo-sm hover:shadow-neo'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {loadingDoctors ? (
              <LoadingSpinner fullPage />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {doctors.map((doc) => {
                  const isSelected = selectedDoctor?.id === doc.id;
                  return (
                    <motion.button
                      key={doc.id}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`text-left rounded-2xl p-5 border transition-all duration-200 flex gap-4 items-start
                        ${isSelected ? 'border-teal bg-teal/5 shadow-glow-teal' : 'border-skyblue/60 bg-white hover:border-teal/30'}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal shrink-0">
                        <FaUserMd />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-deepblue">{doc.name}</p>
                        <p className="text-sm text-teal font-medium mb-1">{doc.specialty}</p>
                        <p className="text-xs text-deepblue/50 flex items-center gap-1">
                          <FaStethoscope className="text-[10px]" /> Rs. {Number(doc.consultation_fee).toLocaleString()} / visit
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end mt-10">
              <motion.button
                whileHover={{ scale: canGoStep2 ? 1.03 : 1 }}
                whileTap={{ scale: canGoStep2 ? 0.97 : 1 }}
                disabled={!canGoStep2}
                onClick={() => setStep(1)}
                className={`flex items-center gap-2 px-7 py-3 rounded-full font-medium transition-all ${
                  canGoStep2 ? 'bg-teal text-white shadow-md hover:shadow-glow-teal' : 'bg-skyblue text-deepblue/30 cursor-not-allowed'
                }`}
              >
                Continue <FaArrowRight className="text-sm" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 1 — Date & time */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 gap-8"
          >
            <BookingCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              disabledWeekdays={[0]}
              maxDaysAhead={60}
            />

            <div>
              <h3 className="font-display font-semibold text-deepblue mb-4">
                {selectedDate ? `Available on ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}` : 'Pick a date to see open slots'}
              </h3>
              {selectedDate && (
                <TimeSlotPicker
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  loading={loadingSlots}
                />
              )}
            </div>

            <div className="md:col-span-2 flex justify-between mt-4">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-deepblue/70 hover:text-teal transition-colors"
              >
                <FaArrowLeft className="text-sm" /> Back
              </button>
              <motion.button
                whileHover={{ scale: canGoStep3 ? 1.03 : 1 }}
                whileTap={{ scale: canGoStep3 ? 0.97 : 1 }}
                disabled={!canGoStep3}
                onClick={() => setStep(2)}
                className={`flex items-center gap-2 px-7 py-3 rounded-full font-medium transition-all ${
                  canGoStep3 ? 'bg-teal text-white shadow-md hover:shadow-glow-teal' : 'bg-skyblue text-deepblue/30 cursor-not-allowed'
                }`}
              >
                Continue <FaArrowRight className="text-sm" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* STEP 2 — Patient details (neomorphic form) */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <NeomorphicCard>
              {/* Summary */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-7 pb-6 border-b border-deepblue/10 text-sm text-deepblue/70">
                <span><strong className="text-deepblue">{selectedDoctor.name}</strong> · {selectedDoctor.specialty}</span>
                <span>{selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span>{selectedSlot}</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <NeomorphicInput
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                  placeholder="e.g. Ayesha Tariq"
                />
                <div className="grid sm:grid-cols-2 gap-5">
                  <NeomorphicInput
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    error={errors.phone}
                    placeholder="+92 3XX XXXXXXX"
                  />
                  <NeomorphicInput
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    error={errors.email}
                    placeholder="you@email.com"
                  />
                </div>
                <NeomorphicInput
                  as="textarea"
                  rows={4}
                  label="Reason for Visit (optional)"
                  name="reason"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Briefly describe your concern..."
                />

                {submitError && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{submitError}</p>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-deepblue/70 hover:text-teal transition-colors"
                  >
                    <FaArrowLeft className="text-sm" /> Back
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 bg-teal text-white px-7 py-3 rounded-full font-medium shadow-md hover:shadow-glow-teal transition-all disabled:opacity-60"
                  >
                    {submitting ? 'Confirming...' : 'Confirm Booking'} <FaArrowRight className="text-sm" />
                  </motion.button>
                </div>
              </form>
            </NeomorphicCard>
          </motion.div>
        )}

        {/* STEP 3 — Confirmation */}
        {step === 3 && confirmation && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-mint/60 text-teal flex items-center justify-center text-4xl mx-auto mb-6"
            >
              <FaCheckCircle />
            </motion.div>

            <h2 className="font-display text-2xl lg:text-3xl font-semibold text-deepblue mb-2">
              You're All Set!
            </h2>
            <p className="text-deepblue/60 mb-8">
              A confirmation has been recorded for {selectedDoctor.name} on{' '}
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedSlot}.
            </p>

            <NeomorphicCard className="max-w-sm mx-auto mb-8" animate={false}>
              <p className="text-xs uppercase tracking-wide text-deepblue/50 mb-2">Confirmation Code</p>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl font-semibold text-teal tracking-wider">
                  {confirmation.confirmation_code}
                </span>
                <button onClick={copyCode} className="text-deepblue/40 hover:text-teal transition-colors" aria-label="Copy code">
                  <FaCopy />
                </button>
              </div>
              <p className="text-xs text-deepblue/45 mt-3">
                Save this code — you'll need it with your phone/email to look up or cancel your appointment.
              </p>
            </NeomorphicCard>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/">
                <button className="px-6 py-3 rounded-full font-medium text-deepblue/70 border border-skyblue hover:border-teal/40 transition-colors">
                  Back to Home
                </button>
              </Link>
              <Link to="/lookup">
                <button className="bg-teal text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-glow-teal transition-all">
                  View My Appointment
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
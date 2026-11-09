import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSignOutAlt, FaCalendarCheck, FaUserMd, FaCheck, FaTimes, FaHourglassHalf,
  FaCheckDouble, FaFilter, FaHeartbeat, FaPlus, FaEdit, FaTrash,
  FaEnvelope, FaEnvelopeOpenText, FaUser,
} from 'react-icons/fa';

import LoadingSpinner from '../components/LoadingSpinner.jsx';
import NeomorphicInput from '../components/NeomorphicInput.jsx';
import {
  getAdminAppointments, updateAppointmentStatus,
  getAdminDoctors, createDoctor, updateDoctor, deleteDoctor,
  getDepartments, getContactMessages, markMessageRead, deleteContactMessage,
  getDoctorScheduleList, addDoctorSchedule, updateDoctorSchedule, deleteDoctorSchedule,
} from '../api/api.js';

const statusConfig = {
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50' },
  confirmed: { label: 'Confirmed', color: 'text-teal', bg: 'bg-mint/40' },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bg: 'bg-red-50' },
  completed: { label: 'Completed', color: 'text-deepblue/60', bg: 'bg-skyblue/40' },
};

const emptyDoctorForm = {
  name: '', specialty: '', department_id: '', bio: '', years_experience: '', consultation_fee: '',
};

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function createEmptySchedule() {
  return WEEK_DAYS.map((day) => ({ day, blocks: [] }));
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('vitalis_admin_name') || 'Admin';

  const [tab, setTab] = useState('appointments'); // 'appointments' | 'doctors' | 'messages'

  // ---------------- Appointments ----------------
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadAppointments = useCallback(() => {
    setLoadingAppts(true);
    getAdminAppointments(statusFilter ? { status: statusFilter } : {})
      .then(setAppointments)
      .catch((err) => {
        if (err.response?.status === 401) navigate('/admin/login');
      })
      .finally(() => setLoadingAppts(false));
  }, [statusFilter, navigate]);

  useEffect(() => {
    if (!localStorage.getItem('vitalis_admin_token')) {
      navigate('/admin/login');
      return;
    }
    loadAppointments();
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadAppointments, navigate]);

  async function handleStatusChange(id, status) {
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  }

  // ---------------- Doctors ----------------
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState(emptyDoctorForm);
  const [doctorSchedule, setDoctorSchedule] = useState(createEmptySchedule);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [savingDoctor, setSavingDoctor] = useState(false);
  const [doctorFormError, setDoctorFormError] = useState('');

  function loadDoctors() {
    setLoadingDoctors(true);
    Promise.all([getAdminDoctors(), getDepartments()])
      .then(([docs, depts]) => {
        setDoctors(docs);
        setDepartments(depts);
      })
      .catch(() => {})
      .finally(() => setLoadingDoctors(false));
  }

  useEffect(() => {
    if (tab === 'doctors' && doctors.length === 0) loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // ---------------- Messages ----------------
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [readingId, setReadingId] = useState(null);

  const loadMessages = useCallback(() => {
    setLoadingMessages(true);
    getContactMessages(unreadOnly)
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoadingMessages(false));
  }, [unreadOnly]);

  useEffect(() => {
    if (tab === 'messages') loadMessages();
  }, [tab, loadMessages]);

  async function handleMarkRead(id) {
    setReadingId(id);
    try {
      await markMessageRead(id);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
    } catch (err) {
      alert('Failed to mark as read.');
    } finally {
      setReadingId(null);
    }
  }

  async function handleDeleteMessage(id) {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert('Failed to delete message.');
    }
  }

  function openNewDoctorForm() {
    setEditingDoctor(null);
    setDoctorForm(emptyDoctorForm);
    setDoctorSchedule(createEmptySchedule());
    setDoctorFormError('');
    setShowDoctorForm(true);
  }

  async function openEditDoctorForm(doc) {
    setEditingDoctor(doc);
    setDoctorForm({
      name: doc.name,
      specialty: doc.specialty,
      department_id: String(doc.department_id),
      bio: doc.bio || '',
      years_experience: doc.years_experience || '',
      consultation_fee: doc.consultation_fee || '',
    });
    setDoctorFormError('');
    setLoadingSchedule(true);
    try {
      const schedules = await getDoctorScheduleList(doc.id);
      setDoctorSchedule(() => {
        const next = createEmptySchedule();
        for (const schedule of schedules) {
          if (!schedule.is_active) continue;
          const day = next.find((entry) => entry.day === schedule.day_of_week);
          if (day) {
            day.blocks.push({
              id: schedule.id,
              start_time: schedule.start_time.slice(0, 5),
              end_time: schedule.end_time.slice(0, 5),
            });
          }
        }
        return next;
      });
      setShowDoctorForm(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not load this doctor’s working hours.');
      setEditingDoctor(null);
    } finally {
      setLoadingSchedule(false);
    }
  }

  function updateScheduleDay(dayName, update) {
    setDoctorSchedule((current) =>
      current.map((day) => (day.day === dayName ? update(day) : day))
    );
  }

  function updateScheduleBlock(dayName, blockIndex, field, value) {
    updateScheduleDay(dayName, (day) => ({
      ...day,
      blocks: day.blocks.map((block, index) =>
        index === blockIndex ? { ...block, [field]: value } : block
      ),
    }));
  }

  function setScheduleDayEnabled(dayName, enabled) {
    updateScheduleDay(dayName, (day) => ({
      ...day,
      blocks: enabled
        ? [{ start_time: '', end_time: '' }]
        : [],
    }));
  }

  async function saveDoctorSchedule(doctorId) {
    const savedSchedules = await getDoctorScheduleList(doctorId);
    const savedById = new Map(savedSchedules.map((schedule) => [schedule.id, schedule]));
    const scheduleBlocks = doctorSchedule.flatMap(({ day, blocks }) =>
      blocks.map((block, blockIndex) => ({ ...block, day, blockIndex }))
    );
    const retainedIds = new Set(scheduleBlocks.filter((block) => block.id).map((block) => block.id));

    for (const block of scheduleBlocks) {
      if (block.id && savedById.has(block.id)) {
        await updateDoctorSchedule(block.id, {
          day_of_week: block.day,
          start_time: block.start_time,
          end_time: block.end_time,
          is_active: true,
        });
      } else {
        const result = await addDoctorSchedule(doctorId, {
          day_of_week: block.day,
          start_time: block.start_time,
          end_time: block.end_time,
        });
        const newId = result.availabilityId;
        setDoctorSchedule((current) =>
          current.map((day) =>
            day.day === block.day
              ? {
                  ...day,
                  blocks: day.blocks.map((entry, index) =>
                    index === block.blockIndex ? { ...entry, id: newId } : entry
                  ),
                }
              : day
          )
        );
      }
    }

    for (const schedule of savedSchedules) {
      if (schedule.is_active && !retainedIds.has(schedule.id)) {
        await deleteDoctorSchedule(schedule.id);
      }
    }
  }

  async function handleDoctorSubmit(e) {
    e.preventDefault();
    setDoctorFormError('');
    const scheduleBlocks = doctorSchedule.flatMap(({ day, blocks }) =>
      blocks.map((block) => ({ ...block, day }))
    );
    if (scheduleBlocks.length === 0) {
      setDoctorFormError('Add at least one working day and time to make this doctor available for bookings.');
      return;
    }
    const invalidSchedule = scheduleBlocks.find(
      ({ start_time, end_time }) => !start_time || !end_time || start_time >= end_time
    );
    if (invalidSchedule) {
      setDoctorFormError(`Check the start and end times for ${invalidSchedule.day}.`);
      return;
    }
    const overlappingDay = doctorSchedule.find(({ blocks }) =>
      blocks.some((block, index) =>
        blocks.some((other, otherIndex) =>
          otherIndex > index &&
          block.start_time < other.end_time &&
          other.start_time < block.end_time
        )
      )
    );
    if (overlappingDay) {
      setDoctorFormError(`Working periods for ${overlappingDay.day} cannot overlap.`);
      return;
    }

    setSavingDoctor(true);
    try {
      let doctorId;
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, doctorForm);
        doctorId = editingDoctor.id;
      } else {
        const result = await createDoctor(doctorForm);
        doctorId = result.doctorId;
        setEditingDoctor({ id: doctorId });
      }
      await saveDoctorSchedule(doctorId);
      setShowDoctorForm(false);
      loadDoctors();
    } catch (error) {
      setDoctorFormError(
        error.response?.data?.message ||
        (editingDoctor
          ? 'The doctor could not be saved with these working hours. Please try again.'
          : 'The doctor profile was saved, but the working hours could not be saved. Please try again.')
      );
    } finally {
      setSavingDoctor(false);
    }
  }

  async function handleDeleteDoctor(id) {
    if (!confirm('Remove this doctor? This cannot be undone.')) return;
    try {
      await deleteDoctor(id);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert('Failed to delete doctor.');
    }
  }

  function handleLogout() {
    localStorage.removeItem('vitalis_admin_token');
    localStorage.removeItem('vitalis_admin_name');
    navigate('/admin/login');
  }

  const filterOptions = ['', 'pending', 'confirmed', 'completed', 'cancelled'];

  return (
    <div className="min-h-[80vh] bg-offwhite">
      {/* Top bar */}
      <div className="bg-white border-b border-skyblue/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center text-lg">
              <FaHeartbeat />
            </span>
            <div>
              <p className="font-display font-semibold text-deepblue leading-tight">Vitalis Admin</p>
              <p className="text-xs text-deepblue/50">Welcome, {adminName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-deepblue/60 hover:text-red-500 transition-colors"
          >
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab('appointments')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              tab === 'appointments' ? 'bg-teal text-white shadow-glow-teal' : 'bg-white text-deepblue/60 shadow-neo-sm hover:shadow-neo'
            }`}
          >
            <FaCalendarCheck /> Appointments
          </button>
          <button
            onClick={() => setTab('doctors')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              tab === 'doctors' ? 'bg-teal text-white shadow-glow-teal' : 'bg-white text-deepblue/60 shadow-neo-sm hover:shadow-neo'
            }`}
          >
            <FaUserMd /> Doctors
          </button>
          <button
            onClick={() => setTab('messages')}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              tab === 'messages' ? 'bg-teal text-white shadow-glow-teal' : 'bg-white text-deepblue/60 shadow-neo-sm hover:shadow-neo'
            }`}
          >
            <FaEnvelope /> Messages
            {messages.some((m) => !m.is_read) && tab !== 'messages' && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
            )}
          </button>
        </div>

        {/* ---------------- APPOINTMENTS TAB ---------------- */}
        {tab === 'appointments' && (
          <div>
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <FaFilter className="text-deepblue/40 text-sm" />
              {filterOptions.map((opt) => (
                <button
                  key={opt || 'all'}
                  onClick={() => setStatusFilter(opt)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                    statusFilter === opt ? 'bg-deepblue text-white' : 'bg-white text-deepblue/55 border border-skyblue/60 hover:border-teal/40'
                  }`}
                >
                  {opt || 'All'}
                </button>
              ))}
            </div>

            {loadingAppts ? (
              <LoadingSpinner fullPage />
            ) : appointments.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-skyblue/50">
                <p className="text-deepblue/50 font-medium">No appointments found.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-skyblue/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-offwhite text-left text-xs uppercase tracking-wide text-deepblue/50">
                        <th className="px-5 py-3.5 font-semibold">Patient</th>
                        <th className="px-5 py-3.5 font-semibold">Doctor</th>
                        <th className="px-5 py-3.5 font-semibold">Date & Time</th>
                        <th className="px-5 py-3.5 font-semibold">Code</th>
                        <th className="px-5 py-3.5 font-semibold">Status</th>
                        <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {appointments.map((appt) => {
                          const cfg = statusConfig[appt.status];
                          return (
                            <motion.tr
                              key={appt.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="border-t border-skyblue/40 hover:bg-offwhite/60 transition-colors"
                            >
                              <td className="px-5 py-4">
                                <p className="font-medium text-deepblue">{appt.patient_name}</p>
                                <p className="text-xs text-deepblue/50">{appt.patient_phone}</p>
                              </td>
                              <td className="px-5 py-4 text-deepblue/75">{appt.doctor_name}</td>
                              <td className="px-5 py-4 text-deepblue/75">
                                {new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {' · '}{appt.time_slot?.slice(0, 5)}
                              </td>
                              <td className="px-5 py-4 font-mono text-xs text-deepblue/60">{appt.confirmation_code}</td>
                              <td className="px-5 py-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-1.5">
                                  {appt.status === 'pending' && (
                                    <button
                                      disabled={updatingId === appt.id}
                                      onClick={() => handleStatusChange(appt.id, 'confirmed')}
                                      title="Confirm"
                                      className="w-8 h-8 rounded-lg bg-mint/40 text-teal flex items-center justify-center hover:bg-mint/70 transition-colors disabled:opacity-50"
                                    >
                                      <FaCheck className="text-xs" />
                                    </button>
                                  )}
                                  {appt.status === 'confirmed' && (
                                    <button
                                      disabled={updatingId === appt.id}
                                      onClick={() => handleStatusChange(appt.id, 'completed')}
                                      title="Mark completed"
                                      className="w-8 h-8 rounded-lg bg-skyblue/60 text-deepblue flex items-center justify-center hover:bg-skyblue transition-colors disabled:opacity-50"
                                    >
                                      <FaCheckDouble className="text-xs" />
                                    </button>
                                  )}
                                  {(appt.status === 'pending' || appt.status === 'confirmed') && (
                                    <button
                                      disabled={updatingId === appt.id}
                                      onClick={() => handleStatusChange(appt.id, 'cancelled')}
                                      title="Cancel"
                                      className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                      <FaTimes className="text-xs" />
                                    </button>
                                  )}
                                  {updatingId === appt.id && (
                                    <span className="w-8 h-8 flex items-center justify-center">
                                      <FaHourglassHalf className="text-xs text-deepblue/30 animate-pulse" />
                                    </span>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------- DOCTORS TAB ---------------- */}
        {tab === 'doctors' && (
          <div>
            <div className="flex justify-end mb-6">
              <button
                onClick={openNewDoctorForm}
                disabled={loadingSchedule}
                className="flex items-center gap-2 bg-teal text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-md hover:shadow-glow-teal transition-all disabled:opacity-50"
              >
                <FaPlus className="text-xs" /> Add Doctor
              </button>
            </div>

            {loadingDoctors ? (
              <LoadingSpinner fullPage />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {doctors.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-2xl border border-skyblue/50 p-5">
                    <p className="font-display font-semibold text-deepblue">{doc.name}</p>
                    <p className="text-sm text-teal font-medium mb-3">{doc.specialty}</p>
                    <p className="text-xs text-deepblue/50 mb-4">
                      Rs. {Number(doc.consultation_fee).toLocaleString()} / visit · {doc.years_experience}+ yrs
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={loadingSchedule}
                        onClick={() => openEditDoctorForm(doc)}
                        className="flex items-center gap-1.5 text-xs font-medium text-deepblue/60 hover:text-teal px-3 py-1.5 rounded-lg border border-skyblue/60 hover:border-teal/40 transition-colors disabled:opacity-50"
                      >
                        <FaEdit className="text-[10px]" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-red-100 hover:border-red-300 transition-colors"
                      >
                        <FaTrash className="text-[10px]" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

{/* ---------------- MESSAGES TAB ---------------- */}
        {tab === 'messages' && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <FaFilter className="text-deepblue/40 text-sm" />
              <button
                onClick={() => setUnreadOnly(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  !unreadOnly ? 'bg-deepblue text-white' : 'bg-white text-deepblue/55 border border-skyblue/60 hover:border-teal/40'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setUnreadOnly(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  unreadOnly ? 'bg-deepblue text-white' : 'bg-white text-deepblue/55 border border-skyblue/60 hover:border-teal/40'
                }`}
              >
                Unread Only
              </button>
            </div>

            {loadingMessages ? (
              <LoadingSpinner fullPage />
            ) : messages.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-skyblue/50">
                <FaEnvelopeOpenText className="text-3xl text-deepblue/20 mx-auto mb-3" />
                <p className="text-deepblue/50 font-medium">No messages found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`bg-white rounded-2xl border p-5 transition-colors ${
                        msg.is_read ? 'border-skyblue/50' : 'border-teal/40 bg-teal/[0.03]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-skyblue/50 flex items-center justify-center text-deepblue/60 shrink-0">
                            <FaUser className="text-xs" />
                          </div>
                          <div>
                            <p className="font-medium text-deepblue text-sm">{msg.name}</p>
                            <p className="text-xs text-deepblue/50">{msg.email}</p>
                          </div>
                        </div>
                        {!msg.is_read && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide bg-teal/10 text-teal px-2.5 py-1 rounded-full shrink-0">
                            New
                          </span>
                        )}
                      </div>

                      {msg.subject && (
                        <p className="text-sm font-medium text-deepblue/80 mb-1">{msg.subject}</p>
                      )}
                      <p className="text-sm text-deepblue/65 leading-relaxed mb-4">{msg.message}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-deepblue/40">
                          {new Date(msg.created_at).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                          })}
                        </span>
                        <div className="flex gap-2">
                          {!msg.is_read && (
                            <button
                              disabled={readingId === msg.id}
                              onClick={() => handleMarkRead(msg.id)}
                              className="flex items-center gap-1.5 text-xs font-medium text-teal hover:text-teal/80 px-3 py-1.5 rounded-lg border border-teal/30 hover:border-teal/50 transition-colors disabled:opacity-50"
                            >
                              <FaCheck className="text-[10px]" /> Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-red-100 hover:border-red-300 transition-colors"
                          >
                            <FaTrash className="text-[10px]" /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      {/* Doctor add/edit modal */}
      <AnimatePresence>
        {showDoctorForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-deepblue/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => !savingDoctor && setShowDoctorForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-7 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="font-display text-xl font-semibold text-deepblue mb-5">
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </h3>
              <form onSubmit={handleDoctorSubmit} className="space-y-4">
                <NeomorphicInput
                  label="Full Name"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  required
                />
                <NeomorphicInput
                  label="Specialty"
                  value={doctorForm.specialty}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                  required
                />
                <NeomorphicInput
                  as="select"
                  label="Department"
                  value={doctorForm.department_id}
                  onChange={(e) => setDoctorForm({ ...doctorForm, department_id: e.target.value })}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </NeomorphicInput>
                <div className="grid grid-cols-2 gap-4">
                  <NeomorphicInput
                    label="Years Experience"
                    type="number"
                    value={doctorForm.years_experience}
                    onChange={(e) => setDoctorForm({ ...doctorForm, years_experience: e.target.value })}
                  />
                  <NeomorphicInput
                    label="Fee (Rs.)"
                    type="number"
                    value={doctorForm.consultation_fee}
                    onChange={(e) => setDoctorForm({ ...doctorForm, consultation_fee: e.target.value })}
                  />
                </div>
                <NeomorphicInput
                  as="textarea"
                  rows={3}
                  label="Bio"
                  value={doctorForm.bio}
                  onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                />

                <section className="rounded-2xl bg-offwhite p-5">
                  <div className="mb-4">
                    <h4 className="font-display font-semibold text-deepblue">Weekly Working Hours</h4>
                    <p className="text-xs text-deepblue/50 mt-1">
                      Choose the days and hours patients can book. Each period is divided into 30-minute slots.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {doctorSchedule.map(({ day, blocks }) => (
                      <div key={day} className="rounded-xl border border-skyblue/60 bg-white p-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-deepblue">{day}</span>
                          <button
                            type="button"
                            disabled={savingDoctor}
                            onClick={() => setScheduleDayEnabled(day, blocks.length === 0)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                              blocks.length
                                ? 'bg-mint/50 text-teal'
                                : 'bg-skyblue/50 text-deepblue/60 hover:bg-teal/10 hover:text-teal'
                            }`}
                          >
                            {blocks.length ? 'Working' : 'Add hours'}
                          </button>
                        </div>

                        {blocks.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {blocks.map((block, index) => (
                              <div key={block.id || `${day}-${index}`} className="flex items-end gap-3">
                                <label className="flex-1 min-w-0">
                                  <span className="block text-xs text-deepblue/55 mb-1">
                                    {blocks.length > 1 ? `Period ${index + 1} starts` : 'Starts'}
                                  </span>
                                  <input
                                    type="time"
                                    required
                                    disabled={savingDoctor}
                                    value={block.start_time}
                                    onChange={(e) => updateScheduleBlock(day, index, 'start_time', e.target.value)}
                                    className="neo-input w-full text-sm"
                                  />
                                </label>
                                <label className="flex-1 min-w-0">
                                  <span className="block text-xs text-deepblue/55 mb-1">Ends</span>
                                  <input
                                    type="time"
                                    required
                                    disabled={savingDoctor}
                                    value={block.end_time}
                                    onChange={(e) => updateScheduleBlock(day, index, 'end_time', e.target.value)}
                                    className="neo-input w-full text-sm"
                                  />
                                </label>
                                <button
                                  type="button"
                                  disabled={savingDoctor}
                                  onClick={() =>
                                    updateScheduleDay(day, (entry) => ({
                                      ...entry,
                                      blocks: entry.blocks.filter((_, blockIndex) => blockIndex !== index),
                                    }))
                                  }
                                  aria-label={`Remove ${day} working period ${index + 1}`}
                                  className="w-10 h-10 shrink-0 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                  <FaTrash className="text-xs" />
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              disabled={savingDoctor}
                              onClick={() =>
                                updateScheduleDay(day, (entry) => ({
                                  ...entry,
                                  blocks: [...entry.blocks, { start_time: '', end_time: '' }],
                                }))
                              }
                              className="text-xs font-medium text-teal hover:text-teal/80 disabled:opacity-50"
                            >
                              + Add another period
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {doctorFormError && (
                  <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
                    {doctorFormError}
                  </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={savingDoctor}
                    onClick={() => setShowDoctorForm(false)}
                    className="px-5 py-2.5 rounded-full text-sm font-medium text-deepblue/60 hover:text-deepblue transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingDoctor}
                    className="bg-teal text-white text-sm font-medium px-6 py-2.5 rounded-full shadow-md hover:shadow-glow-teal transition-all disabled:opacity-60"
                  >
                    {savingDoctor ? 'Saving...' : editingDoctor ? 'Save Changes' : 'Add Doctor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
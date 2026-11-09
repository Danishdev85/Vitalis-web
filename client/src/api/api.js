import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach admin token automatically for admin-protected calls
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vitalis_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -----------------------------
// Departments
// -----------------------------

export const getDepartments = () =>
  api.get('/departments').then((res) => res.data.departments);

export const createDepartment = (payload) =>
  api.post('/departments', payload).then((res) => res.data);

export const updateDepartment = (id, payload) =>
  api.put(`/departments/${id}`, payload).then((res) => res.data);

export const deleteDepartment = (id) =>
  api.delete(`/departments/${id}`).then((res) => res.data);

// -----------------------------
// Doctors
// -----------------------------

export const getDoctors = (departmentId) =>
  api
    .get('/doctors', { params: departmentId ? { department: departmentId } : {} })
    .then((res) => res.data.doctors);

export const getAdminDoctors = () =>
  api.get('/doctors').then((res) => res.data.doctors);

export const getDoctorById = (id) =>
  api.get(`/doctors/${id}`).then((res) => res.data.doctor);

export const getDoctorAvailability = (doctorId, date) =>
  api
    .get(`/doctors/${doctorId}/availability`, { params: { date } })
    .then((res) => res.data); // { success, date, day, slots: [{time, label}] }

export const createDoctor = (payload) =>
  api.post('/doctors', payload).then((res) => res.data);

export const updateDoctor = (id, payload) =>
  api.put(`/doctors/${id}`, payload).then((res) => res.data);

export const deleteDoctor = (id) =>
  api.delete(`/doctors/${id}`).then((res) => res.data);

// -----------------------------
// Doctor Weekly Availability (admin schedule management)
// -----------------------------

export const getDoctorScheduleList = (doctorId) =>
  api.get(`/availability/doctor/${doctorId}`).then((res) => res.data.availability);

export const addDoctorSchedule = (doctorId, payload) =>
  api.post(`/availability/doctor/${doctorId}`, payload).then((res) => res.data);

export const updateDoctorSchedule = (id, payload) =>
  api.put(`/availability/${id}`, payload).then((res) => res.data);

export const deleteDoctorSchedule = (id) =>
  api.delete(`/availability/${id}`).then((res) => res.data);

// -----------------------------
// Appointments (guest)
// -----------------------------

export const createAppointment = (payload) =>
  api.post('/appointments', payload).then((res) => res.data.appointment);

export const lookupAppointment = ({ confirmationCode, contact }) =>
  api
    .get('/appointments/lookup', { params: { code: confirmationCode, contact } })
    .then((res) => res.data.appointment);

export const cancelAppointment = ({ confirmationCode, contact }) =>
  api
    .put('/appointments/cancel', { code: confirmationCode, contact })
    .then((res) => res.data.appointment);

// -----------------------------
// Appointments (admin)
// -----------------------------

export const getAdminAppointments = (params = {}) =>
  api.get('/appointments', { params }).then((res) => res.data.appointments);

export const updateAppointmentStatus = (id, status) =>
  api.put(`/appointments/${id}`, { status }).then((res) => res.data);

// -----------------------------
// Admin auth
// -----------------------------

export const adminLogin = (email, password) =>
  api.post('/admin/login', { email, password }).then((res) => res.data);

// -----------------------------
// Contact
// -----------------------------

export const submitContactMessage = (payload) =>
  api.post('/contact', payload).then((res) => res.data);

export const getContactMessages = (unreadOnly = false) =>
  api
    .get('/contact', { params: unreadOnly ? { unread_only: 'true' } : {} })
    .then((res) => res.data.messages);

export const markMessageRead = (id) =>
  api.put(`/contact/${id}/read`).then((res) => res.data);

export const deleteContactMessage = (id) =>
  api.delete(`/contact/${id}`).then((res) => res.data);

// -----------------------------
// Dashboard stats
// -----------------------------

export const getDashboardStats = () =>
  api.get('/stats').then((res) => res.data.stats);

export default api;
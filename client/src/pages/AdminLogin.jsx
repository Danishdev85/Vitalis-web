import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaEnvelope, FaHeartbeat, FaArrowRight } from 'react-icons/fa';

import NeomorphicInput from '../components/NeomorphicInput.jsx';
import NeomorphicCard from '../components/NeomorphicCard.jsx';
import { adminLogin } from '../api/api.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  function validate() {
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setLoginError('');
    try {
      const result = await adminLogin(form.email.trim(), form.password);
      localStorage.setItem('vitalis_admin_token', result.token);
      localStorage.setItem('vitalis_admin_name', result.admin?.name || 'Admin');
      navigate('/admin/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16 bg-offwhite">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="inline-flex w-14 h-14 rounded-2xl bg-teal/10 text-teal items-center justify-center text-2xl mb-4"
          >
            <FaHeartbeat />
          </motion.span>
          <h1 className="font-display text-2xl font-semibold text-deepblue mb-1">
            Staff Login
          </h1>
          <p className="text-sm text-deepblue/55">
            Sign in to manage appointments, doctors, and schedules.
          </p>
        </div>

        <NeomorphicCard animate={false}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <NeomorphicInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              placeholder="admin@vitalis.clinic"
            />
            <NeomorphicInput
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              placeholder="••••••••"
            />

            {loginError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{loginError}</p>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-teal text-white font-medium py-3.5 rounded-xl shadow-md hover:shadow-glow-teal transition-all disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : <>Sign In <FaArrowRight className="text-sm" /></>}
            </motion.button>
          </form>
        </NeomorphicCard>

        <p className="text-center text-sm text-deepblue/50 mt-6">
          <Link to="/" className="hover:text-teal transition-colors">
            ← Back to clinic site
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
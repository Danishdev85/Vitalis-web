import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaPaperPlane, FaCheckCircle,
} from 'react-icons/fa';

import SectionReveal from '../components/SectionReveal.jsx';
import { submitContactMessage } from '../api/api.js';
import NeomorphicInput from '../components/NeomorphicInput.jsx';
import NeomorphicCard from '../components/NeomorphicCard.jsx';

const infoItems = [
  { icon: FaMapMarkerAlt, title: 'Location', text: '123 Wellness Road, Multan, Punjab, Pakistan' },
  { icon: FaPhoneAlt, title: 'Phone', text: '+92 300 1234567' },
  { icon: FaEnvelope, title: 'Email', text: 'hello@vitalisclinic.com' },
  { icon: FaClock, title: 'Hours', text: 'Mon–Fri: 9am–5pm · Sat: 9am–1pm' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid email';
    if (!form.message.trim()) errs.message = 'Please write a message';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await submitContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || null,
        message: form.message.trim(),
      });
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || 'Something went wrong sending your message. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-offwhite py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <SectionReveal>
            <span className="inline-block bg-mint/60 text-deepblue text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              Contact Us
            </span>
            <h1 className="font-display text-4xl lg:text-5xl font-semibold text-deepblue mb-4">
              We're Here to Help
            </h1>
            <p className="text-deepblue/60 text-base lg:text-lg leading-relaxed">
              Questions about a service, a billing concern, or just want to
              say hello? Reach out — our team responds within one business day.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Info panel — neomorphic, inset for contrast against the form */}
          <SectionReveal direction="left" className="lg:col-span-2">
            <NeomorphicCard inset animate={false} className="h-full">
              <h3 className="font-display text-xl font-semibold text-deepblue mb-6">
                Get in Touch
              </h3>
              <div className="space-y-6">
                {infoItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white shadow-neo-sm flex items-center justify-center text-teal shrink-0">
                        <Icon className="text-sm" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-deepblue/45 mb-0.5">
                          {item.title}
                        </p>
                        <p className="text-sm text-deepblue/75 leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mini map placeholder */}
              <div className="mt-8 rounded-2xl overflow-hidden shadow-neo-sm h-40 bg-gradient-to-br from-skyblue to-white flex items-center justify-center">
                <FaMapMarkerAlt className="text-teal text-2xl" />
              </div>
            </NeomorphicCard>
          </SectionReveal>

          {/* Form panel — neomorphic, raised */}
          <SectionReveal direction="right" delay={0.1} className="lg:col-span-3">
            <NeomorphicCard animate={false}>
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-mint/60 text-teal flex items-center justify-center text-3xl mb-5"
                    >
                      <FaCheckCircle />
                    </motion.div>
                    <h3 className="font-display text-xl font-semibold text-deepblue mb-2">
                      Message Sent
                    </h3>
                    <p className="text-sm text-deepblue/60 max-w-xs">
                      Thanks for reaching out — our team will get back to you within one business day.
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="mt-6 text-sm font-medium text-teal hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="grid sm:grid-cols-2 gap-5">
                      <NeomorphicInput
                        label="Full Name"
                        name="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        error={errors.name}
                        placeholder="Your name"
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
                      label="Subject (optional)"
                      name="subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="What's this about?"
                    />

                    <NeomorphicInput
                      as="textarea"
                      rows={6}
                      label="Message"
                      name="message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      error={errors.message}
                      placeholder="Tell us how we can help..."
                    />

                    {submitError && (
                      <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{submitError}</p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal text-white font-medium px-8 py-3.5 rounded-xl shadow-md hover:shadow-glow-teal transition-all disabled:opacity-60"
                    >
                      {submitting ? 'Sending...' : <>Send Message <FaPaperPlane className="text-sm" /></>}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </NeomorphicCard>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowRight, FaClock, FaUserMd, FaShieldAlt, FaCalendarCheck, FaHeartbeat,
} from 'react-icons/fa';

import SectionReveal from '../components/SectionReveal.jsx';
import DepartmentCard from '../components/DepartmentCard.jsx';
import DoctorCard from '../components/DoctorCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import heroImg from '../assets/hero.png';
import { getDepartments, getDoctors } from '../api/api.js';

const perks = [
  { icon: FaCalendarCheck, title: 'Book in Seconds', text: 'No phone calls, no waiting on hold — pick a slot and you\'re confirmed.' },
  { icon: FaUserMd, title: 'Verified Specialists', text: 'Every doctor on Vitalis is licensed, experienced, and reviewed regularly.' },
  { icon: FaClock, title: 'Real-Time Availability', text: 'See exactly which slots are open today — updated live, never double-booked.' },
  { icon: FaShieldAlt, title: 'Your Data, Protected', text: 'Guest booking means no account required, and your info stays private.' },
];

export default function Home() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDepartments(), getDoctors()])
      .then(([deptData, docData]) => {
        setDepartments(deptData.slice(0, 6));
        setDoctors(docData.slice(0, 3));
      })
      .catch((err) => console.error('Failed to load home data:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-offwhite">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="inline-flex items-center gap-2 bg-mint/60 text-deepblue text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <FaHeartbeat className="text-teal" /> Trusted care, modern booking
            </span>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-deepblue leading-[1.1] mb-6">
              Healthcare that fits <span className="text-teal">your schedule.</span>
            </h1>

            <p className="text-deepblue/65 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              Vitalis Clinic makes booking an appointment effortless — pick a
              specialist, see real-time openings, and confirm in under a
              minute. No calls. No accounts. No waiting.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/book">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="bg-teal text-white font-medium px-7 py-3.5 rounded-full shadow-lg hover:shadow-glow-teal transition-shadow duration-300 flex items-center gap-2"
                >
                  Book Appointment <FaArrowRight className="text-sm" />
                </motion.button>
              </Link>
              <Link to="/doctors">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="bg-white text-deepblue font-medium px-7 py-3.5 rounded-full border border-skyblue hover:border-teal/40 transition-colors duration-300"
                >
                  Meet Our Doctors
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-gradient-to-tr from-teal/15 via-mint/20 to-skyblue/20 rounded-[3rem] blur-2xl animate-floatSlow" />
            <img
              src={heroImg}
              alt="Vitalis Clinic care"
              className="relative w-full rounded-[2.5rem] shadow-2xl object-cover animate-floatSlow"
            />
          </motion.div>
        </div>

        {/* ---------------- SIGNATURE: NEXT AVAILABLE STRIP ---------------- */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-4 -mt-4 lg:-mt-10 relative z-10">
          <div className="neo-card p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-deepblue/60">
                Next Available Appointments
              </span>
            </div>

            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {doctors.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/book?doctor=${doc.id}`}
                    className="shrink-0 flex items-center gap-3 bg-offwhite hover:bg-white shadow-neo-sm hover:shadow-neo transition-all duration-300 rounded-2xl px-4 py-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center text-teal text-xs font-semibold shrink-0">
                      {doc.name.replace('Dr. ', '').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-deepblue leading-tight">{doc.name}</p>
                      <p className="text-xs text-deepblue/50">{doc.specialty}</p>
                    </div>
                    <span className="ml-2 text-xs font-semibold text-teal bg-mint/50 px-2.5 py-1 rounded-full shrink-0">
                      Today
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- PERKS ---------------- */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <SectionReveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {perks.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="hover-lift bg-white rounded-2xl p-6 border border-skyblue/50"
              >
                <div className="w-11 h-11 rounded-xl bg-teal/10 text-teal flex items-center justify-center text-lg mb-4">
                  <Icon />
                </div>
                <h3 className="font-display font-semibold text-deepblue mb-1.5">{perk.title}</h3>
                <p className="text-sm text-deepblue/60 leading-relaxed">{perk.text}</p>
              </motion.div>
            );
          })}
        </SectionReveal>
      </section>

      {/* ---------------- DEPARTMENTS PREVIEW ---------------- */}
      <section className="bg-offwhite py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <SectionReveal className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-semibold text-deepblue mb-2">
                Care Across Specialties
              </h2>
              <p className="text-deepblue/60 max-w-md">
                From routine checkups to specialist consultations — find the right department.
              </p>
            </div>
            <Link to="/services" className="hidden sm:flex items-center gap-2 text-teal font-medium text-sm hover:gap-3 transition-all">
              View All <FaArrowRight className="text-xs" />
            </Link>
          </SectionReveal>

          {loading ? (
            <LoadingSpinner fullPage />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept, i) => (
                <DepartmentCard key={dept.id} department={dept} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- DOCTORS PREVIEW ---------------- */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <SectionReveal className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl font-semibold text-deepblue mb-2">
              Meet Our Specialists
            </h2>
            <p className="text-deepblue/60 max-w-md">
              Experienced doctors, ready to see you — often the same day.
            </p>
          </div>
          <Link to="/doctors" className="hidden sm:flex items-center gap-2 text-teal font-medium text-sm hover:gap-3 transition-all">
            View All <FaArrowRight className="text-xs" />
          </Link>
        </SectionReveal>

        {loading ? (
          <LoadingSpinner fullPage />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc, i) => (
              <DoctorCard key={doc.id} doctor={doc} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <SectionReveal>
          <div className="skeu-footer rounded-[2.5rem] px-8 py-16 lg:py-20 text-center relative overflow-hidden shadow-skeu-panel">
            <div className="absolute inset-0 bg-gradient-to-tr from-teal/10 to-transparent" />
            <h2 className="relative font-display text-3xl lg:text-4xl font-semibold text-white mb-4">
              Your health can't wait for a callback.
            </h2>
            <p className="relative text-white/70 max-w-xl mx-auto mb-8">
              Book your appointment now and get seen by a specialist — often within 24 hours.
            </p>
            <Link to="/book" className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-mint text-deepblue font-semibold px-8 py-3.5 rounded-full shadow-lg inline-flex items-center gap-2"
              >
                Book Appointment <FaArrowRight className="text-sm" />
              </motion.button>
            </Link>
          </div>
        </SectionReveal>
      </section>
    </div>
  );
}
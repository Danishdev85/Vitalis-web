import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHeartbeat, FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn,
  FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaClock, FaPaperPlane, FaCheckCircle,
} from 'react-icons/fa';

const quickLinks = [
  { to: '/about', label: 'About Us' },
  { to: '/doctors', label: 'Our Doctors' },
  { to: '/book', label: 'Book Appointment' },
  { to: '/lookup', label: 'Find My Appointment' },
  { to: '/contact', label: 'Contact' },
];

const services = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Dentistry',
  'Orthopedics',
];

const socials = [
  { icon: FaFacebookF, href: '#', label: 'Facebook', bg: '#E2FCD6', fg: '#095D7E' },
  { icon: FaInstagram, href: '#', label: 'Instagram', bg: '#CCECEE', fg: '#095D7E' },
  { icon: FaTwitter, href: '#', label: 'Twitter', bg: '#14967F', fg: '#FFFFFF' },
  { icon: FaLinkedinIn, href: '#', label: 'LinkedIn', bg: '#F1F9FF', fg: '#095D7E' },
];

function Rivet({ className = '' }) {
  return <span className={`skeu-rivet absolute ${className}`} />;
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  }

  return (
    <footer className="relative text-white/90 mt-auto">
      {/* Multi-color accent stripe */}
      <div className="skeu-accent-stripe" />

      <div className="skeu-footer skeu-brushed relative">
        {/* Riveted panel corners */}
        <Rivet className="top-4 left-4" />
        <Rivet className="top-4 right-4" />

        {/* ---------------- Newsletter strip ---------------- */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12">
          <div className="rounded-2xl p-6 lg:p-7 shadow-skeu-panel bg-gradient-to-r from-[#0a5d7e]/60 via-[#0c7396]/50 to-[#0a5d7e]/60 border border-mint/10 flex flex-col lg:flex-row items-center justify-between gap-5">
            <div className="text-center lg:text-left">
              <h4 className="font-display text-lg font-semibold text-white mb-1 [text-shadow:0_1px_1px_rgba(0,0,0,0.4)]">
                Stay in the Loop
              </h4>
              <p className="text-sm text-white/65">
                Health tips, clinic updates, and appointment reminders — no spam.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="flex w-full lg:w-auto gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="skeu-input flex-1 lg:w-64 rounded-xl px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-all duration-200"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95, y: 1 }}
                className="skeu-btn shrink-0 bg-mint text-deepblue text-sm font-semibold px-5 py-3 rounded-xl flex items-center gap-2"
              >
                {subscribed ? <FaCheckCircle /> : <FaPaperPlane className="text-xs" />}
                <span className="hidden sm:inline">{subscribed ? 'Subscribed' : 'Subscribe'}</span>
              </motion.button>
            </form>
          </div>
        </div>

        {/* ---------------- Main grid ---------------- */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-mint text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
                <FaHeartbeat />
              </span>
              <span className="font-display text-xl font-semibold text-white">
                Vitalis Clinic
              </span>
            </div>
            <p className="text-sm text-white/65 leading-relaxed mb-6">
              Compassionate, modern healthcare — with appointment booking that
              takes seconds, not phone calls.
            </p>

            <div className="flex gap-2.5">
              {socials.map(({ icon: Icon, href, label, bg, fg }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ y: -3, scale: 1.06 }}
                  whileTap={{ y: 1, scale: 0.95 }}
                  style={{ background: bg, color: fg }}
                  className="skeu-btn w-9 h-9 rounded-full flex items-center justify-center text-sm"
                >
                  <Icon />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-base font-semibold text-mint mb-5 [text-shadow:0_1px_1px_rgba(0,0,0,0.3)]">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-sm text-white/70 hover:text-mint transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-skyblue/30 group-hover:bg-mint transition-all duration-200" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-base font-semibold text-mint mb-5 [text-shadow:0_1px_1px_rgba(0,0,0,0.3)]">
              Our Services
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <Link
                    to="/services"
                    className="group flex items-center gap-2 text-sm text-white/70 hover:text-mint transition-colors duration-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-skyblue/30 group-hover:bg-mint transition-all duration-200" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {service}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info — embossed panel with skyblue tint */}
          <div>
            <h4 className="font-display text-base font-semibold text-mint mb-5 [text-shadow:0_1px_1px_rgba(0,0,0,0.3)]">
              Visit or Reach Us
            </h4>
            <div className="rounded-2xl p-5 shadow-skeu-panel bg-skyblue/[0.08] border border-skyblue/10 space-y-4">
              <div className="flex items-start gap-3 text-sm text-white/80">
                <span className="w-7 h-7 rounded-lg bg-mint/15 flex items-center justify-center shrink-0">
                  <FaMapMarkerAlt className="text-mint text-xs" />
                </span>
                <span className="pt-1">123 Wellness Road, Multan, Punjab, Pakistan</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span className="w-7 h-7 rounded-lg bg-mint/15 flex items-center justify-center shrink-0">
                  <FaPhoneAlt className="text-mint text-xs" />
                </span>
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span className="w-7 h-7 rounded-lg bg-mint/15 flex items-center justify-center shrink-0">
                  <FaEnvelope className="text-mint text-xs" />
                </span>
                <span>hello@vitalisclinic.com</span>
              </div>
              <div className="skeu-groove" />
              <div className="flex items-start gap-3 text-xs text-white/55">
                <span className="w-7 h-7 rounded-lg bg-skyblue/10 flex items-center justify-center shrink-0">
                  <FaClock className="text-skyblue text-xs" />
                </span>
                <span className="pt-1">Mon–Fri: 9am – 5pm<br />Sat: 9am – 1pm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Embossed divider before bottom bar */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="skeu-groove" />
        </div>

        {/* ---------------- Bottom strip ---------------- */}
        <div className="relative">
          <Rivet className="bottom-4 left-4" />
          <Rivet className="bottom-4 right-4" />
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
            <span>© {new Date().getFullYear()} Vitalis Clinic. All rights reserved.</span>
            <div className="flex items-center gap-5">
              <Link to="/contact" className="hover:text-mint transition-colors">
                Privacy Policy
              </Link>
              <Link to="/contact" className="hover:text-mint transition-colors">
                Terms of Service
              </Link>
              <Link to="/admin/login" className="hover:text-mint transition-colors font-medium">
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
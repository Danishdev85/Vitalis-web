import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaHeartbeat } from 'react-icons/fa';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/lookup', label: 'My Appointment' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 glass-nav transition-shadow duration-300 ${
        scrolled ? 'shadow-glass' : ''
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.span
            whileHover={{ rotate: [0, -10, 10, -6, 0] }}
            transition={{ duration: 0.6 }}
            className="text-teal text-2xl"
          >
            <FaHeartbeat />
          </motion.span>
          <span className="font-display text-xl font-semibold text-deepblue tracking-tight">
            Vitalis <span className="text-teal">Clinic</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <li key={link.to} className="relative">
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `relative py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive ? 'text-teal' : 'text-deepblue/80 hover:text-teal'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      className={`absolute left-0 -bottom-0.5 h-[2px] bg-teal transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden lg:block">
          <Link to="/book">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="bg-teal text-white font-medium px-6 py-2.5 rounded-full shadow-md hover:shadow-glow-teal transition-shadow duration-300"
            >
              Book Appointment
            </motion.button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-2xl text-deepblue"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <HiX /> : <HiMenu />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden glass-nav overflow-hidden"
          >
            <ul className="flex flex-col px-6 py-4 gap-4">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `block text-base font-medium ${
                        isActive ? 'text-teal' : 'text-deepblue/80'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <Link to="/book" onClick={() => setOpen(false)}>
                  <button className="w-full bg-teal text-white font-medium px-6 py-3 rounded-full shadow-md">
                    Book Appointment
                  </button>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaHeartbeat, FaUserMd, FaHospitalUser, FaAward, FaArrowRight,
} from 'react-icons/fa';

import SectionReveal from '../components/SectionReveal.jsx';

const stats = [
  { value: '12+', label: 'Years of Service' },
  { value: '6', label: 'Specialties' },
  { value: '20k+', label: 'Patients Cared For' },
  { value: '4.9/5', label: 'Average Rating' },
];

const values = [
  {
    icon: FaHeartbeat,
    title: 'Patient-First Care',
    text: 'Every decision, from scheduling to treatment, starts with what\'s best for the person in front of us.',
  },
  {
    icon: FaUserMd,
    title: 'Experienced Specialists',
    text: 'Our doctors bring years of focused expertise across general medicine, cardiology, dermatology, and more.',
  },
  {
    icon: FaHospitalUser,
    title: 'Accessible by Design',
    text: 'No accounts, no hold music. Booking a visit should be as easy as the care itself.',
  },
  {
    icon: FaAward,
    title: 'Quality You Can Trust',
    text: 'Licensed, reviewed, and held to a consistent standard of care across every department.',
  },
];

export default function About() {
  return (
    <div>
      {/* Header */}
      <section className="bg-offwhite py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <SectionReveal>
            <span className="inline-block bg-mint/60 text-deepblue text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              About Vitalis
            </span>
            <h1 className="font-display text-4xl lg:text-5xl font-semibold text-deepblue mb-5">
              Care Built Around You
            </h1>
            <p className="text-deepblue/60 text-base lg:text-lg leading-relaxed">
              Vitalis Clinic was founded on a simple idea: getting quality
              healthcare shouldn't mean waiting on hold or navigating
              confusing paperwork. We combine experienced specialists with
              a booking experience that respects your time.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <SectionReveal className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center bg-white rounded-2xl py-8 px-4 border border-skyblue/50 hover-lift"
            >
              <p className="font-display text-3xl lg:text-4xl font-semibold text-teal mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-deepblue/55 uppercase tracking-wide font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </SectionReveal>
      </section>

      {/* Story */}
      <section className="bg-offwhite py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <SectionReveal className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold text-deepblue mb-4">
                Our Story
              </h2>
              <p className="text-deepblue/65 leading-relaxed mb-4">
                What started as a single general-medicine practice has grown
                into a multi-specialty clinic serving thousands of patients
                each year. Along the way, we kept coming back to the same
                complaint: booking an appointment was harder than it needed
                to be.
              </p>
              <p className="text-deepblue/65 leading-relaxed">
                So we rebuilt it — real-time availability, instant
                confirmation, and zero friction for anyone who just needs to
                see a doctor.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-teal/15 to-mint/25 rounded-3xl blur-xl" />
              <div className="relative bg-white rounded-3xl p-10 border border-skyblue/50 flex items-center justify-center aspect-square">
                <FaHeartbeat className="text-teal text-6xl animate-pulseGlow rounded-full" />
              </div>
            </motion.div>
          </SectionReveal>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <SectionReveal className="text-center mb-12">
          <h2 className="font-display text-3xl font-semibold text-deepblue mb-3">
            What We Stand For
          </h2>
          <p className="text-deepblue/60 max-w-lg mx-auto">
            The principles that shape every appointment, every interaction, every day.
          </p>
        </SectionReveal>

        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((val, i) => {
            const Icon = val.icon;
            return (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="hover-lift bg-white rounded-2xl p-7 border border-skyblue/50 flex gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-teal/10 text-teal flex items-center justify-center text-xl shrink-0">
                  <Icon />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-deepblue mb-1.5">{val.title}</h3>
                  <p className="text-sm text-deepblue/60 leading-relaxed">{val.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-24">
        <SectionReveal className="text-center bg-teal/5 rounded-3xl py-14 px-8 border border-teal/10">
          <h2 className="font-display text-2xl lg:text-3xl font-semibold text-deepblue mb-4">
            Ready to experience easier healthcare?
          </h2>
          <Link to="/book">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 bg-teal text-white font-medium px-7 py-3.5 rounded-full shadow-md hover:shadow-glow-teal transition-shadow duration-300"
            >
              Book Your Appointment <FaArrowRight className="text-sm" />
            </motion.button>
          </Link>
        </SectionReveal>
      </section>
    </div>
  );
}
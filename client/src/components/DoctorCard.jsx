import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaStar, FaBriefcaseMedical, FaArrowRight } from 'react-icons/fa';

export default function DoctorCard({ doctor, index = 0 }) {
  const initials = doctor.name
    .replace('Dr. ', '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      className="hover-lift group bg-white rounded-3xl overflow-hidden border border-skyblue/60"
    >
      {/* Photo / avatar area */}
      <div className="relative h-48 bg-gradient-to-br from-skyblue to-offwhite flex items-center justify-center overflow-hidden">
        {doctor.photo_url ? (
          <img
            src={doctor.photo_url}
            alt={doctor.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="font-display text-5xl font-semibold text-deepblue/30">
            {initials}
          </span>
        )}

        <span
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-teal text-xs font-medium
                     px-3 py-1 rounded-full shadow-sm flex items-center gap-1"
        >
          <FaBriefcaseMedical className="text-[10px]" />
          {doctor.years_experience}+ yrs
        </span>
      </div>

      <div className="p-6">
        <h3 className="font-display text-lg font-semibold text-deepblue mb-0.5">
          {doctor.name}
        </h3>
        <p className="text-sm text-teal font-medium mb-3">{doctor.specialty}</p>

        <p className="text-sm text-deepblue/60 leading-relaxed mb-4 line-clamp-2">
          {doctor.bio}
        </p>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-deepblue/70">
            <FaStar className="text-mint text-xs" />
            <span className="font-semibold text-deepblue">
              Rs. {Number(doctor.consultation_fee).toLocaleString()}
            </span>
            <span className="text-xs text-deepblue/50">/ visit</span>
          </span>
        </div>

        <Link to={`/book?doctor=${doctor.id}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-teal text-white
                       font-medium py-2.5 rounded-xl shadow-md hover:shadow-glow-teal
                       transition-shadow duration-300"
          >
            Book Appointment <FaArrowRight className="text-xs" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
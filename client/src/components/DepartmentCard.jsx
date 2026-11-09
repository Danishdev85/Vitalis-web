import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaStethoscope, FaHeartbeat, FaAllergies, FaChild, FaTooth, FaBone, FaArrowRight,
} from 'react-icons/fa';

// Maps the `icon` key stored in the database to an actual icon component
const iconMap = {
  stethoscope: FaStethoscope,
  heart: FaHeartbeat,
  skin: FaAllergies,
  child: FaChild,
  tooth: FaTooth,
  bone: FaBone,
};

export default function DepartmentCard({ department, index = 0 }) {
  const Icon = iconMap[department.icon] || FaStethoscope;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      className="hover-lift group bg-offwhite rounded-3xl p-7 border border-skyblue/60"
    >
      <div
        className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center text-teal text-2xl
                   mb-5 transition-all duration-300 group-hover:bg-teal group-hover:text-white
                   group-hover:rotate-6"
      >
        <Icon />
      </div>

      <h3 className="font-display text-xl font-semibold text-deepblue mb-2">
        {department.name}
      </h3>

      <p className="text-sm text-deepblue/65 leading-relaxed mb-5">
        {department.description}
      </p>

      <Link
        to={`/doctors?department=${department.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-teal
                   group-hover:gap-3 transition-all duration-300"
      >
        View Doctors <FaArrowRight className="text-xs" />
      </Link>
    </motion.div>
  );
}
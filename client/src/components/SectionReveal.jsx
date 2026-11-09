import { motion } from 'framer-motion';

/**
 * Generic scroll-reveal wrapper for whole sections (not individual cards —
 * DoctorCard/DepartmentCard already animate themselves with stagger).
 *
 * Usage:
 *   <SectionReveal>
 *     <h2>Our Services</h2>
 *     ...
 *   </SectionReveal>
 *
 *   <SectionReveal direction="left" delay={0.2}>...</SectionReveal>
 */
export default function SectionReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className = '',
  once = true,
  ...props
}) {
  const offsets = {
    up: { y: 32, x: 0 },
    down: { y: -32, x: 0 },
    left: { x: 32, y: 0 },
    right: { x: -32, y: 0 },
    none: { x: 0, y: 0 },
  };

  const { x, y } = offsets[direction] || offsets.up;

  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
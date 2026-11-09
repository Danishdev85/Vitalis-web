import { motion } from 'framer-motion';

/**
 * Reusable neomorphic container — soft-UI raised panel.
 * Wrap form sections, info blocks, or stat groups in this on the Contact page.
 *
 * Usage:
 *   <NeomorphicCard>
 *     ...form fields...
 *   </NeomorphicCard>
 *
 *   <NeomorphicCard inset>
 *     ...content that should look "pressed in" instead of raised...
 *   </NeomorphicCard>
 */
export default function NeomorphicCard({
  children,
  inset = false,
  className = '',
  animate = true,
  ...props
}) {
  const Wrapper = animate ? motion.div : 'div';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.5, ease: 'easeOut' },
      }
    : {};

  return (
    <Wrapper
      className={`neo-surface rounded-3xl p-7 sm:p-9 ${
        inset ? 'shadow-neo-inset' : 'shadow-neo'
      } ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </Wrapper>
  );
}
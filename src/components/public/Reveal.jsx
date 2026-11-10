import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Reveal — Shared public editorial entrance motion.
 * Matches UGC's calm, slow editorial reveal:
 * opacity 0 -> 1, y 28 -> 0, duration 0.8s, ease [0.22, 1, 0.36, 1].
 * Respects prefers-reduced-motion.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
  as = 'div',
}) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[as] || motion.div;

  if (shouldReduceMotion) {
    return React.createElement(as, { className }, children);
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

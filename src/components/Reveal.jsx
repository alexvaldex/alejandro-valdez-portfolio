import { motion } from 'framer-motion'

// Fade + rise when scrolled into view
export default function Reveal({ children, delay = 0, as = 'div', ...rest }) {
  const M = motion[as]
  return (
    <M initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }} {...rest}>
      {children}
    </M>
  )
}

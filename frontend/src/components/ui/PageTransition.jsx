import { motion } from 'framer-motion';

// Page transition animation variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98
  }
};

const pageTransitions = {
  default: {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3
  },
  smooth: {
    type: 'spring',
    stiffness: 100,
    damping: 20
  },
  bounce: {
    type: 'spring',
    stiffness: 300,
    damping: 15
  }
};

const PageTransition = ({ children, transition = 'smooth' }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransitions[transition] || pageTransitions.default}
      className="w-full overflow-hidden"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 
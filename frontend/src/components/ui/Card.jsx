import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className, 
  variant = 'glass',
  hover = true,
  padding = 'p-6',
  ...props 
}) => {
  const variants = {
    glass: 'glass-card',
    glassHover: 'glass-card-hover',
    panel: 'glass-panel',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={`${variants[variant]} ${hover ? 'card-hover-lift' : ''} ${padding} ${className || ''}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;

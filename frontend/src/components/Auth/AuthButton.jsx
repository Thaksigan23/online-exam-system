import React from 'react';
import { motion } from 'framer-motion';
import { ImSpinner2 } from 'react-icons/im';
import styles from './AuthButton.module.css';

function AuthButton({ children, loading, disabled, loadingText, ariaLabel, ...props }) {
  const isDisabled = disabled ?? loading;

  return (
    <motion.button
      type="submit"
      disabled={isDisabled}
      className={styles.button}
      aria-busy={loading}
      aria-label={ariaLabel}
      whileHover={!isDisabled ? { scale: 1.05, boxShadow: '0px 0px 10px rgba(255,255,255,0.6)' } : undefined}
      whileTap={!isDisabled ? { scale: 0.95 } : undefined}
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      {...props}
    >
      {loading ? (
        <>
          <ImSpinner2 className={styles.spinner} aria-hidden="true" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

export default AuthButton;

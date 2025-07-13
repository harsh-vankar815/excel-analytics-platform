import { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { closeModal } from '../../redux/ui/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Modal = ({ content, type }) => {
  const dispatch = useDispatch();
  const modalRef = useRef();
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        dispatch(closeModal());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        dispatch(closeModal());
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [dispatch]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Modal variants
  const getModalWidth = () => {
    switch (type) {
      case 'large':
        return '48rem';
      case 'medium':
        return '36rem';
      case 'small':
        return '28rem';
      default:
        return '36rem';
    }
  };

  // Content with header support (optional)
  const modalContent = () => {
    // If content is a react element, just return it
    if (React.isValidElement(content)) {
      return content;
    }
    
    // If content is an object with title and body properties
    if (content && typeof content === 'object' && content.title) {
      return (
        <>
          <div style={{
            borderBottom: `1px solid ${styles.borderColor}`,
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: styles.textColor
              }}>
                {content.title}
              </h3>
              <button
                onClick={() => dispatch(closeModal())}
                style={{
                  padding: '0.375rem',
                  borderRadius: '9999px',
                  backgroundColor: 'transparent',
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {content.body}
          </div>
          {content.footer && (
            <div style={{
              borderTop: `1px solid ${styles.borderColor}`,
              padding: '1.5rem',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb'
            }}>
              {content.footer}
            </div>
          )}
        </>
      );
    }
    
    // Default case
    return <div style={{ padding: '1.5rem' }}>{content}</div>;
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        overflowY: 'auto',
        backgroundColor: 'rgba(17, 24, 39, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          ref={modalRef}
          style={{
            backgroundColor: styles.backgroundColor,
            borderRadius: '0.5rem',
            boxShadow: `0 20px 25px -5px ${styles.shadowColor}, 0 10px 10px -5px ${styles.shadowColor}`,
            overflow: 'hidden',
            width: '100%',
            maxWidth: getModalWidth(),
            maxHeight: '95vh'
          }}
        >
          <div style={{ 
            overflowY: 'auto', 
            maxHeight: '80vh', 
            overscrollBehavior: 'contain'
          }}>
            {modalContent()}
          </div>
          
          {/* Mobile close button at bottom of screen - only shown for simple content without footer */}
          {!(content && typeof content === 'object' && (content.footer || content.title)) && (
            <div style={{
              display: window.innerWidth < 640 ? 'block' : 'none',
              position: 'sticky',
              bottom: 0,
              width: '100%',
              padding: '0.75rem',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
              borderTop: `1px solid ${styles.borderColor}`
            }}>
              <button
                onClick={() => dispatch(closeModal())}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                  color: theme === 'dark' ? '#d1d5db' : '#374151',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#d1d5db'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#e5e7eb'}
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal; 
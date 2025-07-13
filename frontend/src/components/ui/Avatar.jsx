import React from 'react';

/**
 * Avatar component that displays the user's initial letter
 * @param {Object} props
 * @param {string} props.name - The user's name
 * @param {string} props.size - Size of the avatar (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
const Avatar = ({ name, size = 'md', className = '' }) => {
  // Get dimensions based on size
  const dimensions = {
    sm: { height: '1.75rem', width: '1.75rem', fontSize: '0.75rem' },
    md: { height: '2rem', width: '2rem', fontSize: '0.875rem' },
    lg: { height: '2.5rem', width: '2.5rem', fontSize: '1rem' }
  };

  const { height, width, fontSize } = dimensions[size] || dimensions.md;
  
  // Get the first letter of the name or use a fallback
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div
      style={{
        height,
        width,
        borderRadius: '9999px',
        background: 'linear-gradient(to right, #3b82f6, #4f46e5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: '500',
        fontSize
      }}
      className={className}
    >
      {initial}
    </div>
  );
};

export default Avatar; 
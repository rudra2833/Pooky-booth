import React from 'react';
import './Button.css';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'yellow' | 'outline'
  disabled = false,
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-cute btn-${variant} btn-size-${size} ${disabled ? 'btn-disabled' : ''} ${className}`}
      {...props}
    >
      <span className="btn-inner">{children}</span>
    </button>
  );
};

export default Button;

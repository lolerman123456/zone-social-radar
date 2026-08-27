
import React from 'react';

interface LogoProps {
  /** 'mark' is the square X glyph, 'wordmark' is the full VayeX lockup. */
  variant?: 'mark' | 'wordmark';
  size?: 'sm' | 'md' | 'lg';
  /** 'light' renders the artwork white for dark backgrounds, 'dark' keeps it black. */
  tone?: 'light' | 'dark';
  className?: string;
}

const markSizes = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16'
};

const wordmarkSizes = {
  sm: 'h-6',
  md: 'h-9',
  lg: 'h-12'
};

const Logo: React.FC<LogoProps> = ({
  variant = 'mark',
  size = 'md',
  tone = 'light',
  className
}) => {
  const isWordmark = variant === 'wordmark';
  const height = isWordmark ? wordmarkSizes[size] : markSizes[size];

  return (
    <img
      src={isWordmark ? '/brand/vayex-logo.png' : '/brand/vayex-mark.png'}
      alt="VayeX"
      className={`${height} w-auto object-contain ${tone === 'light' ? 'invert' : ''} ${className || ''}`}
    />
  );
};

export default Logo;

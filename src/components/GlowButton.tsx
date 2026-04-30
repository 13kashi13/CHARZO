import React from 'react';

interface GlowButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  /** Extra tailwind/inline classes for sizing — e.g. "text-sm px-5" */
  className?: string;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
  /** px height override — defaults to 44 */
  height?: number;
  /** px font-size override */
  fontSize?: number;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  href,
  onClick,
  children,
  className = '',
  type = 'button',
  fullWidth = false,
  height = 44,
  fontSize,
}) => {
  const style: React.CSSProperties = {
    minHeight: `${height}px`,
    width: fullWidth ? '100%' : undefined,
    fontSize: fontSize ? `${fontSize}px` : undefined,
  };

  const inner = (
    <span className="btn-inner">
      {children}
    </span>
  );

  const cls = `brutalist-button ${className}`;

  if (href) {
    return (
      <a href={href} className={cls} style={style}>
        {inner}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={cls} style={style}>
      {inner}
    </button>
  );
};

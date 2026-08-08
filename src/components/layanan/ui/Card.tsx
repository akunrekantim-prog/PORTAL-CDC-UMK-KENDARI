import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  key?: React.Key;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  const hoverClass = hover ? 'transition hover:shadow-md hover:border-slate-300' : '';
  return <div onClick={onClick} className={`rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ${hoverClass} ${className ?? ''}`}>{children}</div>;
}

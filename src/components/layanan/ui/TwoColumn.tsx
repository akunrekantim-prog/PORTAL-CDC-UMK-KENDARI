import React from 'react';

interface TwoColumnProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export function TwoColumn({ left, right, className = '' }: TwoColumnProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ${className}`}>
      <div className="lg:col-span-5 space-y-6">{left}</div>
      <div className="lg:col-span-7 space-y-6">{right}</div>
    </div>
  );
}

import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  position = 'top',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(prev => !prev)}
        className="text-[#3f48cc] hover:text-[#e9fb66] focus:outline-none transition-colors p-0.5 rounded-full inline-flex items-center justify-center cursor-help"
        aria-label="Info keterangan"
      >
        <Info className="w-4 h-4 stroke-[2.2]" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className={`absolute z-50 w-64 p-2.5 text-xs font-normal text-slate-800 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border-2 border-[rgb(233,251,102)] transition-all pointer-events-none ${positionClasses}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

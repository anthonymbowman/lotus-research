import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getGlossaryEntry } from '../glossary';

interface TermDefinitionProps {
  term: string;
  children: React.ReactNode;
}

export function TermDefinition({ term, children }: TermDefinitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const entry = getGlossaryEntry(term);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const showBelow = rect.top < 200;

      setTooltipPosition({
        top: showBelow ? rect.bottom + 8 : rect.top - 8,
        left: Math.min(rect.left + rect.width / 2, window.innerWidth - 180),
      });
    }
  }, [isVisible]);

  // Close tooltip when clicking outside (for mobile)
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
        setShowFull(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  if (!entry) {
    return <span>{children}</span>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsVisible(!isVisible);
  };

  const tooltip = isVisible && (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] px-4 py-3 text-sm bg-lotus-grey-900 text-white rounded-lg shadow-xl border border-lotus-grey-700"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        transform: tooltipPosition.top < 200
          ? 'translateX(-50%)'
          : 'translate(-50%, -100%)',
        maxWidth: '320px',
        width: 'max-content',
      }}
    >
      <div className="font-medium text-lotus-purple-300 mb-1">{entry.term}</div>
      <p className="text-lotus-grey-300 text-xs leading-relaxed">
        {entry.shortDef}
      </p>

      {showFull && (
        <div className="mt-3 pt-3 border-t border-lotus-grey-700">
          <p className="text-lotus-grey-300 text-xs leading-relaxed mb-2">
            {entry.fullDef}
          </p>
          {entry.formula && (
            <code className="block text-xs font-mono text-lotus-purple-400 bg-lotus-grey-800 px-2 py-1 rounded mt-2">
              {entry.formula}
            </code>
          )}
          {entry.example && (
            <p className="text-xs text-lotus-grey-300 mt-2 italic">
              Example: {entry.example}
            </p>
          )}
        </div>
      )}

      {!showFull && entry.fullDef !== entry.shortDef && (
        <button
          onClick={() => setShowFull(true)}
          className="mt-2 text-xs text-lotus-purple-400 hover:text-lotus-purple-300 transition-colors"
        >
          Learn more...
        </button>
      )}

      <div
        className="absolute left-1/2 -translate-x-1/2 border-8 border-transparent"
        style={tooltipPosition.top < 200
          ? { bottom: '100%', borderBottomColor: '#1a1625' }
          : { top: '100%', borderTopColor: '#1a1625' }
        }
      />
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        className="border-b border-dotted border-lotus-grey-500 hover:border-lotus-purple-400 cursor-help transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => {
          if (!showFull) {
            setIsVisible(false);
          }
        }}
        onClick={handleClick}
      >
        {children}
      </span>
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
}

export default TermDefinition;

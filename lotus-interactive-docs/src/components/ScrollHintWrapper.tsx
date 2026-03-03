import { useRef, useEffect, useState } from 'react';

/**
 * ScrollHintWrapper - Shows a gradient hint when content is scrollable
 *
 * Wraps horizontally scrollable content and shows a fade gradient on the right
 * to indicate there's more content. Fades out when scrolled to the end.
 */

interface ScrollHintWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ScrollHintWrapper({ children, className = '' }: ScrollHintWrapperProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledRight, setIsScrolledRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      const hasHorizontalOverflow = el.scrollWidth > el.clientWidth;
      setHasOverflow(hasHorizontalOverflow);

      // Check if scrolled to the right edge (within 5px tolerance)
      const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
      setIsScrolledRight(isAtEnd);
    };

    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <div className={`table-scroll-container ${isScrolledRight || !hasOverflow ? 'scrolled-right' : ''} ${className}`}>
      <div ref={scrollRef} className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

export default ScrollHintWrapper;

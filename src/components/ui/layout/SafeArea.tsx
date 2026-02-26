import React, { useRef, useEffect, useState } from 'react';

export default function SafeArea({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      setIsOverflowing(container.scrollHeight > container.clientHeight);
    }
  }, [children]);

  return (
    <div className="relative w-100 h-150 mx-auto overflow-y-auto scrollbar-hide" ref={containerRef}>
      {children}
      {isOverflowing && (
        <div className="sticky bottom-0 left-0 right-0 h-12 bg-linear-to-t from-bg to-transparent pointer-events-none" />
      )}
    </div>
  );
}
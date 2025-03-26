
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
  direction?: 'horizontal' | 'vertical';
  side?: 'left' | 'right' | 'top' | 'bottom';
  onResize?: (newSize: number) => void;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultSize = 300,
  minSize = 200,
  maxSize = 500,
  className,
  direction = 'horizontal',
  side = 'right',
  onResize,
}) => {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startPosition = useRef(0);
  const startSize = useRef(0);

  const isHorizontal = direction === 'horizontal';
  const showLeftHandle = isHorizontal && side === 'left';
  const showRightHandle = isHorizontal && side === 'right';
  const showTopHandle = !isHorizontal && side === 'top';
  const showBottomHandle = !isHorizontal && side === 'bottom';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPosition.current = isHorizontal ? e.clientX : e.clientY;
    startSize.current = size;
    document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.classList.add('select-none');
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const currentPosition = isHorizontal ? e.clientX : e.clientY;
    const difference = (showLeftHandle || showTopHandle ? -1 : 1) * (currentPosition - startPosition.current);
    
    let newSize = startSize.current + difference;
    newSize = Math.max(minSize, Math.min(maxSize, newSize));
    
    setSize(newSize);
    if (onResize) onResize(newSize);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.classList.remove('select-none');
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('select-none');
    };
  }, []);

  const dimensionStyle = isHorizontal 
    ? { width: `${size}px`, minWidth: `${minSize}px`, maxWidth: `${maxSize}px` } 
    : { height: `${size}px`, minHeight: `${minSize}px`, maxHeight: `${maxSize}px` };

  return (
    <div 
      ref={panelRef}
      className={cn('relative flex-shrink-0', className)}
      style={dimensionStyle}
    >
      {children}
      {showLeftHandle && (
        <div
          className="absolute top-0 left-0 w-1 h-full cursor-col-resize group hover:bg-primary/20"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-8 opacity-0 group-hover:opacity-100 bg-primary/50 rounded-full transition-opacity"></div>
        </div>
      )}
      {showRightHandle && (
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:bg-primary/20"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-8 opacity-0 group-hover:opacity-100 bg-primary/50 rounded-full transition-opacity"></div>
        </div>
      )}
      {showTopHandle && (
        <div
          className="absolute top-0 left-0 w-full h-1 cursor-row-resize group hover:bg-primary/20"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 h-4 w-8 opacity-0 group-hover:opacity-100 bg-primary/50 rounded-full transition-opacity"></div>
        </div>
      )}
      {showBottomHandle && (
        <div
          className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize group hover:bg-primary/20"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-4 w-8 opacity-0 group-hover:opacity-100 bg-primary/50 rounded-full transition-opacity"></div>
        </div>
      )}
    </div>
  );
};

export default ResizablePanel;

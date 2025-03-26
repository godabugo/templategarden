
import React, { useRef, useState, useEffect } from 'react';
import { ElementData, useEditor } from '@/context/EditorContext';
import { cn } from '@/lib/utils';

interface ElementProps {
  element: ElementData;
}

const Element: React.FC<ElementProps> = ({ element }) => {
  const { 
    selectedElementId, 
    selectElement, 
    updateElement,
  } = useEditor();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedElementId === element.id;
  
  // For resize functionality
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  
  // Handle element selection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  };
  
  // Start dragging an element
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      document.body.style.cursor = 'grabbing';
    }
  };
  
  // Start resizing an element
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setInitialSize({ width: element.width, height: element.height });
    setInitialPosition({ x: element.position.x, y: element.position.y });
    setStartPoint({ x: e.clientX, y: e.clientY });
    document.body.style.cursor = 
      direction === 'n' || direction === 's' ? 'ns-resize' :
      direction === 'e' || direction === 'w' ? 'ew-resize' :
      direction === 'ne' || direction === 'sw' ? 'nesw-resize' : 'nwse-resize';
  };
  
  // Handle mouse movement for dragging or resizing
  useEffect(() => {
    let animationFrameId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Update element position during drag using requestAnimationFrame for better performance
        animationFrameId = requestAnimationFrame(() => {
          const newPosition = {
            x: Math.max(0, e.clientX - dragOffset.x),
            y: Math.max(0, e.clientY - dragOffset.y),
          };
          updateElement(element.id, { position: newPosition });
        });
      } else if (isResizing && resizeDirection) {
        // Handle resizing based on the direction using requestAnimationFrame
        animationFrameId = requestAnimationFrame(() => {
          const deltaX = e.clientX - startPoint.x;
          const deltaY = e.clientY - startPoint.y;
          
          let newWidth = initialSize.width;
          let newHeight = initialSize.height;
          let newX = initialPosition.x;
          let newY = initialPosition.y;
          
          if (resizeDirection.includes('e')) {
            newWidth = Math.max(50, initialSize.width + deltaX);
          } else if (resizeDirection.includes('w')) {
            newWidth = Math.max(50, initialSize.width - deltaX);
            newX = initialPosition.x + (initialSize.width - newWidth);
          }
          
          if (resizeDirection.includes('s')) {
            newHeight = Math.max(20, initialSize.height + deltaY);
          } else if (resizeDirection.includes('n')) {
            newHeight = Math.max(20, initialSize.height - deltaY);
            newY = initialPosition.y + (initialSize.height - newHeight);
          }
          
          updateElement(element.id, {
            width: newWidth,
            height: newHeight,
            position: { x: newX, y: newY },
          });
        });
      }
    };
    
    const handleMouseUp = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);
        document.body.style.cursor = '';
      }
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, element.id, updateElement, resizeDirection, startPoint, initialSize, initialPosition]);
  
  // Render different element types
  const renderElementContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div 
            className="w-full h-full outline-none"
            contentEditable={isSelected}
            suppressContentEditableWarning={true}
            onBlur={(e) => updateElement(element.id, { content: e.currentTarget.textContent || '' })}
          >
            {element.content}
          </div>
        );
      case 'image':
        return (
          <img 
            src={element.content || 'https://via.placeholder.com/150'} 
            alt="Email content"
            className="w-full h-full object-contain"
          />
        );
      case 'button':
        return (
          <button className="w-full h-full flex items-center justify-center">
            {element.content}
          </button>
        );
      case 'divider':
        return (
          <div className="w-full h-1 bg-gray-200" />
        );
      case 'spacer':
        return null;
      default:
        return <div>{element.content}</div>;
    }
  };
  
  // Element styles based on type and custom styling
  const getElementStyles = () => {
    const baseStyles = {
      width: `${element.width}px`,
      height: `${element.height}px`,
      top: `${element.position.y}px`,
      left: `${element.position.x}px`,
      ...element.style,
    };
    
    return baseStyles;
  };
  
  return (
    <div
      ref={elementRef}
      className={cn(
        'absolute animated-transition',
        {
          'ring-1 ring-primary': isSelected,
          'z-10': isSelected || isDragging || isResizing,
        }
      )}
      style={getElementStyles()}
      onClick={handleClick}
    >
      <div 
        className={cn(
          'w-full h-full relative p-2',
          { 'cursor-grab active:cursor-grabbing': isSelected && !isDragging && !isResizing }
        )}
        onMouseDown={isSelected ? handleDragStart : undefined}
      >
        {renderElementContent()}
      </div>
      
      {/* Resize handles - only visible when element is selected */}
      {isSelected && (
        <>
          {/* Corner resize handles */}
          <div 
            className="absolute w-2 h-2 bg-primary rounded-full -top-1 -left-1 cursor-nwse-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div 
            className="absolute w-2 h-2 bg-primary rounded-full -top-1 -right-1 cursor-nesw-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            className="absolute w-2 h-2 bg-primary rounded-full -bottom-1 -left-1 cursor-nesw-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            className="absolute w-2 h-2 bg-primary rounded-full -bottom-1 -right-1 cursor-nwse-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          
          {/* Edge resize handles */}
          <div 
            className="absolute w-2 h-2 bg-primary rounded-full top-1/2 -translate-y-1/2 -left-1 cursor-ew-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div 
            className="absolute w-2 h-2 bg-primary rounded-full top-1/2 -translate-y-1/2 -right-1 cursor-ew-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          <div 
            className="absolute w-2 h-2 bg-primary rounded-full -top-1 left-1/2 -translate-x-1/2 cursor-ns-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div 
            className="absolute w-2 h-2 bg-primary rounded-full -bottom-1 left-1/2 -translate-x-1/2 cursor-ns-resize" 
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
        </>
      )}
    </div>
  );
};

export default Element;

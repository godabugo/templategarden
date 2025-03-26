
import React, { useRef, useState, useEffect } from 'react';
import { SectionData, ElementData, useEditor } from '@/context/EditorContext';
import { cn } from '@/lib/utils';
import Element from './Element';

interface SectionProps {
  section: SectionData;
  elements: ElementData[];
  nestedSections?: SectionData[];
}

const Section: React.FC<SectionProps> = ({ section, elements, nestedSections = [] }) => {
  const { 
    selectedSectionId, 
    selectSection, 
    updateSection, 
    selectElement 
  } = useEditor();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedSectionId === section.id;

  // For resize functionality
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  
  // Handle section selection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectSection(section.id);
    selectElement(null);
  };
  
  // Start dragging a section
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sectionRef.current && isSelected) {
      const rect = sectionRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
      document.body.style.cursor = 'grabbing';
    }
  };
  
  // Start resizing a section
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    if (isSelected) {
      setIsResizing(true);
      setResizeDirection(direction);
      setInitialSize({ width: section.width, height: section.height });
      setInitialPosition({ x: section.position.x, y: section.position.y });
      setStartPoint({ x: e.clientX, y: e.clientY });
      document.body.style.cursor = 
        direction === 'n' || direction === 's' ? 'ns-resize' :
        direction === 'e' || direction === 'w' ? 'ew-resize' :
        direction === 'ne' || direction === 'sw' ? 'nesw-resize' : 'nwse-resize';
    }
  };
  
  // Handle mouse movement for dragging or resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Update section position during drag
        const newPosition = {
          x: Math.max(0, e.clientX - dragOffset.x),
          y: Math.max(0, e.clientY - dragOffset.y),
        };
        updateSection(section.id, { position: newPosition });
      } else if (isResizing && resizeDirection) {
        // Handle resizing based on the direction
        const deltaX = e.clientX - startPoint.x;
        const deltaY = e.clientY - startPoint.y;
        
        let newWidth = initialSize.width;
        let newHeight = initialSize.height;
        
        if (resizeDirection.includes('e')) {
          newWidth = Math.max(100, initialSize.width + deltaX);
        } else if (resizeDirection.includes('w')) {
          const widthChange = Math.min(deltaX, initialSize.width - 100);
          newWidth = initialSize.width - widthChange;
          updateSection(section.id, {
            position: { 
              x: initialPosition.x + widthChange, 
              y: initialPosition.y 
            }
          });
        }
        
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(100, initialSize.height + deltaY);
        } else if (resizeDirection.includes('n')) {
          const heightChange = Math.min(deltaY, initialSize.height - 100);
          newHeight = initialSize.height - heightChange;
          updateSection(section.id, {
            position: { 
              x: initialPosition.x, 
              y: initialPosition.y + heightChange 
            }
          });
        }
        
        updateSection(section.id, {
          width: newWidth,
          height: newHeight,
        });
      }
    };
    
    const handleMouseUp = () => {
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
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, section.id, updateSection, resizeDirection, startPoint, initialSize, initialPosition]);
  
  // Apply section styles
  const sectionStyle = {
    width: `${section.width}px`,
    height: `${section.height}px`,
    top: `${section.position.y}px`,
    left: `${section.position.x}px`,
    ...section.style,
  };
  
  return (
    <div
      ref={sectionRef}
      className={cn(
        'absolute bg-white border border-gray-200 rounded-md overflow-hidden animated-transition',
        {
          'ring-2 ring-primary/70 ring-offset-2': isSelected,
          'z-10': isSelected || isDragging,
        }
      )}
      style={sectionStyle}
      onClick={handleClick}
    >
      {/* Section header - visible when selected */}
      {isSelected && (
        <div className="absolute -top-7 left-0 h-6 px-2 bg-primary text-white text-xs flex items-center rounded-t-md z-10">
          {section.name || 'Section'}
        </div>
      )}
      
      {/* Section content area with elements */}
      <div 
        className={cn(
          'w-full h-full relative p-4',
          { 'cursor-grab active:cursor-grabbing': isSelected && !isDragging && !isResizing }
        )}
        onMouseDown={isSelected ? handleDragStart : undefined}
      >
        {/* Render elements that belong to this section */}
        {elements.map((element) => (
          <Element key={element.id} element={element} />
        ))}
        
        {/* Render nested sections */}
        {nestedSections.map((nestedSection) => {
          const nestedElements = elements.filter(el => el.sectionId === nestedSection.id);
          const childSections = nestedSections.filter(sec => sec.parentId === nestedSection.id);
          
          return (
            <Section 
              key={nestedSection.id}
              section={nestedSection}
              elements={nestedElements}
              nestedSections={childSections}
            />
          );
        })}
      </div>
      
      {/* Resize handles - only visible when section is selected */}
      {isSelected && (
        <>
          {/* Corner resize handles */}
          <div 
            className="absolute w-3 h-3 bg-primary rounded-full -top-1.5 -left-1.5 cursor-nwse-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div 
            className="absolute w-3 h-3 bg-primary rounded-full -top-1.5 -right-1.5 cursor-nesw-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            className="absolute w-3 h-3 bg-primary rounded-full -bottom-1.5 -left-1.5 cursor-nesw-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            className="absolute w-3 h-3 bg-primary rounded-full -bottom-1.5 -right-1.5 cursor-nwse-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          
          {/* Edge resize handles */}
          <div 
            className="absolute w-3 h-3 bg-primary rounded-full top-1/2 -translate-y-1/2 -left-1.5 cursor-ew-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div 
            className="absolute w-3 h-3 bg-primary rounded-full top-1/2 -translate-y-1/2 -right-1.5 cursor-ew-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          <div 
            className="absolute w-3 h-3 bg-primary rounded-full -top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" 
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div 
            className="absolute w-3 h-3 bg-primary rounded-full -bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" 
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
        </>
      )}
    </div>
  );
};

export default Section;

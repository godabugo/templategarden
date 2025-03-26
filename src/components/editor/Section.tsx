
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
    selectElement,
    updateElement
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
  
  // Store original element positions before resize
  const [originalElementPositions, setOriginalElementPositions] = useState<Record<string, { x: number, y: number }>>({});
  
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
      // Store original positions of all elements in this section
      const positions: Record<string, { x: number, y: number }> = {};
      elements.forEach(element => {
        positions[element.id] = { ...element.position };
      });
      setOriginalElementPositions(positions);
      
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
  
  // Update element positions when their parent section moves
  const updateElementPositions = (
    translationX: number, 
    translationY: number, 
    scaleX: number = 1, 
    scaleY: number = 1
  ) => {
    elements.forEach(element => {
      const originalPosition = originalElementPositions[element.id] || element.position;
      
      // If resizing (scaling), scale the position relative to the section
      if (scaleX !== 1 || scaleY !== 1) {
        const newPosition = {
          x: originalPosition.x * scaleX,
          y: originalPosition.y * scaleY
        };
        updateElement(element.id, { position: newPosition });
      } 
      // If just translating, move element with section
      else if (translationX !== 0 || translationY !== 0) {
        updateElement(element.id, { 
          position: { 
            x: element.position.x + translationX,
            y: element.position.y + translationY
          } 
        });
      }
    });
  };
  
  // Handle mouse movement for dragging or resizing with requestAnimationFrame for performance
  useEffect(() => {
    let animationFrameId: number;
    let lastX = 0;
    let lastY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Update section position during drag using requestAnimationFrame
        animationFrameId = requestAnimationFrame(() => {
          const newX = Math.max(0, e.clientX - dragOffset.x);
          const newY = Math.max(0, e.clientY - dragOffset.y);
          
          // Calculate translation since last update
          const translationX = newX - (section.position.x + lastX);
          const translationY = newY - (section.position.y + lastY);
          
          // Update element positions to move with parent section
          updateElementPositions(translationX, translationY);
          
          // Update section position
          updateSection(section.id, { 
            position: { x: newX, y: newY } 
          });
          
          lastX = newX - section.position.x;
          lastY = newY - section.position.y;
        });
      } else if (isResizing && resizeDirection) {
        // Handle resizing based on the direction
        animationFrameId = requestAnimationFrame(() => {
          const deltaX = e.clientX - startPoint.x;
          const deltaY = e.clientY - startPoint.y;
          
          let newWidth = initialSize.width;
          let newHeight = initialSize.height;
          let newX = initialPosition.x;
          let newY = initialPosition.y;
          let scaleX = 1;
          let scaleY = 1;
          
          if (resizeDirection.includes('e')) {
            newWidth = Math.max(100, initialSize.width + deltaX);
            scaleX = newWidth / initialSize.width;
          } else if (resizeDirection.includes('w')) {
            const widthChange = Math.min(deltaX, initialSize.width - 100);
            newWidth = initialSize.width - widthChange;
            newX = initialPosition.x + widthChange;
            scaleX = newWidth / initialSize.width;
          }
          
          if (resizeDirection.includes('s')) {
            newHeight = Math.max(100, initialSize.height + deltaY);
            scaleY = newHeight / initialSize.height;
          } else if (resizeDirection.includes('n')) {
            const heightChange = Math.min(deltaY, initialSize.height - 100);
            newHeight = initialSize.height - heightChange;
            newY = initialPosition.y + heightChange;
            scaleY = newHeight / initialSize.height;
          }
          
          // Update element positions based on section resizing
          updateElementPositions(0, 0, scaleX, scaleY);
          
          // Update section dimensions and position
          updateSection(section.id, {
            width: newWidth,
            height: newHeight,
            position: { x: newX, y: newY }
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
        setOriginalElementPositions({});
        document.body.style.cursor = '';
        lastX = 0;
        lastY = 0;
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
  }, [isDragging, isResizing, dragOffset, section, updateSection, updateElement, resizeDirection, startPoint, initialSize, initialPosition, originalElementPositions, elements]);
  
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


import React, { useState, useRef } from 'react';
import { useEditor, ElementData, SectionData } from '@/context/EditorContext';
import Section from './Section';
import Element from './Element';
import { cn } from '@/lib/utils';

const Canvas: React.FC = () => {
  const { 
    elements, 
    sections, 
    selectElement, 
    selectSection, 
    addElement, 
    addSection 
  } = useEditor();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  
  // Clear selection when clicking on the canvas background
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      selectElement(null);
      selectSection(null);
    }
  };

  // Handle dropping new elements onto the canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dragData = e.dataTransfer.getData('application/json');
    
    if (dragData) {
      try {
        const data = JSON.parse(dragData);
        
        // Get drop coordinates relative to the canvas
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left) / canvasScale;
          const y = (e.clientY - rect.top) / canvasScale;
          
          if (data.type === 'element') {
            // Add a new element
            const newElement: Omit<ElementData, 'id'> = {
              type: data.elementType,
              content: data.defaultContent || '',
              position: { x, y },
              width: data.defaultWidth || 200,
              height: data.defaultHeight || 50,
              style: data.defaultStyle || {},
              sectionId: null,
            };
            
            addElement(newElement);
          } else if (data.type === 'section') {
            // Add a new section
            const newSection: Omit<SectionData, 'id'> = {
              name: data.sectionName || 'New Section',
              position: { x, y },
              width: data.defaultWidth || 400,
              height: data.defaultHeight || 200,
              style: data.defaultStyle || { backgroundColor: '#ffffff' },
              parentId: null,
            };
            
            addSection(newSection);
          }
        }
      } catch (error) {
        console.error('Error parsing drag data:', error);
      }
    }
  };
  
  // Prevent default behavior to allow drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Filter top-level elements (not in any section)
  const rootElements = elements.filter(el => el.sectionId === null);
  // Filter top-level sections (not nested in any other section)
  const rootSections = sections.filter(sec => sec.parentId === null);
  
  // Get all child sections for a parent section
  const getChildSections = (parentId: string) => {
    return sections.filter(sec => sec.parentId === parentId);
  };
  
  // Change canvas zoom level
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const scale = parseFloat(e.target.value);
    setCanvasScale(scale);
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Canvas controls */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Zoom:</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={canvasScale}
              onChange={handleZoomChange}
              className="w-24 h-2"
            />
            <span className="text-sm">{Math.round(canvasScale * 100)}%</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1 text-sm text-gray-500">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={() => setShowGrid(!showGrid)}
                className="rounded text-primary"
              />
              <span>Grid</span>
            </label>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          <span>Email Editor</span>
        </div>
      </div>
      
      {/* Canvas area */}
      <div className="flex-1 overflow-auto p-8 bg-gray-100">
        <div 
          ref={canvasRef}
          className={cn(
            "relative mx-auto bg-white shadow-md transition-transform origin-top w-[600px] min-h-[800px]",
            { "bg-grid": showGrid }
          )}
          style={{ 
            transform: `scale(${canvasScale})`,
            height: '800px',
            backgroundSize: '20px 20px',
            backgroundImage: showGrid ? 'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)' : 'none',
          }}
          onClick={handleCanvasClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* Render top-level elements */}
          {rootElements.map(element => (
            <Element key={element.id} element={element} />
          ))}
          
          {/* Render top-level sections */}
          {rootSections.map(section => {
            const sectionElements = elements.filter(el => el.sectionId === section.id);
            const childSections = getChildSections(section.id);
            
            return (
              <Section 
                key={section.id}
                section={section}
                elements={sectionElements}
                nestedSections={childSections}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Canvas;

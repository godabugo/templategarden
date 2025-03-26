
import React, { useState, useRef, useEffect } from 'react';
import { useEditor, ElementData, SectionData } from '@/context/EditorContext';
import Section from './Section';
import Element from './Element';
import { cn } from '@/lib/utils';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const Canvas: React.FC = () => {
  const { 
    elements, 
    sections, 
    selectElement, 
    selectSection, 
    addElement, 
    addSection,
    updateElement
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

  // Find section at drop coordinates
  const findSectionAtCoordinates = (x: number, y: number) => {
    // Check in reverse order to get the topmost section (higher z-index)
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (
        x >= section.position.x && 
        x <= section.position.x + section.width &&
        y >= section.position.y && 
        y <= section.position.y + section.height
      ) {
        return section;
      }
    }
    return null;
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
          const canvasX = (e.clientX - rect.left) / canvasScale;
          const canvasY = (e.clientY - rect.top) / canvasScale;
          
          // Check if dropped onto a section
          const droppedSection = findSectionAtCoordinates(canvasX, canvasY);
          
          if (data.type === 'element') {
            // Add a new element
            const newElement: Omit<ElementData, 'id'> = {
              type: data.elementType,
              content: data.defaultContent || '',
              position: { 
                x: droppedSection ? canvasX - droppedSection.position.x : canvasX, 
                y: droppedSection ? canvasY - droppedSection.position.y : canvasY 
              },
              width: data.defaultWidth || 200,
              height: data.defaultHeight || 50,
              style: data.defaultStyle || {},
              sectionId: droppedSection ? droppedSection.id : null,
            };
            
            addElement(newElement);
          } else if (data.type === 'section') {
            // Add a new section
            const newSection: Omit<SectionData, 'id'> = {
              name: data.sectionName || 'New Section',
              position: { x: canvasX, y: canvasY },
              width: data.defaultWidth || 400,
              height: data.defaultHeight || 200,
              style: data.defaultStyle || { backgroundColor: '#ffffff' },
              parentId: droppedSection ? droppedSection.id : null,
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
  
  // Export email template as HTML
  const exportAsHtml = () => {
    try {
      // Create a basic HTML email template structure
      let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    .container { width: 600px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
`;

      // Process top-level sections first
      const rootSections = sections.filter(sec => sec.parentId === null);
      
      // Function to process sections recursively
      const processSections = (sectionsList: SectionData[], parentHtml: string = ''): string => {
        let html = parentHtml;
        
        sectionsList.forEach(section => {
          // Start section div with styles
          html += `<div style="position: relative; width: ${section.width}px; height: ${section.height}px; `;
          
          // Add custom styles
          if (section.style) {
            Object.entries(section.style).forEach(([key, value]) => {
              if (value) {
                // Convert camelCase to kebab-case for CSS properties
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                html += `${cssKey}: ${value}; `;
              }
            });
          }
          
          html += '">\n';
          
          // Add elements that belong to this section
          const sectionElements = elements.filter(el => el.sectionId === section.id);
          sectionElements.forEach(element => {
            html += processElement(element);
          });
          
          // Process nested sections recursively
          const childSections = sections.filter(sec => sec.parentId === section.id);
          if (childSections.length > 0) {
            html = processSections(childSections, html);
          }
          
          // Close section div
          html += '</div>\n';
        });
        
        return html;
      };
      
      // Function to process individual elements
      const processElement = (element: ElementData): string => {
        let elementHtml = `<div style="position: absolute; left: ${element.position.x}px; top: ${element.position.y}px; width: ${element.width}px; height: ${element.height}px; `;
        
        // Add custom styles
        if (element.style) {
          Object.entries(element.style).forEach(([key, value]) => {
            if (value) {
              // Convert camelCase to kebab-case for CSS properties
              const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
              elementHtml += `${cssKey}: ${value}; `;
            }
          });
        }
        
        elementHtml += '">\n';
        
        // Render different element types
        switch (element.type) {
          case 'text':
            elementHtml += element.content;
            break;
          case 'image':
            elementHtml += `<img src="${element.content || 'https://via.placeholder.com/150'}" alt="Email content" style="width: 100%; height: 100%; object-fit: contain;" />`;
            break;
          case 'button':
            elementHtml += `<a href="#" style="display: inline-block; width: 100%; height: 100%; text-align: center; line-height: ${element.height}px; text-decoration: none;">${element.content}</a>`;
            break;
          case 'divider':
            elementHtml += `<hr style="width: 100%; border-top: 1px solid #ccc;" />`;
            break;
          case 'spacer':
            // Spacer is just empty space
            break;
          default:
            elementHtml += element.content;
        }
        
        elementHtml += '</div>\n';
        return elementHtml;
      };
      
      // Process top-level elements (not in any section)
      const rootElements = elements.filter(el => el.sectionId === null);
      rootElements.forEach(element => {
        htmlContent += processElement(element);
      });
      
      // Process sections and their nested elements
      htmlContent += processSections(rootSections);
      
      // Close the HTML structure
      htmlContent += `
  </div>
</body>
</html>`;
      
      // Create a blob and download link
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email-template.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('HTML template downloaded successfully');
    } catch (error) {
      console.error('Error exporting HTML:', error);
      toast.error('Failed to export HTML template');
    }
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
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={exportAsHtml}
          className="flex items-center gap-1"
        >
          <Download className="w-4 h-4" />
          <span>Export HTML</span>
        </Button>
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

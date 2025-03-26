
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Type, 
  Image, 
  Square, 
  Minus, 
  Maximize,
  Layout,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ElementType } from '@/context/EditorContext';
import { cn } from '@/lib/utils';

interface ElementLibraryProps {
  className?: string;
}

interface ElementItem {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
  defaultContent: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultStyle: Record<string, string>;
}

interface SectionItem {
  name: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultStyle: Record<string, string>;
}

const ElementLibrary: React.FC<ElementLibraryProps> = ({ className }) => {
  const [openCategories, setOpenCategories] = useState({
    elements: true,
    sections: true,
  });
  
  const elements: ElementItem[] = [
    {
      type: 'text',
      label: 'Text',
      icon: <Type className="w-4 h-4" />,
      defaultContent: 'Add your text here',
      defaultWidth: 200,
      defaultHeight: 40,
      defaultStyle: {
        color: '#000000',
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'left',
      },
    },
    {
      type: 'image',
      label: 'Image',
      icon: <Image className="w-4 h-4" />,
      defaultContent: 'https://via.placeholder.com/200x100',
      defaultWidth: 200,
      defaultHeight: 100,
      defaultStyle: {
        objectFit: 'contain',
      },
    },
    {
      type: 'button',
      label: 'Button',
      icon: <Square className="w-4 h-4" />,
      defaultContent: 'Click Me',
      defaultWidth: 120,
      defaultHeight: 40,
      defaultStyle: {
        backgroundColor: '#007bff',
        color: '#ffffff',
        borderRadius: '4px',
        textAlign: 'center',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    {
      type: 'divider',
      label: 'Divider',
      icon: <Minus className="w-4 h-4" />,
      defaultContent: '',
      defaultWidth: 200,
      defaultHeight: 2,
      defaultStyle: {
        backgroundColor: '#cccccc',
      },
    },
    {
      type: 'spacer',
      label: 'Spacer',
      icon: <Maximize className="w-4 h-4" />,
      defaultContent: '',
      defaultWidth: 200,
      defaultHeight: 20,
      defaultStyle: {
        backgroundColor: 'transparent',
      },
    },
  ];
  
  const sections: SectionItem[] = [
    {
      name: 'Standard Section',
      defaultWidth: 500,
      defaultHeight: 200,
      defaultStyle: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '10px',
      },
    },
    {
      name: 'Header Section',
      defaultWidth: 500,
      defaultHeight: 100,
      defaultStyle: {
        backgroundColor: '#f8f9fa',
        borderRadius: '8px 8px 0 0',
        padding: '10px',
      },
    },
    {
      name: 'Footer Section',
      defaultWidth: 500,
      defaultHeight: 100,
      defaultStyle: {
        backgroundColor: '#f8f9fa',
        borderRadius: '0 0 8px 8px',
        padding: '10px',
      },
    },
  ];
  
  const handleDragStart = (e: React.DragEvent, type: 'element' | 'section', item: ElementItem | SectionItem) => {
    let dragData;
    
    if (type === 'element') {
      dragData = {
        type: 'element',
        elementType: (item as ElementItem).type,
        defaultContent: (item as ElementItem).defaultContent,
        defaultWidth: (item as ElementItem).defaultWidth,
        defaultHeight: (item as ElementItem).defaultHeight,
        defaultStyle: (item as ElementItem).defaultStyle,
      };
    } else {
      dragData = {
        type: 'section',
        sectionName: (item as SectionItem).name,
        defaultWidth: (item as SectionItem).defaultWidth,
        defaultHeight: (item as SectionItem).defaultHeight,
        defaultStyle: (item as SectionItem).defaultStyle,
      };
    }
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  const toggleCategory = (category: 'elements' | 'sections') => {
    setOpenCategories({
      ...openCategories,
      [category]: !openCategories[category],
    });
  };
  
  return (
    <div className={cn("p-4 h-full overflow-y-auto scrollbar-thin", className)}>
      <h3 className="text-sm font-medium mb-4">Elements</h3>
      
      {/* Elements Category */}
      <Collapsible
        open={openCategories.elements}
        className="mb-4"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-between p-2 h-auto text-sm mb-2"
            onClick={() => toggleCategory('elements')}
          >
            <div className="flex items-center">
              <Layout className="h-4 w-4 mr-2" />
              <span>Basic Elements</span>
            </div>
            {openCategories.elements ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-2 gap-2 animate-fade-in">
            {elements.map((item) => (
              <div
                key={item.type}
                className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md bg-white hover:border-primary/30 hover:bg-primary/5 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'element', item)}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 mb-2">
                  {item.icon}
                </div>
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Sections Category */}
      <Collapsible
        open={openCategories.sections}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-between p-2 h-auto text-sm mb-2"
            onClick={() => toggleCategory('sections')}
          >
            <div className="flex items-center">
              <Layout className="h-4 w-4 mr-2" />
              <span>Sections</span>
            </div>
            {openCategories.sections ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-2 animate-fade-in">
            {sections.map((item, index) => (
              <div
                key={index}
                className="flex items-center p-3 border border-gray-200 rounded-md bg-white hover:border-primary/30 hover:bg-primary/5 cursor-grab"
                draggable
                onDragStart={(e) => handleDragStart(e, 'section', item)}
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 mr-3">
                  <Layout className="w-4 h-4" />
                </div>
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      <div className="text-xs text-center text-gray-400 mt-8">
        <p>Drag and drop elements onto the canvas</p>
      </div>
    </div>
  );
};

export default ElementLibrary;

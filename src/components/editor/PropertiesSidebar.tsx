
import React from 'react';
import { useEditor, ElementType } from '@/context/EditorContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash,
  Type,
  Image,
  Square,
  MousePointer
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PropertiesSidebar: React.FC = () => {
  const { 
    elements, 
    sections, 
    selectedElementId, 
    selectedSectionId, 
    updateElement, 
    updateSection, 
    removeElement, 
    removeSection,
  } = useEditor();
  
  const selectedElement = selectedElementId ? elements.find(el => el.id === selectedElementId) : null;
  const selectedSection = selectedSectionId ? sections.find(sec => sec.id === selectedSectionId) : null;
  
  if (!selectedElement && !selectedSection) {
    return (
      <div className="p-4 text-center text-gray-400 h-full flex flex-col items-center justify-center">
        <MousePointer className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-sm">Select an element or section to edit its properties</p>
      </div>
    );
  }
  
  const getElementIcon = (type: ElementType) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'button':
        return <Square className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };
  
  // Element properties panel
  const renderElementProperties = () => {
    if (!selectedElement) return null;
    
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {getElementIcon(selectedElement.type)}
            <span className="ml-2 font-medium">{selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => removeElement(selectedElement.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
            <TabsTrigger value="size" className="flex-1">Size</TabsTrigger>
            <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="style" className="pt-4">
            {/* Text styling (for text and button elements) */}
            {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
              <>
                <div className="grid gap-2 mb-4">
                  <Label htmlFor="color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={selectedElement.style.color || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        style: { ...selectedElement.style, color: e.target.value } 
                      })}
                      className="w-10 h-10 p-1"
                    />
                    <Input
                      value={selectedElement.style.color || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        style: { ...selectedElement.style, color: e.target.value } 
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2 mb-4">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="fontSize"
                      defaultValue={[parseInt(selectedElement.style.fontSize || '16')]}
                      min={8}
                      max={72}
                      step={1}
                      onValueChange={(value) => updateElement(selectedElement.id, { 
                        style: { ...selectedElement.style, fontSize: `${value[0]}px` } 
                      })}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">
                      {parseInt(selectedElement.style.fontSize || '16')}px
                    </span>
                  </div>
                </div>
                
                <div className="grid gap-2 mb-4">
                  <Label>Font Style</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn({
                        'bg-accent': selectedElement.style.fontWeight === 'bold'
                      })}
                      onClick={() => updateElement(selectedElement.id, { 
                        style: { 
                          ...selectedElement.style, 
                          fontWeight: selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold' 
                        } 
                      })}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn({
                        'bg-accent': selectedElement.style.fontStyle === 'italic'
                      })}
                      onClick={() => updateElement(selectedElement.id, { 
                        style: { 
                          ...selectedElement.style, 
                          fontStyle: selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic' 
                        } 
                      })}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-2 mb-4">
                  <Label>Text Alignment</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn({
                        'bg-accent': selectedElement.style.textAlign === 'left'
                      })}
                      onClick={() => updateElement(selectedElement.id, { 
                        style: { ...selectedElement.style, textAlign: 'left' } 
                      })}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn({
                        'bg-accent': selectedElement.style.textAlign === 'center'
                      })}
                      onClick={() => updateElement(selectedElement.id, { 
                        style: { ...selectedElement.style, textAlign: 'center' } 
                      })}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn({
                        'bg-accent': selectedElement.style.textAlign === 'right'
                      })}
                      onClick={() => updateElement(selectedElement.id, { 
                        style: { ...selectedElement.style, textAlign: 'right' } 
                      })}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {/* Background color (for all elements) */}
            <div className="grid gap-2 mb-4">
              <Label htmlFor="bgColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="bgColor"
                  type="color"
                  value={selectedElement.style.backgroundColor || '#ffffff'}
                  onChange={(e) => updateElement(selectedElement.id, { 
                    style: { ...selectedElement.style, backgroundColor: e.target.value } 
                  })}
                  className="w-10 h-10 p-1"
                />
                <Input
                  value={selectedElement.style.backgroundColor || '#ffffff'}
                  onChange={(e) => updateElement(selectedElement.id, { 
                    style: { ...selectedElement.style, backgroundColor: e.target.value } 
                  })}
                  className="flex-1"
                />
              </div>
            </div>
            
            {/* Border properties */}
            <div className="grid gap-2 mb-4">
              <Label htmlFor="borderRadius">Border Radius</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="borderRadius"
                  defaultValue={[parseInt(selectedElement.style.borderRadius || '0')]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={(value) => updateElement(selectedElement.id, { 
                    style: { ...selectedElement.style, borderRadius: `${value[0]}px` } 
                  })}
                  className="flex-1"
                />
                <span className="w-12 text-right">
                  {parseInt(selectedElement.style.borderRadius || '0')}px
                </span>
              </div>
            </div>
            
            <div className="grid gap-2 mb-4">
              <Label htmlFor="borderWidth">Border Width</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="borderWidth"
                  defaultValue={[parseInt(selectedElement.style.borderWidth || '0')]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(value) => updateElement(selectedElement.id, { 
                    style: { ...selectedElement.style, borderWidth: `${value[0]}px` } 
                  })}
                  className="flex-1"
                />
                <span className="w-12 text-right">
                  {parseInt(selectedElement.style.borderWidth || '0')}px
                </span>
              </div>
            </div>
            
            {parseInt(selectedElement.style.borderWidth || '0') > 0 && (
              <div className="grid gap-2 mb-4">
                <Label htmlFor="borderColor">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="borderColor"
                    type="color"
                    value={selectedElement.style.borderColor || '#000000'}
                    onChange={(e) => updateElement(selectedElement.id, { 
                      style: { ...selectedElement.style, borderColor: e.target.value } 
                    })}
                    className="w-10 h-10 p-1"
                  />
                  <Input
                    value={selectedElement.style.borderColor || '#000000'}
                    onChange={(e) => updateElement(selectedElement.id, { 
                      style: { ...selectedElement.style, borderColor: e.target.value } 
                    })}
                    className="flex-1"
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="size" className="pt-4">
            <div className="grid gap-2 mb-4">
              <Label htmlFor="width">Width</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="width"
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) => updateElement(selectedElement.id, { 
                    width: parseInt(e.target.value) || 0 
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
            
            <div className="grid gap-2 mb-4">
              <Label htmlFor="height">Height</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="height"
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) => updateElement(selectedElement.id, { 
                    height: parseInt(e.target.value) || 0 
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
            
            <div className="grid gap-2 mb-4">
              <Label htmlFor="padding">Padding</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="padding"
                  defaultValue={[parseInt(selectedElement.style.padding || '0')]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={(value) => updateElement(selectedElement.id, { 
                    style: { ...selectedElement.style, padding: `${value[0]}px` } 
                  })}
                  className="flex-1"
                />
                <span className="w-12 text-right">
                  {parseInt(selectedElement.style.padding || '0')}px
                </span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="posX">Position X</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="posX"
                  type="number"
                  value={selectedElement.position.x}
                  onChange={(e) => updateElement(selectedElement.id, { 
                    position: { ...selectedElement.position, x: parseInt(e.target.value) || 0 } 
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
            
            <div className="grid gap-2 mt-4">
              <Label htmlFor="posY">Position Y</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="posY"
                  type="number"
                  value={selectedElement.position.y}
                  onChange={(e) => updateElement(selectedElement.id, { 
                    position: { ...selectedElement.position, y: parseInt(e.target.value) || 0 } 
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="pt-4">
            {selectedElement.type === 'text' || selectedElement.type === 'button' ? (
              <div className="grid gap-2">
                <Label htmlFor="content">Text Content</Label>
                <Input
                  id="content"
                  value={selectedElement.content}
                  onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                  className="flex-1"
                />
              </div>
            ) : selectedElement.type === 'image' ? (
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={selectedElement.content}
                  onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                  className="flex-1"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the URL of the image you want to display
                </p>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  // Section properties panel
  const renderSectionProperties = () => {
    if (!selectedSection) return null;
    
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Square className="w-4 h-4" />
            <span className="ml-2 font-medium">Section</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => removeSection(selectedSection.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid gap-2 mb-4">
          <Label htmlFor="sectionName">Section Name</Label>
          <Input
            id="sectionName"
            value={selectedSection.name}
            onChange={(e) => updateSection(selectedSection.id, { name: e.target.value })}
            className="flex-1"
          />
        </div>
        
        <Tabs defaultValue="style" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
            <TabsTrigger value="size" className="flex-1">Size</TabsTrigger>
          </TabsList>
          
          <TabsContent value="style" className="pt-4">
            <div className="grid gap-2 mb-4">
              <Label htmlFor="bgColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="bgColor"
                  type="color"
                  value={selectedSection.style.backgroundColor || '#ffffff'}
                  onChange={(e) => updateSection(selectedSection.id, { 
                    style: { ...selectedSection.style, backgroundColor: e.target.value } 
                  })}
                  className="w-10 h-10 p-1"
                />
                <Input
                  value={selectedSection.style.backgroundColor || '#ffffff'}
                  onChange={(e) => updateSection(selectedSection.id, { 
                    style: { ...selectedSection.style, backgroundColor: e.target.value } 
                  })}
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="grid gap-2 mb-4">
              <Label htmlFor="borderRadius">Border Radius</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="borderRadius"
                  defaultValue={[parseInt(selectedSection.style.borderRadius || '0')]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={(value) => updateSection(selectedSection.id, { 
                    style: { ...selectedSection.style, borderRadius: `${value[0]}px` } 
                  })}
                  className="flex-1"
                />
                <span className="w-12 text-right">
                  {parseInt(selectedSection.style.borderRadius || '0')}px
                </span>
              </div>
            </div>
            
            <div className="grid gap-2 mb-4">
              <Label htmlFor="borderWidth">Border Width</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="borderWidth"
                  defaultValue={[parseInt(selectedSection.style.borderWidth || '0')]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(value) => updateSection(selectedSection.id, { 
                    style: { ...selectedSection.style, borderWidth: `${value[0]}px` } 
                  })}
                  className="flex-1"
                />
                <span className="w-12 text-right">
                  {parseInt(selectedSection.style.borderWidth || '0')}px
                </span>
              </div>
            </div>
            
            {parseInt(selectedSection.style.borderWidth || '0') > 0 && (
              <div className="grid gap-2 mb-4">
                <Label htmlFor="borderColor">Border Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="borderColor"
                    type="color"
                    value={selectedSection.style.borderColor || '#000000'}
                    onChange={(e) => updateSection(selectedSection.id, { 
                      style: { ...selectedSection.style, borderColor: e.target.value } 
                    })}
                    className="w-10 h-10 p-1"
                  />
                  <Input
                    value={selectedSection.style.borderColor || '#000000'}
                    onChange={(e) => updateSection(selectedSection.id, { 
                      style: { ...selectedSection.style, borderColor: e.target.value } 
                    })}
                    className="flex-1"
                  />
                </div>
              </div>
            )}
            
            <div className="grid gap-2 mb-4">
              <Label htmlFor="padding">Padding</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="padding"
                  defaultValue={[parseInt(selectedSection.style.padding || '0')]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={(value) => updateSection(selectedSection.id, { 
                    style: { ...selectedSection.style, padding: `${value[0]}px` } 
                  })}
                  className="flex-1"
                />
                <span className="w-12 text-right">
                  {parseInt(selectedSection.style.padding || '0')}px
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="size" className="pt-4">
            <div className="grid gap-2 mb-4">
              <Label htmlFor="width">Width</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="width"
                  type="number"
                  value={selectedSection.width}
                  onChange={(e) => updateSection(selectedSection.id, { 
                    width: parseInt(e.target.value) || 0 
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
            
            <div className="grid gap-2 mb-4">
              <Label htmlFor="height">Height</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="height"
                  type="number"
                  value={selectedSection.height}
                  onChange={(e) => updateSection(selectedSection.id, { 
                    height: parseInt(e.target.value) || 0 
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="posX">Position X</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="posX"
                  type="number"
                  value={selectedSection.position.x}
                  onChange={(e) => updateSection(selectedSection.id, { 
                    position: { ...selectedSection.position, x: parseInt(e.target.value) || 0 } 
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
            
            <div className="grid gap-2 mt-4">
              <Label htmlFor="posY">Position Y</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="posY"
                  type="number"
                  value={selectedSection.position.y}
                  onChange={(e) => updateSection(selectedSection.id, { 
                    position: { ...selectedSection.position, y: parseInt(e.target.value) || 0 } 
                  })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4">
      {selectedElement ? renderElementProperties() : renderSectionProperties()}
    </div>
  );
};

export default PropertiesSidebar;

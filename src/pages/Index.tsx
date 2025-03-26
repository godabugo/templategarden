
import React from 'react';
import Canvas from '@/components/editor/Canvas';
import ElementLibrary from '@/components/editor/ElementLibrary';
import PropertiesSidebar from '@/components/editor/PropertiesSidebar';
import Toolbar from '@/components/editor/Toolbar';
import ResizablePanel from '@/components/ui/ResizablePanel';
import { EditorProvider } from '@/context/EditorContext';

const Index = () => {
  return (
    <EditorProvider>
      <div className="h-screen w-full flex flex-col bg-background overflow-hidden">
        <Toolbar />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Element Library */}
          <ResizablePanel
            direction="horizontal"
            side="right"
            defaultSize={250}
            minSize={200}
            maxSize={400}
            className="bg-white border-r"
          >
            <ElementLibrary />
          </ResizablePanel>
          
          {/* Main Canvas Area */}
          <div className="flex-1 overflow-hidden">
            <Canvas />
          </div>
          
          {/* Right Sidebar - Properties */}
          <ResizablePanel
            direction="horizontal"
            side="left"
            defaultSize={300}
            minSize={250}
            maxSize={450}
            className="bg-white border-l"
          >
            <PropertiesSidebar />
          </ResizablePanel>
        </div>
      </div>
    </EditorProvider>
  );
};

export default Index;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Save,
  Loader,
  Download,
  Plus,
  FileText,
  CheckCircle
} from 'lucide-react';
import { useEditor } from '@/context/EditorContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const Toolbar: React.FC = () => {
  const { 
    saveTemplate, 
    loadTemplate, 
    templates, 
    activeTemplate,
    createNewTemplate
  } = useEditor();
  
  const [templateName, setTemplateName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const handleSaveTemplate = () => {
    saveTemplate(templateName || undefined);
    setTemplateName('');
  };
  
  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast.success("Email template exported successfully");
    }, 1500);
  };
  
  return (
    <div className="flex items-center justify-between p-2 border-b bg-white">
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          onClick={createNewTemplate}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New</span>
        </Button>
        
        {/* Save Template Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Save Template</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="name"
                  placeholder={activeTemplate?.name || "My Email Template"}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button 
                  type="button" 
                  onClick={handleSaveTemplate}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Template
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Load Template Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Load</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Load Template</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {templates.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No saved templates found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {templates.map((template) => (
                    <DialogClose asChild key={template.id}>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => loadTemplate(template.id)}
                      >
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {template.name}
                        </div>
                        {activeTemplate?.id === template.id && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </Button>
                    </DialogClose>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="text-lg font-medium">Email Editor</div>
      
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-1"
        >
          {isExporting ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isExporting ? "Exporting..." : "Export"}</span>
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;

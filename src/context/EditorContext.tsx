
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";

export type ElementType = "text" | "image" | "button" | "divider" | "spacer";

interface Position {
  x: number;
  y: number;
}

export interface ElementData {
  id: string;
  type: ElementType;
  content: string;
  position: Position;
  width: number;
  height: number;
  style: {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontFamily?: string;
    textAlign?: "left" | "center" | "right";
    fontWeight?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    borderStyle?: string;
    [key: string]: string | undefined;
  };
  sectionId: string | null;
}

export interface SectionData {
  id: string;
  name: string;
  position: Position;
  width: number;
  height: number;
  style: {
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    borderStyle?: string;
    [key: string]: string | undefined;
  };
  parentId: string | null;
}

export interface Template {
  id: string;
  name: string;
  elements: ElementData[];
  sections: SectionData[];
  createdAt: Date;
  updatedAt: Date;
}

interface EditorContextType {
  elements: ElementData[];
  sections: SectionData[];
  selectedElementId: string | null;
  selectedSectionId: string | null;
  activeTemplate: Template | null;
  templates: Template[];
  addElement: (element: Omit<ElementData, "id">) => void;
  updateElement: (id: string, data: Partial<ElementData>) => void;
  removeElement: (id: string) => void;
  addSection: (section: Omit<SectionData, "id">) => void;
  updateSection: (id: string, data: Partial<SectionData>) => void;
  removeSection: (id: string) => void;
  selectElement: (id: string | null) => void;
  selectSection: (id: string | null) => void;
  saveTemplate: (name?: string) => void;
  loadTemplate: (id: string) => void;
  createNewTemplate: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
};

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [elements, setElements] = useState<ElementData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);

  const addElement = useCallback((element: Omit<ElementData, "id">) => {
    const newElement: ElementData = {
      ...element,
      id: `el-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    setElements((prev) => [...prev, newElement]);
  }, []);

  const updateElement = useCallback((id: string, data: Partial<ElementData>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...data } : el))
    );
  }, []);

  const removeElement = useCallback((id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  }, [selectedElementId]);

  const addSection = useCallback((section: Omit<SectionData, "id">) => {
    const newSection: SectionData = {
      ...section,
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    setSections((prev) => [...prev, newSection]);
  }, []);

  const updateSection = useCallback((id: string, data: Partial<SectionData>) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, ...data } : sec))
    );
  }, []);

  const removeSection = useCallback((id: string) => {
    // First, check if there are any elements in this section
    const elementsInSection = elements.filter((el) => el.sectionId === id);
    
    // Move elements to parent section or to null if no parent
    const sectionToRemove = sections.find((sec) => sec.id === id);
    if (sectionToRemove) {
      const parentId = sectionToRemove.parentId;
      
      setElements((prev) =>
        prev.map((el) => 
          el.sectionId === id ? { ...el, sectionId: parentId } : el
        )
      );
    }
    
    // Remove any nested sections (and their elements) recursively
    const childSections = sections.filter((sec) => sec.parentId === id);
    childSections.forEach((child) => removeSection(child.id));
    
    // Finally remove the section itself
    setSections((prev) => prev.filter((sec) => sec.id !== id));
    
    if (selectedSectionId === id) {
      setSelectedSectionId(null);
    }
  }, [elements, sections, selectedSectionId]);

  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
    if (id !== null) {
      setSelectedSectionId(null);
    }
  }, []);

  const selectSection = useCallback((id: string | null) => {
    setSelectedSectionId(id);
    if (id !== null) {
      setSelectedElementId(null);
    }
  }, []);

  const saveTemplate = useCallback((name?: string) => {
    const now = new Date();
    
    if (activeTemplate) {
      // Update existing template
      const updatedTemplate: Template = {
        ...activeTemplate,
        name: name || activeTemplate.name,
        elements: [...elements],
        sections: [...sections],
        updatedAt: now,
      };
      
      setActiveTemplate(updatedTemplate);
      setTemplates((prev) =>
        prev.map((tmpl) => (tmpl.id === updatedTemplate.id ? updatedTemplate : tmpl))
      );
      
      toast.success("Template saved successfully");
    } else {
      // Create new template
      const templateName = name || `Template ${templates.length + 1}`;
      const newTemplate: Template = {
        id: `tmpl-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: templateName,
        elements: [...elements],
        sections: [...sections],
        createdAt: now,
        updatedAt: now,
      };
      
      setActiveTemplate(newTemplate);
      setTemplates((prev) => [...prev, newTemplate]);
      
      toast.success(`Template "${templateName}" created`);
    }
  }, [activeTemplate, elements, sections, templates]);

  const loadTemplate = useCallback((id: string) => {
    const template = templates.find((tmpl) => tmpl.id === id);
    if (template) {
      setElements(template.elements);
      setSections(template.sections);
      setActiveTemplate(template);
      setSelectedElementId(null);
      setSelectedSectionId(null);
      toast.success(`Template "${template.name}" loaded`);
    }
  }, [templates]);

  const createNewTemplate = useCallback(() => {
    setElements([]);
    setSections([]);
    setActiveTemplate(null);
    setSelectedElementId(null);
    setSelectedSectionId(null);
    toast.success("New template created");
  }, []);

  return (
    <EditorContext.Provider
      value={{
        elements,
        sections,
        selectedElementId,
        selectedSectionId,
        activeTemplate,
        templates,
        addElement,
        updateElement,
        removeElement,
        addSection,
        updateSection,
        removeSection,
        selectElement,
        selectSection,
        saveTemplate,
        loadTemplate,
        createNewTemplate,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

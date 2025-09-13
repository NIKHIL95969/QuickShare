"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ContentItem {
  id: string;
  content: string;
  createdAt: string;
  temp: boolean;
}

interface ContentContextType {
  // Permanent content state (for /code page)
  permanentContent: ContentItem[];
  permanentTotal: number;
  setPermanentContent: (content: ContentItem[]) => void;
  setPermanentTotal: (total: number) => void;
  addPermanentContent: (newContent: ContentItem) => void;
  
  // Temporary content state (for /temp page)
  temporaryContent: ContentItem[];
  temporaryTotal: number;
  setTemporaryContent: (content: ContentItem[]) => void;
  setTemporaryTotal: (total: number) => void;
  addTemporaryContent: (newContent: ContentItem) => void;
  
  // Global method for ShareContentDialog
  addNewContent: (newContent: ContentItem) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  // Permanent content state
  const [permanentContent, setPermanentContent] = useState<ContentItem[]>([]);
  const [permanentTotal, setPermanentTotal] = useState(0);
  
  // Temporary content state
  const [temporaryContent, setTemporaryContent] = useState<ContentItem[]>([]);
  const [temporaryTotal, setTemporaryTotal] = useState(0);

  // Add permanent content
  const addPermanentContent = useCallback((newContent: ContentItem) => {
    setPermanentContent(prevContent => [newContent, ...prevContent]);
    setPermanentTotal(prevTotal => prevTotal + 1);
  }, []);

  // Add temporary content
  const addTemporaryContent = useCallback((newContent: ContentItem) => {
    setTemporaryContent(prevContent => [newContent, ...prevContent]);
    setTemporaryTotal(prevTotal => prevTotal + 1);
  }, []);

  // Global method to add new content based on type
  const addNewContent = useCallback((newContent: ContentItem) => {
    if (!newContent.temp) {
      addPermanentContent(newContent);
    } else {
      addTemporaryContent(newContent);
    }
  }, [addPermanentContent, addTemporaryContent]);

  const value: ContentContextType = {
    permanentContent,
    permanentTotal,
    setPermanentContent,
    setPermanentTotal,
    addPermanentContent,
    temporaryContent,
    temporaryTotal,
    setTemporaryContent,
    setTemporaryTotal,
    addTemporaryContent,
    addNewContent,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

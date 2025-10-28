import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DropdownContextType {
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  closeAllDropdowns: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export function DropdownProvider({ children }: { children: ReactNode }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
  };

  const handleSetOpenDropdown = (id: string | null) => {
    setOpenDropdown(id);
  };

  return (
    <DropdownContext.Provider value={{
      openDropdown,
      setOpenDropdown: handleSetOpenDropdown,
      closeAllDropdowns
    }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdown() {
  const context = useContext(DropdownContext);
  if (context === undefined) {
    throw new Error('useDropdown must be used within a DropdownProvider');
  }
  return context;
}

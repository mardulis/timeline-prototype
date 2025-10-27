import React, { createContext, useContext, useState, useMemo } from 'react';
import { Doc, ViewMode } from '../../types/Timeline';

export interface SearchFilters {
  date?: {
    start?: string;
    end?: string;
    operator?: string;
    createdAt?: number; // Timestamp when this filter was created
  };
  docType?: {
    values?: string[];
    operator?: string;
  };
  medical?: {
    medications?: string[];
    diagnoses?: string[];
    labs?: string[];
    createdAt?: number; // Timestamp when this filter was created
  };
  author?: {
    values?: string[];
    operator?: string;
  };
  facility?: {
    values?: string[];
    operator?: string;
  };
  // Individual medication/diagnosis/lab filters (separate from Medical Entity)
  medications?: {
    values?: string[];
    operator?: string;
  };
  diagnoses?: {
    values?: string[];
    operator?: string;
  };
  labs?: {
    values?: string[];
    operator?: string;
  };
  flagged?: boolean;
  // Global creation order tracking
  creationOrder?: string[]; // Array of filter keys in creation order
}

export interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  results: Doc[];
  allDocs: Doc[]; // Original unfiltered documents
  clearFilters: () => void;
  viewMode: ViewMode; // Current view mode for search
}

const SearchContext = createContext<SearchContextType | null>(null);

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
}

export function SearchProvider({ docs, viewMode = 'titles', children }: { 
  docs: Doc[]; 
  viewMode?: ViewMode;
  children: React.ReactNode 
}) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const results = useMemo(() => {
    return applyFilters(docs, query, filters, viewMode);
  }, [docs, query, filters, viewMode]);
  
  const clearFilters = () => {
    setQuery('');
    setFilters({});
  };
  
  return (
    <SearchContext.Provider value={{
      query,
      setQuery,
      filters,
      setFilters,
      results,
      allDocs: docs, // Expose original unfiltered documents
      clearFilters,
      viewMode
    }}>
      {children}
    </SearchContext.Provider>
  );
}

function applyFilters(docs: Doc[], query: string, filters: SearchFilters, viewMode: ViewMode = 'titles'): Doc[] {
  let filtered = docs;
  
  // Apply text search based on viewMode
  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    filtered = filtered.filter(doc => {
      switch (viewMode) {
        case 'titles':
          // Search in title, author, and facility
          return doc.title.toLowerCase().includes(searchTerm) ||
                 doc.author?.toLowerCase().includes(searchTerm) ||
                 doc.facility?.toLowerCase().includes(searchTerm);
        
        case 'medications':
          // Search in medications array
          return doc.medications?.some(med => 
            med.toLowerCase().includes(searchTerm)
          ) || false;
        
        case 'diagnosis':
          // Search in diagnoses array
          return doc.diagnoses?.some(diag => 
            diag.toLowerCase().includes(searchTerm)
          ) || false;
        
        case 'labs':
          // Search in labs array
          return doc.labs?.some(lab => 
            lab.toLowerCase().includes(searchTerm)
          ) || false;
        
        default:
          return doc.title.toLowerCase().includes(searchTerm);
      }
    });
  }
  
  // Apply date filter with operators
  if (filters.date?.start || filters.date?.end) {
    filtered = filtered.filter(doc => {
      const docDate = new Date(doc.date);
      const startDate = filters.date?.start ? new Date(filters.date.start) : null;
      const endDate = filters.date?.end ? new Date(filters.date.end) : null;
      const operator = filters.date?.operator || 'is';
      
      switch (operator) {
        case 'is':
          if (startDate) {
            return docDate.toDateString() === startDate.toDateString();
          }
          return true;
        case 'before':
          if (startDate) {
            return docDate < startDate;
          }
          return true;
        case 'after':
          if (startDate) {
            return docDate > startDate;
          }
          return true;
        case 'between':
          if (startDate && endDate) {
            return docDate >= startDate && docDate <= endDate;
          }
          if (startDate) {
            return docDate >= startDate;
          }
          if (endDate) {
            return docDate <= endDate;
          }
          return true;
        default:
          // Default behavior (range)
          if (startDate && docDate < startDate) return false;
          if (endDate && docDate > endDate) return false;
          return true;
      }
    });
  }
  
  // Apply document type filter
  if (filters.docType?.values && filters.docType.values.length > 0) {
    const operator = filters.docType.operator || 'is-any-of';
    filtered = filtered.filter(doc => {
      if (operator === 'is') {
        return filters.docType!.values!.includes(doc.docType);
      } else {
        return filters.docType!.values!.includes(doc.docType);
      }
    });
  }
  
  // Apply author filter
  if (filters.author?.values && filters.author.values.length > 0) {
    const operator = filters.author.operator || 'is-any-of';
    filtered = filtered.filter(doc => {
      if (operator === 'is') {
        return doc.author && filters.author!.values!.includes(doc.author);
      } else {
        return doc.author && filters.author!.values!.includes(doc.author);
      }
    });
  }
  
  // Apply facility filter
  if (filters.facility?.values && filters.facility.values.length > 0) {
    const operator = filters.facility.operator || 'is-any-of';
    filtered = filtered.filter(doc => {
      if (operator === 'is') {
        return doc.facility && filters.facility!.values!.includes(doc.facility);
      } else {
        return doc.facility && filters.facility!.values!.includes(doc.facility);
      }
    });
  }
  
  // Apply flagged filter
  if (filters.flagged !== undefined) {
    filtered = filtered.filter(doc => 
      doc.flagged === filters.flagged
    );
  }
  
  // Apply medical entity filters
  if (filters.medical) {
    filtered = filtered.filter(doc => {
      const { medications, diagnoses, labs } = filters.medical!;
      
      // Check medications
      if (medications && medications.length > 0) {
        const hasMatchingMed = doc.medications?.some(med => 
          medications.some(filterMed => 
            med.toLowerCase().includes(filterMed.toLowerCase())
          )
        );
        if (!hasMatchingMed) return false;
      }
      
      // Check diagnoses
      if (diagnoses && diagnoses.length > 0) {
        const hasMatchingDiag = doc.diagnoses?.some(diag => 
          diagnoses.some(filterDiag => 
            diag.toLowerCase().includes(filterDiag.toLowerCase())
          )
        );
        if (!hasMatchingDiag) return false;
      }
      
      // Check labs
      if (labs && labs.length > 0) {
        const hasMatchingLab = doc.labs?.some(lab => 
          labs.some(filterLab => 
            lab.toLowerCase().includes(filterLab.toLowerCase())
          )
        );
        if (!hasMatchingLab) return false;
      }
      
      return true;
    });
  }
  
  // Apply individual medications filter (separate from Medical Entity)
  if (filters.medications?.values && filters.medications.values.length > 0) {
    const operator = filters.medications.operator || 'is-any-of';
    filtered = filtered.filter(doc => {
      if (!doc.medications || doc.medications.length === 0) return false;
      
      if (operator === 'is') {
        // For 'is', check if doc has exactly the selected medication(s)
        return filters.medications!.values!.some(filterMed =>
          doc.medications!.some(med => 
            med.toLowerCase().includes(filterMed.toLowerCase())
          )
        );
      } else {
        // For 'is-any-of', check if doc has any of the selected medications
        return filters.medications!.values!.some(filterMed =>
          doc.medications!.some(med => 
            med.toLowerCase().includes(filterMed.toLowerCase())
          )
        );
      }
    });
  }
  
  // Apply individual diagnoses filter (separate from Medical Entity)
  if (filters.diagnoses?.values && filters.diagnoses.values.length > 0) {
    const operator = filters.diagnoses.operator || 'is-any-of';
    filtered = filtered.filter(doc => {
      if (!doc.diagnoses || doc.diagnoses.length === 0) return false;
      
      if (operator === 'is') {
        // For 'is', check if doc has exactly the selected diagnosis(es)
        return filters.diagnoses!.values!.some(filterDiag =>
          doc.diagnoses!.some(diag => 
            diag.toLowerCase().includes(filterDiag.toLowerCase())
          )
        );
      } else {
        // For 'is-any-of', check if doc has any of the selected diagnoses
        return filters.diagnoses!.values!.some(filterDiag =>
          doc.diagnoses!.some(diag => 
            diag.toLowerCase().includes(filterDiag.toLowerCase())
          )
        );
      }
    });
  }
  
  // Apply individual labs filter (separate from Medical Entity)
  if (filters.labs?.values && filters.labs.values.length > 0) {
    const operator = filters.labs.operator || 'is-any-of';
    filtered = filtered.filter(doc => {
      if (!doc.labs || doc.labs.length === 0) return false;
      
      if (operator === 'is') {
        // For 'is', check if doc has exactly the selected lab(s)
        return filters.labs!.values!.some(filterLab =>
          doc.labs!.some(lab => 
            lab.toLowerCase().includes(filterLab.toLowerCase())
          )
        );
      } else {
        // For 'is-any-of', check if doc has any of the selected labs
        return filters.labs!.values!.some(filterLab =>
          doc.labs!.some(lab => 
            lab.toLowerCase().includes(filterLab.toLowerCase())
          )
        );
      }
    });
  }
  
  return filtered;
}

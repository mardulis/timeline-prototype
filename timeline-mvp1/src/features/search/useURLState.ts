import { useEffect } from 'react';
import { useSearch } from './SearchCtx';

export function useURLState() {
  const { query, setQuery, filters, setFilters } = useSearch();
  
  // Load state from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Load search query
    const urlQuery = urlParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
    }
    
    // Load filters
    const urlFilters: any = {};
    
    // Date filter
    const startDate = urlParams.get('startDate');
    const endDate = urlParams.get('endDate');
    if (startDate || endDate) {
      urlFilters.date = {};
      if (startDate) urlFilters.date.start = startDate;
      if (endDate) urlFilters.date.end = endDate;
    }
    
    // Document type filter
    const docTypes = urlParams.get('docTypes');
    if (docTypes) {
      urlFilters.docType = docTypes.split(',');
    }
    
    // Medical entity filters
    const medications = urlParams.get('medications');
    const diagnoses = urlParams.get('diagnoses');
    const labs = urlParams.get('labs');
    if (medications || diagnoses || labs) {
      urlFilters.medical = {};
      if (medications) urlFilters.medical.medications = medications.split(',');
      if (diagnoses) urlFilters.medical.diagnoses = diagnoses.split(',');
      if (labs) urlFilters.medical.labs = labs.split(',');
    }
    
    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
    }
  }, [setQuery, setFilters]);
  
  // Update URL when state changes
  useEffect(() => {
    const urlParams = new URLSearchParams();
    
    // Add search query
    if (query) {
      urlParams.set('q', query);
    }
    
    // Add date filters
    if (filters.date?.start) {
      urlParams.set('startDate', filters.date.start);
    }
    if (filters.date?.end) {
      urlParams.set('endDate', filters.date.end);
    }
    
    // Add document type filters
    if (filters.docType?.values && filters.docType.values.length > 0) {
      urlParams.set('docTypes', filters.docType.values.join(','));
    }
    
    // Add medical entity filters
    if (filters.medical?.medications && filters.medical.medications.length > 0) {
      urlParams.set('medications', filters.medical.medications.join(','));
    }
    if (filters.medical?.diagnoses && filters.medical.diagnoses.length > 0) {
      urlParams.set('diagnoses', filters.medical.diagnoses.join(','));
    }
    if (filters.medical?.labs && filters.medical.labs.length > 0) {
      urlParams.set('labs', filters.medical.labs.join(','));
    }
    
    // Update URL without causing a page reload
    const newURL = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
    window.history.replaceState({}, '', newURL);
  }, [query, filters]);
}

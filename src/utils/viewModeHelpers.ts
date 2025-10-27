import { Doc, ViewMode } from '../types/Timeline';

/**
 * Filters documents based on viewMode.
 * Returns only documents that have the required entity data.
 */
export function filterDocumentsByViewMode(docs: Doc[], viewMode: ViewMode): Doc[] {
  if (viewMode === 'titles') {
    return docs; // Show all documents
  }
  
  return docs.filter(doc => {
    switch (viewMode) {
      case 'medications':
        return doc.medications && doc.medications.length > 0;
      case 'diagnosis':
        return doc.diagnoses && doc.diagnoses.length > 0;
      case 'labs':
        return doc.labs && doc.labs.length > 0;
      default:
        return true;
    }
  });
}

/**
 * Gets the display content for a document based on viewMode.
 * Returns an array of strings to display.
 */
export function getDocumentDisplayContent(doc: Doc, viewMode: ViewMode): string[] {
  switch (viewMode) {
    case 'titles':
      return [doc.title];
    case 'medications':
      return doc.medications || [];
    case 'diagnosis':
      return doc.diagnoses || [];
    case 'labs':
      return doc.labs || [];
    default:
      return [doc.title];
  }
}

/**
 * Gets the appropriate icon path based on viewMode.
 */
export function getViewModeIcon(viewMode: ViewMode): string {
  switch (viewMode) {
    case 'titles':
      return '/svg/Document.svg';
    case 'medications':
      return '/svg/Medications.svg';
    case 'diagnosis':
      return '/svg/Diagnosis.svg';
    case 'labs':
      return '/svg/Labs.svg';
    default:
      return '/svg/Document.svg';
  }
}

/**
 * Gets the appropriate icon alt text based on viewMode.
 */
export function getViewModeIconAlt(viewMode: ViewMode): string {
  switch (viewMode) {
    case 'titles':
      return 'Document';
    case 'medications':
      return 'Medication';
    case 'diagnosis':
      return 'Diagnosis';
    case 'labs':
      return 'Lab';
    default:
      return 'Document';
  }
}

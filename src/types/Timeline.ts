export type TimeScale = 'year' | 'month' | 'day';

export type Mode =
  | 'all'
  | 'chronology_dol'
  | 'facility_split'
  | 'category_sort'
  | 'category_sort_2025'
  | 'billing_finances';

export type ViewMode = 'titles' | 'medications' | 'diagnosis' | 'labs';

export interface Doc {
  id: string;
  title: string;
  date: string;
  docType: string;
  author?: string;
  facility?: string;
  pages?: number;
  summary?: string;
  medications?: string[];
  diagnoses?: string[];
  labs?: string[];
  flagged?: boolean;
}

// Child entity item - represents a single medication/diagnosis/lab from a document
export interface ChildEntityItem {
  id: string; // Unique ID for this child entity item (parentDocId-entityType-index)
  entityName: string; // Name of the medication/diagnosis/lab
  entityType: 'medication' | 'diagnosis' | 'lab'; // Type of entity
  date: string; // Date from parent document
  parentDocId: string; // ID of the parent document
  parentDoc: Doc; // Reference to the parent document
}

export interface Medication {
  name: string;
  dose?: string;
  route?: string;
  form?: string;
  frequency?: string;
}

export interface Diagnosis {
  name: string;
  code?: string;
}

export interface DocumentPreviewData {
  id: string;
  title: string;
  date: string;
  docType: string;
  author?: string;
  facility?: string;
  pages?: number;
  summary?: string;
  medications: string[];
  diagnoses: string[];
  labs: string[];
}

export interface CalendarAreaProps {
  scale: TimeScale;
  mode: Mode;
  viewMode?: ViewMode; // What to display on document cards
  range: { start: Date; end: Date };
  docs: Doc[];
  selectedDocId?: string;
  onScaleChange?: (s: TimeScale) => void;
  onModeChange?: (m: Mode) => void;
  onScrub?: (date: Date) => void;
  onSelect?: (doc: Doc, itemId?: string) => void; // itemId for child entity selection
  isPreviewVisible?: boolean;
  currentYear?: number;
  currentMonth?: number; // Added for day view
  currentDay?: number; // Added for day view
  highlightedDate?: Date | null; // Add highlighted date prop
  onYearChange?: (year: number) => void; // Callback when year changes
  onMonthChange?: (month: number) => void; // Callback when month changes
  onDayChange?: (day: number) => void; // Callback when day changes
  onManualNavigationStart?: () => void; // Callback when manual navigation starts
  manualNavigationRef?: React.MutableRefObject<boolean>; // Ref to track manual navigation
  scrollToDateRef?: React.MutableRefObject<((date: Date) => void) | null>; // Ref to expose scrollToDate function
  onHighlightedDate?: (date: Date | null) => void; // Callback when date is highlighted
}

export interface ViewProps {
  docs: Doc[];
  viewMode?: ViewMode; // What to display on document cards
  selectedDocId?: string;
  onSelect: (doc: Doc, itemId?: string) => void; // itemId for child entity selection
  onNavigate?: (direction: 'prev' | 'next') => void;
  highlightedMonth?: { year: number; month: number };
  highlightedDate?: Date | null; // Add highlighted date prop
  currentYear?: number;
  currentMonth?: number; // Added for day view
  currentDay?: number; // Added for day view
}

export interface ActivityHistogramProps {
  docs: Doc[];
  selectedDocId?: string;
  onBarClick: (date: Date) => void;
  onScrubberDrag: (date: Date) => void;
  isPreviewVisible?: boolean;
  onYearClick?: (year: number) => void;
  onMonthClick?: (month: number) => void;
  onDayClick?: (day: number) => void;
  onScaleChange?: (scale: TimeScale) => void; // For switching timeframes from label clicks
  onYearChange?: (year: number) => void; // For updating current year context
  onMonthChange?: (month: number) => void; // For updating current month context
}

export interface TopPanelProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onLoadCSV?: (file: File) => void;
}

export interface SearchAndControlsProps {
  scale: TimeScale;
  onScaleChange: (scale: TimeScale) => void;
  onScrub: (date: Date) => void;
  range: { start: Date; end: Date };
  docs: Doc[];
  onYearChange?: (year: number) => void;
  onMonthChange?: (month: number) => void; // Added for day view
  onDayChange?: (day: number) => void; // Added for day view
  currentYear?: number; // Current year being displayed
  currentMonth?: number; // Current month being displayed
  currentDay?: number; // Current day being displayed
  onManualNavigationStart?: () => void; // Callback when manual navigation starts
  onHighlightedDate?: (date: Date | null) => void; // Callback when date is highlighted
  scrollToDateRef?: React.MutableRefObject<((date: Date) => void) | null>; // Ref to trigger scrolling to specific date
  isPreviewVisible?: boolean; // Whether document preview panel is visible
  viewMode?: ViewMode; // Current view mode
  onViewModeChange?: (mode: ViewMode) => void; // Callback when view mode changes
}

export interface DocumentPreviewProps {
  document: DocumentPreviewData | null;
  onClose: () => void;
}
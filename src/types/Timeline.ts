export type TimeScale = 'year' | 'month' | 'day';

export type Mode =
  | 'all'
  | 'chronology_dol'
  | 'facility_split'
  | 'category_sort'
  | 'category_sort_2025'
  | 'billing_finances';

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
  range: { start: Date; end: Date };
  docs: Doc[];
  selectedDocId?: string;
  onScaleChange?: (s: TimeScale) => void;
  onModeChange?: (m: Mode) => void;
  onScrub?: (date: Date) => void;
  onSelect?: (doc: Doc) => void;
  isPreviewVisible?: boolean;
  currentYear?: number;
  currentMonth?: number; // Added for day view
  currentDay?: number; // Added for day view
  onYearChange?: (year: number) => void; // Callback when year changes
  onMonthChange?: (month: number) => void; // Callback when month changes
  onDayChange?: (day: number) => void; // Callback when day changes
  onManualNavigationStart?: () => void; // Callback when manual navigation starts
  manualNavigationRef?: React.MutableRefObject<boolean>; // Ref to track manual navigation
}

export interface ViewProps {
  docs: Doc[];
  selectedDocId?: string;
  onSelect: (doc: Doc) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  highlightedMonth?: { year: number; month: number };
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
}

export interface TopPanelProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
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
}

export interface DocumentPreviewProps {
  document: DocumentPreviewData | null;
  onClose: () => void;
}
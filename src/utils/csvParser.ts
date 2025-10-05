export interface DocumentData {
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

// Mock data generators for missing fields
const generateMockMedications = (): string[] => {
  const medications = [
    'Acetaminophen 500mg',
    'Ibuprofen 200mg',
    'Lisinopril 10mg',
    'Metformin 500mg',
    'Atorvastatin 20mg',
    'Omeprazole 20mg',
    'Amlodipine 5mg',
    'Metoprolol 25mg',
    'Losartan 50mg',
    'Simvastatin 20mg'
  ];
  return [medications[Math.floor(Math.random() * medications.length)]];
};

const generateMockDiagnoses = (): string[] => {
  const diagnoses = [
    'Hypertension',
    'Type 2 Diabetes',
    'Hyperlipidemia',
    'GERD',
    'Anxiety',
    'Depression',
    'Osteoarthritis',
    'Chronic Pain',
    'Migraine',
    'Insomnia'
  ];
  return [diagnoses[Math.floor(Math.random() * diagnoses.length)]];
};

const generateMockLabs = (): string[] => {
  const labs = [
    'Complete Blood Count (CBC)',
    'Basic Metabolic Panel (BMP)',
    'Lipid Panel',
    'Hemoglobin A1C',
    'Thyroid Stimulating Hormone (TSH)',
    'Liver Function Tests',
    'Urinalysis',
    'Chest X-Ray',
    'ECG',
    'Blood Pressure Reading'
  ];
  return [labs[Math.floor(Math.random() * labs.length)]];
};

// Parse CSV content
export const parseCSV = (csvContent: string): DocumentData[] => {
  // Split by lines but handle multi-line quoted fields
  const lines = parseCSVLines(csvContent);
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
  const documents: DocumentData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing - handles quoted fields
    const values = parseCSVLine(line);
    
    if (values.length < headers.length) continue;
    
    const pageNum = values[0]?.replace(/"/g, '') || '';
    const title = values[1]?.replace(/"/g, '') || '';
    const docType = values[2]?.replace(/"/g, '') || '';
    const author = values[3]?.replace(/"/g, '') || '';
    const facility = values[4]?.replace(/"/g, '') || '';
    const dateStr = values[5]?.replace(/"/g, '') || '';
    const pages = parseInt(values[6]?.replace(/"/g, '') || '1');
    const summary = values[7]?.replace(/"/g, '') || '';
    
    // Skip if no title or date
    if (!title || !dateStr) continue;
    
    // Parse date - handle various formats
    let parsedDate: Date;
    try {
      parsedDate = new Date(dateStr);
      if (isNaN(parsedDate.getTime())) {
        // Try alternative parsing
        parsedDate = new Date(dateStr.replace(/(\w+) (\d+), (\d+)/, '$1 $2, $3'));
      }
      if (isNaN(parsedDate.getTime())) {
        continue;
      }
    } catch (error) {
      continue;
    }
    
    // Generate ID from page number and title
    const id = `doc-${pageNum}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    // Determine if we need mock data based on document type
    let medications: string[] | undefined;
    let diagnoses: string[] | undefined;
    let labs: string[] | undefined;
    
    if (docType.toLowerCase().includes('medication')) {
      medications = summary.toLowerCase().includes('medication') ? 
        [summary] : generateMockMedications();
    } else {
      medications = generateMockMedications();
    }
    
    if (docType.toLowerCase().includes('diagnosis') || docType.toLowerCase().includes('medical')) {
      diagnoses = summary.toLowerCase().includes('diagnosis') || summary.toLowerCase().includes('assessment') ? 
        [summary] : generateMockDiagnoses();
    } else {
      diagnoses = generateMockDiagnoses();
    }
    
    if (docType.toLowerCase().includes('lab') || docType.toLowerCase().includes('test')) {
      labs = summary.toLowerCase().includes('lab') || summary.toLowerCase().includes('test') ? 
        [summary] : generateMockLabs();
    } else {
      labs = generateMockLabs();
    }
    
    documents.push({
      id,
      title,
      date: parsedDate.toISOString(),
      docType,
      author: author || undefined,
      facility: facility || undefined,
      pages: pages || 1,
      summary: summary || undefined,
      medications,
      diagnoses,
      labs
    });
  }
  
  return documents;
};

// Helper function to parse CSV lines handling multi-line quoted fields
const parseCSVLines = (csvContent: string): string[] => {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === '\n' && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = '';
      continue;
    }
    
    currentLine += char;
  }
  
  // Add the last line if it exists
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  return lines;
};

// Helper function to parse CSV line with proper quote handling
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

// Load CSV from public folder
export const loadCSVDocuments = async (): Promise<DocumentData[]> => {
  try {
    const response = await fetch('/Test.CSV');
    if (!response.ok) {
      throw new Error(`Failed to load CSV: ${response.statusText}`);
    }
    
    const csvContent = await response.text();
    return parseCSV(csvContent);
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
};

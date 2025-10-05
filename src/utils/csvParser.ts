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
    'Simvastatin 20mg',
    'Gabapentin 300mg',
    'Tramadol 50mg',
    'Hydrocodone 5mg',
    'Oxycodone 10mg',
    'Morphine 15mg',
    'Fentanyl 25mcg',
    'Diazepam 5mg',
    'Lorazepam 1mg',
    'Alprazolam 0.5mg',
    'Sertraline 50mg',
    'Fluoxetine 20mg',
    'Citalopram 20mg',
    'Escitalopram 10mg',
    'Venlafaxine 75mg',
    'Bupropion 150mg',
    'Trazodone 50mg',
    'Quetiapine 25mg',
    'Risperidone 1mg',
    'Olanzapine 5mg',
    'Haloperidol 2mg',
    'Prednisone 20mg',
    'Methylprednisolone 4mg',
    'Hydrocortisone 20mg',
    'Insulin Glargine 100 units/mL',
    'Insulin Lispro 100 units/mL',
    'Metformin ER 500mg',
    'Glipizide 5mg',
    'Glyburide 5mg',
    'Pioglitazone 15mg',
    'Sitagliptin 100mg',
    'Empagliflozin 10mg',
    'Canagliflozin 100mg',
    'Dapagliflozin 10mg',
    'Warfarin 5mg',
    'Apixaban 5mg',
    'Rivaroxaban 20mg',
    'Dabigatran 150mg',
    'Clopidogrel 75mg',
    'Aspirin 81mg',
    'Ticagrelor 90mg',
    'Prasugrel 10mg'
  ];
  
  // Return 1-4 random medications
  const count = Math.floor(Math.random() * 4) + 1;
  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    const med = medications[Math.floor(Math.random() * medications.length)];
    if (!selected.includes(med)) {
      selected.push(med);
    }
  }
  return selected.length > 0 ? selected : [medications[0]];
};

const generateMockDiagnoses = (): string[] => {
  const diagnoses = [
    'Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia', 'GERD', 'Anxiety', 'Depression',
    'Osteoarthritis', 'Chronic Pain', 'Migraine', 'Insomnia', 'COPD', 'Asthma', 'Pneumonia',
    'Myocardial Infarction', 'Atrial Fibrillation', 'Heart Failure', 'Stroke', 'TIA',
    'Chronic Kidney Disease', 'Acute Kidney Injury', 'Liver Cirrhosis', 'Hepatitis C',
    'Rheumatoid Arthritis', 'Lupus', 'Fibromyalgia', 'Multiple Sclerosis', 'Parkinson\'s Disease',
    'Alzheimer\'s Disease', 'Dementia', 'Bipolar Disorder', 'PTSD', 'Schizophrenia',
    'Crohn\'s Disease', 'Ulcerative Colitis', 'Irritable Bowel Syndrome', 'Diverticulitis',
    'Gallstones', 'Pancreatitis', 'Appendicitis', 'Hernia', 'Kidney Stones',
    'Urinary Tract Infection', 'Prostate Cancer', 'Breast Cancer', 'Lung Cancer',
    'Colon Cancer', 'Diabetes Mellitus Type 1', 'Hypothyroidism', 'Hyperthyroidism',
    'Cushing\'s Syndrome', 'Addison\'s Disease', 'Osteoporosis', 'Osteopenia',
    'Anemia', 'Thrombocytopenia', 'Leukemia', 'Lymphoma', 'Sepsis', 'Cellulitis',
    'Endocarditis', 'Meningitis', 'Encephalitis', 'Tuberculosis', 'HIV/AIDS',
    'Hepatitis B', 'Herpes Zoster', 'Influenza', 'COVID-19', 'Pneumonia',
    'Bronchitis', 'Sinusitis', 'Otitis Media', 'Conjunctivitis', 'Cataracts',
    'Glaucoma', 'Macular Degeneration', 'Retinal Detachment', 'Diabetic Retinopathy'
  ];
  
  // Return 1-3 random diagnoses
  const count = Math.floor(Math.random() * 3) + 1;
  const selected: string[] = [];
  for (let i = 0; i < count; i++) {
    const diag = diagnoses[Math.floor(Math.random() * diagnoses.length)];
    if (!selected.includes(diag)) {
      selected.push(diag);
    }
  }
  return selected.length > 0 ? selected : [diagnoses[0]];
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

// Expected CSV columns for validation
const EXPECTED_COLUMNS = [
  'Page #',
  'Title', 
  'Doc Type',
  'Author',
  'Facility',
  'Date',
  'Pages',
  'Summary'
];

// Validate CSV structure
const validateCSVStructure = (headers: string[]): boolean => {
  // Check if all expected columns are present
  const hasAllColumns = EXPECTED_COLUMNS.every(expectedCol => 
    headers.some(header => header.trim() === expectedCol)
  );
  
  if (!hasAllColumns) {
    console.warn('CSV missing expected columns. Expected:', EXPECTED_COLUMNS, 'Found:', headers);
  }
  
  return hasAllColumns;
};

// Parse CSV content
export const parseCSV = (csvContent: string): DocumentData[] => {
  // Split by lines but handle multi-line quoted fields
  const lines = parseCSVLines(csvContent);
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
  // Validate CSV structure
  const isValidStructure = validateCSVStructure(headers);
  if (!isValidStructure) {
    throw new Error(`CSV file must contain the following columns: ${EXPECTED_COLUMNS.join(', ')}`);
  }
  
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
    const response = await fetch('/csv/Test.csv'); // Back to original Test.csv
    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Failed to load Test.csv: ${response.statusText}`);
      }
      return [];
    }
    
    const csvContent = await response.text();
    if (!csvContent || csvContent.trim().length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Test.csv file is empty');
      }
      return [];
    }
    
    return parseCSV(csvContent);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error loading Test.csv:', error);
    }
    return [];
  }
};

// Load Test.csv from public folder
export const loadTestCSVDocuments = async (): Promise<DocumentData[]> => {
  try {
    const response = await fetch('/csv/Test.csv');
    if (!response.ok) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Failed to load Test.csv: ${response.statusText}`);
      }
      return [];
    }
    
    const csvContent = await response.text();
    if (!csvContent || csvContent.trim().length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Test.csv is empty or contains no data');
      }
      return [];
    }
    
    return parseCSV(csvContent);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error loading Test.csv:', error);
    }
    return [];
  }
};

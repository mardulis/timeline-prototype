import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DocumentPreviewProps } from '../types/Timeline';
import PDFViewer from './PDFViewer';
import { useSearch } from '../features/search/SearchCtx';
import { highlightText } from '../features/search/highlight';

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PreviewHeader = styled.div`
  background: white;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
`;

const PreviewContentArea = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TabRow = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 100%;
`;

const DocumentTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DocumentIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PreviewTabs = styled.div`
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 2px;
  gap: 0;
  width: 100%;
`;

const PreviewTab = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border-radius: 0;
  border: none;
  background: ${props => props.isActive ? 'white' : 'transparent'};
  color: ${props => props.isActive ? '#111827' : '#6b7280'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  
  &:first-child {
    border-radius: 6px 0 0 6px;
  }
  
  &:last-child {
    border-radius: 0 6px 6px 0;
  }
  
  &:hover {
    background: ${props => props.isActive ? 'white' : '#e5e7eb'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  padding: 8px;
  border: 1px solid #E5E7EB;
  background: #FFF;
  color: #6b7280;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const PreviewContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const MetadataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetadataLabel = styled.span`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`;

const MetadataValue = styled.span`
  font-size: 14px;
  color: #111827;
`;

const SummarySection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
`;

const SummaryText = styled.p<{ isExpanded?: boolean }>`
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin: 0;
  ${props => !props.isExpanded && `
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  `}
`;

const SummaryToggleButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  margin-top: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const SummaryContainer = styled.div`
  position: relative;
`;

const AccordionCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const AccordionHeader = styled.button<{ isOpen: boolean }>`
  width: 100%;
  padding: 16px 20px;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const AccordionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const AccordionIcon = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AccordionToggle = styled.div<{ isOpen: boolean }>`
  font-size: 12px;
  color: #6b7280;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AccordionContent = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const AccordionInner = styled.div`
  padding: 0 20px 20px 20px;
`;

const SubstanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SubstanceItem = styled.div`
  font-size: 14px;
  color: #111827;
  padding: 4px 0;
`;

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose }) => {
  const { query } = useSearch();
  const [activeTab, setActiveTab] = useState<'details' | 'pdf'>('details');
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    medications: true,
    diagnoses: true,
    labs: true
  });
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Health check PDF accessibility when document changes
  useEffect(() => {
    if (document && activeTab === 'pdf') {
      const pdfFilename = getPDFForDocument();
      assertPdfReachable(pdfFilename);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, activeTab]);

  // Available PDF files in the public folder
  const pdfFiles = [
    'Aida Maldonado Vega - 2024-12-04 - 3.pdf',
    'OCF18-1pg - 2.pdf',
    'test WC WF - 2025-09-23 - Index with Summary - 10.pdf'
  ];

  // Runtime health check for PDF accessibility (optional debugging)
  const assertPdfReachable = async (filename: string) => {
    const url = `/pdf/${filename}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok || !(res.headers.get('content-type') || '').includes('pdf')) {
        console.warn('[PDF] Unexpected response for', url, res.status, res.headers.get('content-type'));
      } else {
        console.log('[PDF] PDF is reachable:', url);
      }
    } catch (e) {
      console.error('[PDF] HEAD failed', url, e);
    }
  };

  // Function to get PDF file based on document title or type
  const getPDFForDocument = () => {
    if (!document) return pdfFiles[0]; // Fallback if no document
    
    const title = document.title.toLowerCase();
    if (process.env.NODE_ENV === 'development') {
      console.log('Document title:', document.title, 'Looking for PDF match...');
    }
    
    // Try to match document title with PDF filename
    if (title.includes('aida') || title.includes('maldonado')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Matched Aida PDF');
      }
      return 'Aida Maldonado Vega - 2024-12-04 - 3.pdf';
    }
    if (title.includes('ocf') || title.includes('18')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Matched OCF PDF');
      }
      return 'OCF18-1pg - 2.pdf';
    }
    if (title.includes('test') || title.includes('wc') || title.includes('wf')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Matched Test PDF');
      }
      return 'test WC WF - 2025-09-23 - Index with Summary - 10.pdf';
    }
    
    // Deterministic fallback based on document ID to ensure consistency across timeframes
    const documentId = document.id || document.title;
    const hash = documentId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const pdfIndex = Math.abs(hash) % pdfFiles.length;
    const selectedPDF = pdfFiles[pdfIndex];
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Using deterministic PDF based on ID:', selectedPDF, 'for document:', documentId);
    }
    
    return selectedPDF;
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleSummary = () => {
    setIsSummaryExpanded(prev => !prev);
  };

  // Check if summary needs truncation (roughly 5 lines)
  const needsTruncation = (text: string) => {
    if (!text) return false;
    // Estimate lines based on character count and line height
    // Assuming average 60 characters per line for 14px font
    const estimatedLines = Math.ceil(text.length / 60);
    return estimatedLines > 5;
  };

  if (!document) {
    return (
      <PreviewContainer>
        <PreviewContentArea>
          <PreviewContent>
            <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '50px' }}>
              Select a document to view details
            </div>
          </PreviewContent>
        </PreviewContentArea>
      </PreviewContainer>
    );
  }

  return (
    <PreviewContainer>
      <PreviewHeader>
        <HeaderRow>
          <DocumentTitle>
            <DocumentIcon>
              <img src="/svg/Document.svg" alt="Document" width="20" height="20" />
            </DocumentIcon>
            {highlightText(document.title, query)}
          </DocumentTitle>
          <CloseButton onClick={onClose}>
            <img src="/svg/Close.svg" alt="Close" width="16" height="16" />
          </CloseButton>
        </HeaderRow>
        
        <TabRow>
          <PreviewTabs>
            <PreviewTab
              isActive={activeTab === 'details'}
              onClick={() => setActiveTab('details')}
            >
              Details
            </PreviewTab>
            <PreviewTab
              isActive={activeTab === 'pdf'}
              onClick={() => setActiveTab('pdf')}
            >
              Document
            </PreviewTab>
          </PreviewTabs>
        </TabRow>
      </PreviewHeader>

      <PreviewContentArea>
        {activeTab === 'details' ? (
          <PreviewContent>
          <MetadataGrid>
            <MetadataItem>
              <MetadataLabel>Date</MetadataLabel>
              <MetadataValue>{new Date(document.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Doc Type</MetadataLabel>
              <MetadataValue>{document.docType}</MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Author</MetadataLabel>
              <MetadataValue>{highlightText(document.author || 'N/A', query)}</MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Facility</MetadataLabel>
              <MetadataValue>{highlightText(document.facility || 'N/A', query)}</MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Pages</MetadataLabel>
              <MetadataValue>{document.pages || 'N/A'}</MetadataValue>
            </MetadataItem>
          </MetadataGrid>

          {document.summary && (
            <SummarySection>
              <SectionTitle>Summary</SectionTitle>
              <SummaryContainer>
                <SummaryText isExpanded={isSummaryExpanded}>
                  {highlightText(document.summary, query)}
                </SummaryText>
                {needsTruncation(document.summary) && (
                  <SummaryToggleButton onClick={toggleSummary}>
                    {isSummaryExpanded ? 'Less' : 'More'}
                  </SummaryToggleButton>
                )}
              </SummaryContainer>
            </SummarySection>
          )}

          <AccordionCard>
            <AccordionHeader
              isOpen={openAccordions.medications}
              onClick={() => toggleAccordion('medications')}
            >
              <AccordionTitle>
                <AccordionIcon>
                  <img src="/svg/Medications.svg" alt="Medications" width="16" height="16" />
                </AccordionIcon>
                Medication ({document.medications.length})
              </AccordionTitle>
              <AccordionToggle isOpen={openAccordions.medications}>
                <img 
                  src={openAccordions.medications ? "/svg/chevronUp.svg" : "/svg/chevronDown.svg"} 
                  alt={openAccordions.medications ? "Collapse" : "Expand"} 
                  width="16" 
                  height="16" 
                />
              </AccordionToggle>
            </AccordionHeader>
            <AccordionContent isOpen={openAccordions.medications}>
              <AccordionInner>
                <SubstanceList>
                  {document.medications.map((med, index) => (
                    <SubstanceItem key={index}>{highlightText(med, query)}</SubstanceItem>
                  ))}
                </SubstanceList>
              </AccordionInner>
            </AccordionContent>
          </AccordionCard>

          <AccordionCard>
            <AccordionHeader
              isOpen={openAccordions.diagnoses}
              onClick={() => toggleAccordion('diagnoses')}
            >
              <AccordionTitle>
                <AccordionIcon>
                  <img src="/svg/Diagnosis.svg" alt="Diagnosis" width="16" height="16" />
                </AccordionIcon>
                Diagnosis ({document.diagnoses.length})
              </AccordionTitle>
              <AccordionToggle isOpen={openAccordions.diagnoses}>
                <img 
                  src={openAccordions.diagnoses ? "/svg/chevronUp.svg" : "/svg/chevronDown.svg"} 
                  alt={openAccordions.diagnoses ? "Collapse" : "Expand"} 
                  width="16" 
                  height="16" 
                />
              </AccordionToggle>
            </AccordionHeader>
            <AccordionContent isOpen={openAccordions.diagnoses}>
              <AccordionInner>
                <SubstanceList>
                  {document.diagnoses.map((diagnosis, index) => (
                    <SubstanceItem key={index}>{highlightText(diagnosis, query)}</SubstanceItem>
                  ))}
                </SubstanceList>
              </AccordionInner>
            </AccordionContent>
          </AccordionCard>

          <AccordionCard>
            <AccordionHeader
              isOpen={openAccordions.labs}
              onClick={() => toggleAccordion('labs')}
            >
              <AccordionTitle>
                <AccordionIcon>
                  <img src="/svg/Labs.svg" alt="Labs" width="16" height="16" />
                </AccordionIcon>
                Labs ({document.labs.length})
              </AccordionTitle>
              <AccordionToggle isOpen={openAccordions.labs}>
                <img 
                  src={openAccordions.labs ? "/svg/chevronUp.svg" : "/svg/chevronDown.svg"} 
                  alt={openAccordions.labs ? "Collapse" : "Expand"} 
                  width="16" 
                  height="16" 
                />
              </AccordionToggle>
            </AccordionHeader>
            <AccordionContent isOpen={openAccordions.labs}>
              <AccordionInner>
                <SubstanceList>
                  {document.labs.map((lab, index) => (
                    <SubstanceItem key={index}>{highlightText(lab, query)}</SubstanceItem>
                  ))}
                </SubstanceList>
              </AccordionInner>
            </AccordionContent>
          </AccordionCard>
        </PreviewContent>
        ) : (
          <PDFViewer pdfPath={getPDFForDocument()} />
        )}
      </PreviewContentArea>
    </PreviewContainer>
  );
};

export default DocumentPreview;

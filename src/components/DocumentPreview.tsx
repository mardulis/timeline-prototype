import React, { useState } from 'react';
import styled from 'styled-components';
import { DocumentPreviewProps } from '../types/Timeline';
import PDFViewer from './PDFViewer';

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
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
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
  transition: transform 0.2s ease;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
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
  const [activeTab, setActiveTab] = useState<'details' | 'pdf'>('details');
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    medications: true,
    diagnoses: true,
    labs: true
  });
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Available PDF files in the public folder
  const pdfFiles = [
    'Aida Maldonado Vega - 2024-12-04 - 3.pdf',
    'OCF18-1pg - 2.pdf',
    'test WC WF - 2025-09-23 - Index with Summary - 10.pdf'
  ];

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
    
    // Fallback to random selection
    const randomIndex = Math.floor(Math.random() * pdfFiles.length);
    const selectedPDF = pdfFiles[randomIndex];
    if (process.env.NODE_ENV === 'development') {
      console.log('Using random PDF:', selectedPDF);
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
        <PreviewContent>
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '50px' }}>
            Select a document to view details
          </div>
        </PreviewContent>
      </PreviewContainer>
    );
  }

  return (
    <PreviewContainer>
      <PreviewHeader>
        <HeaderRow>
          <DocumentTitle>
            <DocumentIcon>
              <img src="/Document.svg" alt="Document" width="20" height="20" />
            </DocumentIcon>
            {document.title}
          </DocumentTitle>
          <CloseButton onClick={onClose}>
            ×
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
              <MetadataValue>{document.author || 'N/A'}</MetadataValue>
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Facility</MetadataLabel>
              <MetadataValue>{document.facility || 'N/A'}</MetadataValue>
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
                  {document.summary}
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
                  <img src="/Medications.svg" alt="Medications" width="16" height="16" />
                </AccordionIcon>
                Medication ({document.medications.length})
              </AccordionTitle>
              <AccordionToggle isOpen={openAccordions.medications}>▼</AccordionToggle>
            </AccordionHeader>
            <AccordionContent isOpen={openAccordions.medications}>
              <AccordionInner>
                <SubstanceList>
                  {document.medications.map((med, index) => (
                    <SubstanceItem key={index}>{med}</SubstanceItem>
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
                  <img src="/Diagnosis.svg" alt="Diagnosis" width="16" height="16" />
                </AccordionIcon>
                Diagnosis ({document.diagnoses.length})
              </AccordionTitle>
              <AccordionToggle isOpen={openAccordions.diagnoses}>▼</AccordionToggle>
            </AccordionHeader>
            <AccordionContent isOpen={openAccordions.diagnoses}>
              <AccordionInner>
                <SubstanceList>
                  {document.diagnoses.map((diagnosis, index) => (
                    <SubstanceItem key={index}>{diagnosis}</SubstanceItem>
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
                  <img src="/Labs.svg" alt="Labs" width="16" height="16" />
                </AccordionIcon>
                Labs ({document.labs.length})
              </AccordionTitle>
              <AccordionToggle isOpen={openAccordions.labs}>▼</AccordionToggle>
            </AccordionHeader>
            <AccordionContent isOpen={openAccordions.labs}>
              <AccordionInner>
                <SubstanceList>
                  {document.labs.map((lab, index) => (
                    <SubstanceItem key={index}>{lab}</SubstanceItem>
                  ))}
                </SubstanceList>
              </AccordionInner>
            </AccordionContent>
          </AccordionCard>
        </PreviewContent>
      ) : (
        <PDFViewer pdfPath={`/${(() => {
          const pdfFile = getPDFForDocument();
          console.log('Passing PDF path to viewer:', `/${pdfFile}`);
          return pdfFile;
        })()}`} />
      )}
    </PreviewContainer>
  );
};

export default DocumentPreview;

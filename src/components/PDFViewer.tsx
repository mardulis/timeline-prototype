import React, { useState } from 'react';
import styled from 'styled-components';

const PDFViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;


const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: #6b7280;
`;

const ErrorTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #374151;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const DownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #2563eb;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PDFObject = styled.object`
  width: 100%;
  height: 100%;
  border: none;
  background: white;
`;

const PDFEmbed = styled.embed`
  width: 100%;
  height: 100%;
  border: none;
  background: white;
`;

const PDFViewer: React.FC<{ pdfPath: string }> = ({ pdfPath }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [useObject, setUseObject] = useState(true); // Try object first, then embed

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    if (useObject) {
      // Try embed as fallback
      setUseObject(false);
      setIsLoading(true);
    } else {
      // Both failed
      setIsLoading(false);
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <PDFViewerContainer>
        <ErrorContainer>
          <ErrorTitle>PDF Preview Not Available</ErrorTitle>
          <ErrorMessage>
            Your browser doesn't support PDF preview in this format. 
            You can download the document to view it.
          </ErrorMessage>
          <DownloadButton href={pdfPath} download target="_blank">
            📄 Download PDF
          </DownloadButton>
        </ErrorContainer>
      </PDFViewerContainer>
    );
  }

  return (
    <PDFViewerContainer>
      {isLoading && (
        <LoadingContainer>
          <LoadingSpinner />
          <div>Loading PDF...</div>
        </LoadingContainer>
      )}
      {useObject ? (
        <PDFObject
          data={`${pdfPath}#toolbar=1&navpanes=1&scrollbar=1`}
          type="application/pdf"
          onLoad={handleLoad}
          onError={handleError}
          style={{ display: isLoading ? 'none' : 'block' }}
        >
          <ErrorContainer>
            <ErrorTitle>PDF Preview Not Supported</ErrorTitle>
            <ErrorMessage>
              Your browser doesn't support PDF preview with object tag.
            </ErrorMessage>
            <DownloadButton href={pdfPath} download target="_blank">
              📄 Download PDF
            </DownloadButton>
          </ErrorContainer>
        </PDFObject>
      ) : (
        <PDFEmbed
          src={`${pdfPath}#toolbar=1&navpanes=1&scrollbar=1`}
          type="application/pdf"
          onLoad={handleLoad}
          onError={handleError}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
      )}
    </PDFViewerContainer>
  );
};

export default PDFViewer;

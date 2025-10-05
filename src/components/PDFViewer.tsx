import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const PDFViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const PDFFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: white;
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

const PDFViewer: React.FC<{ pdfPath: string }> = ({ pdfPath }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset states when pdfPath changes
    setIsLoading(true);
    setHasError(false);
    
    // Test if the PDF file exists by trying to fetch it
    const testPDF = async () => {
      try {
        console.log('Testing PDF availability:', pdfPath);
        const encodedPath = encodeURI(pdfPath);
        console.log('Encoded PDF path:', encodedPath);
        const response = await fetch(encodedPath, { method: 'HEAD' });
        console.log('PDF fetch response:', response.status, response.statusText);
        
        if (response.ok) {
          console.log('PDF file exists and is accessible');
          setIsLoading(false);
        } else {
          console.log('PDF file not accessible:', response.status);
          setIsLoading(false);
          setHasError(true);
        }
      } catch (error) {
        console.log('Error testing PDF:', error);
        setIsLoading(false);
        setHasError(true);
      }
    };
    
    testPDF();
  }, [pdfPath]);

  const handleLoad = () => {
    console.log('PDF loaded successfully:', pdfPath);
    setIsLoading(false);
  };

  const handleError = () => {
    console.log('PDF failed to load:', pdfPath);
    setIsLoading(false);
    setHasError(true);
  };

  // Add a timeout to handle cases where load/error events don't fire
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('PDF loading timeout after 10 seconds');
        setIsLoading(false);
        setHasError(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (hasError) {
    return (
      <PDFViewerContainer>
        <ErrorContainer>
          <ErrorTitle>PDF Preview Not Available</ErrorTitle>
          <ErrorMessage>
            The PDF file could not be loaded. This might be due to browser compatibility or file access issues.
          </ErrorMessage>
          <DownloadButton href={pdfPath} download target="_blank">
            📄 Download PDF
          </DownloadButton>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#9ca3af' }}>
            PDF Path: {pdfPath}
          </div>
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
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            {pdfPath}
          </div>
        </LoadingContainer>
      )}
      <PDFFrame
        src={`${encodeURI(pdfPath)}#toolbar=1&navpanes=1&scrollbar=1`}
        title="PDF Document"
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </PDFViewerContainer>
  );
};

export default PDFViewer;

import React from 'react';
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

const PDFViewer: React.FC<{ pdfPath: string }> = ({ pdfPath }) => {
  return (
    <PDFViewerContainer>
      <PDFFrame
        src={`${pdfPath}#toolbar=1&navpanes=1&scrollbar=1`}
        title="PDF Document"
      />
    </PDFViewerContainer>
  );
};

export default PDFViewer;

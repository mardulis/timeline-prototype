import React, { useMemo, useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { rotatePlugin } from '@react-pdf-viewer/rotate';
import styled from 'styled-components';
import { GlobalWorkerOptions } from 'pdfjs-dist';

// Import SVG files as React components
import ChevronUpIcon from '../assets/svg/chevronUp.svg';
import ChevronDownIcon from '../assets/svg/chevronDown.svg';
import RotateTopLeftIcon from '../assets/svg/rotateTopLeft.svg';

// Set up PDF.js worker
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const PDFViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  border: none;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #FFFFFF;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #FFFFFF;
  color: #dc2626;
  padding: 20px;
  text-align: center;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Custom ToolbarButton component
const ToolbarButton = ({ title, onClick, disabled, children, style }: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <button
    type="button"
    className="my-rpv-btn"
    title={title}
    onClick={onClick}
    disabled={disabled}
    style={style}
  >
    {children}
  </button>
);

const CustomToolbar = styled.div`
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  color: #0f172a;
  height: 48px;
  width: 100%;
  display: flex;
  align-items: center;
`;

const ToolbarRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  width: 100%;
  height: 48px;
`;

const ToolbarDivider = styled.div`
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  margin: 0 8px;
  flex-shrink: 0;
`;

type PDFViewerProps = {
  pdfPath: string;
};

export const PDFViewer: React.FC<PDFViewerProps> = ({ pdfPath }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pdfUrl = useMemo(() => {
    const filename = pdfPath.replace(/^\/?(public\/)?/, '');
    return `/pdf/${filename}`;
  }, [pdfPath]);

  // Initialize plugins
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const rotatePluginInstance = rotatePlugin();

  const handleDocumentLoad = (e: any) => {
    setIsLoading(false);
    setError(null);
  };

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [], // Remove sidebar completely
    renderToolbar: (Toolbar) => (
      <CustomToolbar>
        <Toolbar>
          {(slots) => (
            <ToolbarRow>
              {/* Center - Navigation controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', width: '100%', height: '48px' }}>
                {/* Previous page */}
                <slots.GoToPreviousPage>
                  {(props) => (
                    <ToolbarButton
                      title="Previous page"
                      onClick={props.onClick}
                      disabled={props.isDisabled}
                    >
                      <img src={ChevronUpIcon} alt="Previous page" width={16} height={16} />
                    </ToolbarButton>
                  )}
                </slots.GoToPreviousPage>

                {/* Page chip */}
                <div className="my-rpv-pagechip">
                  <slots.CurrentPageInput /> / <slots.NumberOfPages />
                </div>

                {/* Next page */}
                <slots.GoToNextPage>
                  {(props) => (
                    <ToolbarButton
                      title="Next page"
                      onClick={props.onClick}
                      disabled={props.isDisabled}
                    >
                      <img src={ChevronDownIcon} alt="Next page" width={16} height={16} />
                    </ToolbarButton>
                  )}
                </slots.GoToNextPage>

                <ToolbarDivider />

                {/* Rotate */}
                <slots.Rotate direction={90 as any}>
                  {(props) => (
                    <ToolbarButton
                      title="Rotate clockwise"
                      onClick={props.onClick}
                      disabled={false}
                    >
                      <img src={RotateTopLeftIcon} alt="Rotate clockwise" width={16} height={16} />
                    </ToolbarButton>
                  )}
                </slots.Rotate>
              </div>
            </ToolbarRow>
          )}
        </Toolbar>
      </CustomToolbar>
    ),
  });

  if (error) {
    return (
      <PDFViewerContainer>
        <ErrorContainer>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>⚠️</div>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>PDF Loading Error</div>
          <div style={{ fontSize: '14px' }}>{error}</div>
        </ErrorContainer>
      </PDFViewerContainer>
    );
  }

  return (
    <PDFViewerContainer>
      {isLoading && (
        <LoadingContainer>
          <LoadingSpinner />
          <div>Loading PDF document...</div>
        </LoadingContainer>
      )}
      <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
        <Viewer 
          fileUrl={pdfUrl} 
          plugins={[defaultLayoutPluginInstance, pageNavigationPluginInstance, rotatePluginInstance]}
          onDocumentLoad={handleDocumentLoad}
          defaultScale={1.0}
        />
      </Worker>
    </PDFViewerContainer>
  );
};

export default PDFViewer;

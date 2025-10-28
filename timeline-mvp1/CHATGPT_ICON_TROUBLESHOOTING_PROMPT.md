# ChatGPT Prompt for PDF Viewer Icon Troubleshooting

## Context
I'm working on a React PDF viewer using `@react-pdf-viewer/core` and related packages. I have a custom toolbar with custom SVG icons, but the icons are not displaying properly. The PDF viewer is dynamically loading its own CSS after my custom CSS, which is overriding my icon styles.

## Current Setup
- **PDF Viewer Library**: `@react-pdf-viewer/core`, `@react-pdf-viewer/default-layout`, `@react-pdf-viewer/page-navigation`, `@react-pdf-viewer/rotate`
- **Styling**: Styled-components + CSS overrides
- **Icons**: Custom SVG files (chevronUp.svg, chevronDown.svg, rotateTopLeft.svg, sidebarLeft.svg)
- **Problem**: Icons load briefly then disappear, likely due to PDF viewer's dynamic CSS loading

## Current Implementation

### PDFViewer.tsx Structure
```tsx
const defaultLayoutPluginInstance = defaultLayoutPlugin({
  sidebarTabs: () => [],
  renderToolbar: (Toolbar) => (
    <CustomToolbar>
      <Toolbar>
        {(slots) => (
          <>
            {/* Leftmost thumbnail button */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ToolbarButton 
                onClick={() => setShowThumbnails(!showThumbnails)}
                title="Toggle Thumbnails"
              >
                <SidebarLeft width={16} height={16} />
              </ToolbarButton>
            </div>
            
            {/* Centered page controls and other buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'center' }}>
              <PageControls>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <slots.GoToPreviousPage />
                </div>
                
                <div className="page-chip">
                  <slots.CurrentPageInput /> / <slots.NumberOfPages />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <slots.GoToNextPage />
                </div>
              </PageControls>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <slots.Rotate direction={90 as any} />
              </div>
            </div>
          </>
        )}
      </Toolbar>
    </CustomToolbar>
  ),
});
```

### CSS Overrides (pdf-viewer-overrides.css)
```css
/* Hide all default SVG icons in buttons */
.rpv-core__button svg,
.rpv-core__button svg *,
.rpv-default-layout__toolbar .rpv-core__button svg,
.rpv-default-layout__toolbar .rpv-core__button svg * {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

/* Custom icons for PDF viewer buttons */
.rpv-default-layout__toolbar .rpv-core__button[data-testid="previous-page-button"]::before,
.rpv-default-layout__toolbar .rpv-core__button[title*="Previous"]::before {
  content: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 8.3999L8.5 4.3999L4.5 8.3999" stroke="%231F2937" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>') !important;
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: 16px !important;
  height: 16px !important;
  z-index: 999 !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Similar rules for next page, rotate, and thumbnail buttons */
```

### JavaScript Enforcement
```tsx
useEffect(() => {
  const applyIconOverrides = () => {
    const buttons = document.querySelectorAll('.rpv-core__button');
    buttons.forEach(button => {
      const svgs = button.querySelectorAll('svg');
      svgs.forEach(svg => {
        (svg as unknown as HTMLElement).style.display = 'none';
        (svg as unknown as HTMLElement).style.visibility = 'hidden';
        (svg as unknown as HTMLElement).style.opacity = '0';
      });
    });
  };

  applyIconOverrides();
  setTimeout(applyIconOverrides, 100);
  setTimeout(applyIconOverrides, 500);
  setTimeout(applyIconOverrides, 1000);
  
  const observer = new MutationObserver(applyIconOverrides);
  observer.observe(document.body, { childList: true, subtree: true });
}, []);
```

## Problem Description
1. **Icons Load Briefly**: Custom SVG icons appear for a split second
2. **Then Disappear**: PDF viewer's CSS loads and overrides my custom styles
3. **Default Icons Show**: Default PDF viewer icons appear instead
4. **JavaScript Doesn't Help**: Even with MutationObserver, icons still disappear

## What I Need Help With
1. **CSS Specificity Issues**: How to ensure my CSS has higher specificity than PDF viewer's dynamic CSS?
2. **Timing Issues**: How to ensure my styles are applied after PDF viewer initializes?
3. **Alternative Approaches**: Are there better ways to customize PDF viewer icons?
4. **CSS Injection**: How to inject CSS with higher priority than dynamically loaded styles?
5. **React PDF Viewer Best Practices**: What's the recommended way to customize toolbar icons?

## Specific Questions
1. Should I use CSS-in-JS instead of external CSS file?
2. How can I increase CSS specificity beyond !important?
3. Is there a way to hook into PDF viewer's CSS loading lifecycle?
4. Should I replace the slot components entirely with custom components?
5. How can I debug what CSS is being applied to the buttons?

## Expected Result
- Thumbnail button shows `sidebarLeft.svg`
- Previous page button shows `chevronUp.svg`
- Next page button shows `chevronDown.svg`
- Rotate button shows `rotateTopLeft.svg`
- All icons persist throughout the PDF viewer session

## Additional Context
- Using React 19.2.0
- TypeScript
- Styled-components 6.1.19
- PDF.js worker loaded from CDN
- Development server on localhost:3001
- Icons are accessible at `/svg/filename.svg`

Please provide specific solutions for ensuring custom SVG icons persist in the PDF viewer toolbar.

import React from 'react';

export function highlightText(text: string, searchQuery: string): React.ReactNode {
  if (!searchQuery.trim()) {
    return text;
  }
  
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  
  // Build HTML string to avoid React whitespace issues
  const highlightedHTML = text.replace(regex, (match) => {
    return `<mark style="background-color: #fde047; border-radius: 6px; display: inline; padding: 0; margin: 0; line-height: inherit; font-size: inherit; font-family: inherit; font-weight: inherit; color: inherit; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); border: none; outline: none; position: relative; z-index: 1;">${match}</mark>`;
  });
  
  // Use dangerouslySetInnerHTML to render the HTML directly
  return React.createElement('span', {
    dangerouslySetInnerHTML: { __html: highlightedHTML }
  });
}

export function highlightTextInElement(element: HTMLElement, searchQuery: string) {
  if (!searchQuery.trim()) {
    // Remove existing highlights
    const marks = element.querySelectorAll('mark');
    marks.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });
    return;
  }
  
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      acceptNode: function(node) {
        // Only accept text nodes that are not inside a <mark> tag
        return node.parentNode?.nodeName !== 'MARK' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    }
  );
  
  const textNodes: Text[] = [];
  let node;
  
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }
  
  textNodes.forEach(textNode => {
    const text = textNode.textContent || '';
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    
    if (regex.test(text)) {
      const parts = text.split(regex);
      const fragment = document.createDocumentFragment();
      
      parts.forEach((part, index) => {
        if (regex.test(part)) {
          const mark = document.createElement('mark');
          mark.style.backgroundColor = '#fde047'; // Vibrant yellow color
          mark.style.borderRadius = '6px'; // More rounded corners
          mark.style.display = 'inline';
          mark.style.padding = '0'; // Remove all padding
          mark.style.margin = '0'; // Remove all margins
          mark.style.lineHeight = 'inherit';
          mark.style.fontSize = 'inherit';
          mark.style.fontFamily = 'inherit';
          mark.style.fontWeight = 'inherit';
          mark.style.color = 'inherit'; // Keep original text color
          mark.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; // Subtle shadow
          mark.style.border = 'none';
          mark.style.outline = 'none';
          mark.style.position = 'relative'; // Enable positioning for overlay effect
          mark.style.zIndex = '1'; // Ensure it's above the text
          mark.textContent = part;
          fragment.appendChild(mark);
        } else if (part) {
          fragment.appendChild(document.createTextNode(part));
        }
      });
      
      textNode.parentNode?.replaceChild(fragment, textNode);
    }
  });
}

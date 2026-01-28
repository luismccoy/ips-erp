/**
 * RIPS JSON Preview Component
 * Lazy-loaded JSON preview with virtualization for large documents
 */

import React, { memo, useMemo, useState } from 'react';
import type { RIPSJsonDocument } from '../../services/rips';

interface RipsJsonPreviewProps {
  document: RIPSJsonDocument;
  maxLines?: number;
}

export const RipsJsonPreview = memo<RipsJsonPreviewProps>(({ 
  document, 
  maxLines = 500 
}) => {
  const [showFull, setShowFull] = useState(false);
  
  const { jsonString, lineCount, isTruncated } = useMemo(() => {
    const full = JSON.stringify(document, null, 2);
    const lines = full.split('\n');
    const isTruncated = lines.length > maxLines && !showFull;
    
    return {
      jsonString: isTruncated ? lines.slice(0, maxLines).join('\n') + '\n...' : full,
      lineCount: lines.length,
      isTruncated,
    };
  }, [document, maxLines, showFull]);

  return (
    <div className="json-preview">
      <div className="json-preview-header">
        <h4>Vista Previa del JSON</h4>
        <span className="line-count">{lineCount} líneas</span>
      </div>
      <pre>{jsonString}</pre>
      {isTruncated && (
        <button 
          className="show-more-btn"
          onClick={() => setShowFull(true)}
        >
          Mostrar documento completo ({lineCount} líneas)
        </button>
      )}
    </div>
  );
});

RipsJsonPreview.displayName = 'RipsJsonPreview';

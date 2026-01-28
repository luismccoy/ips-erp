/**
 * RIPS Error List Component
 * Displays validation errors with truncation
 */

import React, { memo, useState, useCallback } from 'react';

interface ValidationError {
  code: string;
  message: string;
}

interface RipsErrorListProps {
  errors: ValidationError[];
  maxVisible?: number;
}

export const RipsErrorList = memo<RipsErrorListProps>(({ 
  errors, 
  maxVisible = 5 
}) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded(e => !e), []);
  
  const visibleErrors = expanded ? errors : errors.slice(0, maxVisible);
  const hiddenCount = errors.length - maxVisible;

  if (errors.length === 0) return null;

  return (
    <div className="error-list">
      <h5>Errores ({errors.length})</h5>
      <ul>
        {visibleErrors.map((err, i) => (
          <li key={i} className="error-item">
            <code>{err.code}</code>
            <span>{err.message}</span>
          </li>
        ))}
        {!expanded && hiddenCount > 0 && (
          <li className="more-errors">
            <button 
              onClick={toggleExpanded}
              className="expand-btn"
            >
              ... y {hiddenCount} más (click para ver todos)
            </button>
          </li>
        )}
        {expanded && hiddenCount > 0 && (
          <li className="more-errors">
            <button onClick={toggleExpanded} className="expand-btn">
              Mostrar menos
            </button>
          </li>
        )}
      </ul>
    </div>
  );
});

RipsErrorList.displayName = 'RipsErrorList';

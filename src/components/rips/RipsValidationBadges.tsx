/**
 * RIPS Validation Badges Component
 * Displays validation status badges
 */

import React, { memo } from 'react';
import type { RIPSValidationResult } from '../../services/rips';

interface RipsValidationBadgesProps {
  validation: RIPSValidationResult;
}

export const RipsValidationBadges = memo<RipsValidationBadgesProps>(({ validation }) => (
  <div className="validation-badges">
    <span className={`badge ${validation.isValid ? 'valid' : 'invalid'}`}>
      {validation.isValid ? 'Válido' : 'Con errores'}
    </span>
    {validation.summary.totalErrors > 0 && (
      <span className="badge error">
        {validation.summary.totalErrors} errores
      </span>
    )}
    {validation.summary.totalWarnings > 0 && (
      <span className="badge warning">
        {validation.summary.totalWarnings} advertencias
      </span>
    )}
  </div>
));

RipsValidationBadges.displayName = 'RipsValidationBadges';

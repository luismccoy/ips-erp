/**
 * RIPS Stat Card Component
 * Displays a single statistic in the RIPS export panel
 */

import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react';

interface RipsStatCardProps {
  icon?: LucideIcon;
  value: string | number;
  label: string;
  highlight?: boolean;
}

export const RipsStatCard = memo<RipsStatCardProps>(({ 
  icon: Icon, 
  value, 
  label, 
  highlight = false 
}) => (
  <div className={`stat-card${highlight ? ' highlight' : ''}`}>
    {Icon && <Icon size={24} />}
    <div className="stat-content">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
));

RipsStatCard.displayName = 'RipsStatCard';

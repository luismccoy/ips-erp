/**
 * SwipeableShiftCard Component
 *
 * Framer Motion drag wrapper that reveals quick-action buttons when
 * the user swipes the shift card to the left. Actions: Navigate, Quick Vitals, Call.
 */

import { useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MapPin, Activity, Phone } from 'lucide-react';

export interface SwipeableShiftCardProps {
  children: React.ReactNode;
  /** Open device maps with patient address */
  onNavigate: () => void;
  /** Open the QuickVitalsSheet for this shift */
  onQuickVitals: () => void;
  /** Open tel: link for patient/family */
  onCall: () => void;
  /** Disable swipe (e.g. during visit documentation) */
  disabled?: boolean;
}

const ACTIONS_WIDTH = 160;
const SNAP_THRESHOLD = 80;

export function SwipeableShiftCard({
  children,
  onNavigate,
  onQuickVitals,
  onCall,
  disabled = false,
}: SwipeableShiftCardProps) {
  const x = useMotionValue(0);
  const isOpenRef = useRef(false);

  // Map x position to action button opacity (fade in as card slides)
  const actionsOpacity = useTransform(x, [-ACTIONS_WIDTH, -SNAP_THRESHOLD, 0], [1, 0.6, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = isOpenRef.current ? -SNAP_THRESHOLD : -SNAP_THRESHOLD;

    if (info.offset.x < threshold || info.velocity.x < -200) {
      // Snap open
      x.set(-ACTIONS_WIDTH);
      isOpenRef.current = true;
    } else {
      // Snap closed
      x.set(0);
      isOpenRef.current = false;
    }
  };

  const closeActions = () => {
    x.set(0);
    isOpenRef.current = false;
  };

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action buttons behind the card */}
      <motion.div
        style={{ opacity: actionsOpacity }}
        className="absolute inset-y-0 right-0 flex items-stretch"
      >
        <button
          onClick={() => {
            closeActions();
            onNavigate();
          }}
          className="w-[53px] flex flex-col items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          aria-label="Navegar al paciente"
        >
          <MapPin size={20} />
          <span className="text-[10px] font-medium">Navegar</span>
        </button>
        <button
          onClick={() => {
            closeActions();
            onQuickVitals();
          }}
          className="w-[53px] flex flex-col items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
          aria-label="Signos vitales rápidos"
        >
          <Activity size={20} />
          <span className="text-[10px] font-medium">Vitales</span>
        </button>
        <button
          onClick={() => {
            closeActions();
            onCall();
          }}
          className="w-[54px] flex flex-col items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white transition-colors"
          aria-label="Llamar al paciente"
        >
          <Phone size={20} />
          <span className="text-[10px] font-medium">Llamar</span>
        </button>
      </motion.div>

      {/* Draggable card content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -ACTIONS_WIDTH, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        dragMomentum={false}
        className="relative z-10 touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}

export default SwipeableShiftCard;

/**
 * SwipeableShiftCard Component
 *
 * Framer Motion drag wrapper that reveals quick-action buttons when
 * the user swipes the shift card to the left. Actions: Navigate, Quick Vitals, Call.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { MapPin, Activity, Phone, ChevronLeft } from 'lucide-react';

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
  /** Show swipe hint animation on this card */
  showHint?: boolean;
}

const ACTIONS_WIDTH = 160;
const SNAP_THRESHOLD = 80;

export function SwipeableShiftCard({
  children,
  onNavigate,
  onQuickVitals,
  onCall,
  disabled = false,
  showHint = false,
}: SwipeableShiftCardProps) {
  const x = useMotionValue(0);
  const isOpenRef = useRef(false);
  const [hintVisible, setHintVisible] = useState(showHint);

  // Auto-dismiss swipe hint after 4 seconds
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => setHintVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

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

        {/* Swipe hint overlay — teaches the gesture, auto-dismisses */}
        <AnimatePresence>
          {hintVisible && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-blue-600/90 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-lg pointer-events-none z-20 md:hidden"
            >
              <motion.div
                animate={{ x: [-3, 3, -3] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronLeft size={14} />
              </motion.div>
              Desliza
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Desktop-visible quick actions (always shown on md+ screens) */}
      <div className="hidden md:flex items-center gap-1.5 mt-1.5 px-1">
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors"
          aria-label="Navegar al paciente"
        >
          <MapPin size={13} />
          Navegar
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onQuickVitals(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 rounded-lg transition-colors"
          aria-label="Signos vitales rápidos"
        >
          <Activity size={13} />
          Vitales
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onCall(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 rounded-lg transition-colors"
          aria-label="Llamar al paciente"
        >
          <Phone size={13} />
          Llamar
        </button>
      </div>
    </div>
  );
}

export default SwipeableShiftCard;

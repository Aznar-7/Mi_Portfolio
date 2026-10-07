import { useRef, useState } from 'react';
import { motion, useDragControls } from 'motion/react';
import { Minus, Square, Copy, X } from 'lucide-react';

const MIN_W = 320;
const MIN_H = 220;
const SNAP_TOP_PX = 8; // dragging the title bar above this maximizes, like GNOME

// GNOME/Yaru-style controls on the right of the header bar
function WinBtn({ onClick, label, danger, children }) {
  return (
    <button
      aria-label={label}
      title={label}
      onPointerDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={`flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] text-white/80 transition-colors ${danger ? 'hover:bg-[#E95420] hover:text-white' : 'hover:bg-white/20'}`}
    >
      {children}
    </button>
  );
}

/**
 * Draggable, resizable app window. Minimized windows stay mounted (hidden)
 * so app state such as a game in progress or terminal history survives.
 */
export function Window({ title, children, zIndex, isFocused, isMaximized, isMobile, defaultTop, defaultLeft, defaultW = 780, defaultH = 500, onFocus, onClose, onMinimize, onMaximize, isHidden = false }) {
  const dragControls = useDragControls();
  const rootRef = useRef(null);
  const [size, setSize] = useState(null); // null = default size
  const full = isMaximized || isMobile;
  const canDrag = !full;

  const startResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = rootRef.current.getBoundingClientRect();
    const start = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height };
    const onMove = (ev) => setSize({
      w: Math.max(MIN_W, start.w + ev.clientX - start.x),
      h: Math.max(MIN_H, start.h + ev.clientY - start.y),
    });
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <motion.div
      ref={rootRef}
      role="dialog"
      aria-label={title}
      aria-hidden={isHidden || undefined}
      drag={canDrag} dragControls={dragControls} dragListener={false}
      dragMomentum={false} dragElastic={0}
      onDragEnd={(e) => { if (e.clientY <= SNAP_TOP_PX && !isMaximized) onMaximize(); }}
      onPointerDown={onFocus}
      initial={{ scale: 0.92, opacity: 0 }}
      animate={isHidden
        ? { scale: 0.3, opacity: 0, transitionEnd: { visibility: 'hidden' } }
        : { scale: 1, opacity: 1, visibility: 'visible', ...(full ? { x: 0, y: 0 } : {}) }}
      exit={{ scale: 0.92, opacity: 0, transition: { duration: 0.14 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      className={`absolute flex flex-col overflow-hidden ${isHidden ? 'pointer-events-none' : 'pointer-events-auto'} ${full ? 'inset-0 rounded-none' : 'rounded-xl'}`}
      style={{
        zIndex,
        transformOrigin: 'bottom left',
        width:  full ? '100%' : size ? size.w : `min(${defaultW}px, 92vw)`,
        height: full ? '100%' : size ? size.h : `min(${defaultH}px, 82vh)`,
        top:    full ? 0 : defaultTop,
        left:   full ? 0 : defaultLeft,
        boxShadow: isFocused ? '0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.1)' : '0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
      }}
    >
      {/* Header bar: the only drag handle */}
      <div
        onPointerDown={(e) => canDrag && dragControls.start(e)}
        onDoubleClick={onMaximize}
        className={`relative flex h-10 flex-shrink-0 select-none items-center px-3 ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} ${isFocused ? 'bg-[#303030]' : 'bg-[#242424]'}`}
      >
        <span className={`flex-1 truncate text-center text-[13px] font-semibold transition-colors ${isFocused ? 'text-white/85' : 'text-white/45'}`}>{title}</span>
        <div className="absolute right-2.5 flex items-center gap-2">
          <WinBtn label="Minimizar" onClick={onMinimize}><Minus size={12} /></WinBtn>
          <WinBtn label={isMaximized ? 'Restaurar' : 'Maximizar'} onClick={onMaximize}>
            {isMaximized ? <Copy size={10} /> : <Square size={10} />}
          </WinBtn>
          <WinBtn label="Cerrar" onClick={onClose} danger><X size={13} /></WinBtn>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 cursor-default flex-col overflow-hidden bg-[#1e1e1e]">{children}</div>

      {!full && (
        <div
          aria-hidden="true"
          onPointerDown={startResize}
          className="absolute bottom-0 right-0 z-10 h-4 w-4 cursor-nwse-resize"
          style={{ background: 'linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.18) 60%, transparent 60%, transparent 72%, rgba(255,255,255,0.18) 72%, rgba(255,255,255,0.18) 82%, transparent 82%)' }}
        />
      )}
    </motion.div>
  );
}

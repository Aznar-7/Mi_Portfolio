import { useState } from 'react';
import { motion, useDragControls } from 'motion/react';

function WinBtn({ bg, hover, onClick, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black transition-all"
      style={{ background: hovered ? hover : bg, color: hovered ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)' }}
    >
      {children}
    </button>
  );
}

export function Window({ title, children, zIndex, isFocused, isMaximized, isMobile, defaultTop, defaultLeft, defaultW = 780, defaultH = 500, onFocus, onClose, onMinimize, onMaximize, isHidden = false }) {
  const dragControls = useDragControls();
  const canDrag = !isMaximized && !isMobile;
  return (
    <motion.div
      drag={canDrag} dragControls={dragControls} dragListener={false}
      dragMomentum={false} dragElastic={0}
      onPointerDown={onFocus}
      initial={{ scale: 0.88, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        ...(isMaximized || isMobile ? { x: 0, y: 0 } : {})
      }}
      exit={{ scale: 0.88, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      className={`absolute flex flex-col overflow-hidden pointer-events-auto ${isMaximized || isMobile ? 'inset-0 rounded-none' : 'rounded-lg'}`}
      style={{
        zIndex,
        width:  isMaximized || isMobile ? '100%' : `min(${defaultW}px, 92vw)`,
        height: isMaximized || isMobile ? '100%' : `min(${defaultH}px, 82vh)`,
        top:    isMaximized || isMobile ? 0 : defaultTop,
        left:   isMaximized || isMobile ? 0 : defaultLeft,
        boxShadow: isFocused ? '0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08)' : '0 16px 40px rgba(0,0,0,0.5)',
      ...(isHidden ? { display: 'none', pointerEvents: 'none' } : {}),
      }}
    >
      {/* Title bar — only this can initiate a drag */}
      <div
        onPointerDown={(e) => canDrag && dragControls.start(e)}
        onDoubleClick={onMaximize}
        className={`h-9 flex items-center px-3 gap-2 flex-shrink-0 ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} select-none border-b ${isFocused ? 'bg-[#3c3c3c] border-black/40' : 'bg-[#282828] border-black/25'}`}
      >
        <div className="flex items-center gap-1.5 opacity-90">
          <WinBtn bg="#ff5f57" hover="#e0443f" onClick={onClose}>×</WinBtn>
          <WinBtn bg="#ffbd2e" hover="#dea123" onClick={onMinimize}>−</WinBtn>
          <WinBtn bg="#28c840" hover="#1ea831" onClick={onMaximize}>+</WinBtn>
        </div>
        <span className="flex-1 text-center text-[12px] text-white/70 truncate font-medium">{title}</span>
      </div>
      <div className="flex-1 overflow-hidden bg-[#1e1e1e] cursor-default flex flex-col min-h-0">{children}</div>
    </motion.div>
  );
}

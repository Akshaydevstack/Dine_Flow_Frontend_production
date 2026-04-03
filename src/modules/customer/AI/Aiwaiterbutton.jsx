import { useState, useEffect, useRef } from "react";
import AiWaiter from "./Aiwaiter";

// 1. Import your local transparent GIF here
import waiterGif from "./../../../assets/waiter.gif";

export default function AiWaiterButton() {
  const [open, setOpen]                   = useState(false);
  const [showBubble, setShowBubble]       = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [visible, setVisible]             = useState(true);
  const [isDismissed, setIsDismissed]     = useState(false);

  // NEW: State for the long-press "Remove" button
  const [showRemove, setShowRemove]       = useState(false);
  
  // NEW: State to force the GIF to restart
  const [currentGif, setCurrentGif]       = useState(waiterGif);

  // Dragging & Timing Refs
  const [position, setPosition]           = useState({ x: 0, y: 0 });
  const [isDraggingState, setIsDraggingState] = useState(false);
  
  const isDragging = useRef(false);
  const hasMoved   = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos   = useRef({ x: 0, y: 0 });
  const scrollTimer = useRef(null);
  const holdTimer   = useRef(null); // Timer for the long press

  /* ── 1. Scroll & GIF Restart Logic ── */
  useEffect(() => {
    const onScroll = () => {
      if (isDragging.current) return; 
      
      setVisible(false);
      setShowRemove(false); // Hide the remove button if they start scrolling

      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        setVisible(true);
        // Trick the browser into restarting the GIF by adding a unique timestamp
        setCurrentGif(`${waiterGif}?t=${new Date().getTime()}`);
      }, 1500);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimer.current);
    };
  }, []);

  /* ── 2. Speech bubble timing ── */
  useEffect(() => {
    const t1 = setTimeout(() => {
      setShowBubble(true);
      setTimeout(() => setBubbleVisible(true), 50);
    }, 1200);

    const t2 = setTimeout(() => {
      setBubbleVisible(false);
      setTimeout(() => setShowBubble(false), 400);
    }, 5500);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  /* ── 3. Drag & Drop Event Listeners ── */
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDragging.current) return;

      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;

      // If they move the mouse/finger, it's a drag. Cancel the long press!
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved.current = true;
        clearTimeout(holdTimer.current); 
      }

      setPosition({
        x: startPos.current.x + dx,
        y: startPos.current.y + dy,
      });
    };

    const handlePointerUp = () => {
      clearTimeout(holdTimer.current); // Clear timer when they let go
      if (isDragging.current) {
        isDragging.current = false;
        setIsDraggingState(false);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const handlePointerDown = (e) => {
    e.preventDefault(); 
    isDragging.current = true;
    hasMoved.current = false;
    setIsDraggingState(true);
    setShowRemove(false); // Hide the 'X' if they touch it again
    
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current = { ...position };

    // NEW: Start the long press timer (500ms)
    holdTimer.current = setTimeout(() => {
      if (!hasMoved.current) {
        setShowRemove(true); // Show the 'X' after holding for half a second
      }
    }, 500);
  };

  const handleButtonClick = () => {
    // Only open the chat if they clicked (didn't drag, and didn't trigger the long press 'X')
    if (!hasMoved.current && !showRemove) {
      setOpen(true);
    }
  };

  if (isDismissed) return null;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(90px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0px);  }
          50%      { transform: translateY(-5px); }
        }
        .ai-character-wrapper {
          animation: slideInRight 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                     bob 3s ease-in-out 2s infinite;
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        .ai-badge-enter { animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes bubbleIn {
          from { transform: scale(0.7) translateY(8px); opacity: 0; }
          to   { transform: scale(1)   translateY(0);   opacity: 1; }
        }
        .ai-bubble-enter { animation: bubbleIn 0.35s cubic-bezier(0.34, 1.4, 0.64, 1) forwards; }
      `}</style>

      <div
        className="fixed bottom-20 right-0 z-[1000] flex flex-col items-end gap-2"
        style={{
          opacity:       visible ? 1 : 0,
          transform:     `translate(${position.x}px, ${position.y}px) translateX(${visible ? 0 : 70}px)`,
          transition:    isDraggingState ? "none" : "opacity 0.35s ease, transform 0.35s ease",
          pointerEvents: visible ? "auto" : "none",
          touchAction:   "none" 
        }}
      >
        {/* Speech bubble */}
        {showBubble && !showRemove && (
          <div
            className={`
              relative mr-5 max-w-[160px]
              bg-white dark:bg-gray-800
              text-gray-800 dark:text-gray-100
              text-xs font-semibold leading-snug
              px-3 py-2.5 rounded-2xl rounded-br-sm
              shadow-lg dark:shadow-black/30
              transition-opacity duration-400
              ${bubbleVisible ? "opacity-100 ai-bubble-enter" : "opacity-0"}
            `}
          >
            Need help ordering? 👋
            <span
              className="absolute -bottom-2 right-3 w-0 h-0"
              style={{
                borderLeft:     "8px solid transparent",
                borderRight:    "0px solid transparent",
                borderTop:      "8px solid",
                borderTopColor: "inherit",
              }}
            />
          </div>
        )}

        {/* Character & Close Button Wrapper */}
        <div className="ai-character-wrapper relative">
          
          {/* Long Press Close Button */}
          {showRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                setIsDismissed(true);
              }}
              className="ai-badge-enter absolute -top-1 -left-1 z-50 w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full flex items-center justify-center text-sm shadow-xl transition-colors cursor-pointer"
              aria-label="Hide AI Waiter"
            >
              ✕
            </button>
          )}

          {/* Character Drag/Click button */}
          <button
            onClick={handleButtonClick}
            onPointerDown={handlePointerDown}
            className={`relative flex items-end justify-center w-24 h-24 focus:outline-none group ${
              isDraggingState ? "cursor-grabbing" : "cursor-pointer"
            } ${showRemove ? "animate-pulse" : ""}`}
            aria-label="Open AI Waiter"
          >
            {/* The source uses currentGif to force restarts */}
            <img
              src={currentGif}
              alt="AI Waiter"
              className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-200 pointer-events-none"
            />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-2 rounded-full bg-purple-400/20 blur-sm -z-10" />
          </button>
        </div>
      </div>

      {open && <AiWaiter onClose={() => setOpen(false)} />}
    </>
  );
}
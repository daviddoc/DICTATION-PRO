import React, { useState, useRef } from 'react';
import { Delete, CornerDownLeft, Space } from 'lucide-react';

interface CustomKeyboardProps {
  onKeyPress: (key: string, type: 'CHAR' | 'BACKSPACE' | 'ENTER' | 'SPACE' | 'DELETE_WORD' | 'TOGGLE_CASE') => void;
}

export const CustomKeyboard: React.FC<CustomKeyboardProps> = ({ onKeyPress }) => {
  const [showNumbers, setShowNumbers] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Backspace Logic Refs
  const deleteIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startXRef = useRef<number>(0);
  const isDeletingRef = useRef<boolean>(false);
  const deleteModeRef = useRef<'CHAR' | 'WORD'>('CHAR');

  const scrollableSymbols = [
    ':', ';', '*', '-', '_', '¡', '!', '¿', '?', '#', '@', '&', '€', "'", '|', '[', ']', '(', ')', '{', '}', '/', '\\', '<', '>'
  ];

  const numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  // --- Backspace Handlers ---

  const handleBackspaceDown = (e: React.PointerEvent) => {
    e.preventDefault(); 
    e.currentTarget.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
    isDeletingRef.current = true;
    deleteModeRef.current = 'CHAR';
    setActiveKey('BACKSPACE');

    // Initial delete
    onKeyPress('', 'BACKSPACE');

    // Wait 500ms before rapid delete
    deleteTimeoutRef.current = setTimeout(() => {
      if (isDeletingRef.current) {
        deleteIntervalRef.current = setInterval(() => {
           if (deleteModeRef.current === 'CHAR') {
             onKeyPress('', 'BACKSPACE');
           }
        }, 100);
      }
    }, 500);
  };

  const handleBackspaceMove = (e: React.PointerEvent) => {
    if (!isDeletingRef.current) return;

    const currentX = e.clientX;
    const diff = currentX - startXRef.current;

    // If dragged left significantly (swiping), switch to word deletion
    // Threshold set to -35px for responsiveness
    if (diff < -35) {
      // Switch mode if not already in word mode
      if (deleteModeRef.current === 'CHAR') {
         if (deleteIntervalRef.current) clearInterval(deleteIntervalRef.current);
         if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
         deleteModeRef.current = 'WORD';
      }
      
      // Trigger word deletion
      onKeyPress('', 'DELETE_WORD');
      
      // Reset startX to current to require another 'swipe' distance for the next word
      startXRef.current = currentX; 
      
      // Feedback vibration
      if (navigator.vibrate) navigator.vibrate(20);
    }
  };

  const handleBackspaceUp = (e: React.PointerEvent) => {
    isDeletingRef.current = false;
    setActiveKey(null);
    if (deleteIntervalRef.current) clearInterval(deleteIntervalRef.current);
    if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // --- General Key Handlers ---

  const handleKeyClick = (val: string) => {
    onKeyPress(val, 'CHAR');
    if (navigator.vibrate) navigator.vibrate(5);
  };

  return (
    <div className="w-full bg-slate-800 pb-safe-area select-none flex flex-col shrink-0 border-t border-slate-700 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
      
      {/* Number Row (Overlay/Toggle) */}
      {showNumbers && (
        <div className="flex w-full h-12 bg-slate-800 border-b border-slate-700 animate-in slide-in-from-bottom-2 duration-150">
          {numberRow.map((num) => (
            <button
              key={num}
              onClick={() => handleKeyClick(num)}
              className="flex-1 active:bg-slate-600 transition-colors flex items-center justify-center font-semibold text-lg text-slate-200"
            >
              {num}
            </button>
          ))}
        </div>
      )}

      {/* Scrollable Symbols Row */}
      <div className="w-full h-12 overflow-x-auto flex items-center px-2 no-scrollbar bg-slate-800 border-b border-slate-700 gap-1">
        {scrollableSymbols.map((char) => (
          <button
            key={char}
            onClick={() => handleKeyClick(char)}
            className="flex-shrink-0 min-w-[40px] h-10 rounded-md hover:bg-slate-700 active:bg-indigo-900 active:text-indigo-200 flex items-center justify-center text-lg font-medium text-slate-300 transition-colors"
          >
            {char}
          </button>
        ))}
        <div className="w-4 shrink-0"></div>
      </div>

      {/* Main Action Row */}
      <div className="grid grid-cols-[1fr_1fr_0.6fr_0.6fr_2fr_1fr_1fr] gap-1 p-1 h-14 sm:h-16 bg-slate-800">
        {/* 123 Toggle */}
        <button
          onClick={() => setShowNumbers(!showNumbers)}
          className={`rounded-lg shadow-sm font-bold text-sm sm:text-base transition-all ${showNumbers ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}
        >
          123
        </button>

        {/* Aa (Case Toggle) */}
        <button
           onClick={() => onKeyPress('', 'TOGGLE_CASE')}
           className="bg-slate-700 rounded-lg shadow-sm font-semibold text-sm sm:text-base text-slate-200 active:bg-slate-600"
        >
          Aa
        </button>

        {/* Dot */}
        <button
          onClick={() => handleKeyClick('.')}
          className="bg-slate-700 rounded-lg shadow-sm text-xl font-bold text-slate-200 active:bg-slate-600"
        >
          .
        </button>

        {/* Comma */}
        <button
          onClick={() => handleKeyClick(',')}
          className="bg-slate-700 rounded-lg shadow-sm text-xl font-bold text-slate-200 active:bg-slate-600"
        >
          ,
        </button>

        {/* Space */}
        <button
          onClick={() => onKeyPress(' ', 'SPACE')}
          className="bg-slate-700 rounded-lg shadow-sm flex items-center justify-center active:bg-slate-600"
        >
          <Space size={20} className="text-slate-400" />
        </button>

        {/* Backspace (Special Logic) */}
        <button
          onPointerDown={handleBackspaceDown}
          onPointerMove={handleBackspaceMove}
          onPointerUp={handleBackspaceUp}
          onPointerLeave={handleBackspaceUp}
          className={`touch-none rounded-lg shadow-sm flex items-center justify-center transition-colors ${activeKey === 'BACKSPACE' ? 'bg-red-900/50 text-red-400' : 'bg-slate-600 text-slate-200'}`}
        >
          <Delete size={22} />
        </button>

        {/* Enter */}
        <button
          onClick={() => onKeyPress('\n', 'ENTER')}
          className="bg-indigo-600 rounded-lg shadow-sm flex items-center justify-center text-white active:bg-indigo-700"
        >
          <CornerDownLeft size={22} />
        </button>
      </div>
      
      <div className="h-safe-bottom bg-slate-800"></div>
    </div>
  );
};
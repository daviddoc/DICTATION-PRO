import React from 'react';
import { Mic, Play, Copy, Trash2, Keyboard, ChevronDown, Loader2, Smartphone, Square } from 'lucide-react';
import { Language } from '../types';

interface TopBarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  onCopy: () => void;
  onClear: () => void;
  isListening: boolean;
  toggleListening: () => void;
  onPlay: () => void;
  onStop: () => void;
  audioState: 'idle' | 'loading' | 'playing';
  showSystemKeyboard: boolean;
  toggleSystemKeyboard: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  language,
  setLanguage,
  onCopy,
  onClear,
  isListening,
  toggleListening,
  onPlay,
  onStop,
  audioState,
  showSystemKeyboard,
  toggleSystemKeyboard
}) => {
  const [showLangMenu, setShowLangMenu] = React.useState(false);

  const langLabels = {
    [Language.ES]: "Español",
    [Language.EN]: "English",
    [Language.FR]: "Français"
  };

  const handlePlayStop = () => {
    if (audioState === 'playing') {
      onStop();
    } else if (audioState === 'idle') {
      onPlay();
    }
  };

  return (
    <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-2 sm:px-4 shadow-sm shrink-0 z-20 relative">
      {/* Language Selector */}
      <div className="relative">
        <button 
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-sm font-medium text-slate-200"
        >
          {langLabels[language]}
          <ChevronDown size={14} />
        </button>
        
        {showLangMenu && (
          <div className="absolute top-full left-0 mt-1 bg-slate-800 rounded-lg shadow-xl border border-slate-600 py-1 w-32 flex flex-col animate-in fade-in zoom-in-95 duration-100 z-50">
            {(Object.values(Language) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setShowLangMenu(false);
                }}
                className={`text-left px-4 py-2 text-sm hover:bg-slate-700 ${language === lang ? 'text-indigo-400 font-semibold' : 'text-slate-300'}`}
              >
                {langLabels[lang]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions Group */}
      <div className="flex items-center gap-1 sm:gap-3">
        <button onClick={onCopy} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-full transition-all" title="Copiar">
          <Copy size={20} />
        </button>
        
        <button onClick={onClear} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full transition-all" title="Limpiar texto">
          <Trash2 size={20} />
        </button>

        <div className="h-6 w-px bg-slate-600 mx-1 hidden sm:block"></div>

        <button 
          onClick={toggleListening} 
          className={`px-3 py-2 rounded-full transition-all flex items-center justify-center min-w-[44px] ${isListening ? 'bg-red-900/50 text-red-500 ring-1 ring-red-500/50' : 'bg-slate-700 text-indigo-400 hover:bg-slate-600'}`}
          title={isListening ? "Detener dictado" : "Dictar"}
        >
          {isListening ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold tracking-wider">REC</span>
            </div>
          ) : (
            <Mic size={20} />
          )}
        </button>

        <button 
          onClick={handlePlayStop}
          disabled={audioState === 'loading'}
          className={`p-2 rounded-full transition-all disabled:opacity-50 ${audioState === 'playing' ? 'text-red-400 hover:bg-red-900/30' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-700'}`}
          title={audioState === 'playing' ? "Detener" : "Reproducir"}
        >
          {audioState === 'loading' ? (
            <Loader2 size={20} className="animate-spin"/>
          ) : audioState === 'playing' ? (
            <Square size={20} fill="currentColor" />
          ) : (
            <Play size={20} />
          )}
        </button>

        <button 
          onClick={toggleSystemKeyboard}
          className={`p-2 rounded-full transition-all ${showSystemKeyboard ? 'text-indigo-400 bg-slate-700' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'}`}
          title={showSystemKeyboard ? "Ocultar teclado del sistema" : "Mostrar teclado del sistema"}
        >
          {showSystemKeyboard ? <Keyboard size={20} /> : <Smartphone size={20} />}
        </button>
      </div>
    </div>
  );
};
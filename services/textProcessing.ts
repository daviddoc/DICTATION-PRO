import { Language } from "../types";

/**
 * Checks if the string ends with a sentence terminator.
 */
export const shouldCapitalizeNext = (text: string): boolean => {
  if (!text || text.trim().length === 0) return true;
  const lastChar = text.trim().slice(-1);
  return ['.', '!', '?', '\n'].includes(lastChar);
};

/**
 * Capitalizes the first letter of a string.
 */
export const capitalizeFirst = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Post-processes a chunk of text to fix spacing and capitalization rules.
 * @param newChunk The newly dictated chunk of text.
 * @param previousText The existing text in the editor (to determine context).
 * @param language The current language.
 */
export const processTextChunk = (
  newChunk: string, 
  previousText: string, 
  language: Language
): string => {
  let processed = newChunk;

  // 1. Contextual Capitalization
  // We look at the *previous* text to decide if this new chunk starts a sentence.
  if (shouldCapitalizeNext(previousText)) {
    processed = capitalizeFirst(processed.trimStart());
    // Restore leading space if it was trimmed and previous text wasn't empty/newline
    if (previousText.length > 0 && !previousText.endsWith('\n') && newChunk.startsWith(' ')) {
        processed = ' ' + processed;
    }
  }

  // 2. Language Specific Fixes
  if (language === Language.EN) {
    // Fix isolated lowercase "i" -> "I"
    processed = processed.replace(/(\s|^)i(\s|$)/g, '$1I$2');
    processed = processed.replace(/(\s|^)i'm(\s|$)/g, '$1I\'m$2');
  }

  // 3. Spacing normalization (General)
  
  // Remove spaces BEFORE punctuation: "word ." -> "word."
  // Applies to . , ; : ! ? ) ] }
  processed = processed.replace(/\s+([.,;:!?\)\]\}])/g, '$1');

  // Ensure spaces AFTER punctuation: "word,word" -> "word, word"
  // Look for punctuation followed immediately by a letter or number
  processed = processed.replace(/([.,;:!?])([a-zA-Z0-9])/g, '$1 $2');

  // Fix Spanish opening marks spacing: "word¿" -> "word ¿"
  if (language === Language.ES) {
     processed = processed.replace(/([a-zA-Z0-9])([¿¡])/g, '$1 $2');
  }

  // 4. Double space cleanup (just in case)
  processed = processed.replace(/\s{2,}/g, ' ');

  return processed;
};

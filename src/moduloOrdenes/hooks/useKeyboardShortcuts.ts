import { useEffect } from 'react';

type ShortcutHandler = (e: KeyboardEvent) => void;

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  handler: ShortcutHandler;
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrlKey, altKey, shiftKey, handler }) => {
        if (
          e.key.toLowerCase() === key.toLowerCase() &&
          !!e.ctrlKey === !!ctrlKey &&
          !!e.altKey === !!altKey &&
          !!e.shiftKey === !!shiftKey
        ) {
          e.preventDefault();
          handler(e);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}; 
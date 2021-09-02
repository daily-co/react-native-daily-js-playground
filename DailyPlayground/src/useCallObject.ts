import { useContext } from 'react';
import CallObjectContext from './CallObjectContext';

export function useCallObject() {
  return useContext(CallObjectContext);
}

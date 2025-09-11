// pages/journal.patched.js — adds gold on mood check-ins & entries
import { load, save } from '../util/storage.js';

export function saveJournalEntry(text, mood='', note=''){
  NQ.pushJournal(text, mood, note);
  NQ.addGold(1);
  const s = load(); // pull latest normalized
  return save(s);
}

export function saveMood(mood, note=''){
  NQ.pushMood(mood, note);
  NQ.addGold(1);
  const s = load();
  return save(s);
}

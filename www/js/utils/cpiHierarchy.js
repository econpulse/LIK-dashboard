/**
 * BFS / COICOP CPI Hierarchy & Node Utilities
 */
import { state } from '../state.js';

export function getItemName(item) {
  if (!item || !item.names) return '';
  return item.names[state.lang] || item.names.de || item.code;
}

export function getBfsCode(item) {
  if (!item) return '—';
  if (typeof item.bfs_code === 'string' && item.bfs_code.length > 0) return item.bfs_code;
  if (typeof item.code === 'string' && item.code.length > 0) return item.code;
  return '—';
}

export function getCoicopCode(item) {
  if (!item) return '';
  if (typeof item.coicop === 'string') {
    return item.coicop.replace(/^'+/, '').trim();
  }
  return '';
}

// Defensive helper: guarantees children is always a JavaScript Array
export function getItemChildren(item) {
  if (!item || !item.children) return [];
  if (Array.isArray(item.children)) return item.children;
  if (typeof item.children === 'string' && item.children.length > 0) return [item.children];
  return [];
}

// Helper: check if item has non-empty time-series history
export function getItemHistory(item) {
  if (!item || !item.history) return null;
  if (Array.isArray(item.history.index) && item.history.index.length > 0) return item.history;
  if (Array.isArray(item.history.yoy) && item.history.yoy.length > 0) return item.history;
  return null;
}

// Check if an item has meaningful children to drill down into
export function hasDrilldownChildren(item, getItemFn) {
  const rawChildren = getItemChildren(item);
  if (rawChildren.length === 0) return false;
  
  // Filter actual existing children in dataset
  const validChildren = rawChildren.map(c => getItemFn(c)).filter(Boolean);
  if (validChildren.length === 0) return false;

  // If it only has 1 child and that child has no children and has the exact same name, it's a leaf endpoint
  if (validChildren.length === 1) {
    const singleChild = validChildren[0];
    const singleChildChildren = getItemChildren(singleChild);
    const childHasChildren = singleChildChildren.length > 0;
    const sameName = getItemName(singleChild).trim().toLowerCase() === getItemName(item).trim().toLowerCase();
    if (!childHasChildren && sameName) {
      return false;
    }
  }
  return true;
}

// Reconstruct exact ancestral path for any node (from 100_100 down to code)
export function buildAncestralPath(code, getItemFn) {
  const path = [];
  let curr = getItemFn(code);
  while (curr) {
    path.unshift(curr.code);
    if (curr.code === '100_100' || !curr.parent) break;
    curr = getItemFn(curr.parent);
  }
  if (path.length === 0 || path[0] !== '100_100') {
    path.unshift('100_100');
  }
  return path;
}

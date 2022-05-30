import { triggerPendingReactions } from './reaction';

// Depth of action nested updates.
let batchTrackDepth = 0;

export function startBatch() {
  batchTrackDepth++;
}

export function endBatch() {
  if (--batchTrackDepth > 0) {
    return;
  }
  triggerPendingReactions();
}

export function inBatch() {
  return batchTrackDepth > 0;
}

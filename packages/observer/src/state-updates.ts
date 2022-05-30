let allowStateUpdates = false;

export function enableAllowStateUpdates(strict: boolean) {
  if (!strict) {
    return;
  }
  allowStateUpdates = true;
}

export function disableAllowStateUpdates() {
  allowStateUpdates = false;
}

export function hasAllowStateUpdates() {
  return allowStateUpdates;
}

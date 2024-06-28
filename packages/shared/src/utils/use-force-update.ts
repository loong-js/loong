import { useState } from 'react';

export function useForceUpdate(): [() => void, number] {
  const [updateCount, setUpdateCount] = useState(0);

  const forceUpdate = () => {
    setUpdateCount((prevCount) => prevCount + 1);
  };

  return [forceUpdate, updateCount];
}

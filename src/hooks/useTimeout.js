import { useEffect, useRef } from "react";

function useTimeout(callback, delay) {
  const savedCallback = useRef(callback);

  // Update ref if callback changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // Only set the timeout if delay is not null.
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

export default useTimeout;

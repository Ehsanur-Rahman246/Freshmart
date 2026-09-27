import { useEffect, useState } from "react";
import { getSocket, onSocketReady } from "../api/socket";

// Returns the live socket instance, and re-renders consumers once it
// connects — fixes hooks that mounted before connectSocket() resolved.
export const useSocket = () => {
  const [socket, setSocket] = useState(getSocket());

  useEffect(() => onSocketReady(setSocket), []);

  return socket;
};

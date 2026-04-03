import { useEffect, useRef } from "react";

export const useWaiterTableSessionSocket = ({ token, onMessage }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(
      `wss://api.dineflow.store/ws/waiter/table-sessions/?token=${token}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Waiter Table Session WebSocket Connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error("❌ Failed parsing websocket message", err);
      }
    };

    socket.onerror = (err) => {
      console.error("❌ Waiter WebSocket error", err);
    };

    socket.onclose = () => {
      console.log("🔌 Waiter Table Session WebSocket closed");
    };

    return () => {
      socket.close();
    };
  }, [token, onMessage]);
};
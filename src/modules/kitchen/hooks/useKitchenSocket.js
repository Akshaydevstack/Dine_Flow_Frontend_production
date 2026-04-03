import { useEffect, useRef } from "react";

export const useKitchenSocket = ({ token, onMessage }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(
      `wss://api.dineflow.store/ws/kitchen/?token=${token}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Kitchen WebSocket Connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket closed");
    };

    return () => {
      socket.close();
    };
  }, [token, onMessage]);
};
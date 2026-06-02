import { useEffect, useRef } from "react";

// Helper to derive the WebSocket base URL from the API URL
// e.g., transforms "http://localhost:30080/api" -> "ws://localhost:30080"
const getWsBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:30080/api";
  return apiUrl.replace(/^http/, "ws").replace(/\/api\/?$/, "");
};

const WS_BASE = getWsBaseUrl();

// ==========================================
// 1. Table Session Socket (Existing)
// ==========================================
export const useWaiterTableSessionSocket = ({ token, onMessage }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // 🟢 Dynamic URL
    const socket = new WebSocket(
      `${WS_BASE}/ws/waiter/table-sessions/?token=${token}`
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

// ==========================================
// 2. Waiter Display Socket (New for Alerts)
// ==========================================

export const useWaiterDisplaySocket = ({ token, onMessage }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // We only need the token now
    if (!token) return;

    // 🟢 Dynamic URL
    const socket = new WebSocket(
      `${WS_BASE}/ws/waiter-display/?token=${token}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Waiter Display WebSocket Connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) {
          onMessage(data);
        }
      } catch (err) {
        console.error("❌ Failed parsing display websocket message", err);
      }
    };

    socket.onerror = (err) => {
      console.error("❌ Waiter Display WebSocket error", err);
    };

    socket.onclose = () => {
      console.log("🔌 Waiter Display WebSocket closed");
    };

    return () => {
      socket.close();
    };
  }, [token, onMessage]);
};
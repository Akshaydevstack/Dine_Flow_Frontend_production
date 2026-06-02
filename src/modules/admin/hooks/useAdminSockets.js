import { useEffect, useRef } from "react";

// Helper to derive the WebSocket base URL from the API URL
const getWsBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:30080/api";
  return apiUrl.replace(/^http/, "ws").replace(/\/api\/?$/, "");
};

const WS_BASE = getWsBaseUrl();

// ==========================================
// 1. Admin Orders WebSocket Hook
// ==========================================
export const useAdminOrderSocket = ({ token, onMessage }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(`${WS_BASE}/ws/restaurant-admin/orders/?token=${token}`);
    socketRef.current = socket;

    socket.onopen = () => console.log("✅ Admin Orders WebSocket Connected");
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (err) {
        console.error("❌ Failed parsing admin orders message", err);
      }
    };

    socket.onerror = (err) => console.error("❌ Admin Orders WS error", err);
    socket.onclose = () => console.log("🔌 Admin Orders WS closed");

    return () => socket.close();
  }, [token, onMessage]);
};


// ==========================================
// 2. Admin Tables WebSocket Hook
// ==========================================
export const useAdminTableSocket = ({ token, onMessage }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(`${WS_BASE}/ws/restaurant-admin/tables/?token=${token}`);
    socketRef.current = socket;

    socket.onopen = () => console.log("✅ Admin Tables WebSocket Connected");
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (err) {
        console.error("❌ Failed parsing admin tables message", err);
      }
    };

    socket.onerror = (err) => console.error("❌ Admin Tables WS error", err);
    socket.onclose = () => console.log("🔌 Admin Tables WS closed");

    return () => socket.close();
  }, [token, onMessage]);
};
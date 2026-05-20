import { Outlet } from "react-router-dom";
import WaiterBottomNav from "../common/WaiterBottomNav";
import { useWaiterTableSessionSocket } from "../../hooks/useWaiterSocket";
import { updateTableSession } from "../../../../store/slices/waiterSlice/waiterTablesSlice";
import { useDispatch } from "react-redux";
import { useCallback } from "react";
import { useAppSelector } from "../../../../store/hooks";

export default function CustomerLayout() {
  const dispatch = useDispatch();
  const token = useAppSelector(
      (state) => state.auth.accessToken
    ); 

  const handleSessionUpdate = useCallback(
    (data) => {
      console.log("📡 Table session update:", data);
      dispatch(updateTableSession(data));
    },
    [dispatch],
  );

  useWaiterTableSessionSocket({
    token,
    onMessage: handleSessionUpdate,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-450 text-gray-900 dark:text-gray-100 font-body relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-5%] w-[500px] h-[500px] animate-pulse-slow" />

        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-[140px]" />

        <div className="absolute top-[30%] left-[-5%] w-72 h-72 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-[100px]" />

        <div className="absolute bottom-[20%] right-[5%] w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[110px]" />
      </div>

      <Outlet />
      <WaiterBottomNav />
    </div>
  );
}

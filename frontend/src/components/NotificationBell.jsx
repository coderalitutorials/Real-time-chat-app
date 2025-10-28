




import React from "react";
import { Bell, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useLogoutMutation } from "../api/authApi";

const NotificationBell = ({ unreadCount, setUnreadCount, onOpen }) => {
  const dispatch = useDispatch();
  const [logoutApi] = useLogoutMutation();

  const handleBellClick = () => {
    setUnreadCount(0); // reset unread count on click
    if (onOpen) onOpen();
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative cursor-pointer" onClick={handleBellClick}>
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-1 text-red-600 hover:text-red-800"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default NotificationBell;

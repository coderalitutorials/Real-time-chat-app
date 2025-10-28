


import { useEffect, useState } from "react";
import OnlineUsers from "../components/OnlineUsers";
import ChatPopup from "../components/ChatPopup";
import NotificationBell from "../components/NotificationBell"; // ✅ Added
import { useSelector } from "react-redux";
import { socket } from "../socket.js";
import { getToken } from "../utils/token.js";
import { getUnreadCount } from "../api/notificationApi.js"; // ✅

const Dashboard = () => {
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ Notification states
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

useEffect(() => {
  if (!isLoggedIn || !user?._id) return;

  if (!socket.connected) {
    socket.auth = { token: localStorage.getItem("token") };
    socket.connect();
  }

  socket.emit("userOnline", user._id);

  // ✅ Fetch unread count on first load
const fetchUnread = async () => {
  try {
    const token = getToken();
    const res = await getUnreadCount(user._id, token); // pass user._id
    setUnreadCount(res.unreadCount || 0);
  } catch (err) {
    console.error("Error fetching unread count:", err);
  }
};

  fetchUnread();

  // ✅ Listen for new notifications
  socket.on("newNotification", (data) => {
    console.log("🔔 New notification received:", data);
    setNotifications((prev) => [...prev, data]);
  });

  // ✅ Listen for unread count updates
  socket.on("notificationCountUpdated", ({ unreadCount }) => {
    console.log("📬 Unread count updated:", unreadCount);
    setUnreadCount(unreadCount);
  });

  // ✅ Debug events
  socket.on("connect_error", (err) =>
    console.error("Socket connection error:", err.message)
  );

  // ✅ Online users update
  socket.on("onlineUsers", (users) => {
    console.log("Online users:", users);
  });

  // ✅ Cleanup
  return () => {
    socket.emit("userOffline", user._id);
    socket.off("newNotification");
    socket.off("notificationCountUpdated");
    socket.off("onlineUsers");
  };
}, [isLoggedIn, user]);

  if (!isLoggedIn || !user?._id) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-300 text-lg">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar: Online Users */}
      <div className="w-80 p-4 border-r border-gray-700 overflow-y-auto">
        <OnlineUsers currentUserId={user._id} onSelectUser={setSelectedUser} />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* ✅ Navbar / Header */}
        <header className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800">
          <h2 className="font-semibold text-lg">Chat Dashboard</h2>
          <div className="flex items-center gap-3">
            <span className="text-gray-300 text-sm">{user.name}</span>
            {/* ✅ Pass props */}
   <NotificationBell
  unreadCount={unreadCount}
  setUnreadCount={setUnreadCount}
  notifications={notifications}
/>
          </div>
        </header>

        {/* ✅ Chat Area */}
        <div className="flex-1 p-4 relative overflow-y-auto">
          {selectedUser ? (
            <ChatPopup
              currentUser={user}
              chatUser={selectedUser}
              closeChat={() => setSelectedUser(null)}
            />
          ) : (
            <div className="text-gray-400 text-center mt-20 text-lg">
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


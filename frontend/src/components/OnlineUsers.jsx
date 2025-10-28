


import React, { useEffect, useState } from "react";
import { useGetUsersQuery } from "../api/usersApi";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

const socket = io("http://localhost:5000", { autoConnect: false });

const OnlineUsers = ({ currentUserId, onSelectUser }) => {
  const { data, isLoading } = useGetUsersQuery();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!currentUserId) return;

    socket.auth = { token: localStorage.getItem("token") };
    socket.connect();

    socket.emit("userOnline", currentUserId);

    socket.on("onlineUsers", (onlineIds) => {
      setOnlineUsers(onlineIds);
    });

    socket.on("connect_error", (err) => {
      toast.error("Socket connection error: " + err.message, { autoClose: 3000 });
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  if (isLoading) return <p className="text-gray-400 p-4">Loading users...</p>;

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-md h-full overflow-y-auto">
      <h3 className="text-xl font-bold text-indigo-400 mb-4 border-b border-gray-700 pb-2">
        Online Users
      </h3>
      <ul className="space-y-2">
        {data?.users
          .filter((u) => u._id !== currentUserId)
          .map((user) => {
            const isOnline = onlineUsers.includes(user._id) || user.online;
            return (
              <li
                key={user._id}
                onClick={() => onSelectUser(user)}
                className="flex items-center justify-between p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition cursor-pointer"
              >
                <div className="flex items-center">
                  <img
                    src={user.image || "/default-avatar.png"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover mr-3 border-2"
                    style={{ borderColor: isOnline ? "#22c55e" : "#6b7280" }}
                  />
                  <span className="text-white font-medium">{user.name}</span>
                </div>
                <span
                  className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}
                ></span>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default OnlineUsers;






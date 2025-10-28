

import React, { useEffect, useState, useRef, useCallback } from "react";
import { socket } from "../socket.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { markChatRead } from "../api/notificationApi.js";
import { getToken } from "../utils/token.js";

const ChatPopup = ({ currentUser, chatUser, closeChat }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ Keep latest chatUser in ref
  const chatUserRef = useRef(chatUser);
  useEffect(() => {
    chatUserRef.current = chatUser;
  }, [chatUser]);

  // ✅ Merge messages uniquely
  const mergeMessages = useCallback((existing, incoming) => {
    const map = new Map();
    [...existing, ...incoming].forEach((m) => {
      const key = m._id || `${m.sender}-${m.receiver}-${m.text}-${m.createdAt}`;
      map.set(key, m);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, []);

  // ✅ Fetch old messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatUser?._id) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${chatUser._id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load messages", err);
        toast.error("Failed to load messages");
      }
    };
    fetchMessages();
  }, [chatUser]);

  // ✅ Socket listeners
  useEffect(() => {
    if (!currentUser) return;

    // Connect socket if not connected
    if (!socket.connected) {
      socket.auth = { token: localStorage.getItem("token") };
      socket.connect();
    }

    // Receive message
    const handleReceiveMessage = (msg) => {
      const cu = chatUserRef.current;
      if (!cu) return;

      const isRelevant =
        (msg.sender === cu._id && msg.receiver === currentUser._id) ||
        (msg.receiver === cu._id && msg.sender === currentUser._id);

      if (isRelevant) {
        setMessages((prev) => mergeMessages(prev, [msg]));
      }
    };

    // Message status
    const handleMessageStatus = (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageStatusUpdate", handleMessageStatus);
    socket.on("connect_error", (err) => toast.error("Socket error: " + err.message));

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageStatusUpdate", handleMessageStatus);
    };
  }, [currentUser._id, mergeMessages]);

  // ✅ Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Mark messages seen
  useEffect(() => {
    messages
      .filter((msg) => msg.receiver === currentUser._id && msg.status !== "seen")
      .forEach((msg) => socket.emit("messageSeen", { messageId: msg._id }));
  }, [messages, currentUser._id]);

  // ✅ Mark notifications read
  useEffect(() => {
    if (chatUser && currentUser && messages.length > 0) {
      const token = getToken();
      markChatRead(chatUser._id, currentUser._id, token);
    }
  }, [chatUser, currentUser, messages.length]);

  // ✅ Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // ✅ Send message
  const handleSend = async () => {
    if (!text && !image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("receiver", chatUser._id);
      formData.append("text", text || "");
      if (image) formData.append("image", image);

      const res = await axios.post(
        "http://localhost:5000/api/messages/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const newMsg = res.data.data;
      setMessages((prev) => mergeMessages(prev, [newMsg]));
      socket.emit("sendMessage", newMsg);

      setText("");
      setImage(null);
      setPreview(null);
    } catch (err) {
      console.error("Message send failed", err);
      toast.error("Message send failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-lg max-w-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-700">
        <img
          src={chatUser.image || "/default-avatar.png"}
          alt={chatUser.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
        />
        <span className="font-bold text-white">{chatUser.name}</span>
        <button onClick={closeChat} className="ml-auto text-red-400 hover:text-red-500">
          Close
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-900">
        {messages.map((m) => (
          <div
            key={m._id || `${m.sender}-${m.createdAt}`}
            className={`p-2 rounded-lg max-w-xs wrap-break-words ${
              m.sender === currentUser._id
                ? "bg-indigo-500 text-white ml-auto"
                : "bg-gray-700 text-white mr-auto"
            }`}
          >
            {m.text && <p>{m.text}</p>}
            {m.image && (
              <img src={m.image} alt="sent" className="w-32 h-32 object-cover mt-1 rounded" />
            )}
            {m.sender === currentUser._id && (
              <p className="text-xs text-gray-300 mt-1 text-right italic">
                {m.status === "sent" && "Sent"}
                {m.status === "delivered" && "Delivered"}
                {m.status === "seen" && "Seen"}
              </p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 flex flex-col gap-2">
        {preview && (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded" />
            <button
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full"
              onClick={() => {
                setPreview(null);
                setImage(null);
              }}
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input type="file" accept="image/*" onChange={handleImageChange} className="text-gray-400" />
          <button
            onClick={handleSend}
            disabled={loading}
            className={`bg-indigo-500 px-4 py-2 rounded-lg hover:bg-indigo-600 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default ChatPopup;






















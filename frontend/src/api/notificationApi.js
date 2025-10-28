import axios from "axios";

const API_URL = "http://localhost:5000/api/notifications";

export const getUnreadCount = async (userId, token) => {
  const res = await axios.get(`${API_URL}/unread-count/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


export const markChatRead = async (senderId, receiverId, token) => {
  const res = await axios.put(
    `${API_URL}/mark-read`,

    { senderId, receiverId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    count: 0,
    list: [],
  },
  reducers: {
    setNotifications: (state, action) => {
      state.list = action.payload;
    },
    incrementNotification: (state, action) => {
      state.count += 1;
      state.list.unshift(action.payload);
    },
    resetNotifications: (state) => {
      state.count = 0;
    },
    setUnreadCount: (state, action) => {
      state.count = action.payload;
    },
  },
});

export const {
  setNotifications,
  incrementNotification,
  resetNotifications,
  setUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;

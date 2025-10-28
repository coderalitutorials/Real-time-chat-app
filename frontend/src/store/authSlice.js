import { createSlice } from "@reduxjs/toolkit";
import { setToken, removeToken } from "../utils/token";
import { authApi } from "../api/authApi";

const initialState = {
  user: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Named export loginSuccess
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      setToken(action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      removeToken();
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.signup.matchFulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        setToken(action.payload.token);
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        setToken(action.payload.token);
      });
  },
});

// Export named actions
export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;


// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { authApi } from "../api/authApi";
import { usersApi } from "../api/usersApi";
import notificationReducer from "./notificationSlice";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

// ✅ Persist config for auth slice
const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "isLoggedIn"], // persist these fields
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
      notifications: notificationReducer, // ✅ add this line

    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // avoid errors from redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApi.middleware, usersApi.middleware), 
});

// ✅ Persistor for wrapping in index.jsx
export const persistor = persistStore(store);



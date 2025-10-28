


import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = "http://localhost:5000/api/auth";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (formData) => ({
        url: "/signup",
        method: "POST",
        body: formData, // FormData object (name, email, password, image)
      }),
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials, // { email, password }
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST", // ya GET bhi ho sakta hai, tumhare backend ke hisaab se
      }),
    }),
  }),
});

export const { useSignupMutation, useLoginMutation, useLogoutMutation } = authApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = "http://localhost:5000/api/users";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.user?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/",
    }),
    updateOnlineStatus: builder.mutation({
      query: ({ id, online }) => ({
        url: `/${id}/online`,
        method: "PATCH",
        body: { online },
      }),
    }),
  }),
});

export const { useGetUsersQuery, useUpdateOnlineStatusMutation } = usersApi;

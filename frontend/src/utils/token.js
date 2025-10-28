// Set JWT in localStorage
export const setToken = (token) => {
  localStorage.setItem("token", token);
};

// Get JWT from localStorage
export const getToken = () => {
  return localStorage.getItem("token");
};

// Remove JWT from localStorage (logout)
export const removeToken = () => {
  localStorage.removeItem("token");
};

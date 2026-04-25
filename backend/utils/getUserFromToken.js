// utils/getUserFromToken.js
import jwt_decode from "jwt-decode";

export const getUserFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return jwt_decode(token); // returns { id, name, role, iat, exp }
  } catch (err) {
    return null;
  }
};

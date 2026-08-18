import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export const loginUser = async (formData) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/login/`,
    {
      email: formData.email,
      password: formData.password,
    }
  );

  const { access, refresh } = response.data;

  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);

  return response.data;
};

export const registerUser = async (formData) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/register/`,
    formData
  );

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

export const getAccessToken = () => {
  return localStorage.getItem("access");
};

export const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(
    `${API_BASE_URL}/auth/token/refresh/`,
    {
      refresh,
    }
  );

  localStorage.setItem("access", response.data.access);

  return response.data.access;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/forgot-password/`,
    { email }
  );

  return response.data;
};

export const resetPassword = async (
  uid,
  token,
  password,
  confirm_password
) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/reset-password/`,
    {
      uid,
      token,
      password,
      confirm_password,
    }
  );

  return response.data;
};
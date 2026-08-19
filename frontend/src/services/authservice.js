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

  const { access } = response.data;

  localStorage.setItem("access", access);

  return response.data;
};


export const registerUser = async (formData) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/register/`,
    formData
  );

  return response.data;
};


export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("access");

    if (token) {
      await axios.post(
        `${API_BASE_URL}/auth/logout/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  } finally {
    localStorage.removeItem("access");
  }
};


export const getAccessToken = () => {
  return localStorage.getItem("access");
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
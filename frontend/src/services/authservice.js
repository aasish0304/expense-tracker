import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";


/* =====================================================
   LOGIN
===================================================== */

export const loginUser = async (formData) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/login/`,
    {
      email: formData.email,
      password: formData.password,
    }
  );

  const { access } = response.data;

  if (access) {
    localStorage.setItem("access", access);
  }

  return response.data;
};


/* =====================================================
   REGISTER
===================================================== */

export const registerUser = async (formData) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/register/`,
    formData
  );

  return response.data;
};


/* =====================================================
   LOGOUT
===================================================== */

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("access");

    if (token) {
      try {
        await axios.post(
          `${API_BASE_URL}/auth/logout/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        /*
          Even if the backend logout request fails,
          the local token must still be removed.
        */
        console.warn(
          "Logout request failed, clearing local session anyway."
        );
      }
    }
  } finally {
    localStorage.removeItem("access");
  }
};


/* =====================================================
   GET ACCESS TOKEN
===================================================== */

export const getAccessToken = () => {
  return localStorage.getItem("access");
};


/* =====================================================
   CHECK TOKEN EXPIRY
===================================================== */

export const isTokenValid = () => {
  const token = localStorage.getItem("access");

  if (!token) {
    return false;
  }

  try {
    const payload = JSON.parse(
      atob(
        token
          .split(".")[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    /*
      JWT exp is stored in seconds.
    */
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem("access");
      return false;
    }

    return true;
  } catch (error) {
    localStorage.removeItem("access");
    return false;
  }
};


/* =====================================================
   FORGOT PASSWORD
===================================================== */

export const forgotPassword = async (email) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/forgot-password/`,
    {
      email,
    }
  );

  return response.data;
};


/* =====================================================
   RESET PASSWORD
===================================================== */

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
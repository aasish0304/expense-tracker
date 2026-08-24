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

  if (!access) {
    throw new Error("Login successful but access token was not returned.");
  }

  // Save JWT
  localStorage.setItem("access", access);


  /* ===================================================
     GET LOGGED-IN USER PROFILE
  =================================================== */

  try {

    const profileResponse = await axios.get(
      `${API_BASE_URL}/auth/profile/`,
      {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      }
    );

    const profile = profileResponse.data;


    /* =================================================
       NORMALIZE PROFILE DATA

       Backend may return:
       name
       username
       email
       role

       We keep both name and username so existing
       Waku components continue to work.
    ================================================= */

    const wakuProfile = {
      ...profile,

      name:
        profile.name ||
        profile.username ||
        formData.email,

      email:
        profile.email ||
        formData.email,

      role:
        profile.role ||
        "User",
    };


    // Save profile for Sidebar, Settings, ProfileMenu etc.
    localStorage.setItem(
      "waku_profile",
      JSON.stringify(wakuProfile)
    );


  } catch (error) {

    console.error(
      "Unable to fetch user profile after login:",
      error
    );

    /*
      The login itself succeeded, so we keep the
      access token.

      However, create a fallback profile so the
      application does not break.
    */

    const fallbackProfile = {
      name: formData.email,
      email: formData.email,
      role: "User",
    };

    localStorage.setItem(
      "waku_profile",
      JSON.stringify(fallbackProfile)
    );

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

    const token =
      localStorage.getItem("access");


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
          Even if backend logout fails,
          clear the local session anyway.
        */

        console.warn(
          "Logout request failed, clearing local session anyway."
        );

      }

    }

  } finally {

    localStorage.removeItem("access");

    localStorage.removeItem("refresh");

    localStorage.removeItem("waku_profile");

  }

};


/* =====================================================
   GET ACCESS TOKEN
===================================================== */

export const getAccessToken = () => {

  return localStorage.getItem("access");

};


/* =====================================================
   GET STORED PROFILE
===================================================== */

export const getStoredProfile = () => {

  try {

    const profile =
      localStorage.getItem(
        "waku_profile"
      );

    if (!profile) {
      return null;
    }

    return JSON.parse(profile);

  } catch (error) {

    console.error(
      "Unable to read stored Waku profile:",
      error
    );

    return null;

  }

};


/* =====================================================
   GET CURRENT USER PROFILE
===================================================== */

export const getProfile = async () => {

  const token =
    localStorage.getItem("access");

  if (!token) {
    return null;
  }


  const response = await axios.get(
    `${API_BASE_URL}/auth/profile/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );


  const profile =
    response.data;


  const wakuProfile = {
    ...profile,

    name:
      profile.name ||
      profile.username ||
      profile.email,

    email:
      profile.email,

    role:
      profile.role ||
      "User",
  };


  localStorage.setItem(
    "waku_profile",
    JSON.stringify(wakuProfile)
  );


  return wakuProfile;

};


/* =====================================================
   CHECK TOKEN EXPIRY
===================================================== */

export const isTokenValid = () => {

  const token =
    localStorage.getItem("access");


  if (!token) {
    return false;
  }


  try {

    const payload =
      JSON.parse(
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

    if (
      payload.exp &&
      payload.exp * 1000 <= Date.now()
    ) {

      localStorage.removeItem(
        "access"
      );

      localStorage.removeItem(
        "waku_profile"
      );

      return false;

    }


    return true;


  } catch (error) {

    localStorage.removeItem(
      "access"
    );

    localStorage.removeItem(
      "waku_profile"
    );

    return false;

  }

};


/* =====================================================
   FORGOT PASSWORD
===================================================== */

export const forgotPassword = async (
  email
) => {

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
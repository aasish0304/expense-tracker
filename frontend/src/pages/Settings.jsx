import { useEffect, useState } from "react";

import {
  UserRound,
  ShieldCheck,
  Bell,
  Coins,
  HelpCircle,
  Info,
  ChevronRight,
  Check,
  X,
  Mail,
  MessageCircle,
} from "lucide-react";

import api from "../services/api";

import styles from "./Settings.module.css";


/* =====================================================
   AVATARS
===================================================== */

const AVATARS = [
  {
    id: "male",
    label: "Avatar 1",
    image: "/avatars/male.png",
  },
  {
    id: "female",
    label: "Avatar 2",
    image: "/avatars/female.png",
  },
];


/* =====================================================
   DEFAULT PROFILE
===================================================== */

const DEFAULT_PROFILE = {
  name: "Waku User",
  email: "",
  avatar: "male",
};


/* =====================================================
   DEFAULT SETTINGS
===================================================== */

const DEFAULT_SETTINGS = {
  notifications: true,
  currency: "INR",
  language: "English",
};


/* =====================================================
   CURRENCIES
===================================================== */

const CURRENCIES = [
  {
    id: "INR",
    symbol: "₹",
    name: "Indian Rupee",
  },
  {
    id: "USD",
    symbol: "$",
    name: "US Dollar",
  },
  {
    id: "EUR",
    symbol: "€",
    name: "Euro",
  },
  {
    id: "GBP",
    symbol: "£",
    name: "British Pound",
  },
];


/* =====================================================
   PASSWORD STRENGTH
===================================================== */

const getPasswordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      label: "",
      className: "",
    };
  }

  let score = 0;

  if (password.length >= 6) {
    score++;
  }

  if (password.length >= 10) {
    score++;
  }

  if (/[A-Z]/.test(password)) {
    score++;
  }

  if (/[0-9]/.test(password)) {
    score++;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  }

  if (score <= 1) {
    return {
      score: 1,
      label: "Weak",
      className: styles.passwordWeak,
    };
  }

  if (score === 2) {
    return {
      score: 2,
      label: "Fair",
      className: styles.passwordFair,
    };
  }

  if (score === 3 || score === 4) {
    return {
      score: 3,
      label: "Good",
      className: styles.passwordGood,
    };
  }

  return {
    score: 4,
    label: "Strong",
    className: styles.passwordStrong,
  };
};


/* =====================================================
   SETTINGS PAGE
===================================================== */

const Settings = () => {

  const [profile, setProfile] =
    useState(DEFAULT_PROFILE);

  const [form, setForm] =
    useState(DEFAULT_PROFILE);

  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  const [activeModal, setActiveModal] =
    useState(null);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");


  /* =====================================================
     SECURITY FORM
  ===================================================== */

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [securityMessage, setSecurityMessage] =
    useState("");

  const [securitySuccess, setSecuritySuccess] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);


  /* =====================================================
     LOAD PROFILE + SETTINGS
  ===================================================== */

  useEffect(() => {

    const loadProfile = async () => {

      try {

        setProfileLoading(true);

        const response = await api.get(
          "/auth/profile/"
        );

        const backendProfile = response.data;

        const updatedProfile = {
          name:
            backendProfile.name ||
            "Waku User",

          email:
            backendProfile.email ||
            "",

          avatar:
            backendProfile.avatar ||
            "male",
        };

        setProfile(updatedProfile);
        setForm(updatedProfile);

        /*
          Keep avatar locally only for compatibility
          with DashboardLayout and other UI components.
        */

        localStorage.setItem(
          "waku_avatar",
          updatedProfile.avatar
        );

      } catch (error) {

        console.error(
          "Unable to load profile:",
          error
        );

        /*
          Do not use an old waku_profile here.
          The authenticated backend account is the
          source of truth for profile information.
        */

        setProfile({
          ...DEFAULT_PROFILE,
        });

        setForm({
          ...DEFAULT_PROFILE,
        });

      } finally {

        setProfileLoading(false);

      }

    };


    loadProfile();


    /* =================================================
       LOAD UI SETTINGS
    ================================================= */

    try {

      const savedSettings =
        localStorage.getItem("waku_settings");

      if (savedSettings) {

        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(savedSettings),
        });

      }

    } catch (error) {

      console.error(
        "Unable to load Waku settings:",
        error
      );

    }

  }, []);


  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const saveProfile = async (
    updatedProfile
  ) => {

    try {

      setProfileSaving(true);
      setProfileMessage("");
      setProfileError("");

      const response = await api.patch(
        "/auth/profile/",
        {
          name: updatedProfile.name,
          avatar: updatedProfile.avatar,
        }
      );

      const backendProfile = response.data;

      const updated = {
        name:
          backendProfile.name ||
          updatedProfile.name,

        email:
          backendProfile.email ||
          profile.email,

        avatar:
          backendProfile.avatar ||
          updatedProfile.avatar,
      };

      setProfile(updated);
      setForm(updated);

      localStorage.setItem(
        "waku_avatar",
        updated.avatar
      );

      /*
        Tell DashboardLayout and other components
        that the profile has changed.
      */

      window.dispatchEvent(
        new Event("waku-profile-updated")
      );

      return true;

    } catch (error) {

      console.error(
        "Unable to update profile:",
        error
      );

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.detail;

      setProfileError(
        backendMessage ||
        "Unable to update profile. Please try again."
      );

      return false;

    } finally {

      setProfileSaving(false);

    }

  };


  /* =====================================================
     OPEN EDIT PROFILE
  ===================================================== */

  const openEditProfile = () => {

    setProfileMessage("");
    setProfileError("");

    setForm({
      ...profile,
    });

    setActiveModal("profile");

  };


  /* =====================================================
     SAVE PROFILE FORM
  ===================================================== */

  const handleSaveProfile = async (
    event
  ) => {

    event.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!form.name.trim()) {

      setProfileError(
        "Please enter your name."
      );

      return;

    }

    const success = await saveProfile({
      ...profile,
      name: form.name.trim(),
      avatar: form.avatar,
    });

    if (success) {

      setProfileMessage(
        "Profile updated successfully."
      );

      setActiveModal(null);

    }

  };


  /* =====================================================
     UPDATE SETTINGS
  ===================================================== */

  const updateSetting = (
    key,
    value
  ) => {

    const updatedSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(updatedSettings);

    localStorage.setItem(
      "waku_settings",
      JSON.stringify(updatedSettings)
    );

  };


  /* =====================================================
     CHANGE PASSWORD
     
     User is already authenticated.

     This DOES NOT send an email.

     It directly calls:
     POST /api/auth/change-password/
  ===================================================== */

  const handleSecuritySave = async (
    event
  ) => {

    event.preventDefault();

    setSecurityMessage("");
    setSecuritySuccess(false);

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = securityForm;


    /* ==========================================
       CURRENT PASSWORD
    ========================================== */

    if (!currentPassword.trim()) {

      setSecurityMessage(
        "Please enter your current password."
      );

      return;

    }


    /* ==========================================
       NEW PASSWORD
    ========================================== */

    if (!newPassword.trim()) {

      setSecurityMessage(
        "Please enter a new password."
      );

      return;

    }


    /* ==========================================
       PASSWORD LENGTH
    ========================================== */

    if (newPassword.length < 6) {

      setSecurityMessage(
        "New password must contain at least 6 characters."
      );

      return;

    }


    /* ==========================================
       CONFIRM PASSWORD
    ========================================== */

    if (!confirmPassword.trim()) {

      setSecurityMessage(
        "Please confirm your new password."
      );

      return;

    }


    /* ==========================================
       PASSWORD MATCH
    ========================================== */

    if (newPassword !== confirmPassword) {

      setSecurityMessage(
        "New passwords do not match."
      );

      return;

    }


    /* ==========================================
       SAME PASSWORD
    ========================================== */

    if (currentPassword === newPassword) {

      setSecurityMessage(
        "New password must be different from your current password."
      );

      return;

    }


    /* ==========================================
       CALL BACKEND
    ========================================== */

    try {

      setChangingPassword(true);

      const response = await api.post(
        "/auth/change-password/",
        {
          current_password:
            currentPassword,

          new_password:
            newPassword,

          confirm_password:
            confirmPassword,
        }
      );


      /* ==========================================
         SUCCESS
      ========================================== */

      setSecuritySuccess(true);

      setSecurityMessage(
        response.data?.message ||
          "Password changed successfully."
      );


      /* Clear password fields */

      setSecurityForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

    } catch (error) {

      console.error(
        "Change password error:",
        error
      );

      const backendMessage =
        error.response?.data?.message;

      if (backendMessage) {

        setSecurityMessage(
          backendMessage
        );

      } else {

        setSecurityMessage(
          "Unable to change password. Please try again."
        );

      }

      setSecuritySuccess(false);

    } finally {

      setChangingPassword(false);

    }

  };


  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const toggleNotifications = () => {

    updateSetting(
      "notifications",
      !settings.notifications
    );

  };


  /* =====================================================
     PASSWORD STRENGTH
  ===================================================== */

  const passwordStrength =
    getPasswordStrength(
      securityForm.newPassword
    );


  /* =====================================================
     SELECTED AVATAR
  ===================================================== */

  const selectedAvatar =
    profile.avatar === "female"
      ? "/avatars/female.png"
      : "/avatars/male.png";


  /* =====================================================
     SELECTED CURRENCY
  ===================================================== */

  const selectedCurrency =
    CURRENCIES.find(
      (currency) =>
        currency.id ===
        settings.currency
    ) || CURRENCIES[0];


  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {

    setActiveModal(null);

    setSecurityMessage("");
    setSecuritySuccess(false);
    setChangingPassword(false);

    setProfileMessage("");
    setProfileError("");

    setSecurityForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setForm({
      ...profile,
    });

  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className={styles.page}>

      {/* =================================================
          DECORATIONS
      ================================================= */}

      <div
        className={`${styles.doodle} ${styles.doodleTop}`}
      >
        ↗
      </div>

      <div
        className={`${styles.doodle} ${styles.doodleRed}`}
      >
        ◯
      </div>

      <div
        className={`${styles.doodle} ${styles.doodleYellow}`}
      >
        〰
      </div>

      <div
        className={`${styles.doodle} ${styles.doodlePurple}`}
      >
        ☆
      </div>


      {/* =================================================
          HEADER
      ================================================= */}

      <div className={styles.pageHeader}>

        <h1>
          Settings
        </h1>

      </div>


      {/* =================================================
          SETTINGS CONTENT
      ================================================= */}

      <div
        className={
          styles.settingsLayout
        }
      >

        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <section
          className={
            styles.profileCard
          }
        >

          <h3>
            Profile
          </h3>


          <div
            className={
              styles.profileAvatar
            }
          >

            <img
              src={selectedAvatar}
              alt="Profile"
            />

          </div>


          <h2>
            {profileLoading
              ? "Loading..."
              : profile.name}
          </h2>


          <p>
            {profileLoading
              ? ""
              : profile.email}
          </p>


          <button
            type="button"
            className={
              styles.editProfileButton
            }
            onClick={
              openEditProfile
            }
            disabled={profileLoading}
          >
            Edit Profile
          </button>

        </section>


        {/* =================================================
            OPTIONS
        ================================================= */}

        <section
          className={
            styles.optionsCard
          }
        >

          {/* ACCOUNT */}

          <SettingItem
            icon={
              <UserRound size={16} />
            }
            title="Account"
            description="Manage your account details"
            right={
              <ChevronRight
                size={15}
              />
            }
            onClick={
              openEditProfile
            }
          />


          <Divider />


          {/* SECURITY */}

          <SettingItem
            icon={
              <ShieldCheck size={16} />
            }
            title="Security"
            description="Change your password"
            right={
              <ChevronRight
                size={15}
              />
            }
            onClick={() => {

              setSecurityMessage("");

              setSecuritySuccess(
                false
              );

              setActiveModal(
                "security"
              );

            }}
          />


          <Divider />


          {/* NOTIFICATIONS */}

          <SettingItem
            icon={
              <Bell size={16} />
            }
            title="Notifications"
            description={
              settings.notifications
                ? "Notifications are enabled"
                : "Notifications are turned off"
            }
            right={
              <Toggle
                enabled={
                  settings.notifications
                }
                onClick={
                  toggleNotifications
                }
              />
            }
            onClick={
              toggleNotifications
            }
          />


          <Divider />


          {/* CURRENCY */}

          <SettingItem
            icon={
              <Coins size={16} />
            }
            title="Currency"
            description={
              selectedCurrency.name
            }
            right={
              <span
                className={
                  styles.settingValue
                }
              >
                {
                  selectedCurrency.symbol
                }{" "}
                {
                  selectedCurrency.id
                }
              </span>
            }
            onClick={() =>
              setActiveModal(
                "currency"
              )
            }
          />


          <Divider />


          {/* HELP */}

          <SettingItem
            icon={
              <HelpCircle size={16} />
            }
            title="Help & Support"
            description="Get help and contact us"
            right={
              <ChevronRight
                size={15}
              />
            }
            onClick={() =>
              setActiveModal(
                "help"
              )
            }
          />


          <Divider />


          {/* ABOUT */}

          <SettingItem
            icon={
              <Info size={16} />
            }
            title="About Waku"
            description="Version 2.4.0"
            right={
              <ChevronRight
                size={15}
              />
            }
            onClick={() =>
              setActiveModal(
                "about"
              )
            }
          />

        </section>

      </div>


      {/* =================================================
          EDIT PROFILE MODAL
      ================================================= */}

      {activeModal === "profile" && (

        <Modal
          title="Edit Profile"
          eyebrow="YOUR PROFILE"
          onClose={closeModal}
        >

          <form
            className={
              styles.modalForm
            }
            onSubmit={
              handleSaveProfile
            }
          >

            {/* NAME */}

            <label>

              Name

              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name:
                      event.target.value,
                  })
                }
              />

            </label>


            {/* ACCOUNT EMAIL */}

            <div
              className={
                styles.profileEmailDisplay
              }
            >

              <span>
                Account Email
              </span>

              <strong>
                {profile.email}
              </strong>

            </div>


            {/* AVATAR */}

            <div
              className={
                styles.modalAvatarSection
              }
            >

              <div
                className={
                  styles.modalAvatarTitle
                }
              >
                Choose your avatar
              </div>


              <div
                className={
                  styles.modalAvatarGrid
                }
              >

                {AVATARS.map(
                  (avatar) => {

                    const selected =
                      form.avatar ===
                      avatar.id;


                    return (

                      <button
                        key={
                          avatar.id
                        }
                        type="button"
                        className={`
                          ${styles.modalAvatarOption}
                          ${
                            selected
                              ? styles.modalAvatarSelected
                              : ""
                          }
                        `}
                        onClick={() =>
                          setForm({
                            ...form,
                            avatar:
                              avatar.id,
                          })
                        }
                      >

                        <img
                          src={
                            avatar.image
                          }
                          alt={
                            avatar.label
                          }
                        />


                        <span>
                          {
                            avatar.label
                          }
                        </span>


                        {selected && (

                          <span
                            className={
                              styles.modalAvatarCheck
                            }
                          >
                            <Check
                              size={11}
                            />
                          </span>

                        )}

                      </button>

                    );

                  }
                )}

              </div>

            </div>


            {/* PROFILE ERROR */}

            {profileError && (

              <div
                className={
                  styles.errorMessage
                }
              >
                {profileError}
              </div>

            )}


            {/* PROFILE SUCCESS */}

            {profileMessage && (

              <div
                className={
                  styles.successMessage
                }
              >
                {profileMessage}
              </div>

            )}


            {/* ACTIONS */}

            <div
              className={
                styles.modalActions
              }
            >

              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={
                  closeModal
                }
                disabled={
                  profileSaving
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className={
                  styles.saveButton
                }
                disabled={
                  profileSaving
                }
              >
                {profileSaving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>

        </Modal>

      )}


      {/* =================================================
          SECURITY MODAL
      ================================================= */}

      {activeModal === "security" && (

        <Modal
          title="Security"
          eyebrow="KEEP YOUR ACCOUNT SAFE"
          onClose={closeModal}
        >

          <form
            className={
              styles.modalForm
            }
            onSubmit={
              handleSecuritySave
            }
          >

            {/* CURRENT PASSWORD */}

            <label>

              Current Password

              <input
                type="password"
                placeholder="Enter current password"
                value={
                  securityForm.currentPassword
                }
                onChange={(event) =>
                  setSecurityForm({
                    ...securityForm,
                    currentPassword:
                      event.target.value,
                  })
                }
                autoComplete="current-password"
              />

            </label>


            {/* NEW PASSWORD */}

            <div
              className={
                styles.passwordField
              }
            >

              <label>

                New Password

                <input
                  type="password"
                  placeholder="Enter new password"
                  value={
                    securityForm.newPassword
                  }
                  onChange={(event) =>
                    setSecurityForm({
                      ...securityForm,
                      newPassword:
                        event.target.value,
                    })
                  }
                  autoComplete="new-password"
                />

              </label>


              {/* PASSWORD STRENGTH */}

              {securityForm.newPassword && (

                <div
                  className={
                    styles.passwordStrength
                  }
                >

                  <div
                    className={
                      styles.passwordStrengthHeader
                    }
                  >

                    <span>
                      Password strength
                    </span>

                    <strong
                      className={
                        passwordStrength.className
                      }
                    >
                      {
                        passwordStrength.label
                      }
                    </strong>

                  </div>


                  <div
                    className={
                      styles.passwordStrengthBars
                    }
                  >

                    {[1, 2, 3, 4].map(
                      (bar) => (

                        <span
                          key={bar}
                          className={`
                            ${styles.passwordStrengthBar}
                            ${
                              bar <=
                              passwordStrength.score
                                ? passwordStrength.className
                                : ""
                            }
                          `}
                        />

                      )
                    )}

                  </div>


                  <p
                    className={
                      styles.passwordHint
                    }
                  >
                    Use 6+ characters with
                    uppercase, numbers and
                    symbols for a stronger
                    password.
                  </p>

                </div>

              )}

            </div>


            {/* CONFIRM PASSWORD */}

            <label>

              Confirm Password

              <input
                type="password"
                placeholder="Confirm new password"
                value={
                  securityForm.confirmPassword
                }
                onChange={(event) =>
                  setSecurityForm({
                    ...securityForm,
                    confirmPassword:
                      event.target.value,
                  })
                }
                autoComplete="new-password"
              />

            </label>


            {/* MESSAGE */}

            {securityMessage && (

              <div
                className={
                  securitySuccess
                    ? styles.successMessage
                    : styles.errorMessage
                }
              >
                {
                  securityMessage
                }
              </div>

            )}


            {/* ACTIONS */}

            <div
              className={
                styles.modalActions
              }
            >

              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={
                  closeModal
                }
                disabled={
                  changingPassword
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className={
                  styles.saveButton
                }
                disabled={
                  changingPassword
                }
              >

                {
                  changingPassword
                    ? "Changing..."
                    : "Change Password"
                }

              </button>

            </div>

          </form>

        </Modal>

      )}


      {/* =================================================
          CURRENCY MODAL
      ================================================= */}

      {activeModal === "currency" && (

        <Modal
          title="Currency"
          eyebrow="YOUR MONEY"
          onClose={closeModal}
        >

          <div
            className={
              styles.selectionList
            }
          >

            {CURRENCIES.map(
              (currency) => {

                const selected =
                  settings.currency ===
                  currency.id;


                return (

                  <button
                    type="button"
                    key={
                      currency.id
                    }
                    className={`
                      ${styles.selectionItem}
                      ${
                        selected
                          ? styles.selectionItemActive
                          : ""
                      }
                    `}
                    onClick={() => {

                      updateSetting(
                        "currency",
                        currency.id
                      );

                      setActiveModal(
                        null
                      );

                    }}
                  >

                    <span
                      className={
                        styles.selectionSymbol
                      }
                    >
                      {
                        currency.symbol
                      }
                    </span>


                    <span
                      className={
                        styles.selectionText
                      }
                    >

                      <strong>
                        {
                          currency.id
                        }
                      </strong>

                      <small>
                        {
                          currency.name
                        }
                      </small>

                    </span>


                    {selected && (

                      <Check
                        size={16}
                        className={
                          styles.selectionCheck
                        }
                      />

                    )}

                  </button>

                );

              }
            )}

          </div>

        </Modal>

      )}


      {/* =================================================
          HELP MODAL
      ================================================= */}

      {activeModal === "help" && (

        <Modal
          title="Help & Support"
          eyebrow="WE'RE HERE TO HELP"
          onClose={closeModal}
        >

          <div
            className={
              styles.helpContent
            }
          >

            <p>
              Need help with Waku?
              Choose an option below.
            </p>


            {/* EMAIL */}

            <a
              className={
                styles.helpOption
              }
              href="mailto:waku.noreply@gmail.com"
            >

              <span
                className={
                  styles.helpIcon
                }
              >
                <Mail size={17} />
              </span>


              <span>

                <strong>
                  Email Support
                </strong>

                <small>
                  waku.noreply@gmail.com
                </small>

              </span>

            </a>


            {/* LIVE CHAT */}

            <button
              type="button"
              className={
                styles.helpOption
              }
              onClick={() =>
                alert(
                  "Live chat will be available soon."
                )
              }
            >

              <span
                className={
                  styles.helpIcon
                }
              >
                <MessageCircle
                  size={17}
                />
              </span>


              <span>

                <strong>
                  Live Chat
                </strong>

                <small>
                  Available soon
                </small>

              </span>

            </button>

          </div>

        </Modal>

      )}


      {/* =================================================
          ABOUT MODAL
      ================================================= */}

      {activeModal === "about" && (

        <Modal
          title="About Waku"
          eyebrow="EVERY RUPEE HAS A STORY"
          onClose={closeModal}
        >

          <div
            className={
              styles.aboutContent
            }
          >

            <div
              className={
                styles.aboutLogo
              }
            >
              waku
              <span
                className={
                  styles.aboutLogoDot
                }
              >
                .
              </span>
            </div>


            <h3>
              Your personal money story.
            </h3>


            <p>
              Waku helps you understand
              where your money goes,
              one story at a time.
            </p>


            <span
              className={
                styles.aboutVersion
              }
            >
              Version 2.4.0
            </span>

          </div>

        </Modal>

      )}

    </div>
  );
};


/* =====================================================
   SETTING ITEM
===================================================== */

const SettingItem = ({
  icon,
  title,
  description,
  right,
  onClick,
}) => {

  return (

    <button
      type="button"
      className={
        styles.settingItem
      }
      onClick={onClick}
    >

      <div
        className={
          styles.settingIcon
        }
      >
        {icon}
      </div>


      <div
        className={
          styles.settingContent
        }
      >

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>


      <div
        className={
          styles.settingRight
        }
      >
        {right}
      </div>

    </button>

  );
};


/* =====================================================
   TOGGLE
===================================================== */

const Toggle = ({
  enabled,
  onClick,
}) => {

  return (

    <span
      className={`
        ${styles.toggle}
        ${
          enabled
            ? styles.toggleActive
            : ""
        }
      `}
      onClick={(event) => {

        event.stopPropagation();

        onClick();

      }}
    >

      <span
        className={
          styles.toggleKnob
        }
      />

    </span>

  );
};


/* =====================================================
   MODAL
===================================================== */

const Modal = ({
  eyebrow,
  title,
  children,
  onClose,
}) => {

  return (

    <div
      className={
        styles.modalOverlay
      }
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {

          onClose();

        }

      }}
    >

      <div
        className={
          styles.modal
        }
      >

        <div
          className={
            styles.modalHeader
          }
        >

          <div>

            <span>
              {eyebrow}
            </span>

            <h2>
              {title}
            </h2>

          </div>


          <button
            type="button"
            className={
              styles.modalClose
            }
            onClick={
              onClose
            }
          >
            <X size={18} />
          </button>

        </div>


        {children}

      </div>

    </div>

  );
};


/* =====================================================
   DIVIDER
===================================================== */

const Divider = () => (

  <div
    className={
      styles.divider
    }
  />

);


export default Settings;
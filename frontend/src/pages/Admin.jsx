import { useEffect, useMemo, useRef, useState } from "react";

import {
  Search,
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  ChevronDown,
  X,
  Check,
  Loader2,
} from "lucide-react";

import api from "../services/api";

import styles from "./Admin.module.css";


const RoleDropdown = ({
  user,
  disabled,
  onChange,
}) => {

  const [open, setOpen] =
    useState(false);

  const dropdownRef =
    useRef(null);


  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target
          )
        ) {
          setOpen(false);
        }

      };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  const selectRole = (role) => {

    setOpen(false);

    if (role !== user.role) {
      onChange(user, role);
    }

  };


  return (

    <div
      className={styles.roleDropdown}
      ref={dropdownRef}
    >

      <button
        type="button"
        className={`${styles.roleButton} ${
          user.role === "Admin"
            ? styles.adminRole
            : ""
        }`}
        disabled={disabled}
        onClick={() =>
          setOpen(!open)
        }
      >

        <span>
          {user.role}
        </span>

        <ChevronDown
          size={14}
          className={
            open
              ? styles.chevronOpen
              : ""
          }
        />

      </button>


      {open && (

        <div
          className={
            styles.roleMenu
          }
        >

          <button
            type="button"
            className={
              user.role === "User"
                ? styles.roleOptionActive
                : styles.roleOption
            }
            onClick={() =>
              selectRole("User")
            }
          >

            <span className={styles.roleDotUser} />

            User

            {user.role === "User" && (
              <Check
                size={14}
                className={styles.roleCheck}
              />
            )}

          </button>


          <button
            type="button"
            className={
              user.role === "Admin"
                ? styles.roleOptionActive
                : styles.roleOption
            }
            onClick={() =>
              selectRole("Admin")
            }
          >

            <span className={styles.roleDotAdmin} />

            Admin

            {user.role === "Admin" && (
              <Check
                size={14}
                className={styles.roleCheck}
              />
            )}

          </button>

        </div>

      )}

    </div>

  );

};


const Admin = () => {

  const [users, setUsers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [updatingUserId, setUpdatingUserId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [confirmation, setConfirmation] =
    useState(null);


  const currentEmail = (() => {

    try {

      const profile =
        localStorage.getItem(
          "waku_profile"
        );

      if (!profile) {
        return "";
      }

      return (
        JSON.parse(profile)?.email || ""
      );

    } catch {

      return "";

    }

  })();


  const loadUsers = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/auth/admin/users/"
        );

      setUsers(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (err) {

      console.error(
        "Unable to load users:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load users."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadUsers();

  }, []);


  const filteredUsers =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return users;
      }

      return users.filter(
        (user) =>
          String(
            user.username || ""
          )
            .toLowerCase()
            .includes(query)
          ||
          String(
            user.email || ""
          )
            .toLowerCase()
            .includes(query)
          ||
          String(
            user.role || ""
          )
            .toLowerCase()
            .includes(query)
      );

    }, [users, search]);


  const totalUsers =
    users.length;

  const activeUsers =
    users.filter(
      (user) => user.is_active
    ).length;

  const inactiveUsers =
    users.filter(
      (user) => !user.is_active
    ).length;

  const adminUsers =
    users.filter(
      (user) =>
        user.role === "Admin"
    ).length;


  const performUpdate =
    async (
      user,
      changes
    ) => {

      try {

        setUpdatingUserId(
          user.id
        );

        setError("");
        setSuccessMessage("");

        const response =
          await api.patch(
            `/auth/admin/users/${user.id}/`,
            changes
          );

        const updatedUser =
          response.data;

        setUsers(
          (current) =>
            current.map(
              (item) =>
                item.id === user.id
                  ? updatedUser
                  : item
            )
        );

        setSuccessMessage(
          `${updatedUser.email} updated successfully.`
        );

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);

      } catch (err) {

        console.error(
          "Unable to update user:",
          err
        );

        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to update user."
        );

      } finally {

        setUpdatingUserId(null);

      }

    };


  const requestUpdate = (
    user,
    changes,
    title,
    description
  ) => {

    if (
      user.email === currentEmail &&
      (
        changes.role === "User" ||
        changes.is_active === false
      )
    ) {

      setError(
        "You cannot remove your own Admin access."
      );

      setTimeout(() => {
        setError("");
      }, 3000);

      return;

    }


    setConfirmation({
      user,
      changes,
      title,
      description,
    });

  };


  const confirmUpdate = async () => {

    if (!confirmation) {
      return;
    }

    const {
      user,
      changes,
    } = confirmation;

    setConfirmation(null);

    await performUpdate(
      user,
      changes
    );

  };


  const handleRoleChange =
    (user, newRole) => {

      if (
        newRole === user.role
      ) {
        return;
      }

      requestUpdate(
        user,
        {
          role: newRole,
        },
        newRole === "Admin"
          ? "Make this user an Admin?"
          : "Remove Admin access?",
        newRole === "Admin"
          ? `${user.email} will receive administrative access to Waku.`
          : `${user.email} will lose administrative access.`
      );

    };


  const handleStatusChange =
    (user) => {

      const active =
        !user.is_active;

      requestUpdate(
        user,
        {
          is_active: active,
        },
        active
          ? "Activate this account?"
          : "Deactivate this account?",
        active
          ? `${user.email} will be able to access Waku again.`
          : `${user.email} will no longer be able to access Waku.`
      );

    };


  if (loading) {

    return (

      <div className={styles.page}>

        <div className={styles.loading}>

          <Loader2
            size={24}
            className={
              styles.loadingSpinner
            }
          />

          <span>
            Loading users...
          </span>

        </div>

      </div>

    );

  }


  return (

    <div className={styles.page}>

      {/* HEADER */}

      <div className={styles.header}>

        <div>

          <div className={styles.eyebrow}>
            WAKU ADMINISTRATION
          </div>

          <h1>
            User Management
          </h1>

          <p>
            Manage users, roles and account access.
          </p>

        </div>


        <div className={styles.adminBadge}>

          <ShieldCheck size={17} />

          <span>
            Administrator
          </span>

        </div>

      </div>


      {/* SUCCESS */}

      {successMessage && (

        <div className={styles.successBox}>

          <div className={styles.messageIcon}>
            <Check size={15} />
          </div>

          <span>
            {successMessage}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
          >
            <X size={15} />
          </button>

        </div>

      )}


      {/* ERROR */}

      {error && (

        <div className={styles.errorBox}>

          <div className={styles.errorIcon}>
            <X size={15} />
          </div>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={15} />
          </button>

        </div>

      )}


      {/* STATS */}

      <div className={styles.stats}>

        <div className={styles.statCard}>

          <div className={styles.statIcon}>
            <Users size={19} />
          </div>

          <div className={styles.statText}>
            <span>Total Users</span>
            <strong>{totalUsers}</strong>
          </div>

        </div>


        <div className={styles.statCard}>

          <div className={styles.statIcon}>
            <UserCheck size={19} />
          </div>

          <div className={styles.statText}>
            <span>Active Users</span>
            <strong>{activeUsers}</strong>
          </div>

        </div>


        <div className={styles.statCard}>

          <div className={styles.statIcon}>
            <UserX size={19} />
          </div>

          <div className={styles.statText}>
            <span>Inactive Users</span>
            <strong>{inactiveUsers}</strong>
          </div>

        </div>


        <div className={styles.statCard}>

          <div className={styles.statIcon}>
            <ShieldCheck size={19} />
          </div>

          <div className={styles.statText}>
            <span>Administrators</span>
            <strong>{adminUsers}</strong>
          </div>

        </div>

      </div>


      {/* USERS */}

      <div className={styles.usersCard}>

        <div className={styles.usersHeader}>

          <div>

            <h2>
              Users
            </h2>

            <p>
              {users.length} registered{" "}
              {users.length === 1
                ? "account"
                : "accounts"}
            </p>

          </div>


          <div className={styles.searchBox}>

            <Search size={17} />

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                <X size={14} />
              </button>

            )}

          </div>

        </div>


        <div className={styles.tableWrapper}>

          <table className={styles.table}>

            <thead>

              <tr>

                <th>USER</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>ACTION</th>

              </tr>

            </thead>


            <tbody>

              {filteredUsers.map(
                (user) => {

                  const updating =
                    updatingUserId ===
                    user.id;

                  const current =
                    user.email ===
                    currentEmail;

                  return (

                    <tr
                      key={user.id}
                    >

                      <td>

                        <div
                          className={
                            styles.userCell
                          }
                        >

                          <div
                            className={
                              styles.userAvatar
                            }
                          >
                            {(
                              user.username ||
                              user.email ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div
                            className={
                              styles.userInfo
                            }
                          >

                            <strong>
                              {
                                user.username ||
                                "User"
                              }
                            </strong>

                            {current && (

                              <span
                                className={
                                  styles.youTag
                                }
                              >
                                You
                              </span>

                            )}

                          </div>

                        </div>

                      </td>


                      <td>

                        <span
                          className={
                            styles.email
                          }
                        >
                          {user.email}
                        </span>

                      </td>


                      <td>

                        <RoleDropdown
                          user={user}
                          disabled={
                            updating ||
                            current
                          }
                          onChange={
                            handleRoleChange
                          }
                        />

                      </td>


                      <td>

                        <button
                          type="button"
                          className={
                            user.is_active
                              ? styles.statusActive
                              : styles.statusInactive
                          }
                          disabled={
                            updating ||
                            current
                          }
                          onClick={() =>
                            handleStatusChange(
                              user
                            )
                          }
                        >

                          {updating ? (

                            <Loader2
                              size={13}
                              className={
                                styles.smallSpinner
                              }
                            />

                          ) : (

                            <span
                              className={
                                styles.statusDot
                              }
                            />

                          )}

                          {user.is_active
                            ? "Active"
                            : "Inactive"}

                        </button>

                      </td>


                      <td>

                        {current ? (

                          <span
                            className={
                              styles.currentAccount
                            }
                          >
                            Current account
                          </span>

                        ) : (

                          <button
                            type="button"
                            className={
                              user.is_active
                                ? styles.deactivateButton
                                : styles.activateButton
                            }
                            disabled={updating}
                            onClick={() =>
                              handleStatusChange(
                                user
                              )
                            }
                          >

                            {updating
                              ? "Updating..."
                              : user.is_active
                                ? "Deactivate"
                                : "Activate"}

                          </button>

                        )}

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* CONFIRMATION MODAL */}

      {confirmation && (

        <div
          className={
            styles.modalOverlay
          }
        >

          <div
            className={
              styles.confirmModal
            }
          >

            <button
              type="button"
              className={
                styles.modalClose
              }
              onClick={() =>
                setConfirmation(null)
              }
            >
              <X size={18} />
            </button>


            <div
              className={
                styles.modalIcon
              }
            >
              <ShieldCheck
                size={22}
              />
            </div>


            <div
              className={
                styles.modalContent
              }
            >

              <div
                className={
                  styles.modalEyebrow
                }
              >
                ADMIN ACTION
              </div>

              <h3>
                {confirmation.title}
              </h3>

              <p>
                {confirmation.description}
              </p>

            </div>


            <div
              className={
                styles.modalUser
              }
            >

              <div
                className={
                  styles.modalAvatar
                }
              >
                {(
                  confirmation.user.username ||
                  confirmation.user.email ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>

                <strong>
                  {
                    confirmation.user.username ||
                    "User"
                  }
                </strong>

                <span>
                  {
                    confirmation.user.email
                  }
                </span>

              </div>

            </div>


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
                onClick={() =>
                  setConfirmation(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  styles.confirmButton
                }
                onClick={
                  confirmUpdate
                }
              >
                Confirm
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};


export default Admin;
import styles from "./ProfileAvatar.module.css";

const getSavedAvatar = () => {
  return localStorage.getItem("waku_avatar") || "male";
};

const ProfileAvatar = ({ size = "small", onClick }) => {
  const avatar = getSavedAvatar();

  const avatarImage =
    avatar === "female"
      ? "/avatars/female.png"
      : "/avatars/male.png";

  return (
    <div
      className={`${styles.avatar} ${styles[size]}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <img
        src={avatarImage}
        alt="Profile"
      />
    </div>
  );
};

export default ProfileAvatar;
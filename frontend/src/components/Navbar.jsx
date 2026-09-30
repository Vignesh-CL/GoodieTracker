import { useEffect, useState } from "react";

function Navbar({ user, onMenuToggle, onLogout }) {
  const displayName = user.role === "Administrator" ? "Admin" : user.name;
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(
      () => setCurrentDateTime(new Date()),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);

  const formattedDateTime = currentDateTime.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
  return (
    <header className="navbar">
      <button
        className="menu-toggle"
        type="button"
        onClick={onMenuToggle}
        aria-label="Toggle navigation"
      >
        Menu
      </button>
      <div className="navbar-date">{formattedDateTime}</div>
      <div className="navbar-user">
        <span className="navbar-avatar">{user.name[0]}</span>
        <span>{displayName}</span>
        <button className="logout-link" type="button" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}

export default Navbar;

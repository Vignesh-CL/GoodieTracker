function Navbar({ user, onMenuToggle, onLogout }) {
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
      <div className="navbar-date">Thursday, September 24, 2026</div>
      <div className="navbar-user">
        <span className="navbar-avatar">{user.name[0]}</span>
        <span>{user.name}</span>
        <button className="logout-link" type="button" onClick={onLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}

export default Navbar;

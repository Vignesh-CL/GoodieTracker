function Sidebar({ activePage, onNavigate, isAdmin, isOpen }) {
  const navigation = isAdmin
    ? [
        ["overview", "Overview"],
        ["distribution", "Distribution"],
        ["employees", "Employees"],
        ["inventory", "Inventory"],
        ["events", "Events"],
      ]
    : [["overview", "Overview"]];
  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="brand">
        <span className="brand-symbol">GT</span>
        <strong>GoodieTrack</strong>
      </div>
      <p className="sidebar-label">WORKSPACE</p>
      <nav className="sidebar-nav">
        {navigation.map(([id, label]) => (
          <button
            type="button"
            className={activePage === id ? "active" : ""}
            onClick={() => onNavigate(id)}
            key={id}
          >
            {label}
            <span>-&gt;</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-note">
        <span className="eyebrow">Cirruslabs</span>
        <p>Keep every collection clear and accounted for.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
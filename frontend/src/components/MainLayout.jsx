
function MainLayout({
  user,
  activePage,
  isAdmin,
  onNavigate,
  onLogout,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="application-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          onNavigate(page);
          setSidebarOpen(false);
        }}
        isAdmin={isAdmin}
        isOpen={sidebarOpen}
      />
      <div className="application-body">
        <Navbar
          user={user}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onLogout={onLogout}
        />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
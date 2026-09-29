import { useEffect, useState } from "react";
import api from "./api";
import Button from "./components/Button";
import Card from "./components/Card";
import MainLayout from "./components/MainLayout";
import Modal from "./components/Modal";
import StatusBadge from "./components/StatusBadge";
import Table from "./components/Table";
import "./App.css";

const roleLabels = {
  admin: "Administrator",
  hr: "HR / Coordinator",
  employee: "Employee",
};

function App() {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState("admin@cirruslabs.io");
  const [password, setPassword] = useState("admin123");

  async function handleLogin(event) {
    event.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("goodietrack_token", data.token);
      setUser(data.user);
      setLoginError("");
    } catch (error) {
      setLoginError(error.response?.data?.message || "Unable to sign in.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("goodietrack_token");
    setUser(null);
  }

  useEffect(() => {
    if (localStorage.getItem("goodietrack_token"))
      api
        .get("/auth/me")
        .then(({ data }) => setUser(data.user))
        .catch(handleLogout);
  }, []);

  if (!user)
    return (
      <LoginScreen
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        error={loginError}
        onSubmit={handleLogin}
      />
    );
  return <Dashboard user={user} onLogout={handleLogout} />;
}

function LoginScreen({
  email,
  password,
  setEmail,
  setPassword,
  error,
  onSubmit,
}) {
  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="brand-symbol brand-symbol-large">GT</div>
        <h1>Make every goodie count.</h1>
        <p className="login-copy">
          A clear workspace for weekly employee distributions.
        </p>
        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <Button type="submit">Enter GoodieTrack</Button>
        </form>
        <p className="demo-hint">
          Admin: admin@cirruslabs.io / admin123
          <br />
          Employee: employee@cirruslabs.io / employee123
        </p>
      </section>
      <aside className="login-aside">
        <span>WEEKLY DISTRIBUTION / 2026</span>
        <strong>
          People first.
          <br />
          Paperwork second.
        </strong>
      </aside>
    </main>
  );
}

function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("overview");
  const [employees, setEmployees] = useState([]);
  const [goodies, setGoodies] = useState([]);
  const [events, setEvents] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");
  const isAdmin = user.role === "admin";

  async function loadData() {
    if (!isAdmin) return;
    try {
      const [users, inventory, eventList, records] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/goodies"),
        api.get("/admin/events"),
        api.get("/admin/distributions"),
      ]);
      setEmployees(users.data.filter((item) => item.role === "employee"));
      setGoodies(inventory.data);
      setEvents(eventList.data);
      setDistributions(records.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not load admin data.",
      );
    }
  }
  useEffect(() => {
    loadData();
  }, [isAdmin]);

  async function createRecord(path, payload) {
    try {
      await api.post(path, payload);
      setModal(null);
      setError("");
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not save record.",
      );
    }
  }
  async function deactivate(path) {
    try {
      await api.delete(path);
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not update record.",
      );
    }
  }

  const pageContent = !isAdmin ? (
    <EmployeeOverviewPage user={user} />
  ) : activePage === "employees" ? (
    <EmployeesPage
      employees={employees}
      onAdd={() => setModal("employee")}
      onDeactivate={(id) => deactivate(`/admin/users/${id}`)}
    />
  ) : activePage === "inventory" ? (
    <InventoryPage
      goodies={goodies}
      onAdd={() => setModal("goodie")}
      onDeactivate={(id) => deactivate(`/admin/goodies/${id}`)}
    />
  ) : activePage === "events" ? (
    <EventsPage
      events={events}
      onAdd={() => setModal("event")}
      onCancel={(id) => deactivate(`/admin/events/${id}`)}
    />
  ) : activePage === "distribution" ? (
    <DistributionPage
      employees={employees}
      goodies={goodies}
      events={events}
      onSave={(payload) => createRecord("/admin/distributions", payload)}
    />
  ) : (
    <OverviewPage
      employees={employees}
      goodies={goodies}
      distributions={distributions}
      onNavigate={setActivePage}
      onRecord={() => setActivePage("distribution")}
    />
  );

  return (
    <MainLayout
      user={{ ...user, role: roleLabels[user.role] }}
      activePage={activePage}
      isAdmin={isAdmin}
      onNavigate={setActivePage}
      onLogout={onLogout}
    >
      <>
        {error && <p className="error-message">{error}</p>}
        {pageContent}
        {modal && (
          <Modal title={`Add ${modal}`} onClose={() => setModal(null)}>
            <EntityForm
              type={modal}
              onSave={(payload) =>
                createRecord(
                  `/admin/${modal === "employee" ? "users" : `${modal}s`}`,
                  payload,
                )
              }
            />
          </Modal>
        )}
      </>
    </MainLayout>
  );
}

function EmployeeOverviewPage({ user }) {
  return (
    <>
      <PageHeader
        eyebrow="EMPLOYEE VIEW"
        title={`Welcome, ${user.name}.`}
        copy="A simple view of the goodies you have received."
      />
      <div className="stat-grid">
        <Card>
          <span className="stat-label">Goodies received</span>
          <strong className="stat-value">0</strong>
          <small>Recorded for your account</small>
        </Card>
      </div>
    </>
  );
}
function PageHeader({ eyebrow, title, copy, action }) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {action}
    </div>
  );
}
function OverviewPage({ employees, goodies, distributions, onNavigate, onRecord }) {
  const totalStock = goodies.reduce((sum, item) => sum + item.stock, 0);
  const collected = distributions.length;
  const activeEvent = distributions[0]?.event?.name || "No collections yet";
  return (
    <>
      <PageHeader
        eyebrow="ADMIN CONSOLE"
        title="Good morning, Ava."
        copy="Here is the pulse of your goodie distribution program."
        action={<Button onClick={onRecord}>Record collection</Button>}
      />
      <div className="stat-grid">
        <Card>
          <span className="stat-label">Active event</span>
          <strong className="stat-value">{activeEvent}</strong>
          <small>Live from the database</small>
        </Card>
        <Card>
          <span className="stat-label">Collected</span>
          <strong className="stat-value">{collected}</strong>
          <small>of {employees.length} active employees</small>
        </Card>
        <Card>
          <span className="stat-label">Pending</span>
          <strong className="stat-value">
            {Math.max(employees.length - collected, 0)}
          </strong>
          <small>Still to collect</small>
        </Card>
        <Card>
          <span className="stat-label">Stock remaining</span>
          <strong className="stat-value">{totalStock}</strong>
          <small>Across all goodies</small>
        </Card>
      </div>
      <div className="content-grid">
        <Card className="feature-card">
          <span className="eyebrow">THIS WEEK</span>
          <h2>{activeEvent}</h2>
          <p>
            Keep collections moving and maintain a clean record for every
            employee.
          </p>
          <div className="progress-track">
            <span
              style={{
                width: `${employees.length ? Math.min((collected / employees.length) * 100, 100) : 0}%`,
              }}
            />
          </div>
          <div className="progress-label">
            <span>Collection progress</span>
            <strong>
              {employees.length
                ? Math.round((collected / employees.length) * 100)
                : 0}
              %
            </strong>
          </div>
        </Card>
        <Card className="quick-card">
          <span className="eyebrow">QUICK LINKS</span>
          <Button variant="link" onClick={() => onNavigate("employees")}>
            View employee list <span>-&gt;</span>
          </Button>
          <Button variant="link" onClick={() => onNavigate("inventory")}>
            Check inventory <span>-&gt;</span>
          </Button>
          <Button variant="link" onClick={onRecord}>
            Record a collection <span>-&gt;</span>
          </Button>
        </Card>
      </div>
    </>
  );
}

function EmployeesPage({ employees, onAdd, onDeactivate }) {
  const columns = [
    {
      key: "name",
      label: "Employee",
      render: (row) => (
        <>
          <strong>{row.name}</strong>
          <small>{row.email}</small>
        </>
      ),
    },
    { key: "department", label: "Department" },
    { key: "employeeCode", label: "Code" },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <>
          <StatusBadge status={row.status} />
          {row.status === "active" && (
            <button
              className="logout-link"
              onClick={() => onDeactivate(row._id)}
            >
              Deactivate
            </button>
          )}
        </>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="PEOPLE"
        title="Employees"
        copy="The people your weekly program is built around."
        action={<Button onClick={onAdd}>Add employee</Button>}
      />
      <Card className="table-card">
        <Table
          columns={columns}
          rows={employees.map((row) => ({
            ...row,
            id: row._id,
            status: row.status === "active" ? "Active" : "Inactive",
          }))}
        />
      </Card>
    </>
  );
}
function InventoryPage({ goodies, onAdd, onDeactivate }) {
  return (
    <>
      <PageHeader
        eyebrow="INVENTORY"
        title="Goodies"
        copy="A live view of what is ready to go."
        action={<Button onClick={onAdd}>Add goodie</Button>}
      />
      <div className="inventory-grid">
        {goodies.map((goodie) => (
          <Card className="inventory-card" key={goodie._id}>
            <span className="inventory-dot" />
            <h2>{goodie.name}</h2>
            <p>{goodie.description}</p>
            <strong>{goodie.stock}</strong>
            <small>available now</small>
            <button
              className="logout-link"
              onClick={() => onDeactivate(goodie._id)}
            >
              Archive
            </button>
          </Card>
        ))}
      </div>
    </>
  );
}
function EventsPage({ events, onAdd, onCancel }) {
  const columns = [
    { key: "name", label: "Event" },
    {
      key: "date",
      label: "Date",
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <>
          <StatusBadge status={row.status} />
          {row.status !== "cancelled" && (
            <button className="logout-link" onClick={() => onCancel(row._id)}>
              Cancel
            </button>
          )}
        </>
      ),
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="DISTRIBUTION EVENTS"
        title="Events"
        copy="Create and track your weekly collection windows."
        action={<Button onClick={onAdd}>Add event</Button>}
      />
      <Card className="table-card">
        <Table
          columns={columns}
          rows={events.map((row) => ({ ...row, id: row._id }))}
        />
      </Card>
    </>
  );
}
function DistributionPage({ employees, goodies, events, onSave }) {
  const [employee, setEmployee] = useState("");
  const [goodie, setGoodie] = useState("");
  const [event, setEvent] = useState("");
  return (
    <>
      <PageHeader
        eyebrow="DISTRIBUTION DESK"
        title="Record a collection"
        copy="One employee, one goodie, one clear record."
      />
      <Card className="form-card">
        <div className="form-grid">
          <label>
            Employee
            <select
              value={employee}
              onChange={(item) => setEmployee(item.target.value)}
            >
              <option value="">Choose an employee</option>
              {employees.map((item) => (
                <option value={item._id} key={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Event
            <select
              value={event}
              onChange={(item) => setEvent(item.target.value)}
            >
              <option value="">Choose an event</option>
              {events
                .filter((item) => item.status !== "cancelled")
                .map((item) => (
                  <option value={item._id} key={item._id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Goodie
            <select
              value={goodie}
              onChange={(item) => setGoodie(item.target.value)}
            >
              <option value="">Choose a goodie</option>
              {goodies.map((item) => (
                <option value={item._id} key={item._id}>
                  {item.name} ({item.stock})
                </option>
              ))}
            </select>
          </label>
        </div>
        <Button
          disabled={!employee || !goodie || !event}
          onClick={() => onSave({ employee, goodie, event })}
        >
          Confirm collection
        </Button>
      </Card>
    </>
  );
}
function EntityForm({ type, onSave }) {
  const [form, setForm] = useState(
    type === "employee"
      ? {
          name: "",
          email: "",
          password: "employee123",
          department: "",
          employeeCode: "",
        }
      : type === "goodie"
        ? { name: "", description: "", stock: 0 }
        : { name: "", date: "" },
  );
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <form
      className="modal-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(type === "employee" ? { ...form, role: "employee" } : form);
      }}
    >
      <label>
        Name
        <input
          required
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
        />
      </label>
      {type === "employee" && (
        <>
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </label>
          <label>
            Department
            <input
              value={form.department}
              onChange={(event) => update("department", event.target.value)}
            />
          </label>
          <label>
            Employee code
            <input
              required
              value={form.employeeCode}
              onChange={(event) => update("employeeCode", event.target.value)}
            />
          </label>
        </>
      )}
      {type === "goodie" && (
        <>
          <label>
            Description
            <input
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </label>
          <label>
            Opening stock
            <input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={(event) => update("stock", Number(event.target.value))}
            />
          </label>
        </>
      )}
      {type === "event" && (
        <label>
          Date
          <input
            required
            type="date"
            value={form.date}
            onChange={(event) => update("date", event.target.value)}
          />
        </label>
      )}
      <Button type="submit">Save {type}</Button>
    </form>
  );
}

export default App;

import { useState } from "react";
import Button from "./components/Button";
import Card from "./components/Card";
import MainLayout from "./components/MainLayout";
import Modal from "./components/Modal";
import StatusBadge from "./components/StatusBadge";
import Table from "./components/Table";
import "./App.css";

const demoUsers = {
  "admin@cirruslabs.io": {
    password: "admin123",
    name: "Admin",
    role: "Administrator",
  },
  "employee@cirruslabs.io": {
    password: "employee123",
    name: "Subham Singh",
    role: "Employee",
    goodiesReceived: 3,
  },
};

const initialEmployees = [
  {
    id: 1,
    name: "Vignesh D D",
    email: "vignesh.dd@cirruslabs.io",
    department: "Technology",
    code: "EMP-1001",
    status: "Active",
  },
  {
    id: 2,
    name: "Prajwal K M",
    email: "prajwal.km@cirruslabs.io",
    department: "Technology",
    code: "EMP-1002",
    status: "Active",
  },
  {
    id: 3,
    name: "Subham Singh",
    email: "subham.singh@cirruslabs.io",
    department: "Technology",
    code: "EMP-1003",
    status: "Active",
  },
];

const initialGoodies = [
  {
    id: 1,
    name: "CirrusLabs T-shirt",
    description: "A T-shirt with logo of cirruslab.",
    stock: 120,
  },
  {
    id: 2,
    name: "Cirrus Book",
    description: "A TO-DO book to track our activity",
    stock: 80,
  },
];

function App() {
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState("admin@cirruslabs.io");
  const [password, setPassword] = useState("admin123");

  function handleLogin(event) {
    event.preventDefault();
    const account = demoUsers[email.toLowerCase()];
    if (!account || account.password !== password) {
      setLoginError("Use one of the demo accounts below.");
      return;
    }
    setUser({ name: account.name, role: account.role });
    setLoginError("");
  }

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
  return <Dashboard user={user} onLogout={() => setUser(null)} />;
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
  const [employees, setEmployees] = useState(initialEmployees);
  const [goodies] = useState(initialGoodies);
  const [events, setEvents] = useState([
    {
      id: 1,
      name: "September Welcome Kit",
      date: "2026-09-26",
      status: "Active",
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);

  const isAdmin = user.role === "Administrator";
  const collected = 18;
  const pageContent = !isAdmin ? (
    <EmployeeOverviewPage user={user} />
  ) : activePage === "employees" ? (
    <EmployeesPage employees={employees} setEmployees={setEmployees} />
  ) : activePage === "inventory" ? (
    <InventoryPage goodies={goodies} />
  ) : activePage === "events" ? (
    <EventsPage events={events} onAdd={() => setModalOpen(true)} />
  ) : activePage === "distribution" ? (
    <DistributionPage employees={employees} goodies={goodies} events={events} />
  ) : (
    <OverviewPage
      collected={collected}
      employees={employees}
      goodies={goodies}
      onRecord={() => setActivePage("distribution")}
    />
  );

  return (
    <MainLayout
      user={user}
      activePage={activePage}
      isAdmin={isAdmin}
      onNavigate={setActivePage}
      onLogout={onLogout}
    >
      {pageContent}
      {modalOpen && (
        <Modal
          title="Create distribution event"
          onClose={() => setModalOpen(false)}
        >
          <EventForm
            onSave={(event) => {
              setEvents([
                ...events,
                { ...event, id: events.length + 1, status: "Draft" },
              ]);
              setModalOpen(false);
            }}
          />
        </Modal>
      )}
    </MainLayout>
  );
}

function OverviewPage({ collected, employees, goodies, onRecord }) {
  const totalStock = goodies.reduce((sum, goodie) => sum + goodie.stock, 0);
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
          <strong className="stat-value">September Welcome Kit</strong>
          <small>26 Sep 2026</small>
        </Card>
        <Card>
          <span className="stat-label">Collected</span>
          <strong className="stat-value">{collected}</strong>
          <small>of {employees.length * 10} active employees</small>
        </Card>
        <Card>
          <span className="stat-label">Pending</span>
          <strong className="stat-value">
            
            {employees.length * 10 - collected}
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
          <h2>September Welcome Kit</h2>
          <p>
            Keep collections moving and maintain a clean record for every
            employee.
          </p>
          <div className="progress-track">
            <span
              style={{
                width: `${(collected / (employees.length * 10)) * 100}%`,
              }}
            />
          </div>
          <div className="progress-label">
            <span>Collection progress</span>
            <strong>
              {Math.round((collected / (employees.length * 10)) * 100)}%
            </strong>
          </div>
        </Card>
        <Card className="quick-card">
          <span className="eyebrow">QUICK LINKS</span>
          <Button variant="link" onClick={() => {}}>
            View employee list <span>-&gt;</span>
          </Button>
          <Button variant="link" onClick={() => {}}>
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

function EmployeesPage({ employees, setEmployees }) {
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
    { key: "code", label: "Code" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];
  return (
    <>
      <PageHeader
        eyebrow="PEOPLE"
        title="Employees"
        copy="The people your weekly program is built around."
        action={
          <Button
            onClick={() =>
              setEmployees([
                ...employees,
                {
                  id: employees.length + 1,
                  name: "New employee",
                  email: "new@acme.test",
                  department: "Unassigned",
                  code: `EMP-100${employees.length + 1}`,
                  status: "Active",
                },
              ])
            }
          >
            Add employee
          </Button>
        }
      />
      <Card className="table-card">
        <Table columns={columns} rows={employees} />
      </Card>
    </>
  );
}

function InventoryPage({ goodies }) {
  return (
    <>
      <PageHeader
        eyebrow="INVENTORY"
        title="Goodies"
        copy="A live view of what is ready to go."
      />
      <div className="inventory-grid">
        {goodies.map((goodie) => (
          <Card className="inventory-card" key={goodie.id}>
            <span className="inventory-dot" />
            <h2>{goodie.name}</h2>
            <p>{goodie.description}</p>
            <strong>{goodie.stock}</strong>
            <small>available now</small>
          </Card>
        ))}
      </div>
    </>
  );
}

function EventsPage({ events, onAdd }) {
  const columns = [
    { key: "name", label: "Event" },
    { key: "date", label: "Date" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
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
        <Table columns={columns} rows={events} />
      </Card>
    </>
  );
}

function DistributionPage({ employees, goodies, events }) {
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
            <select>
              <option>Choose an employee</option>
              {employees.map((employee) => (
                <option key={employee.id}>{employee.name}</option>
              ))}
            </select>
          </label>
          <label>
            Event
            <select>
              <option>{events[0].name}</option>
            </select>
          </label>
          <label>
            Goodie
            <select>
              <option>Choose a goodie</option>
              {goodies.map((goodie) => (
                <option key={goodie.id}>{goodie.name}</option>
              ))}
            </select>
          </label>
        </div>
        <Button>Confirm collection</Button>
      </Card>
    </>
  );
}

function EventForm({ onSave }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  return (
    <form
      className="modal-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ name, date });
      }}
    >
      <label>
        Event name
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. October Welcome Kit"
        />
      </label>
      <label>
        Event date
        <input
          required
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </label>
      <Button type="submit">Save event</Button>
    </form>
  );
}

export default App;

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
  const [employeeEvents, setEmployeeEvents] = useState([]);
  const [employeeDistributions, setEmployeeDistributions] = useState([]);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");
  const isAdmin = user.role === "admin";

  async function loadData() {
    if (!isAdmin) {
      try {
        const [eventResponse, distributionResponse] = await Promise.all([
          api.get("/auth/events"),
          api.get("/auth/distributions"),
        ]);
        setEmployeeEvents(eventResponse.data);
        setEmployeeDistributions(distributionResponse.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Could not load eligible events.",
        );
      }
      return;
    }
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

  async function updateDistributionStatus(id, status) {
    try {
      await api.patch(`/admin/distributions/${id}/status`, { status });
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not update distribution status.",
      );
    }
  }

  async function exportDistributions() {
    try {
      const { data } = await api.get("/admin/distributions/export", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "goodietrack-distributions.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not export data.",
      );
    }
  }

  const pageContent = !isAdmin ? (
    <EmployeeOverviewPage
      user={user}
      events={employeeEvents}
      distributions={employeeDistributions}
    />
  ) : activePage === "employees" ? (
    <EmployeesPage
      employees={employees}
      distributions={distributions}
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
      onEdit={(event) => setModal({ type: "event", record: event })}
      onCancel={(id) => deactivate(`/admin/events/${id}`)}
    />
  ) : activePage === "distribution" ? (
    <DistributionPage
      employees={employees}
      goodies={goodies}
      events={events}
      distributions={distributions}
      onSave={(payload) => createRecord("/admin/distributions", payload)}
      onStatusUpdate={updateDistributionStatus}
      onExport={exportDistributions}
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
          <Modal
            title={`${typeof modal === "string" ? "Add" : "Edit"} ${typeof modal === "string" ? modal : modal.type}`}
            onClose={() => setModal(null)}
          >
            <EntityForm
              type={typeof modal === "string" ? modal : modal.type}
              employees={employees}
              initialValue={
                typeof modal === "string" ? undefined : modal.record
              }
              onSave={async (payload) => {
                const type = typeof modal === "string" ? modal : modal.type;
                if (typeof modal === "string")
                  return createRecord(
                    `/admin/${type === "employee" ? "users" : `${type}s`}`,
                    payload,
                  );
                try {
                  await api.patch(`/admin/events/${modal.record._id}`, payload);
                  setModal(null);
                  await loadData();
                } catch (requestError) {
                  setError(
                    requestError.response?.data?.message ||
                      "Could not update event.",
                  );
                }
              }}
            />
          </Modal>
        )}
      </>
    </MainLayout>
  );
}

function EmployeeOverviewPage({ user, events, distributions }) {
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
          <strong className="stat-value">
            {distributions.filter((record) => record.status !== "cancelled").length}
          </strong>
          <small>Recorded for your account</small>
        </Card>
      </div>
      <Card className="table-card">
        <h2>Eligible events</h2>
        {events.length ? (
          events.map((event) => (
            <div className="event-summary" key={event._id}>
              <strong>{event.name}</strong>
              <small>{new Date(event.date).toLocaleDateString()}</small>
            </div>
          ))
        ) : (
          <p>No eligible events are available.</p>
        )}
      </Card>
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
function OverviewPage({
  employees,
  goodies,
  distributions,
  onNavigate,
  onRecord,
}) {
  const totalStock = goodies.reduce((sum, item) => sum + item.stock, 0);
  const collected = distributions.filter(
    (item) => item.status === "received",
  ).length;
  const activeEvent = distributions[0]?.event?.name || "No collections yet";
  return (
    <>
      <PageHeader
        eyebrow="ADMIN CONSOLE"
        title="Hello, Admin."
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

function EmployeesPage({ employees, distributions, onAdd, onDeactivate }) {
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
      key: "distributionStatus",
      label: "Goodie status",
      render: (row) => {
        const employeeRecords = distributions.filter(
          (record) =>
            record.employee?._id === row._id || record.employee === row._id,
        );
        if (!employeeRecords.length) return <StatusBadge status="Pending" />;
        return employeeRecords.map((record) => (
          <div key={record._id}>
            <small>{record.eventName || record.event?.name || "Event"}</small>
            <br />
            <StatusBadge status={record.status || "received"} />
          </div>
        ));
      },
    },
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
function EventsPage({ events, onAdd, onEdit, onCancel }) {
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
            <button className="logout-link" onClick={() => onEdit(row)}>
              Edit
            </button>
          )}
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
function DistributionPage({
  employees,
  goodies,
  events,
  distributions,
  onSave,
  onStatusUpdate,
  onExport,
}) {
  const [employee, setEmployee] = useState("");
  const [goodie, setGoodie] = useState("");
  const [event, setEvent] = useState("");
  const selectedEvent = events.find((item) => item._id === event);
  const eligibleEmployeeIds = (selectedEvent?.eligibleEmployees || []).map(
    (item) => item._id || item,
  );
  const selectableEmployees = selectedEvent
    ? eligibleEmployeeIds.length
      ? employees.filter((item) => eligibleEmployeeIds.includes(item._id))
      : employees
    : [];
  return (
    <>
      <PageHeader
        eyebrow="DISTRIBUTION DESK"
        title="Record a collection"
        copy="One employee, one goodie, one clear record."
        action={
          <Button variant="ghost" onClick={onExport}>
            Export Excel
          </Button>
        }
      />
      <Card className="form-card">
        <div className="form-grid">
          <label>
            Employee
            <select
              value={employee}
              onChange={(item) => setEmployee(item.target.value)}
            >
              <option value="">
                {selectedEvent
                  ? "Choose an eligible employee"
                  : "Choose an event first"}
              </option>
              {selectableEmployees.map((item) => (
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
              onChange={(item) => {
                setEvent(item.target.value);
                setEmployee("");
              }}
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
      <Card className="table-card">
        <Table
          columns={[
            {
              key: "employee",
              label: "Employee",
              render: (row) => (
                <>
                  <strong>
                    {row.employeeName ||
                      row.employee?.name ||
                      "Unknown employee"}
                  </strong>
                  <small>
                    {row.employeeCode || row.employee?.employeeCode}
                  </small>
                </>
              ),
            },
            {
              key: "event",
              label: "Event",
              render: (row) => row.eventName || row.event?.name || "-",
            },
            {
              key: "goodie",
              label: "Goodie",
              render: (row) => row.goodieName || row.goodie?.name || "-",
            },
            {
              key: "status",
              label: "Status",
              render: (row) => (
                <>
                  <StatusBadge status={row.status || "received"} />
                  {row.status !== "cancelled" && (
                    <button
                      className="logout-link"
                      onClick={() =>
                        onStatusUpdate(
                          row._id,
                          row.status === "received" ? "pending" : "received",
                        )
                      }
                    >
                      Mark {row.status === "received" ? "pending" : "received"}
                    </button>
                  )}
                </>
              ),
            },
          ]}
          rows={distributions.map((row) => ({ ...row, id: row._id }))}
          emptyMessage="No distributions recorded yet."
        />
      </Card>
    </>
  );
}
function EntityForm({ type, employees = [], initialValue, onSave }) {
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
        : { name: "", date: "", status: "draft", eligibleEmployees: [] },
  );
  const [eligibilityMode, setEligibilityMode] = useState("everyone");
  useEffect(() => {
    if (!initialValue) return;
    const eligibleEmployees = (initialValue.eligibleEmployees || []).map(
      (employee) => employee._id || employee,
    );
    setForm({
      name: initialValue.name,
      date: initialValue.date?.slice(0, 10),
      status: initialValue.status,
      eligibleEmployees,
    });
    setEligibilityMode(eligibleEmployees.length ? "selected" : "everyone");
  }, [initialValue]);
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
        <>
          <label>
            Date
            <input
              required
              type="date"
              value={form.date}
              onChange={(event) => update("date", event.target.value)}
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => update("status", event.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </label>
          <label>
            Eligible employees
            <select
              value={eligibilityMode}
              onChange={(event) => {
                const mode = event.target.value;
                setEligibilityMode(mode);
                if (mode === "everyone") update("eligibleEmployees", []);
              }}
            >
              <option value="everyone">Everyone</option>
              <option value="selected">Select employees</option>
            </select>
          </label>
          {eligibilityMode === "selected" && (
            <fieldset className="employee-checklist">
              <legend>Choose eligible employees</legend>
              {employees.map((employee) => (
                <label key={employee._id} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.eligibleEmployees.includes(employee._id)}
                    onChange={(event) =>
                      update(
                        "eligibleEmployees",
                        event.target.checked
                          ? [...form.eligibleEmployees, employee._id]
                          : form.eligibleEmployees.filter(
                              (id) => id !== employee._id,
                            ),
                      )
                    }
                  />
                  <span>{employee.name}</span>
                  <small>{employee.employeeCode}</small>
                </label>
              ))}
            </fieldset>
          )}
        </>
      )}
      <Button type="submit">Save {type}</Button>
    </form>
  );
}

export default App;

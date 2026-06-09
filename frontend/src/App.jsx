import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import { ShieldCheck, Stethoscope, Warehouse, Truck, ArrowLeft, LogIn } from 'lucide-react';
import DashboardLayout from './components/DashboardLayout';
import AdminPageContent from './pages/AdminPage';
import AdminUnitsPageContent from './pages/AdminUnitsPage';
import { Layers } from 'lucide-react';

// --- Auth Context Mock ---
// Since we are focusing on Admin and bypassing standard Firebase email auth
// we will manage a simple auth state in the App root.
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    // Check local storage on initial load
    const authStatus = localStorage.getItem('biowin_auth');
    const role = localStorage.getItem('biowin_role');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  const login = (expectedRole, username, password) => {
    const creds = {
      admin: { user: 'Admin123', pass: 'Abcd@123' },
      unit: { user: 'Unit123', pass: 'Unit@123' },
      warehouse: { user: 'Warehouse123', pass: 'Ware@123' },
      convoy: { user: 'Convoy123', pass: 'Convoy@123' }
    };
    
    const c = creds[expectedRole];
    if (c && c.user === username && c.pass === password) {
      setIsAuthenticated(true);
      setUserRole(expectedRole);
      localStorage.setItem('biowin_auth', 'true');
      localStorage.setItem('biowin_role', expectedRole);
      return expectedRole;
    }
    return null;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('biowin_auth');
    localStorage.removeItem('biowin_role');
  };

  return { isAuthenticated, userRole, login, logout };
};

// --- Components ---

const Login = ({ login, isAuthenticated, userRole }) => {
  const { role } = useParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If already authenticated and matches role, redirect to appropriate page
  if (isAuthenticated && userRole === role) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const successRole = login(role, username, password);
    if (successRole) {
      navigate(`/${successRole}`); // Redirect to role page
    } else {
      setError(`Invalid username or password for ${role} access`);
    }
  };

  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'System';

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={40} className="text-primary-green" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{displayRole} Login</h2>
          <p className="text-slate-500">Please enter your credentials</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm font-medium">{error}</div>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-slate-800 text-sm">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Admin123"
              required
              className="px-4 py-3 border border-slate-200 rounded-lg text-base outline-none transition-all focus:border-primary-green focus:ring-4 focus:ring-primary-green/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-slate-800 text-sm">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="px-4 py-3 border border-slate-200 rounded-lg text-base outline-none transition-all focus:border-primary-green focus:ring-4 focus:ring-primary-green/20"
            />
          </div>
          <button type="submit" className="bg-primary-green hover:bg-primary-dark text-white rounded-lg py-3.5 font-semibold flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.98]">
            <LogIn size={18} /> Sign In
          </button>
        </form>
        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 text-sm hover:text-primary-green transition-colors">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ isAuthenticated, userRole, requiredRole, children }) => {
  if (!isAuthenticated || userRole !== requiredRole) {
    return <Navigate to={`/login/${requiredRole}`} replace />;
  }
  return children;
};

const DashboardCard = ({ icon: Icon, title, subtitle, linkTo, footerText }) => {
  return (
    <Link to={linkTo} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      <div className="p-8 flex-grow flex flex-col items-center justify-center text-center">
        <div className="text-primary-green mb-4 w-16 h-16 bg-primary-green/10 rounded-full flex items-center justify-center">
          <Icon size={32} />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="bg-primary-green group-hover:bg-primary-dark text-white p-3 text-center font-semibold text-sm tracking-wide transition-colors">
        {footerText}
      </div>
    </Link>
  );
};

const Dashboard = ({ logout, isAuthenticated }) => {
  useEffect(() => {
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  const cards = [
    { title: 'Admin', subtitle: 'System Administration', icon: ShieldCheck, linkTo: '/admin', footerText: 'Management Access' },
    { title: 'Unit', subtitle: 'Operational Units', icon: Stethoscope, linkTo: '/unit', footerText: 'View Units' },
    { title: 'Warehouse', subtitle: 'Inventory & Storage', icon: Warehouse, linkTo: '/warehouse', footerText: 'Manage Stock' },
    { title: 'Convoy', subtitle: 'Transportation & Logistics', icon: Truck, linkTo: '/convoy', footerText: 'Track Fleet' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 min-h-screen">
      <header className="mb-12 text-center relative flex flex-col items-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Biowin Dashboard</h1>
        <p className="text-slate-500 text-lg">Select a module to manage your operations</p>
        {isAuthenticated && (
          <button onClick={logout} className="absolute right-0 top-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">Logout</button>
        )}
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, index) => (
          <DashboardCard
            key={index}
            title={card.title}
            subtitle={card.subtitle}
            icon={card.icon}
            linkTo={card.linkTo}
            footerText={card.footerText}
          />
        ))}
      </div>
    </div>
  );
};

const PageTemplate = ({ title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm m-8">
    <h1 className="text-3xl font-bold text-primary-green mb-4">{title}</h1>
    <p className="text-slate-700">{description}</p>
  </div>
);

const AdminPage = ({ logout }) => {
  const navItems = [
    { label: 'Admin Center', icon: ShieldCheck, path: '/admin' },
    { label: 'Units', icon: Layers, path: '/admin/units' }
  ];
  return (
    <DashboardLayout navItems={navItems} logout={logout}>
      <AdminPageContent />
    </DashboardLayout>
  );
};

const AdminUnits = ({ logout }) => {
  const navItems = [
    { label: 'Admin Center', icon: ShieldCheck, path: '/admin' },
    { label: 'Units', icon: Layers, path: '/admin/units' }
  ];
  return (
    <DashboardLayout navItems={navItems} logout={logout}>
      <AdminUnitsPageContent />
    </DashboardLayout>
  );
};

const UnitPage = ({ logout }) => {
  const navItems = [
    { label: 'Units', icon: Stethoscope, path: '/unit' }
  ];
  return (
    <DashboardLayout navItems={navItems} logout={logout}>
      <PageTemplate title="Unit Operations" description="Manage all operational units here." />
    </DashboardLayout>
  );
};

const WarehousePage = ({ logout }) => {
  const navItems = [
    { label: 'Warehouse', icon: Warehouse, path: '/warehouse' }
  ];
  return (
    <DashboardLayout navItems={navItems} logout={logout}>
      <PageTemplate title="Warehouse Management" description="Inventory and stock controls." />
    </DashboardLayout>
  );
};

const ConvoyPage = ({ logout }) => {
  const navItems = [
    { label: 'Convoy', icon: Truck, path: '/convoy' }
  ];
  return (
    <DashboardLayout navItems={navItems} logout={logout}>
      <PageTemplate title="Convoy Tracking" description="Fleet and logistics management." />
    </DashboardLayout>
  );
};

function App() {
  const { isAuthenticated, userRole, login, logout } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard logout={logout} isAuthenticated={isAuthenticated} />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/login/:role" element={<Login login={login} isAuthenticated={isAuthenticated} userRole={userRole} />} />
        
        {/* Protected Routes */}
        <Route path="/admin" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="admin">
            <AdminPage logout={logout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/units" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="admin">
            <AdminUnits logout={logout} />
          </ProtectedRoute>
        } />
        <Route path="/unit" element={<UnitPage logout={logout} />} />
        <Route path="/warehouse" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="warehouse">
            <WarehousePage logout={logout} />
          </ProtectedRoute>
        } />
        <Route path="/convoy" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="convoy">
            <ConvoyPage logout={logout} />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

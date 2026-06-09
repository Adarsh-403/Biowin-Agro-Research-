import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import { ShieldCheck, Stethoscope, Warehouse, Truck, ArrowLeft, LogIn, ShoppingBag, History, PlusCircle, DollarSign, Package, Trash2, Coins, TrendingUp, Layers, LogOut, Search, Edit2, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from './components/DashboardLayout';
import AdminPageContent from './pages/AdminPage';
import AdminUnitsPageContent from './pages/AdminUnitsPage';
import AdminWarehousesPageContent from './pages/AdminWarehousesPage';
import AdminConvoysPageContent from './pages/AdminConvoysPage';

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

  const login = async (expectedRole, username, password) => {
    if (expectedRole === 'admin') {
      const creds = {
        admin: { user: 'Admin123', pass: 'Abcd@123' },
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
    }
    
    // For warehouse and convoy, call backend
    if (expectedRole === 'warehouse' || expectedRole === 'convoy') {
      try {
        const endpoint = expectedRole === 'warehouse' ? '/api/auth/warehouse-login' : '/api/auth/convoy-login';
        const bodyIdField = expectedRole === 'warehouse' ? 'warehouseId' : 'convoyId';
        
        const res = await fetch(`http://localhost:5000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [bodyIdField]: username, password })
        });
        
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
          setUserRole(expectedRole);
          localStorage.setItem('biowin_auth', 'true');
          localStorage.setItem('biowin_role', expectedRole);
          if (expectedRole === 'warehouse') {
            localStorage.setItem('biowin_warehouse_data', JSON.stringify(data.warehouse));
          }
          return expectedRole;
        }
      } catch (err) {
        console.error("Login error:", err);
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const successRole = await login(role, username, password);
    if (successRole) {
      navigate(`/${successRole}`); // Redirect to role page
    } else {
      setError(`Invalid ID or password for ${role} access`);
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
            <label className="font-medium text-slate-800 text-sm">{role === 'admin' ? 'Username' : `${displayRole} ID`}</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={role === 'admin' ? "e.g. Admin123" : "e.g. 123"}
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
        <div className="text-spice-dark mb-4 w-16 h-16 bg-spice-dark/10 rounded-full flex items-center justify-center">
          <Icon size={32} />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="bg-spice-dark group-hover:bg-spice-darker text-white p-3 text-center font-semibold text-sm tracking-wide transition-colors">
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
    <h1 className="text-3xl font-bold text-spice-dark mb-4">{title}</h1>
    <p className="text-slate-700">{description}</p>
  </div>
);

const AdminPage = ({ logout }) => {
  const navItems = [
    { label: 'Admin Center', icon: ShieldCheck, path: '/admin' },
    { label: 'Units', icon: Layers, path: '/admin/units' },
    { label: 'Warehouses', icon: Warehouse, path: '/admin/warehouses' },
    { label: 'Convoys', icon: Truck, path: '/admin/convoys' }
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
    { label: 'Units', icon: Layers, path: '/admin/units' },
    { label: 'Warehouses', icon: Warehouse, path: '/admin/warehouses' },
    { label: 'Convoys', icon: Truck, path: '/admin/convoys' }
  ];
  return (
    <DashboardLayout navItems={navItems} logout={logout}>
      <AdminUnitsPageContent />
    </DashboardLayout>
  );
};

const AdminWarehouses = ({ logout }) => {
  const navItems = [
    { label: 'Admin Center', icon: ShieldCheck, path: '/admin' },
    { label: 'Units', icon: Layers, path: '/admin/units' },
    { label: 'Warehouses', icon: Warehouse, path: '/admin/warehouses' },
    { label: 'Convoys', icon: Truck, path: '/admin/convoys' }
  ];
  return (
    <DashboardLayout navItems={navItems} logout={logout}>
      <AdminWarehousesPageContent />
    </DashboardLayout>
  );
};

const AdminConvoys = ({ logout }) => {
  const navItems = [
    { label: 'Admin Center', icon: ShieldCheck, path: '/admin' },
    { label: 'Units', icon: Layers, path: '/admin/units' },
    { label: 'Warehouses', icon: Warehouse, path: '/admin/warehouses' },
    { label: 'Convoys', icon: Truck, path: '/admin/convoys' }
  ];
  return (
    <DashboardLayout navItems={navItems} logout={logout}>
      <AdminConvoysPageContent />
    </DashboardLayout>
  );
};

const UnitPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unitIdInput, setUnitIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [unitData, setUnitData] = useState(null);
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState('stock'); // 'stock', 'billing', 'history'
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  
  // Stock Form state
  const [productQty, setProductQty] = useState('');
  const [stockMessage, setStockMessage] = useState({ type: '', text: '' });
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [selectedStockProduct, setSelectedStockProduct] = useState('');
  const [globalProducts, setGlobalProducts] = useState([]);
  const [globalProductSearchQuery, setGlobalProductSearchQuery] = useState('');
  const [editingStockProduct, setEditingStockProduct] = useState(null);
  const [editingStockPrice, setEditingStockPrice] = useState("");

  // Billing Form / Cart state
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [billQty, setBillQty] = useState('');
  const [billingMessage, setBillingMessage] = useState({ type: '', text: '' });
  const [billingSearchQuery, setBillingSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' or 'UPI'
  
  // Load session
  useEffect(() => {
    const isUnitAuth = localStorage.getItem('biowin_unit_auth') === 'true';
    const storedUnit = localStorage.getItem('biowin_unit_data');
    if (isUnitAuth && storedUnit) {
      try {
        const data = JSON.parse(storedUnit);
        setUnitData(data);
        setIsLoggedIn(true);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Fetch products and sales when logged in
  useEffect(() => {
    if (isLoggedIn && unitData) {
      fetchProducts();
      fetchSales();
      fetchLatestMetadata();
      fetchGlobalProducts();
    }
  }, [isLoggedIn, unitData?.unitId]);

  const fetchGlobalProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/warehouses/products');
      const data = await res.json();
      if (data.success) {
        setGlobalProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching global products:", err);
    }
  };

  const fetchLatestMetadata = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/units');
      const data = await res.json();
      if (data.success) {
        const currentUnit = data.units.find(u => u.unitId === unitData.unitId);
        if (currentUnit) {
          setUnitData(currentUnit);
          localStorage.setItem('biowin_unit_data', JSON.stringify(currentUnit));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    if (!unitData) return;
    try {
      const res = await fetch(`http://localhost:5000/api/units/${unitData.unitId}/products`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchSales = async () => {
    if (!unitData) return;
    try {
      const res = await fetch(`http://localhost:5000/api/units/${unitData.unitId}/sales`);
      const data = await res.json();
      if (data.success) {
        setSales(data.sales);
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/unit-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId: unitIdInput, password: passwordInput })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('biowin_unit_auth', 'true');
        localStorage.setItem('biowin_unit_data', JSON.stringify(data.unit));
        setUnitData(data.unit);
        setIsLoggedIn(true);
        setUnitIdInput('');
        setPasswordInput('');
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Failed to connect to server');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('biowin_unit_auth');
    localStorage.removeItem('biowin_unit_data');
    setUnitData(null);
    setIsLoggedIn(false);
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setStockMessage({ type: '', text: '' });
    
    if (!selectedStockProduct) {
      setStockMessage({ type: 'error', text: 'Please select a product from the global catalog' });
      return;
    }

    if (!productQty || Number(productQty) <= 0) {
      setStockMessage({ type: 'error', text: 'Please enter a valid quantity' });
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/units/${unitData.unitId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedStockProduct, quantity: Number(productQty) })
      });
      const data = await res.json();
      if (data.success) {
        setStockMessage({ type: 'success', text: data.message });
        setProductQty('');
        setSelectedStockProduct('');
        setGlobalProductSearchQuery('');
        fetchProducts();
      } else {
        setStockMessage({ type: 'error', text: data.message || 'Failed to stock up' });
      }
    } catch (err) {
      setStockMessage({ type: 'error', text: 'Server error' });
    }
  };

  const handleUpdatePrice = async (productId) => {
    if (!editingStockPrice || isNaN(Number(editingStockPrice))) {
      alert("Please enter a valid price");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/units/${unitData.unitId}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: Number(editingStockPrice) })
      });
      const data = await res.json();
      if (data.success) {
        setEditingStockProduct(null);
        setEditingStockPrice("");
        fetchProducts();
      } else {
        alert(data.message || "Failed to update price");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleDeleteStockProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product from stock?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/units/${unitData.unitId}/products/${productId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const quickAddToCart = (product) => {
    setBillingMessage({ type: '', text: '' });
    if (product.quantity <= 0) {
      setBillingMessage({ type: 'error', text: 'Out of stock' });
      return;
    }

    const existingCartItem = cart.find(item => item.productName === product.name);
    if (existingCartItem) {
      const newQty = existingCartItem.quantity + 1;
      if (product.quantity < newQty) {
        setBillingMessage({ type: 'error', text: `Cannot add more. Stock limit reached.` });
        return;
      }
      setCart(cart.map(item => item.productName === product.name ? { ...item, quantity: newQty } : item));
    } else {
      setCart([...cart, { productName: product.name, quantity: 1, price: product.price }]);
    }
  };

  const updateCartQty = (index, delta) => {
    const item = cart[index];
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    const product = products.find(p => p.name === item.productName);
    if (product && product.quantity < newQty) {
      setBillingMessage({ type: 'error', text: `Cannot add more. Stock limit reached.` });
      return;
    }
    const newCart = [...cart];
    newCart[index].quantity = newQty;
    setCart(newCart);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleCheckout = async () => {
    setBillingMessage({ type: '', text: '' });
    if (cart.length === 0) return;
    try {
      const res = await fetch(`http://localhost:5000/api/units/${unitData.unitId}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, paymentMethod })
      });
      const data = await res.json();
      if (data.success) {
        setBillingMessage({ type: 'success', text: 'Billing completed successfully!' });
        setCart([]);
        setPaymentMethod('Cash');
        fetchProducts();
        fetchSales();
        fetchLatestMetadata();
      } else {
        setBillingMessage({ type: 'error', text: data.message || 'Failed to process sale' });
      }
    } catch (err) {
      setBillingMessage({ type: 'error', text: 'Server error during checkout' });
    }
  };

  const downloadSalesHistory = () => {
    if (sales.length === 0) return;
    const headers = ["Receipt ID", "Date & Time", "Item Name", "Quantity", "Price", "Payment Method", "Total Revenue"];
    const rows = [];
    sales.forEach(sale => {
      sale.items.forEach(item => {
        rows.push([
          sale.receiptId || 'N/A',
          new Date(sale.timestamp).toLocaleString(),
          item.productName,
          item.quantity,
          Number(item.price).toFixed(2),
          sale.paymentMethod || 'Cash',
          Number(sale.totalAmount).toFixed(2)
        ]);
      });
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_history_${unitData?.unitId || 'unit'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 text-center border border-slate-100">
          <div className="mb-8">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope size={40} className="text-spice-dark" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Unit Manager Login</h2>
            <p className="text-slate-500">Access unit stock, billing & sales history</p>
          </div>
          
          {loginError && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm font-medium">{loginError}</div>}
          
          <form onSubmit={handleLogin} className="flex flex-col gap-6 text-left">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-slate-800 text-sm">Unit ID</label>
              <input 
                type="text" 
                value={unitIdInput}
                onChange={(e) => setUnitIdInput(e.target.value)}
                placeholder="e.g. 1042"
                required
                className="px-4 py-3 border border-slate-200 rounded-lg text-base outline-none transition-all focus:border-spice-dark focus:ring-4 focus:ring-spice-dark/20"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-slate-800 text-sm">Password</label>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                required
                className="px-4 py-3 border border-slate-200 rounded-lg text-base outline-none transition-all focus:border-spice-dark focus:ring-4 focus:ring-spice-dark/20"
              />
            </div>
            <button type="submit" className="bg-spice-dark hover:bg-spice-darker text-white rounded-lg py-3.5 font-semibold flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.98] cursor-pointer border-0">
              <LogIn size={18} /> Sign In
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 text-sm hover:text-spice-dark transition-colors">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col py-6 px-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="bg-spice-dark text-white w-10 h-10 rounded-lg flex items-center justify-center">
            <Stethoscope size={24} />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-[1.1rem] font-bold text-slate-800 m-0 leading-tight">{unitData?.name}</h2>
            <p className="text-xs text-slate-500 m-0">Unit Manager (#{unitData?.unitId})</p>
            <div className="mt-1.5 flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Status:</span>
              <select
                value={unitData?.status || 'Active'}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  try {
                    const res = await fetch(`http://localhost:5000/api/units/${unitData.unitId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: newStatus })
                    });
                    const data = await res.json();
                    if (data.success) {
                      const updatedUnit = { ...unitData, status: newStatus };
                      setUnitData(updatedUnit);
                      localStorage.setItem('biowin_unit_data', JSON.stringify(updatedUnit));
                    }
                  } catch (err) {
                    console.error("Error updating unit status:", err);
                  }
                }}
                className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 outline-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <button 
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[0.95rem] transition-all cursor-pointer w-full text-left border-0 ${
              activeTab === 'stock' ? 'bg-orange-100 text-amber-900' : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package size={20} className={activeTab === 'stock' ? 'text-amber-600' : 'text-slate-500'} />
            <span>Stock in Hand</span>
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[0.95rem] transition-all cursor-pointer w-full text-left border-0 ${
              activeTab === 'billing' ? 'bg-orange-100 text-amber-900' : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag size={20} className={activeTab === 'billing' ? 'text-amber-600' : 'text-slate-500'} />
            <span>Billing (POS)</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[0.95rem] transition-all cursor-pointer w-full text-left border-0 ${
              activeTab === 'history' ? 'bg-orange-100 text-amber-900' : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History size={20} className={activeTab === 'history' ? 'text-amber-600' : 'text-slate-500'} />
            <span>Sales History</span>
          </button>
        </nav>

        <div className="flex flex-col gap-2 pt-6 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-semibold text-[0.95rem] transition-all hover:bg-red-100 cursor-pointer w-full text-left border-0"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow p-8 lg:p-10 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-slate-100 rounded-lg text-spice-dark">
              <Coins size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium m-0">Revenue</p>
              <h3 className="text-2xl font-bold text-slate-800 m-0">₹{unitData?.revenue || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-sky-50 rounded-lg text-sky-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium m-0">Total Sales Count</p>
              <h3 className="text-2xl font-bold text-slate-800 m-0">{unitData?.totalSales || 0}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-purple-50 rounded-lg text-purple-600">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium m-0">Unique Products</p>
              <h3 className="text-2xl font-bold text-slate-800 m-0">{products.length}</h3>
            </div>
          </div>
        </div>

        {activeTab === 'stock' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 mt-0 mb-0">Stock in Hand</h3>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search stock..."
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-spice-dark focus:ring-1 focus:ring-spice-dark"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Qty in Hand</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.filter(p => p.name.toLowerCase().includes(stockSearchQuery.toLowerCase()) || (p.productId && p.productId.toLowerCase().includes(stockSearchQuery.toLowerCase()))).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400">No products found.</td>
                      </tr>
                    ) : products.filter(p => p.name.toLowerCase().includes(stockSearchQuery.toLowerCase()) || (p.productId && p.productId.toLowerCase().includes(stockSearchQuery.toLowerCase()))).map((prod) => (
                      <tr key={prod._id} className="border-b border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-400">{prod.productId || 'N/A'}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{prod.name}</td>
                        <td className="py-3.5 px-4">
                          {editingStockProduct === prod.productId ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editingStockPrice}
                              onChange={(e) => setEditingStockPrice(e.target.value)}
                              className="w-20 px-2 py-1 border border-slate-200 rounded text-sm focus:border-spice-dark focus:ring-1 focus:ring-spice-dark outline-none"
                            />
                          ) : (
                            `₹${Number(prod.price).toFixed(2)}`
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold">{prod.quantity}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            prod.quantity > 10 ? 'bg-green-100 text-green-800' : prod.quantity > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {prod.quantity > 10 ? 'In Stock' : prod.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            {editingStockProduct === prod.productId ? (
                              <>
                                <button
                                  onClick={() => handleUpdatePrice(prod.productId)}
                                  className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 cursor-pointer border-0"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingStockProduct(null);
                                    setEditingStockPrice("");
                                  }}
                                  className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300 cursor-pointer border-0"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingStockProduct(prod.productId);
                                    setEditingStockPrice(prod.price);
                                  }}
                                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors border-0 cursor-pointer"
                                  title="Edit Price"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteStockProduct(prod.productId)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors border-0 cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-fit text-left">
              <h3 className="text-lg font-bold text-slate-800 mb-1 mt-0">Stock Up / Add Product</h3>
              <p className="text-xs text-slate-400 mb-4">Select a product from the official global catalog to stock up.</p>
              {stockMessage.text && (
                <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
                  stockMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {stockMessage.text}
                </div>
              )}
              
              <form onSubmit={handleAddStock} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-600">Choose Official Product</label>
                    {selectedStockProduct && (
                      <button 
                        type="button" 
                        onClick={() => setSelectedStockProduct('')}
                        className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer border-0 bg-transparent"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                  
                  {/* Search Input for global products */}
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search official products..."
                      value={globalProductSearchQuery}
                      onChange={(e) => setGlobalProductSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-spice-dark focus:ring-1 focus:ring-spice-dark"
                    />
                  </div>
                  
                  {/* Global Products List */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-50/50">
                    <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100">
                      {globalProducts.filter(p => p.name.toLowerCase().includes(globalProductSearchQuery.toLowerCase()) || (p.productId && p.productId.toLowerCase().includes(globalProductSearchQuery.toLowerCase()))).length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm">No products found.</div>
                      ) : globalProducts.filter(p => p.name.toLowerCase().includes(globalProductSearchQuery.toLowerCase()) || (p.productId && p.productId.toLowerCase().includes(globalProductSearchQuery.toLowerCase()))).map(p => {
                        const isSelected = selectedStockProduct === p.productId;
                        return (
                          <button
                            key={p.productId}
                            type="button"
                            onClick={() => setSelectedStockProduct(p.productId)}
                            className={`w-full text-left p-3 flex justify-between items-center transition-all border-0 cursor-pointer ${
                              isSelected 
                                ? 'bg-orange-50 border-l-4 border-amber-600' 
                                : 'bg-white hover:bg-slate-50 border-l-4 border-transparent'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">ID: #{p.productId}</span>
                            </div>
                            <div className={`font-bold text-sm px-2.5 py-1 rounded transition-colors ${
                              isSelected ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-800'
                            }`}>
                              ₹{Number(p.price).toFixed(2)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-semibold text-slate-600">Quantity to Stock</label>
                  <input 
                    type="number"
                    required
                    value={productQty}
                    onChange={(e) => setProductQty(e.target.value)}
                    placeholder="Enter quantity (e.g. 100)"
                    className="px-3.5 py-2.5 border border-slate-200 rounded-lg outline-none focus:border-spice-dark focus:ring-2 focus:ring-spice-dark/10"
                  />
                </div>
                <button type="submit" className="bg-spice-dark hover:bg-spice-darker text-white rounded-lg py-3 font-semibold flex items-center justify-center gap-2 mt-2 transition-all cursor-pointer border-0 active:scale-[0.98]">
                  <PlusCircle size={18} /> Add to Stock
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Products Grid (Left Side - POS Style) */}
            <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 m-0">Point of Sale</h3>
                <div className="relative w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={billingSearchQuery}
                    onChange={(e) => setBillingSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-spice-dark focus:ring-1 focus:ring-spice-dark"
                  />
                </div>
              </div>
              
              {billingMessage.text && (
                <div className={`p-4 rounded-lg mb-6 text-sm font-semibold border ${
                  billingMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {billingMessage.text}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.filter(p => p.name.toLowerCase().includes(billingSearchQuery.toLowerCase()) || (p.productId && p.productId.toLowerCase().includes(billingSearchQuery.toLowerCase()))).map(p => {
                  const outOfStock = p.quantity <= 0;
                  return (
                    <button 
                      key={p._id}
                      onClick={() => !outOfStock && quickAddToCart(p)}
                      disabled={outOfStock}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        outOfStock 
                          ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed' 
                          : 'border-slate-100 bg-white hover:border-spice-dark hover:shadow-md cursor-pointer active:scale-95'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-xs font-bold text-slate-400">Stock: {p.quantity}</div>
                        <div className="text-[10px] font-mono text-slate-300">#{p.productId || 'N/A'}</div>
                      </div>
                      <div className="font-bold text-slate-800 text-[1.05rem] leading-tight mb-2 h-10 overflow-hidden">{p.name}</div>
                      <div className="font-bold text-spice-dark text-lg">₹{Number(p.price).toFixed(2)}</div>
                    </button>
                  )
                })}
                {products.filter(p => p.name.toLowerCase().includes(billingSearchQuery.toLowerCase()) || (p.productId && p.productId.toLowerCase().includes(billingSearchQuery.toLowerCase()))).length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-400 font-medium">No products found.</div>
                )}
              </div>
            </div>

            {/* Receipt / Cart (Right Side) */}
            <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-[calc(100vh-140px)] sticky top-6">
              <div className="p-5 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                <h3 className="text-lg font-bold text-slate-800 m-0 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-spice-dark" />
                  Current Order
                </h3>
              </div>
              
              <div className="flex-grow overflow-y-auto p-5">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 opacity-60">
                    <ShoppingBag size={48} />
                    <p className="font-medium">Cart is empty</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex-grow pr-4">
                          <div className="font-bold text-slate-800 mb-1 leading-tight">{item.productName}</div>
                          <div className="text-sm font-semibold text-spice-dark">₹{Number(item.price).toFixed(2)}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="font-bold text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</div>
                          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                            <button onClick={() => updateCartQty(idx, -1)} className="w-7 h-7 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer border-0">
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-slate-700 text-sm">{item.quantity}</span>
                            <button onClick={() => updateCartQty(idx, 1)} className="w-7 h-7 rounded-md bg-white shadow-sm flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer border-0">
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkout Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-500 font-bold">Subtotal</span>
                  <span className="text-lg font-bold text-slate-800">
                    ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500 font-bold">Tax</span>
                  <span className="text-lg font-bold text-slate-800">₹0.00</span>
                </div>
                <div className="flex flex-col gap-2 mb-4 pt-4 border-t border-slate-200">
                  <span className="text-slate-500 font-bold text-sm text-left">Payment Method</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash')}
                      className={`flex-1 py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                        paymentMethod === 'Cash'
                          ? 'bg-orange-50 border-amber-500 text-amber-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`flex-1 py-2 rounded-lg font-bold border transition-all cursor-pointer ${
                        paymentMethod === 'UPI'
                          ? 'bg-orange-50 border-amber-500 text-amber-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      UPI
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-200">
                  <span className="text-slate-800 font-black text-xl">Total</span>
                  <span className="text-3xl font-black text-spice-dark">
                    ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                  </span>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all border-0 ${
                    cart.length > 0 
                      ? 'bg-spice-dark hover:bg-spice-darker text-white shadow-lg shadow-slate-200 cursor-pointer active:scale-[0.98]' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  PAY NOW
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800 m-0 text-left">Sales History</h3>
              {sales.length > 0 && (
                <button
                  onClick={downloadSalesHistory}
                  className="bg-spice-dark hover:bg-spice-darker text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border-0 active:scale-95"
                >
                  Download CSV
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Receipt ID</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">No sales history found.</td>
                    </tr>
                  ) : sales.map((sale) => (
                    sale.items.map((item, idx) => (
                      <tr key={`${sale._id}-${idx}`} className="border-b border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors text-left">
                        {idx === 0 ? (
                          <>
                            <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-400" rowSpan={sale.items.length}>
                              {sale.receiptId || 'N/A'}
                            </td>
                            <td className="py-3.5 px-4 text-sm font-semibold text-slate-500" rowSpan={sale.items.length}>
                              {new Date(sale.timestamp).toLocaleString()}
                            </td>
                          </>
                        ) : null}
                        <td className="py-3.5 px-4 text-slate-800 font-semibold">
                          {item.productName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-semibold">
                          {item.quantity}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          ₹{Number(item.price).toFixed(2)}
                        </td>
                        {idx === 0 ? (
                          <>
                            <td className="py-3.5 px-4 text-sm font-semibold" rowSpan={sale.items.length}>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                sale.paymentMethod === 'UPI' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {sale.paymentMethod || 'Cash'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-800 font-mono" rowSpan={sale.items.length}>
                              ₹{Number(sale.totalAmount).toFixed(2)}
                            </td>
                          </>
                        ) : null}
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const WarehousePage = ({ logout }) => {
  const navItems = [
    { label: 'Warehouse', icon: Warehouse, path: '/warehouse' },
    { label: 'Products', icon: Package, path: '/warehouse/products' }
  ];
  return (
    <DashboardLayout navItems={navItems} logout={logout} title="Warehouse" subtitle="Inventory Management">
      <PageTemplate title="Warehouse Management" description="Inventory and stock controls." />
    </DashboardLayout>
  );
};

const WarehouseProductsPageContent = () => {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [editProductId, setEditProductId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/warehouses/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleAddOrEditProduct = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!productName.trim()) {
      setMessage({ type: 'error', text: 'Product name is required' });
      return;
    }

    try {
      const url = editProductId 
        ? `http://localhost:5000/api/warehouses/products/${editProductId}`
        : 'http://localhost:5000/api/warehouses/products';
      const method = editProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: productName, price: productPrice })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setProductName('');
        setProductPrice('');
        setEditProductId(null);
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to save product' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error' });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/warehouses/products/${productId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
        setMessage({ type: 'success', text: 'Product deleted successfully' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Server error' });
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      const res = await fetch(`http://localhost:5000/api/warehouses/products/${product.productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !product.isAvailable })
      });
      const data = await res.json();
      if (data.success) {
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (product) => {
    setEditProductId(product.productId);
    setProductName(product.name);
    setProductPrice(product.price);
    setMessage({ type: '', text: '' });
  };

  const cancelEdit = () => {
    setEditProductId(null);
    setProductName('');
    setProductPrice('');
    setMessage({ type: '', text: '' });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.productId && p.productId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800 mt-0 mb-0">Global Products List</h3>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Hex ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">No products found.</td>
                </tr>
              ) : filteredProducts.map((prod) => (
                <tr key={prod._id} className="border-b border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-400">{prod.productId || 'N/A'}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{prod.name}</td>
                  <td className="py-3.5 px-4">₹{Number(prod.price).toFixed(2)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      prod.isAvailable !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {prod.isAvailable !== false ? 'Available' : 'Not Available'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleToggleAvailability(prod)}
                        title="Toggle Availability"
                        className={`p-1.5 rounded-md transition-colors border-0 cursor-pointer ${
                          prod.isAvailable !== false ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                      >
                        {prod.isAvailable !== false ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button 
                        onClick={() => handleEditClick(prod)}
                        title="Edit"
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors border-0 cursor-pointer"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(prod.productId)}
                        title="Delete"
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors border-0 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-fit">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 mt-0">
          {editProductId ? 'Edit Product' : 'Add New Product'}
        </h3>
        {message.text && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleAddOrEditProduct} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-semibold text-slate-600">Product Name</label>
            <input 
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Organic Wheat Seeds"
              className="px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-semibold text-slate-600">Price (₹)</label>
            <input 
              type="number"
              step="0.01"
              required
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="e.g. 12.50"
              className="px-3.5 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border-0">
              {editProductId ? <><Edit2 size={18} /> Update</> : <><PlusCircle size={18} /> Add Product</>}
            </button>
            {editProductId && (
              <button type="button" onClick={cancelEdit} className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2.5 font-semibold transition-all cursor-pointer border-0">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const WarehouseProductsPage = ({ logout }) => {
  const navItems = [
    { label: 'Warehouse', icon: Warehouse, path: '/warehouse' },
    { label: 'Products', icon: Package, path: '/warehouse/products' }
  ];
  return (
    <DashboardLayout navItems={navItems} logout={logout} title="Warehouse" subtitle="Inventory Management">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 m-0">Products</h1>
        <p className="text-slate-500 mt-1">Manage global product catalog</p>
      </div>
      <WarehouseProductsPageContent />
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
        <Route path="/admin/warehouses" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="admin">
            <AdminWarehouses logout={logout} />
          </ProtectedRoute>
        } />
        <Route path="/admin/convoys" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="admin">
            <AdminConvoys logout={logout} />
          </ProtectedRoute>
        } />
        <Route path="/unit" element={<UnitPage logout={logout} />} />
        <Route path="/warehouse" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="warehouse">
            <WarehousePage logout={logout} />
          </ProtectedRoute>
        } />
        <Route path="/warehouse/products" element={
          <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="warehouse">
            <WarehouseProductsPage logout={logout} />
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

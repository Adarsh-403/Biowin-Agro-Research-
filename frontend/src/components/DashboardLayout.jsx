import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, HelpCircle, Activity, ShieldCheck } from 'lucide-react';

const DashboardLayout = ({ children, navItems, logout, title = "Biowin", subtitle = "Enterprise Admin" }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col py-6 px-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="bg-spice-dark text-white w-10 h-10 rounded-lg flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[1.1rem] font-bold text-slate-800 m-0 leading-tight">{title}</h2>
            <p className="text-xs text-slate-500 m-0">{subtitle}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <Link 
                key={index} 
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-[0.95rem] transition-all group ${
                  isActive 
                    ? 'bg-orange-100 text-amber-900' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon size={20} className={`${isActive ? 'text-amber-600' : 'text-slate-500 group-hover:text-slate-600'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 pt-6 border-t border-slate-200">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-[0.95rem] transition-all cursor-pointer w-full bg-spice-dark text-white justify-center mb-2 hover:bg-spice-darker">
            <Activity size={18} /> System Status
          </button>
          <button className="flex items-center gap-3 px-4 py-3 bg-transparent rounded-lg text-slate-600 font-medium text-[0.95rem] transition-all hover:bg-slate-100 cursor-pointer w-full text-left">
            <HelpCircle size={18} className="text-slate-500" /> Support
          </button>
          <button 
            className="flex items-center gap-3 px-4 py-3 bg-transparent rounded-lg text-slate-500 font-medium text-[0.95rem] transition-all hover:bg-slate-100 cursor-pointer w-full text-left" 
            onClick={logout}
          >
            <LogOut size={18} className="text-slate-500" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;

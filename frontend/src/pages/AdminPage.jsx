import React from 'react';
import { Download, Plus, Users, Cloud, FileText, Search, Settings, ChevronRight, ChevronLeft, Filter } from 'lucide-react';

const AdminPage = () => {
  const mockUsers = [
    { initials: 'JD', name: 'Jane Doe', email: 'jane.d@spiceops.com', role: 'Regional Mgr', unit: 'Unit A', status: 'Active', bgColor: '#1a4d3a' },
    { initials: 'MS', name: 'Michael Smith', email: 'm.smith@spiceops.com', role: 'Inventory Lead', unit: 'Unit B', status: 'Active', bgColor: '#f59e0b' },
    { initials: 'AW', name: 'Alice Wong', email: 'a.wong@spiceops.com', role: 'Floor Staff', unit: 'Unit A', status: 'Offline', bgColor: '#9ca3af' },
    { initials: 'RJ', name: 'Robert Jones', email: 'rjones@spiceops.com', role: 'Auditor', unit: 'Global', status: 'Suspended', bgColor: '#ef4444' }
  ];

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Center</h1>
          <p className="text-slate-500 text-[0.95rem] m-0">Organization-wide management and system overview.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
            <Download size={16} /> Export Data
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all bg-spice-dark border border-spice-dark text-white hover:bg-spice-darker">
            <Plus size={16} /> New User
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold text-slate-500 tracking-wider">TOTAL ACTIVE USERS</span>
            <Users size={18} className="text-slate-600" />
          </div>
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-bold text-slate-900 leading-none m-0">1,248</h2>
            <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-slate-700">📈 +12%</span>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold text-slate-500 tracking-wider">SYSTEM UPTIME</span>
            <Cloud size={18} className="text-slate-600" />
          </div>
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-bold text-slate-900 leading-none m-0">99.99%</h2>
            <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-slate-500">30 Days</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold text-slate-500 tracking-wider">TOTAL TRANSACTIONS</span>
            <FileText size={18} className="text-slate-600" />
          </div>
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-bold text-slate-900 leading-none m-0">45.2k</h2>
            <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-slate-700">📈 +5.4%</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Left Column: User Management */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-slate-900 m-0">User Management</h3>
            <div className="flex items-center gap-2 bg-gray-50 border border-slate-200 rounded-md py-1.5 px-3">
              <Search size={16} className="text-gray-400" />
              <input type="text" placeholder="Search users..." className="border-none bg-transparent outline-none text-sm w-36" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 p-4 border-b border-gray-100 bg-gray-50">NAME</th>
                  <th className="text-left text-xs font-semibold text-slate-500 p-4 border-b border-gray-100 bg-gray-50">ROLE</th>
                  <th className="text-left text-xs font-semibold text-slate-500 p-4 border-b border-gray-100 bg-gray-50">UNIT</th>
                  <th className="text-left text-xs font-semibold text-slate-500 p-4 border-b border-gray-100 bg-gray-50">STATUS</th>
                  <th className="text-left text-xs font-semibold text-slate-500 p-4 border-b border-gray-100 bg-gray-50">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user, idx) => (
                  <tr key={idx}>
                    <td className="p-4 border-b border-gray-100 text-sm text-slate-700 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: user.bgColor }}>
                          {user.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{user.name}</span>
                          <span className="text-xs text-slate-500">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border-b border-gray-100 text-sm text-slate-700 align-middle">{user.role}</td>
                    <td className="p-4 border-b border-gray-100 text-sm text-slate-700 align-middle">{user.unit}</td>
                    <td className="p-4 border-b border-gray-100 text-sm text-slate-700 align-middle">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Active' ? 'bg-green-100 text-green-800' :
                        user.status === 'Offline' ? 'bg-gray-100 text-slate-600' :
                        user.status === 'Suspended' ? 'bg-red-100 text-red-800' : ''
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 border-b border-gray-100 text-sm text-slate-700 align-middle">
                      {/* Empty actions col in screenshot */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center p-4 border-t border-gray-100">
            <span className="text-sm text-slate-500">Showing 1-4 of 1,248</span>
            <div className="flex gap-2">
              <button className="bg-transparent border-none text-slate-500 cursor-pointer flex items-center justify-center"><ChevronLeft size={16} /></button>
              <button className="bg-transparent border-none text-slate-500 cursor-pointer flex items-center justify-center"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Global Thresholds */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900 m-0">Global Thresholds</h3>
              </div>
              <button className="bg-transparent border-none text-slate-600 text-sm font-medium cursor-pointer">Edit</button>
            </div>

            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between text-sm text-slate-700 mb-2">
                <span>Low Stock Warning (%)</span>
                <span>15%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between text-sm text-slate-700 mb-2">
                <span>Auto-Reorder Level</span>
                <span>5%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>

            <div className="flex justify-between items-center p-5">
              <div className="flex flex-col">
                <span className="text-sm text-slate-700">Maintenance Mode</span>
                <span className="text-xs text-slate-500">Suspend non-admin logins</span>
              </div>
              <div className="w-9 h-5 bg-slate-300 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-[2px] left-[2px] shadow"></div>
              </div>
            </div>
          </div>

          {/* Unit Overview */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900 m-0">Unit Overview</h3>
              </div>
              <button className="bg-transparent border-none text-slate-500 cursor-pointer flex items-center justify-center"><Filter size={16} /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
              <div className="border border-slate-200 rounded-lg p-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-900">Unit A</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-xs text-slate-500">North Region</div>
                <div className="text-sm font-semibold text-slate-900 mt-1">98% OEE</div>
              </div>
              
              <div className="border border-slate-200 rounded-lg p-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-900">Unit B</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-700"></div>
                </div>
                <div className="text-xs text-slate-500">East Region</div>
                <div className="text-sm font-semibold text-slate-900 mt-1">82% OEE</div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-900">Unit C</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-xs text-slate-500">South Region</div>
                <div className="text-sm font-semibold text-slate-900 mt-1">95% OEE</div>
              </div>

              <div className="border border-red-300 bg-red-50 rounded-lg p-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-red-800">Unit D</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                </div>
                <div className="text-xs text-red-800">West Region</div>
                <div className="text-sm font-semibold text-red-800 mt-1">64% OEE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

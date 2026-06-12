import React, { useState, useEffect } from 'react';
import { Download, Users, Cloud, FileText, Search, Settings, ChevronRight, ChevronLeft, Filter, Layers, Warehouse, Truck, IndianRupee, Activity } from 'lucide-react';

const AdminPage = () => {
  const [units, setUnits] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [convoys, setConvoys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const [unitsRes, warehousesRes, convoysRes] = await Promise.all([
          fetch(`${apiUrl}/api/units`),
          fetch(`${apiUrl}/api/warehouses`),
          fetch(`${apiUrl}/api/convoys`)
        ]);

        const unitsData = await unitsRes.json();
        const warehousesData = await warehousesRes.json();
        const convoysData = await convoysRes.json();

        if (unitsData.success) setUnits(unitsData.units);
        if (warehousesData.success) setWarehouses(warehousesData.warehouses);
        if (convoysData.success) setConvoys(convoysData.convoys);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalRevenue = units.reduce((sum, u) => sum + (Number(u.revenue) || 0), 0);
  const totalSales = units.reduce((sum, u) => sum + (Number(u.totalSales) || 0), 0);
  
  const activeUnits = units.filter(u => u.status === 'Active').length;
  const activeWarehouses = warehouses.filter(w => w.status === 'Active').length;
  const activeConvoys = convoys.filter(c => c.status === 'Active').length;

  const topUnits = [...units].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 5);

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Center: Global Overview</h1>
          <p className="text-slate-500 text-[0.95rem] m-0">Organization-wide management and real-time system overview.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
             Refresh Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500 flex items-center gap-2"><Activity className="animate-spin" size={20} /> Loading overview...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-slate-500 tracking-wider">TOTAL REVENUE</span>
                <IndianRupee size={18} className="text-slate-600" />
              </div>
              <div className="flex justify-between items-end">
                <h2 className="text-3xl font-bold text-slate-900 leading-none m-0">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-slate-500 tracking-wider">TOTAL SALES (TXNs)</span>
                <FileText size={18} className="text-slate-600" />
              </div>
              <div className="flex justify-between items-end">
                <h2 className="text-3xl font-bold text-slate-900 leading-none m-0">{totalSales.toLocaleString()}</h2>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-slate-500 tracking-wider">NETWORK SIZE</span>
                <Activity size={18} className="text-slate-600" />
              </div>
              <div className="flex justify-between items-end">
                <h2 className="text-3xl font-bold text-slate-900 leading-none m-0">{units.length + warehouses.length + convoys.length}</h2>
                <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-slate-500">Nodes</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-slate-500 tracking-wider">SYSTEM HEALTH</span>
                <Cloud size={18} className="text-slate-600" />
              </div>
              <div className="flex justify-between items-end">
                <h2 className="text-3xl font-bold text-green-600 leading-none m-0">Online</h2>
                <span className="text-xs font-medium px-2 py-1 rounded bg-green-50 text-green-700">All Systems Go</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Units Column */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-slate-900 m-0">Top Performing Units</h3>
                <Layers size={18} className="text-slate-500" />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-semibold text-slate-500 p-4 border-b border-gray-100 bg-gray-50">UNIT</th>
                      <th className="text-left text-xs font-semibold text-slate-500 p-4 border-b border-gray-100 bg-gray-50">REGION</th>
                      <th className="text-left text-xs font-semibold text-slate-500 p-4 border-b border-gray-100 bg-gray-50">SALES</th>
                      <th className="text-left text-xs font-semibold text-slate-500 p-4 border-b border-gray-100 bg-gray-50">REVENUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUnits.length > 0 ? topUnits.map((unit, idx) => (
                      <tr key={idx}>
                        <td className="p-4 border-b border-gray-100 text-sm font-medium text-slate-900">
                          {unit.name} <span className="text-xs text-slate-500 ml-2">#{unit.unitId}</span>
                        </td>
                        <td className="p-4 border-b border-gray-100 text-sm text-slate-700">{unit.region}</td>
                        <td className="p-4 border-b border-gray-100 text-sm text-slate-700">{unit.totalSales || 0}</td>
                        <td className="p-4 border-b border-gray-100 text-sm font-medium text-emerald-600">
                          ₹{(unit.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="p-4 text-sm text-slate-500 text-center">No unit data available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Network Status Column */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-slate-900 m-0">Network Status Overview</h3>
              </div>
              
              <div className="p-5 flex flex-col gap-6">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layers size={20} /></div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 m-0">Retail Units</h4>
                      <p className="text-xs text-slate-500 m-0">Points of sale & distribution</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900 block">{units.length}</span>
                    <span className="text-xs text-emerald-600 font-medium">{activeUnits} Active</span>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Warehouse size={20} /></div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 m-0">Warehouses</h4>
                      <p className="text-xs text-slate-500 m-0">Inventory storage centers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900 block">{warehouses.length}</span>
                    <span className="text-xs text-emerald-600 font-medium">{activeWarehouses} Active</span>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Truck size={20} /></div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 m-0">Convoys</h4>
                      <p className="text-xs text-slate-500 m-0">Logistics and transport</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900 block">{convoys.length}</span>
                    <span className="text-xs text-emerald-600 font-medium">{activeConvoys} Active</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPage;

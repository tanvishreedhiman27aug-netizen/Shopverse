import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, ClipboardList, Users, Package, Plus, Trash2, Edit3, CheckCircle, RefreshCw, X 
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // View sections: 'analytics', 'products', 'orders'
  const [activeView, setActiveView] = useState('analytics');

  // API Analytics data
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Products state
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodForm, setProdForm] = useState({
    title: '', brand: '', description: '', price: '', discountPercentage: '', categoryName: '', gender: 'Men', sizes: 'S,M,L,XL', colors: 'Black,White', inventory: '', tags: ''
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Config headers helper
  const getAdminConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadAnalytics();
  }, [user, navigate]);

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/analytics', getAdminConfig());
      setAnalytics(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadProducts = async () => {
    setProdLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/products?limit=100');
      setProducts(res.data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setProdLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/orders', getAdminConfig());
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'products') loadProducts();
    if (activeView === 'orders') loadOrders();
    if (activeView === 'analytics') loadAnalytics();
  }, [activeView]);

  // Product CRUD Handlers
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...prodForm,
      price: Number(prodForm.price),
      discountPercentage: Number(prodForm.discountPercentage),
      inventory: Number(prodForm.inventory),
      sizes: prodForm.sizes.split(',').map(s => s.trim()),
      colors: prodForm.colors.split(',').map(c => c.trim()),
      tags: prodForm.tags.split(',').map(t => t.trim())
    };

    try {
      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/admin/products/${editingProduct._id}`, payload, getAdminConfig());
      } else {
        await axios.post('http://localhost:5000/api/admin/products', payload, getAdminConfig());
      }
      setShowProdModal(false);
      setEditingProduct(null);
      setProdForm({ title: '', brand: '', description: '', price: '', discountPercentage: '', categoryName: '', gender: 'Men', sizes: 'S,M,L,XL', colors: 'Black,White', inventory: '', tags: '' });
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing product.');
    }
  };

  const handleEditClick = (p) => {
    setEditingProduct(p);
    setProdForm({
      title: p.title,
      brand: p.brand,
      description: p.description,
      price: String(p.price),
      discountPercentage: String(p.discountPercentage || 0),
      categoryName: p.category?.name || '',
      gender: p.gender,
      sizes: p.sizes.join(','),
      colors: p.colors.join(','),
      inventory: String(p.inventory),
      tags: p.tags.join(',')
    });
    setShowProdModal(true);
  };

  const handleDeleteProduct = async (pid) => {
    if (window.confirm('Delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/products/${pid}`, getAdminConfig());
        loadProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Order status changes
  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/status`, { status }, getAdminConfig());
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order status.');
    }
  };

  // Donut chart colors
  const COLORS = ['#ff3f6c', '#282c3f', '#ffc107', '#20c997', '#6f42c1', '#17a2b8', '#fd7e14'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0c14] py-8 transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Top Header & navigation toggles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800/80 mb-8 gap-4">
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-wider text-myntra-dark dark:text-white">Admin Dashboard</h1>
            <p className="text-xs text-myntra-gray dark:text-gray-400 mt-1">Hello, Administrator. System status is running.</p>
          </div>

          <div className="flex bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded p-1 text-xs font-bold text-myntra-dark dark:text-gray-300">
            <button 
              onClick={() => setActiveView('analytics')}
              className={`px-4 py-2 rounded transition-colors ${activeView === 'analytics' ? 'bg-myntra-pink text-white shadow-xs' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveView('products')}
              className={`px-4 py-2 rounded transition-colors ${activeView === 'products' ? 'bg-myntra-pink text-white shadow-xs' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveView('orders')}
              className={`px-4 py-2 rounded transition-colors ${activeView === 'orders' ? 'bg-myntra-pink text-white shadow-xs' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Orders
            </button>
          </div>
        </div>

        {/* --- VIEW: ANALYTICS --- */}
        {activeView === 'analytics' && (
          <div className="space-y-8">
            {analyticsLoading ? (
              <div className="py-20 text-center text-xs text-myntra-gray"><RefreshCw className="animate-spin text-myntra-pink mx-auto mb-2" /> Loading reports...</div>
            ) : !analytics ? (
              <div className="text-center py-20 text-xs text-myntra-gray">Failed to load analytics dashboard.</div>
            ) : (
              <>
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 p-5 rounded-lg shadow-xs flex items-center gap-4">
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-myntra-pink rounded-full"><TrendingUp size={24} /></div>
                    <div>
                      <p className="text-[10px] text-myntra-gray uppercase font-bold tracking-widest">Total Sales</p>
                      <h3 className="text-lg font-extrabold text-myntra-dark dark:text-white mt-1">₹{analytics.summary.totalRevenue}</h3>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 p-5 rounded-lg shadow-xs flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full"><ClipboardList size={24} /></div>
                    <div>
                      <p className="text-[10px] text-myntra-gray uppercase font-bold tracking-widest">Total Orders</p>
                      <h3 className="text-lg font-extrabold text-myntra-dark dark:text-white mt-1">{analytics.summary.totalOrders}</h3>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 p-5 rounded-lg shadow-xs flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full"><Package size={24} /></div>
                    <div>
                      <p className="text-[10px] text-myntra-gray uppercase font-bold tracking-widest">Catalog Items</p>
                      <h3 className="text-lg font-extrabold text-myntra-dark dark:text-white mt-1">{analytics.summary.totalProducts}</h3>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 p-5 rounded-lg shadow-xs flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-full"><Users size={24} /></div>
                    <div>
                      <p className="text-[10px] text-myntra-gray uppercase font-bold tracking-widest">Total Users</p>
                      <h3 className="text-lg font-extrabold text-myntra-dark dark:text-white mt-1">{analytics.summary.totalUsers}</h3>
                    </div>
                  </div>
                </div>

                {/* Recharts Analytics graphs panels */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  
                  {/* Left: Monthly sales area chart (Span 2) */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-lg shadow-xs space-y-4">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-myntra-dark dark:text-gray-200">Revenue Performance Timeline</h4>
                    
                    <div className="h-[280px] w-full text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.salesHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ff3f6c" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#ff3f6c" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                          <XAxis dataKey="month" stroke="#9496a2" />
                          <YAxis stroke="#9496a2" />
                          <Tooltip />
                          <Area type="monotone" dataKey="sales" name="Sales (₹)" stroke="#ff3f6c" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right: Pie distribution by categories */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-lg shadow-xs space-y-4">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-myntra-dark dark:text-gray-200">Category Distribution</h4>
                    
                    <div className="h-[240px] w-full text-[10px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {analytics.categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Pie legend */}
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pb-2">
                      {analytics.categoryData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-[10px] text-myntra-gray">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span>{item.name} ({item.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Orders grid */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 rounded-lg shadow-xs space-y-4">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-myntra-dark dark:text-gray-200">Recent Order Placements</h4>
                  
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-myntra-gray font-bold uppercase tracking-wider text-[10px] pb-2">
                          <th className="py-2.5">Order ID</th>
                          <th className="py-2.5">Customer Email</th>
                          <th className="py-2.5">Date</th>
                          <th className="py-2.5">Total Amount</th>
                          <th className="py-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.recentOrders.map((ord) => (
                          <tr key={ord._id} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-850/20 text-myntra-dark dark:text-gray-200">
                            <td className="py-3 font-semibold">{ord._id}</td>
                            <td className="py-3">{ord.user?.email || 'Guest User'}</td>
                            <td className="py-3">{new Date(ord.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 font-bold">₹{ord.totalPrice}</td>
                            <td className="py-3"><span className="text-[10px] font-bold uppercase text-myntra-pink">{ord.orderStatus}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* --- VIEW: PRODUCTS LIST / CRUD --- */}
        {activeView === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-105 dark:border-gray-805">
              <h2 className="text-sm font-extrabold uppercase text-myntra-dark dark:text-white">Active Product Inventory</h2>
              <button
                onClick={() => { setEditingProduct(null); setShowProdModal(true); }}
                className="px-4 py-2 bg-myntra-pink hover:bg-rose-600 text-white text-xs font-bold uppercase rounded tracking-wider flex items-center gap-1.5 shadow"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            {prodLoading ? (
              <div className="py-20 text-center text-xs text-myntra-gray"><RefreshCw className="animate-spin text-myntra-pink mx-auto mb-2" /> Fetching inventory...</div>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-xs overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-myntra-gray font-bold uppercase tracking-wider text-[10px] pb-2 px-4">
                      <th className="py-3.5 pl-4">Product Details</th>
                      <th className="py-3.5">Brand</th>
                      <th className="py-3.5">Gender</th>
                      <th className="py-3.5">Price</th>
                      <th className="py-3.5">Stock</th>
                      <th className="py-3.5 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p._id} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-850/20 text-myntra-dark dark:text-gray-200">
                        <td className="py-3 pl-4 flex items-center gap-3">
                          <img src={p.images[0]} alt={p.title} className="w-8 h-10 object-cover object-top rounded bg-gray-50" />
                          <div className="min-w-0">
                            <p className="font-bold truncate max-w-[180px]">{p.title}</p>
                            <p className="text-[10px] text-myntra-gray uppercase font-semibold">Category ID: {p.category?.name || 'Accessories'}</p>
                          </div>
                        </td>
                        <td className="py-3 font-semibold uppercase">{p.brand}</td>
                        <td className="py-3">{p.gender}</td>
                        <td className="py-3 font-bold">₹{p.price}</td>
                        <td className="py-3">
                          <span className={`font-bold ${p.inventory === 0 ? 'text-red-500' : p.inventory < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {p.inventory} left
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right flex justify-end gap-3 mt-1.5">
                          <button onClick={() => handleEditClick(p)} className="text-blue-500 hover:text-blue-700"><Edit3 size={14} /></button>
                          <button onClick={() => handleDeleteProduct(p._id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: ORDERS FULLFILLMENT --- */}
        {activeView === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-sm font-extrabold uppercase text-myntra-dark dark:text-white pb-3 border-b border-gray-105 dark:border-gray-805">Customer Order Fulfillment</h2>

            {ordersLoading ? (
              <div className="py-20 text-center text-xs text-myntra-gray"><RefreshCw className="animate-spin text-myntra-pink mx-auto mb-2" /> Fetching orders list...</div>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-xs overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-myntra-gray font-bold uppercase tracking-wider text-[10px] pb-2 pl-4">
                      <th className="py-3.5 pl-4">Order ID</th>
                      <th className="py-3.5">Customer Email</th>
                      <th className="py-3.5">Date</th>
                      <th className="py-3.5">Paid?</th>
                      <th className="py-3.5">Total Amount</th>
                      <th className="py-3.5"> Fulfill Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-850/20 text-myntra-dark dark:text-gray-200">
                        <td className="py-3 pl-4 font-bold">{o._id}</td>
                        <td className="py-3">{o.user?.email}</td>
                        <td className="py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${o.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                            {o.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-myntra-pink">₹{o.totalPrice}</td>
                        <td className="py-3">
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleOrderStatusUpdate(o._id, e.target.value)}
                            className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-850 px-2 py-1 text-xs rounded outline-none font-bold text-myntra-dark dark:text-gray-200 cursor-pointer"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Return_Requested">Return Requested</option>
                            <option value="Returned">Returned</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* --- ADD / EDIT PRODUCT MODAL FORM DIALOG --- */}
      {showProdModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-lg max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin animate-scale-up">
            
            <button 
              onClick={() => { setShowProdModal(false); setEditingProduct(null); }} 
              className="absolute top-4 right-4 text-myntra-gray hover:text-myntra-dark dark:hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-sm font-extrabold uppercase tracking-wider text-myntra-dark dark:text-gray-100 mb-6 pr-6">
              {editingProduct ? 'Edit Product Specifications' : 'Add New Catalog Product'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs text-myntra-dark dark:text-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="font-semibold text-myntra-gray">Product Title</label>
                  <input
                    type="text" required
                    value={prodForm.title} onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-myntra-gray">Brand Name</label>
                  <input
                    type="text" required
                    value={prodForm.brand} onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-myntra-gray">Category</label>
                  <input
                    type="text" required placeholder="e.g. Footwear"
                    value={prodForm.categoryName} onChange={(e) => setProdForm({ ...prodForm, categoryName: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="font-semibold text-myntra-gray">Description</label>
                  <textarea
                    required
                    value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none h-20"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-myntra-gray">Price (MRP)</label>
                  <input
                    type="number" required
                    value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-myntra-gray">Discount %</label>
                  <input
                    type="number" required
                    value={prodForm.discountPercentage} onChange={(e) => setProdForm({ ...prodForm, discountPercentage: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-myntra-gray">Inventory Count</label>
                  <input
                    type="number" required
                    value={prodForm.inventory} onChange={(e) => setProdForm({ ...prodForm, inventory: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-myntra-gray">Gender</label>
                  <select
                    value={prodForm.gender} onChange={(e) => setProdForm({ ...prodForm, gender: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded outline-none font-semibold cursor-pointer"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-myntra-gray">Sizes (comma separated)</label>
                  <input
                    type="text" placeholder="S,M,L,XL"
                    value={prodForm.sizes} onChange={(e) => setProdForm({ ...prodForm, sizes: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-myntra-gray">Colors (comma separated)</label>
                  <input
                    type="text" placeholder="Black,White,Red"
                    value={prodForm.colors} onChange={(e) => setProdForm({ ...prodForm, colors: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="font-semibold text-myntra-gray">AI recommendation tags (comma separated)</label>
                  <input
                    type="text" placeholder="casual, summer, cotton, denim"
                    value={prodForm.tags} onChange={(e) => setProdForm({ ...prodForm, tags: e.target.value })}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-myntra-pink hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded shadow transition-colors"
              >
                {editingProduct ? 'Save Modifications' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

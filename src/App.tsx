import React, { useState, useEffect } from 'react';
import { Package2, Boxes, PlusSquare, Home, Clock, Users, Settings } from 'lucide-react';
import RequisitionPage from './pages/RequisitionPage';
import AddProductPage from './pages/AddProductPage';
import ProductListPage from './pages/ProductListPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import AddUserPage from './pages/AddUserPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

interface User {
  username: string;
  role: string;
  _id?: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('productList');
  const [user, setUser] = useState<{ username: string; role: string; _id: string } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-[#8B4513] text-white">
        <div className="p-4 flex items-center space-x-2">
          <Package2 className="h-8 w-8" />
          <span className="text-xl font-semibold">Inventory System</span>
        </div>
        <div className="px-4 py-2 border-b border-[#A0522D]">
          <p className="text-sm">ยินดีต้อนรับ</p>
          <p className="font-medium">{user.username}</p>
        </div>
        <nav className="mt-8 px-4 space-y-2">
          {[{ tab: 'productList', icon: Home, label: 'หน้าหลัก' },
            { tab: 'requisition', icon: Boxes, label: 'เบิกสินค้า' },
            { tab: 'addProduct', icon: PlusSquare, label: 'เพิ่มสินค้า' },
            { tab: 'orderHistory', icon: Clock, label: 'ประวัติการเบิกสินค้า' },
            ...(user.role === 'admin' ? [{ tab: 'addUser', icon: Users, label: 'เพิ่มผู้ใช้' }] : []),
            { tab: 'settings', icon: Settings, label: 'ตั้งค่า' }].map(({ tab, icon: Icon, label }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-2 py-2 px-4 rounded hover:bg-[#A0522D] w-full justify-start ${activeTab === tab ? 'bg-[#A0522D]' : ''}`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 py-2 px-4 rounded hover:bg-[#A0522D] w-full justify-start text-red-300 hover:text-red-200"
          >
            <span>ออกจากระบบ</span>
          </button>
        </nav>
      </aside>
      <main className="flex-1 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'requisition' && <RequisitionPage userId={user._id} username={user.username} />}
        {activeTab === 'addProduct' && <AddProductPage userId={user._id}  />}
        {activeTab === 'productList' && <ProductListPage />}
        {activeTab === 'orderHistory' && <OrderHistoryPage/>}
        {activeTab === 'addUser' && user.role === 'admin' && <AddUserPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}

export default App;

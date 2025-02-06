import React, { useState } from 'react';
import { ChevronRight, UserPlus } from 'lucide-react';
import axios from 'axios';

function AddUserPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      await axios.post('https://server-weht.onrender.com/users', {
        username,
        password,
        role
      });
      
      alert('เพิ่มผู้ใช้เรียบร้อยแล้ว');
      // Reset form
      setUsername('');
      setPassword('');
      setRole('user');
    } catch (error) {
      console.error('Error adding user:', error);
      setError('ไม่สามารถเพิ่มผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2 text-gray-600">
            <span>ผู้ใช้</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium">เพิ่มผู้ใช้</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <UserPlus className="h-6 w-6" />
            <span>เพิ่มข้อมูลผู้ใช้</span>
          </h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ตำแหน่ง
              </label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="admin">ผู้ดูแลระบบ</option>
                <option value="user">ผู้ใช้</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddUserPage;

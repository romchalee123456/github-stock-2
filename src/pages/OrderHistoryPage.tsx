import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import axios from 'axios';
import type { StockHistory } from '../types';

function OrderHistoryPage() {
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'latest' | 'oldest'>('latest');

  useEffect(() => {
    const fetchStockHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://server-weht.onrender.com/stock-history/withdraw');
        if (response.data && response.data.history) {
          setStockHistory(response.data.history);
        }
      } catch (error) {
        console.error('Error fetching stock history:', error);
        setError('ไม่สามารถโหลดประวัติการเบิกสินค้าได้');
      } finally {
        setLoading(false);
      }
    };

    fetchStockHistory();
  }, []);

  const sortedHistory = [...stockHistory].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return activeTab === 'latest' ? dateB - dateA : dateA - dateB;
  });

  if (loading) {
    return <div className="text-center p-8">กำลังโหลด...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 p-8">{error}</div>;
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">ประวัติการเบิกสินค้า</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'latest'
                    ? 'border-b-2 border-[#8B4513] text-[#8B4513]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('latest')}
              >
                ล่าสุด
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'oldest'
                    ? 'border-b-2 border-[#8B4513] text-[#8B4513]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('oldest')}
              >
                เก่าที่สุด
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4">วันที่</th>
                <th className="text-left p-4">เลขที่เอกสาร</th>
                <th className="text-left p-4">สถานที่</th>
                <th className="text-left p-4">ผู้เบิก</th>
                <th className="text-left p-4">สินค้า</th>
                <th className="text-left p-4">จำนวน</th>
                <th className="text-left p-4">รายละเอียด</th>
                <th className="text-right p-4">ราคารวม</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((record) => (
                <tr key={record._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    {new Date(record.date).toLocaleDateString('th-TH')}
                  </td>
                  <td className="p-4">{record.billId}</td>
                  <td className="p-4">{record.location}</td>
                  <td className="p-4">{record.username}</td>
                  <td className="p-4">{record.productName}</td>
                  <td className="p-4">{record.quantity}</td>
                  <td className="p-4">{record.description}</td>
                  <td className="p-4 text-right">${record.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrderHistoryPage;
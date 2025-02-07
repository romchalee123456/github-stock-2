import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Printer, ChevronDown, ChevronUp, FileDown } from 'lucide-react';
import axios from 'axios';
import type { StockHistory } from '../types';

interface GroupedHistory {
  [billId: string]: StockHistory[];
}

function OrderHistoryPage() {
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'latest' | 'oldest'>('latest');
  const [expandedBills, setExpandedBills] = useState<Set<string>>(new Set());
  const printRef = useRef<HTMLDivElement>(null);

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

  const groupHistoryByBill = (history: StockHistory[]): GroupedHistory => {
    return history.reduce((groups: GroupedHistory, item) => {
      if (!groups[item.billId]) {
        groups[item.billId] = [];
      }
      groups[item.billId].push(item);
      return groups;
    }, {});
  };

  const sortedAndGroupedHistory = () => {
    const sorted = [...stockHistory].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return activeTab === 'latest' ? dateB - dateA : dateA - dateB;
    });
    return groupHistoryByBill(sorted);
  };

  const toggleBillDetails = (billId: string) => {
    const newExpanded = new Set(expandedBills);
    if (newExpanded.has(billId)) {
      newExpanded.delete(billId);
    } else {
      newExpanded.add(billId);
    }
    setExpandedBills(newExpanded);
  };

  const calculateBillTotal = (items: StockHistory[]): number => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handlePrint = async () => {
    if (printRef.current) {
      try {
        const style = `
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
            .bill-header { background-color: #f8f9fa; padding: 10px; margin-bottom: 10px; }
            @media print {
              body { font-family: Arial, sans-serif; }
              .no-print { display: none; }
            }
          </style>
        `;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>ประวัติการเบิกสินค้า</title>
                ${style}
              </head>
              <body>
                ${printRef.current.innerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      } catch (error) {
        console.error('Error printing:', error);
        alert('เกิดข้อผิดพลาดในการพิมพ์');
      }
    }
  };

  const handleSavePDF = async () => {
    // Here you would implement PDF generation and download
    // For now, we'll just show an alert
    alert('ฟังก์ชันการบันทึก PDF จะถูกเพิ่มในเวอร์ชันถัดไป');
  };

  if (loading) {
    return <div className="text-center p-8">กำลังโหลด...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 p-8">{error}</div>;
  }

  const groupedHistory = sortedAndGroupedHistory();

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
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

        <div className="bg-white rounded-lg shadow-sm overflow-hidden" ref={printRef}>
          {Object.entries(groupedHistory).map(([billId, items]) => (
            <div key={billId} className="border-b last:border-b-0">
              <div
                className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleBillDetails(billId)}
              >
                <div className="flex-1">
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">เลขที่เอกสาร</div>
                      <div className="font-medium">{billId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">วันที่</div>
                      <div>{new Date(items[0].date).toLocaleDateString('th-TH')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">สถานที่</div>
                      <div>{items[0].location}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">ผู้เบิก</div>
                      <div>{items[0].username}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">ยอดรวม</div>
                      <div className="font-medium">฿{calculateBillTotal(items).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {expandedBills.has(billId) ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {expandedBills.has(billId) && (
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2">สินค้า</th>
                        <th className="text-right p-2">จำนวน</th>
                        <th className="text-right p-2">ราคาต่อหน่วย</th>
                        <th className="text-right p-2">ราคารวม</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{item.productName}</td>
                          <td className="text-right p-2">{item.quantity}</td>
                          <td className="text-right p-2">
                            ฿{(item.total / item.quantity).toFixed(2)}
                          </td>
                          <td className="text-right p-2">฿{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="border-t font-medium">
                        <td colSpan={3} className="text-right p-2">ยอดรวมทั้งหมด</td>
                        <td className="text-right p-2">฿{calculateBillTotal(items).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                  {items[0].description && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-500">หมายเหตุ</div>
                      <div>{items[0].description}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fixed position buttons at bottom right */}
        <div className="fixed bottom-8 right-8 flex space-x-4">
          <button
            onClick={handleSavePDF}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 shadow-lg"
          >
            <FileDown className="h-4 w-4" />
            <span>บันทึก PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 shadow-lg"
          >
            <Printer className="h-4 w-4" />
            <span>พิมพ์รายงาน</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderHistoryPage;

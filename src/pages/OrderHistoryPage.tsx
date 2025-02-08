import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Printer, ChevronDown, ChevronUp, FileDown } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
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
        showNotification('ไม่สามารถโหลดประวัติการเบิกสินค้าได้', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStockHistory();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

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

  const handleSavePDF = async (billId: string) => {
    const billElement = document.getElementById(billId);
    if (billElement) {
      try {
        const items = stockHistory.filter(item => item.billId === billId);
        const doc = new jsPDF();
        
        // Add Thai font support
        doc.addFont('https://fonts.gstatic.com/ea/sarabun/v8/Sarabun-Regular.ttf', 'Sarabun', 'normal');
        doc.addFont('https://fonts.gstatic.com/ea/sarabun/v8/Sarabun-Bold.ttf', 'Sarabun', 'bold');
        doc.setFont('Sarabun');
        
        // Document info
        const billInfo = items[0];
        const billDate = new Date(billInfo.date);
        const formattedDate = `${billDate.getDate()}/${billDate.getMonth() + 1}/${billDate.getFullYear() + 543}`;
        
        doc.setFontSize(16);
        doc.setFont('Sarabun', 'bold');
        doc.text('รายการเบิกสินค้า', 105, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont('Sarabun', 'normal');
        doc.text(`เลขที่เอกสาร: ${billId}`, 10, 30);
        doc.text(`วันที่: ${formattedDate}`, 10, 40);
        doc.text(`สถานที่: ${billInfo.location}`, 10, 50);
        doc.text(`ผู้เบิก: ${billInfo.username}`, 10, 60);

        doc.autoTable({
          head: [['สินค้า', 'จำนวน', 'ราคาต่อหน่วย', 'ราคารวม']],
          body: items.map(item => [
            item.productName,
            item.quantity,
            `฿${(item.total / item.quantity).toFixed(2)}`,
            `฿${item.total.toFixed(2)}`,
          ]),
          startY: 70,
          headStyles: {
            fillColor: [0, 0, 0],
            font: 'Sarabun',
            fontStyle: 'bold'
          },
          bodyStyles: {
            font: 'Sarabun'
          },
          styles: {
            font: 'Sarabun'
          }
        });

        const total = calculateBillTotal(items);
        doc.setFont('Sarabun', 'bold');
        doc.text(`ยอดรวมทั้งหมด: ฿${total.toFixed(2)}`, 10, doc.lastAutoTable.finalY + 10);

        doc.save(`${billId}-order-history.pdf`);
        showNotification('บันทึก PDF เรียบร้อยแล้ว', 'success');
      } catch (error) {
        console.error('Error saving PDF:', error);
        showNotification('เกิดข้อผิดพลาดในการบันทึก PDF', 'error');
      }
    }
  };

  const handlePrint = (billId: string) => {
    const billElement = document.getElementById(billId);
    if (billElement) {
      try {
        const printContent = billElement.innerHTML;
        const originalContent = document.body.innerHTML;

        document.body.innerHTML = `
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
            body { 
              font-family: 'Sarabun', sans-serif;
              padding: 20px;
            }
            table { 
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1rem;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .bill-header {
              margin-bottom: 20px;
            }
            .bill-header h2 {
              margin-bottom: 10px;
            }
            .bill-total {
              margin-top: 20px;
              font-weight: bold;
              text-align: right;
            }
            @media print {
              .no-print { display: none; }
              button { display: none; }
            }
          </style>
          <div class="bill-header">
            <h2>รายการเบิกสินค้า</h2>
            <p>เลขที่เอกสาร: ${billId}</p>
            <p>วันที่: ${new Date(stockHistory.find(item => item.billId === billId)?.date || '').toLocaleDateString('th-TH')}</p>
            <p>สถานที่: ${stockHistory.find(item => item.billId === billId)?.location}</p>
            <p>ผู้เบิก: ${stockHistory.find(item => item.billId === billId)?.username}</p>
          </div>
          ${printContent}
        `;

        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
        showNotification('เริ่มการพิมพ์เอกสาร', 'success');
      } catch (error) {
        console.error('Error printing:', error);
        showNotification('เกิดข้อผิดพลาดในการพิมพ์', 'error');
        window.location.reload();
      }
    }
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
            <div key={billId} id={billId} className="border-b last:border-b-0">
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
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-500">หมายเหตุ</div>
                        <div>{items[0].description}</div>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end space-x-4">
                    <button
                      onClick={() => handleSavePDF(billId)}
                      className="px-4 py-2 text-white bg-black hover:bg-gray-800 rounded flex items-center space-x-2"
                    >
                      <FileDown className="h-4 w-4" />
                      <span>บันทึกเป็น PDF</span>
                    </button>
                    <button
                      onClick={() => handlePrint(billId)}
                      className="px-4 py-2 text-white bg-black hover:bg-gray-800 rounded flex items-center space-x-2"
                    >
                      <Printer className="h-4 w-4" />
                      <span>พิมพ์</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            notification.type === 'success' ? 'bg-green-200' : 'bg-red-200'
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryPage;

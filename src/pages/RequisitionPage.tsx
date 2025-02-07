import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, ChevronRight } from 'lucide-react';
import axios from 'axios';
import type { Product, CartItem, ApiResponse } from '../types';

interface RequisitionPageProps {
  userId: string | undefined;
  username: string;
}

function RequisitionPage({ userId, username }: RequisitionPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requisitionDate, setRequisitionDate] = useState(new Date().toISOString().slice(0, 10));
  const [requisitionNumber, setRequisitionNumber] = useState('');
  const [location, setLocation] = useState('บริษัท FMC สาขาใหญ่');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const locations = [
    'บริษัท FMC สาขาใหญ่',
    'บริษัท FMC สาขา 1',
    'บริษัท FMC สาขา 2',
    'บริษัท FMC สาขา 3',
    'บริษัท FMC สาขา 4',
  ];

  useEffect(() => {
    fetchProducts();
    const lastBillNumber = localStorage.getItem('lastBillNumber') || '0';
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const requisitionNumber = `IB-${datePart}-${String(parseInt(lastBillNumber, 10) + 1).padStart(4, '0')}`;
  setRequisitionNumber(requisitionNumber);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse>('https://server-weht.onrender.com/products');
      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item._id === product._id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item._id === product._id
          ? { ...item, orderQuantity: item.orderQuantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, orderQuantity: 1 }]);
    }
  };

  const handleQuantityChange = (id: string, change: number) => {
    setCartItems(cartItems.map(item =>
      item._id === id
        ? { ...item, orderQuantity: Math.max(1, item.orderQuantity + change) }
        : item
    ));
  };

  const generateRequisitionNumber = () => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const lastNumber = parseInt(localStorage.getItem('lastBillNumber') || '0', 10) + 1;
    return `IB-${datePart}-${String(lastNumber).padStart(4, '0')}`;
  };


  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter(item => item._id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.orderQuantity), 0);

  const handleConfirmRequisition = async () => {
    try {
            // สร้างเลขบิลใหม่เฉพาะเมื่อยืนยันการเบิก
      const newRequisitionNumber = generateRequisitionNumber();

      // บันทึกเลขบิลล่าสุดใน LocalStorage
      localStorage.setItem('lastBillNumber', (parseInt(localStorage.getItem('lastBillNumber') || '0', 10) + 1).toString());

      // Process each item in the cart
      for (const item of cartItems) {
        const total = item.orderQuantity * item.price; // Calculate total for each item

        await axios.put(`https://server-weht.onrender.com/products/${item._id}/stock/withdraw`, {
          productId: item._id,               // The product being withdrawn
          userId: userId,                    // User ID performing the withdrawal
          username: username,                // Username of the person withdrawing
          type: 'withdraw',                  // Type of operation
          quantity: item.orderQuantity,      // Quantity withdrawn
          total,                             // Total = quantity * price
          description: notes || 'Stock withdrawal', // Optional description (can be the notes)
          location,                          // The location of the withdrawal
          billId: newRequisitionNumber, // ใช้เลขบิลใหม่
          productName: item.name             // The requisition number (ใบเบิก)
        });
      }
// อัปเดตเลขบิลใน State เพื่อแสดงผลหลังการยืนยัน
      setRequisitionNumber(newRequisitionNumber);
      
      alert('บันทึกการเบิกสินค้าเรียบร้อยแล้ว');
      setIsDialogOpen(false);
      setCartItems([]);
      setNotes('');
     
      await fetchProducts();  // Fetch the updated product data
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      if (error.response?.data?.message === "Insufficient stock") {
        alert('สินค้าในสต็อกไม่เพียงพอ');
      } else {
        alert('เกิดข้อผิดพลาดในการเบิกสินค้า กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  const handleCancelRequisition = () => {
    setIsDialogOpen(false);
  };

  if (loading) {
    return <div className="text-center p-8">กำลังโหลดข้อมูล...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 p-8">{error}</div>;
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2 text-gray-600">
            <span>สินค้า</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium">เบิกสินค้า</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Product Selection */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">สินค้า</h2>
              <div className="relative mb-4">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2"
                  placeholder="ค้นหาสินค้า"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {products
                  .filter(product =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(product => (
                    <div key={product._id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-gray-600">฿{product.price.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>เพิ่ม</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-1 space-y-6">
            {/* Requisition Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">รายละเอียดการเบิก</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันที่เบิก</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={requisitionDate}
                    onChange={(e) => setRequisitionDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่ใบเบิก</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={requisitionNumber}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานที่เบิก</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้เบิก</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                    value={username}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">หมายเหตุ</h2>
              </div>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เพิ่มหมายเหตุ..."
              />
            </div>

            {/* Cart Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">รายการเบิก</h2>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item._id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-600">
                        ราคา: ฿{item.price.toFixed(2)} x {item.orderQuantity} = 
                        ฿{(item.price * item.orderQuantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item._id, -1)}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.orderQuantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, 1)}
                        className="p-1 rounded-md hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>ยอดรวมทั้งหมด</span>
                    <span>฿{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 mt-4 flex items-center justify-center space-x-2"
                  disabled={cartItems.length === 0}
                >
                  <span>เบิกสินค้า</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-semibold mb-6">รายละเอียดการเบิก</h2>
            <div className="mb-4">
              <p><strong>วันที่เบิก:</strong> {new Date(requisitionDate).toLocaleDateString('th-TH')}</p>
              <p><strong>เลขที่ใบเบิก:</strong> {requisitionNumber}</p>
              <p><strong>สถานที่เบิก:</strong> {location}</p>
              <p><strong>ชื่อผู้เบิก:</strong> {username}</p>
            </div>
            <h3 className="text-xl font-semibold mb-4">รายการสินค้า</h3>
            <table className="w-full mb-4">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">สินค้า</th>
                  <th className="text-right py-2">จำนวน</th>
                  <th className="text-right py-2">ราคาต่อหน่วย</th>
                  <th className="text-right py-2">ราคารวม</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item._id} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="text-right">{item.orderQuantity}</td>
                    <td className="text-right">฿{item.price.toFixed(2)}</td>
                    <td className="text-right">฿{(item.price * item.orderQuantity).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td colSpan={3} className="text-right py-2">ยอดรวมทั้งหมด</td>
                  <td className="text-right">฿{total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div className="mb-4">
              <p><strong>หมายเหตุ:</strong> {notes}</p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelRequisition}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmRequisition}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                ยืนยันการเบิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequisitionPage;

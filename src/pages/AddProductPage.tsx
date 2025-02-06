import React, { useState, useEffect } from 'react';
import { Package2, Edit, Upload, ChevronRight } from 'lucide-react';
import axios from 'axios';
import type { Product } from '../types';

interface AddProductPageProps {
  userId: string | undefined;
}

function AddProductPage({ userId }: AddProductPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);
  const [addQuantity, setAddQuantity] = useState(0);
  const [stockNote, setStockNote] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://server-weht.onrender.com/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAddingToExisting && selectedProduct) {
        // เพิ่มจำนวนสินค้าที่มีอยู่แล้ว
        const response = await axios.put(`https://server-weht.onrender.com/products/${selectedProduct._id}/stock/add`, {
          quantity: Number(addQuantity),
          description: stockNote || '',
          userId,
        });
        
        if (response.data) {
          alert('เพิ่มจำนวนสินค้าเรียบร้อยแล้ว');
          await fetchProducts();
          
          // รีเซ็ตฟอร์ม
          setAddQuantity(0);
          setStockNote('');
          setSelectedProduct(null);
          setIsAddingToExisting(false);
        }
      } else {
        // เพิ่มสินค้าใหม่
        const response = await axios.post('https://server-weht.onrender.com/products', {
          name: productName,
          description: description || '',
          price: Number(price),
          initialStock: Number(quantity),
        });
        
        if (response.data) {
          alert('เพิ่มสินค้าใหม่เรียบร้อยแล้ว');
          await fetchProducts();
          
          // รีเซ็ตฟอร์ม
          setProductName('');
          setDescription('');
          setPrice(0);
          setQuantity(0);
        }
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      alert(errorMessage);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setIsAddingToExisting(true);
  };

  if (loading) {
    return <div className="text-center p-8">กำลังโหลด...</div>;
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
            <span className="font-medium">เพิ่มสินค้า</span>
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={() => {
              setIsAddingToExisting(!isAddingToExisting);
              // รีเซ็ตฟอร์มเมื่อสลับโหมด
              setProductName('');
              setDescription('');
              setPrice(0);
              setQuantity(0);
              setAddQuantity(0);
              setStockNote('');
              setSelectedProduct(null);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            {isAddingToExisting ? 'เพิ่มสินค้าใหม่' : 'เพิ่มจำนวนสินค้าที่มีอยู่'}
          </button>
        </div>

        {isAddingToExisting ? (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">เลือกสินค้า</h2>
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-500">คงเหลือ: {product.stock}</p>
                  </div>
                  <button
                    onClick={() => handleSelectProduct(product)}
                    className="px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    เลือก
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              {isAddingToExisting ? 'เพิ่มจำนวนสินค้า' : 'ข้อมูลสินค้าใหม่'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อสินค้า
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  disabled={isAddingToExisting}
                  required
                />
              </div>
              {!isAddingToExisting && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      รายละเอียด
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ราคา
                    </label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isAddingToExisting ? 'จำนวนที่ต้องการเพิ่ม' : 'จำนวนเริ่มต้น'}
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={isAddingToExisting ? addQuantity : quantity}
                  onChange={(e) => 
                    isAddingToExisting 
                      ? setAddQuantity(Number(e.target.value))
                      : setQuantity(Number(e.target.value))
                  }
                  min="1"
                  required
                />
              </div>
              {isAddingToExisting && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หมายเหตุการเพิ่มสต็อก
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={stockNote}
                    onChange={(e) => setStockNote(e.target.value)}
                    placeholder="ระบุหมายเหตุการเพิ่มสต็อก (ถ้ามี)"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
          >
            {isAddingToExisting ? 'เพิ่มจำนวนสินค้า' : 'เพิ่มสินค้าใหม่'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProductPage;

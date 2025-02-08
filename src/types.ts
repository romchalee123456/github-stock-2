export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface CartItem extends Product {
  orderQuantity: number;
}

export interface OrderHistory {
  id: string;
  date: string;
  documentNo: string;
  location: string;
  personId: string;
  personName: string;
  items: CartItem[];
  total: number;
}

export interface StockHistory {
  _id: string;
  productId: string;
  productName: string;
  userId: string;
  username: string;
  quantity: number;
  total: number;
  location: string;
  billId: string;
  description: string;
  date: string;
}

export interface ApiResponse {
  products: Product[];
  message?: string;
  success: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  message?: string;
}

export interface User {
  _id: string;
  username: string;
  password: string;
  uid: string;
  role: 'admin' | 'user';
}

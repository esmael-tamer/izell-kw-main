export interface Product {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  originalPrice?: number; // For sale items
  image: string;
  category: string;
  description: string;
  descriptionAr: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  images?: string[];
  colorImages?: Record<string, string>; // صور مخصصة لكل لون { "Black": "url", "Red": "url" }
  rating?: number;
  reviewCount?: number;
  isNew?: boolean; // Badge for new products
  onSale?: boolean; // Badge for sale products
  discount?: number; // Percentage discount
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: Date;
}

import p1_img1 from '@/assets/product-1-final-1.jpg';
import p1_img2 from '@/assets/product-1-final-2.jpg';
import p1_img3 from '@/assets/product-1-final-3.jpg';
import p1_img4 from '@/assets/product-1-final-4.jpg';
import p2_img1 from '@/assets/product-2-img-1.jpeg';
import p2_img2 from '@/assets/product-2-img-2.jpeg';
import p2_img3 from '@/assets/product-2-img-3.jpeg';
import p2_img4 from '@/assets/product-2-img-4.jpeg';
import p2_img5 from '@/assets/product-2-img-5.jpeg';
import p2_img6 from '@/assets/product-2-img-6.jpeg';
import p2_img7 from '@/assets/product-2-img-7.jpeg';
import p3_img1 from '@/assets/product-3-img-1.png';
import p3_img2 from '@/assets/product-3-img-2.png';
import p3_img3 from '@/assets/product-3-img-3.png';
import p3_img4 from '@/assets/product-3-img-4.png';
import p3_img5 from '@/assets/product-3-img-5.png';
import p4_img1 from '@/assets/product-4-final-1.png';
import p4_img2 from '@/assets/product-4-final-2.png';
import p4_img3 from '@/assets/product-4-final-3.png';
import p4_img4 from '@/assets/product-4-final-4.png';
import p4_img5 from '@/assets/product-4-final-5.png';
import p5_img1 from '@/assets/product-5-img-1.png';
import p5_img2 from '@/assets/product-5-img-2.png';
import p5_img3 from '@/assets/product-5-img-3.png';
import { Product, Order } from './types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Elegant Velvet Dara\'a',
    nameAr: 'دراعة مخمل أنيقة',
    price: 60,
    isNew: true,
    image: p1_img1,
    images: [p1_img1, p1_img2, p1_img3, p1_img4],
    colorImages: {
      'Burgundy': p1_img1,
      'Black': p1_img2,
      'Off White': p1_img3,
      'Dark Navy': p1_img4,
    },
    category: 'dresses',
    description: 'Elegant velvet dara\'a with sophisticated design and luxurious fabric, perfect for special occasions.',
    descriptionAr: 'دراعة مخمل أنيقة بتصميم راقٍ وقماش فاخر، مثالية للمناسبات الخاصة.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Burgundy', 'Black', 'Off White', 'Dark Navy', 'Brown', 'Olive Green', 'Baby Pink'],
    inStock: true,
    rating: 4.5,
    reviewCount: 28,
  },
  {
    id: '2',
    name: 'Luxury Embroidered Dara\'a',
    nameAr: 'دراعة مطرزة فاخرة',
    price: 52,
    originalPrice: 65,
    onSale: true,
    discount: 20,
    image: p2_img1,
    images: [p2_img1, p2_img2, p2_img3, p2_img4, p2_img5, p2_img6, p2_img7],
    colorImages: {
      'Off White': p2_img1,
      'Brown': p2_img2,
      'Dark Navy': p2_img3,
      'Purple': p2_img4,
      'Nude': p2_img5,
    },
    category: 'dresses',
    description: 'Luxurious dara\'a with intricate embroidery and elegant design, perfect for all occasions.',
    descriptionAr: 'دراعة فاخرة مع تطريز متقن وتصميم أنيق، مثالية لجميع المناسبات.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Off White', 'Brown', 'Dark Navy', 'Purple', 'Nude'],
    inStock: true,
    rating: 4.8,
    reviewCount: 42,
  },
  {
    id: '3',
    name: 'Premium Velvet Dara\'a',
    nameAr: 'دراعة مخمل بريميوم',
    price: 70,
    image: p3_img1,
    images: [p3_img1, p3_img2, p3_img3, p3_img4, p3_img5],
    colorImages: {
      'Burgundy': p3_img1,
      'Black': p3_img2,
      'Off White': p3_img3,
      'Dark Navy': p3_img4,
      'Brown': p3_img5,
    },
    category: 'dresses',
    description: 'Premium velvet dara\'a with elegant draping and sophisticated design.',
    descriptionAr: 'دراعة مخمل بريميوم مع تصميم أنيق وقماش فاخر.',
    sizes: ['M', 'L', 'XL'],
    colors: ['Burgundy', 'Black', 'Off White', 'Dark Navy', 'Brown', 'Olive Green', 'Baby Pink'],
    inStock: true,
    rating: 4.7,
    reviewCount: 35,
  },
  {
    id: '4',
    name: 'Luxury Velvet Dara\'a',
    nameAr: 'دراعة مخمل فاخرة',
    price: 70,
    image: p4_img1,
    images: [p4_img1, p4_img2, p4_img3, p4_img4, p4_img5],
    colorImages: {
      'Burgundy': p4_img1,
      'Black': p4_img2,
      'Off White': p4_img3,
      'Dark Navy': p4_img4,
      'Brown': p4_img5,
    },
    category: 'bridal',
    description: 'Elegant velvet dara\'a with sophisticated design, perfect for evening occasions.',
    descriptionAr: 'دراعة مخمل أنيقة بتصميم راقٍ، مثالية للمناسبات المسائية.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Burgundy', 'Black', 'Off White', 'Dark Navy', 'Brown', 'Olive Green', 'Baby Pink', 'Purple', 'Beige', 'Nude'],
    inStock: true,
    rating: 4.9,
    reviewCount: 51,
  },
  {
    id: '5',
    name: 'Feather Trimmed Luxury Dara\'a',
    nameAr: 'دراعة فاخرة مزينة بالريش',
    price: 75,
    isNew: true,
    image: p5_img1,
    images: [p5_img1, p5_img2, p5_img3],
    colorImages: {
      'Baby Blue': p5_img1,
      'Baby Pink': p5_img2,
      'Baby Yellow': p5_img3,
    },
    category: 'bridal',
    description: 'Stunning pastel dara\'a with elegant feather detailing and luxurious fabric.',
    descriptionAr: 'دراعة باستيل مذهلة مع تفاصيل ريش أنيقة وقماش فاخر.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Baby Blue', 'Baby Pink', 'Baby Yellow', 'Baby Purple', 'Off White', 'Black', 'Red'],
    inStock: true,
    rating: 5.0,
    reviewCount: 63,
  },
];

export const sampleOrders: Order[] = [
  {
    id: 'ORD-001',
    items: [{ product: products[0], quantity: 1, selectedSize: 'M', selectedColor: 'Rose' }],
    total: 85,
    status: 'delivered',
    customerName: 'فاطمة الكويتي',
    customerPhone: '+965 9876 5432',
    customerAddress: 'السالمية، الكويت',
    createdAt: new Date('2024-12-28'),
  },
  {
    id: 'ORD-002',
    items: [{ product: products[2], quantity: 1, selectedSize: 'L', selectedColor: 'Royal Blue' }],
    total: 150,
    status: 'shipped',
    customerName: 'نورة العبدالله',
    customerPhone: '+965 9123 4567',
    customerAddress: 'حولي، الكويت',
    createdAt: new Date('2024-12-29'),
  },
  {
    id: 'ORD-003',
    items: [
      { product: products[1], quantity: 1, selectedSize: 'M', selectedColor: 'Emerald' },
      { product: products[3], quantity: 1, selectedSize: 'S', selectedColor: 'Champagne' },
    ],
    total: 320,
    status: 'pending',
    customerName: 'مريم السالم',
    customerPhone: '+965 9555 1234',
    customerAddress: 'الجهراء، الكويت',
    createdAt: new Date('2024-12-30'),
  },
];

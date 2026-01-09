import { products } from '@/lib/data';
import { ProductCard } from './ProductCard';

export function FeaturedProducts() {
  const featuredProducts = products.slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="font-arabic text-primary text-sm tracking-widest mb-2 block">
            تشكيلتنا
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-foreground">
            أحدث الوصولات
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

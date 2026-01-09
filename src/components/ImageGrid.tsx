import { Link } from 'react-router-dom';
import product1 from '@/assets/product-1.jpg';
import product2 from '@/assets/product-2.jpg';
import product3 from '@/assets/product-3.jpg';
import product4 from '@/assets/product-4.jpg';

const gridImages = [
  { id: 1, src: product1, span: 'col-span-1 row-span-1' },
  { id: 2, src: product2, span: 'col-span-1 row-span-1' },
  { id: 3, src: product3, span: 'col-span-1 row-span-1' },
  { id: 4, src: product4, span: 'col-span-1 row-span-2' },
  { id: 5, src: product1, span: 'col-span-1 row-span-1', label: 'تخفيضات' },
  { id: 6, src: product2, span: 'col-span-1 row-span-1' },
];

export function ImageGrid() {
  return (
    <section className="bg-background">
      <div className="grid grid-cols-3 gap-0.5">
        {gridImages.map((item) => (
          <Link
            key={item.id}
            to="/shop"
            className={`relative overflow-hidden group ${item.span}`}
          >
            <div className="aspect-[3/4] w-full">
              <img
                src={item.src}
                alt=""
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {item.label && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                <span className="font-display text-2xl md:text-4xl text-primary-foreground font-bold tracking-wider">
                  {item.label}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

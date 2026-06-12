import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

interface Props { title: string; subtitle: string; products: any[]; viewAll?: string; }

export default function ProductSection({ title, subtitle, products, viewAll }: Props) {
  if (!products?.length) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8B2635] font-semibold">{subtitle}</p>
          <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-[#0A0A0A] mt-1">{title}</h2>
        </div>
        {viewAll && <Link to={viewAll} className="text-sm font-medium text-[#0A0A0A] hover:text-[#8B2635]">View all</Link>}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}

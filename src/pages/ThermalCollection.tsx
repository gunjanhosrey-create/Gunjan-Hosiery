import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import PageShell from '@/components/PageShell';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { useSeo } from '@/lib/seo';
import { useStorageImages } from '@/lib/storageImages';

const fallbackThermal = '/thermal/main.png';
const thermalCategories = [
  { title: 'Men Thermal', gender: 'men', line: 'Thermal top and bottom sets for winter layering.' },
  { title: 'Women Thermal', gender: 'women', line: 'Soft warmer sets designed for daily comfort.' },
  { title: 'Boys Thermal', gender: 'boys', line: 'Easy-fit top and bottom sets for school days.' },
  { title: 'Girls Thermal', gender: 'girls', line: 'Warm winter essentials with gentle stretch.' },
  { title: 'Kids Thermal', gender: 'kids', line: 'Cozy sets for little ones and everyday wear.' },
];

const getTag = (product: any, prefix: string) => (product.tags || [])
  .find((tag: string) => tag.toLowerCase().startsWith(`${prefix}:`))
  ?.split(':')
  .slice(1)
  .join(':');

const productText = (product: any) => `${product.name} ${product.product_type} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase();

function matchesValue(product: any, key: string, value: string) {
  if (value === 'All') return true;
  const tag = getTag(product, key);
  return tag ? tag.toLowerCase() === value.toLowerCase() : productText(product).includes(value.toLowerCase());
}

function options(products: any[], key: string, fallback: string[]) {
  const values = products.map(product => getTag(product, key)).filter(Boolean);
  return ['All', ...Array.from(new Set([...fallback, ...values]))];
}

export default function ThermalCollection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    gender: 'All',
    age_group: 'All',
    size: 'All',
    color: 'All',
    price: 'All',
    thermal_type: 'All',
  });
  const images = useStorageImages('thermal', [fallbackThermal]);
  const banners = useStorageImages('banners', [images[0] || fallbackThermal]);

  useSeo({
    title: 'Premium Thermal Collection - Gunjan Hosiery',
    description: 'Stay warm with men thermal wear, women thermal wear, boys thermal wear, girls thermal wear and kids thermal wear from Gunjan Hosiery.',
    keywords: ['Thermal Wear', 'Winter Collection', 'Boys Innerwear', 'Girls Innerwear', 'Kids Innerwear'],
  });

  useEffect(() => {
    supabase.from('ecom_products').select('*').eq('status', 'active').then(({ data }) => {
      const all = data || [];
      setProducts(all.filter(p => productText(p).includes('thermal')));
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return products.filter(product => {
      const price = product.price || 0;
      const priceOk =
        filters.price === 'All' ||
        (filters.price === 'Under 499' && price < 49900) ||
        (filters.price === '499-999' && price >= 49900 && price <= 99900) ||
        (filters.price === 'Above 999' && price > 99900);

      return priceOk
        && matchesValue(product, 'gender', filters.gender)
        && matchesValue(product, 'age_group', filters.age_group)
        && matchesValue(product, 'size', filters.size)
        && matchesValue(product, 'color', filters.color)
        && matchesValue(product, 'thermal_type', filters.thermal_type);
    });
  }, [products, filters]);

  const filterGroups = [
    { key: 'gender', label: 'Gender', values: options(products, 'gender', ['Men', 'Women', 'Boys', 'Girls', 'Kids']) },
    { key: 'age_group', label: 'Age Group', values: options(products, 'age_group', ['0-2 Years', '3-6 Years', '7-12 Years', 'Teen', 'Adult']) },
    { key: 'size', label: 'Size', values: options(products, 'size', ['S', 'M', 'L', 'XL', 'XXL']) },
    { key: 'color', label: 'Color', values: options(products, 'color', ['White', 'Black', 'Grey', 'Navy', 'Skin']) },
    { key: 'price', label: 'Price', values: ['All', 'Under 499', '499-999', 'Above 999'] },
    { key: 'thermal_type', label: 'Thermal Type', values: options(products, 'thermal_type', ['Top', 'Bottom', 'Set']) },
  ];

  return (
    <PageShell>
      <section className="relative min-h-[560px] overflow-hidden bg-[#111827]">
        <img src={banners[0] || images[0]} alt="Premium Thermal Collection" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 min-h-[560px] flex items-center">
          <div className="max-w-2xl text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-[#D4622F] font-semibold">Winter Collection</p>
            <h1 className="font-poppins font-bold text-4xl sm:text-5xl lg:text-7xl leading-tight mt-3">Premium Thermal Collection</h1>
            <p className="text-xl sm:text-2xl mt-4 text-white/85">Stay Warm. Stay Comfortable.</p>
            <Link to="#thermal-products" className="mt-8 inline-flex items-center gap-2 bg-white text-[#0A0A0A] px-7 py-3 rounded-full font-medium hover:bg-[#D4622F] hover:text-white transition">
              Shop Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-14">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8B2635] font-semibold">Thermal Categories</p>
            <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-[#0A0A0A] mt-1">Top and Bottom Sets</h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {thermalCategories.map((card, index) => (
            <article key={card.title} className="group overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="aspect-[4/5] overflow-hidden bg-[#F5F1ED]">
                <img src='/thermal/kids.png'></img>
              </div>
              <div className="p-4">
                <h3 className="font-poppins font-semibold text-lg">{card.title}</h3>
                <p className="text-sm text-[#2C2C2C]/60 mt-1 min-h-[42px]">{card.line}</p>
                <button onClick={() => setFilters(f => ({ ...f, gender: card.gender }))}
                  className="mt-4 w-full rounded-full bg-[#0A0A0A] text-white py-2.5 text-sm font-medium hover:bg-[#8B2635] transition">
                  Shop Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="thermal-products" className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-28 rounded-2xl border bg-white p-5">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal size={18} />
                <h2 className="font-poppins font-semibold text-lg">Filters</h2>
              </div>
              <div className="space-y-4">
                {filterGroups.map(group => (
                  <label key={group.key} className="block">
                    <span className="text-xs uppercase tracking-[0.16em] text-[#2C2C2C]/50 font-semibold">{group.label}</span>
                    <select
                      value={(filters as any)[group.key]}
                      onChange={e => setFilters(f => ({ ...f, [group.key]: e.target.value }))}
                      className="mt-2 w-full rounded-xl border bg-[#FAF8F5] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B2635]/20"
                    >
                      {group.values.map(value => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          </aside>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-poppins font-bold text-2xl text-[#0A0A0A]">Thermal Wear</h2>
                <p className="text-sm text-[#2C2C2C]/60">{filtered.length} products</p>
              </div>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square bg-[#F5F1ED] rounded-2xl animate-pulse" />)}
              </div>
            ) : filtered.length ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filtered.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <p className="text-center py-20 text-[#2C2C2C]/60">No thermal products match these filters.</p>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

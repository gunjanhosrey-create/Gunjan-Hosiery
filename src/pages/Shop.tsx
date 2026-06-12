import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useSeo } from '@/lib/seo';
import PageShell from '@/components/PageShell';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal } from 'lucide-react';

const getTag = (product: any, prefix: string) => (product.tags || [])
  .find((tag: string) => tag.toLowerCase().startsWith(`${prefix}:`))
  ?.split(':')
  .slice(1)
  .join(':');

const productText = (product: any) => `${product.name} ${product.product_type} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase();

const optionSet = (products: any[], key: string, fallback: string[]) => {
  const values = products.map(product => getTag(product, key)).filter(Boolean);
  return ['All', ...Array.from(new Set([...fallback, ...values]))];
};

const matches = (product: any, key: string, value: string) => {
  if (value === 'All') return true;
  const tag = getTag(product, key);
  return tag ? tag.toLowerCase() === value.toLowerCase() : productText(product).includes(value.toLowerCase());
};

export default function Shop() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'All',
    type: 'All',
    gender: 'All',
    age_group: 'All',
    size: 'All',
    color: 'All',
    price: 'All',
    thermal_type: 'All',
  });
  const [sort, setSort] = useState('featured');

  useSeo({
    title: q ? `Search ${q} - Gunjan Hosiery` : 'Shop Boys, Girls, Kids and Thermal Wear - Gunjan Hosiery',
    description: 'Browse Gunjan Hosiery boys innerwear, girls innerwear, kids essentials and thermal wear with size, color, price and thermal type filters.',
    keywords: ['Boys Innerwear', 'Girls Innerwear', 'Kids Innerwear', 'Thermal Wear', 'Winter Collection'],
  });

  useEffect(() => {
    supabase.from('ecom_products').select('*').eq('status', 'active')
      .then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, []);

  const types = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.product_type).filter(Boolean)))], [products]);

  const filterGroups = useMemo(() => [
    { key: 'category', label: 'Category', values: optionSet(products, 'category', ['Boys', 'Girls', 'Kids', 'Thermal']) },
    { key: 'type', label: 'Product Type', values: types },
    { key: 'gender', label: 'Gender', values: optionSet(products, 'gender', ['Boys', 'Girls', 'Kids']) },
    { key: 'age_group', label: 'Age Group', values: optionSet(products, 'age_group', ['0-2 Years', '3-6 Years', '7-12 Years', 'Teen']) },
    { key: 'size', label: 'Size', values: optionSet(products, 'size', ['S', 'M', 'L', 'XL', 'XXL']) },
    { key: 'color', label: 'Color', values: optionSet(products, 'color', ['White', 'Black', 'Grey', 'Navy', 'Skin']) },
    { key: 'price', label: 'Price', values: ['All', 'Under 499', '499-999', 'Above 999'] },
    { key: 'thermal_type', label: 'Thermal Type', values: optionSet(products, 'thermal_type', ['Top', 'Bottom', 'Set']) },
  ], [products, types]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(p => productText(p).includes(needle));
    }
    if (filters.type !== 'All') list = list.filter(p => p.product_type === filters.type);
    list = list.filter(product => {
      const price = product.price || 0;
      const priceOk =
        filters.price === 'All' ||
        (filters.price === 'Under 499' && price < 49900) ||
        (filters.price === '499-999' && price >= 49900 && price <= 99900) ||
        (filters.price === 'Above 999' && price > 99900);

      return priceOk
        && matches(product, 'category', filters.category)
        && matches(product, 'gender', filters.gender)
        && matches(product, 'age_group', filters.age_group)
        && matches(product, 'size', filters.size)
        && matches(product, 'color', filters.color)
        && matches(product, 'thermal_type', filters.thermal_type);
    });
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, q, filters, sort]);

  return (
    <PageShell>
      <div className="bg-[#FAF8F5] py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h1 className="font-poppins font-bold text-4xl text-[#0A0A0A]">{q ? `Results for "${q}"` : 'Shop All'}</h1>
          <p className="text-[#2C2C2C]/60 mt-2">{filtered.length} products across Boys, Girls, Kids and Thermal</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside>
            <div className="sticky top-28 rounded-2xl border bg-white p-5">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal size={18} className="text-[#2C2C2C]/60" />
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
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="w-full bg-[#0A0A0A] text-white rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none">
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </aside>

          <section>
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square bg-[#F5F1ED] rounded-2xl animate-pulse" />)}
              </div>
            ) : filtered.length ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <p className="text-center py-20 text-[#2C2C2C]/60">No products found.</p>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}

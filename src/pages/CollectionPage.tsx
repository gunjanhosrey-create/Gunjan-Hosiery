import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useSeo } from '@/lib/seo';
import PageShell from '@/components/PageShell';
import ProductCard from '@/components/ProductCard';

const labels: Record<string, string> = {
  boys: 'Boys Collection',
  girls: 'Girls Collection',
  kids: 'Kids Collection',
  thermal: 'Thermal Collection',
};

const fallbackHandle: Record<string, string> = {
  boys: 'men',
  girls: 'women',
};

const productText = (product: any) => `${product.name} ${product.product_type} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase();

export default function CollectionPage() {
  const { handle } = useParams<{ handle: string }>();
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const title = labels[handle || ''] || collection?.title || 'Collection';

  useSeo({
    title: `${title} - Gunjan Hosiery`,
    description: `Shop ${title.toLowerCase()} from Gunjan Hosiery with premium cotton comfort and modern everyday fits.`,
    keywords: ['Boys Innerwear', 'Girls Innerwear', 'Kids Innerwear', 'Thermal Wear', 'Winter Collection', title],
  });

  useEffect(() => {
    const run = async () => {
      if (!handle) return;
      setLoading(true);
      const wantedHandles = [handle, fallbackHandle[handle]].filter(Boolean);
      const { data: rows } = await supabase.from('ecom_collections').select('*').in('handle', wantedHandles);
      const col = rows?.find(row => row.handle === handle) || rows?.[0];
      if (!col) {
        const { data } = await supabase.from('ecom_products').select('*').eq('status', 'active');
        const needle = handle.toLowerCase();
        setCollection({ title: labels[handle] || 'Collection' });
        setProducts((data || []).filter(product => productText(product).includes(needle)));
        setLoading(false);
        return;
      }
      setCollection({ ...col, title: labels[handle] || col.title });
      const { data: links } = await supabase.from('ecom_product_collections').select('product_id, position').eq('collection_id', col.id).order('position');
      if (!links?.length) { setProducts([]); setLoading(false); return; }
      const ids = links.map(l => l.product_id);
      const { data: prods } = await supabase.from('ecom_products').select('*').in('id', ids).eq('status', 'active');
      setProducts(ids.map(id => prods?.find(p => p.id === id)).filter(Boolean));
      setLoading(false);
    };
    run();
  }, [handle]);

  return (
    <PageShell>
      <div className="bg-[#FAF8F5] py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h1 className="font-poppins font-bold text-4xl text-[#0A0A0A]">{title}</h1>
          {collection?.description && <p className="text-[#2C2C2C]/60 mt-2 max-w-xl">{collection.description}</p>}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square bg-[#F5F1ED] rounded-2xl animate-pulse" />)}
          </div>
        ) : products.length ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-center py-20 text-[#2C2C2C]/60">No products in this collection yet.</p>
        )}
      </div>
    </PageShell>
  );
}

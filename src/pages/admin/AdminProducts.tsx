import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { IMAGE_BUCKET, IMAGE_FOLDERS, ImageFolder } from '@/lib/storageImages';
import { Plus, Trash2, Upload, X, Loader2 } from 'lucide-react';

const clean = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-');

type SizePriceRow = { size: string; price: string; quantity: string };

const initialForm = {
  name: '',
  description: '',
  price: '',
  product_type: '',
  inventory_qty: '',
  folder: 'boys' as ImageFolder,
  category: 'Boys',
  gender: 'Boys',
  age_group: '',
  size: '',
  color: '',
  thermal_type: '',
  sizePricing: false,
  sizeRows: [{ size: '', price: '', quantity: '' }] as SizePriceRow[],
  images: [] as string[],
};

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(initialForm);

  const updateSizeRow = (index: number, field: keyof SizePriceRow, value: string) => {
    setForm((current: any) => ({
      ...current,
      sizeRows: current.sizeRows.map((row: SizePriceRow, rowIndex: number) => rowIndex === index ? { ...row, [field]: value } : row),
    }));
  };

  const applyPriceToAllSizes = () => {
    setForm((current: any) => ({
      ...current,
      sizeRows: current.sizeRows.map((row: SizePriceRow) => ({ ...row, price: current.price })),
    }));
  };

  const load = () => supabase.from('ecom_products').select('*').order('created_at', { ascending: false }).then(({ data }) => setProducts(data || []));
  useEffect(() => { load(); }, []);

  const upload = async (files: FileList | null) => {
  if (!files) return;

  setUploading(true);

  const urls: string[] = [];

  for (const file of Array.from(files)) {
    const path = `${form.folder}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, {
        upsert: true,
      });

    console.log("UPLOAD DATA:", data);
    console.log("UPLOAD ERROR:", error);

    if (error) {
      alert(error.message);
      continue;
    }

    const { data: publicData } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(path);

    urls.push(publicData.publicUrl);
  }

  setForm((f: any) => ({
    ...f,
    images: [...f.images, ...urls]
  }));

  setUploading(false);
};

  const save = async () => {
    const sizeRows = form.sizePricing ? form.sizeRows.filter((row: SizePriceRow) => row.size.trim()) : [];
    const hasValidSizeRows = sizeRows.length > 0 && sizeRows.every((row: SizePriceRow) => {
      const rowPrice = parseFloat(row.price);
      const rowQuantity = parseInt(row.quantity, 10);
      return Number.isFinite(rowPrice) && rowPrice > 0 && Number.isInteger(rowQuantity) && rowQuantity >= 0;
    });
    const firstSizeRow = hasValidSizeRows ? sizeRows[0] : null;
    const pricePerPiece = parseFloat(form.price) || (firstSizeRow ? parseFloat(firstSizeRow.price) : NaN);
    const inventoryQty = form.inventory_qty === '' && firstSizeRow ? parseInt(firstSizeRow.quantity, 10) : parseInt(form.inventory_qty, 10);
    const sizePricing = hasValidSizeRows
      ? Object.fromEntries(sizeRows.map((row: SizePriceRow) => [row.size.trim(), {
        price_per_piece: parseFloat(row.price),
        quantity: parseInt(row.quantity, 10),
      }]))
      : null;
    if (!form.name || !Number.isFinite(pricePerPiece) || pricePerPiece <= 0 || !Number.isInteger(inventoryQty) || inventoryQty < 0 || (form.sizePricing && !hasValidSizeRows)) return;
    setSaving(true);
    const handle = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4);
    const tags = [
      'new',
      form.category && `category:${clean(form.category)}`,
      form.gender && `gender:${clean(form.gender)}`,
      form.age_group && `age_group:${clean(form.age_group)}`,
      form.size && `size:${clean(form.size)}`,
      form.color && `color:${clean(form.color)}`,
      form.thermal_type && `thermal_type:${clean(form.thermal_type)}`,
      form.folder === 'thermal' && 'thermal',
    ].filter(Boolean);

    const { data: product, error } = await supabase.from('ecom_products').insert({
      name: form.name,
      handle,
      description: form.description,
      price: Math.round(pricePerPiece * 100),
      product_type: form.product_type || (form.folder === 'thermal' ? 'Thermal Wear' : 'Innerwear'),
      inventory_qty: inventoryQty,
      status: 'active',
      has_variants: hasValidSizeRows,
      size_pricing: sizePricing,
      images: form.images,
      tags,
    }).select('id').single();
    if (error || !product) {
      setSaving(false);
      return;
    }
    if (hasValidSizeRows) {
      await supabase.from('ecom_product_variants').insert(sizeRows.map((row: SizePriceRow, position: number) => ({
        product_id: product.id,
        title: row.size.trim(),
        option1: row.size.trim(),
        price: Math.round(parseFloat(row.price) * 100),
        inventory_qty: parseInt(row.quantity, 10),
        position,
      })));
    }
    setSaving(false);
    setShow(false);
    setForm(initialForm);
    load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('ecom_products').delete().eq('id', id);
    load();
  };

  const thermalCount = products.filter(p => `${p.name} ${p.product_type} ${(p.tags || []).join(' ')}`.toLowerCase().includes('thermal')).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-poppins font-bold text-2xl">Products ({products.length})</h2>
          <p className="text-sm text-[#2C2C2C]/60 mt-1">{thermalCount} thermal products. Upload folders: boys, girls, kids, thermal, banners.</p>
        </div>
        <button onClick={() => setShow(true)} className="flex items-center gap-2 bg-[#0A0A0A] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#8B2635]"><Plus size={16} /> Add Product</button>
      </div>

      <div className="bg-white rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF8F5] text-left text-[#2C2C2C]/60">
            <tr><th className="p-4">Product</th><th className="p-4">Type</th><th className="p-4">Tags</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4"></th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-4 flex items-center gap-3"><img src={p.images?.[0]} className="w-10 h-10 rounded-lg object-cover bg-[#F5F1ED]" alt="" /><span className="font-medium">{p.name}</span></td>
                <td className="p-4 text-[#2C2C2C]/60">{p.product_type}</td>
                <td className="p-4 text-[#2C2C2C]/60 max-w-xs truncate">{(p.tags || []).join(', ')}</td>
                <td className="p-4">{formatPrice(p.price)}</td>
                <td className="p-4">{p.inventory_qty}</td>
                <td className="p-4"><button onClick={() => del(p.id)} className="text-[#8B2635]"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShow(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5"><h3 className="font-poppins font-bold text-xl">New Product</h3><button onClick={() => setShow(false)}><X size={20} /></button></div>
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input placeholder="Name" className="w-full border rounded-xl p-3 text-sm" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <select className="w-full border rounded-xl p-3 text-sm" value={form.folder} onChange={e => setForm({ ...form, folder: e.target.value, category: e.target.value === 'thermal' ? 'Thermal' : e.target.value })}>
                  {IMAGE_FOLDERS.map(folder => <option key={folder} value={folder}>{folder}/</option>)}
                </select>
              </div>
              <textarea placeholder="Description" rows={3} className="w-full border rounded-xl p-3 text-sm" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="border border-[#E8E0D9] rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-sm">Price &amp; Quantity</h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="text-xs text-[#2C2C2C]/70 space-y-1">
                    <span className="block">Price / Piece (₹)</span>
                    <input aria-label="Price per piece" placeholder="₹100 / Piece" type="number" min="0" step="0.01" className="w-full border rounded-xl p-3 text-sm text-[#0A0A0A]" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                  </label>
                  <label className="text-xs text-[#2C2C2C]/70 space-y-1">
                    <span className="block">Pieces / Box</span>
                    <input aria-label="Pieces per box" placeholder="6 Pieces" type="number" min="0" step="1" className="w-full border rounded-xl p-3 text-sm text-[#0A0A0A]" value={form.inventory_qty} onChange={e => setForm({ ...form, inventory_qty: e.target.value })} />
                  </label>
                  <label className="text-xs text-[#2C2C2C]/70 space-y-1">
                    <span className="block">Total Article Price</span>
                    <input aria-label="Total article price" value={form.price && form.inventory_qty ? `₹${(parseFloat(form.price) * parseInt(form.inventory_qty, 10) || 0).toFixed(2)}` : '₹0.00'} readOnly className="w-full border rounded-xl p-3 text-sm bg-[#FAF8F5] text-[#0A0A0A]" />
                  </label>
                </div>
              </div>
              <div className="border border-[#E8E0D9] rounded-xl p-4 space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={form.sizePricing} onChange={e => setForm({ ...form, sizePricing: e.target.checked })} />
                  Enable Size-Wise Pricing
                </label>
                {form.sizePricing && (
                  <>
                    <p className="text-xs text-[#2C2C2C]/60">Each size keeps its own Price / Piece and stock. Existing product price and stock remain unchanged.</p>
                    <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-semibold text-[#2C2C2C]/70">
                      <span>Size</span><span>Price / Piece (₹)</span><span>Pieces / Box</span><span />
                    </div>
                    {form.sizeRows.map((row: SizePriceRow, index: number) => (
                      <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                        <input aria-label={`Size ${index + 1}`} placeholder="24" className="border rounded-xl p-3 text-sm" value={row.size} onChange={e => updateSizeRow(index, 'size', e.target.value)} />
                        <input aria-label={`Price for size ${index + 1}`} placeholder="₹100" type="number" min="0" step="0.01" className="border rounded-xl p-3 text-sm" value={row.price} onChange={e => updateSizeRow(index, 'price', e.target.value)} />
                        <input aria-label={`Pieces per box for size ${index + 1}`} placeholder="6" type="number" min="0" step="1" className="border rounded-xl p-3 text-sm" value={row.quantity} onChange={e => updateSizeRow(index, 'quantity', e.target.value)} />
                        <button type="button" aria-label={`Remove size ${index + 1}`} disabled={form.sizeRows.length === 1} onClick={() => setForm({ ...form, sizeRows: form.sizeRows.filter((_: SizePriceRow, rowIndex: number) => rowIndex !== index) })} className="p-2 text-[#8B2635] disabled:opacity-30"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setForm({ ...form, sizeRows: [...form.sizeRows, { size: '', price: form.price, quantity: '' }] })} className="text-sm font-medium text-[#8B2635]">+ Add Size</button>
                      <button type="button" onClick={applyPriceToAllSizes} className="text-sm font-medium text-[#8B2635]">Apply Price to All Sizes</button>
                    </div>
                  </>
                )}
              </div>
              <input placeholder="Type" className="w-full border rounded-xl p-3 text-sm" value={form.product_type} onChange={e => setForm({ ...form, product_type: e.target.value })} />
              <div className="grid sm:grid-cols-3 gap-3">
                <select className="border rounded-xl p-3 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {['Boys', 'Girls', 'Kids', 'Thermal'].map(v => <option key={v}>{v}</option>)}
                </select>
                <select className="border rounded-xl p-3 text-sm" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  {['Boys', 'Girls', 'Kids', 'Men', 'Women'].map(v => <option key={v}>{v}</option>)}
                </select>
                <select className="border rounded-xl p-3 text-sm" value={form.thermal_type} onChange={e => setForm({ ...form, thermal_type: e.target.value })}>
                  <option value="">Thermal Type</option>
                  {['Top', 'Bottom', 'Set'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <input placeholder="Age group" className="border rounded-xl p-3 text-sm" value={form.age_group} onChange={e => setForm({ ...form, age_group: e.target.value })} />
                <input placeholder="Size" className="border rounded-xl p-3 text-sm" value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} />
                <input placeholder="Color" className="border rounded-xl p-3 text-sm" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
              </div>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 text-sm cursor-pointer hover:bg-[#FAF8F5]">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload Images to {form.folder}/
                <input type="file" multiple accept="image/*" className="hidden" onChange={e => upload(e.target.files)} />
              </label>
              {form.images.length > 0 && (
                <div className="flex gap-2 flex-wrap">{form.images.map((u: string, i: number) => <img key={i} src={u} className="w-16 h-16 rounded-lg object-cover" alt="" />)}</div>
              )}
              <button onClick={save} disabled={saving} className="w-full bg-[#0A0A0A] text-white py-3 rounded-xl font-medium hover:bg-[#8B2635] disabled:opacity-50">{saving ? 'Saving...' : 'Save Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

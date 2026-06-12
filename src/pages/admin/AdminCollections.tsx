import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { IMAGE_BUCKET, IMAGE_FOLDERS, ImageFolder } from '@/lib/storageImages';
import { Loader2, Upload } from 'lucide-react';

const starterCollections = [
  { title: 'Boys Collection', handle: 'boys', description: 'Premium boys innerwear and everyday essentials.', sort_order: 1, is_visible: true },
  { title: 'Girls Collection', handle: 'girls', description: 'Soft girls innerwear and daily comfort wear.', sort_order: 2, is_visible: true },
  { title: 'Kids Collection', handle: 'kids', description: 'Comfortable innerwear and basics for kids.', sort_order: 3, is_visible: true },
  { title: 'Thermal Collection', handle: 'thermal', description: 'Warm winter thermal wear for the whole family.', sort_order: 4, is_visible: true },
];

export default function AdminCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  const [folder, setFolder] = useState<ImageFolder>('banners');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

  const load = () => supabase.from('ecom_collections').select('*').order('sort_order').then(({ data }) => setCollections(data || []));
  useEffect(() => { load(); }, []);

  const seedCollections = async () => {
    setStatus('Saving collections...');
    for (const item of starterCollections) {
      const { data: existing } = await supabase.from('ecom_collections').select('id').eq('handle', item.handle).maybeSingle();
      if (existing?.id) await supabase.from('ecom_collections').update(item).eq('id', existing.id);
      else await supabase.from('ecom_collections').insert(item);
    }
    setStatus('Collections updated.');
    load();
  };

  const migrateLegacy = async () => {
    setStatus('Renaming legacy collection records...');
    await supabase.from('ecom_collections').update({ title: 'Boys Collection', handle: 'boys', description: 'Premium boys innerwear and everyday essentials.' }).eq('handle', 'men');
    await supabase.from('ecom_collections').update({ title: 'Girls Collection', handle: 'girls', description: 'Soft girls innerwear and daily comfort wear.' }).eq('handle', 'women');
    setStatus('Legacy records migrated.');
    load();
  };

  const upload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const path = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { upsert: true });
    }
    setUploading(false);
    setStatus(`Images uploaded to ${folder}/.`);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-poppins font-bold text-2xl">Collections and Banners</h2>
          <p className="text-sm text-[#2C2C2C]/60 mt-1">Manage Boys, Girls, Kids, Thermal, homepage sections, and Supabase Storage folders.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={seedCollections} className="bg-[#0A0A0A] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#8B2635]">Update Homepage Collections</button>
          <button onClick={migrateLegacy} className="border bg-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#FAF8F5]">Migrate Legacy Names</button>
        </div>
      </div>

      {status && <p className="mb-4 rounded-xl bg-white border px-4 py-3 text-sm text-[#2C2C2C]/70">{status}</p>}

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white rounded-2xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF8F5] text-left text-[#2C2C2C]/60">
              <tr><th className="p-4">Title</th><th className="p-4">Handle</th><th className="p-4">Visible</th><th className="p-4">Sort</th></tr>
            </thead>
            <tbody>
              {collections.map(collection => (
                <tr key={collection.id} className="border-t">
                  <td className="p-4 font-medium">{collection.title}</td>
                  <td className="p-4 text-[#2C2C2C]/60">{collection.handle}</td>
                  <td className="p-4">{collection.is_visible ? 'Yes' : 'No'}</td>
                  <td className="p-4">{collection.sort_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <h3 className="font-poppins font-semibold text-lg">Upload Images</h3>
          <p className="text-sm text-[#2C2C2C]/60 mt-1">Images become available automatically from their storage folder.</p>
          <select className="mt-4 w-full border rounded-xl p-3 text-sm" value={folder} onChange={e => setFolder(e.target.value as ImageFolder)}>
            {IMAGE_FOLDERS.map(name => <option key={name} value={name}>{name}/</option>)}
          </select>
          <label className="mt-4 flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 text-sm cursor-pointer hover:bg-[#FAF8F5]">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload to {folder}/
            <input type="file" multiple accept="image/*" className="hidden" onChange={e => upload(e.target.files)} />
          </label>
          <div className="mt-5 text-xs text-[#2C2C2C]/50 space-y-1">
            {IMAGE_FOLDERS.map(name => <p key={name}>product-images/{name}/</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

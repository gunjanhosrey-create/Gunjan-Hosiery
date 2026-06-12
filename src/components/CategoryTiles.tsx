import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useStorageImages } from '@/lib/storageImages';

const tiles = [
  { handle: 'boys', title: 'Boys Collection', folder: 'boys', img:"/boys.png"},
  { handle: 'girls', title: 'Girls Collection', folder: 'girls', img:'/girls.png' },
  { handle: 'kids', title: 'Kids Collection', folder: 'kids', img: '/kids.png' },
  { handle: 'thermal', title: 'Thermal Collection', folder: 'thermal', img:'/thermal.png' },
];
function CategoryTile({ tile }: { tile: typeof tiles[number] }) {
  const images = useStorageImages(tile.folder, [tile.img]);
  const to = tile.handle === 'thermal' ? '/thermal' : `/collections/${tile.handle}`;

  return (
    <Link to={to} className="group relative overflow-hidden rounded-2xl aspect-[4/5] reveal-up bg-[#F5F1ED]">
      <img src={images[0]} alt={tile.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 p-6 flex items-end justify-between">
        <div>
          <h3 className="font-poppins font-bold text-white text-2xl">{tile.title}</h3>
          <p className="text-white/70 text-sm">Explore collection</p>
        </div>
        <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center group-hover:bg-[#D4622F] transition">
          <ArrowUpRight size={20} className="text-[#0A0A0A] group-hover:text-white transition" />
        </span>
      </div>
    </Link>
  );
}

export default function CategoryTiles() {
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8B2635] font-semibold">Featured Collections</p>
          <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-[#0A0A0A] mt-1">Shop by Category</h2>
        </div>
        <Link to="/shop" className="hidden sm:inline text-sm font-medium text-[#0A0A0A] hover:text-[#8B2635]">View all</Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {tiles.map(t => <CategoryTile key={t.handle} tile={t} />)}
      </div>
    </section>
  );
}

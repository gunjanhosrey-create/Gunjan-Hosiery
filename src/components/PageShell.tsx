import { useEffect } from 'react';
import Navbar from './Navbar';
import Marquee from './Marquee';
import Footer from './Footer';

export default function PageShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { threshold: 0.1 });
    setTimeout(() => document.querySelectorAll('.reveal-up').forEach(el => obs.observe(el)), 200);
    return () => obs.disconnect();
  }, [children]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Marquee />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

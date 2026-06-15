import PageShell from '@/components/PageShell';

const HERO =
  '/about/main.png';

export default function About() {
  return (
    <PageShell>
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        <img src={HERO} className="w-full h-full object-cover" alt="About Gunjan Hosiery" />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white uppercase tracking-[0.3em] text-sm">
              Since 1990
            </p>
            <h1 className="font-poppins font-bold text-5xl text-white mt-3">
              About Gunjan Hosiery
            </h1>
          </div>
        </div>
      </div>

      {/* Company Story */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#8B2635] font-semibold uppercase tracking-[0.2em]">
              Our Legacy
            </p>
            <h2 className="font-poppins font-bold text-4xl mt-3 text-[#0A0A0A]">
              Over 35 Years of Trust & Quality
            </h2>
            <p className="mt-6 text-gray-600 leading-relaxed">
              Established in 1990, Gunjan Hosiery has been committed to
              delivering premium-quality innerwear, thermal wear, and hosiery
              products for families across India.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              With decades of manufacturing experience, we focus on comfort,
              durability, and affordability. Every product reflects our
              dedication to quality craftsmanship and customer satisfaction.
            </p>
          </div>

          <img
            src="/about/gunjan-hosiery.png"
            alt="Gunjan Hosiery"
            className="rounded-3xl shadow-lg"
          />
        </div>
      </section>

      {/* Founder Section */}
      <section className="bg-[#FAF8F5] py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="font-poppins text-3xl font-bold text-[#0A0A0A]">
              Mr. Ram Pratap Singh Yadav
            </h3>
            <p className="text-[#8B2635] font-semibold mt-2">Founder</p>

            <p className="mt-6 text-gray-600 leading-relaxed">
              Gunjan Hosiery was founded in 1990 by Mr. Ram Pratap Singh Yadav
              with a vision to provide high-quality hosiery products at
              affordable prices. His commitment to excellence and customer trust
              laid the foundation for the brand's continued success.
            </p>
          </div>

          <img
            src="/about/founder.jpg"
            alt="Founder"
            className="rounded-3xl shadow-lg"
          />
        </div>
      </section>

      {/* CEO Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <img
            src="/about/gunjan.jpeg"
            alt="CEO"
            className="rounded-3xl shadow-lg order-2 md:order-1"
          />

          <div className="order-1 md:order-2">
            <h3 className="font-poppins text-3xl font-bold text-[#0A0A0A]">
              Mr. Gunjan Singh Yadav
            </h3>
            <p className="text-[#8B2635] font-semibold mt-2">
              Chief Executive Officer (CEO)
            </p>

            <p className="mt-6 text-gray-600 leading-relaxed">
              Under the leadership of Mr. Gunjan Singh Yadav, Gunjan Hosiery is
              embracing innovation, digital transformation, and customer-focused
              growth. His vision is to expand the brand while preserving its
              commitment to quality and trust.
            </p>
          </div>
        </div>
      </section>

      {/* MD Section */}
      <section className="bg-[#FAF8F5] py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="font-poppins text-3xl font-bold text-[#0A0A0A]">
              Brahmdatt Singh Yadav
            </h3>
            <p className="text-[#8B2635] font-semibold mt-2">
              Managing Director (MD)
            </p>

            <p className="mt-6 text-gray-600 leading-relaxed">
              As Managing Director, Brahmdatt Singh Yadav oversees operations,
              quality assurance, and business development. His dedication
              ensures every Gunjan Hosiery product meets the highest standards
              of comfort, durability, and reliability.
            </p>
          </div>
          <img
            src="/about/bd-singh-yadav.jpeg"
            alt="Managing Director"
            className="rounded-3xl shadow-lg"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            ['35+', 'Years Experience'],
            ['5000+', 'Happy Customers'],
            ['100+', 'Retail Partners'],
            ['100%', 'Quality Commitment'],
          ].map(([value, label]) => (
            <div
              key={label}
              className="bg-[#FAF8F5] rounded-3xl p-8 text-center"
            >
              <h4 className="text-4xl font-bold text-[#8B2635]">{value}</h4>
              <p className="text-gray-600 mt-2">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

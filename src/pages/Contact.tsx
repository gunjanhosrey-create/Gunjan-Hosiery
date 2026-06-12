import { useState } from 'react';
import PageShell from '@/components/PageShell';
import { supabase } from '@/lib/supabase';
import { PROJECT_ID } from '@/lib/format';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    await supabase.from('customer_queries').insert(form);

    try {
      await fetch(`https://famous.ai/api/crm/${PROJECT_ID}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          source: 'contact-form',
          tags: ['contact'],
        }),
      });
    } catch {}

    setLoading(false);
    setSent(true);

    setForm({
      name: '',
      phone: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(
      'Hi! I would like to know more about Gunjan Hosiery products.'
    );

    window.open(
      `https://wa.me/919170259644?text=${msg}`,
      '_blank'
    );
  };

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="font-poppins font-bold text-4xl text-[#0A0A0A]">
            Contact Us
          </h1>

          <p className="text-[#2C2C2C]/60 mt-2">
            We'd love to hear from you. Our team is here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <a
              href="mailto:gunjanhosrey@gmail.com"
              className="flex items-center gap-4 bg-[#FAF8F5] rounded-2xl p-5 hover:shadow-md transition"
            >
              <div className="w-12 h-12 rounded-full bg-[#8B2635]/10 flex items-center justify-center">
                <Mail size={20} className="text-[#8B2635]" />
              </div>

              <div>
                <p className="font-semibold text-sm">Email Us</p>
                <p className="text-[#2C2C2C]/60 text-sm">
                  gunjanhosrey@gmail.com
                </p>
              </div>
            </a>

            <a
              href="tel:+919170259644"
              className="flex items-center gap-4 bg-[#FAF8F5] rounded-2xl p-5 hover:shadow-md transition"
            >
              <div className="w-12 h-12 rounded-full bg-[#8B2635]/10 flex items-center justify-center">
                <Phone size={20} className="text-[#8B2635]" />
              </div>

              <div>
                <p className="font-semibold text-sm">Call Us</p>
                <p className="text-[#2C2C2C]/60 text-sm">
                  +91 9170259644
                </p>
              </div>
            </a>

            <a
              href="https://maps.app.goo.gl/PcNNCtppvxUVdmdw8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-[#FAF8F5] rounded-2xl p-5 hover:shadow-md transition"
            >
              <div className="w-12 h-12 rounded-full bg-[#8B2635]/10 flex items-center justify-center">
                <MapPin size={20} className="text-[#8B2635]" />
              </div>

              <div>
                <p className="font-semibold text-sm">Visit Us</p>
                <p className="text-[#2C2C2C]/60 text-sm">
                  C-34, UPSIDC Industrial Area, Rooma, Chekeri Ward,
                  Kanpur, Uttar Pradesh 209402
                </p>
              </div>
            </a>
          </div>

          {/* Contact Form */}
          <form onSubmit={submit} className="space-y-4">
            <input
              required
              placeholder="Your Name"
              className="w-full border rounded-xl p-3.5 text-sm"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              required
              placeholder="Phone Number"
              className="w-full border rounded-xl p-3.5 text-sm"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <input
              required
              type="email"
              placeholder="Your Email"
              className="w-full border rounded-xl p-3.5 text-sm"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              required
              placeholder="Subject"
              className="w-full border rounded-xl p-3.5 text-sm"
              value={form.subject}
              onChange={(e) =>
                setForm({ ...form, subject: e.target.value })
              }
            />

            <textarea
              required
              rows={5}
              placeholder="Your Message"
              className="w-full border rounded-xl p-3.5 text-sm"
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
            />

            <button
              disabled={loading}
              className="w-full bg-[#0A0A0A] text-white py-4 rounded-xl font-medium hover:bg-[#8B2635] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={16} />
              {loading ? 'Sending...' : 'Send Message'}
            </button>

            <button
              type="button"
              onClick={openWhatsApp}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </button>

            {sent && (
              <p className="text-[#8B2635] text-sm text-center">
                Thanks! We'll get back to you soon.
              </p>
            )}
          </form>
        </div>
      </div>
    </PageShell>
  );
}
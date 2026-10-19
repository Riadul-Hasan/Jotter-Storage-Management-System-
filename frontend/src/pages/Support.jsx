import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Mail, Phone, LifeBuoy, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react';
import PageShell from '../components/PageShell';
import api from '../api/axios';
import { cx } from '../utils/format';

const FAQS = [
  { q: 'How do I add a new item?', a: 'Tap the big “+” button at the bottom of any page, pick a type (note, image, PDF or folder), give it a name and save.' },
  { q: 'How do I favourite an item?', a: 'Tap the heart on any item card — it will appear in your Favourites tab instantly.' },
  { q: 'What is the private vault?', a: 'Lock any folder with a password. Locked items move to the Private vault page and are hidden from everywhere else until unlocked.' },
  { q: 'Can I share an item?', a: 'Yes — use the share action on any item to generate a link and copy it to your clipboard.' },
  { q: 'How do I change my password?', a: 'Go to Settings → Change password, or your Profile page.' },
  { q: 'Is my data safe?', a: 'Your items are stored securely on your account. Locked folders are additionally protected by a password you set.' },
];

const Support = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/support/contact', form);
      toast.success("Thanks — we'll get back to you soon!");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Could not send message. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="Support" subtitle="We're here to help you get the most out of Jotter" accent="mint">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl grid gap-8 lg:grid-cols-12"
      >
        {/* contact form */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[26px] border border-cream-200 bg-white/90 p-6 sm:p-8 shadow-warm-sm"
          >
            <h3 className="text-xl font-display font-bold text-ink-900 mb-1">Send us a message</h3>
            <p className="text-[13px] text-ink-500 mb-6">Stuck on something? Drop us a line and we'll reply as soon as we can.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-cream-700">Name</label>
                  <input className="w-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-cream-700">Email</label>
                  <input className="w-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-cream-700">Subject</label>
                <input className="w-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?" />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-cream-700">Message</label>
                <textarea className="w-field min-h-[120px] resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us what's happening…" />
              </div>
              <button type="submit" disabled={submitting} className="w-btn-primary py-4 text-sm font-bold">{submitting ? 'Sending…' : 'Send message'}</button>
            </form>
          </motion.div>
        </div>

        {/* FAQ */}
        <div className="lg:col-span-5">
          <h3 className="text-lg font-display font-bold text-ink-900 mb-4">Frequently asked</h3>
          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-cream-200 bg-white/80 p-4 shadow-warm-xs"
              >
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle size={16} className="text-brand-mint shrink-0" />
                  <h4 className="text-sm font-bold text-ink-900">{q}</h4>
                </div>
                <p className="text-[12.5px] text-ink-600 leading-relaxed">{a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* contact chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 grid gap-4 sm:grid-cols-3"
      >
        {[
          { icon: Mail, label: 'Email us', text: 'hello@jotter.app', accent: 'from-brand-sky to-blue-500' },
          { icon: MessageCircle, label: 'In-app chat', text: 'Tap the support button in Settings', accent: 'from-brand-mint to-emerald-500' },
          { icon: LifeBuoy, label: 'Help centre', text: 'Guides and troubleshooting', accent: 'from-brand-grape to-purple-500' },
        ].map((c) => (
          <motion.div
            key={c.label}
            whileHover={{ y: -4 }}
            className="flex items-center gap-3 rounded-[20px] border border-cream-200 bg-white/80 p-4 shadow-warm-xs"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm" style={{ background: c.accent }}>
              <c.icon size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h4 className="font-bold text-ink-900">{c.label}</h4>
              <p className="text-[12px] text-ink-500">{c.text}</p>
            </div>
            <ArrowRight size={14} className="text-ink-300 shrink-0" />
          </motion.div>
        ))}
      </motion.div>
    </PageShell>
  );
};

export default Support;

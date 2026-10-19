import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Clock, Mail } from 'lucide-react';
import PageShell from '../components/PageShell';

const TERMS = [
  {
    title: 'Acceptance of terms',
    icon: FileText,
    body: 'By accessing or using Jotter, you agree to these terms. If you do not agree, you may not use the service.',
  },
  {
    title: 'Your account',
    icon: ShieldCheck,
    body: 'You are responsible for keeping your account credentials secure. You may update your profile, change your password or delete your account at any time from Settings.',
  },
  {
    title: 'Your content',
    icon: FileText,
    body: 'You retain ownership of everything you upload or write in Jotter. We store your items so you can access them across your devices; we do not sell your personal files.',
  },
  {
    title: 'Private vault',
    icon: ShieldCheck,
    body: 'Folders you lock are protected with a password you set. We cannot recover a forgotten vault password, so keep it safe.',
  },
  {
    title: 'Storage',
    icon: Clock,
    body: 'Each account comes with 15 GB of storage. You can see your usage on your Profile page.',
  },
  {
    title: 'Termination',
    icon: FileText,
    body: 'We may suspend or terminate accounts that violate these terms. Deleting your account permanently removes your items and cannot be undone.',
  },
  {
    title: 'Contact',
    icon: Mail,
    body: 'Questions about these terms? Reach out via the Support page or email hello@jotter.app.',
  },
];

const Terms = () => (
  <PageShell title="Terms of service" subtitle="The basics of using Jotter, in plain language" accent="mint">
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl space-y-5"
    >
      {TERMS.map((section, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="rounded-[22px] border border-cream-200 bg-white/85 p-5 sm:p-6 shadow-warm-xs"
        >
          <div className="flex items-center gap-3 mb-2">
            <section.icon size={17} className="text-brand-mint shrink-0" />
            <h4 className="font-bold text-ink-900">{section.title}</h4>
          </div>
          <p className="text-[14px] text-ink-600 leading-relaxed">{section.body}</p>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-[22px] border border-cream-200 bg-cream-100/60 p-5 sm:p-6 text-center"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-cream-700 mb-2">Last updated — October 2026</p>
        <p className="text-sm text-ink-500">Jotter — a warmer place for your things.</p>
      </motion.div>
    </motion.div>
  </PageShell>
);

export default Terms;
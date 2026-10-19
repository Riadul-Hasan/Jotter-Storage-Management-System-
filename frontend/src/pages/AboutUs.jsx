// import { motion } from 'framer-motion';
// import { Sparkles, Folder, ShieldCheck, Users, Clock, Heart } from 'lucide-react';
// import PageShell from '../components/PageShell';
// import { cx } from '../utils/format';

// import { motion } from 'framer-motion';
// import { Sparkles, Folder, ShieldCheck, Users, Clock, Heart } from 'lucide-react';
// import PageShell from '../components/PageShell';
// import { cx } from '../utils/format';
// import { CreateItemDialog } from '../components/Dialogs';

// const AboutUs = () => {
//   const [createOpen, setCreateOpen] = useState(false);

//   const createItem = async ({ type, name, content, file }) => {
//     try {
//       if (file) {
//         const fd = new FormData();
//         fd.append('type', type);
//         fd.append('name', name);
//         fd.append('file', file);
//         await api.post('/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
//       } else {
//         await api.post('/items', { type, name, content });
//       }
//       toast.success('Created');
//       setCreateOpen(false);
//     } catch (e) {
//       toast.error(e?.response?.data?.message || 'Could not create item');
//     }
//   };

//   return (
//     <PageShell title="About Jotter" subtitle="A warmer place for your notes, images and documents" accent="mint" onAddClick={() => setCreateOpen(true)}>
//       <motion.div
//         initial={{ opacity: 0, y: 14 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-3xl"
//       >
//         {/* hero */}
//         <motion.div
//           initial={{ opacity: 0, y: 12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className="mb-10 rounded-[30px] border border-cream-200 bg-gradient-to-br from-white via-cream-50 to-white p-8 sm:p-12 shadow-warm-md text-center"
//         >
//           <div className="grid h-14 w-14 mx-auto mb-5 place-items-center rounded-full bg-gradient-to-br from-brand-mint to-emerald-500 text-white shadow-[0_8px_20px_rgba(18,184,134,0.35)]">
//             <Sparkles size={24} strokeWidth={2} />
//           </div>
//           <h2 className="text-3xl font-display font-bold text-ink-900 tracking-tight mb-3">Built for keeping what matters.</h2>
//           <p className="text-lg text-ink-600 leading-relaxed max-w-md mx-auto">
//             Jotter is your personal storage companion — a warm, colourful home for notes, images, PDFs and folders. Organise with folders, star your favourites, keep a visual calendar and protect what's private in your vault.
//           </p>
//         </motion.div>
        
//         {/* story */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="mb-10"
//         >
//           <h3 className="text-xl font-display font-bold text-ink-900 mb-4">Our story</h3>
//           <p className="text-[14px] text-ink-600 leading-relaxed mb-4">
//             We built Jotter because saving things should feel delightful, not clinical. Everything uses warm cream and paper tones, playful colour accents and smooth motion — so your digital library feels like a desk you actually want to sit at.
//           </p>
//           <p className="text-[14px] text-ink-600 leading-relaxed">
//             Your private vault is protected by a password only you know, and every item can be favourited, renamed, duplicated or shared with a couple of taps.
//           </p>
//         </motion.div>
        
//         {/* features */}
//         <h3 className="text-xl font-display font-bold text-ink-900 mb-6">What you can do</h3>
//         <div className="grid gap-4 md:grid-cols-3">
//           {[
//             { icon: Folder, label: 'Folders', desc: 'Group related items and open them to see their contents.', accent: 'from-brand-grape to-purple-500' },
//             { icon: ShieldCheck, label: 'Private vault', desc: 'Lock folders with a password so only you can open them.', accent: 'from-brand-mint to-emerald-500' },
//             { icon: Clock, label: 'Calendar', desc: 'See your notes and items laid out by the day they were created.', accent: 'from-brand-sky to-blue-500' },
//             { icon: Heart, label: 'Favourites', desc: 'Star anything to keep your most important items close.', accent: 'from-brand-rose to-pink-500' },
//           ].map((f) => (
//             <motion.div
//               key={f.label}
//               whileHover={{ y: -6 }}
//               className="rounded-[22px] border border-cream-200 bg-white/85 p-5 shadow-warm-xs transition-all hover:border-cream-300 hover:shadow-warm-sm"
//             >
//               <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-sm mb-4" style={{ background: f.accent }}>
//                 <f.icon size={18} strokeWidth={2.2} />
//               </div>
//               <h4 className="font-bold text-ink-900 mb-2">{f.label}</h4>
//               <p className="text-[13px] text-ink-500 leading-relaxed">{f.desc}</p>
//             </motion.div>
//           ))}
//         </div>
//       </motion.div>
//       <CreateItemDialog
//         open={createOpen}
//         title="New item"
//         subtitle="Note, image, PDF or folder — pick a type and give it a name."
//         types={['note', 'image', 'pdf', 'folder']}
//         defaultType="note"
//         onSubmit={createItem}
//         onCancel={() => setCreateOpen(false)}
//       />
//     </PageShell>
// );


// export default AboutUs;



import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Folder,
  ShieldCheck,
  Clock,
  Heart,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import PageShell from '../components/PageShell';
import { cx } from '../utils/format';
import { CreateItemDialog } from '../components/Dialogs';
import api from '../api/axios';

const AboutUs = () => {
  const [createOpen, setCreateOpen] = useState(false);

  const createItem = async ({ type, name, content, file }) => {
    try {
      if (file) {
        const fd = new FormData();
        fd.append('type', type);
        fd.append('name', name);
        fd.append('file', file);

        await api.post('/items', fd);
      } else {
        await api.post('/items', { type, name, content });
      }

      toast.success('Created');
      setCreateOpen(false);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || 'Could not create item'
      );
    }
  };

  const features = [
    {
      icon: Folder,
      label: 'Folders',
      desc: 'Group related items and open them to see their contents.',
      accent: 'from-brand-grape to-purple-500',
    },
    {
      icon: ShieldCheck,
      label: 'Private vault',
      desc: 'Lock folders with a password so only you can open them.',
      accent: 'from-brand-mint to-emerald-500',
    },
    {
      icon: Clock,
      label: 'Calendar',
      desc: 'See your notes and items laid out by the day they were created.',
      accent: 'from-brand-sky to-blue-500',
    },
    {
      icon: Heart,
      label: 'Favourites',
      desc: 'Star anything to keep your most important items close.',
      accent: 'from-brand-rose to-pink-500',
    },
  ];

  return (
    <PageShell
      title="About Jotter"
      subtitle="A warmer place for your notes, images and documents"
      accent="mint"
      onAddClick={() => setCreateOpen(true)}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl"
      >
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 rounded-[30px] border border-cream-200 bg-gradient-to-br from-white via-cream-50 to-white p-8 text-center shadow-warm-md sm:p-12"
        >
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-mint to-emerald-500 text-white shadow-[0_8px_20px_rgba(18,184,134,0.35)]">
            <Sparkles size={24} strokeWidth={2} />
          </div>

          <h2 className="mb-3 text-3xl font-display font-bold tracking-tight text-ink-900">
            Built for keeping what matters.
          </h2>

          <p className="mx-auto max-w-md text-lg leading-relaxed text-ink-600">
            Jotter is your personal storage companion — a warm,
            colourful home for notes, images, PDFs and folders.
            Organise with folders, star your favourites, keep a
            visual calendar and protect what's private in your vault.
          </p>
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <h3 className="mb-4 text-xl font-display font-bold text-ink-900">
            Our story
          </h3>

          <p className="mb-4 text-[14px] leading-relaxed text-ink-600">
            We built Jotter because saving things should feel
            delightful, not clinical. Everything uses warm cream
            and paper tones, playful colour accents and smooth
            motion — so your digital library feels like a desk you
            actually want to sit at.
          </p>

          <p className="text-[14px] leading-relaxed text-ink-600">
            Your private vault is protected by a password only you
            know, and every item can be favourited, renamed,
            duplicated or shared with a couple of taps.
          </p>
        </motion.div>

        {/* Features */}
        <h3 className="mb-6 text-xl font-display font-bold text-ink-900">
          What you can do
        </h3>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.label}
              whileHover={{ y: -6 }}
              className="rounded-[22px] border border-cream-200 bg-white/85 p-5 shadow-warm-xs transition-all hover:border-cream-300 hover:shadow-warm-sm"
            >
              <div
                className={`mb-4 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${feature.accent} text-white shadow-sm`}
              >
                <feature.icon size={18} strokeWidth={2.2} />
              </div>

              <h4 className="mb-2 font-bold text-ink-900">
                {feature.label}
              </h4>

              <p className="text-[13px] leading-relaxed text-ink-500">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <CreateItemDialog
        open={createOpen}
        title="New item"
        subtitle="Note, image, PDF or folder — pick a type and give it a name."
        types={['note', 'image', 'pdf', 'folder']}
        defaultType="note"
        onSubmit={createItem}
        onCancel={() => setCreateOpen(false)}
      />
    </PageShell>
  );
};

export default AboutUs;

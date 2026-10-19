const fs = require('fs');
const path = require('path');

const lines = [];

// Line 1-10: imports
lines.push(
  `import { useState, useEffect, useCallback, useMemo, useRef } from 'react';`,
  `import { useNavigate, useLocation } from 'react-router-dom';`,
  `import { motion, AnimatePresence } from 'framer-motion';`,
  `import { toast } from 'react-toastify';`
);

// Line 11-50: lucide icons
lines.push(
  `import {`,
  `  Plus, FileText, Image as ImageIcon, File, Folder as FolderIcon,`,
  `  Clock, Star, StarOff, User, ChevronRight, ChevronDown, ArrowUpRight,`,
  `  Lock, Unlock, LockOpen, Search, Settings, LogOut, X, Trash2, Pencil,`,
  `  Download, Shield, Zap, Sparkles, LayoutGrid, HardDrive, TrendingUp,`,
  `  Layers, Rocket, HelpCircle, Upload, Images, FolderOpen, StickyNote,`,
  `  Heart, Calendar, Home as HomeIcon,`,
  `} from 'lucide-react';`
);

// Line 51-55: import api
lines.push(
  `import api from '../api/axios';`,
  `import PageShell from '../components/PageShell';`,
  `import { cx, EASE, formatBytes, relTime, metaFor, initialsOf, snippet } from '../utils/format';`,
  `import { EmptyState, ListSkeleton } from '../components/Skeletons';`,
  `import { ConfirmDialog } from '../components/Dialogs';`
);

fs.writeFileSync('Home.jsx', lines.join('\n') + '\n', 'utf8');
console.log('Part 1 written');

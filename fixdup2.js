const fs = require('fs');
const p = 'frontend/src/components/Dialogs.jsx';
let s = fs.readFileSync(p, 'utf8');
s = s.replace(/\{mode === 'verify' && \([\s\S]*?Reset it[\s\S]*?\)\}/, '');
fs.writeFileSync(p, s);
console.log('done');
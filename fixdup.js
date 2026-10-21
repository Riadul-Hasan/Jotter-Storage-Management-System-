const fs = require('fs');
const p = 'frontend/src/components/Dialogs.jsx';
let s = fs.readFileSync(p, 'utf8');
const old = `                {mode === 'verify' && (
                  <p className="text-center text-[12.5px] text-ink-500 mt-2">
                    Forgotten vault password?{' '}
                    <button
                      type="button"
                      onClick={onForgot}
                      className="font-bold text-brand-grape underline-offset-2 hover:underline"
                    >
                      Reset it
                    </button>
                  </p>
                )}`;
if (!s.includes(old)) { console.log('NOT FOUND'); process.exit(1); }
s = s.replace(old, '');
fs.writeFileSync(p, s);
console.log('done');
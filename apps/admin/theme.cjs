const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components'),
  path.join(__dirname, 'src', 'layouts')
];

const replacements = {
  'bg-slate-50': 'bg-[#f0e6d2]',
  'bg-white': 'bg-[#f9f6f0]',
  'border-slate-100': 'border-[#ebdcb8]',
  'border-slate-200': 'border-[#d4c3a3]',
  'border-slate-300': 'border-[#c2b192]',
  'text-slate-900': 'text-[#2a160b]',
  'text-slate-800': 'text-[#3a2012]',
  'text-slate-700': 'text-[#3a2012]',
  'text-slate-600': 'text-[#5a3a22]',
  'text-slate-500': 'text-[#8a6d1c]',
  'text-slate-400': 'text-[#a49373]',
  'text-primary': 'text-[#8a6d1c]',
  'bg-primary': 'bg-[#3a2012]',
  'bg-primary/10': 'bg-[#ebdcb8]',
  'bg-primary/20': 'bg-[#d4c3a3]',
  'hover:bg-primary/90': 'hover:bg-[#2a160b]',
  'focus:border-primary': 'focus:border-[#8a6d1c]',
  'focus:ring-primary/20': 'focus:ring-[#8a6d1c]/20',
  'peer-checked:bg-primary': 'peer-checked:bg-[#3a2012]',
  'text-white': 'text-[#f9f6f0]',
  'hover:bg-slate-50': 'hover:bg-[#ebdcb8]',
  'hover:bg-slate-100': 'hover:bg-[#e6ddc5]',
  'hover:bg-slate-200': 'hover:bg-[#d4c3a3]',
  'bg-slate-100': 'bg-[#ebdcb8]',
  'bg-slate-200': 'bg-[#d4c3a3]',
  'bg-slate-900': 'bg-[#2a160b]',
  // specific to settings tab active state
  "bg-primary/10 text-primary": "bg-[#ebdcb8] text-[#8a6d1c] font-bold border border-[#d4c3a3]",
  // table hover
  "hover:bg-slate-50/50": "hover:bg-[#ebdcb8]/50",
  // general font changes
  'font-semibold': 'font-bold'
};

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We need to apply replacements carefully.
  // It's better to use regex with word boundaries to avoid partial matches
  // However, classes like bg-slate-50 have hyphens. Word boundary \b matches on hyphens.
  // We can just use split and join for exact token matching if we split by space or quotes.
  // Simpler: just do global replace since these are specific tailwind classes.

  for (const [key, value] of Object.entries(replacements)) {
    // Regex to match the class exactly, preceded by space/quote and followed by space/quote
    const regex = new RegExp(`(?<=["'\\s])${key.replace(/\//g, '\\/')}(?=["'\\s])`, 'g');
    content = content.replace(regex, value);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

directories.forEach(walkDir);
console.log('Done!');

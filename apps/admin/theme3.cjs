const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components'),
  path.join(__dirname, 'src', 'layouts')
];

const replacements = {
  // Indigo variants
  'text-indigo-600': 'text-[#8a6d1c]',
  'text-indigo-500': 'text-[#8a6d1c]',
  'text-indigo-700': 'text-[#3a2012]',
  'text-indigo-100': 'text-[#ebdcb8]',
  'text-indigo-200': 'text-[#d4c3a3]',
  'text-indigo-300': 'text-[#c2b192]',
  'bg-indigo-600': 'bg-[#3a2012]',
  'bg-indigo-50': 'bg-[#ebdcb8]',
  'bg-indigo-100': 'bg-[#d4c3a3]',
  'bg-indigo-500/50': 'bg-[#8a6d1c]/50',
  'bg-indigo-500/20': 'bg-[#8a6d1c]/20',
  'bg-indigo-900/50': 'bg-[#2a160b]/50',
  'bg-indigo-700': 'bg-[#2a160b]',
  'border-indigo-600': 'border-[#8a6d1c]',
  'border-indigo-400/50': 'border-[#8a6d1c]/50',
  'shadow-indigo-200': 'shadow-[#3a2012]/30',
  'shadow-indigo-600/20': 'shadow-[#3a2012]/20',
  'hover:text-indigo-600': 'hover:text-[#8a6d1c]',
  'hover:bg-indigo-700': 'hover:bg-[#2a160b]',
  'hover:bg-indigo-100': 'hover:bg-[#d4c3a3]',
  'ring-indigo-600/20': 'ring-[#8a6d1c]/20',
  'focus:border-indigo-600': 'focus:border-[#8a6d1c]',
  'focus:ring-indigo-600/20': 'focus:ring-[#8a6d1c]/20',
  'fill-indigo-600': 'fill-[#8a6d1c]',
  
  // Other remnants
  'text-amber-500': 'text-[#8a6d1c]',
  'text-amber-300': 'text-[#d4af37]',
  'fill-amber-500': 'fill-[#8a6d1c]',
  'bg-slate-50/80': 'bg-[#ebdcb8]/80'
};

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [key, value] of Object.entries(replacements)) {
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

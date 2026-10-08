const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components'),
  path.join(__dirname, 'src', 'layouts')
];

const replacements = {
  // Catch missed text-primary, bg-primary, etc with hover/focus states
  'group-hover:text-primary': 'group-hover:text-[#8a6d1c]',
  'hover:text-primary': 'hover:text-[#8a6d1c]',
  'hover:border-primary': 'hover:border-[#8a6d1c]',
  'bg-primary/50': 'bg-[#8a6d1c]/50',
  'divide-slate-200': 'divide-[#d4c3a3]',
  'hover:bg-slate-50/80': 'hover:bg-[#ebdcb8]/80',
  'hover:bg-slate-100/50': 'hover:bg-[#e6ddc5]/50',
  'bg-slate-50/50': 'bg-[#ebdcb8]/50',
  'bg-slate-900/50': 'bg-[#2a160b]/50',
  'bg-slate-800': 'bg-[#3a2012]',
  'hover:bg-slate-700': 'hover:bg-[#2a160b]',
  'text-slate-300': 'text-[#d4c3a3]',
  'text-slate-200': 'text-[#ebdcb8]',
  
  // Badges and statuses
  'bg-emerald-50 text-emerald-700 border-emerald-200': 'bg-emerald-100/50 text-emerald-800 border-emerald-300',
  'bg-amber-50 text-amber-700 border-amber-200': 'bg-amber-100/50 text-amber-800 border-amber-300',
  'bg-blue-50 text-blue-700 border-blue-200': 'bg-blue-100/50 text-blue-800 border-blue-300',

  // Pagination buttons
  'disabled:opacity-50 disabled:cursor-not-allowed': 'disabled:opacity-50 disabled:cursor-not-allowed', // just keeping it safe
  
  // Modal / overlays
  'bg-black/50': 'bg-[#2a160b]/70',
  
  // A few more slate missed ones
  'border-slate-50': 'border-[#ebdcb8]',
  'ring-slate-200': 'ring-[#d4c3a3]',
  'focus:ring-slate-200': 'focus:ring-[#d4c3a3]',
  
  // For safety, generic ones
  'text-primary': 'text-[#8a6d1c]',
  'bg-primary': 'bg-[#3a2012]'
};

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [key, value] of Object.entries(replacements)) {
    // Regex to match exact tokens
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

/**
 * dev-all.mjs
 * Menjalankan seluruh layanan BacaYuk secara bersamaan:
 *   1. Backend API Server (Express + MySQL)  -> port 5000
 *   2. Portal Admin (Vite + React)           -> port 5173
 *   3. Aplikasi Siswa / Mobile (Expo)        -> port 8082
 *   4. Dev Proxy Satu Origin                 -> port 8081
 */

import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import readline from 'node:readline';

const ROOT_DIR = process.cwd();
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

// Fungsi otomatis membebaskan port yang masih menggantung dari sesi sebelumnya
function freePort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const lines = output.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(Number(pid)) && Number(pid) !== process.pid) {
          try {
            execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
          } catch {}
        }
      }
    }
  } catch {
    // Port aman / tidak sedang digunakan
  }
}

// Cek apakah node_modules sudah diinstall
const rootNodeModules = path.join(ROOT_DIR, 'node_modules');
if (!fs.existsSync(rootNodeModules)) {
  console.error('\n' + colors.red + '❌ PERINGATAN: Dependensi belum terinstall! Jalankan: npm install' + colors.reset + '\n');
  process.exit(1);
}

// Bebaskan semua port sebelum memulai agar tidak terjadi EADDRINUSE
const PORTS_TO_CLEAN = [8081, 8082, 5173, 5000];
for (const p of PORTS_TO_CLEAN) {
  freePort(p);
}

const services = [
  {
    name: 'SERVER',
    color: colors.cyan,
    cwd: path.join(ROOT_DIR, 'apps', 'server'),
    command: 'npm run dev',
  },
  {
    name: 'ADMIN ',
    color: colors.green,
    cwd: path.join(ROOT_DIR, 'apps', 'admin'),
    command: 'npm run dev',
  },
  {
    name: 'MOBILE',
    color: colors.magenta,
    cwd: path.join(ROOT_DIR, 'apps', 'mobile'),
    command: 'npm run start -- --port 8082',
  },
  {
    name: 'PROXY ',
    color: colors.yellow,
    cwd: ROOT_DIR,
    command: 'node scripts/dev-proxy.mjs',
  },
];

console.clear();
console.log('\n' + colors.bright + colors.blue + '╔════════════════════════════════════════════════════════════════════════╗' + colors.reset);
console.log(colors.bright + colors.blue + '║' + colors.reset + colors.bright + '                     📚 BACAYUK — DEVELOPMENT SERVER                    ' + colors.reset + colors.blue + '║' + colors.reset);
console.log(colors.blue + '╚════════════════════════════════════════════════════════════════════════╝' + colors.reset);
console.log('');
console.log(`  📱 ${colors.bright}Aplikasi Siswa (Web)${colors.reset}    :  ${colors.bright}${colors.yellow}http://localhost:8081${colors.reset}`);
console.log(`  👑 ${colors.bright}Portal Admin${colors.reset}            :  ${colors.bright}${colors.green}http://localhost:8081/admin${colors.reset}`);
console.log(`  ⚙️  ${colors.bright}Backend REST API${colors.reset}        :  ${colors.cyan}http://localhost:8081/api${colors.reset}`);
console.log('');
console.log(colors.blue + '──────────────────────────────────────────────────────────────────────────' + colors.reset);
console.log(`  💡 ${colors.bright}Buka browser di:${colors.reset} ${colors.yellow}http://localhost:8081${colors.reset}`);
console.log(`  💡 ${colors.gray}Tekan Ctrl + C untuk menghentikan seluruh layanan.${colors.reset}`);
if (!isVerbose) {
  console.log(`  💡 ${colors.gray}(Log detail disembunyikan. Jalankan 'npm run dev -- --verbose' untuk melihat log lengkap)${colors.reset}\n`);
} else {
  console.log(`  💡 ${colors.cyan}(Mode Verbose aktif: seluruh log sub-layanan ditampilkan)${colors.reset}\n`);
}

const activeProcesses = [];
let isShuttingDown = false;

function cleanKill(child) {
  if (!child || !child.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(-child.pid, 'SIGTERM');
    }
  } catch {
    // Process already exited
  }
}

function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n' + colors.yellow + '⏳ Menghentikan seluruh layanan...' + colors.reset);
  for (const proc of activeProcesses) {
    cleanKill(proc);
  }
  for (const p of PORTS_TO_CLEAN) {
    freePort(p);
  }
  console.log(colors.green + '✅ Seluruh layanan berhasil dihentikan.\n' + colors.reset);
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', () => {
  for (const proc of activeProcesses) {
    cleanKill(proc);
  }
});

function startService(svc) {
  if (isShuttingDown) return;

  const child = spawn(svc.command, {
    cwd: svc.cwd || ROOT_DIR,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  activeProcesses.push(child);

  const prefix = `${svc.color}[${svc.name}]${colors.reset} `;

  if (child.stdout) {
    const rlOut = readline.createInterface({ input: child.stdout });
    rlOut.on('line', (line) => {
      if (isVerbose) {
        console.log(`${prefix}${line}`);
      }
    });
  }

  if (child.stderr) {
    const rlErr = readline.createInterface({ input: child.stderr });
    rlErr.on('line', (line) => {
      if (isVerbose) {
        console.error(`${prefix}${line}`);
      }
    });
  }

  child.on('close', (code) => {
    const idx = activeProcesses.indexOf(child);
    if (idx !== -1) activeProcesses.splice(idx, 1);

    if (!isShuttingDown && code !== 0 && code !== null) {
      console.log(`${prefix}${colors.red}Layanan terhenti (kode: ${code}). Memulai ulang otomatis dalam 1.5 detik...${colors.reset}`);
      setTimeout(() => {
        if (!isShuttingDown) {
          startService(svc);
        }
      }, 1500);
    }
  });

  child.on('error', (err) => {
    console.error(`${prefix}${colors.red}Gagal menjalankan: ${err.message}${colors.reset}`);
  });
}

for (const svc of services) {
  startService(svc);
}


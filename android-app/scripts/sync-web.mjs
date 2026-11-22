// Copies the built web app from the repository root into android-app/www,
// ready for "cap sync". Run `python3 dev/build.py` first if you changed dev/app.html.
import { cpSync, rmSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const www = join(here, '..', 'www');

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });

for (const f of ['index.html', 'sw.js', 'manifest.webmanifest']) cpSync(join(root, f), join(www, f));
for (const d of ['icons', 'vendor', 'audio']) cpSync(join(root, d), join(www, d), { recursive: true });

if (!existsSync(join(www, 'audio')) || readdirSync(join(www, 'audio')).length === 0) {
  console.warn('WARNING: audio/ is empty. Copy the MP3s from audio_backup/ into audio/ before building the APK.');
}
console.log('Web app copied to android-app/www');

// Builds an APK with the Gradle wrapper that Capacitor generated.
// Usage: node scripts/build-apk.mjs debug|release
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2] === 'release' ? 'release' : 'debug';
const here = dirname(fileURLToPath(import.meta.url));
const androidDir = join(here, '..', 'android');
const gradle = join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');

if (!existsSync(gradle)) { console.error('android/ project not found. Run "npx cap add android" first.'); process.exit(1); }
if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT && !existsSync(join(androidDir, 'local.properties'))) {
  console.error('Android SDK not found. Set ANDROID_HOME (for example ~/Android/Sdk) or create android/local.properties with sdk.dir=...'); process.exit(1);
}
const task = mode === 'release' ? 'assembleRelease' : 'assembleDebug';
const r = spawnSync(gradle, [task], { cwd: androidDir, stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status || 1);

const outDir = join(androidDir, 'app', 'build', 'outputs', 'apk', mode);
const apk = readdirSync(outDir).find(f => f.endsWith('.apk'));
if (!apk) { console.error('Build finished but no APK was found in ' + outDir); process.exit(1); }
const dist = join(here, '..', 'dist');
mkdirSync(dist, { recursive: true });
const dest = join(dist, mode === 'release' ? 'keralaravam-release.apk' : 'keralaravam-debug.apk');
copyFileSync(join(outDir, apk), dest);
console.log('\nAPK ready: ' + dest);

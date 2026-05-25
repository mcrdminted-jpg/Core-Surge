const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const entriesToCopy = [
  'index.html',
  'manifest.webmanifest',
  'service-worker.js',
  'README.md',
  'css',
  'js',
  'assets'
];

async function copyEntry(entry) {
  const source = path.join(root, entry);
  const target = path.join(dist, entry);
  await fs.cp(source, target, { recursive: true });
}

async function main() {
  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(dist, { recursive: true });

  for (const entry of entriesToCopy) {
    await copyEntry(entry);
  }

  console.log(`Build complete: ${entriesToCopy.length} entries copied to ${dist}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

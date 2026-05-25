const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const jsDir = path.join(root, 'js');

async function getFiles(dir, ext, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await getFiles(fullPath, ext, files);
      continue;
    }
    if (fullPath.endsWith(ext)) files.push(fullPath);
  }
  return files;
}

async function parseJavaScript(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  new vm.Script(source, { filename: filePath });
}

async function validateIndexReferences() {
  const indexPath = path.join(root, 'index.html');
  const html = await fs.readFile(indexPath, 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((ref) => !ref.startsWith('http') && !ref.startsWith('data:') && !ref.startsWith('#'));

  for (const ref of refs) {
    const target = path.join(root, ref.replace(/^\.\//, ''));
    await fs.access(target);
  }
  return refs.length;
}

async function validateManifest() {
  const manifestPath = path.join(root, 'manifest.webmanifest');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
    throw new Error('manifest.webmanifest must declare at least one icon');
  }
  for (const icon of manifest.icons) {
    await fs.access(path.join(root, icon.src));
  }
}

async function main() {
  const jsFiles = await getFiles(jsDir, '.js');
  jsFiles.push(path.join(root, 'service-worker.js'));

  for (const filePath of jsFiles) {
    await parseJavaScript(filePath);
  }

  const refCount = await validateIndexReferences();
  await validateManifest();

  console.log(`Typecheck passed: ${jsFiles.length} JS files parsed, ${refCount} HTML references verified.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

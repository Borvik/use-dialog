const path = require('path');
const fs = require('fs');
const url = require('url');
const sass = require('sass');
const mkdirp = require('mkdirp');

const rootFolder = path.join(__dirname, '..');
const distFolder = path.join(rootFolder, 'dist');
const rawFile = 'src/library/index.scss';
const actualFile = path.join(rootFolder, rawFile);
const outFile = path.join(rootFolder, 'dist/style.css');
const nodeModulesFolder = path.join(rootFolder, 'node_modules');

if (!fs.existsSync(actualFile)) {
  console.log('No css to build');
  process.exit(0);
}

console.log('Building css');
mkdirp.sync(distFolder);
const sassResult = sass.compile(actualFile, {
  style: 'expanded',
  sourceMap: true,
  loadPaths: [
    nodeModulesFolder,
  ]
});

if (sassResult.sourceMap) {
  const smComment = `/*# sourceMappingURL=style.css.map */`
  fs.writeFileSync(outFile, sassResult.css + "\n\n" + smComment);
  sassResult.sourceMap.sources = sassResult.sourceMap.sources.map(filePath => {
    let parsed = url.fileURLToPath(filePath);
    return path.relative(distFolder, parsed)
      .split(path.sep).join(path.posix.sep);
  });
  sassResult.sourceMap.file = 'style.css';
  fs.writeFileSync(outFile + '.map', JSON.stringify(sassResult.sourceMap));
} else {
  fs.writeFileSync(outFile, sassResult.css);
}

console.log('  ...completed');
process.exit(0);
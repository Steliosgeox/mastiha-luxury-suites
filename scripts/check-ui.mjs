import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import postcss from 'postcss';
const errors = [];
function walk(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
for (const filename of walk('src').filter(f => /\.tsx?$/.test(f))) {
  const source = ts.createSourceFile(filename, fs.readFileSync(filename,'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const modules = new Map();
  for (const node of source.statements) if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text.endsWith('.module.css') && node.importClause?.name) {
    const cssFile = path.resolve(path.dirname(filename), node.moduleSpecifier.text);
    const selectors = new Set();
    postcss.parse(fs.readFileSync(cssFile,'utf8'), {from:cssFile}).walkRules(rule => { for (const match of rule.selector.matchAll(/\.([a-zA-Z_][\w-]*)/g)) selectors.add(match[1]); });
    modules.set(node.importClause.name.text, selectors);
  }
  function visit(node) {
    if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) {
      const selectors = modules.get(node.expression.text);
      if (selectors && !selectors.has(node.name.text)) errors.push(`${filename}: missing CSS class ${node.expression.text}.${node.name.text}`);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
for (const file of ['hero.webp','living-room.webp','master-bedroom.webp','second-bedroom.webp','bathroom.webp']) if (!fs.existsSync(`public/photography/${file}`)) errors.push(`Missing photograph: ${file}`);
const manifest = JSON.parse(fs.readFileSync('public/sequence/sequence-manifest.json','utf8'));
for (const type of ['desktop','mobile']) for (let i=1;i<=manifest[type].frameCount;i++) {
  const file = `public${manifest[type].basePath}/frame-${String(i).padStart(4,'0')}.avif`;
  if (!fs.existsSync(file)) errors.push(`Missing film frame: ${file}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('All referenced CSS-module classes, property photographs and declared film frames exist.');

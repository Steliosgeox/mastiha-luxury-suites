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

const photos=JSON.parse(fs.readFileSync('src/content/stay-media.generated.json','utf8'));
const hashes=new Set();
for(const photo of photos){
 // Only Mastiha Luxury Suites' own listings: Airbnb 1368953469779774276 and Booking.com /hotel/gr/mastiha-luxury-suites.
 const ownAirbnb=photo.source?.platform==='Airbnb'&&photo.source.listingId==='1368953469779774276'&&/^https:\/\/a0\.muscache\.com\/im\/pictures\/(hosting|miso)\/Hosting-(1368953469779774276|U3RheVN1cHBseUxpc3Rpbmc6MTM2ODk1MzQ2OTc3OTc3NDI3Ng==)\/original\//.test(photo.source.url);
 const ownBooking=photo.source?.platform==='Booking.com'&&photo.source.listingId==='mastiha-luxury-suites'&&/^https:\/\/www\.booking\.com\/hotel\/gr\/mastiha-luxury-suites\.html$/.test(photo.source.page)&&/^https:\/\/cf\.bstatic\.com\/xdata\/images\/hotel\//.test(photo.source.url);
 if(!photo.source?.originalSha256||!(ownAirbnb||ownBooking))errors.push(`Photograph not from our own listing: ${photo.id}`);
 if(hashes.has(photo.source.webpSha256))errors.push(`Duplicate photograph: ${photo.id}`);
 hashes.add(photo.source.webpSha256);
 for(const url of [photo.src,photo.thumbnail,...photo.srcSet.map(i=>i.src)])if(!/^\/photography\/(airbnb|booking)\//.test(url)||!fs.existsSync('public'+url))errors.push(`Missing true photo: ${url}`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`CSS references and all variants of ${photos.length} real listing photographs passed.`);

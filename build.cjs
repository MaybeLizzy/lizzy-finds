const fs = require('fs'), path = require('path');
const root = __dirname, output = path.resolve(root, 'dist');
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Invalid build directory');
fs.rmSync(output, {recursive:true, force:true});
fs.mkdirSync(output, {recursive:true});
function copy(src,dest){if(fs.statSync(src).isDirectory()){fs.mkdirSync(dest,{recursive:true});for(const entry of fs.readdirSync(src))copy(path.join(src,entry),path.join(dest,entry));}else fs.copyFileSync(src,dest);}
for (const name of ['index.html','assets','content','recommendations','finds','privacy','affiliate-disclosure','contact']) copy(path.join(root,name),path.join(output,name));
const base = 'https://maybelizzy.github.io/lizzy-finds/';
const routes = ['','recommendations/','recommendations/shokz-running-headphones/','finds/','privacy/','affiliate-disclosure/'];
for (const route of routes) {
 const file=path.join(output,route,'index.html');
 const html=fs.readFileSync(file,'utf8').replace(/<link\b[^>]*rel="canonical"[^>]*>/g,'');
 fs.writeFileSync(file,html.replace('</head>',`<link rel="canonical" href="${base+route}"></head>`));
}
for (const [from,to] of [['guides/','../recommendations/'],['guides/shokz-running-headphones/','../../recommendations/shokz-running-headphones/']]) {
 const dir=path.join(output,from);fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${to}"><meta name="robots" content="noindex"><title>Lizzy Finds — Page moved</title></head><body><a href="${to}">Continue to Recommendations</a></body></html>`);
}
fs.writeFileSync(path.join(output,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(r=>`<url><loc>${base+r}</loc></url>`).join('')+'</urlset>\n');
fs.writeFileSync(path.join(output,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${base}sitemap.xml\n`);
fs.writeFileSync(path.join(output,'.nojekyll'),'');
require('./add-analytics.cjs')(output);
console.log('Built refreshed Lizzy Finds with canonical pages, sitemap and legacy Shokz redirects.');

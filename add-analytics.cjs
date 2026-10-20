const fs = require('fs');
const path = require('path');
const tag = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3L5FZ73L8T"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-3L5FZ73L8T');
</script>`;
function install(dir) {
  for (const item of fs.readdirSync(dir, {withFileTypes:true})) {
    if (['.git','node_modules','dist'].includes(item.name)) continue;
    const file = path.join(dir,item.name);
    if (item.isDirectory()) install(file);
    else if (item.name.endsWith('.html')) {
      const html = fs.readFileSync(file,'utf8');
      if (!html.includes('googletagmanager.com/gtag/js')) fs.writeFileSync(file,html.replace('<head>','<head>\n'+tag+'\n'));
    }
  }
}
if (require.main === module) {
  install(__dirname);
  const file = path.join(__dirname,'privacy/index.html');
  let html = fs.readFileSync(file,'utf8');
  html = html.replace('This local version has no accounts, analytics, contact forms, advertising scripts, cookies, or browser storage.', 'This website uses Google Analytics 4 to measure page views, traffic sources, and interactions such as outbound link clicks. Google Analytics may use cookies and collect browser, device, and usage information. Learn more at <a href="https://policies.google.com/technologies/partner-sites">Google privacy information for partner sites</a>. You can manage cookies in your browser or use the <a href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out browser add-on</a>. This website has no user accounts or contact forms.');
  html = html.replace('contact the email above. Updated October 19, 2026.', 'contact wanghz0512@gmail.com. Updated October 20, 2026.');
  fs.writeFileSync(file,html);
}
module.exports = install;

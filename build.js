const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const siteSlug = pkg.siteSlug || 'unknown';

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Load analytics snippet for head injection
const analyticsPath = path.join(__dirname, 'vendor', 'integralthemes', 'components', 'analytics.html');
let analyticsHtml = '';
if (fs.existsSync(analyticsPath)) {
  analyticsHtml = fs.readFileSync(analyticsPath, 'utf8');
  console.log(`✓ Loaded analytics snippet for injection`);
}

// Copy HTML files and inject analytics
const htmlFiles = ['index.html'];
htmlFiles.forEach(file => {
  const srcPath = path.join(__dirname, 'src', file);
  const destPath = path.join(distDir, file);
  if (fs.existsSync(srcPath)) {
    let htmlContent = fs.readFileSync(srcPath, 'utf8');
    if (analyticsHtml) {
      const siteNameScript = `<script>window.IE_SITE_NAME = '${siteSlug}';</script>`;
      htmlContent = htmlContent.replace('</head>', `${siteNameScript}\n${analyticsHtml}\n</head>`);
    }
    fs.writeFileSync(destPath, htmlContent, 'utf8');
    console.log(`✓ Copied ${file}${analyticsHtml ? ' (analytics)' : ''}`);
  }
});

// Copy CSS files
const cssDir = path.join(distDir, 'css');
if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}
const cssFiles = fs.readdirSync(path.join(__dirname, 'src', 'css'));
cssFiles.forEach(file => {
  const srcPath = path.join(__dirname, 'src', 'css', file);
  const destPath = path.join(cssDir, file);
  fs.copyFileSync(srcPath, destPath);
  console.log(`✓ Copied css/${file}`);
});

// Copy JS files
const jsDir = path.join(distDir, 'js');
if (!fs.existsSync(jsDir)) {
  fs.mkdirSync(jsDir, { recursive: true });
}
const jsFiles = fs.readdirSync(path.join(__dirname, 'src', 'js'));
jsFiles.forEach(file => {
  const srcPath = path.join(__dirname, 'src', 'js', file);
  const destPath = path.join(jsDir, file);
  fs.copyFileSync(srcPath, destPath);
  console.log(`✓ Copied js/${file}`);
});

// Copy assets if they exist
const assetsDir = path.join(__dirname, 'src', 'assets');
if (fs.existsSync(assetsDir)) {
  const destAssetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(destAssetsDir)) {
    fs.mkdirSync(destAssetsDir, { recursive: true });
  }

  // Recursively copy assets
  function copyRecursive(src, dest) {
    const items = fs.readdirSync(src);
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath);
      } else if (stat.isFile()) {
        fs.copyFileSync(srcPath, destPath);
        const relativePath = path.relative(path.join(__dirname, 'src'), srcPath);
        console.log(`✓ Copied ${relativePath}`);
      }
    });
  }

  copyRecursive(assetsDir, destAssetsDir);
}

// Copy vendor directory (integralthemes)
const vendorDir = path.join(__dirname, 'vendor');
if (fs.existsSync(vendorDir)) {
  const destVendorDir = path.join(distDir, 'vendor');
  if (!fs.existsSync(destVendorDir)) {
    fs.mkdirSync(destVendorDir, { recursive: true });
  }

  // Recursively copy vendor
  function copyRecursive(src, dest) {
    const items = fs.readdirSync(src);
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyRecursive(srcPath, destPath);
      } else if (stat.isFile()) {
        fs.copyFileSync(srcPath, destPath);
        const relativePath = path.relative(__dirname, srcPath);
        console.log(`✓ Copied ${relativePath}`);
      }
    });
  }

  copyRecursive(vendorDir, destVendorDir);
}

console.log('\n✅ Build completed successfully!');
console.log(`📦 Output directory: ${distDir}`);

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Tracking codes to inject in <head> (GTM + Meta Pixel + Google Analytics + Pinterest)
const headTrackingCode = `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TGL44PCH');</script>
<!-- End Google Tag Manager -->

<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '711877271388655');
fbq('track', 'PageView');
</script>
<noscript>
<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=711877271388655&ev=PageView&noscript=1"/>
</noscript>
<!-- End Meta Pixel Code -->

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XCQ9SS9CKX"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-XCQ9SS9CKX');
</script>
<!-- End Google tag -->

<!-- Pinterest Tag -->
<script>
!function(e){if(!window.pintrk){window.pintrk = function () {
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
  n=window.pintrk;n.queue=[],n.version="3.0";var
  t=document.createElement("script");t.async=!0,t.src=e;var
  r=document.getElementsByTagName("script")[0];
  r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load', '2612840749742');
pintrk('page');
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt=""
  src="https://ct.pinterest.com/v3/?event=init&tid=2612840749742&noscript=1" />
</noscript>
<!-- End Pinterest Tag -->

<!-- TikTok Pixel Code Start -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

  ttq.load('D468VMBC77U8B5BDQ5L0');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- TikTok Pixel Code End -->
`;

// Tracking codes to inject in <body> (GTM noscript)
const bodyTrackingCode = `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TGL44PCH"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
`;

// Function to inject tracking codes into HTML file
function injectTracking(filePath) {
  try {
    let html = fs.readFileSync(filePath, 'utf8');

    // Check if tracking codes are already injected
    const hasPixel = html.includes('fbevents.js') || html.includes('711877271388655');
    const hasGA = html.includes('gtag.js') || html.includes('G-XCQ9SS9CKX');
    const hasGTM = html.includes('GTM-TGL44PCH') || html.includes('googletagmanager.com/gtm.js');
    const hasPinterest = html.includes('pintrk') || html.includes('2612840749742');
    const hasTikTok = html.includes('TiktokAnalyticsObject') || html.includes('D468VMBC77U8B5BDQ5L0');

    if (hasPixel && hasGA && hasGTM && hasPinterest && hasTikTok) {
      console.log(`✅ All tracking codes already present in: ${filePath}`);
      return;
    }

    // Inject head tracking codes after <head> tag
    html = html.replace(/<head>/i, `<head>${headTrackingCode}`);

    // Inject body tracking codes after <body> tag
    html = html.replace(/<body>/i, `<body>${bodyTrackingCode}`);

    // Write back to file
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ Injected tracking codes (GTM + Meta Pixel + Google Analytics + Pinterest + TikTok) into: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Find all HTML files in dist directory
const distPath = path.join(__dirname, '..', 'dist');
const htmlFiles = glob.sync(`${distPath}/**/*.html`);

console.log(`Found ${htmlFiles.length} HTML files to process...`);

htmlFiles.forEach(injectTracking);

console.log('\n✅ Tracking codes injection complete!');

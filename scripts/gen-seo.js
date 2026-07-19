// SEO/agency-data generator. Run with: node scripts/gen-seo.js
//
// Regenerates: agencies/*.html, sitemap.xml. Also writes grid-fragment.html,
// faq-schema.json, itemlist-schema.json here in scripts/ for manual splicing
// into index.html (the static pre-rendered grid + <head> schema blocks) —
// those three are throwaway intermediates, safe to delete after copying in.
//
// Weekly ratings update workflow: edit the `g:[rating,reviewCount]` values
// below AND the matching `agencies` array in index.html's <script> (both
// need updating — index.html's copy drives the live search/filter UI, this
// file's copy drives the static grid + individual agency pages). Re-run this
// script, then re-splice grid-fragment.html into index.html's #grid.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REVIEWS_CHECKED = "19 Jul 2026";
const SITE = "https://dubairealestatedirectory.com";

// Single source of truth — mirrors the `agencies` array in index.html.
// website: only included where I directly confirmed it via Google Maps research —
// never guessed, to avoid sending readers to a wrong company's site.
const agencies = [
 {slug:"betterhomes", n:"Betterhomes",e:"Est. 1986",d:"One of Dubai's longest-running agencies, covering residential and commercial sales, leasing and property management across the city.",t:["residential","commercial","management"],g:[4.2,965],website:"https://www.bhomes.com/en"},
 {slug:"allsopp-allsopp", n:"Allsopp & Allsopp",e:"Est. 2008",d:"ISO-certified, customer-focused brokerage known for secondary-market sales and leasing in Dubai's family communities.",t:["residential"],g:[4.4,1692],website:"https://www.allsoppandallsopp.com"},
 {slug:"haus-haus", n:"haus & haus",e:"Est. 2013",d:"Award-winning agency offering sales, leasing, property management and holiday homes across Dubai's top communities.",t:["residential","management","luxury"],g:[4.8,2644]},
 {slug:"driven-properties", n:"Driven Properties",e:"Est. 2012",d:"Full-service brokerage and investment advisory headquartered in Downtown Dubai, with international offices and a strong off-plan record.",t:["off-plan","luxury","international","commercial"],g:[4.5,1442]},
 {slug:"ax-capital", n:"AX Capital",e:"Est. 2018",d:"Modern agency focused on luxury property and turnkey investment solutions, known for technology-led service.",t:["luxury","off-plan","international"],g:[4.8,1147],website:"https://www.axcapital.ae"},
 {slug:"espace-real-estate", n:"Espace Real Estate",e:"Est. 2009",d:"Specialists in Dubai's villa communities — Springs, Meadows, Arabian Ranches and Dubai Hills — with a strong sales focus.",t:["residential","luxury"],g:[4.7,1103],website:"https://www.espace.ae"},
 {slug:"metropolitan-premium-properties", n:"Metropolitan Premium Properties",e:"Est. 2008",d:"High-volume brokerage with dedicated off-plan, secondary and luxury divisions and multilingual investor teams.",t:["luxury","off-plan","international"],g:[4.7,647],website:"https://www.metropolitan.realestate"},
 {slug:"provident-estate", n:"Provident Estate",e:"Est. 2008",d:"Established full-service agency covering sales, rentals, off-plan launches and property management.",t:["residential","off-plan","management"],g:[4.6,531],website:"https://www.providentestate.com"},
 {slug:"db-properties", n:"D&B Properties",e:"Est. 2015",d:"Award-winning brokerage spanning residential, commercial and off-plan segments with in-house market research.",t:["residential","commercial","off-plan"],g:[4.9,3516],website:"https://www.dandbdubai.com"},
 {slug:"exclusive-links-real-estate-brokers", n:"Exclusive Links Real Estate Brokers",e:"Est. 2005",d:"Boutique agency with deep market tenure across sales, leasing, property management and holiday homes.",t:["residential","management"],g:[4.8,442]},
 {slug:"aeon-trisl", n:"Aeon & Trisl",e:"Est. 2013",d:"Leading broker for major developers including Emaar, Damac, Nakheel and Sobha, with strength in off-plan sales.",t:["off-plan","international"],g:[4.7,955],website:"https://www.aeontrisl.com"},
 {slug:"xperience-realty", n:"Xperience Realty",e:"Est. 2020",d:"Fast-growing agency recognised among Emaar's top brokers, focused on off-plan and investor sales.",t:["off-plan"],g:[4.9,454],website:"https://www.xrealty.ae"},
 {slug:"engel-volkers-dubai", n:"Engel & Völkers Dubai",e:"Global brand",d:"Dubai arm of the international luxury franchise, specialising in premium residential sales and leasing.",t:["luxury","international","residential"],g:[4.9,177]},
 {slug:"knight-frank-uae", n:"Knight Frank UAE",e:"Global brand",d:"International property consultancy covering prime residential, commercial advisory and valuations in Dubai.",t:["luxury","commercial","international"],g:[3.2,41],website:"https://www.knightfrank.ae"},
 {slug:"savills-dubai", n:"Savills Dubai",e:"Global brand",d:"Global real estate advisor providing residential sales, commercial agency and property management services.",t:["luxury","commercial","international","management"],g:[3.6,242],website:"https://dubai.savills.ae"},
 {slug:"bluechip-real-estate", n:"Bluechip Real Estate",e:"Est. 2005",d:"Long-standing Dubai brokerage committed to transparent transactions across sales and leasing.",t:["residential"],g:[4.8,354],website:"https://www.bluechiphome.com"},
 {slug:"profound-properties", n:"Profound Properties",e:"Est. 2020",d:"Independent Business Bay agency specialising in premium and off-plan property for international investors.",t:["luxury","off-plan","international"],g:[4.6,10],website:"https://www.profoundproperties.com"},
 {slug:"think-realty", n:"Think Realty",e:"Dubai",d:"Property agency offering sales, leasing and comprehensive property management services.",t:["residential","management"],g:[4.8,181],website:"https://www.thinkrealty.ae"},
 {slug:"mccone-properties", n:"McCone Properties",e:"Est. 2014",d:"Community-focused brokerage with specialist teams in Dubai Marina, JVC and emerging districts.",t:["residential"],g:[4.9,1121],website:"https://www.mcconeproperties.com"},
 {slug:"fam-properties", n:"fäm Properties",e:"Est. 2009",d:"One of Dubai's largest tech-enabled brokerages with data-driven pricing via DXBinteract.",t:["residential","off-plan","luxury"],g:[4.9,15258]},
 {slug:"unique-properties", n:"Unique Properties",e:"Est. 2008",d:"High-volume brokerage and repeated top-performer awardee with major developers, strong in off-plan.",t:["off-plan","international"],g:[4.7,328],website:"https://www.uniqueproperties.ae"},
 {slug:"coldwell-banker-uae", n:"Coldwell Banker UAE",e:"Global brand",d:"UAE franchise of the global network, covering residential and commercial brokerage.",t:["residential","commercial","international"],g:[4.5,216]},
 {slug:"asyan-properties", n:"Asyan Properties",e:"Dubai",d:"Investment-focused agency building long-term relationships with property investors across the UAE.",t:["off-plan","international"],g:[4.7,45],website:"https://www.asyanproperties.ae"},
 {slug:"rcapital-real-estate", n:"Rcapital Real Estate",e:"Dubai",d:"Property management specialist also offering sales and leasing for managed residential and commercial buildings.",t:["management","commercial"],g:[4.5,16]},
];

const CSS = `
:root{--midnight:#0B1420;--deep:#122033;--card:#16273D;--gold:#C9A45C;--gold-soft:#E4CD9A;--sand:#F2EDE4;--ink:#E8EDF4;--muted:#8C9AAD;--line:rgba(201,164,92,.22)}
*{margin:0;padding:0;box-sizing:border-box}
body{background:var(--midnight);color:var(--ink);font-family:'Outfit',sans-serif;font-weight:300;line-height:1.7;-webkit-font-smoothing:antialiased}
.wrap{max-width:820px;margin:0 auto;padding:0 20px}
header{padding:18px 0;border-bottom:1px solid var(--line);position:sticky;top:0;background:rgba(11,20,32,.92);backdrop-filter:blur(10px)}
.header-inner{max-width:820px;margin:0 auto;padding:0 20px;display:flex;justify-content:space-between;align-items:center}
.logo{font-family:'Marcellus',serif;font-size:1.1rem;letter-spacing:.06em;color:var(--gold-soft);text-decoration:none}
.back{font-size:.8rem;color:var(--gold);text-decoration:none;letter-spacing:.06em}
main{padding:48px 0 80px}
.eyebrow{font-size:.7rem;letter-spacing:.28em;text-transform:uppercase;color:var(--gold);margin-bottom:16px}
h1{font-family:'Marcellus',serif;font-weight:400;font-size:clamp(1.8rem,4.5vw,2.6rem);color:var(--sand);margin-bottom:6px}
.est{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:20px}
.g-rating{display:flex;align-items:center;gap:6px;font-size:.95rem;color:var(--gold-soft);text-decoration:none;margin-bottom:26px;line-height:1}
.g-rating svg{width:16px;height:16px;color:var(--gold)}
.g-rating b{color:var(--sand);font-weight:500}
.g-rating .g-count{color:var(--muted)}
.lede{font-size:1.02rem;color:var(--muted);max-width:620px;margin-bottom:28px}
.tags{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:34px}
.tag{font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--gold-soft);border:1px solid var(--line);padding:5px 12px;border-radius:2px}
.actions{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:44px}
.btn{display:inline-block;font-size:.82rem;letter-spacing:.1em;text-transform:uppercase;padding:12px 24px;border-radius:2px;text-decoration:none;transition:all .2s}
.btn-gold{background:var(--gold);color:var(--midnight);font-weight:500}
.btn-gold:hover{background:var(--gold-soft)}
.btn-outline{border:1px solid var(--line);color:var(--gold)}
.btn-outline:hover{border-color:var(--gold)}
.notice{background:var(--card);border:1px solid var(--line);border-radius:4px;padding:18px 20px;font-size:.86rem;color:var(--muted)}
.notice a{color:var(--gold)}
footer{border-top:1px solid var(--line);padding:28px 0;font-size:.78rem;color:var(--muted)}
.footer-inner{max-width:820px;margin:0 auto;padding:0 20px}
`;

function starSvg(){
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6z"/></svg>`;
}

function agencyPage(a){
  const gUrl = `https://www.google.com/maps/search/${encodeURIComponent(a.n + ' Dubai real estate')}`;
  const title = `${a.n} — Dubai Real Estate Agency Profile & Reviews`;
  const desc = `${a.n} (${a.e}): ${a.d} Google rating ${a.g[0].toFixed(1)}/5 from ${a.g[1].toLocaleString()} reviews, checked ${REVIEWS_CHECKED}.`;
  const schema = {
    "@context":"https://schema.org",
    "@type":"RealEstateAgent",
    "name":a.n,
    "description":a.d,
    "areaServed":{"@type":"City","name":"Dubai"},
    "aggregateRating":{
      "@type":"AggregateRating",
      "ratingValue":a.g[0],
      "reviewCount":a.g[1],
      "bestRating":5
    },
    ...(a.website?{"sameAs":[a.website]}:{})
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc.replace(/"/g,'&quot;')}">
<meta property="og:title" content="${a.n} — Dubai Real Estate Directory">
<meta property="og:description" content="${desc.replace(/"/g,'&quot;')}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/agencies/${a.slug}.html">
<link rel="canonical" href="${SITE}/agencies/${a.slug}.html">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<style>${CSS}</style>
</head>
<body>
<header>
  <div class="header-inner">
    <a class="logo" href="/">Dubai Real Estate Directory</a>
    <a class="back" href="/">&larr; Back to directory</a>
  </div>
</header>
<main class="wrap">
  <div class="eyebrow">Agency Profile</div>
  <h1>${a.n}</h1>
  <div class="est">${a.e}</div>
  <a class="g-rating" href="${gUrl}" target="_blank" rel="noopener">${starSvg()}<b>${a.g[0].toFixed(1)}</b><span class="g-count">Google &middot; ${a.g[1].toLocaleString()} reviews, checked ${REVIEWS_CHECKED}</span></a>
  <p class="lede">${a.d}</p>
  <div class="tags">${a.t.map(t=>`<span class="tag">${t.replace('-',' ')}</span>`).join('')}</div>
  <div class="actions">
    ${a.website?`<a class="btn btn-gold" href="${a.website}" target="_blank" rel="noopener">Visit official website</a>`:''}
    <a class="btn btn-outline" href="${gUrl}" target="_blank" rel="noopener">View on Google Maps</a>
    <a class="btn btn-outline" href="https://dubailand.gov.ae/en/eservices/licensed-real-estate-brokers/" target="_blank" rel="noopener">Verify RERA registration</a>
  </div>
  <div class="notice">
    Dubai Real Estate Directory is an independent directory and is not affiliated with ${a.n}. Rating shown is ${a.n}'s public Google Maps rating, checked by hand (not a live feed) &mdash; click the rating above to see the current live number on Google. Always verify RERA registration directly with Dubai Land Department before engaging any agency.
  </div>
</main>
<footer>
  <div class="footer-inner">&copy; 2026 Dubai Real Estate Directory. Independent directory &mdash; not affiliated with any agency listed.</div>
</footer>
</body>
</html>
`;
}

// 1. Generate individual agency pages
const agenciesDir = path.join(ROOT, 'agencies');
fs.mkdirSync(agenciesDir, {recursive:true});
for(const a of agencies){
  fs.writeFileSync(path.join(agenciesDir, `${a.slug}.html`), agencyPage(a));
}
console.log(`Generated ${agencies.length} agency pages in /agencies`);

// 2. Generate static grid HTML fragment (for pre-rendering into index.html)
const gridHtml = agencies.map((a,i) => `    <article class="card" style="animation-delay:${Math.min(i*35,350)}ms">
      <div class="card-head">
        <div class="avatar">${a.n.replace(/[&']/g,'').split(/\\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()}</div>
        <div>
          <h3>${a.n}</h3>
          <div class="est">${a.e}</div>
        </div>
      </div>
      <a class="g-rating" href="https://www.google.com/maps/search/${encodeURIComponent(a.n+' Dubai real estate')}" target="_blank" rel="noopener" title="Google rating, checked ${REVIEWS_CHECKED}">${starSvg()}<b>${a.g[0].toFixed(1)}</b><span class="g-count">Google &middot; ${a.g[1].toLocaleString()} reviews</span></a>
      <p>${a.d}</p>
      <div class="tags">${a.t.map(t=>`<span class="tag">${t.replace('-',' ')}</span>`).join('')}</div>
      <a href="/agencies/${a.slug}.html">View agency</a>
    </article>`).join('\n');
fs.writeFileSync(path.join(__dirname, 'grid-fragment.html'), gridHtml);
console.log('Generated grid-fragment.html');

// 3. Generate FAQPage + ItemList JSON-LD
const faq = [
  {q:"Is this directory affiliated with any agency?", a:"No. We're an independent directory — we don't work for or represent any of the agencies listed."},
  {q:"How are agencies selected for the free directory?", a:"Standard listings are curated based on years established, market presence and specialty coverage across Dubai. Standard placement is never paid for and is never reordered by payment."},
  {q:'What exactly does "Featured" mean?', a:"Featured Placement is a clearly labelled paid package: a gold badge, priority position at the top of results, and an enhanced profile. It never replaces or hides Standard listings."},
  {q:"Do you charge visitors anything?", a:"No. Browsing, searching and filtering the directory is free and always will be."},
  {q:"Can I suggest an agency to add?", a:"Yes — email hello@dubairealestatedirectory.com with the agency name and we'll review it for the free directory."},
  {q:"Where do the star ratings come from?", a:"Each agency's rating and review count is its public Google Maps rating, checked by hand roughly once a week — not a live feed. We show Google only."}
];
const faqSchema = {
  "@context":"https://schema.org",
  "@type":"FAQPage",
  "mainEntity":faq.map(f=>({
    "@type":"Question",
    "name":f.q,
    "acceptedAnswer":{"@type":"Answer","text":f.a}
  }))
};
const itemListSchema = {
  "@context":"https://schema.org",
  "@type":"ItemList",
  "itemListElement":agencies.map((a,i)=>({
    "@type":"ListItem",
    "position":i+1,
    "url":`${SITE}/agencies/${a.slug}.html`,
    "name":a.n
  }))
};
fs.writeFileSync(path.join(__dirname, 'faq-schema.json'), JSON.stringify(faqSchema, null, 2));
fs.writeFileSync(path.join(__dirname, 'itemlist-schema.json'), JSON.stringify(itemListSchema, null, 2));
console.log('Generated faq-schema.json and itemlist-schema.json');

// 4. Generate sitemap.xml
const urls = [
  {loc:`${SITE}/`, priority:"1.0"},
  ...agencies.map(a=>({loc:`${SITE}/agencies/${a.slug}.html`, priority:"0.7"}))
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u=>`  <url>\n    <loc>${u.loc}</loc>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log('Generated sitemap.xml');

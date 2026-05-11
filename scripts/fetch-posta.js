const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_URLS = {
  summary: 'https://teruya-dashboard.web.app/data/summary.json',
  funnel: 'https://teruya-dashboard.web.app/data/funnel.json',
  googleAds: 'https://teruya-dashboard.web.app/data/google-ads.json'
};

const outputDir = path.join(__dirname, '../data-snapshots');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          // Some files might not be JSON (like the summary.json bug we found)
          resolve(data); 
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🚀 Iniciando descarga de la "Posta" (Snapshots de BI)...');
  
  for (const [name, url] of Object.entries(DATA_URLS)) {
    console.log(`📥 Descargando ${name}...`);
    const data = await fetchJson(url);
    const fileName = `${name}.json`;
    const filePath = path.join(outputDir, fileName);
    
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Guardado en: ${filePath}`);
  }
  
  console.log('\n✨ Proceso completado. Los datos están listos para ser inyectados en los dashboards.');
}

main().catch(console.error);

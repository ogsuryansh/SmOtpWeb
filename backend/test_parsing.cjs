const https = require('https');

const BASE_URL = 'https://sastaotp.com/stubs/handler_api.php';
const apiKey = 'stp_cfadfb827ce5f1cb871e886173cd9acd3e06ef1a1e2f8911';

async function fetchApi(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: async () => data,
          json: async () => JSON.parse(data)
        });
      });
    }).on('error', reject);
  });
}

const allowedServices = ['tg', 'wa', 'go'];
const SERVICE_NAMES = { tg: 'Telegram', wa: 'WhatsApp', go: 'Google' };

async function test() {
  try {
        const [cRes, pRes] = await Promise.all([
           fetchApi(`${BASE_URL}?api_key=${apiKey}&action=getCountries&format=json`),
           fetchApi(`${BASE_URL}?api_key=${apiKey}&action=getPrices&format=json`)
        ]);
        
        const cData = await cRes.json();
        const pData = await pRes.json();
        
        if (pData.data) {
            const countriesMap = cData.countries || {};
            const pricesData = pData.data || {};
            const formatted = {};
            
            allowedServices.forEach(code => {
               formatted[code] = {
                 code: code,
                 name: SERVICE_NAMES[code] || code.toUpperCase(),
                 price: Infinity,
                 countries: []
               };
            });

            for (const countryId in pricesData) {
                const countryServices = pricesData[countryId];
                let countryInfo = countriesMap[countryId];
                let cName = countryInfo ? countryInfo.eng || countryInfo.name : `Country ${countryId}`;
                let cFlag = countryInfo ? countryInfo.flag : '🌐';
                let cCode = countryId;

                if (countryId === 'any' || countryId === '*') {
                    cName = 'Any Country';
                    cCode = '*';
                    cFlag = '🌐';
                }

                for (const srvCode in countryServices) {
                    if (formatted[srvCode]) {
                        const info = countryServices[srvCode];
                        if (info.count > 0) {
                            formatted[srvCode].countries.push({
                                country_code: cCode,
                                country_name: cName,
                                flag: cFlag,
                                price: info.cost,
                                qty: info.count
                            });
                            
                            if (info.cost < formatted[srvCode].price) {
                                formatted[srvCode].price = info.cost;
                            }
                        }
                    }
                }
            }

            for (const code in formatted) {
                if (formatted[code].price === Infinity) formatted[code].price = 0;
                formatted[code].countries.sort((a, b) => {
                  if (a.country_code === '22') return -1;
                  if (b.country_code === '22') return 1;
                  return a.country_name.localeCompare(b.country_name);
                });
            }

            console.log('Success!', formatted.tg.countries.slice(0, 2));
        } else {
            console.log('pData.data is missing');
        }
  } catch (err) {
      console.error('Error caught:', err);
  }
}

test();

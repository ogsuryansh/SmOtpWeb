import https from 'https';

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
        resolve({status: res.statusCode, data});
      });
    }).on('error', reject);
  });
}

async function fetchUrl(action, extraParams = '') {
  const url = `${BASE_URL}?api_key=${apiKey}&action=${action}${extraParams}&format=json`;
  const response = await fetchApi(url);
  console.log(`\n--- ${action}${extraParams} ---`);
  if (action === 'getPricesV3') {
     console.log(JSON.stringify(JSON.parse(response.data).countries.slice(0, 5), null, 2));
  }
}

async function main() {
  await fetchUrl('getPricesV3', '&service=tg');
}

main();

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

async function main() {
  const url = `${BASE_URL}?api_key=${apiKey}&action=getServicesList&format=json`;
  const response = await fetchApi(url);
  console.log("Status Code:", response.status);
  console.log("Response length:", response.data.length);
  if (response.data.length < 500) {
      console.log("Response text:", response.data);
  } else {
      console.log("Response snippet:", response.data.substring(0, 500));
  }
}

main();

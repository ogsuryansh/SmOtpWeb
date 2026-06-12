const https = require('https');
const BASE_URL = 'https://sastaotp.com/stubs/handler_api.php';
const apiKey = 'stp_cfadfb827ce5f1cb871e886173cd9acd3e06ef1a1e2f8911';
https.get(`${BASE_URL}?api_key=${apiKey}&action=getServicesList&format=json`, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    let json = JSON.parse(data);
    console.log(JSON.stringify(json.services.tg, null, 2));
  });
});

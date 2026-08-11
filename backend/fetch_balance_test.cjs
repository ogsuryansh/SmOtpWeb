const https = require('https');

const apiKey = '38ac895e9a82e976b923e45026a2bdb6';
const url = `https://mxfkruqagyqgvvcwezkx.supabase.co/functions/v1/handler-api?api_key=${apiKey}&action=getBalance`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('API Response:', data);
    if (data.startsWith('ACCESS_BALANCE:')) {
      const balance = parseFloat(data.split(':')[1]);
      console.log(`Balance: ${balance}`);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching balance:', err.message);
});

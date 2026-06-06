import Setting from '../models/Setting.js';
import AuditLog from '../models/AuditLog.js';
import https from 'https';

const BASE_URL = 'https://sastaotp.com/stubs/handler_api.php';

// Helper to get SastaOTP API Key from DB or Env
async function getApiKey() {
  const setting = await Setting.findOne({ key: 'sastaOtpApiKey' });
  return setting ? setting.value : (process.env.SASTA_OTP_API_KEY || '');
}

// Helper to bypass Cloudflare/WAF 403 Forbidden
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

// Helper to log API requests/responses in AuditLogs
async function logApiCall(action, params, response, isMock = false) {
  try {
    await AuditLog.create({
      action: `API_${action.toUpperCase()}`,
      details: {
        params,
        response,
        isMock,
      },
    });
  } catch (err) {
    console.error('Audit logging failed:', err);
  }
}

// -----------------------------------------------------------------------------
// Mock Data for Simulation Mode
// -----------------------------------------------------------------------------
const MOCK_SERVICES = {
  tg: {
    code: 'tg',
    name: 'Telegram',
    logo: 'https://sastaotp.com/assets/logos/tg.png',
    price: 15.00,
    currency: 'INR',
    available: 1250,
    multi_sms: false,
    expires_in: 1200,
    countries: [
      { country_code: '22', country_name: 'India', flag: '🇮🇳', price: 15.00, qty: 350 },
      { country_code: '187', country_name: 'USA', flag: '🇺🇸', price: 25.00, qty: 120 },
      { country_code: '16', country_name: 'UK', flag: '🇬🇧', price: 20.00, qty: 80 }
    ]
  },
  wa: {
    code: 'wa',
    name: 'WhatsApp',
    logo: 'https://sastaotp.com/assets/logos/wa.png',
    price: 18.00,
    currency: 'INR',
    available: 2400,
    multi_sms: true,
    expires_in: 1200,
    countries: [
      { country_code: '22', country_name: 'India', flag: '🇮🇳', price: 18.00, qty: 850 },
      { country_code: '0', country_name: 'Russia', flag: '🇷🇺', price: 12.00, qty: 400 },
      { country_code: '6', country_name: 'Indonesia', flag: '🇮🇩', price: 10.00, qty: 230 }
    ]
  },
  go: {
    code: 'go',
    name: 'Google',
    logo: 'https://sastaotp.com/assets/logos/go.png',
    price: 8.00,
    currency: 'INR',
    available: 5400,
    multi_sms: false,
    expires_in: 1200,
    countries: [
      { country_code: '22', country_name: 'India', flag: '🇮🇳', price: 8.00, qty: 1500 },
      { country_code: '187', country_name: 'USA', flag: '🇺🇸', price: 12.00, qty: 600 }
    ]
  }
};

const mockActivations = new Map(); // Store simulated orders in memory

export const sastaOtpService = {
  // Check if API is in Mock Mode
  async isMockMode() {
    const key = await getApiKey();
    return !key || key.trim() === '' || key.trim().toLowerCase() === 'mock';
  },

  // Get Balance
  async getBalance() {
    const isMock = await this.isMockMode();
    if (isMock) {
      const response = { status: 'OK', balance: 750.45, currency: 'INR', isMock: true };
      await logApiCall('getBalance', {}, response, true);
      return response;
    }

    const apiKey = await getApiKey();
    try {
      const url = `${BASE_URL}?api_key=${apiKey}&action=getBalance&format=json`;
      const res = await fetchApi(url);
      const data = await res.json();
      await logApiCall('getBalance', {}, data, false);
      return data;
    } catch (err) {
      console.error('SastaOTP API getBalance error, falling back to mock:', err.message);
      return { status: 'OK', balance: 0.00, currency: 'INR', error: err.message, isMock: true };
    }
  },

  // Get Services List
  async getServicesList(serviceCode = '') {
    const isMock = await this.isMockMode();
    if (isMock) {
      let filtered = MOCK_SERVICES;
      if (serviceCode) {
        filtered = MOCK_SERVICES[serviceCode] ? { [serviceCode]: MOCK_SERVICES[serviceCode] } : {};
      }
      return { status: 'OK', services: filtered, isMock: true };
    }

    const apiKey = await getApiKey();
    try {
      // 1. Fetch Countries list (works)
      const countriesUrl = `${BASE_URL}?api_key=${apiKey}&action=getCountries&format=json`;
      const countriesRes = await fetchApi(countriesUrl);
      const countriesData = await countriesRes.json();
      
      if (countriesData.status === 'ERROR') {
        throw new Error(`SastaOTP getCountries error: ${countriesData.message || countriesData.error || 'Unknown'}`);
      }

      // 2. Fetch Prices (works)
      let pricesUrl = `${BASE_URL}?api_key=${apiKey}&action=getPrices&format=json`;
      if (serviceCode) {
        pricesUrl = `${BASE_URL}?api_key=${apiKey}&action=getPrices&service=${serviceCode}&format=json`;
      }
      
      const pricesRes = await fetchApi(pricesUrl);
      const pricesData = await pricesRes.json();
      
      if (pricesData.status === 'ERROR') {
        throw new Error(`SastaOTP getPrices error: ${pricesData.message || pricesData.error || 'Unknown'}`);
      }

      const countriesMap = countriesData.countries || {};
      const pricesMap = pricesData.data || pricesData || {};
      
      // We will construct the expected services object
      const services = {};
      
      const allowedServices = ['tg', 'wa', 'go', 'ig', 'fb', 'tw', 'nf', 'az', 'tk', 'ds', 'ub', 'tb', 'vk', 'mm', 'lf', 'vi', 'sn', 'ok', 'yl', 'mb', 'we', 'qq', 'bl', 'dr'];
      
      const SERVICE_NAMES = {
        tg: 'Telegram', wa: 'WhatsApp', go: 'Google / Gmail', ig: 'Instagram', fb: 'Facebook', tw: 'Twitter / X', 
        nf: 'Netflix', az: 'Amazon', tk: 'TikTok', ds: 'Discord', ub: 'Uber', tb: 'Taobao', vk: 'VKontakte', 
        mm: 'WeChat', lf: 'Line', vi: 'Viber', sn: 'Snapchat', ok: 'Odnoklassniki', yl: 'Yandex', mb: 'Yahoo', 
        we: 'Weibo', qq: 'QQ', bl: 'Bigo Live', dr: 'Tinder',
      };

      for (const countryId in pricesMap) {
        const countryPrices = pricesMap[countryId];
        
        for (const code in countryPrices) {
          if (!allowedServices.includes(code.toLowerCase())) continue;
          if (serviceCode && code !== serviceCode) continue;

          const servicePriceInfo = countryPrices[code];
          
          if (!services[code]) {
            services[code] = {
              code: code,
              name: SERVICE_NAMES[code] || code.toUpperCase(),
              price: servicePriceInfo.cost, // base price reference
              countries: []
            };
          }

          if (servicePriceInfo.count > 0) {
            const countryInfo = countriesMap[countryId];
            let countryName = countryInfo?.name || `Country ${countryId}`;
            let countryCodeVal = countryInfo?.code || countryId;
            let countryFlag = countryInfo?.flag || '🌐';

            if (countryId === '*') {
              countryName = 'Any Country';
              countryCodeVal = '*';
              countryFlag = '🌐';
            }

            // check if country already added to this service
            if (!services[code].countries.find(c => c.country_code === countryCodeVal)) {
               services[code].countries.push({
                 country_code: countryCodeVal,
                 country_name: countryName,
                 flag: countryFlag,
                 price: servicePriceInfo.cost,
                 qty: servicePriceInfo.count
               });
            }
          }
        }
      }

      // Sort countries for each service (India '22' first, then alphabetical)
      for (const code in services) {
        services[code].countries.sort((a, b) => {
          if (a.country_code === '22') return -1;
          if (b.country_code === '22') return 1;
          return a.country_name.localeCompare(b.country_name);
        });
      }

      return { status: 'OK', services, isMock: false };
    } catch (err) {
      console.error('SastaOTP API error, falling back to mock:', err.message);
      let filtered = MOCK_SERVICES;
      if (serviceCode) {
        filtered = MOCK_SERVICES[serviceCode] ? { [serviceCode]: MOCK_SERVICES[serviceCode] } : {};
      }
      return { status: 'OK', services: filtered, isMock: true };
    }
  },

  // Get Countries List
  async getCountries() {
    const isMock = await this.isMockMode();
    if (isMock) {
      return {
        status: 'OK',
        countries: [
          { id: 22, eng: 'India', code: '22' },
          { id: 187, eng: 'USA', code: '187' },
          { id: 16, eng: 'UK', code: '16' },
          { id: 0, eng: 'Russia', code: '0' },
          { id: 6, eng: 'Indonesia', code: '6' }
        ],
        isMock: true,
      };
    }

    const apiKey = await getApiKey();
    try {
      const url = `${BASE_URL}?api_key=${apiKey}&action=getCountries&format=json`;
      const res = await fetchApi(url);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('SastaOTP API getCountries error:', err.message);
      return {
        status: 'OK',
        countries: [
          { id: 22, eng: 'India', code: '22' },
          { id: 187, eng: 'USA', code: '187' }
        ],
        isMock: true,
      };
    }
  },

  // Buy Number (getNumber)
  async getNumber(serviceCode, countryCode = '22', maxPrice = null, multiSms = false) {
    const isMock = await this.isMockMode();
    const params = { service: serviceCode, country: countryCode, maxPrice, multiSms };

    if (isMock) {
      // Find service price
      const service = MOCK_SERVICES[serviceCode] || MOCK_SERVICES['tg'];
      const countryConfig = service.countries.find(c => c.country_code === countryCode) || service.countries[0];
      const price = countryConfig.price;

      if (maxPrice && price > maxPrice) {
        await logApiCall('getNumber', params, { error: 'MAX_PRICE_EXCEEDED' }, true);
        throw new Error('MAX_PRICE_EXCEEDED');
      }

      const activationId = `mock_act_${Math.floor(10000000 + Math.random() * 90000000)}`;
      const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
      const phoneNumber = `${countryConfig.country_code}${randomDigits}`;

      const response = {
        status: 'OK',
        order_id: Math.floor(10000 + Math.random() * 90000),
        activation_id: activationId,
        number: phoneNumber,
        phone_number: phoneNumber,
        service: service.name,
        service_code: service.code,
        country: countryConfig.country_name,
        country_code: countryConfig.country_code,
        price: price,
        multi_sms: service.multi_sms,
        can_get_another_sms: service.multi_sms,
        expires_in: 1200,
        isMock: true,
      };

      // Store in memory for status polling simulation
      mockActivations.set(activationId, {
        activationId,
        phoneNumber,
        serviceCode,
        createdAt: Date.now(),
        otpSent: false,
        otpCode: Math.floor(100000 + Math.random() * 900000).toString(),
        status: 'pending',
      });

      await logApiCall('getNumber', params, response, true);
      return response;
    }

    const apiKey = await getApiKey();
    try {
      let url = `${BASE_URL}?api_key=${apiKey}&action=getNumberV2&service=${serviceCode}&country=${countryCode}&format=json`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      if (multiSms) url += `&multiSMS=1`;

      const res = await fetchApi(url);
      const text = await res.text();
      
      let data;
      try {
        // Attempt to parse as JSON first
        data = JSON.parse(text);
      } catch (e) {
        // If it fails, it's likely a standard text response (e.g., ACCESS_NUMBER:123:456 or NO_NUMBERS)
        if (text.startsWith('ACCESS_NUMBER:')) {
          const parts = text.split(':');
          data = {
            status: 'OK',
            activation_id: parts[1],
            number: parts[2],
            phone_number: parts[2],
            service: serviceCode,
            service_code: serviceCode,
            country: countryCode,
            country_code: countryCode
          };
        } else {
          throw new Error(text); // e.g., NO_BALANCE, NO_NUMBERS, NO_BALANCE_FOR_NUMBER
        }
      }

      await logApiCall('getNumber', params, data, false);

      // Handle raw string error codes if API returns status: "ACCESS_NUMBER" style or similar
      if (data.status === 'ERROR' || data.error) {
        throw new Error(data.error || data.message || 'API_ERROR');
      }

      // Check standard error codes returned as fields or root strings
      if (typeof data === 'string') {
        throw new Error(data); // Legacy error codes
      }

      return data;
    } catch (err) {
      console.error('SastaOTP getNumber API Error:', err.message);
      throw err;
    }
  },

  // Poll OTP (getStatusV2 / getStatus)
  async getStatus(activationId) {
    const isMock = await this.isMockMode();
    if (isMock || activationId.startsWith('mock_')) {
      const act = mockActivations.get(activationId);
      if (!act) {
        return { verificationType: 2, sms: null, error: 'NO_ACTIVATION' };
      }

      if (act.status === 'cancelled') {
        return { status: 'STATUS_CANCEL' };
      }

      // Simulate code delivery after 12 seconds
      const elapsed = (Date.now() - act.createdAt) / 1000;
      if (elapsed > 12 && !act.otpSent) {
        act.otpSent = true;
        act.status = 'completed';
        const response = {
          verificationType: 2,
          sms: {
            code: act.otpCode,
            text: `Your activation code is ${act.otpCode}. Thank you for using our service.`,
          },
          isMock: true,
        };
        await logApiCall('getStatus', { id: activationId }, response, true);
        return response;
      }

      return { verificationType: 2, sms: null, isMock: true };
    }

    const apiKey = await getApiKey();
    try {
      const url = `${BASE_URL}?api_key=${apiKey}&action=getStatusV2&id=${activationId}`;
      const res = await fetchApi(url);
      const data = await res.json();
      await logApiCall('getStatus', { id: activationId }, data, false);
      return data;
    } catch (err) {
      console.error('SastaOTP getStatus API Error:', err.message);
      return { verificationType: 2, sms: null, error: err.message };
    }
  },

  // Set Order Status (setStatus)
  // status: -1 (cancel), 6 (complete), 1 (SMS sent), 3 (retry for next SMS)
  async setStatus(activationId, status) {
    const isMock = await this.isMockMode();
    const params = { id: activationId, status };

    if (isMock || activationId.startsWith('mock_')) {
      const act = mockActivations.get(activationId);
      if (!act) {
        return 'NO_ACTIVATION';
      }

      let responseText = 'ERROR';
      if (status === -1 || status === 8) {
        act.status = 'cancelled';
        responseText = 'ACCESS_CANCEL';
      } else if (status === 6) {
        act.status = 'completed';
        responseText = 'ACCESS_ACTIVATION';
      } else if (status === 1) {
        responseText = 'ACCESS_READY';
      } else if (status === 3) {
        act.otpSent = false;
        act.createdAt = Date.now(); // Reset timer for new code
        act.otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        responseText = 'ACCESS_RETRY_GET';
      }

      await logApiCall('setStatus', params, { response: responseText }, true);
      return responseText;
    }

    const apiKey = await getApiKey();
    try {
      const url = `${BASE_URL}?api_key=${apiKey}&action=setStatus&id=${activationId}&status=${status}`;
      const res = await fetchApi(url);
      const text = await res.text();
      await logApiCall('setStatus', params, { response: text }, false);
      return text;
    } catch (err) {
      console.error('SastaOTP setStatus API Error:', err.message);
      throw err;
    }
  }
};

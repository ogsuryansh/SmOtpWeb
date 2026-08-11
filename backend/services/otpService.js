import Setting from '../models/Setting.js';
import AuditLog from '../models/AuditLog.js';
import https from 'https';
import http from 'http';

const DEFAULT_BASE_URL = 'https://mxfkruqagyqgvvcwezkx.supabase.co/functions/v1/handler-api';

// Helper to get OTP API Key from DB or Env
async function getApiKey() {
  const setting = await Setting.findOne({ key: 'otpApiKey' });
  if (setting && setting.value) return setting.value;
  
  // Fallback to legacy key name if exists
  const legacySetting = await Setting.findOne({ key: 'sastaOtpApiKey' });
  if (legacySetting && legacySetting.value) return legacySetting.value;

  return process.env.OTP_API_KEY || process.env.SASTA_OTP_API_KEY || '';
}

// Helper to get OTP Base URL from DB or default
async function getBaseUrl() {
  const setting = await Setting.findOne({ key: 'otpProviderUrl' });
  if (setting && setting.value) return setting.value;
  return DEFAULT_BASE_URL;
}

// Helper to perform HTTP/HTTPS GET request
async function fetchApi(url) {
  return new Promise((resolve, reject) => {
    const httpModule = url.startsWith('https') ? https : http;
    httpModule.get(url, {
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
          json: async () => {
            try {
              return JSON.parse(data);
            } catch (e) {
              return { status: 'ERROR', raw: data };
            }
          }
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
    logo: 'https://247otp.com/assets/logos/tg.png',
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
    logo: 'https://247otp.com/assets/logos/wa.png',
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
    name: 'Google / Gmail',
    logo: 'https://247otp.com/assets/logos/go.png',
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

const mockActivations = new Map();

let CACHED_SERVICES_LIST = null;
let CACHED_SERVICES_LIST_TIME = 0;

export const otpService = {
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
    const baseUrl = await getBaseUrl();

    try {
      const url = `${baseUrl}?api_key=${apiKey}&action=getBalance&format=json`;
      const res = await fetchApi(url);
      const text = await res.text();

      let balanceVal = 0;
      let currency = 'INR';

      if (text.startsWith('ACCESS_BALANCE:')) {
        balanceVal = parseFloat(text.split(':')[1]) || 0;
      } else {
        try {
          const data = JSON.parse(text);
          if (data.balance !== undefined) {
            balanceVal = parseFloat(data.balance) || 0;
          }
          if (data.currency) currency = data.currency;
        } catch (e) {
          // Plain text fallback
          balanceVal = parseFloat(text) || 0;
        }
      }

      const result = { status: 'OK', balance: balanceVal, currency, isMock: false };
      await logApiCall('getBalance', {}, result, false);
      return result;
    } catch (err) {
      console.error('OTP API getBalance error, falling back to mock:', err.message);
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

    const SERVICE_NAMES = {
      tg: 'Telegram', wa: 'WhatsApp', go: 'Google / Gmail', ig: 'Instagram', fb: 'Facebook', tw: 'Twitter / X', 
      nf: 'Netflix', az: 'Amazon', tk: 'TikTok', ds: 'Discord', ub: 'Uber', tb: 'Taobao', vk: 'VKontakte', 
      mm: 'WeChat', lf: 'Line', vi: 'Viber', sn: 'Snapchat', ok: 'Odnoklassniki', yl: 'Yandex', mb: 'Yahoo', 
      we: 'Weibo', qq: 'QQ', bl: 'Bigo Live', dr: 'Tinder',
    };

    if (!serviceCode) {
      const now = Date.now();
      if (CACHED_SERVICES_LIST && (now - CACHED_SERVICES_LIST_TIME < 5 * 60 * 1000)) {
        return { status: 'OK', services: CACHED_SERVICES_LIST, isMock: false };
      }

      const apiKey = await getApiKey();
      const baseUrl = await getBaseUrl();

      try {
        const res = await fetchApi(`${baseUrl}?api_key=${apiKey}&action=getServicesList&format=json`);
        const data = await res.json();
        
        if (data.services) {
          const formatted = {};
          for (const key in data.services) {
            const svc = data.services[key];
            formatted[svc.code || key] = {
              code: svc.code || key,
              name: svc.name || SERVICE_NAMES[svc.code || key] || (svc.code || key).toUpperCase(),
              price: svc.price || 0,
              countries: []
            };
          }
          
          CACHED_SERVICES_LIST = formatted;
          CACHED_SERVICES_LIST_TIME = now;
          return { status: 'OK', services: formatted, isMock: false };
        }
      } catch (err) {
        console.error('Failed to fetch getServicesList, falling back to default map:', err.message);
      }

      const initServices = {};
      Object.keys(SERVICE_NAMES).forEach(code => {
        initServices[code] = {
          code: code,
          name: SERVICE_NAMES[code],
          price: 0,
          countries: []
        };
      });
      return { status: 'OK', services: initServices, isMock: false };
    }

    const apiKey = await getApiKey();
    const baseUrl = await getBaseUrl();

    try {
      // Fetch prices and countries list in parallel
      // getPrices returns: { countryId: { serviceCode: { cost, count } } }
      const [pricesRes, countriesRes] = await Promise.all([
        fetchApi(`${baseUrl}?api_key=${apiKey}&action=getPrices&service=${serviceCode}&format=json`),
        fetchApi(`${baseUrl}?api_key=${apiKey}&action=getCountries&format=json`),
      ]);

      const pricesData = await pricesRes.json();
      const countriesData = await countriesRes.json();

      // Build a map of countryId -> countryName from getCountries
      const countryNameMap = {};
      if (countriesData.countries && Array.isArray(countriesData.countries)) {
        countriesData.countries.forEach(c => {
          countryNameMap[String(c.id)] = c.eng || `Country ${c.id}`;
        });
      }

      const services = {};
      const code = serviceCode;

      services[code] = {
        code: code,
        name: SERVICE_NAMES[code] || code.toUpperCase(),
        price: 0,
        countries: [],
        multi_sms: false,
      };

      // pricesData is keyed by country numeric ID
      // e.g. { "22": { "tg": { "cost": 0.8, "count": 236551 } }, ... }
      for (const countryId in pricesData) {
        const entry = pricesData[countryId][code];
        if (!entry) continue;
        const qty = entry.count || 0;
        if (qty <= 0) continue;
        const price = entry.cost || 0;
        const countryName = countryNameMap[countryId] || `Country ${countryId}`;

        services[code].countries.push({
          country_code: countryId,
          country_name: countryName,
          flag: '🌐',
          price: price,
          qty: qty,
        });
      }

      if (services[code].countries.length > 0) {
        services[code].price = Math.min(...services[code].countries.map(c => c.price));
      }

      // Sort: India (22) first, then alphabetical
      services[code].countries.sort((a, b) => {
        if (a.country_code === '22') return -1;
        if (b.country_code === '22') return 1;
        return a.country_name.localeCompare(b.country_name);
      });

      return { status: 'OK', services, isMock: false };
    } catch (err) {
      console.error('OTP API error:', err.message);
      const isMock = await this.isMockMode();
      if (isMock) {
        let filtered = MOCK_SERVICES;
        if (serviceCode) {
          filtered = MOCK_SERVICES[serviceCode] ? { [serviceCode]: MOCK_SERVICES[serviceCode] } : {};
        }
        return { status: 'OK', services: filtered, isMock: true };
      }
      throw err;
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
    const baseUrl = await getBaseUrl();

    try {
      const url = `${baseUrl}?api_key=${apiKey}&action=getCountries&format=json`;
      const res = await fetchApi(url);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('OTP API getCountries error:', err.message);
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
    const baseUrl = await getBaseUrl();

    try {
      let url = `${baseUrl}?api_key=${apiKey}&action=getNumber&service=${serviceCode}&country=${countryCode}&format=json`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      if (multiSms) url += `&multiSMS=1`;

      let data;
      let text;
      let maxAttempts = 2;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const res = await fetchApi(url);
          text = await res.text();
          
          try {
            data = JSON.parse(text);
          } catch (e) {
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
              data = { status: 'ERROR', error: text };
            }
          }
          
          const isError = data.status === 'ERROR' || data.error;
          const errString = String(data.error || text || '');
          
          if (!isError) {
            break;
          }
          
          if (errString.includes('NO_NUMBERS') || errString.includes('OPERATION_NOT_AVAILABLE') || errString.includes('WRONG_MAX_PRICE')) {
            console.log(`OTP getNumber attempt ${attempt} failed (${errString}). Retrying...`);
            if (attempt === maxAttempts) break;
            await new Promise(r => setTimeout(r, 1200));
          } else {
            break;
          }
        } catch (e) {
          console.error(`OTP fetchApi failed on attempt ${attempt}:`, e.message);
          if (attempt === maxAttempts) throw e;
          await new Promise(r => setTimeout(r, 1200));
        }
      }

      await logApiCall('getNumber', params, data, false);

      if (typeof data === 'string') {
        throw new Error(data);
      }

      if (data.status === 'ERROR' || data.error) {
        const errorMsg = data.error || data.message || 'API_ERROR';
        if (errorMsg.includes('WRONG_MAX_PRICE') || errorMsg.includes('OPERATION_NOT_AVAILABLE') || errorMsg.includes('NO_NUMBERS')) {
            throw new Error('Numbers are currently out of stock for this country/service. Please try again later.');
        }
        if (errorMsg.includes('NO_BALANCE')) {
            throw new Error('System API balance is low. Please contact site support.');
        }
        if (errorMsg.includes('BAD_KEY')) {
            throw new Error('Invalid API key configured. Please check Admin Settings.');
        }
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.error('OTP getNumber API Error:', err.message);
      throw err;
    }
  },

  // Poll OTP (getStatus)
  async getStatus(activationId) {
    const isMock = await this.isMockMode();
    if (isMock || String(activationId).startsWith('mock_')) {
      const act = mockActivations.get(activationId);
      if (!act) {
        return { verificationType: 2, sms: null, error: 'NO_ACTIVATION' };
      }

      if (act.status === 'cancelled') {
        return { status: 'STATUS_CANCEL' };
      }

      const elapsed = (Date.now() - act.createdAt) / 1000;
      if (elapsed > 12 && !act.otpSent) {
        act.otpSent = true;
        act.status = 'completed';
        const response = {
          verificationType: 2,
          sms: {
            code: act.otpCode,
            text: `Your verification code is ${act.otpCode}.`,
          },
          isMock: true,
        };
        await logApiCall('getStatus', { id: activationId }, response, true);
        return response;
      }

      return { verificationType: 2, sms: null, isMock: true };
    }

    const apiKey = await getApiKey();
    const baseUrl = await getBaseUrl();

    try {
      const url = `${baseUrl}?api_key=${apiKey}&action=getStatus&id=${activationId}`;
      const res = await fetchApi(url);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Handle plain text response (STATUS_WAIT_CODE, STATUS_OK:CODE, STATUS_CANCEL)
        if (text.startsWith('STATUS_OK:')) {
          const code = text.split(':')[1];
          data = {
            verificationType: 2,
            sms: {
              code: code,
              text: `Verification code: ${code}`
            }
          };
        } else if (text === 'STATUS_WAIT_CODE') {
          data = { verificationType: 2, sms: null };
        } else if (text === 'STATUS_CANCEL') {
          data = { status: 'STATUS_CANCEL' };
        } else {
          data = { verificationType: 2, sms: null, raw: text };
        }
      }

      await logApiCall('getStatus', { id: activationId }, data, false);
      return data;
    } catch (err) {
      console.error('OTP getStatus API Error:', err.message);
      return { verificationType: 2, sms: null, error: err.message };
    }
  },

  // Set Order Status (setStatus)
  async setStatus(activationId, status) {
    const isMock = await this.isMockMode();
    const params = { id: activationId, status };

    if (isMock || String(activationId).startsWith('mock_')) {
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
        act.createdAt = Date.now();
        act.otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        responseText = 'ACCESS_RETRY_GET';
      }

      await logApiCall('setStatus', params, { response: responseText }, true);
      return responseText;
    }

    const apiKey = await getApiKey();
    const baseUrl = await getBaseUrl();

    try {
      const url = `${baseUrl}?api_key=${apiKey}&action=setStatus&id=${activationId}&status=${status}`;
      const res = await fetchApi(url);
      const text = await res.text();
      await logApiCall('setStatus', params, { response: text }, false);
      return text;
    } catch (err) {
      console.error('OTP setStatus API Error:', err.message);
      throw err;
    }
  }
};

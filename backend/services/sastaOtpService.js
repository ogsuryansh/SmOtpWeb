import Setting from '../models/Setting.js';
import AuditLog from '../models/AuditLog.js';

const BASE_URL = 'https://sastaotp.com/stubs/handler_api.php';

// Helper to get SastaOTP API Key from DB or Env
async function getApiKey() {
  const setting = await Setting.findOne({ key: 'sastaOtpApiKey' });
  return setting ? setting.value : (process.env.SASTA_OTP_API_KEY || '');
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
      const res = await fetch(url);
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
      if (serviceCode) {
        // Fetch service details, prices, and countries concurrently
        const serviceUrl = `${BASE_URL}?api_key=${apiKey}&action=getServicesList&service=${serviceCode}&format=json`;
        const pricesUrl = `${BASE_URL}?api_key=${apiKey}&action=getPrices&service=${serviceCode}&format=json`;
        const countriesUrl = `${BASE_URL}?api_key=${apiKey}&action=getCountries&format=json`;

        const [serviceRes, pricesRes, countriesRes] = await Promise.all([
          fetch(serviceUrl),
          fetch(pricesUrl),
          fetch(countriesUrl)
        ]);

        const serviceData = await serviceRes.json();
        const pricesData = await pricesRes.json();
        const countriesData = await countriesRes.json();

        const serviceInfo = serviceData.services?.[serviceCode];
        if (serviceInfo) {
          const countriesMap = countriesData.countries || {};
          const pricesMap = pricesData.data || {};
          const countriesList = [];

          for (const countryId in pricesMap) {
            const countryPrices = pricesMap[countryId];
            const servicePriceInfo = countryPrices[serviceCode];
            
            if (servicePriceInfo) {
              const countryInfo = countriesMap[countryId];
              let countryName = countryInfo?.name || `Country ${countryId}`;
              let countryCodeVal = countryInfo?.code || countryId;
              let countryFlag = countryInfo?.flag || '🌐';

              if (countryId === '*') {
                const isIndian = serviceInfo.name?.toLowerCase().includes('indian') || serviceInfo.name?.toLowerCase().includes('india');
                countryName = isIndian ? 'India' : 'Any Country';
                countryCodeVal = '*';
                countryFlag = isIndian ? '🇮🇳' : '🌐';
              }

              countriesList.push({
                country_code: countryCodeVal,
                country_name: countryName,
                flag: countryFlag,
                price: servicePriceInfo.cost,
                qty: servicePriceInfo.count
              });
            }
          }

          // Sort: India (22) at top, then alphabetical
          countriesList.sort((a, b) => {
            if (a.country_code === '22') return -1;
            if (b.country_code === '22') return 1;
            return a.country_name.localeCompare(b.country_name);
          });

          serviceInfo.countries = countriesList;
        }

        return serviceData;
      }

      // No serviceCode specified: standard fast getServicesList query
      let url = `${BASE_URL}?api_key=${apiKey}&action=getServicesList&format=json`;
      const res = await fetch(url);
      const data = await res.json();

      // Normalize: live API returns countries:[] for all services.
      // Inject a default India entry so the frontend always has at least one country option on initial load.
      if (data.services && typeof data.services === 'object') {
        for (const key in data.services) {
          const srv = data.services[key];
          if (!srv.countries || srv.countries.length === 0) {
            srv.countries = [
              {
                country_code: '22',
                country_name: 'India',
                flag: '🇮🇳',
                price: srv.price || 0,
                qty: srv.available || 0,
              }
            ];
          }
        }
      }

      return data;
    } catch (err) {
      console.error('SastaOTP API getServicesList error, falling back to mock:', err.message);
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
      const res = await fetch(url);
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

      const res = await fetch(url);
      const data = await res.json();
      
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
      const res = await fetch(url);
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
      const res = await fetch(url);
      const text = await res.text();
      await logApiCall('setStatus', params, { response: text }, false);
      return text;
    } catch (err) {
      console.error('SastaOTP setStatus API Error:', err.message);
      throw err;
    }
  }
};

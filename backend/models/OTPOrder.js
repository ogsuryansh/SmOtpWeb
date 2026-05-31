import JsonCollection from '../config/jsonDb.js';

class OTPOrderCollection extends JsonCollection {
  constructor() {
    super('otporders');
  }

  // Override create to add default field values
  async create(obj) {
    const newObj = { ...obj };
    if (newObj.status === undefined) newObj.status = 'pending';
    if (newObj.multiSms === undefined) newObj.multiSms = false;
    return super.create(newObj);
  }
}

const OTPOrder = new OTPOrderCollection();
export default OTPOrder;

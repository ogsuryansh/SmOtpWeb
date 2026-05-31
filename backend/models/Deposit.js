import JsonCollection from '../config/jsonDb.js';

class DepositCollection extends JsonCollection {
  constructor() {
    super('deposits');
  }

  // Override create to add default status
  async create(obj) {
    const newObj = { ...obj };
    if (newObj.status === undefined) newObj.status = 'pending';
    return super.create(newObj);
  }
}

const Deposit = new DepositCollection();
export default Deposit;

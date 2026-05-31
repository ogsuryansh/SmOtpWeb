import JsonCollection from '../config/jsonDb.js';

class TransactionCollection extends JsonCollection {
  constructor() {
    super('transactions');
  }
}

const Transaction = new TransactionCollection();
export default Transaction;

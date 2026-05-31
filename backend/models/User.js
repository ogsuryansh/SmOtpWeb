import bcrypt from 'bcryptjs';
import JsonCollection from '../config/jsonDb.js';

class UserCollection extends JsonCollection {
  constructor() {
    super('users');
  }

  // Override create to hash password
  async create(obj) {
    const hashedObj = { ...obj };
    if (hashedObj.password) {
      const salt = bcrypt.genSaltSync(10);
      hashedObj.password = bcrypt.hashSync(hashedObj.password, salt);
    }
    
    // Add default values
    if (hashedObj.balance === undefined) hashedObj.balance = 0;
    if (hashedObj.isBanned === undefined) hashedObj.isBanned = false;
    if (hashedObj.role === undefined) hashedObj.role = 'user';

    return super.create(hashedObj);
  }

  // Override wrapDocument to attach Mongoose-like doc methods
  _wrapDocument(doc) {
    const wrapped = super._wrapDocument(doc);
    if (!wrapped) return null;

    // Attach matchPassword method
    Object.defineProperty(wrapped, 'matchPassword', {
      enumerable: false,
      value: async function(enteredPassword) {
        return bcrypt.compareSync(enteredPassword, this.password);
      }
    });

    // Handle password hashing on manual save
    const self = this;
    const originalSave = wrapped.save;
    wrapped.save = async function() {
      // Check if password has been modified (changed to plain text)
      // If it doesn't start with standard bcrypt prefix '$2a$' or '$2b$', hash it
      if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
      }
      return originalSave.call(this);
    };

    return wrapped;
  }
}

const User = new UserCollection();
export default User;

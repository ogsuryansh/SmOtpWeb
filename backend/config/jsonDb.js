import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class JsonCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.data = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error(`Error loading database collection ${this.name}:`, err.message);
    }
    return [];
  }

  _save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error(`Error saving database collection ${this.name}:`, err.message);
    }
  }

  // Generate unique string ID
  _generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Mock document instance for save() calls
  _wrapDocument(doc) {
    if (!doc) return null;
    
    // Add instance method save()
    const self = this;
    const wrapped = { ...doc };

    // Mongoose-compatible .id virtual (string alias for ._id)
    Object.defineProperty(wrapped, 'id', {
      enumerable: false,
      configurable: true,
      get() { return this._id; }
    });
    
    Object.defineProperty(wrapped, 'save', {
      enumerable: false,
      writable: true,
      configurable: true,
      value: async function() {
        const index = self.data.findIndex(item => item._id === this._id);
        if (index !== -1) {
          self.data[index] = { ...this };
        } else {
          self.data.push({ ...this });
        }
        self._save();
        return this;
      }
    });

    return wrapped;
  }

  // Filter helper supporting simple queries and regex/or/gte
  _matches(item, query) {
    if (!query || Object.keys(query).length === 0) return true;

    for (const key in query) {
      const val = query[key];

      // Handle Mongoose $or operator
      if (key === '$or' && Array.isArray(val)) {
        const matchAny = val.some(subQuery => this._matches(item, subQuery));
        if (!matchAny) return false;
        continue;
      }

      // Handle simple property comparison
      const itemVal = item[key];

      if (val && typeof val === 'object') {
        // Handle regex: { $regex: '...', $options: 'i' }
        if (val.$regex !== undefined) {
          const options = val.$options || '';
          const regex = new RegExp(val.$regex, options);
          if (!regex.test(String(itemVal || ''))) return false;
          continue;
        }
        
        // Handle $gte / $lte
        if (val.$gte !== undefined && Number(itemVal) < Number(val.$gte)) return false;
        if (val.$lte !== undefined && Number(itemVal) > Number(val.$lte)) return false;
        
        // Handle $in operator
        if (Array.isArray(val.$in)) {
          if (!val.$in.includes(itemVal)) return false;
          continue;
        }
      } else {
        // Direct value comparison
        if (itemVal !== val) return false;
      }
    }
    return true;
  }

  // Mock Mongoose-like Query Chain Builder
  _createQueryChain(itemPromise, isArray = false) {
    const self = this;
    const chain = {
      _selectFields: null,
      _populatePath: null,
      _sortObj: null,
      _limitCount: null,
      
      select: (fieldsStr) => {
        chain._selectFields = fieldsStr;
        return chain;
      },
      populate: (path, selectFields) => {
        chain._populatePath = path;
        return chain;
      },
      sort: (sortObj) => {
        chain._sortObj = sortObj;
        return chain;
      },
      limit: (count) => {
        chain._limitCount = count;
        return chain;
      },
      then: async (resolve, reject) => {
        try {
          let res = await itemPromise;
          if (!res) {
            return resolve(isArray ? [] : null);
          }

          let dataCopy = isArray ? res.map(item => ({ ...item })) : { ...res };

          // 1. Sort (if array)
          if (isArray && chain._sortObj) {
            const sortKeys = Object.keys(chain._sortObj);
            if (sortKeys.length > 0) {
              const sortKey = sortKeys[0];
              const order = chain._sortObj[sortKey]; // 1 or -1
              dataCopy.sort((a, b) => {
                const valA = a[sortKey];
                const valB = b[sortKey];
                if (valA < valB) return order === 1 ? -1 : 1;
                if (valA > valB) return order === 1 ? 1 : -1;
                return 0;
              });
            }
          }

          // 2. Limit (if array)
          if (isArray && chain._limitCount !== null) {
            dataCopy = dataCopy.slice(0, chain._limitCount);
          }

          // 3. Populate
          if (chain._populatePath === 'userId' || chain._populatePath === 'processedBy') {
            const usersCol = new JsonCollection('users');
            const populateDoc = (doc) => {
              const refId = doc[chain._populatePath];
              if (refId) {
                const matchedUser = usersCol.data.find(u => u._id === refId);
                if (matchedUser) {
                  const userCopy = { ...matchedUser };
                  delete userCopy.password;
                  doc[chain._populatePath] = userCopy;
                }
              }
            };

            if (isArray) {
              dataCopy.forEach(populateDoc);
            } else {
              populateDoc(dataCopy);
            }
          }

          // 4. Select exclusion/inclusion
          if (chain._selectFields) {
            const fields = chain._selectFields.split(' ');
            const selectDoc = (doc) => {
              fields.forEach(f => {
                if (f.startsWith('-')) {
                  const fieldName = f.substring(1);
                  delete doc[fieldName];
                }
              });
            };

            if (isArray) {
              dataCopy.forEach(selectDoc);
            } else {
              selectDoc(dataCopy);
            }
          }

          // Wrap documents with .save() method
          if (isArray) {
            resolve(dataCopy.map(item => self._wrapDocument(item)));
          } else {
            resolve(self._wrapDocument(dataCopy));
          }
        } catch (err) {
          if (reject) reject(err);
        }
      }
    };

    return chain;
  }

  // Query API Methods (mimic Mongoose query builder patterns)
  find(query = {}) {
    const results = this.data.filter(item => this._matches(item, query));
    return this._createQueryChain(Promise.resolve(results), true);
  }

  findOne(query = {}) {
    const item = this.data.find(item => this._matches(item, query));
    return this._createQueryChain(Promise.resolve(item), false);
  }

  findById(id) {
    const item = this.data.find(item => item._id === id);
    return this._createQueryChain(Promise.resolve(item), false);
  }

  async create(obj) {
    const newDoc = {
      _id: this._generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...obj
    };

    this.data.push(newDoc);
    this._save();
    return this._wrapDocument(newDoc);
  }

  async countDocuments(query = {}) {
    return this.data.filter(item => this._matches(item, query)).length;
  }

  async findOneAndUpdate(query, update, options = {}) {
    const item = this.data.find(item => this._matches(item, query));
    if (!item) {
      if (options.upsert) {
        // Create new item
        const newObj = {};
        if (update.$set) Object.assign(newObj, update.$set);
        else Object.assign(newObj, update);
        return this.create(newObj);
      }
      return null;
    }

    // Apply updates
    let updatedFields = {};
    if (update.$inc) {
      for (const k in update.$inc) {
        item[k] = parseFloat(((item[k] || 0) + update.$inc[k]).toFixed(2));
      }
    }
    if (update.$set) {
      updatedFields = update.$set;
    } else {
      updatedFields = update;
    }

    Object.assign(item, updatedFields);
    item.updatedAt = new Date();
    this._save();

    return this._wrapDocument(item);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return this.findOneAndUpdate({ _id: id }, update, options);
  }

  // Aggregate stats mocks
  async aggregate(pipeline) {
    // We only need to support summing 'amount' for approved deposits in stats
    let results = [...this.data];
    
    // Simple filter matching first match pipeline
    const matchStep = pipeline.find(step => step.$match);
    if (matchStep) {
      results = results.filter(item => this._matches(item, matchStep.$match));
    }

    // Group sum step
    const groupStep = pipeline.find(step => step.$group);
    if (groupStep && groupStep.$group.total && groupStep.$group.total.$sum) {
      const sumField = groupStep.$group.total.$sum.replace('$', '');
      const total = results.reduce((sum, item) => sum + (item[sumField] || 0), 0);
      return [{ _id: null, total }];
    }

    return [];
  }
}

// Database Connection Mock
export const connectJsonDb = () => {
  console.log('JSON File-based DB Connected Successfully in backend/data/');
};

export default JsonCollection;

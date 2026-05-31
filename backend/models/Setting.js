import JsonCollection from '../config/jsonDb.js';

class SettingCollection extends JsonCollection {
  constructor() {
    super('settings');
  }
}

const Setting = new SettingCollection();
export default Setting;

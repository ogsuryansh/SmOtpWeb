import JsonCollection from '../config/jsonDb.js';

class AuditLogCollection extends JsonCollection {
  constructor() {
    super('auditlogs');
  }
}

const AuditLog = new AuditLogCollection();
export default AuditLog;

import mongoose from 'mongoose';
import util from 'util';

const MONGO_URI = "mongodb+srv://suryansh1885_db_user:SC26CAvFy7yENgjw@otpaddaa.ljmgxi4.mongodb.net/?appName=otpaddaa";

const auditLogSchema = new mongoose.Schema({}, { strict: false });
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        const logs = await AuditLog.find({ action: 'API_GETSERVICESLIST', 'details.isMock': false })
            .sort({ createdAt: -1 })
            .limit(1);
        
        if (logs.length > 0) {
            console.log("Most recent live getServicesList log:");
            console.log(util.inspect(logs[0].details, { depth: null, colors: true }).substring(0, 2000));
        } else {
            console.log("No recent live API logs found for getServicesList.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}
main();

import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timezone
import threading
import time

# ==========================================
# CONFIGURATION
# ==========================================
# Replace with your Telegram Bot Token from BotFather
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE" 

# Replace with your Telegram User ID or Admin Group ID
ADMIN_CHAT_ID = "YOUR_CHAT_ID_HERE" 

# MongoDB URI (Hardcoded for external hosting)
MONGO_URI = "mongodb+srv://suryansh1885_db_user:SC26CAvFy7yENgjw@otpaddaa.ljmgxi4.mongodb.net/?appName=otpaddaa"
# ==========================================

if not BOT_TOKEN or BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
    print("⚠️ Please set your BOT_TOKEN and ADMIN_CHAT_ID in main.py before running!")
    exit(1)

# Initialize Bot and Database
bot = telebot.TeleBot(BOT_TOKEN)
client = MongoClient(MONGO_URI)
db = client.get_database("test") # Default Mongoose DB name unless specified otherwise

# MongoDB Collections
users_col = db['users']
deposits_col = db['deposits']
transactions_col = db['transactions']
auditlogs_col = db['auditlogs']

def poll_deposits():
    """Background thread to check for new pending deposits every 10 seconds"""
    while True:
        try:
            # Find pending deposits that haven't been notified yet on Telegram
            pending_deposits = deposits_col.find({
                "status": "pending",
                "notified_tg": {"$ne": True}
            })
            
            for deposit in pending_deposits:
                user = users_col.find_one({"_id": deposit["userId"]})
                username = user.get("username", "Unknown") if user else "Unknown"
                amount = deposit.get("amount", 0)
                utr = deposit.get("utr", "N/A")
                
                # Fetch formatted date
                date_obj = deposit.get('createdAt', datetime.now(timezone.utc))
                date_str = date_obj.strftime('%Y-%m-%d %H:%M:%S') if isinstance(date_obj, datetime) else str(date_obj)
                
                text = (
                    f"💰 *New Deposit Request*\n\n"
                    f"👤 *User:* {username}\n"
                    f"💵 *Amount:* ₹{amount}\n"
                    f"🔢 *UTR:* `{utr}`\n"
                    f"📅 *Date:* {date_str}"
                )
                
                markup = InlineKeyboardMarkup()
                markup.row(
                    InlineKeyboardButton("✅ Approve", callback_data=f"approve_{str(deposit['_id'])}"),
                    InlineKeyboardButton("❌ Reject", callback_data=f"reject_{str(deposit['_id'])}")
                )
                
                bot.send_message(ADMIN_CHAT_ID, text, reply_markup=markup, parse_mode="Markdown")
                
                # Mark as notified to avoid duplicate alerts
                deposits_col.update_one({"_id": deposit["_id"]}, {"$set": {"notified_tg": True}})
                
        except Exception as e:
            print(f"Error polling deposits: {e}")
            
        time.sleep(10)

@bot.callback_query_handler(func=lambda call: call.data.startswith('approve_') or call.data.startswith('reject_'))
def handle_approval(call):
    """Handles the Accept/Reject inline button clicks"""
    action, deposit_id = call.data.split('_')
    
    try:
        deposit = deposits_col.find_one({"_id": ObjectId(deposit_id)})
        if not deposit:
            bot.answer_callback_query(call.id, "Deposit not found in Database!", show_alert=True)
            return
            
        if deposit.get('status') != 'pending':
            bot.answer_callback_query(call.id, f"Deposit is already {deposit.get('status')}!")
            bot.edit_message_text(f"{call.message.text}\n\n⚠️ *Status:* Already {deposit.get('status').upper()}", call.message.chat.id, call.message.message_id, parse_mode="Markdown")
            return
            
        if action == 'approve':
            amount = deposit.get('amount', 0)
            user_id = deposit.get('userId')
            
            # 1. Update deposit status
            deposits_col.update_one(
                {"_id": ObjectId(deposit_id)},
                {"$set": {
                    "status": "approved",
                    "remarks": "Approved via Telegram Bot",
                    "processedAt": datetime.now(timezone.utc)
                }}
            )
            
            # 2. Add balance to user
            users_col.update_one(
                {"_id": user_id},
                {"$inc": {"balance": amount}}
            )
            
            # 3. Create Transaction record
            transactions_col.insert_one({
                "userId": user_id,
                "amount": amount,
                "type": "deposit",
                "description": f"Manual Deposit Approved - UTR {deposit.get('utr', 'N/A')}",
                "referenceId": str(deposit_id),
                "createdAt": datetime.now(timezone.utc),
                "updatedAt": datetime.now(timezone.utc)
            })
            
            # 4. Create Audit Log
            auditlogs_col.insert_one({
                "action": "DEPOSIT_APPROVED",
                "details": {"depositId": str(deposit_id), "userId": str(user_id), "amount": amount, "via": "Telegram"},
                "createdAt": datetime.now(timezone.utc),
                "updatedAt": datetime.now(timezone.utc)
            })
            
            bot.answer_callback_query(call.id, "✅ Deposit Approved & Balance Added!")
            bot.edit_message_text(f"{call.message.text}\n\n✅ *Status: APPROVED*", call.message.chat.id, call.message.message_id, parse_mode="Markdown")
            
        elif action == 'reject':
            # 1. Update deposit status
            deposits_col.update_one(
                {"_id": ObjectId(deposit_id)},
                {"$set": {
                    "status": "rejected",
                    "remarks": "Rejected via Telegram Bot",
                    "processedAt": datetime.now(timezone.utc)
                }}
            )
            
            # 2. Create Audit Log
            auditlogs_col.insert_one({
                "action": "DEPOSIT_REJECTED",
                "details": {"depositId": str(deposit_id), "userId": str(deposit.get('userId')), "remarks": "Rejected via Telegram", "via": "Telegram"},
                "createdAt": datetime.now(timezone.utc),
                "updatedAt": datetime.now(timezone.utc)
            })
            
            bot.answer_callback_query(call.id, "❌ Deposit Rejected.")
            bot.edit_message_text(f"{call.message.text}\n\n❌ *Status: REJECTED*", call.message.chat.id, call.message.message_id, parse_mode="Markdown")
            
    except Exception as e:
        print(f"Error handling callback: {e}")
        bot.answer_callback_query(call.id, "An internal error occurred.")

if __name__ == "__main__":
    print("🚀 Starting Telegram Admin Bot...")
    print("Checking for pending deposits every 10 seconds...")
    
    # Run the polling check in a background thread
    t = threading.Thread(target=poll_deposits)
    t.daemon = True
    t.start()
    
    # Start receiving Telegram messages/clicks
    bot.infinity_polling()

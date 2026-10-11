import sqlite3
import os

# Connect to the database (assuming it's in the same folder)
db_file = "campusconnect.db"

if not os.path.exists(db_file):
    print(f"Error: Could not find {db_file}. Make sure you are running this in the same folder as your database!")
    exit(1)

conn = sqlite3.connect(db_file)

# ---> CHANGE THIS TO YOUR REGISTERED EMAIL <---
email_to_promote = "admin@gmail.com"

# Update the database to set is_admin to 1
cursor = conn.execute("UPDATE users SET is_admin = 1 WHERE email = ?", (email_to_promote,))
conn.commit()

if cursor.rowcount > 0:
    print(f"✅ Success! '{email_to_promote}' is now an admin.")
else:
    print(f"❌ Could not find a user with the email '{email_to_promote}'. Did you spell it right?")

conn.close()

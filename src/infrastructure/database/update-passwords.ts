// Script untuk update password yang sudah ada menjadi hashed
import { getDatabase } from './db';
import { hash } from 'bcryptjs';

async function updatePasswords(): Promise<void> {
  const db = getDatabase();
  
  console.log('Updating passwords to hashed format...');
  
  // Get all users
  const users = db.prepare('SELECT uuid, username, password FROM system_users').all() as Array<{
    uuid: string;
    username: string;
    password: string;
  }>;
  
  const updateStmt = db.prepare(`
    UPDATE system_users
    SET password = ?, updated_at = datetime('now')
    WHERE uuid = ?
  `);
  
  for (const user of users) {
    // Cek apakah password sudah di-hash
    if (!user.password.startsWith('$2')) {
      // Password belum di-hash, hash sekarang
      const hashedPassword = await hash(user.password, 10);
      updateStmt.run(hashedPassword, user.uuid);
      console.log(`Updated password for user: ${user.username}`);
    } else {
      console.log(`Password already hashed for user: ${user.username}`);
    }
  }
  
  console.log('Password update completed!');
}

if (require.main === module) {
  updatePasswords().catch(console.error);
}

export { updatePasswords };


import { db } from '@/lib/db';
import { users, sessions, accounts } from '@/lib/db/schema/auth';
import { createId } from '@paralleldrive/cuid2';

export async function seedAuthData() {
  console.log('Seeding auth data...');

  // Create a test user
  const testUser = await db.insert(users).values({
    id: createId(),
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    role: 'user',
  }).returning();

  console.log('Created test user:', testUser[0]);

  // Create a test session
  const testSession = await db.insert(sessions).values({
    id: createId(),
    sessionToken: 'test-session-token',
    userId: testUser[0].id,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  }).returning();

  console.log('Created test session:', testSession[0]);

  // Create a test account
  const testAccount = await db.insert(accounts).values({
    userId: testUser[0].id,
    type: 'oauth',
    provider: 'google',
    providerAccountId: 'google-123456',
    access_token: 'test-access-token',
    token_type: 'Bearer',
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  }).returning();

  console.log('Created test account:', testAccount[0]);

  console.log('Auth data seeded successfully!');
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedAuthData().catch(console.error);
}

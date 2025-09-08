import { db } from './connection';

export interface TransactionOptions {
  isolationLevel?: 'read uncommitted' | 'read committed' | 'repeatable read' | 'serializable';
  readOnly?: boolean;
  deferrable?: boolean;
}

// Transaction wrapper
export async function withTransaction<T>(
  callback: (tx: any) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  return await db.transaction(async (tx) => {
    return await callback(tx);
  });
}

// Run multiple operations in a transaction
export async function runInTransaction<T>(
  operations: Array<(tx: any) => Promise<any>>,
  options: TransactionOptions = {}
): Promise<T[]> {
  return await withTransaction(async (tx) => {
    const results: T[] = [];
    
    for (const operation of operations) {
      const result = await operation(tx);
      results.push(result);
    }
    
    return results;
  }, options);
}

// Example transaction: Create user with profile
export async function createUserWithProfile(userData: any, profileData: any) {
  return await withTransaction(async (tx) => {
    // Create user
    const user = await tx.insert(users).values(userData).returning();
    
    // Create profile
    const profile = await tx.insert(profiles).values({
      ...profileData,
      userId: user[0].id,
    }).returning();
    
    return { user: user[0], profile: profile[0] };
  });
}

// Example transaction: Update post with view count
export async function incrementPostViewCount(postId: number) {
  return await withTransaction(async (tx) => {
    // Get current view count
    const post = await tx.select().from(posts).where(eq(posts.id, postId));
    
    if (!post[0]) {
      throw new Error('Post not found');
    }
    
    // Increment view count
    const updatedPost = await tx
      .update(posts)
      .set({ 
        viewCount: post[0].viewCount + 1,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId))
      .returning();
    
    return updatedPost[0];
  });
}

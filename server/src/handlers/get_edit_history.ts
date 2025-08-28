import { db } from '../db';
import { editHistoryTable } from '../db/schema';
import { type EditHistoryEntry } from '../schema';
import { desc } from 'drizzle-orm';

export async function getEditHistory(): Promise<EditHistoryEntry[]> {
  try {
    // Query edit history entries ordered by date (most recent first)
    const results = await db.select()
      .from(editHistoryTable)
      .orderBy(desc(editHistoryTable.date))
      .execute();

    // Map database results to schema format
    return results.map(entry => ({
      date: entry.date,
      description: entry.description
    }));
  } catch (error) {
    console.error('Failed to fetch edit history:', error);
    throw error;
  }
}
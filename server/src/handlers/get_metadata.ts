import { db } from '../db';
import { metadataTable, editHistoryTable } from '../db/schema';
import { type Metadata } from '../schema';
import { desc } from 'drizzle-orm';

export async function getMetadata(): Promise<Metadata> {
  try {
    // Get the single metadata row
    const metadataRows = await db.select()
      .from(metadataTable)
      .execute();

    // If no metadata exists, return default structure
    if (metadataRows.length === 0) {
      return {
        lastUpdated: new Date().toISOString(),
        goals: [],
        keyPrinciples: [],
        editHistory: []
      };
    }

    const metadata = metadataRows[0];

    // Get edit history, ordered by date descending (most recent first)
    const editHistoryRows = await db.select()
      .from(editHistoryTable)
      .orderBy(desc(editHistoryTable.createdAt))
      .execute();

    // Convert edit history to the expected format
    const editHistory = editHistoryRows.map(row => ({
      date: row.date,
      description: row.description
    }));

    return {
      lastUpdated: metadata.lastUpdated,
      goals: metadata.goals as string[], // JSONB to string array
      keyPrinciples: metadata.keyPrinciples as string[], // JSONB to string array
      editHistory
    };
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    throw error;
  }
}
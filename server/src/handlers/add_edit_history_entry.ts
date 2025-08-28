import { db } from '../db';
import { editHistoryTable } from '../db/schema';
import { type AddEditHistoryEntryInput, type EditHistoryEntry } from '../schema';

export async function addEditHistoryEntry(input: AddEditHistoryEntryInput): Promise<EditHistoryEntry> {
  try {
    // Insert edit history entry into the database
    const result = await db.insert(editHistoryTable)
      .values({
        date: input.date,
        description: input.description
      })
      .returning()
      .execute();

    const editHistoryEntry = result[0];
    
    // Return the edit history entry in the expected format
    return {
      date: editHistoryEntry.date,
      description: editHistoryEntry.description
    };
  } catch (error) {
    console.error('Edit history entry creation failed:', error);
    throw error;
  }
}
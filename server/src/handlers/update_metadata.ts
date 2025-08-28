import { db } from '../db';
import { metadataTable, editHistoryTable } from '../db/schema';
import { type UpdateMetadataInput, type Metadata } from '../schema';
import { eq } from 'drizzle-orm';

export const updateMetadata = async (input: UpdateMetadataInput): Promise<Metadata> => {
  try {
    // Check if metadata exists
    const existingMetadata = await db.select()
      .from(metadataTable)
      .limit(1)
      .execute();

    let result;

    if (existingMetadata.length === 0) {
      // First-time setup - create new metadata record
      const insertResult = await db.insert(metadataTable)
        .values({
          lastUpdated: input.lastUpdated || new Date().toISOString(),
          goals: input.goals || [],
          keyPrinciples: input.keyPrinciples || []
        })
        .returning()
        .execute();
      
      result = insertResult[0];
    } else {
      // Update existing metadata - only update provided fields
      const current = existingMetadata[0];
      const updateData: any = {};

      if (input.lastUpdated !== undefined) {
        updateData.lastUpdated = input.lastUpdated;
      }
      if (input.goals !== undefined) {
        updateData.goals = input.goals;
      }
      if (input.keyPrinciples !== undefined) {
        updateData.keyPrinciples = input.keyPrinciples;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = new Date();
        
        const updateResult = await db.update(metadataTable)
          .set(updateData)
          .where(eq(metadataTable.id, current.id))
          .returning()
          .execute();
        
        result = updateResult[0];
      } else {
        result = current;
      }
    }

    // Fetch edit history
    const editHistory = await db.select()
      .from(editHistoryTable)
      .orderBy(editHistoryTable.createdAt)
      .execute();

    return {
      lastUpdated: result.lastUpdated,
      goals: result.goals as string[],
      keyPrinciples: result.keyPrinciples as string[],
      editHistory: editHistory.map(entry => ({
        date: entry.date,
        description: entry.description
      }))
    };
  } catch (error) {
    console.error('Metadata update failed:', error);
    throw error;
  }
};
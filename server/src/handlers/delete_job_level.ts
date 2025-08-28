import { db } from '../db';
import { jobLevelsTable, competencySubCategoriesTable } from '../db/schema';
import { type GetJobLevelInput } from '../schema';
import { eq } from 'drizzle-orm';

export async function deleteJobLevel(input: GetJobLevelInput): Promise<boolean> {
  try {
    // First, check if the job level exists
    const existingJobLevel = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, input.id))
      .execute();

    if (existingJobLevel.length === 0) {
      return false; // Job level not found
    }

    // Clean up references to this job level in competency sub-categories
    // We need to remove the level from descriptionsByLevel JSON objects
    const subCategories = await db.select()
      .from(competencySubCategoriesTable)
      .execute();

    // Update each sub-category to remove the job level from descriptionsByLevel
    for (const subCategory of subCategories) {
      const descriptions = subCategory.descriptionsByLevel as Record<string, string>;
      
      // Check if this job level has a description in this sub-category
      if (descriptions && descriptions[input.id]) {
        // Remove the job level from the descriptions
        delete descriptions[input.id];
        
        // Update the sub-category with the cleaned descriptions
        await db.update(competencySubCategoriesTable)
          .set({
            descriptionsByLevel: descriptions,
            updatedAt: new Date()
          })
          .where(eq(competencySubCategoriesTable.id, subCategory.id))
          .execute();
      }
    }

    // Delete the job level
    const result = await db.delete(jobLevelsTable)
      .where(eq(jobLevelsTable.id, input.id))
      .returning()
      .execute();

    return result.length > 0;
  } catch (error) {
    console.error('Job level deletion failed:', error);
    throw error;
  }
}
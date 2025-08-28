import { db } from '../db';
import { 
  jobLevelsTable, 
  competencyCategoriesTable, 
  competencySubCategoriesTable, 
  metadataTable, 
  editHistoryTable 
} from '../db/schema';
import { type CompareJobLevelsInput, type EngineeringJobMatrix } from '../schema';
import { eq, inArray, SQL } from 'drizzle-orm';

export async function compareJobLevels(input: CompareJobLevelsInput): Promise<EngineeringJobMatrix> {
  try {
    // Validate that all requested job levels exist
    const requestedJobLevels = await db.select()
      .from(jobLevelsTable)
      .where(inArray(jobLevelsTable.id, input.levelIds))
      .execute();

    // Check if all requested levels were found
    if (requestedJobLevels.length !== input.levelIds.length) {
      const foundIds = requestedJobLevels.map(level => level.id);
      const missingIds = input.levelIds.filter(id => !foundIds.includes(id));
      throw new Error(`Job levels not found: ${missingIds.join(', ')}`);
    }

    // Get all competency categories with their sub-categories
    const competencyCategories = await db.select()
      .from(competencyCategoriesTable)
      .execute();

    const competencySubCategories = await db.select()
      .from(competencySubCategoriesTable)
      .execute();

    // Get metadata
    const metadataResults = await db.select()
      .from(metadataTable)
      .limit(1)
      .execute();

    // Get edit history
    const editHistory = await db.select()
      .from(editHistoryTable)
      .execute();

    // Build the response structure
    const categoriesWithSubCategories = competencyCategories.map(category => ({
      id: category.id,
      name: category.name,
      subCategories: competencySubCategories
        .filter(subCat => subCat.categoryId === category.id)
        .map(subCat => ({
          id: subCat.id,
          name: subCat.name,
          descriptionsByLevel: subCat.descriptionsByLevel as Record<string, string>
        }))
    }));

    // Prepare metadata with defaults if no metadata exists
    const metadata = metadataResults.length > 0 ? {
      lastUpdated: metadataResults[0].lastUpdated,
      goals: metadataResults[0].goals as string[],
      keyPrinciples: metadataResults[0].keyPrinciples as string[],
      editHistory: editHistory.map(entry => ({
        date: entry.date,
        description: entry.description
      }))
    } : {
      lastUpdated: new Date().toISOString(),
      goals: [],
      keyPrinciples: [],
      editHistory: []
    };

    // Return the filtered job matrix with only the requested job levels
    return {
      jobLevels: requestedJobLevels.map(level => ({
        id: level.id,
        name: level.name,
        track: level.track,
        summaryDescription: level.summaryDescription,
        trajectoryInfo: level.trajectoryInfo,
        scopeOfInfluenceSummary: level.scopeOfInfluenceSummary || undefined,
        ownershipSummary: level.ownershipSummary || undefined
      })),
      competencyCategories: categoriesWithSubCategories,
      metadata
    };
  } catch (error) {
    console.error('Job level comparison failed:', error);
    throw error;
  }
}
import { db } from '../db';
import { 
  jobLevelsTable, 
  competencyCategoriesTable, 
  competencySubCategoriesTable,
  metadataTable,
  editHistoryTable 
} from '../db/schema';
import { type EngineeringJobMatrix } from '../schema';
import { eq } from 'drizzle-orm';

export async function getFullMatrix(): Promise<EngineeringJobMatrix> {
  try {
    // Fetch all job levels
    const jobLevels = await db.select().from(jobLevelsTable).execute();

    // Fetch all competency categories with their sub-categories
    const categories = await db.select()
      .from(competencyCategoriesTable)
      .innerJoin(
        competencySubCategoriesTable,
        eq(competencyCategoriesTable.id, competencySubCategoriesTable.categoryId)
      )
      .execute();

    // Group sub-categories by category
    const categoryMap = new Map();
    
    categories.forEach(result => {
      const category = result.competency_categories;
      const subCategory = result.competency_sub_categories;
      
      if (!categoryMap.has(category.id)) {
        categoryMap.set(category.id, {
          id: category.id,
          name: category.name,
          subCategories: []
        });
      }
      
      categoryMap.get(category.id).subCategories.push({
        id: subCategory.id,
        name: subCategory.name,
        descriptionsByLevel: subCategory.descriptionsByLevel as Record<string, string>
      });
    });

    // Handle categories with no sub-categories
    const allCategories = await db.select().from(competencyCategoriesTable).execute();
    allCategories.forEach(category => {
      if (!categoryMap.has(category.id)) {
        categoryMap.set(category.id, {
          id: category.id,
          name: category.name,
          subCategories: []
        });
      }
    });

    const competencyCategories = Array.from(categoryMap.values());

    // Fetch metadata (should be a single row)
    const metadataResults = await db.select().from(metadataTable).execute();
    let metadata = {
      lastUpdated: '',
      goals: [] as string[],
      keyPrinciples: [] as string[],
      editHistory: [] as Array<{ date: string; description: string }>
    };

    if (metadataResults.length > 0) {
      const metadataRow = metadataResults[0];
      
      // Fetch edit history
      const editHistoryResults = await db.select().from(editHistoryTable).execute();
      
      metadata = {
        lastUpdated: metadataRow.lastUpdated,
        goals: metadataRow.goals as string[],
        keyPrinciples: metadataRow.keyPrinciples as string[],
        editHistory: editHistoryResults.map(entry => ({
          date: entry.date,
          description: entry.description
        }))
      };
    }

    return {
      jobLevels: jobLevels.map(level => ({
        id: level.id,
        name: level.name,
        track: level.track,
        summaryDescription: level.summaryDescription,
        trajectoryInfo: level.trajectoryInfo,
        scopeOfInfluenceSummary: level.scopeOfInfluenceSummary ?? undefined,
        ownershipSummary: level.ownershipSummary ?? undefined
      })),
      competencyCategories,
      metadata
    };
  } catch (error) {
    console.error('Failed to fetch full matrix:', error);
    throw error;
  }
}
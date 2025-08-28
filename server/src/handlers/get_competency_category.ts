import { db } from '../db';
import { competencyCategoriesTable, competencySubCategoriesTable } from '../db/schema';
import { type GetCompetencyCategoryInput, type CompetencyCategory } from '../schema';
import { eq } from 'drizzle-orm';

export const getCompetencyCategory = async (input: GetCompetencyCategoryInput): Promise<CompetencyCategory | null> => {
  try {
    // Fetch the category with its sub-categories using a join
    const results = await db.select({
      // Category fields
      id: competencyCategoriesTable.id,
      name: competencyCategoriesTable.name,
      // Sub-category fields (will be null if no sub-categories exist)
      subCategoryId: competencySubCategoriesTable.id,
      subCategoryName: competencySubCategoriesTable.name,
      subCategoryDescriptionsByLevel: competencySubCategoriesTable.descriptionsByLevel,
    })
      .from(competencyCategoriesTable)
      .leftJoin(
        competencySubCategoriesTable,
        eq(competencyCategoriesTable.id, competencySubCategoriesTable.categoryId)
      )
      .where(eq(competencyCategoriesTable.id, input.id))
      .execute();

    // If no results found, category doesn't exist
    if (results.length === 0) {
      return null;
    }

    // Extract category info from first result
    const categoryData = {
      id: results[0].id,
      name: results[0].name,
    };

    // Build sub-categories array from all results
    const subCategories = results
      .filter(result => result.subCategoryId !== null) // Only include rows with sub-categories
      .map(result => ({
        id: result.subCategoryId!,
        name: result.subCategoryName!,
        descriptionsByLevel: result.subCategoryDescriptionsByLevel as Record<string, string>,
      }));

    return {
      ...categoryData,
      subCategories,
    };
  } catch (error) {
    console.error('Get competency category failed:', error);
    throw error;
  }
};
import { db } from '../db';
import { competencyCategoriesTable, competencySubCategoriesTable } from '../db/schema';
import { type CompetencyCategory } from '../schema';
import { asc, eq } from 'drizzle-orm';

export async function getCompetencyCategories(): Promise<CompetencyCategory[]> {
  try {
    // Get all categories with their sub-categories using a join query
    const results = await db.select({
      category: competencyCategoriesTable,
      subCategory: competencySubCategoriesTable
    })
    .from(competencyCategoriesTable)
    .leftJoin(
      competencySubCategoriesTable, 
      eq(competencyCategoriesTable.id, competencySubCategoriesTable.categoryId)
    )
    .orderBy(
      asc(competencyCategoriesTable.name),
      asc(competencySubCategoriesTable.name)
    )
    .execute();

    // Group results by category to build the nested structure
    const categoryMap = new Map<string, CompetencyCategory>();

    for (const result of results) {
      const category = result.category;
      
      // Initialize category if not already in map
      if (!categoryMap.has(category.id)) {
        categoryMap.set(category.id, {
          id: category.id,
          name: category.name,
          subCategories: []
        });
      }

      // Add sub-category if it exists (leftJoin can return null for categories without sub-categories)
      if (result.subCategory) {
        const existingCategory = categoryMap.get(category.id)!;
        existingCategory.subCategories.push({
          id: result.subCategory.id,
          name: result.subCategory.name,
          descriptionsByLevel: result.subCategory.descriptionsByLevel as Record<string, string>
        });
      }
    }

    // Convert map to array, maintaining the sorted order
    return Array.from(categoryMap.values());
  } catch (error) {
    console.error('Failed to fetch competency categories:', error);
    throw error;
  }
}
import { db } from '../db';
import { competencySubCategoriesTable, competencyCategoriesTable } from '../db/schema';
import { type CreateCompetencySubCategoryInput, type CompetencySubCategory } from '../schema';
import { eq } from 'drizzle-orm';

export const createCompetencySubCategory = async (input: CreateCompetencySubCategoryInput): Promise<CompetencySubCategory> => {
  try {
    // First, validate that the referenced category exists
    const category = await db.select()
      .from(competencyCategoriesTable)
      .where(eq(competencyCategoriesTable.id, input.categoryId))
      .execute();

    if (category.length === 0) {
      throw new Error(`Competency category with id '${input.categoryId}' does not exist`);
    }

    // Insert the new competency sub-category
    const result = await db.insert(competencySubCategoriesTable)
      .values({
        id: input.id,
        name: input.name,
        categoryId: input.categoryId,
        descriptionsByLevel: input.descriptionsByLevel
      })
      .returning()
      .execute();

    const subCategory = result[0];
    
    return {
      id: subCategory.id,
      name: subCategory.name,
      descriptionsByLevel: subCategory.descriptionsByLevel as Record<string, string>
    };
  } catch (error) {
    console.error('Competency sub-category creation failed:', error);
    throw error;
  }
};
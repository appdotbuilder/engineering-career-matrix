import { db } from '../db';
import { competencyCategoriesTable, competencySubCategoriesTable } from '../db/schema';
import { type CreateCompetencyCategoryInput, type CompetencyCategory } from '../schema';
import { eq } from 'drizzle-orm';

export async function createCompetencyCategory(input: CreateCompetencyCategoryInput): Promise<CompetencyCategory> {
  try {
    // Check if a category with this ID already exists
    const existingCategory = await db.select()
      .from(competencyCategoriesTable)
      .where(eq(competencyCategoriesTable.id, input.id))
      .execute();

    if (existingCategory.length > 0) {
      throw new Error(`Competency category with ID '${input.id}' already exists`);
    }

    // Insert the new competency category
    const result = await db.insert(competencyCategoriesTable)
      .values({
        id: input.id,
        name: input.name
      })
      .returning()
      .execute();

    const newCategory = result[0];

    // Return with empty subCategories array as required by schema
    return {
      id: newCategory.id,
      name: newCategory.name,
      subCategories: []
    };
  } catch (error) {
    console.error('Competency category creation failed:', error);
    throw error;
  }
}
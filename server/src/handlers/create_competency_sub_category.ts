import { type CreateCompetencySubCategoryInput, type CompetencySubCategory } from '../schema';

export async function createCompetencySubCategory(input: CreateCompetencySubCategoryInput): Promise<CompetencySubCategory> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is creating a new competency sub-category and persisting it in the database.
    // Should validate that the ID is unique and that the referenced categoryId exists.
    return {
        id: input.id,
        name: input.name,
        descriptionsByLevel: input.descriptionsByLevel,
    } as CompetencySubCategory;
}
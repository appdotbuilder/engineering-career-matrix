import { db } from '../db';
import { 
  jobLevelsTable, 
  competencyCategoriesTable, 
  competencySubCategoriesTable,
  metadataTable,
  editHistoryTable 
} from '../db/schema';
import { type SearchInput, type EngineeringJobMatrix } from '../schema';
import { eq, inArray, ilike, or, and, SQL } from 'drizzle-orm';

export async function searchMatrix(input: SearchInput): Promise<EngineeringJobMatrix> {
  try {
    // Get metadata and edit history (always included)
    const [metadataResults, editHistoryResults] = await Promise.all([
      db.select().from(metadataTable).execute(),
      db.select().from(editHistoryTable).execute()
    ]);

    const metadata = metadataResults.length > 0 ? metadataResults[0] : {
      lastUpdated: '',
      goals: [],
      keyPrinciples: [],
    };

    const editHistory = editHistoryResults.map(entry => ({
      date: entry.date,
      description: entry.description,
    }));

    // Build job levels conditions
    const jobLevelConditions: SQL<unknown>[] = [];

    // Filter by tracks
    if (input.tracks && input.tracks.length > 0) {
      jobLevelConditions.push(inArray(jobLevelsTable.track, input.tracks));
    }

    // Filter by specific level IDs
    if (input.levelIds && input.levelIds.length > 0) {
      jobLevelConditions.push(inArray(jobLevelsTable.id, input.levelIds));
    }

    // Text search across job level fields
    if (input.query) {
      const searchTerm = `%${input.query}%`;
      jobLevelConditions.push(
        or(
          ilike(jobLevelsTable.name, searchTerm),
          ilike(jobLevelsTable.summaryDescription, searchTerm),
          ilike(jobLevelsTable.trajectoryInfo, searchTerm),
          ilike(jobLevelsTable.scopeOfInfluenceSummary, searchTerm),
          ilike(jobLevelsTable.ownershipSummary, searchTerm)
        )!
      );
    }

    // Execute job levels query
    const jobLevels = jobLevelConditions.length > 0 
      ? await db.select()
          .from(jobLevelsTable)
          .where(jobLevelConditions.length === 1 ? jobLevelConditions[0] : and(...jobLevelConditions)!)
          .execute()
      : await db.select().from(jobLevelsTable).execute();

    // Build competency categories conditions
    const categoryConditions: SQL<unknown>[] = [];

    // Filter by category IDs
    if (input.categoryIds && input.categoryIds.length > 0) {
      categoryConditions.push(inArray(competencyCategoriesTable.id, input.categoryIds));
    }

    // Filter by sub-category IDs
    if (input.subCategoryIds && input.subCategoryIds.length > 0) {
      categoryConditions.push(inArray(competencySubCategoriesTable.id, input.subCategoryIds));
    }

    // Text search across category and sub-category fields
    if (input.query) {
      const searchTerm = `%${input.query}%`;
      categoryConditions.push(
        or(
          ilike(competencyCategoriesTable.name, searchTerm),
          ilike(competencySubCategoriesTable.name, searchTerm)
        )!
      );
    }

    // Execute categories query with join
    const categoryResults = categoryConditions.length > 0
      ? await db.select()
          .from(competencyCategoriesTable)
          .innerJoin(
            competencySubCategoriesTable,
            eq(competencyCategoriesTable.id, competencySubCategoriesTable.categoryId)
          )
          .where(categoryConditions.length === 1 ? categoryConditions[0] : and(...categoryConditions)!)
          .execute()
      : await db.select()
          .from(competencyCategoriesTable)
          .innerJoin(
            competencySubCategoriesTable,
            eq(competencyCategoriesTable.id, competencySubCategoriesTable.categoryId)
          )
          .execute();

    // Group results by category
    const categoryMap = new Map<string, {
      category: any;
      subCategories: any[];
    }>();

    // Process joined results
    for (const result of categoryResults) {
      const category = result.competency_categories;
      const subCategory = result.competency_sub_categories;

      if (!categoryMap.has(category.id)) {
        categoryMap.set(category.id, {
          category,
          subCategories: []
        });
      }

      categoryMap.get(category.id)!.subCategories.push(subCategory);
    }

    // Build final competency categories structure
    const competencyCategories = Array.from(categoryMap.values()).map(({ category, subCategories }) => ({
      id: category.id,
      name: category.name,
      subCategories: subCategories.map(subCat => ({
        id: subCat.id,
        name: subCat.name,
        descriptionsByLevel: subCat.descriptionsByLevel as Record<string, string>
      }))
    }));

    return {
      jobLevels: jobLevels.map(level => ({
        id: level.id,
        name: level.name,
        track: level.track,
        summaryDescription: level.summaryDescription,
        trajectoryInfo: level.trajectoryInfo,
        scopeOfInfluenceSummary: level.scopeOfInfluenceSummary || undefined,
        ownershipSummary: level.ownershipSummary || undefined,
      })),
      competencyCategories,
      metadata: {
        lastUpdated: metadata.lastUpdated,
        goals: metadata.goals as string[],
        keyPrinciples: metadata.keyPrinciples as string[],
        editHistory,
      },
    };
  } catch (error) {
    console.error('Matrix search failed:', error);
    throw error;
  }
}
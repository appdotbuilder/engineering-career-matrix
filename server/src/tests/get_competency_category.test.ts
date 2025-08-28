import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { competencyCategoriesTable, competencySubCategoriesTable } from '../db/schema';
import { type GetCompetencyCategoryInput } from '../schema';
import { getCompetencyCategory } from '../handlers/get_competency_category';
import { eq } from 'drizzle-orm';

describe('getCompetencyCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent category', async () => {
    const input: GetCompetencyCategoryInput = {
      id: 'non-existent-category'
    };

    const result = await getCompetencyCategory(input);
    expect(result).toBeNull();
  });

  it('should return category with empty sub-categories array when no sub-categories exist', async () => {
    // Create a category without sub-categories
    await db.insert(competencyCategoriesTable)
      .values({
        id: 'category-1',
        name: 'Technical Skills'
      })
      .execute();

    const input: GetCompetencyCategoryInput = {
      id: 'category-1'
    };

    const result = await getCompetencyCategory(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('category-1');
    expect(result!.name).toEqual('Technical Skills');
    expect(result!.subCategories).toEqual([]);
  });

  it('should return category with single sub-category', async () => {
    // Create category
    await db.insert(competencyCategoriesTable)
      .values({
        id: 'category-1',
        name: 'Technical Skills'
      })
      .execute();

    // Create sub-category
    const descriptionsByLevel = {
      'L1': 'Basic programming knowledge',
      'L2': 'Intermediate programming skills'
    };

    await db.insert(competencySubCategoriesTable)
      .values({
        id: 'sub-cat-1',
        name: 'Programming',
        categoryId: 'category-1',
        descriptionsByLevel: descriptionsByLevel
      })
      .execute();

    const input: GetCompetencyCategoryInput = {
      id: 'category-1'
    };

    const result = await getCompetencyCategory(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('category-1');
    expect(result!.name).toEqual('Technical Skills');
    expect(result!.subCategories).toHaveLength(1);
    
    const subCategory = result!.subCategories[0];
    expect(subCategory.id).toEqual('sub-cat-1');
    expect(subCategory.name).toEqual('Programming');
    expect(subCategory.descriptionsByLevel).toEqual(descriptionsByLevel);
  });

  it('should return category with multiple sub-categories', async () => {
    // Create category
    await db.insert(competencyCategoriesTable)
      .values({
        id: 'category-1',
        name: 'Technical Skills'
      })
      .execute();

    // Create multiple sub-categories
    const subCategories = [
      {
        id: 'sub-cat-1',
        name: 'Programming',
        categoryId: 'category-1',
        descriptionsByLevel: {
          'L1': 'Basic programming knowledge',
          'L2': 'Intermediate programming skills'
        }
      },
      {
        id: 'sub-cat-2',
        name: 'Architecture',
        categoryId: 'category-1',
        descriptionsByLevel: {
          'L1': 'Understanding of basic architecture patterns',
          'L2': 'Can design simple architectures'
        }
      },
      {
        id: 'sub-cat-3',
        name: 'Testing',
        categoryId: 'category-1',
        descriptionsByLevel: {
          'L1': 'Writes basic unit tests',
          'L2': 'Designs comprehensive test strategies'
        }
      }
    ];

    await db.insert(competencySubCategoriesTable)
      .values(subCategories)
      .execute();

    const input: GetCompetencyCategoryInput = {
      id: 'category-1'
    };

    const result = await getCompetencyCategory(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual('category-1');
    expect(result!.name).toEqual('Technical Skills');
    expect(result!.subCategories).toHaveLength(3);

    // Verify all sub-categories are returned with correct data
    const subCategoryIds = result!.subCategories.map(sc => sc.id).sort();
    expect(subCategoryIds).toEqual(['sub-cat-1', 'sub-cat-2', 'sub-cat-3']);

    const programmingSubCat = result!.subCategories.find(sc => sc.id === 'sub-cat-1');
    expect(programmingSubCat).toBeDefined();
    expect(programmingSubCat!.name).toEqual('Programming');
    expect(programmingSubCat!.descriptionsByLevel).toEqual({
      'L1': 'Basic programming knowledge',
      'L2': 'Intermediate programming skills'
    });

    const architectureSubCat = result!.subCategories.find(sc => sc.id === 'sub-cat-2');
    expect(architectureSubCat).toBeDefined();
    expect(architectureSubCat!.name).toEqual('Architecture');
    expect(architectureSubCat!.descriptionsByLevel).toEqual({
      'L1': 'Understanding of basic architecture patterns',
      'L2': 'Can design simple architectures'
    });
  });

  it('should handle complex descriptions by level data', async () => {
    // Create category
    await db.insert(competencyCategoriesTable)
      .values({
        id: 'category-complex',
        name: 'Leadership Skills'
      })
      .execute();

    // Create sub-category with complex descriptions
    const complexDescriptions = {
      'IC1': 'Individual contributor - focuses on personal development',
      'IC2': 'Senior IC - mentors junior developers',
      'TL1': 'Tech Lead - leads small teams',
      'TL2': 'Senior Tech Lead - leads multiple teams',
      'EM1': 'Engineering Manager - manages people and projects',
      'Director': 'Director - strategic leadership across organization'
    };

    await db.insert(competencySubCategoriesTable)
      .values({
        id: 'leadership-sub',
        name: 'Team Leadership',
        categoryId: 'category-complex',
        descriptionsByLevel: complexDescriptions
      })
      .execute();

    const input: GetCompetencyCategoryInput = {
      id: 'category-complex'
    };

    const result = await getCompetencyCategory(input);

    expect(result).not.toBeNull();
    expect(result!.subCategories).toHaveLength(1);
    expect(result!.subCategories[0].descriptionsByLevel).toEqual(complexDescriptions);
  });

  it('should verify category exists in database after retrieval', async () => {
    // Create test data
    await db.insert(competencyCategoriesTable)
      .values({
        id: 'verify-category',
        name: 'Verification Category'
      })
      .execute();

    await db.insert(competencySubCategoriesTable)
      .values({
        id: 'verify-sub',
        name: 'Verification Sub',
        categoryId: 'verify-category',
        descriptionsByLevel: { 'L1': 'Test description' }
      })
      .execute();

    // Get the category via handler
    const result = await getCompetencyCategory({ id: 'verify-category' });

    // Verify it exists in database independently
    const dbCategories = await db.select()
      .from(competencyCategoriesTable)
      .where(eq(competencyCategoriesTable.id, 'verify-category'))
      .execute();

    const dbSubCategories = await db.select()
      .from(competencySubCategoriesTable)
      .where(eq(competencySubCategoriesTable.categoryId, 'verify-category'))
      .execute();

    expect(dbCategories).toHaveLength(1);
    expect(dbSubCategories).toHaveLength(1);
    expect(result!.id).toEqual(dbCategories[0].id);
    expect(result!.name).toEqual(dbCategories[0].name);
    expect(result!.subCategories[0].id).toEqual(dbSubCategories[0].id);
  });
});
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { competencyCategoriesTable, competencySubCategoriesTable } from '../db/schema';
import { getCompetencyCategories } from '../handlers/get_competency_categories';

describe('getCompetencyCategories', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no categories exist', async () => {
    const result = await getCompetencyCategories();
    
    expect(result).toEqual([]);
  });

  it('should return categories without sub-categories', async () => {
    // Create test categories
    await db.insert(competencyCategoriesTable).values([
      {
        id: 'technical',
        name: 'Technical Skills'
      },
      {
        id: 'leadership',
        name: 'Leadership'
      }
    ]).execute();

    const result = await getCompetencyCategories();

    expect(result).toHaveLength(2);
    
    // Check categories are sorted alphabetically
    expect(result[0].name).toEqual('Leadership');
    expect(result[0].subCategories).toEqual([]);
    
    expect(result[1].name).toEqual('Technical Skills');
    expect(result[1].subCategories).toEqual([]);
  });

  it('should return categories with sub-categories properly nested', async () => {
    // Create test categories
    await db.insert(competencyCategoriesTable).values([
      {
        id: 'technical',
        name: 'Technical Skills'
      },
      {
        id: 'leadership',
        name: 'Leadership'
      }
    ]).execute();

    // Create test sub-categories
    await db.insert(competencySubCategoriesTable).values([
      {
        id: 'coding',
        name: 'Coding',
        categoryId: 'technical',
        descriptionsByLevel: {
          'L1': 'Basic coding skills',
          'L2': 'Intermediate coding skills'
        }
      },
      {
        id: 'architecture',
        name: 'Architecture',
        categoryId: 'technical',
        descriptionsByLevel: {
          'L1': 'Basic architecture understanding',
          'L2': 'System design skills'
        }
      },
      {
        id: 'mentoring',
        name: 'Mentoring',
        categoryId: 'leadership',
        descriptionsByLevel: {
          'TL1': 'Mentors junior developers',
          'TL2': 'Mentors multiple team members'
        }
      }
    ]).execute();

    const result = await getCompetencyCategories();

    expect(result).toHaveLength(2);
    
    // Check Leadership category (alphabetically first)
    const leadershipCategory = result[0];
    expect(leadershipCategory.name).toEqual('Leadership');
    expect(leadershipCategory.subCategories).toHaveLength(1);
    expect(leadershipCategory.subCategories[0].name).toEqual('Mentoring');
    expect(leadershipCategory.subCategories[0].descriptionsByLevel).toEqual({
      'TL1': 'Mentors junior developers',
      'TL2': 'Mentors multiple team members'
    });

    // Check Technical Skills category
    const technicalCategory = result[1];
    expect(technicalCategory.name).toEqual('Technical Skills');
    expect(technicalCategory.subCategories).toHaveLength(2);
    
    // Sub-categories should be sorted alphabetically
    expect(technicalCategory.subCategories[0].name).toEqual('Architecture');
    expect(technicalCategory.subCategories[0].descriptionsByLevel).toEqual({
      'L1': 'Basic architecture understanding',
      'L2': 'System design skills'
    });
    
    expect(technicalCategory.subCategories[1].name).toEqual('Coding');
    expect(technicalCategory.subCategories[1].descriptionsByLevel).toEqual({
      'L1': 'Basic coding skills',
      'L2': 'Intermediate coding skills'
    });
  });

  it('should handle mixed categories (some with sub-categories, some without)', async () => {
    // Create test categories
    await db.insert(competencyCategoriesTable).values([
      {
        id: 'empty-category',
        name: 'Empty Category'
      },
      {
        id: 'populated-category',
        name: 'Populated Category'
      }
    ]).execute();

    // Create sub-category only for one category
    await db.insert(competencySubCategoriesTable).values([
      {
        id: 'sub1',
        name: 'Sub Category 1',
        categoryId: 'populated-category',
        descriptionsByLevel: {
          'L1': 'Description for L1'
        }
      }
    ]).execute();

    const result = await getCompetencyCategories();

    expect(result).toHaveLength(2);
    
    // Empty Category should have no sub-categories
    const emptyCategory = result.find(cat => cat.name === 'Empty Category');
    expect(emptyCategory).toBeDefined();
    expect(emptyCategory!.subCategories).toEqual([]);
    
    // Populated Category should have one sub-category
    const populatedCategory = result.find(cat => cat.name === 'Populated Category');
    expect(populatedCategory).toBeDefined();
    expect(populatedCategory!.subCategories).toHaveLength(1);
    expect(populatedCategory!.subCategories[0].name).toEqual('Sub Category 1');
  });

  it('should preserve proper data types for descriptionsByLevel', async () => {
    // Create test category and sub-category
    await db.insert(competencyCategoriesTable).values({
      id: 'test-category',
      name: 'Test Category'
    }).execute();

    const testDescriptions = {
      'L1': 'Junior level description',
      'L2': 'Senior level description',
      'TL1': 'Team lead description'
    };

    await db.insert(competencySubCategoriesTable).values({
      id: 'test-sub',
      name: 'Test Sub Category',
      categoryId: 'test-category',
      descriptionsByLevel: testDescriptions
    }).execute();

    const result = await getCompetencyCategories();

    expect(result).toHaveLength(1);
    expect(result[0].subCategories).toHaveLength(1);
    
    const subCategory = result[0].subCategories[0];
    expect(typeof subCategory.descriptionsByLevel).toBe('object');
    expect(subCategory.descriptionsByLevel).toEqual(testDescriptions);
    
    // Verify each key-value pair
    expect(subCategory.descriptionsByLevel['L1']).toEqual('Junior level description');
    expect(subCategory.descriptionsByLevel['L2']).toEqual('Senior level description');
    expect(subCategory.descriptionsByLevel['TL1']).toEqual('Team lead description');
  });
});
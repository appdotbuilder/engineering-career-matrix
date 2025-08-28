import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { competencySubCategoriesTable, competencyCategoriesTable } from '../db/schema';
import { type CreateCompetencySubCategoryInput } from '../schema';
import { createCompetencySubCategory } from '../handlers/create_competency_sub_category';
import { eq } from 'drizzle-orm';

// Test data
const testCategory = {
  id: 'technical-skills',
  name: 'Technical Skills'
};

const testInput: CreateCompetencySubCategoryInput = {
  id: 'programming',
  name: 'Programming',
  categoryId: 'technical-skills',
  descriptionsByLevel: {
    'L1': 'Basic programming skills',
    'L2': 'Intermediate programming skills',
    'L3': 'Advanced programming skills'
  }
};

describe('createCompetencySubCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a competency sub-category', async () => {
    // Create prerequisite category
    await db.insert(competencyCategoriesTable)
      .values(testCategory)
      .execute();

    const result = await createCompetencySubCategory(testInput);

    // Verify returned data structure
    expect(result.id).toEqual('programming');
    expect(result.name).toEqual('Programming');
    expect(result.descriptionsByLevel).toEqual({
      'L1': 'Basic programming skills',
      'L2': 'Intermediate programming skills',
      'L3': 'Advanced programming skills'
    });
    expect(typeof result.descriptionsByLevel).toBe('object');
  });

  it('should save competency sub-category to database', async () => {
    // Create prerequisite category
    await db.insert(competencyCategoriesTable)
      .values(testCategory)
      .execute();

    const result = await createCompetencySubCategory(testInput);

    // Verify data was saved to database
    const subCategories = await db.select()
      .from(competencySubCategoriesTable)
      .where(eq(competencySubCategoriesTable.id, result.id))
      .execute();

    expect(subCategories).toHaveLength(1);
    expect(subCategories[0].id).toEqual('programming');
    expect(subCategories[0].name).toEqual('Programming');
    expect(subCategories[0].categoryId).toEqual('technical-skills');
    expect(subCategories[0].descriptionsByLevel).toEqual({
      'L1': 'Basic programming skills',
      'L2': 'Intermediate programming skills',
      'L3': 'Advanced programming skills'
    });
    expect(subCategories[0].createdAt).toBeInstanceOf(Date);
    expect(subCategories[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should throw error when category does not exist', async () => {
    // Don't create the prerequisite category
    await expect(createCompetencySubCategory(testInput))
      .rejects
      .toThrow(/competency category with id 'technical-skills' does not exist/i);
  });

  it('should handle complex descriptions by level', async () => {
    // Create prerequisite category
    await db.insert(competencyCategoriesTable)
      .values(testCategory)
      .execute();

    const complexInput: CreateCompetencySubCategoryInput = {
      id: 'system-design',
      name: 'System Design',
      categoryId: 'technical-skills',
      descriptionsByLevel: {
        'L1_L2': 'Understands basic system components',
        'L3_L4': 'Designs scalable systems',
        'L5_L6': 'Architects complex distributed systems',
        'TL1': 'Guides team in system design decisions',
        'EM1': 'Sets system architecture standards across teams'
      }
    };

    const result = await createCompetencySubCategory(complexInput);

    expect(result.descriptionsByLevel).toEqual({
      'L1_L2': 'Understands basic system components',
      'L3_L4': 'Designs scalable systems',
      'L5_L6': 'Architects complex distributed systems',
      'TL1': 'Guides team in system design decisions',
      'EM1': 'Sets system architecture standards across teams'
    });

    // Verify in database
    const saved = await db.select()
      .from(competencySubCategoriesTable)
      .where(eq(competencySubCategoriesTable.id, 'system-design'))
      .execute();

    expect(saved[0].descriptionsByLevel).toEqual(complexInput.descriptionsByLevel);
  });

  it('should throw error for duplicate sub-category id', async () => {
    // Create prerequisite category
    await db.insert(competencyCategoriesTable)
      .values(testCategory)
      .execute();

    // Create first sub-category
    await createCompetencySubCategory(testInput);

    // Attempt to create duplicate
    await expect(createCompetencySubCategory(testInput))
      .rejects
      .toThrow();
  });

  it('should handle empty descriptions by level', async () => {
    // Create prerequisite category
    await db.insert(competencyCategoriesTable)
      .values(testCategory)
      .execute();

    const emptyDescriptionsInput: CreateCompetencySubCategoryInput = {
      id: 'empty-test',
      name: 'Empty Test',
      categoryId: 'technical-skills',
      descriptionsByLevel: {}
    };

    const result = await createCompetencySubCategory(emptyDescriptionsInput);

    expect(result.descriptionsByLevel).toEqual({});
    expect(typeof result.descriptionsByLevel).toBe('object');
  });
});
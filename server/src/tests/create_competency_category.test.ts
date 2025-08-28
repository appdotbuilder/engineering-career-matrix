import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { competencyCategoriesTable } from '../db/schema';
import { type CreateCompetencyCategoryInput } from '../schema';
import { createCompetencyCategory } from '../handlers/create_competency_category';
import { eq } from 'drizzle-orm';

// Test input
const testInput: CreateCompetencyCategoryInput = {
  id: 'technical-skills',
  name: 'Technical Skills'
};

describe('createCompetencyCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a competency category', async () => {
    const result = await createCompetencyCategory(testInput);

    // Verify basic fields
    expect(result.id).toEqual('technical-skills');
    expect(result.name).toEqual('Technical Skills');
    expect(result.subCategories).toEqual([]);
    expect(Array.isArray(result.subCategories)).toBe(true);
  });

  it('should save competency category to database', async () => {
    const result = await createCompetencyCategory(testInput);

    // Query database to verify persistence
    const categories = await db.select()
      .from(competencyCategoriesTable)
      .where(eq(competencyCategoriesTable.id, result.id))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].id).toEqual('technical-skills');
    expect(categories[0].name).toEqual('Technical Skills');
    expect(categories[0].createdAt).toBeInstanceOf(Date);
    expect(categories[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should prevent duplicate category IDs', async () => {
    // Create first category
    await createCompetencyCategory(testInput);

    // Attempt to create duplicate should fail
    await expect(createCompetencyCategory(testInput))
      .rejects
      .toThrow(/already exists/i);
  });

  it('should create categories with different IDs successfully', async () => {
    const firstCategory = await createCompetencyCategory(testInput);

    const secondInput: CreateCompetencyCategoryInput = {
      id: 'leadership-skills',
      name: 'Leadership Skills'
    };

    const secondCategory = await createCompetencyCategory(secondInput);

    // Verify both categories exist
    expect(firstCategory.id).toEqual('technical-skills');
    expect(secondCategory.id).toEqual('leadership-skills');
    expect(firstCategory.id).not.toEqual(secondCategory.id);

    // Verify database contains both
    const allCategories = await db.select()
      .from(competencyCategoriesTable)
      .execute();

    expect(allCategories).toHaveLength(2);
    const ids = allCategories.map(cat => cat.id).sort();
    expect(ids).toEqual(['leadership-skills', 'technical-skills']);
  });

  it('should handle special characters in category names', async () => {
    const specialInput: CreateCompetencyCategoryInput = {
      id: 'soft-skills-communication',
      name: 'Soft Skills & Communication'
    };

    const result = await createCompetencyCategory(specialInput);

    expect(result.name).toEqual('Soft Skills & Communication');

    // Verify in database
    const categories = await db.select()
      .from(competencyCategoriesTable)
      .where(eq(competencyCategoriesTable.id, 'soft-skills-communication'))
      .execute();

    expect(categories[0].name).toEqual('Soft Skills & Communication');
  });

  it('should handle long category names', async () => {
    const longNameInput: CreateCompetencyCategoryInput = {
      id: 'very-long-category-id',
      name: 'This is a very long category name that tests the system ability to handle extended text content for competency categories'
    };

    const result = await createCompetencyCategory(longNameInput);

    expect(result.name).toEqual(longNameInput.name);
    expect(result.name.length).toBeGreaterThan(50);

    // Verify database storage
    const categories = await db.select()
      .from(competencyCategoriesTable)
      .where(eq(competencyCategoriesTable.id, 'very-long-category-id'))
      .execute();

    expect(categories[0].name).toEqual(longNameInput.name);
  });
});
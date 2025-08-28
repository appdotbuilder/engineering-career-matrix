import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobLevelsTable, competencyCategoriesTable, competencySubCategoriesTable } from '../db/schema';
import { type GetJobLevelInput } from '../schema';
import { deleteJobLevel } from '../handlers/delete_job_level';
import { eq } from 'drizzle-orm';

// Test input for deleting a job level
const testInput: GetJobLevelInput = {
  id: 'L1'
};

describe('deleteJobLevel', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing job level', async () => {
    // Create a test job level first
    await db.insert(jobLevelsTable)
      .values({
        id: 'L1',
        name: 'Junior Engineer',
        track: 'IC',
        summaryDescription: 'Entry-level individual contributor',
        trajectoryInfo: null,
        scopeOfInfluenceSummary: 'Team level',
        ownershipSummary: 'Small features'
      })
      .execute();

    // Verify the job level exists before deletion
    const beforeDeletion = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, 'L1'))
      .execute();
    expect(beforeDeletion).toHaveLength(1);

    // Delete the job level
    const result = await deleteJobLevel(testInput);

    expect(result).toBe(true);

    // Verify the job level is deleted
    const afterDeletion = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, 'L1'))
      .execute();
    expect(afterDeletion).toHaveLength(0);
  });

  it('should return false when job level does not exist', async () => {
    const result = await deleteJobLevel({ id: 'NONEXISTENT' });

    expect(result).toBe(false);
  });

  it('should clean up job level references in competency sub-categories', async () => {
    // Create prerequisite data
    await db.insert(jobLevelsTable)
      .values({
        id: 'L1',
        name: 'Junior Engineer',
        track: 'IC',
        summaryDescription: 'Entry-level individual contributor',
        trajectoryInfo: null,
        scopeOfInfluenceSummary: 'Team level',
        ownershipSummary: 'Small features'
      })
      .execute();

    await db.insert(jobLevelsTable)
      .values({
        id: 'L2',
        name: 'Mid Engineer',
        track: 'IC',
        summaryDescription: 'Mid-level individual contributor',
        trajectoryInfo: null,
        scopeOfInfluenceSummary: 'Team level',
        ownershipSummary: 'Medium features'
      })
      .execute();

    await db.insert(competencyCategoriesTable)
      .values({
        id: 'technical-skills',
        name: 'Technical Skills'
      })
      .execute();

    // Create sub-category with descriptions for multiple levels including L1
    await db.insert(competencySubCategoriesTable)
      .values({
        id: 'coding',
        name: 'Coding',
        categoryId: 'technical-skills',
        descriptionsByLevel: {
          'L1': 'Basic coding skills',
          'L2': 'Intermediate coding skills'
        }
      })
      .execute();

    // Verify descriptions exist before deletion
    const beforeDeletion = await db.select()
      .from(competencySubCategoriesTable)
      .where(eq(competencySubCategoriesTable.id, 'coding'))
      .execute();
    
    const descriptionsBefore = beforeDeletion[0].descriptionsByLevel as Record<string, string>;
    expect(descriptionsBefore['L1']).toBeDefined();
    expect(descriptionsBefore['L2']).toBeDefined();

    // Delete the job level
    const result = await deleteJobLevel(testInput);
    expect(result).toBe(true);

    // Verify L1 reference is removed from descriptions
    const afterDeletion = await db.select()
      .from(competencySubCategoriesTable)
      .where(eq(competencySubCategoriesTable.id, 'coding'))
      .execute();
    
    const descriptionsAfter = afterDeletion[0].descriptionsByLevel as Record<string, string>;
    expect(descriptionsAfter['L1']).toBeUndefined();
    expect(descriptionsAfter['L2']).toBeDefined(); // L2 should remain
    expect(descriptionsAfter['L2']).toBe('Intermediate coding skills');
  });

  it('should handle multiple sub-categories with job level references', async () => {
    // Create test job level
    await db.insert(jobLevelsTable)
      .values({
        id: 'L1',
        name: 'Junior Engineer',
        track: 'IC',
        summaryDescription: 'Entry-level individual contributor',
        trajectoryInfo: null,
        scopeOfInfluenceSummary: 'Team level',
        ownershipSummary: 'Small features'
      })
      .execute();

    // Create competency category
    await db.insert(competencyCategoriesTable)
      .values({
        id: 'technical-skills',
        name: 'Technical Skills'
      })
      .execute();

    // Create multiple sub-categories with L1 references
    await db.insert(competencySubCategoriesTable)
      .values([
        {
          id: 'coding',
          name: 'Coding',
          categoryId: 'technical-skills',
          descriptionsByLevel: {
            'L1': 'Basic coding skills',
            'L2': 'Intermediate coding skills'
          }
        },
        {
          id: 'testing',
          name: 'Testing',
          categoryId: 'technical-skills',
          descriptionsByLevel: {
            'L1': 'Basic testing knowledge',
            'L3': 'Advanced testing practices'
          }
        },
        {
          id: 'no-l1-ref',
          name: 'No L1 Reference',
          categoryId: 'technical-skills',
          descriptionsByLevel: {
            'L2': 'Mid level skills',
            'L3': 'Senior level skills'
          }
        }
      ])
      .execute();

    // Delete the job level
    const result = await deleteJobLevel(testInput);
    expect(result).toBe(true);

    // Verify L1 references are removed from all sub-categories
    const allSubCategories = await db.select()
      .from(competencySubCategoriesTable)
      .execute();

    for (const subCategory of allSubCategories) {
      const descriptions = subCategory.descriptionsByLevel as Record<string, string>;
      expect(descriptions['L1']).toBeUndefined();
      
      // Verify other levels remain intact
      if (subCategory.id === 'coding') {
        expect(descriptions['L2']).toBe('Intermediate coding skills');
      } else if (subCategory.id === 'testing') {
        expect(descriptions['L3']).toBe('Advanced testing practices');
      } else if (subCategory.id === 'no-l1-ref') {
        expect(descriptions['L2']).toBe('Mid level skills');
        expect(descriptions['L3']).toBe('Senior level skills');
      }
    }
  });

  it('should handle sub-categories with empty descriptions objects', async () => {
    // Create test job level
    await db.insert(jobLevelsTable)
      .values({
        id: 'L1',
        name: 'Junior Engineer',
        track: 'IC',
        summaryDescription: 'Entry-level individual contributor',
        trajectoryInfo: null
      })
      .execute();

    // Create competency category
    await db.insert(competencyCategoriesTable)
      .values({
        id: 'technical-skills',
        name: 'Technical Skills'
      })
      .execute();

    // Create sub-category with empty descriptions
    await db.insert(competencySubCategoriesTable)
      .values({
        id: 'empty-descriptions',
        name: 'Empty Descriptions',
        categoryId: 'technical-skills',
        descriptionsByLevel: {}
      })
      .execute();

    // This should not throw an error even with empty descriptions
    const result = await deleteJobLevel(testInput);
    expect(result).toBe(true);

    // Verify job level is deleted
    const jobLevelCheck = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, 'L1'))
      .execute();
    expect(jobLevelCheck).toHaveLength(0);
  });

  it('should update the updatedAt timestamp for modified sub-categories', async () => {
    // Create test data
    await db.insert(jobLevelsTable)
      .values({
        id: 'L1',
        name: 'Junior Engineer',
        track: 'IC',
        summaryDescription: 'Entry-level individual contributor',
        trajectoryInfo: null
      })
      .execute();

    await db.insert(competencyCategoriesTable)
      .values({
        id: 'technical-skills',
        name: 'Technical Skills'
      })
      .execute();

    // Create sub-category with L1 reference
    const initialTime = new Date('2023-01-01T00:00:00Z');
    await db.insert(competencySubCategoriesTable)
      .values({
        id: 'coding',
        name: 'Coding',
        categoryId: 'technical-skills',
        descriptionsByLevel: {
          'L1': 'Basic coding skills',
          'L2': 'Intermediate coding skills'
        }
      })
      .execute();

    // Delete the job level
    const result = await deleteJobLevel(testInput);
    expect(result).toBe(true);

    // Check that updatedAt timestamp was updated for the modified sub-category
    const updatedSubCategory = await db.select()
      .from(competencySubCategoriesTable)
      .where(eq(competencySubCategoriesTable.id, 'coding'))
      .execute();

    expect(updatedSubCategory[0].updatedAt).toBeInstanceOf(Date);
    // The updatedAt should be more recent than the initial creation time
    expect(updatedSubCategory[0].updatedAt.getTime()).toBeGreaterThan(initialTime.getTime());
  });
});
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { 
  jobLevelsTable, 
  competencyCategoriesTable, 
  competencySubCategoriesTable, 
  metadataTable, 
  editHistoryTable 
} from '../db/schema';
import { seedData } from '../handlers/seed_data';
import { eq } from 'drizzle-orm';

describe('seedData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should seed the database successfully', async () => {
    const result = await seedData();

    expect(result.success).toBe(true);
    expect(result.message).toContain('Database seeded successfully');
  });

  it('should create all job levels', async () => {
    await seedData();

    const jobLevels = await db.select().from(jobLevelsTable).execute();
    
    expect(jobLevels).toHaveLength(9);
    
    // Check specific job levels
    const icLevels = jobLevels.filter(level => level.track === 'IC');
    const tlLevels = jobLevels.filter(level => level.track === 'TL');
    const emLevels = jobLevels.filter(level => level.track === 'EM');
    const directorLevels = jobLevels.filter(level => level.track === 'Director');
    
    expect(icLevels).toHaveLength(4); // L1_L2, L3, L4, L5
    expect(tlLevels).toHaveLength(2); // TL1, TL2
    expect(emLevels).toHaveLength(2); // EM1, EM2
    expect(directorLevels).toHaveLength(1); // DIR1

    // Verify specific level data
    const seniorEngineer = jobLevels.find(level => level.id === 'L4');
    expect(seniorEngineer?.name).toBe('Senior Software Engineer');
    expect(seniorEngineer?.track).toBe('IC');
    expect(seniorEngineer?.summaryDescription).toContain('Experienced engineer');
    expect(seniorEngineer?.trajectoryInfo).toContain('3-5 years');
    expect(seniorEngineer?.scopeOfInfluenceSummary).toContain('Major features');
    expect(seniorEngineer?.ownershipSummary).toContain('technical architecture');
  });

  it('should create all competency categories', async () => {
    await seedData();

    const categories = await db.select().from(competencyCategoriesTable).execute();
    
    expect(categories).toHaveLength(5);

    const categoryNames = categories.map(cat => cat.name);
    expect(categoryNames).toContain('Technical Skills');
    expect(categoryNames).toContain('Leadership & People');
    expect(categoryNames).toContain('Communication');
    expect(categoryNames).toContain('Execution & Delivery');
    expect(categoryNames).toContain('Strategic Thinking');

    // Verify specific category
    const technicalCategory = categories.find(cat => cat.id === 'technical');
    expect(technicalCategory?.name).toBe('Technical Skills');
    expect(technicalCategory?.createdAt).toBeInstanceOf(Date);
  });

  it('should create all competency sub-categories with proper relationships', async () => {
    await seedData();

    const subCategories = await db.select().from(competencySubCategoriesTable).execute();
    
    expect(subCategories).toHaveLength(10);

    // Check technical sub-categories
    const technicalSubCategories = subCategories.filter(sub => sub.categoryId === 'technical');
    expect(technicalSubCategories).toHaveLength(2); // coding, system_design

    // Check leadership sub-categories
    const leadershipSubCategories = subCategories.filter(sub => sub.categoryId === 'leadership');
    expect(leadershipSubCategories).toHaveLength(2); // mentoring, team_leadership

    // Verify specific sub-category with descriptions
    const codingSubCategory = subCategories.find(sub => sub.id === 'coding');
    expect(codingSubCategory?.name).toBe('Coding & Implementation');
    expect(codingSubCategory?.categoryId).toBe('technical');
    
    const descriptions = codingSubCategory?.descriptionsByLevel as Record<string, string>;
    expect(descriptions).toBeDefined();
    expect(descriptions['L1_L2']).toContain('Writes clean, functional code');
    expect(descriptions['L4']).toContain('Writes exemplary code');
    expect(descriptions['L5']).toContain('Architect-level coding');
    expect(descriptions['TL1']).toContain('team technical guidance');
    expect(descriptions['EM1']).toContain('team technical growth');
    expect(descriptions['DIR1']).toContain('Strategic technical vision');
  });

  it('should create metadata with goals and principles', async () => {
    await seedData();

    const metadata = await db.select().from(metadataTable).execute();
    
    expect(metadata).toHaveLength(1);

    const metadataRecord = metadata[0];
    expect(metadataRecord.lastUpdated).toBeDefined();
    expect(new Date(metadataRecord.lastUpdated)).toBeInstanceOf(Date);

    const goals = metadataRecord.goals as string[];
    expect(Array.isArray(goals)).toBe(true);
    expect(goals).toHaveLength(5);
    expect(goals[0]).toContain('clear career progression paths');

    const keyPrinciples = metadataRecord.keyPrinciples as string[];
    expect(Array.isArray(keyPrinciples)).toBe(true);
    expect(keyPrinciples).toHaveLength(5);
    expect(keyPrinciples[0]).toContain('Growth is not always upward');
  });

  it('should create edit history entries', async () => {
    await seedData();

    const editHistory = await db.select().from(editHistoryTable).execute();
    
    expect(editHistory).toHaveLength(3);

    // Verify entries are ordered by date (most recent first in our seed data)
    const descriptions = editHistory.map(entry => entry.description);
    expect(descriptions[0]).toContain('Initial career ladder framework');
    expect(descriptions[1]).toContain('detailed competency descriptions');
    expect(descriptions[2]).toContain('progression timelines');

    // Verify date format
    editHistory.forEach(entry => {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.createdAt).toBeInstanceOf(Date);
    });
  });

  it('should be idempotent - running multiple times should not create duplicates', async () => {
    // Run seed data twice
    await seedData();
    await seedData();

    // Check that we still have the expected counts
    const jobLevels = await db.select().from(jobLevelsTable).execute();
    const categories = await db.select().from(competencyCategoriesTable).execute();
    const subCategories = await db.select().from(competencySubCategoriesTable).execute();
    const metadata = await db.select().from(metadataTable).execute();
    const editHistory = await db.select().from(editHistoryTable).execute();

    expect(jobLevels).toHaveLength(9);
    expect(categories).toHaveLength(5);
    expect(subCategories).toHaveLength(10);
    expect(metadata).toHaveLength(1);
    expect(editHistory).toHaveLength(3);
  });

  it('should clear existing data before seeding', async () => {
    // First, manually insert some data
    await db.insert(jobLevelsTable).values({
      id: 'test-level',
      name: 'Test Level',
      track: 'IC',
      summaryDescription: 'Test description'
    }).execute();

    await db.insert(competencyCategoriesTable).values({
      id: 'test-category',
      name: 'Test Category'
    }).execute();

    // Verify the manual data exists
    let jobLevels = await db.select().from(jobLevelsTable).execute();
    let categories = await db.select().from(competencyCategoriesTable).execute();
    expect(jobLevels).toHaveLength(1);
    expect(categories).toHaveLength(1);

    // Run seed data
    await seedData();

    // Verify old data is cleared and new data is present
    jobLevels = await db.select().from(jobLevelsTable).execute();
    categories = await db.select().from(competencyCategoriesTable).execute();
    
    expect(jobLevels).toHaveLength(9);
    expect(categories).toHaveLength(5);
    
    // Verify our test data is gone
    const testLevel = jobLevels.find(level => level.id === 'test-level');
    const testCategory = categories.find(cat => cat.id === 'test-category');
    expect(testLevel).toBeUndefined();
    expect(testCategory).toBeUndefined();
  });

  it('should handle foreign key relationships correctly', async () => {
    await seedData();

    // Verify that all sub-categories reference valid categories
    const subCategories = await db.select().from(competencySubCategoriesTable).execute();
    const categories = await db.select().from(competencyCategoriesTable).execute();
    
    const categoryIds = categories.map(cat => cat.id);
    
    subCategories.forEach(subCategory => {
      expect(categoryIds).toContain(subCategory.categoryId);
    });

    // Verify specific relationships
    const technicalSubCategories = subCategories.filter(sub => sub.categoryId === 'technical');
    expect(technicalSubCategories.map(sub => sub.name)).toContain('Coding & Implementation');
    expect(technicalSubCategories.map(sub => sub.name)).toContain('System Design');

    const leadershipSubCategories = subCategories.filter(sub => sub.categoryId === 'leadership');
    expect(leadershipSubCategories.map(sub => sub.name)).toContain('Mentoring & Coaching');
    expect(leadershipSubCategories.map(sub => sub.name)).toContain('Team Leadership');
  });

  it('should create competency descriptions for all job levels', async () => {
    await seedData();

    const subCategories = await db.select().from(competencySubCategoriesTable).execute();
    const jobLevels = await db.select().from(jobLevelsTable).execute();
    
    const jobLevelIds = jobLevels.map(level => level.id);
    
    // Verify each sub-category has descriptions for all job levels
    subCategories.forEach(subCategory => {
      const descriptions = subCategory.descriptionsByLevel as Record<string, string>;
      
      jobLevelIds.forEach(levelId => {
        expect(descriptions[levelId]).toBeDefined();
        expect(descriptions[levelId]).toContain.length > 0;
      });
    });

    // Verify progression makes sense - check that descriptions evolve across levels
    const codingSubCategory = subCategories.find(sub => sub.id === 'coding');
    const codingDescriptions = codingSubCategory?.descriptionsByLevel as Record<string, string>;
    
    expect(codingDescriptions['L1_L2']).toContain('guidance');
    expect(codingDescriptions['L3']).toContain('independently');
    expect(codingDescriptions['L4']).toContain('exemplary');
    expect(codingDescriptions['L5']).toContain('Architect-level');
  });
});
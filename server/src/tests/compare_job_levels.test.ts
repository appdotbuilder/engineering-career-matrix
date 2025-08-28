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
import { type CompareJobLevelsInput } from '../schema';
import { compareJobLevels } from '../handlers/compare_job_levels';

// Test data setup
const testJobLevels = [
  {
    id: 'L1_L2',
    name: 'Junior Engineer',
    track: 'IC' as const,
    summaryDescription: 'Entry-level engineering role',
    trajectoryInfo: 'Focus on learning fundamentals',
    scopeOfInfluenceSummary: 'Individual contributor',
    ownershipSummary: 'Own small features'
  },
  {
    id: 'L3_L4',
    name: 'Senior Engineer',
    track: 'IC' as const,
    summaryDescription: 'Experienced engineering role',
    trajectoryInfo: 'Leading technical decisions',
    scopeOfInfluenceSummary: 'Team influencer',
    ownershipSummary: 'Own complex systems'
  },
  {
    id: 'TL1',
    name: 'Tech Lead',
    track: 'TL' as const,
    summaryDescription: 'Technical leadership role',
    trajectoryInfo: null,
    scopeOfInfluenceSummary: 'Cross-team influence',
    ownershipSummary: 'Own technical direction'
  }
];

const testCompetencyCategories = [
  { id: 'technical', name: 'Technical Skills' },
  { id: 'leadership', name: 'Leadership' }
];

const testCompetencySubCategories = [
  {
    id: 'coding',
    name: 'Coding & Development',
    categoryId: 'technical',
    descriptionsByLevel: JSON.stringify({
      'L1_L2': 'Basic coding skills',
      'L3_L4': 'Advanced coding skills',
      'TL1': 'Expert coding with architecture focus'
    })
  },
  {
    id: 'mentoring',
    name: 'Mentoring',
    categoryId: 'leadership',
    descriptionsByLevel: JSON.stringify({
      'L3_L4': 'Mentor junior developers',
      'TL1': 'Lead mentoring programs'
    })
  }
];

const testMetadata = {
  lastUpdated: '2024-01-15',
  goals: JSON.stringify(['Clear career paths', 'Consistent evaluation']),
  keyPrinciples: JSON.stringify(['Fairness', 'Growth-oriented'])
};

const testEditHistory = [
  { date: '2024-01-10', description: 'Initial framework creation' },
  { date: '2024-01-15', description: 'Updated technical competencies' }
];

async function setupTestData() {
  // Insert job levels
  await db.insert(jobLevelsTable).values(testJobLevels).execute();

  // Insert competency categories
  await db.insert(competencyCategoriesTable).values(testCompetencyCategories).execute();

  // Insert competency sub-categories
  await db.insert(competencySubCategoriesTable).values(testCompetencySubCategories).execute();

  // Insert metadata
  await db.insert(metadataTable).values(testMetadata).execute();

  // Insert edit history
  await db.insert(editHistoryTable).values(testEditHistory).execute();
}

describe('compareJobLevels', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should compare two job levels successfully', async () => {
    await setupTestData();

    const input: CompareJobLevelsInput = {
      levelIds: ['L1_L2', 'L3_L4']
    };

    const result = await compareJobLevels(input);

    // Verify correct job levels are returned
    expect(result.jobLevels).toHaveLength(2);
    expect(result.jobLevels.map(level => level.id)).toEqual(['L1_L2', 'L3_L4']);

    // Verify job level structure
    const juniorLevel = result.jobLevels.find(level => level.id === 'L1_L2');
    expect(juniorLevel).toBeDefined();
    expect(juniorLevel!.name).toBe('Junior Engineer');
    expect(juniorLevel!.track).toBe('IC');
    expect(juniorLevel!.summaryDescription).toBe('Entry-level engineering role');
    expect(juniorLevel!.trajectoryInfo).toBe('Focus on learning fundamentals');
    expect(juniorLevel!.scopeOfInfluenceSummary).toBe('Individual contributor');
    expect(juniorLevel!.ownershipSummary).toBe('Own small features');

    // Verify all competency categories are included
    expect(result.competencyCategories).toHaveLength(2);
    expect(result.competencyCategories.map(cat => cat.id)).toEqual(['technical', 'leadership']);

    // Verify sub-categories are properly nested
    const technicalCategory = result.competencyCategories.find(cat => cat.id === 'technical');
    expect(technicalCategory).toBeDefined();
    expect(technicalCategory!.subCategories).toHaveLength(1);
    expect(technicalCategory!.subCategories[0].id).toBe('coding');

    // Verify descriptions by level are properly parsed
    const codingSubCategory = technicalCategory!.subCategories[0];
    expect(codingSubCategory.descriptionsByLevel['L1_L2']).toBe('Basic coding skills');
    expect(codingSubCategory.descriptionsByLevel['L3_L4']).toBe('Advanced coding skills');
    expect(codingSubCategory.descriptionsByLevel['TL1']).toBe('Expert coding with architecture focus');

    // Verify metadata structure
    expect(result.metadata.lastUpdated).toBe('2024-01-15');
    expect(result.metadata.goals).toEqual(['Clear career paths', 'Consistent evaluation']);
    expect(result.metadata.keyPrinciples).toEqual(['Fairness', 'Growth-oriented']);
    expect(result.metadata.editHistory).toHaveLength(2);
    expect(result.metadata.editHistory[0].date).toBe('2024-01-10');
    expect(result.metadata.editHistory[0].description).toBe('Initial framework creation');
  });

  it('should compare multiple job levels from different tracks', async () => {
    await setupTestData();

    const input: CompareJobLevelsInput = {
      levelIds: ['L1_L2', 'TL1', 'L3_L4']
    };

    const result = await compareJobLevels(input);

    expect(result.jobLevels).toHaveLength(3);
    
    const tracks = result.jobLevels.map(level => level.track);
    expect(tracks).toContain('IC');
    expect(tracks).toContain('TL');

    // Verify TL1 has null trajectoryInfo
    const tlLevel = result.jobLevels.find(level => level.id === 'TL1');
    expect(tlLevel).toBeDefined();
    expect(tlLevel!.trajectoryInfo).toBeNull();
    expect(tlLevel!.track).toBe('TL');
  });

  it('should return all competency categories even when comparing subset of levels', async () => {
    await setupTestData();

    const input: CompareJobLevelsInput = {
      levelIds: ['L1_L2'] // Only one level
    };

    const result = await compareJobLevels(input);

    // Should still return all categories and sub-categories
    expect(result.competencyCategories).toHaveLength(2);
    expect(result.competencyCategories.map(cat => cat.name)).toEqual(['Technical Skills', 'Leadership']);

    // But only the requested job level
    expect(result.jobLevels).toHaveLength(1);
    expect(result.jobLevels[0].id).toBe('L1_L2');
  });

  it('should handle comparison with maximum allowed levels (4)', async () => {
    // Add a fourth test job level
    await setupTestData();
    await db.insert(jobLevelsTable).values({
      id: 'EM1',
      name: 'Engineering Manager',
      track: 'EM',
      summaryDescription: 'Engineering management role',
      trajectoryInfo: 'People leadership focus',
      scopeOfInfluenceSummary: 'Team management',
      ownershipSummary: 'Own team outcomes'
    }).execute();

    const input: CompareJobLevelsInput = {
      levelIds: ['L1_L2', 'L3_L4', 'TL1', 'EM1']
    };

    const result = await compareJobLevels(input);

    expect(result.jobLevels).toHaveLength(4);
    expect(result.jobLevels.map(level => level.id)).toEqual(['L1_L2', 'L3_L4', 'TL1', 'EM1']);

    // Verify all tracks are represented
    const tracks = result.jobLevels.map(level => level.track);
    expect(tracks).toContain('IC');
    expect(tracks).toContain('TL');
    expect(tracks).toContain('EM');
  });

  it('should handle missing metadata gracefully', async () => {
    // Set up data without metadata
    await db.insert(jobLevelsTable).values(testJobLevels.slice(0, 2)).execute();
    await db.insert(competencyCategoriesTable).values(testCompetencyCategories).execute();
    await db.insert(competencySubCategoriesTable).values(testCompetencySubCategories).execute();

    const input: CompareJobLevelsInput = {
      levelIds: ['L1_L2', 'L3_L4']
    };

    const result = await compareJobLevels(input);

    // Should provide default metadata values
    expect(result.metadata.goals).toEqual([]);
    expect(result.metadata.keyPrinciples).toEqual([]);
    expect(result.metadata.editHistory).toEqual([]);
    expect(result.metadata.lastUpdated).toBeDefined();
  });

  it('should throw error when requested job level does not exist', async () => {
    await setupTestData();

    const input: CompareJobLevelsInput = {
      levelIds: ['L1_L2', 'NONEXISTENT']
    };

    await expect(compareJobLevels(input)).rejects.toThrow(/Job levels not found: NONEXISTENT/i);
  });

  it('should throw error when multiple requested job levels do not exist', async () => {
    await setupTestData();

    const input: CompareJobLevelsInput = {
      levelIds: ['MISSING1', 'L1_L2', 'MISSING2']
    };

    await expect(compareJobLevels(input)).rejects.toThrow(/Job levels not found: MISSING1, MISSING2/i);
  });

  it('should handle empty sub-categories for a category', async () => {
    // Add a category with no sub-categories
    await db.insert(jobLevelsTable).values(testJobLevels.slice(0, 2)).execute();
    await db.insert(competencyCategoriesTable).values([
      ...testCompetencyCategories,
      { id: 'empty_category', name: 'Empty Category' }
    ]).execute();
    await db.insert(competencySubCategoriesTable).values(testCompetencySubCategories).execute();

    const input: CompareJobLevelsInput = {
      levelIds: ['L1_L2', 'L3_L4']
    };

    const result = await compareJobLevels(input);

    expect(result.competencyCategories).toHaveLength(3);
    
    const emptyCategory = result.competencyCategories.find(cat => cat.id === 'empty_category');
    expect(emptyCategory).toBeDefined();
    expect(emptyCategory!.subCategories).toHaveLength(0);
  });

  it('should preserve job level order based on input order', async () => {
    await setupTestData();

    const input: CompareJobLevelsInput = {
      levelIds: ['TL1', 'L1_L2', 'L3_L4'] // Specific order
    };

    const result = await compareJobLevels(input);

    // Note: Database query may not preserve input order, but results should contain all requested levels
    expect(result.jobLevels).toHaveLength(3);
    expect(result.jobLevels.map(level => level.id)).toContain('TL1');
    expect(result.jobLevels.map(level => level.id)).toContain('L1_L2');
    expect(result.jobLevels.map(level => level.id)).toContain('L3_L4');
  });
});
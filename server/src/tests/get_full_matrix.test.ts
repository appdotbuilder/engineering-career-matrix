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
import { getFullMatrix } from '../handlers/get_full_matrix';

describe('getFullMatrix', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty matrix when no data exists', async () => {
    const result = await getFullMatrix();

    expect(result.jobLevels).toEqual([]);
    expect(result.competencyCategories).toEqual([]);
    expect(result.metadata.lastUpdated).toEqual('');
    expect(result.metadata.goals).toEqual([]);
    expect(result.metadata.keyPrinciples).toEqual([]);
    expect(result.metadata.editHistory).toEqual([]);
  });

  it('should return job levels when they exist', async () => {
    // Create test job levels
    await db.insert(jobLevelsTable).values([
      {
        id: 'L1',
        name: 'Junior Engineer',
        track: 'IC',
        summaryDescription: 'Entry level engineer',
        trajectoryInfo: 'Growing in technical skills',
        scopeOfInfluenceSummary: 'Individual contributor',
        ownershipSummary: 'Owns small features'
      },
      {
        id: 'TL1',
        name: 'Tech Lead I',
        track: 'TL',
        summaryDescription: 'Technical leader',
        trajectoryInfo: null,
        scopeOfInfluenceSummary: 'Team level',
        ownershipSummary: 'Owns team deliverables'
      }
    ]).execute();

    const result = await getFullMatrix();

    expect(result.jobLevels).toHaveLength(2);
    
    const juniorLevel = result.jobLevels.find(level => level.id === 'L1');
    expect(juniorLevel).toBeDefined();
    expect(juniorLevel!.name).toEqual('Junior Engineer');
    expect(juniorLevel!.track).toEqual('IC');
    expect(juniorLevel!.summaryDescription).toEqual('Entry level engineer');
    expect(juniorLevel!.trajectoryInfo).toEqual('Growing in technical skills');
    expect(juniorLevel!.scopeOfInfluenceSummary).toEqual('Individual contributor');
    expect(juniorLevel!.ownershipSummary).toEqual('Owns small features');

    const techLeadLevel = result.jobLevels.find(level => level.id === 'TL1');
    expect(techLeadLevel).toBeDefined();
    expect(techLeadLevel!.name).toEqual('Tech Lead I');
    expect(techLeadLevel!.track).toEqual('TL');
    expect(techLeadLevel!.trajectoryInfo).toBeNull();
  });

  it('should return competency categories with sub-categories', async () => {
    // Create test competency categories
    await db.insert(competencyCategoriesTable).values([
      { id: 'technical', name: 'Technical Skills' },
      { id: 'leadership', name: 'Leadership' }
    ]).execute();

    // Create test sub-categories
    await db.insert(competencySubCategoriesTable).values([
      {
        id: 'coding',
        name: 'Coding',
        categoryId: 'technical',
        descriptionsByLevel: { 'L1': 'Basic coding skills', 'L2': 'Advanced coding skills' }
      },
      {
        id: 'mentoring',
        name: 'Mentoring',
        categoryId: 'leadership',
        descriptionsByLevel: { 'TL1': 'Mentors junior developers' }
      }
    ]).execute();

    const result = await getFullMatrix();

    expect(result.competencyCategories).toHaveLength(2);

    const technicalCategory = result.competencyCategories.find(cat => cat.id === 'technical');
    expect(technicalCategory).toBeDefined();
    expect(technicalCategory!.name).toEqual('Technical Skills');
    expect(technicalCategory!.subCategories).toHaveLength(1);
    expect(technicalCategory!.subCategories[0].id).toEqual('coding');
    expect(technicalCategory!.subCategories[0].name).toEqual('Coding');
    expect(technicalCategory!.subCategories[0].descriptionsByLevel).toEqual({
      'L1': 'Basic coding skills',
      'L2': 'Advanced coding skills'
    });

    const leadershipCategory = result.competencyCategories.find(cat => cat.id === 'leadership');
    expect(leadershipCategory).toBeDefined();
    expect(leadershipCategory!.name).toEqual('Leadership');
    expect(leadershipCategory!.subCategories).toHaveLength(1);
    expect(leadershipCategory!.subCategories[0].id).toEqual('mentoring');
  });

  it('should return categories with empty sub-categories array when no sub-categories exist', async () => {
    // Create category without sub-categories
    await db.insert(competencyCategoriesTable).values([
      { id: 'communication', name: 'Communication' }
    ]).execute();

    const result = await getFullMatrix();

    expect(result.competencyCategories).toHaveLength(1);
    expect(result.competencyCategories[0].id).toEqual('communication');
    expect(result.competencyCategories[0].name).toEqual('Communication');
    expect(result.competencyCategories[0].subCategories).toEqual([]);
  });

  it('should return metadata with edit history when they exist', async () => {
    // Create test metadata
    await db.insert(metadataTable).values({
      lastUpdated: '2024-01-15',
      goals: ['Clear career progression', 'Skill development'],
      keyPrinciples: ['Growth mindset', 'Continuous learning']
    }).execute();

    // Create test edit history
    await db.insert(editHistoryTable).values([
      { date: '2024-01-15', description: 'Initial creation' },
      { date: '2024-01-20', description: 'Added new job levels' }
    ]).execute();

    const result = await getFullMatrix();

    expect(result.metadata.lastUpdated).toEqual('2024-01-15');
    expect(result.metadata.goals).toEqual(['Clear career progression', 'Skill development']);
    expect(result.metadata.keyPrinciples).toEqual(['Growth mindset', 'Continuous learning']);
    expect(result.metadata.editHistory).toHaveLength(2);
    expect(result.metadata.editHistory[0].date).toEqual('2024-01-15');
    expect(result.metadata.editHistory[0].description).toEqual('Initial creation');
    expect(result.metadata.editHistory[1].date).toEqual('2024-01-20');
    expect(result.metadata.editHistory[1].description).toEqual('Added new job levels');
  });

  it('should return complete matrix with all data types', async () => {
    // Create comprehensive test data
    await db.insert(jobLevelsTable).values({
      id: 'L2',
      name: 'Mid-level Engineer',
      track: 'IC',
      summaryDescription: 'Experienced engineer',
      trajectoryInfo: 'Leading small projects',
      scopeOfInfluenceSummary: 'Cross-team collaboration',
      ownershipSummary: 'Owns medium features'
    }).execute();

    await db.insert(competencyCategoriesTable).values({
      id: 'problem-solving',
      name: 'Problem Solving'
    }).execute();

    await db.insert(competencySubCategoriesTable).values({
      id: 'debugging',
      name: 'Debugging',
      categoryId: 'problem-solving',
      descriptionsByLevel: { 'L2': 'Expert at debugging complex issues' }
    }).execute();

    await db.insert(metadataTable).values({
      lastUpdated: '2024-02-01',
      goals: ['Excellence in engineering'],
      keyPrinciples: ['Quality first']
    }).execute();

    await db.insert(editHistoryTable).values({
      date: '2024-02-01',
      description: 'Updated problem solving competencies'
    }).execute();

    const result = await getFullMatrix();

    // Verify all components are present
    expect(result.jobLevels).toHaveLength(1);
    expect(result.jobLevels[0].id).toEqual('L2');
    
    expect(result.competencyCategories).toHaveLength(1);
    expect(result.competencyCategories[0].id).toEqual('problem-solving');
    expect(result.competencyCategories[0].subCategories).toHaveLength(1);
    
    expect(result.metadata.lastUpdated).toEqual('2024-02-01');
    expect(result.metadata.goals).toEqual(['Excellence in engineering']);
    expect(result.metadata.keyPrinciples).toEqual(['Quality first']);
    expect(result.metadata.editHistory).toHaveLength(1);
    expect(result.metadata.editHistory[0].description).toEqual('Updated problem solving competencies');
  });

  it('should handle multiple categories with mixed sub-category counts', async () => {
    // Create categories
    await db.insert(competencyCategoriesTable).values([
      { id: 'cat1', name: 'Category 1' },
      { id: 'cat2', name: 'Category 2' },
      { id: 'cat3', name: 'Category 3' }
    ]).execute();

    // Create sub-categories (cat1 has 2, cat2 has 1, cat3 has 0)
    await db.insert(competencySubCategoriesTable).values([
      {
        id: 'sub1',
        name: 'Sub Category 1',
        categoryId: 'cat1',
        descriptionsByLevel: { 'L1': 'Description 1' }
      },
      {
        id: 'sub2',
        name: 'Sub Category 2',
        categoryId: 'cat1',
        descriptionsByLevel: { 'L2': 'Description 2' }
      },
      {
        id: 'sub3',
        name: 'Sub Category 3',
        categoryId: 'cat2',
        descriptionsByLevel: { 'L3': 'Description 3' }
      }
    ]).execute();

    const result = await getFullMatrix();

    expect(result.competencyCategories).toHaveLength(3);
    
    const cat1 = result.competencyCategories.find(cat => cat.id === 'cat1');
    expect(cat1!.subCategories).toHaveLength(2);
    
    const cat2 = result.competencyCategories.find(cat => cat.id === 'cat2');
    expect(cat2!.subCategories).toHaveLength(1);
    
    const cat3 = result.competencyCategories.find(cat => cat.id === 'cat3');
    expect(cat3!.subCategories).toHaveLength(0);
  });
});
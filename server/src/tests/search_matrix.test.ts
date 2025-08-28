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
import { type SearchInput } from '../schema';
import { searchMatrix } from '../handlers/search_matrix';

// Test data setup
const setupTestData = async () => {
  // Create job levels
  await db.insert(jobLevelsTable).values([
    {
      id: 'L1',
      name: 'Software Engineer I',
      track: 'IC',
      summaryDescription: 'Entry level engineer focusing on learning and basic tasks',
      trajectoryInfo: 'Learning fundamentals',
      scopeOfInfluenceSummary: 'Individual tasks',
      ownershipSummary: 'Owns small features'
    },
    {
      id: 'L2',
      name: 'Software Engineer II',
      track: 'IC',
      summaryDescription: 'Mid-level engineer with proven abilities',
      trajectoryInfo: 'Developing expertise',
      scopeOfInfluenceSummary: 'Team collaboration',
      ownershipSummary: 'Owns medium complexity features'
    },
    {
      id: 'TL1',
      name: 'Tech Lead I',
      track: 'TL',
      summaryDescription: 'Technical leadership role with team responsibilities',
      trajectoryInfo: 'Leading technical decisions',
      scopeOfInfluenceSummary: 'Technical direction for team',
      ownershipSummary: 'Owns technical architecture'
    }
  ]).execute();

  // Create competency categories
  await db.insert(competencyCategoriesTable).values([
    { id: 'technical', name: 'Technical Skills' },
    { id: 'leadership', name: 'Leadership & Influence' }
  ]).execute();

  // Create competency sub-categories
  await db.insert(competencySubCategoriesTable).values([
    {
      id: 'coding',
      name: 'Programming & Development',
      categoryId: 'technical',
      descriptionsByLevel: {
        'L1': 'Basic programming skills with guidance',
        'L2': 'Independent programming with code reviews',
        'TL1': 'Advanced programming with architectural input'
      }
    },
    {
      id: 'system-design',
      name: 'System Design',
      categoryId: 'technical',
      descriptionsByLevel: {
        'L1': 'Understands basic system concepts',
        'L2': 'Designs small to medium systems',
        'TL1': 'Designs complex distributed systems'
      }
    },
    {
      id: 'mentoring',
      name: 'Mentoring & Coaching',
      categoryId: 'leadership',
      descriptionsByLevel: {
        'L2': 'Mentors junior developers occasionally',
        'TL1': 'Regular mentoring and team development'
      }
    }
  ]).execute();

  // Create metadata
  await db.insert(metadataTable).values({
    lastUpdated: '2024-01-15',
    goals: ['Clear career progression', 'Skill development focus'],
    keyPrinciples: ['Growth mindset', 'Technical excellence']
  }).execute();

  // Create edit history
  await db.insert(editHistoryTable).values([
    { date: '2024-01-10', description: 'Initial matrix creation' },
    { date: '2024-01-15', description: 'Added leadership competencies' }
  ]).execute();
};

describe('searchMatrix', () => {
  beforeEach(async () => {
    await createDB();
    await setupTestData();
  });
  afterEach(resetDB);

  it('should return complete matrix when no filters applied', async () => {
    const input: SearchInput = {};
    const result = await searchMatrix(input);

    expect(result.jobLevels).toHaveLength(3);
    expect(result.competencyCategories).toHaveLength(2);
    expect(result.metadata.lastUpdated).toEqual('2024-01-15');
    expect(result.metadata.goals).toHaveLength(2);
    expect(result.metadata.keyPrinciples).toHaveLength(2);
    expect(result.metadata.editHistory).toHaveLength(2);
  });

  it('should filter job levels by track', async () => {
    const input: SearchInput = {
      tracks: ['IC']
    };
    const result = await searchMatrix(input);

    expect(result.jobLevels).toHaveLength(2);
    expect(result.jobLevels.every(level => level.track === 'IC')).toBe(true);
    expect(result.jobLevels.map(l => l.id)).toEqual(['L1', 'L2']);
    
    // Should still include all categories
    expect(result.competencyCategories).toHaveLength(2);
  });

  it('should filter job levels by multiple tracks', async () => {
    const input: SearchInput = {
      tracks: ['IC', 'TL']
    };
    const result = await searchMatrix(input);

    expect(result.jobLevels).toHaveLength(3);
    expect(result.jobLevels.every(level => ['IC', 'TL'].includes(level.track))).toBe(true);
  });

  it('should filter job levels by specific level IDs', async () => {
    const input: SearchInput = {
      levelIds: ['L1', 'TL1']
    };
    const result = await searchMatrix(input);

    expect(result.jobLevels).toHaveLength(2);
    expect(result.jobLevels.map(l => l.id).sort()).toEqual(['L1', 'TL1']);
  });

  it('should filter competency categories by category IDs', async () => {
    const input: SearchInput = {
      categoryIds: ['technical']
    };
    const result = await searchMatrix(input);

    expect(result.competencyCategories).toHaveLength(1);
    expect(result.competencyCategories[0].id).toEqual('technical');
    expect(result.competencyCategories[0].name).toEqual('Technical Skills');
    expect(result.competencyCategories[0].subCategories).toHaveLength(2);
    
    // Should still include all job levels
    expect(result.jobLevels).toHaveLength(3);
  });

  it('should filter competency categories by sub-category IDs', async () => {
    const input: SearchInput = {
      subCategoryIds: ['coding']
    };
    const result = await searchMatrix(input);

    expect(result.competencyCategories).toHaveLength(1);
    expect(result.competencyCategories[0].id).toEqual('technical');
    expect(result.competencyCategories[0].subCategories).toHaveLength(1);
    expect(result.competencyCategories[0].subCategories[0].id).toEqual('coding');
  });

  it('should perform text search across job level fields', async () => {
    const input: SearchInput = {
      query: 'technical'
    };
    const result = await searchMatrix(input);

    // Should find TL1 (has "technical" in summaryDescription and trajectoryInfo)
    const techLeadLevels = result.jobLevels.filter(level => 
      level.summaryDescription.toLowerCase().includes('technical') ||
      (level.trajectoryInfo && level.trajectoryInfo.toLowerCase().includes('technical')) ||
      level.name.toLowerCase().includes('technical')
    );
    expect(techLeadLevels).toHaveLength(1);
    expect(techLeadLevels[0].id).toEqual('TL1');

    // Should also find technical category
    expect(result.competencyCategories.some(cat => 
      cat.name.toLowerCase().includes('technical')
    )).toBe(true);
  });

  it('should perform case-insensitive text search', async () => {
    const input: SearchInput = {
      query: 'ENGINEER'
    };
    const result = await searchMatrix(input);

    // Should find L1 and L2 (both have "engineer" in name)
    expect(result.jobLevels.length).toBeGreaterThanOrEqual(2);
    const engineerLevels = result.jobLevels.filter(level => 
      level.name.toLowerCase().includes('engineer')
    );
    expect(engineerLevels).toHaveLength(2);
  });

  it('should perform text search across competency fields', async () => {
    const input: SearchInput = {
      query: 'programming'
    };
    const result = await searchMatrix(input);

    // Should find the coding sub-category
    expect(result.competencyCategories).toHaveLength(1);
    expect(result.competencyCategories[0].subCategories.some(sub => 
      sub.name.toLowerCase().includes('programming')
    )).toBe(true);
  });

  it('should combine multiple filters with AND logic', async () => {
    const input: SearchInput = {
      tracks: ['IC'],
      query: 'mid-level'
    };
    const result = await searchMatrix(input);

    // Should find only L2 (IC track AND contains "mid-level")
    expect(result.jobLevels).toHaveLength(1);
    expect(result.jobLevels[0].id).toEqual('L2');
    expect(result.jobLevels[0].track).toEqual('IC');
  });

  it('should handle OR logic within the same filter type', async () => {
    const input: SearchInput = {
      tracks: ['IC', 'TL'],
      levelIds: ['L1', 'TL1']
    };
    const result = await searchMatrix(input);

    // Should find levels that match BOTH track filter AND levelIds filter
    expect(result.jobLevels).toHaveLength(2);
    expect(result.jobLevels.every(level => 
      ['IC', 'TL'].includes(level.track) && ['L1', 'TL1'].includes(level.id)
    )).toBe(true);
  });

  it('should return proper competency sub-category structure', async () => {
    const input: SearchInput = {};
    const result = await searchMatrix(input);

    const technicalCategory = result.competencyCategories.find(cat => cat.id === 'technical');
    expect(technicalCategory).toBeDefined();
    expect(technicalCategory!.subCategories).toHaveLength(2);

    const codingSubCategory = technicalCategory!.subCategories.find(sub => sub.id === 'coding');
    expect(codingSubCategory).toBeDefined();
    expect(codingSubCategory!.descriptionsByLevel).toHaveProperty('L1');
    expect(codingSubCategory!.descriptionsByLevel).toHaveProperty('L2');
    expect(codingSubCategory!.descriptionsByLevel).toHaveProperty('TL1');
    expect(typeof codingSubCategory!.descriptionsByLevel['L1']).toBe('string');
  });

  it('should return empty arrays when no matches found', async () => {
    const input: SearchInput = {
      query: 'nonexistent-term-xyz'
    };
    const result = await searchMatrix(input);

    expect(result.jobLevels).toHaveLength(0);
    expect(result.competencyCategories).toHaveLength(0);
    
    // Metadata should still be included
    expect(result.metadata.lastUpdated).toEqual('2024-01-15');
    expect(result.metadata.editHistory).toHaveLength(2);
  });

  it('should handle missing trajectory info in search', async () => {
    // Create a job level without trajectory info
    await db.insert(jobLevelsTable).values({
      id: 'L3',
      name: 'Senior Engineer',
      track: 'IC',
      summaryDescription: 'Senior level position',
      trajectoryInfo: null,
      scopeOfInfluenceSummary: null,
      ownershipSummary: null
    }).execute();

    const input: SearchInput = {
      query: 'senior'
    };
    const result = await searchMatrix(input);

    // Should still find the L3 level by name
    expect(result.jobLevels.some(level => level.id === 'L3')).toBe(true);
  });

  it('should handle empty metadata gracefully', async () => {
    // Clear metadata
    await db.delete(metadataTable).execute();
    await db.delete(editHistoryTable).execute();

    const input: SearchInput = {};
    const result = await searchMatrix(input);

    expect(result.metadata.lastUpdated).toEqual('');
    expect(result.metadata.goals).toEqual([]);
    expect(result.metadata.keyPrinciples).toEqual([]);
    expect(result.metadata.editHistory).toEqual([]);
  });
});
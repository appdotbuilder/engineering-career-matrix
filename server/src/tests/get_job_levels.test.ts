import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobLevelsTable } from '../db/schema';
import { getJobLevels } from '../handlers/get_job_levels';
import { type CreateJobLevelInput } from '../schema';

describe('getJobLevels', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no job levels exist', async () => {
    const result = await getJobLevels();
    expect(result).toEqual([]);
  });

  it('should fetch and return all job levels', async () => {
    // Create test data
    const testJobLevels: CreateJobLevelInput[] = [
      {
        id: 'L1',
        name: 'Junior Engineer',
        track: 'IC',
        summaryDescription: 'Entry-level individual contributor',
        trajectoryInfo: 'Focus on learning fundamentals',
        scopeOfInfluenceSummary: 'Individual tasks',
        ownershipSummary: 'Own small features'
      },
      {
        id: 'TL1',
        name: 'Tech Lead I',
        track: 'TL',
        summaryDescription: 'Entry-level tech lead',
        trajectoryInfo: null,
        scopeOfInfluenceSummary: 'Team level',
        ownershipSummary: 'Own team deliverables'
      }
    ];

    // Insert test data
    await db.insert(jobLevelsTable)
      .values(testJobLevels)
      .execute();

    const result = await getJobLevels();

    expect(result).toHaveLength(2);
    
    // Verify first job level
    const juniorEngineer = result.find(jl => jl.id === 'L1');
    expect(juniorEngineer).toBeDefined();
    expect(juniorEngineer!.name).toBe('Junior Engineer');
    expect(juniorEngineer!.track).toBe('IC');
    expect(juniorEngineer!.summaryDescription).toBe('Entry-level individual contributor');
    expect(juniorEngineer!.trajectoryInfo).toBe('Focus on learning fundamentals');
    expect(juniorEngineer!.scopeOfInfluenceSummary).toBe('Individual tasks');
    expect(juniorEngineer!.ownershipSummary).toBe('Own small features');

    // Verify second job level
    const techLead = result.find(jl => jl.id === 'TL1');
    expect(techLead).toBeDefined();
    expect(techLead!.name).toBe('Tech Lead I');
    expect(techLead!.track).toBe('TL');
    expect(techLead!.summaryDescription).toBe('Entry-level tech lead');
    expect(techLead!.trajectoryInfo).toBe(null);
    expect(techLead!.scopeOfInfluenceSummary).toBe('Team level');
    expect(techLead!.ownershipSummary).toBe('Own team deliverables');
  });

  it('should return job levels ordered by track then by name', async () => {
    // Create test data with different tracks and names
    const testJobLevels: CreateJobLevelInput[] = [
      {
        id: 'EM2',
        name: 'Engineering Manager II',
        track: 'EM',
        summaryDescription: 'Senior engineering manager',
        trajectoryInfo: 'Manage multiple teams',
        scopeOfInfluenceSummary: 'Multiple teams',
        ownershipSummary: 'Own major initiatives'
      },
      {
        id: 'L3',
        name: 'Senior Engineer',
        track: 'IC',
        summaryDescription: 'Experienced individual contributor',
        trajectoryInfo: 'Technical leadership within team',
        scopeOfInfluenceSummary: 'Team influence',
        ownershipSummary: 'Own complex features'
      },
      {
        id: 'D1',
        name: 'Director of Engineering',
        track: 'Director',
        summaryDescription: 'Senior leadership role',
        trajectoryInfo: 'Strategic planning and execution',
        scopeOfInfluenceSummary: 'Organization wide',
        ownershipSummary: 'Own department outcomes'
      },
      {
        id: 'L1',
        name: 'Junior Engineer',
        track: 'IC',
        summaryDescription: 'Entry-level individual contributor',
        trajectoryInfo: 'Focus on learning fundamentals',
        scopeOfInfluenceSummary: 'Individual tasks',
        ownershipSummary: 'Own small features'
      },
      {
        id: 'TL1',
        name: 'Tech Lead I',
        track: 'TL',
        summaryDescription: 'Entry-level tech lead',
        trajectoryInfo: null,
        scopeOfInfluenceSummary: 'Team level',
        ownershipSummary: 'Own team deliverables'
      },
      {
        id: 'EM1',
        name: 'Engineering Manager I',
        track: 'EM',
        summaryDescription: 'Entry-level engineering manager',
        trajectoryInfo: 'First time manager',
        scopeOfInfluenceSummary: 'Single team',
        ownershipSummary: 'Own team delivery'
      }
    ];

    // Insert test data
    await db.insert(jobLevelsTable)
      .values(testJobLevels)
      .execute();

    const result = await getJobLevels();

    expect(result).toHaveLength(6);

    // Verify ordering: IC, TL, EM, Director (enum order), then by name within each track
    expect(result[0].track).toBe('IC');
    expect(result[0].name).toBe('Junior Engineer');
    expect(result[1].track).toBe('IC');
    expect(result[1].name).toBe('Senior Engineer');

    expect(result[2].track).toBe('TL');
    expect(result[2].name).toBe('Tech Lead I');

    expect(result[3].track).toBe('EM');
    expect(result[3].name).toBe('Engineering Manager I');
    expect(result[4].track).toBe('EM');
    expect(result[4].name).toBe('Engineering Manager II');

    expect(result[5].track).toBe('Director');
    expect(result[5].name).toBe('Director of Engineering');
  });

  it('should handle job levels with minimal data', async () => {
    // Create job level with only required fields
    const minimalJobLevel: CreateJobLevelInput = {
      id: 'L0',
      name: 'Intern',
      track: 'IC',
      summaryDescription: 'Internship role',
      trajectoryInfo: null
      // Optional fields omitted
    };

    await db.insert(jobLevelsTable)
      .values([minimalJobLevel])
      .execute();

    const result = await getJobLevels();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('L0');
    expect(result[0].name).toBe('Intern');
    expect(result[0].track).toBe('IC');
    expect(result[0].summaryDescription).toBe('Internship role');
    expect(result[0].trajectoryInfo).toBe(null);
    expect(result[0].scopeOfInfluenceSummary).toBeUndefined();
    expect(result[0].ownershipSummary).toBeUndefined();
  });

  it('should handle job levels with all tracks', async () => {
    // Create one job level for each track
    const jobLevelsByTrack: CreateJobLevelInput[] = [
      {
        id: 'IC1',
        name: 'Individual Contributor',
        track: 'IC',
        summaryDescription: 'Individual contributor role',
        trajectoryInfo: 'IC path'
      },
      {
        id: 'TL1',
        name: 'Technical Lead',
        track: 'TL',
        summaryDescription: 'Technical leadership role',
        trajectoryInfo: 'TL path'
      },
      {
        id: 'EM1',
        name: 'Engineering Manager',
        track: 'EM',
        summaryDescription: 'People management role',
        trajectoryInfo: 'EM path'
      },
      {
        id: 'DIR1',
        name: 'Director',
        track: 'Director',
        summaryDescription: 'Executive leadership role',
        trajectoryInfo: 'Director path'
      }
    ];

    await db.insert(jobLevelsTable)
      .values(jobLevelsByTrack)
      .execute();

    const result = await getJobLevels();

    expect(result).toHaveLength(4);
    
    const tracks = result.map(jl => jl.track);
    expect(tracks).toEqual(['IC', 'TL', 'EM', 'Director']);
  });
});
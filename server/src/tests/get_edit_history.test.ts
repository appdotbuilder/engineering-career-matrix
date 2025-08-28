import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { editHistoryTable } from '../db/schema';
import { getEditHistory } from '../handlers/get_edit_history';

describe('getEditHistory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no edit history exists', async () => {
    const result = await getEditHistory();

    expect(result).toEqual([]);
  });

  it('should return single edit history entry', async () => {
    // Insert test edit history entry
    await db.insert(editHistoryTable)
      .values({
        date: '2024-01-15',
        description: 'Initial framework creation'
      })
      .execute();

    const result = await getEditHistory();

    expect(result).toHaveLength(1);
    expect(result[0].date).toEqual('2024-01-15');
    expect(result[0].description).toEqual('Initial framework creation');
  });

  it('should return multiple edit history entries ordered by date (most recent first)', async () => {
    // Insert multiple test entries in random order
    await db.insert(editHistoryTable)
      .values([
        {
          date: '2024-01-10',
          description: 'Added new competency categories'
        },
        {
          date: '2024-01-20',
          description: 'Updated job level descriptions'
        },
        {
          date: '2024-01-15',
          description: 'Refined trajectory information'
        }
      ])
      .execute();

    const result = await getEditHistory();

    expect(result).toHaveLength(3);
    
    // Should be ordered by date descending (most recent first)
    expect(result[0].date).toEqual('2024-01-20');
    expect(result[0].description).toEqual('Updated job level descriptions');
    
    expect(result[1].date).toEqual('2024-01-15');
    expect(result[1].description).toEqual('Refined trajectory information');
    
    expect(result[2].date).toEqual('2024-01-10');
    expect(result[2].description).toEqual('Added new competency categories');
  });

  it('should handle entries with same date correctly', async () => {
    // Insert entries with same date
    await db.insert(editHistoryTable)
      .values([
        {
          date: '2024-01-15',
          description: 'First change on Jan 15'
        },
        {
          date: '2024-01-15',
          description: 'Second change on Jan 15'
        }
      ])
      .execute();

    const result = await getEditHistory();

    expect(result).toHaveLength(2);
    expect(result[0].date).toEqual('2024-01-15');
    expect(result[1].date).toEqual('2024-01-15');
    
    // Both entries should be present
    const descriptions = result.map(entry => entry.description);
    expect(descriptions).toContain('First change on Jan 15');
    expect(descriptions).toContain('Second change on Jan 15');
  });

  it('should return entries with all required fields', async () => {
    await db.insert(editHistoryTable)
      .values({
        date: '2024-01-15',
        description: 'Test entry with all fields'
      })
      .execute();

    const result = await getEditHistory();

    expect(result).toHaveLength(1);
    
    const entry = result[0];
    expect(typeof entry.date).toBe('string');
    expect(typeof entry.description).toBe('string');
    expect(entry.date).toEqual('2024-01-15');
    expect(entry.description).toEqual('Test entry with all fields');
    
    // Ensure no extra fields are returned (only schema fields)
    expect(Object.keys(entry)).toEqual(['date', 'description']);
  });
});
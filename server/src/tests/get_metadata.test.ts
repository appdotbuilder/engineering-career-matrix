import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { metadataTable, editHistoryTable } from '../db/schema';
import { getMetadata } from '../handlers/get_metadata';

describe('getMetadata', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return default metadata when no metadata exists', async () => {
    const result = await getMetadata();

    expect(result.goals).toEqual([]);
    expect(result.keyPrinciples).toEqual([]);
    expect(result.editHistory).toEqual([]);
    expect(result.lastUpdated).toBeDefined();
    expect(typeof result.lastUpdated).toBe('string');
  });

  it('should fetch metadata with goals and key principles', async () => {
    // Create metadata record
    await db.insert(metadataTable)
      .values({
        lastUpdated: '2024-01-15T10:00:00Z',
        goals: ['Goal 1', 'Goal 2', 'Goal 3'],
        keyPrinciples: ['Principle A', 'Principle B']
      })
      .execute();

    const result = await getMetadata();

    expect(result.lastUpdated).toEqual('2024-01-15T10:00:00Z');
    expect(result.goals).toEqual(['Goal 1', 'Goal 2', 'Goal 3']);
    expect(result.keyPrinciples).toEqual(['Principle A', 'Principle B']);
    expect(result.editHistory).toEqual([]);
  });

  it('should fetch metadata with edit history ordered by date descending', async () => {
    // Create metadata record
    await db.insert(metadataTable)
      .values({
        lastUpdated: '2024-01-15T10:00:00Z',
        goals: ['Test goal'],
        keyPrinciples: ['Test principle']
      })
      .execute();

    // Create edit history entries with different creation times
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Insert in non-chronological order to test ordering
    await db.insert(editHistoryTable)
      .values([
        {
          date: '2024-01-13',
          description: 'Oldest change',
          createdAt: twoDaysAgo
        },
        {
          date: '2024-01-15',
          description: 'Latest change',
          createdAt: now
        },
        {
          date: '2024-01-14',
          description: 'Middle change',
          createdAt: yesterday
        }
      ])
      .execute();

    const result = await getMetadata();

    expect(result.editHistory).toHaveLength(3);
    // Should be ordered by creation time descending (most recent first)
    expect(result.editHistory[0].description).toEqual('Latest change');
    expect(result.editHistory[1].description).toEqual('Middle change');
    expect(result.editHistory[2].description).toEqual('Oldest change');

    // Check that all edit history entries have correct structure
    result.editHistory.forEach(entry => {
      expect(entry.date).toBeDefined();
      expect(entry.description).toBeDefined();
      expect(typeof entry.date).toBe('string');
      expect(typeof entry.description).toBe('string');
    });
  });

  it('should handle empty arrays correctly', async () => {
    // Create metadata with empty arrays
    await db.insert(metadataTable)
      .values({
        lastUpdated: '2024-01-15T10:00:00Z',
        goals: [],
        keyPrinciples: []
      })
      .execute();

    const result = await getMetadata();

    expect(result.lastUpdated).toEqual('2024-01-15T10:00:00Z');
    expect(result.goals).toEqual([]);
    expect(result.keyPrinciples).toEqual([]);
    expect(result.editHistory).toEqual([]);
  });

  it('should handle metadata with complex goal and principle descriptions', async () => {
    const complexGoals = [
      'Establish clear career progression paths for all engineering tracks',
      'Define competency expectations at each level with specific behavioral indicators',
      'Create a framework that supports both technical depth and leadership growth'
    ];

    const complexPrinciples = [
      'Career growth should be multi-dimensional, not just about coding skills',
      'Leadership can be expressed through technical expertise, people management, or architectural vision',
      'Transparency in expectations helps engineers take ownership of their development'
    ];

    await db.insert(metadataTable)
      .values({
        lastUpdated: '2024-01-15T10:00:00Z',
        goals: complexGoals,
        keyPrinciples: complexPrinciples
      })
      .execute();

    const result = await getMetadata();

    expect(result.goals).toEqual(complexGoals);
    expect(result.keyPrinciples).toEqual(complexPrinciples);
    expect(result.goals).toHaveLength(3);
    expect(result.keyPrinciples).toHaveLength(3);
  });

  it('should return only the first metadata row if multiple exist', async () => {
    // Insert two metadata records (though this shouldn't happen in practice)
    await db.insert(metadataTable)
      .values([
        {
          lastUpdated: '2024-01-15T10:00:00Z',
          goals: ['First goal'],
          keyPrinciples: ['First principle']
        },
        {
          lastUpdated: '2024-01-16T10:00:00Z',
          goals: ['Second goal'],
          keyPrinciples: ['Second principle']
        }
      ])
      .execute();

    const result = await getMetadata();

    // Should return the first metadata record
    expect(result.lastUpdated).toEqual('2024-01-15T10:00:00Z');
    expect(result.goals).toEqual(['First goal']);
    expect(result.keyPrinciples).toEqual(['First principle']);
  });
});
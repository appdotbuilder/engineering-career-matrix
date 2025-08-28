import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { metadataTable, editHistoryTable } from '../db/schema';
import { type UpdateMetadataInput } from '../schema';
import { updateMetadata } from '../handlers/update_metadata';

describe('updateMetadata', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('first-time setup (no existing metadata)', () => {
    it('should create new metadata with all provided fields', async () => {
      const input: UpdateMetadataInput = {
        lastUpdated: '2024-01-15T10:00:00Z',
        goals: ['Improve engineering standards', 'Foster career growth'],
        keyPrinciples: ['Technical excellence', 'Continuous learning']
      };

      const result = await updateMetadata(input);

      expect(result.lastUpdated).toEqual('2024-01-15T10:00:00Z');
      expect(result.goals).toEqual(['Improve engineering standards', 'Foster career growth']);
      expect(result.keyPrinciples).toEqual(['Technical excellence', 'Continuous learning']);
      expect(result.editHistory).toEqual([]);
    });

    it('should create metadata with defaults when fields are not provided', async () => {
      const input: UpdateMetadataInput = {};

      const result = await updateMetadata(input);

      expect(result.lastUpdated).toBeDefined();
      expect(result.goals).toEqual([]);
      expect(result.keyPrinciples).toEqual([]);
      expect(result.editHistory).toEqual([]);

      // Verify it's a valid ISO date string
      expect(() => new Date(result.lastUpdated)).not.toThrow();
    });

    it('should save metadata to database', async () => {
      const input: UpdateMetadataInput = {
        lastUpdated: '2024-01-15T10:00:00Z',
        goals: ['Test goal'],
        keyPrinciples: ['Test principle']
      };

      await updateMetadata(input);

      const savedMetadata = await db.select()
        .from(metadataTable)
        .execute();

      expect(savedMetadata).toHaveLength(1);
      expect(savedMetadata[0].lastUpdated).toEqual('2024-01-15T10:00:00Z');
      expect(savedMetadata[0].goals).toEqual(['Test goal']);
      expect(savedMetadata[0].keyPrinciples).toEqual(['Test principle']);
    });
  });

  describe('updating existing metadata', () => {
    beforeEach(async () => {
      // Create initial metadata
      await db.insert(metadataTable)
        .values({
          lastUpdated: '2024-01-01T00:00:00Z',
          goals: ['Initial goal'],
          keyPrinciples: ['Initial principle']
        })
        .execute();
    });

    it('should update only provided fields', async () => {
      const input: UpdateMetadataInput = {
        goals: ['Updated goal']
      };

      const result = await updateMetadata(input);

      expect(result.lastUpdated).toEqual('2024-01-01T00:00:00Z'); // Unchanged
      expect(result.goals).toEqual(['Updated goal']); // Updated
      expect(result.keyPrinciples).toEqual(['Initial principle']); // Unchanged
    });

    it('should update all fields when provided', async () => {
      const input: UpdateMetadataInput = {
        lastUpdated: '2024-02-01T12:00:00Z',
        goals: ['New goal 1', 'New goal 2'],
        keyPrinciples: ['New principle 1', 'New principle 2']
      };

      const result = await updateMetadata(input);

      expect(result.lastUpdated).toEqual('2024-02-01T12:00:00Z');
      expect(result.goals).toEqual(['New goal 1', 'New goal 2']);
      expect(result.keyPrinciples).toEqual(['New principle 1', 'New principle 2']);
    });

    it('should handle empty arrays as valid updates', async () => {
      const input: UpdateMetadataInput = {
        goals: [],
        keyPrinciples: []
      };

      const result = await updateMetadata(input);

      expect(result.goals).toEqual([]);
      expect(result.keyPrinciples).toEqual([]);
      expect(result.lastUpdated).toEqual('2024-01-01T00:00:00Z'); // Unchanged
    });

    it('should not update database when no changes are provided', async () => {
      const input: UpdateMetadataInput = {};

      // Get original timestamp
      const originalData = await db.select()
        .from(metadataTable)
        .execute();
      const originalUpdatedAt = originalData[0].updatedAt;

      const result = await updateMetadata(input);

      // Verify no database changes occurred
      const afterData = await db.select()
        .from(metadataTable)
        .execute();

      expect(afterData[0].updatedAt).toEqual(originalUpdatedAt);
      expect(result.lastUpdated).toEqual('2024-01-01T00:00:00Z');
      expect(result.goals).toEqual(['Initial goal']);
      expect(result.keyPrinciples).toEqual(['Initial principle']);
    });
  });

  describe('edit history integration', () => {
    it('should include edit history in response', async () => {
      // Create some edit history entries
      await db.insert(editHistoryTable)
        .values([
          { date: '2024-01-01', description: 'First edit' },
          { date: '2024-01-02', description: 'Second edit' }
        ])
        .execute();

      const input: UpdateMetadataInput = {
        lastUpdated: '2024-01-15T10:00:00Z'
      };

      const result = await updateMetadata(input);

      expect(result.editHistory).toHaveLength(2);
      expect(result.editHistory[0].date).toEqual('2024-01-01');
      expect(result.editHistory[0].description).toEqual('First edit');
      expect(result.editHistory[1].date).toEqual('2024-01-02');
      expect(result.editHistory[1].description).toEqual('Second edit');
    });

    it('should return empty edit history when none exists', async () => {
      const input: UpdateMetadataInput = {
        goals: ['Test goal']
      };

      const result = await updateMetadata(input);

      expect(result.editHistory).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle large arrays of goals and principles', async () => {
      const largeGoals = Array.from({ length: 100 }, (_, i) => `Goal ${i + 1}`);
      const largePrinciples = Array.from({ length: 50 }, (_, i) => `Principle ${i + 1}`);

      const input: UpdateMetadataInput = {
        goals: largeGoals,
        keyPrinciples: largePrinciples
      };

      const result = await updateMetadata(input);

      expect(result.goals).toHaveLength(100);
      expect(result.keyPrinciples).toHaveLength(50);
      expect(result.goals[99]).toEqual('Goal 100');
      expect(result.keyPrinciples[49]).toEqual('Principle 50');
    });

    it('should handle special characters and unicode in strings', async () => {
      const input: UpdateMetadataInput = {
        goals: ['🚀 Rocket goal', 'Goal with "quotes"', 'Goal with \n newlines'],
        keyPrinciples: ['Principle with émojis 🎯', 'Multi\nline\nprinciple']
      };

      const result = await updateMetadata(input);

      expect(result.goals).toEqual(['🚀 Rocket goal', 'Goal with "quotes"', 'Goal with \n newlines']);
      expect(result.keyPrinciples).toEqual(['Principle with émojis 🎯', 'Multi\nline\nprinciple']);
    });
  });
});
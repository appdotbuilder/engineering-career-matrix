import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { editHistoryTable } from '../db/schema';
import { type AddEditHistoryEntryInput } from '../schema';
import { addEditHistoryEntry } from '../handlers/add_edit_history_entry';
import { eq } from 'drizzle-orm';

// Test input for edit history entry
const testInput: AddEditHistoryEntryInput = {
  date: '2024-01-15',
  description: 'Updated competency descriptions for L3 level'
};

describe('addEditHistoryEntry', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an edit history entry', async () => {
    const result = await addEditHistoryEntry(testInput);

    // Validate returned data
    expect(result.date).toEqual('2024-01-15');
    expect(result.description).toEqual('Updated competency descriptions for L3 level');
  });

  it('should save edit history entry to database', async () => {
    const result = await addEditHistoryEntry(testInput);

    // Query the database to verify the entry was saved
    const editHistoryEntries = await db.select()
      .from(editHistoryTable)
      .where(eq(editHistoryTable.description, result.description))
      .execute();

    expect(editHistoryEntries).toHaveLength(1);
    expect(editHistoryEntries[0].date).toEqual('2024-01-15');
    expect(editHistoryEntries[0].description).toEqual('Updated competency descriptions for L3 level');
    expect(editHistoryEntries[0].id).toBeDefined();
    expect(editHistoryEntries[0].createdAt).toBeInstanceOf(Date);
  });

  it('should create multiple edit history entries', async () => {
    const firstEntry = await addEditHistoryEntry(testInput);
    
    const secondInput: AddEditHistoryEntryInput = {
      date: '2024-01-20',
      description: 'Added new job levels for Director track'
    };
    
    const secondEntry = await addEditHistoryEntry(secondInput);

    // Verify both entries were created
    expect(firstEntry.date).toEqual('2024-01-15');
    expect(secondEntry.date).toEqual('2024-01-20');
    expect(firstEntry.description).toEqual('Updated competency descriptions for L3 level');
    expect(secondEntry.description).toEqual('Added new job levels for Director track');

    // Verify both entries exist in database
    const allEntries = await db.select()
      .from(editHistoryTable)
      .execute();

    expect(allEntries).toHaveLength(2);
    expect(allEntries.some(entry => entry.date === '2024-01-15')).toBe(true);
    expect(allEntries.some(entry => entry.date === '2024-01-20')).toBe(true);
  });

  it('should handle special characters in description', async () => {
    const specialInput: AddEditHistoryEntryInput = {
      date: '2024-02-01',
      description: 'Updated descriptions with special chars: "quotes", apostrophes\', & symbols!'
    };

    const result = await addEditHistoryEntry(specialInput);

    expect(result.description).toEqual('Updated descriptions with special chars: "quotes", apostrophes\', & symbols!');

    // Verify in database
    const entries = await db.select()
      .from(editHistoryTable)
      .where(eq(editHistoryTable.date, '2024-02-01'))
      .execute();

    expect(entries).toHaveLength(1);
    expect(entries[0].description).toEqual('Updated descriptions with special chars: "quotes", apostrophes\', & symbols!');
  });

  it('should handle long descriptions', async () => {
    const longDescription = 'This is a very long description that spans multiple sentences and contains detailed information about the changes made to the engineering job matrix. '.repeat(10);
    
    const longInput: AddEditHistoryEntryInput = {
      date: '2024-03-01',
      description: longDescription
    };

    const result = await addEditHistoryEntry(longInput);

    expect(result.description).toEqual(longDescription);
    expect(result.date).toEqual('2024-03-01');

    // Verify in database
    const entries = await db.select()
      .from(editHistoryTable)
      .where(eq(editHistoryTable.date, '2024-03-01'))
      .execute();

    expect(entries).toHaveLength(1);
    expect(entries[0].description).toEqual(longDescription);
  });

  it('should handle different date formats correctly', async () => {
    const dateInput: AddEditHistoryEntryInput = {
      date: '2024-12-31',
      description: 'Year-end updates to job matrix'
    };

    const result = await addEditHistoryEntry(dateInput);

    expect(result.date).toEqual('2024-12-31');

    // Verify the date is stored correctly in database
    const entries = await db.select()
      .from(editHistoryTable)
      .where(eq(editHistoryTable.description, 'Year-end updates to job matrix'))
      .execute();

    expect(entries).toHaveLength(1);
    expect(entries[0].date).toEqual('2024-12-31');
  });
});
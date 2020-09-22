import Airtable from 'airtable';

import { isRecord, recordToObject } from './utils';

const { Table, Record } = Airtable;

const table = new Table(
  // @ts-ignore
  null,
  'tableId123',
  'TableName123'
);

describe(`isRecord`, () => {
  it('returns true for record', () => {
    const record = new Record(table, 'id1', {});
    expect(isRecord(record)).toEqual(true);
  });

  it('returns false for non-records', () => {
    expect(isRecord({})).toEqual(false);
    expect(isRecord([])).toEqual(false);
    expect(isRecord('')).toEqual(false);
    expect(isRecord(false)).toEqual(false);
  });

  it('returns false for object that looks like record', () => {
    const recordLookalike = {
      id: 'id1',
      fields: {},
    };
    expect(isRecord(recordLookalike)).toEqual(false);
  });
});

describe(`recordToObject`, () => {
  it('converts empty record', () => {
    const emptyRecord = new Record(table, 'id1', {});
    expect(recordToObject(emptyRecord)).toEqual({ id: 'id1' });
  });

  it('converts record with fields', () => {
    const record = new Record(table, 'id1', {
      fields: {
        testField1: '1',
        testField2: '2',
      },
    });
    expect(recordToObject(record)).toEqual({
      id: 'id1',
      testField1: '1',
      testField2: '2',
    });
  });

  it('converts record with populated field containing a record', () => {
    const childRecord = new Record(table, 'child', {
      fields: {
        isChild: true,
      },
    });
    const parentRecord = new Record(table, 'parent', {
      fields: {
        isParent: true,
        child: childRecord,
      },
    });
    expect(recordToObject(parentRecord)).toEqual({
      id: 'parent',
      isParent: true,
      child: {
        id: 'child',
        isChild: true,
      },
    });
  });

  it('converts record with populated field containing array of records', () => {
    const childRecord1 = new Record(table, 'child1', {
      fields: {
        isChild1: true,
      },
    });
    const childRecord2 = new Record(table, 'child2', {
      fields: {
        isChild2: true,
      },
    });
    const parentRecord = new Record(table, 'parent', {
      fields: {
        isParent: true,
        child: [childRecord1, childRecord2],
      },
    });
    expect(recordToObject(parentRecord)).toEqual({
      id: 'parent',
      isParent: true,
      child: [
        {
          id: 'child1',
          isChild1: true,
        },
        {
          id: 'child2',
          isChild2: true,
        },
      ],
    });
  });
});

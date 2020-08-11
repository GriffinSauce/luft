import Airtable, { Base, Record, SortParameter } from 'airtable';
import reduce from 'awaity/reduce';
import { recordToObject } from './utils';

export { recordToObject } from './utils';

// TODO: Input checks
// TODO: Error handling
// TODO: Document params
// TODO: Test things...

type PopulateFieldType = {
  path: string;
  from: string;
  multi: boolean;
  fields: Array<string>;
};

type PopulateType = Array<PopulateFieldType>;

let base: Base;

// Go nuts, you got this!
export const getBase = () => {
  return base;
};

export const initialize = ({
  baseId,
  apiKey,
}: {
  baseId: string;
  apiKey: string;
}) => {
  if (!baseId) throw new Error(`"baseId" is required `);
  if (!apiKey) throw new Error(`"apiKey" is required `);

  // @ts-ignore - missing in types
  Airtable.configure({ apiKey });
  // @ts-ignore - missing in types
  base = Airtable.base(baseId);
};

const populateField = async (
  record: Record<any>,
  { path, from, multi, fields }: PopulateFieldType
) => {
  // @ts-ignore - missing in types
  const ref = record.get(path);
  if (!ref) return record;
  let result = ref;

  try {
    /* eslint-disable no-use-before-define */
    result = multi
      ? await get(from, {
          filter: `OR(${ref
            .map((recordId: string) => `RECORD_ID()="${recordId}"`)
            .join(',')})`,
          fields,
        })
      : await getById(from, {
          recordId: ref,
          fields,
        });
    /* eslint-enable no-use-before-define */
  } catch (err) {
    console.error(
      `Failed to populate ${path} of ${record.id}\n  ${err.message}`
    );
  }

  // Don't recreate an object here because we're dealing with a record
  record.fields[path] = result; // eslint-disable-line no-param-reassign
  return record;
};

const populateRecord = (
  record: Record<any>,
  populate: PopulateType
): Record<any> => reduce(populate, populateField, record); // Reduce with promises

export const getById = async (
  tableId: string,
  {
    recordId,
    fields,
    populate,
    toObject,
  }: {
    recordId: string;
    fields?: Array<string>;
    populate?: PopulateType;
    toObject?: boolean;
  }
) => {
  const [record] = await base(tableId)
    .select({
      filterByFormula: `RECORD_ID()="${recordId}"`, // Can't select fields with a find operation
      ...(fields ? { fields } : {}),
    })
    .firstPage();

  let populated = record;
  if (populate) populated = await populateRecord(record, populate);

  return toObject ? recordToObject(populated) : populated;
};

export const getByField = async (
  tableId: string,
  {
    key,
    field,
    fields,
    populate,
    toObject,
  }: {
    key: string;
    field: string;
    fields?: Array<string>;
    populate?: PopulateType;
    toObject?: boolean;
  }
) => {
  const [record] = await base(tableId)
    .select({
      filterByFormula: `${field}="${key}"`,
      ...(fields ? { fields } : {}),
    })
    .firstPage();

  let populated = record;
  if (populate) populated = await populateRecord(record, populate);

  return toObject ? recordToObject(populated) : populated;
};

export const get = async (
  tableId: string,
  {
    sort,
    fields,
    filter,
    populate,
    toObject,
  }: {
    sort?: Array<SortParameter>;
    filter?: string;
    fields?: Array<string>;
    populate?: PopulateType;
    toObject?: boolean;
  }
) => {
  const records = await base(tableId)
    .select({
      ...(sort ? { sort } : {}),
      ...(fields ? { fields } : {}),
      ...(filter ? { filterByFormula: filter } : {}),
    })
    .all();

  let populated = records;
  if (populate) {
    populated = await Promise.all(
      records.map(record => populateRecord(record, populate))
    );
  }

  return toObject ? populated.map(recordToObject) : populated;
};

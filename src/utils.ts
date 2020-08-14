import { Record } from 'airtable';
import camelCase from 'lodash.camelcase';
import isObject from 'lodash.isobject';

type ObjectRecord = { [key: string]: any };

// Quack
export const isRecord = (maybeRecord: Record<any> | any): boolean =>
  !!(maybeRecord?.getId && maybeRecord?.fields && isObject(maybeRecord));

export const recordToObject = (record: Record<any>): ObjectRecord => {
  // @ts-ignore - is untyped
  const id = record.getId();
  return Object.keys(record.fields || {}).reduce(
    (fields, key) => {
      // @ts-ignore - is untyped
      const value = record.get(key);
      let converted = isRecord(value) ? recordToObject(value) : value;
      if (Array.isArray(value) && isRecord(value[0])) {
        converted = value.map(recordToObject);
      }
      return {
        ...fields,
        [camelCase(key)]: converted,
      };
    },
    { id }
  );
};

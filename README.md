# 💨 luft

An extremely simple Airtable client for JavaScript.

## WARNING!

⚠️ This library is highly experimental, UNTESTED and likely to have breaking changes. It is not recommended to use it for anything serious. Unserious and mischievious use is encouraged.

## Install

```.sh
yarn add luft

// or

npm install luft
```

## Usage example

An example that utilizes most options:

```.js
import { initialize, get } from 'luft';

initialize({
  baseId: '<your base id>',
  apiKey: '<your api key>',
});

const getUpcomingShows = async () => {
  let records;
  try {
    records = await get('Shows', {
      sort: [{ field: 'Date', direction: 'desc' }],
      populate: [
        {
          path: 'Venue',
          from: 'Venues',
          multi: false,
          fields: ['Address', 'City', 'Name'],
        },
        {
          path: 'With',
          from: 'Bands',
          multi: true,
          fields: ['Name']
        },
      ],
      filter: 'IS_AFTER({Date}, NOW())',
      toObject: true,
    });
  } catch (err) {
    // Error handling
  }
  return records;
};
```

## Documentation

**luft** is a simplifying wrapper around [airtable.js](https://github.com/airtable/airtable.js/) - the aim is not to reinvent the wheel but to simplify some things to allow for lightweight more implementations. You can use `getBase` as an [escape hatch](#escape-hatch) if necessary to use the full raw functionality.

### Common parameters

All record `getXYZ` functions take the table name as the first param and support the following optional params:

- `fields` - an array of fieldnames to select
- `sort` - a list of sort objects with a `field` and optional `direction` keys (see [api docs](https://airtable.com/api))
- `filter` - a filter formula (see the [Formula field reference](https://support.airtable.com/hc/en-us/articles/203255215-Formula-Field-Reference) and [api docs](https://airtable.com/api))
- `populate` - an array of population specs, see [Population](#populate-linked-fields)
- `toObject` - boolean, return raw [airtable.js](https://github.com/airtable/airtable.js/) records or plain objects with all keys converted to camelCase - default `false`

### To start `initialize` the connection

Initializes your Airtable instance. Only one base is supported.

```.js
import { initialize } from 'luft';

initialize({
  baseId: '<your base id>',
  apiKey: '<your api key>',
});

// Now do things, see below
```

Visit [your account page](https://airtable.com/account) to get your API key.  
It's recommended to use environment variables here for security and flexibility.

### Then `get` some docs

```.js
import { get } from 'luft';

// initialize...

const shows = await get('Shows', {
  // See common parameters
});
```

### And `getById` one doc by its id

```.js
import { getById } from 'luft';

// initialize...

const shows = await getById('Shows', {
  recordId: 'abc123',
  // See common parameters
});

```

### Or `getByKey` one doc by a key field of your choice

For example to use Airtable as a rudimentary CMS:

```.js
import { getByKey } from 'luft';

// initialize...

const homepageContent = await getById('Content', {
  key: 'home',
  field: 'page',
  // See common parameters
});
```

(protip: the rich text field type is [Markdown](https://support.airtable.com/hc/en-us/articles/360043256713-Markdown-rich-text-output-in-the-API))

### Populate linked fields

This is where **luft** really goes 💨.  
Pass an array of population specs to `population` to get linked fields from other tables.

#### Example:

```.js
import { getByKey } from 'luft';

// initialize...

await get('Shows', {
  populate: [
    {
      path: 'Venue',
      from: 'Venues',
      multi: false,
      fields: ['Address', 'City', 'Name'],
    },
    {
      path: 'With',
      from: 'Bands',
      multi: true,
      fields: ['Name']
    },
  ],
  // See common parameters, toObject will convert the populated fields as well
});
```

A population spec has:

- `path` - the field that you want to populate
- `from` - the table to get it from
- `multi` - whether to get one or multiple records (we can't tell this from the record sadly), you can safely leave this to `true` when in doubt to always get an array of results
- `fields` - an array of fieldnames to select in the target record

It is currently only possible to populate one level deep. (create an issue of you need more)

### Escape hatch

**luft** uses [airtable.js](https://github.com/airtable/airtable.js/) under the hood, you can get the raw `base` to write your own logic:

```.js
import { getBase } from 'luft';

// initialize...

const base = getBase()

base('Shows').destroy(['rec123ABC'])
```

## Local Development

### `yarn dev`

Runs the project in development/watch mode. The project will be rebuilt upon changes.

### `yarn build`

Bundles the package to the `dist` folder.
The package is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

### `yarn test`

Runs the test watcher (Jest) in an interactive mode.

## Notes

This project was bootstrapped with [TSDX](https://github.com/jaredpalmer/tsdx).

Some inspiration taken from https://github.com/Arro/airtable-json

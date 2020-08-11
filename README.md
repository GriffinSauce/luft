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

## Usage

An example that utilizes most options:

```.js
import { initialize, get } from '../utils/airtable';

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
    console.error(err);
    throw new Error(`Fetching shows failed`);
  }
  return records;
};
```

TODO: document all functions and params

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

# DHIS2 Program Data Web Application
This application connects to the DHIS2 platform and retrieves outbreak program data (event data) that contains both clinical and genomic indicators.

### How to run:
0. Setup a DHIS2 server this app can connect to
1. Clone the repository
2. In the terminal, `cd` to the folder and then `npm install` to intall dependencies
3. Run `npm run dev` and open `http://localhost:3000`
4. Optionally, run `npm run build` to compile

This project uses node.js, express and webpack.

## Current endpoints:

`api/dhis`: currently static -> gets the events from the Kenema 2014 Event Program from the local DHIS2 instance.
`api/api/dataElements/:ids`: gets displayName of DataElement when provided with a comma separate list of UIDs.

import fs from 'fs';

const content = fs.readFileSync('.playwright-cli/bundle.js', 'utf8');
const rCalls = content.match(/R\(`[^`]+`/g) || [];
console.log('R backtick calls:', [...new Set(rCalls)]);

// Check routes defined in React Router
const routeMatches = content.match(/path:\s*[`"'][^`"']+[`"']/g) || [];
console.log('Routes:', [...new Set(routeMatches)]);

// Check lookbook or extra data
const lookbookMatch = content.match(/lookbook[^a-zA-Z0-9].{0,200}/gi) || [];
console.log('Lookbook snippets:', lookbookMatch.slice(0, 5));

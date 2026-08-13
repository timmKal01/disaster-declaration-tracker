import { Actor, log } from 'apify';
import { fetchDeclarations } from './fema.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { states = [], incidentTypes = [], daysBack = 30, maxResults = 50 } = input;

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const DECLARATION_SEARCH_EVENT = 'declaration-search';

const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

const declarations = await fetchDeclarations({
    states,
    incidentTypes,
    startDate,
    maxResults: Math.min(maxResults, 200),
});

for (const d of declarations) {
    await Actor.pushData(d);
}

await Actor.charge({ eventName: DECLARATION_SEARCH_EVENT });

log.info(`Pushed ${declarations.length} declaration(s)`);

await Actor.exit();

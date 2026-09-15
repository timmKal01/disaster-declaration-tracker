const UA = 'DisasterDeclarationTracker/0.1 (+contact: disaster-tracker-admin@example.com)';
const API_URL = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries';

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 15_000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        let res;
        try {
            res = await fetch(url, { ...options, signal: controller.signal });
        } catch (err) {
            lastError = err.name === 'AbortError' ? new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`) : err;
            if (attempt < MAX_ATTEMPTS) {
                await sleep(1000 * 2 ** (attempt - 1));
                continue;
            }
            throw lastError;
        } finally {
            clearTimeout(timeoutId);
        }
        if (res.ok) return res;
        if (!TRANSIENT_STATUSES.has(res.status)) {
            throw new Error(`OpenFEMA request failed: ${res.status} ${res.statusText}`);
        }
        lastError = new Error(`OpenFEMA request failed: ${res.status} ${res.statusText}`);
        if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
    }
    throw lastError;
}

function odataString(s) {
    return `'${String(s).replace(/'/g, "''")}'`;
}

function buildFilter({ startDateStr, states, incidentTypes }) {
    const parts = [`declarationDate ge ${odataString(startDateStr)}`];
    if (states?.length) {
        parts.push(`(${states.map((s) => `state eq ${odataString(s.toUpperCase())}`).join(' or ')})`);
    }
    if (incidentTypes?.length) {
        parts.push(`(${incidentTypes.map((t) => `incidentType eq ${odataString(t)}`).join(' or ')})`);
    }
    return parts.join(' and ');
}

export async function fetchDeclarations({ states, incidentTypes, startDate, maxResults }) {
    const startDateStr = startDate.toISOString().slice(0, 10);
    const filter = buildFilter({ startDateStr, states, incidentTypes });

    const url = new URL(API_URL);
    url.searchParams.set('$filter', filter);
    url.searchParams.set('$orderby', 'declarationDate desc');
    url.searchParams.set('$top', String(Math.min(maxResults, 200)));

    const res = await fetchWithRetry(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    const data = await res.json();
    const rows = data.DisasterDeclarationsSummaries ?? [];

    return rows.map((d) => ({
        femaDeclarationString: d.femaDeclarationString,
        disasterNumber: d.disasterNumber,
        state: d.state,
        declarationType: d.declarationType,
        declarationTitle: d.declarationTitle,
        incidentType: d.incidentType,
        declarationDate: d.declarationDate,
        incidentBeginDate: d.incidentBeginDate,
        incidentEndDate: d.incidentEndDate,
        designatedArea: d.designatedArea,
        iaProgramDeclared: d.iaProgramDeclared,
        paProgramDeclared: d.paProgramDeclared,
        ihProgramDeclared: d.ihProgramDeclared,
        hmProgramDeclared: d.hmProgramDeclared,
        region: d.region,
        url: `https://www.fema.gov/disaster/${d.disasterNumber}`,
    }));
}

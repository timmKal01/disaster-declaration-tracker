const UA = 'DisasterDeclarationTracker/0.1 (+contact: disaster-tracker-admin@example.com)';
const API_URL = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries';

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

    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    if (!res.ok) throw new Error(`OpenFEMA request failed: ${res.status}`);

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

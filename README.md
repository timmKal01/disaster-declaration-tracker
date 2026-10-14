# FEMA Disaster Declaration Tracker by State

New U.S. disaster declarations for insurance claims teams, disaster
recovery contractors and emergency managers. Filter official FEMA
declarations by state and incident type (fires, floods, hurricanes, severe
storms and more) and get the latest ones, most recently declared first.

## What you get

One row per declaration:

- Disaster number, title, state and incident type
- Declaration date, and when the incident started and ended
- The counties or areas covered
- Which assistance programs were approved (Individual Assistance, Public Assistance, Individuals and Households, Hazard Mitigation)
- A link to the FEMA disaster page

## Who this is for

- **Insurance claims teams** preparing for claims in newly declared areas.
- **Disaster recovery contractors** finding where federal recovery work is starting.
- **Emergency management professionals** following new activations in their region.

## Input

```json
{
  "states": ["CA", "TX"],
  "incidentTypes": ["Fire", "Flood"],
  "daysBack": 30,
  "maxResults": 50
}
```

| Field | Type | Description |
|---|---|---|
| `states` | array of strings (optional) | Two-letter state codes to filter. Leave empty for nationwide. |
| `incidentTypes` | array of strings (optional) | Only include these incident types (e.g. `"Fire"`, `"Flood"`, `"Hurricane"`, `"Severe Storm(s)"`). Leave empty for all types. |
| `daysBack` | number | How many days back from today to include, by declaration date. Default `30`, max `365`. |
| `maxResults` | number | Max declarations to return, most recently declared first. Default `50`, max `200`. |

## Output

One record per declaration:

```json
{
  "femaDeclarationString": "FM-5668-NV",
  "disasterNumber": 5668,
  "state": "NV",
  "declarationType": "FM",
  "declarationTitle": "STALLION FIRE",
  "incidentType": "Fire",
  "declarationDate": "2026-08-11T00:00:00.000Z",
  "incidentBeginDate": "2026-08-10T00:00:00.000Z",
  "incidentEndDate": null,
  "designatedArea": "Washoe (County)",
  "iaProgramDeclared": false,
  "paProgramDeclared": true,
  "ihProgramDeclared": false,
  "hmProgramDeclared": false,
  "region": 9,
  "url": "https://www.fema.gov/disaster/5668"
}
```

## How it works

Direct calls to the official [OpenFEMA API](https://www.fema.gov/about/openfema/api)
(`DisasterDeclarationsSummaries` dataset). No proxy, no key, no scraping.

## Pricing note

Billed per **search**, not per declaration returned — one charge whether
the search returns 1 declaration or 200.

## Related products

- [Field Ops Risk Briefing](https://apify.com/m_ctim/field-operations-risk-briefing): current weather/GPS/radio conditions at a location, rather than declared disasters
- [Earthquake Tracker](https://apify.com/m_ctim/earthquake-alert): a different hazard type (seismic activity) not covered by FEMA declarations

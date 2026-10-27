# Plan: graderte andre ytelser as one event stream per person and yrkesaktivitet

## Decisions made
- One stream per (fødselsnummer, yrkesaktivitetstype, organisasjonsnummer). Orgnr is nullable. A person with
  several arbeidsgivere therefore has one stream per arbeidsgiver.
- One generic event type, used both for creation and for changes. Each event contains **only the days that were
  changed** (a delta). The day is the unit of change: a changed day is sent and stored in full.
- State = all events in the stream applied in order of `versjon`. Each event gives a new state: the days in the
  event replace the days with the same date, and other days stay as they are.
- Each event has a `versjon` that is a UUIDv7, so it sorts by time.
- No concurrency guard. Two changes in the same millisecond are not a realistic risk (a task is assigned to one
  saksbehandler).
- Changes are handled the same way as in tidslinjeoverstyring (Speil's `tilOverstyrteDager`): Speil keeps track of
  which days the saksbehandler has edited and sends only those. Spesialist calculates no diff.
- Incoming days that are identical to the current state are dropped. If no days remain, the request is a no-op:
  nothing is stored, no ping is sent, and the existing `versjon` is returned.
- The old table `graderte_andre_ytelser_events` is dropped. A new table with the same name is created.
- The Spleis contract is out of sync. That's accepted for now, and the river is assumed to be correct on
  spesialist's side.
- The top-level `graderteAndreYtelserType` is removed. The type only exists per day (`andreYtelserGrader`).
- `organisasjonsnummer` is part of the stream key. The river uses the orgnr if it exists and otherwise the
  yrkesaktivitetstype, as today.
- No validation of orgnr vs yrkesaktivitetstype. Same pattern as elsewhere (e.g. `BehandlingOpprettetRiver.kt:59`):
  use the orgnr if it exists, otherwise the yrkesaktivitetstype. We trust that Speil sends the right orgnr.
- An empty `dager` list is an error (`MANGLER_ENDRINGER`). Removal states/actions are not handled now.
- Totrinnsvurdering is handled later. `totrinnsvurdering_id` is **not** stored. The link to totrinnsvurdering will go
  through `saksbehandlerhandling` (V707), which already has `totrinnsvurdering_id`.
- One endpoint for writing: `POST /api/personer/{pseudoId}/graderte-andre-ytelser`.

## Flow
1. A saksbehandler edits one or more days for one yrkesaktivitet. Speil sends only the edited days.
2. Spesialist appends a new event to the stream and pings Spleis (`graderte_andre_ytelser_endret` with `fom`).
3. Spleis sends the behov `GraderteAndreYtelserForBeregning` (fom/tom) when it needs the data.
4. The river replays each of the person's streams and answers with the resulting days, filtered to fom..tom.

## 1. Migration V710__graderte_andre_ytelser_events.sql
```sql
DROP TABLE graderte_andre_ytelser_events;

CREATE TABLE graderte_andre_ytelser_events
(
    versjon                       uuid        PRIMARY KEY, -- UUIDv7, generated in the application
    fødselsnummer                 varchar     NOT NULL,
    yrkesaktivitetstype           varchar     NOT NULL,
    organisasjonsnummer           varchar     NULL,
    tidspunkt                     timestamptz NOT NULL,
    utført_av_saksbehandler_ident varchar     NOT NULL,
    notat_til_beslutter           varchar     NOT NULL,
    data_json                     jsonb       NOT NULL     -- { "dager": [...] }, only the changed days
);

CREATE INDEX graderte_andre_ytelser_events_stream_idx
    ON graderte_andre_ytelser_events (fødselsnummer, yrkesaktivitetstype, organisasjonsnummer, versjon);
```
- Postgres compares `uuid` byte by byte, so UUIDv7 sorts correctly in `ORDER BY versjon`.
- Reading always fetches **all** events in a stream, sorted by `versjon`. There's no "latest row" query.
- When looking up one stream, compare orgnr with `IS NOT DISTINCT FROM`, because `=` never matches NULL.
- `jsonb` instead of `varchar` (the old table used varchar), so you can query the data directly.
- Postgres 17 has no built-in `uuidv7()`, so the application generates the version (`kotlin.uuid.Uuid.generateV7()`, Kotlin 2.4).
- Numbering: origin/main is at V707. V710 works (Flyway accepts gaps), but V708 is tidier.
- V694 is probably applied in prod as well. DROP deletes any data there. That's OK, since the feature is toggled off in Spleis.
- Events are never changed or deleted. Every event is part of the state, so a missing or corrupt row affects all
  later states in the stream.

## 2. Things that depend on the table name
- The new table keeps the name `graderte_andre_ytelser_events`, so `spesialist-opprydding-dev` (`PersonRepository.kt:553`,
  `AbstractDatabaseTest.kt:221`) needs no changes.

## 3. Domain (`spesialist-domain/.../andreytelser`)
- New identity: `GraderteAndreYtelserId(identitetsnummer, yrkesaktivitet: Yrkesaktivitetstype, organisasjonsnummer: String?)`.
- One event: `GraderteAndreYtelserEndretEvent(versjon: UUID, tidspunkt, utførtAv, notatTilBeslutter, dager)`,
  where `dager` = the changed days. This replaces `Opprettet` and `Metadata.sekvensnummer`.
- Aggregate `GraderteAndreYtelser(id: GraderteAndreYtelserId)`:
  - `events` sorted by version, `versjon` = the last event's version.
  - `dager` = the result of applying all events. Internally a `Map<LocalDate, GraderteAndreYtelserDag>`.
  - `fun endre(dager, saksbehandler, notat)` drops the days that are identical to the current state. If any
    days remain, it creates a new event with them and applies it. Otherwise it does nothing.
  - `private fun apply(event)`: `dagerPerDato = dagerPerDato + event.dager.associateBy { it.dato }`.
  - `ny(...)` = an empty stream + `endre(...)`. There's no separate creation event.
  - `fraLagring(id, events)` sorts by version and applies each event in turn. Here the replay is **real**: the order
    determines the state.
- `GraderteAndreYtelserDag` stays as it is.
- Validator:
  - `FinnesAlleredeForYrkesaktivitet` goes away. An existing stream now just gets a new event.
  - ManglerEndringer, NegativGrad and TotalGradOver100 stay. They are checked on the days in the request. A day is
    replaced in full, so it's enough to validate the incoming days.

## 4. Repository
- Interface:
  - `finnAlleForIdentitetsnummer(identitetsnummer)`: all events for the person, grouped by stream, each stream replayed.
  - `finn(id): GraderteAndreYtelser?`
  - `lagre(graderteAndreYtelser)`
- `lagre`: `INSERT ... ON CONFLICT (versjon) DO NOTHING` for every event. Idempotent without the sekvensnummer query.
- `InMemoryGraderteAndreYtelserRepository` (testFixtures) is updated to match.
- Remove `DBEventType` and the type column. There's only one event type now.

## 5. API
- One write endpoint: `POST /api/personer/{pseudoId}/graderte-andre-ytelser`
  with body `{ yrkesaktivitet, organisasjonsnummer?, versjon?, dager, notatTilBeslutter }`, where `dager` = only the edited days.
  The first time it creates the stream, after that it adds a new event. Response: `{ versjon }`.
  - Same path as the GET, and the person is identified by pseudoId like the other `Personer` endpoints.
  - POST because each call adds a change (only the edited days); it doesn't replace the whole state.
- Remove `POST /api/graderte-andre-ytelser`, `GraderteAndreYtelserResource` and `PostGraderteAndreYtelserBehandler`.
  Speil's generated client must be regenerated.
- GET returns one entry per stream: yrkesaktivitet, organisasjonsnummer, the resulting `dager`, `versjon`, and `events`
  (history with versjon/tidspunkt/saksbehandler/notat and the days changed in each event).
- Remove `andreYtelserType` (top level) from the request, the response and the events.
- Error codes: remove `GRADERT_ANNEN_YTELSE_FOR_YRKESAKTIVITET_FINNES`. Keep MANGLER_ENDRINGER, NEGATIV_GRAD,
  TOTAL_GRAD_OVER_100. Add UTDATERT_TILSTAND (409).
- Speil sends the `versjon` it last saw (null if no GAY exists yet for the stream). If it isn't the stream's current
  version → 409 `UTDATERT_TILSTAND`, nothing stored, no ping. Order: validerDager (400) → versjon check (409) → ny/endre.
- A request where all days are identical to the current state: 200 with the existing `versjon`.
- The new POST behandler does **not** call `finnEllerOpprettTotrinnsvurdering`, as today's POST does. That waits for the
  saksbehandlerhandling step.

## 6. Ping to Spleis (`GraderteAndreYtelserEndringsevent.kt`)
- `fom` = the earliest date in the new event. No diff between versions is needed.

## 7. River
- Replay each of the person's streams, filter the resulting days to fom..tom, keep the current output format.
- No other change. The contract with Spleis is handled separately.

## 8. Tests
- Domain: create, change (only the days in the event are replaced, other days stay), several events applied in
  the right order, a later event overwrites an earlier one for the same date, days identical to the state are
  dropped, only identical days gives no event, fraLagring gives the same state as the original aggregate.
- Validator: remove the FinnesAllerede test.
- Repository (DB): store/fetch the stream, replay in the right order, idempotent lagre, separate streams per
  yrkesaktivitet, two ARBEIDSTAKER streams with different orgnr stay separate, lookup of streams without orgnr (NULL).
- API: first POST creates, the second only changes the days it contains, GET shows the resulting days + history
  with deltas, validation errors, 409 on outdated versjon / missing versjon for an existing stream / versjon for a
  stream that doesn't exist.
- Endringsevent: `fom` = the earliest date in the event, also when the stream has earlier days.
- River: answers with the replayed state; orgnr key if present, otherwise yrkesaktivitetstype.
- E2E + opprydding-dev.

## Later
- Show old values in history in Speil by replaying up to the previous event.

## Open questions
None at the moment.

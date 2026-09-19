# Bruk av bibliotekene i tbd-libs

Generert av `generer-biblioteksbruk.sh` 19.09.2026. Ikke rediger for hånd.

Maven-group: `com.github.navikt.tbd-libs`. Modulnavn er stien i metarepoet, med `:` som skilletegn.
Interne avhengigheter mellom modulene i tbd-libs er tatt med i egen tabell.

## Bibliotek til modul

| Bibliotek | Antall moduler | Moduler |
| --- | --- | --- |
| rapids-and-rivers-test | 41 | dataprodukter:forstegangsbehandling, risk-mock, spaghet, spammer, spare, sparkel-norg, spedisjon:spedisjon-async, spedisjon:spedisjon-opprydding-dev, speed:async, spekemat:slakter, spennende, spenn:spenn-avstemming, spenn:spenn-mq, spenn:spenn-opprydding-dev, spenn:spenn-selve, spenn:spenn-simulering, spesidaler:async, spesidaler:opprydding-dev, spetakkel, sp-forsikring:opprydding-dev, sp-forsikring:sp-forsikring, spill-av-im, spinnvill:spinnvill-app, spleisesparkel:aap, spleisesparkel:dagpenger, spleis-testdata, spock:opprydding-dev, spock:spock, spoiler, spoogle:spoogle-backend, spoogle:spoogle-opprydding-dev, sporbar, sporing, spotlight, spre:gosys, spregulering, spre:oppgaver, spre:styringsinfo, spre:subsumsjon, spre:sykmeldt, vedtaksfeed |
| azure-token-client-default | 31 | spaghet, spanner:backend, spapi, sparkelapper:aareg, sparkelapper:arbeidsgiver, sparkelapper:dokumenter, sparkelapper:egenansatt, sparkelapper:gosys, sparkelapper:inntekt, sparkelapper:institusjonsopphold, sparkelapper:medlemskap, sparkelapper:personinfo, sparkelapper:representasjon, sparkelapper:sputnik, sparkel-norg, spedisjon:spedisjon-async, speed:api, speed:async, spekemat:slakter, spennende, spenn:spenn-simulering, spenn:spenn-simulering-api, spesidaler:async, spleisesparkel:aap, spleisesparkel:dagpenger, spleis-testdata, sporbar, sporing, spre:gosys, spre:styringsinfo, vedtaksfeed |
| postgres-testdatabaser | 23 | dataprodukter:forstegangsbehandling, spaghet, spammer, spare, spedisjon, spekemat:foredler, spennende, spenn:spenn-avstemming, spenn:spenn-opprydding-dev, spenn:spenn-selve, spesidaler:api, spesidaler:opprydding-dev, spetakkel, spill-av-im, spock:opprydding-dev, spock:spock, spoiler, spokelse, sporing, spre:gosys, spregulering, spre:oppgaver, spre:styringsinfo |
| retry | 21 | spaghet, spammer, spapi, sparkelapper:arbeidsgiver, sparkelapper:gosys, sparkelapper:inntekt, sparkelapper:medlemskap, sparkelapper:personinfo, sparkelapper:sputnik, spedisjon:spedisjon-async, spekemat:slakter, spennende, spenn:spenn-simulering, sp-forsikring:sp-forsikring, spleisesparkel:aap, spleisesparkel:dagpenger, sporbar, sporhund, spre:gosys, spre:styringsinfo, vedtaksfeed |
| naisful-app | 15 | spapi, sparkelapper:sykepengeperioder-mock, sparkiv-subsumsjon, sparsom:api, spedisjon:spedisjon-selve, speed:api, spekemat:foredler, spenn:spenn-simulering-api, spesidaler:api, spleis-testdata, spokelse, sporhund, sporing, spurtedu, vedtaksfeed |
| speed-client | 13 | spaghet, spanner:backend, sparkelapper:gosys, sparkelapper:personinfo, sparkel-norg, spedisjon:spedisjon-async, speed:async, spennende, spleis-testdata, sporbar, spre:gosys, spre:styringsinfo, vedtaksfeed |
| naisful-test-app | 10 | spapi, spedisjon:spedisjon-selve, speed:api, spekemat:foredler, spenn:spenn-simulering-api, spesidaler:api, spleis-testdata, spokelse, spurtedu, vedtaksfeed |
| mock-http-client | 6 | speed:api, speed:async, spekemat:slakter, spenn:spenn-simulering, spenn:spenn-simulering-api, spesidaler:async |
| access-token-provider-texas | 4 | spesialist:clients:spesialist-client-entra-id, sp-forsikring:sp-forsikring, sporhund, sp-vilkarsproving:sp-vilkarsproving |
| signed-jwt-issuer-test | 4 | spapi, spesidaler:api, spokelse, vedtaksfeed |
| spurtedu-client | 4 | spaghet, spammer, spanner:backend, spoiler |
| access-token-provider-api | 3 | spesialist:spesialist-application, sp-forsikring:sp-forsikring, sporhund |
| populasjonstilgangskontroll-provider-api | 3 | spesialist:spesialist-api, spesialist:spesialist-application, sporhund |
| spedisjon-client | 3 | spaghet, sparkelapper:arbeidsgiver, sporbar |
| kafka | 2 | sparkiv-subsumsjon, sporhund |
| person-pseudo-id | 2 | spesialist:clients:spesialist-client-personpseudoid, sporhund |
| populasjonstilgangskontroll-provider-tilgangsmaskinen | 2 | spesialist:clients:spesialist-client-tilgangsmaskinen, sporhund |
| azure-token-client | 1 | spurtedu |
| jackson | 1 | risk-mock |
| kafka-test | 1 | vedtaksfeed |
| minimal-soap-client | 1 | spenn:spenn-simulering-api |
| naisful-postgres | 1 | spedisjon:spedisjon-selve |
| signed-jwt | 1 | spoken |
| speil-backend-app | 1 | sp-vilkarsproving:sp-vilkarsproving |
| sql-dsl | 1 | spesidaler:api |

## Modul til bibliotek

| Modul | Biblioteker |
| --- | --- |
| dataprodukter:forstegangsbehandling | postgres-testdatabaser, rapids-and-rivers-test |
| risk-mock | jackson, rapids-and-rivers-test |
| spaghet | azure-token-client-default, postgres-testdatabaser, rapids-and-rivers-test, retry, spedisjon-client, speed-client, spurtedu-client |
| spammer | postgres-testdatabaser, rapids-and-rivers-test, retry, spurtedu-client |
| spanner:backend | azure-token-client-default, speed-client, spurtedu-client |
| spapi | azure-token-client-default, naisful-app, naisful-test-app, retry, signed-jwt-issuer-test |
| spare | postgres-testdatabaser, rapids-and-rivers-test |
| sparkelapper:aareg | azure-token-client-default |
| sparkelapper:arbeidsgiver | azure-token-client-default, retry, spedisjon-client |
| sparkelapper:dokumenter | azure-token-client-default |
| sparkelapper:egenansatt | azure-token-client-default |
| sparkelapper:gosys | azure-token-client-default, retry, speed-client |
| sparkelapper:inntekt | azure-token-client-default, retry |
| sparkelapper:institusjonsopphold | azure-token-client-default |
| sparkelapper:medlemskap | azure-token-client-default, retry |
| sparkelapper:personinfo | azure-token-client-default, retry, speed-client |
| sparkelapper:representasjon | azure-token-client-default |
| sparkelapper:sputnik | azure-token-client-default, retry |
| sparkelapper:sykepengeperioder-mock | naisful-app |
| sparkel-norg | azure-token-client-default, rapids-and-rivers-test, speed-client |
| sparkiv-subsumsjon | kafka, naisful-app |
| sparsom:api | naisful-app |
| spedisjon | postgres-testdatabaser |
| spedisjon:spedisjon-async | azure-token-client-default, rapids-and-rivers-test, retry, speed-client |
| spedisjon:spedisjon-opprydding-dev | rapids-and-rivers-test |
| spedisjon:spedisjon-selve | naisful-app, naisful-postgres, naisful-test-app |
| speed:api | azure-token-client-default, mock-http-client, naisful-app, naisful-test-app |
| speed:async | azure-token-client-default, mock-http-client, rapids-and-rivers-test, speed-client |
| spekemat:foredler | naisful-app, naisful-test-app, postgres-testdatabaser |
| spekemat:slakter | azure-token-client-default, mock-http-client, rapids-and-rivers-test, retry |
| spennende | azure-token-client-default, postgres-testdatabaser, rapids-and-rivers-test, retry, speed-client |
| spenn:spenn-avstemming | postgres-testdatabaser, rapids-and-rivers-test |
| spenn:spenn-mq | rapids-and-rivers-test |
| spenn:spenn-opprydding-dev | postgres-testdatabaser, rapids-and-rivers-test |
| spenn:spenn-selve | postgres-testdatabaser, rapids-and-rivers-test |
| spenn:spenn-simulering-api | azure-token-client-default, minimal-soap-client, mock-http-client, naisful-app, naisful-test-app |
| spenn:spenn-simulering | azure-token-client-default, mock-http-client, rapids-and-rivers-test, retry |
| spesialist:clients:spesialist-client-entra-id | access-token-provider-texas |
| spesialist:clients:spesialist-client-personpseudoid | person-pseudo-id |
| spesialist:clients:spesialist-client-tilgangsmaskinen | populasjonstilgangskontroll-provider-tilgangsmaskinen |
| spesialist:spesialist-api | populasjonstilgangskontroll-provider-api |
| spesialist:spesialist-application | access-token-provider-api, populasjonstilgangskontroll-provider-api |
| spesidaler:api | naisful-app, naisful-test-app, postgres-testdatabaser, signed-jwt-issuer-test, sql-dsl |
| spesidaler:async | azure-token-client-default, mock-http-client, rapids-and-rivers-test |
| spesidaler:opprydding-dev | postgres-testdatabaser, rapids-and-rivers-test |
| spetakkel | postgres-testdatabaser, rapids-and-rivers-test |
| sp-forsikring:opprydding-dev | rapids-and-rivers-test |
| sp-forsikring:sp-forsikring | access-token-provider-api, access-token-provider-texas, rapids-and-rivers-test, retry |
| spill-av-im | postgres-testdatabaser, rapids-and-rivers-test |
| spinnvill:spinnvill-app | rapids-and-rivers-test |
| spleisesparkel:aap | azure-token-client-default, rapids-and-rivers-test, retry |
| spleisesparkel:dagpenger | azure-token-client-default, rapids-and-rivers-test, retry |
| spleis-testdata | azure-token-client-default, naisful-app, naisful-test-app, rapids-and-rivers-test, speed-client |
| spock:opprydding-dev | postgres-testdatabaser, rapids-and-rivers-test |
| spock:spock | postgres-testdatabaser, rapids-and-rivers-test |
| spoiler | postgres-testdatabaser, rapids-and-rivers-test, spurtedu-client |
| spokelse | naisful-app, naisful-test-app, postgres-testdatabaser, signed-jwt-issuer-test |
| spoken | signed-jwt |
| spoogle:spoogle-backend | rapids-and-rivers-test |
| spoogle:spoogle-opprydding-dev | rapids-and-rivers-test |
| sporbar | azure-token-client-default, rapids-and-rivers-test, retry, spedisjon-client, speed-client |
| sporhund | access-token-provider-api, access-token-provider-texas, kafka, naisful-app, person-pseudo-id, populasjonstilgangskontroll-provider-api, populasjonstilgangskontroll-provider-tilgangsmaskinen, retry |
| sporing | azure-token-client-default, naisful-app, postgres-testdatabaser, rapids-and-rivers-test |
| spotlight | rapids-and-rivers-test |
| spre:gosys | azure-token-client-default, postgres-testdatabaser, rapids-and-rivers-test, retry, speed-client |
| spregulering | postgres-testdatabaser, rapids-and-rivers-test |
| spre:oppgaver | postgres-testdatabaser, rapids-and-rivers-test |
| spre:styringsinfo | azure-token-client-default, postgres-testdatabaser, rapids-and-rivers-test, retry, speed-client |
| spre:subsumsjon | rapids-and-rivers-test |
| spre:sykmeldt | rapids-and-rivers-test |
| spurtedu | azure-token-client, naisful-app, naisful-test-app |
| sp-vilkarsproving:sp-vilkarsproving | access-token-provider-texas, speil-backend-app |
| vedtaksfeed | azure-token-client-default, kafka-test, naisful-app, naisful-test-app, rapids-and-rivers-test, retry, signed-jwt-issuer-test, speed-client |

## Interne avhengigheter i tbd-libs

| Modul | Avhenger av |
| --- | --- |
| access-token-provider-texas | access-token-provider-api (implementation), jackson (implementation), mock-http-client (testImplementation), retry (implementation) |
| azure-token-client-default | azure-token-client (api) |
| azure-token-client | mock-http-client (testImplementation), result-object (api), signed-jwt (api) |
| kafka | kafka-test (testImplementation) |
| naisful-test-app | naisful-app (api) |
| populasjonstilgangskontroll-provider-tilgangsmaskinen | access-token-provider-api (api), access-token-provider-texas (implementation), jackson (implementation), mock-http-client (testImplementation), populasjonstilgangskontroll-provider-api (api) |
| rapids-and-rivers | kafka (api), kafka-test (testImplementation), rapids-and-rivers-api (api), rapids-and-rivers-test (testImplementation) |
| rapids-and-rivers-test | rapids-and-rivers-api (api) |
| spedisjon-client | azure-token-client (api), mock-http-client (testImplementation) |
| speed-client | azure-token-client (api), mock-http-client (testImplementation), result-object (api) |
| speil-backend-app | access-token-provider-api (api), access-token-provider-texas (implementation), naisful-postgres (api), person-pseudo-id (api), populasjonstilgangskontroll-provider-api (api), populasjonstilgangskontroll-provider-tilgangsmaskinen (implementation) |
| spurtedu-client | azure-token-client (api), mock-http-client (testImplementation) |
| sql-dsl | postgres-testdatabaser (testImplementation) |

## Moduler uten eksterne brukere

Brukes bare av andre moduler i tbd-libs: rapids-and-rivers-api, result-object.

Ingen treff verken i andre komponenter eller internt i tbd-libs: rapids-and-rivers, test.

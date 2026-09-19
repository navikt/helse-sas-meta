# Bruk av bibliotekene i sykepenger-libs

Generert av `generer-biblioteksbruk.sh` 19.09.2026. Ikke rediger for hånd.

Maven-group: `no.nav.sykepenger.libs`. Modulnavn er stien i metarepoet, med `:` som skilletegn.
Interne avhengigheter mellom modulene i sykepenger-libs er tatt med i egen tabell.

## Bibliotek til modul

| Bibliotek | Antall moduler | Moduler |
| --- | --- | --- |
| logging | 11 | spaghet, sparkel-norg, sparsom:api, sparsom:opprydding, sparsom:sparsom, spedisjon:spedisjon-async, spedisjon:spedisjon-opprydding-dev, spedisjon:spedisjon-selve, sp-forsikring:opprydding-dev, sp-forsikring:sp-forsikring, spout |
| testing | 1 | sp-forsikring:sp-forsikring |

## Modul til bibliotek

| Modul | Biblioteker |
| --- | --- |
| spaghet | logging |
| sparkel-norg | logging |
| sparsom:api | logging |
| sparsom:opprydding | logging |
| sparsom:sparsom | logging |
| spedisjon:spedisjon-async | logging |
| spedisjon:spedisjon-opprydding-dev | logging |
| spedisjon:spedisjon-selve | logging |
| sp-forsikring:opprydding-dev | logging |
| sp-forsikring:sp-forsikring | logging, testing |
| spout | logging |

## Interne avhengigheter i sykepenger-libs

| Modul | Avhenger av |
| --- | --- |

## Moduler uten eksterne brukere

Ingen moduler brukes utelukkende internt.

Alle publiserte moduler har minst én bruker.

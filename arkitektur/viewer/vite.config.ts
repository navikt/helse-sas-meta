import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import type { IncomingMessage } from 'node:http';
import { join } from 'node:path';

/**
 * FLOWS_DIR peker på arkitektur/flows/ (ett nivå opp fra arkitektur/viewer/).
 * Dette er den eneste "backend"-funksjonaliteten vieweren har: et lite
 * dev-server-endepunkt som lister og serverer *.flow.json-filer fra disk,
 * slik at browseren (som ikke kan liste filsystemet selv) kan hente dem.
 *
 * Alt skjer lokalt via Vite sin innebygde dev-server – ingen eksterne
 * nettverkskall, ingen CDN-er, ingen telemetri.
 */
const FLOWS_DIR = join(__dirname, '..', 'flows');

/**
 * Forsvar mot DNS-rebinding: en ondsinnet nettside kan få et domene den
 * kontrollerer til å peke på 127.0.0.1, og da ser browseren kallene mot
 * dev-serveren som same-origin. Vi krever derfor eksplisitt at Host-headeren
 * faktisk er loopback. Dette kommer i tillegg til Vites egen
 * `allowedHosts`-sjekk (se hvordan middlewaren registreres under).
 */
const ALLOWED_HOSTNAMES = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);

function isLoopbackRequest(req: IncomingMessage): boolean {
  const host = req.headers.host;
  if (!host) return false;
  // Strip portnummer, men ta høyde for IPv6-literaler ("[::1]:5173").
  const hostname = host.startsWith('[')
    ? host.slice(0, host.indexOf(']') + 1)
    : (host.split(':')[0] ?? '');
  return ALLOWED_HOSTNAMES.has(hostname);
}

function flowsApiPlugin(): Plugin {
  return {
    name: 'arkitektur-flows-api',
    configureServer(server) {
      // Middlewaren registreres bevisst her (pre-hook), ikke i funksjonen
      // `configureServer` kan returnere: post-hooks kjører etter Vites
      // html-fallback, og da ville /api/* blitt besvart med index.html.
      //
      // DNS-rebinding-beskyttelsen ivaretas derfor av `isLoopbackRequest`
      // under, som avviser alle kall der Host-headeren ikke er loopback.
      // Det er nettopp den sjekken Vites egen `allowedHosts` gjør, og siden
      // vi ligger foran den i stacken må vi gjøre den selv.
      server.middlewares.use('/api/flows', (req, res) => {
          if (!isLoopbackRequest(req)) {
            res.statusCode = 403;
            res.end('Forbidden');
            return;
          }
          try {
            const files = readdirSync(FLOWS_DIR).filter((f) => f.endsWith('.flow.json'));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(files));
          } catch {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify([]));
          }
        });

        server.middlewares.use('/api/flow/', (req, res) => {
          if (!isLoopbackRequest(req)) {
            res.statusCode = 403;
            res.end('Forbidden');
            return;
          }
          const name = decodeURIComponent((req.url ?? '').replace(/^\//, ''));
          // Enkel sikkerhetssjekk: kun tillat flate filnavn som faktisk er
          // *.flow.json, ingen path traversal ut av FLOWS_DIR.
          if (!/^[A-Za-z0-9._-]+\.flow\.json$/.test(name)) {
            res.statusCode = 400;
            res.end('Ugyldig filnavn');
            return;
          }
          const path = join(FLOWS_DIR, name);
          try {
            const stats = statSync(path);
            if (!stats.isFile()) {
              res.statusCode = 404;
              res.end('Fant ikke flyt-filen');
              return;
            }
            const content = readFileSync(path, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(content);
          } catch {
            res.statusCode = 404;
            res.end('Fant ikke flyt-filen');
          }
        });
    },
  };
}

export default defineConfig({
  plugins: [react(), flowsApiPlugin()],
  server: {
    // Kun localhost — vieweren er et lokalt utviklerverktøy, ikke en
    // eksponert tjeneste.
    host: '127.0.0.1',
    port: 5173,
  },
});

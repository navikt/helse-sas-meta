import type { FlowDocument, FlowNode, NodeType } from '../schema/flow';

/**
 * En app med noder som hører til den (f.eks. Spesialist med egen database,
 * beslutningspunkter og prosess-steg). Vises som en ramme rundt nodene.
 */
export interface AppGroup {
  id: string;
  label: string;
  nodeIds: string[];
}

/** Nodetyper som selv representerer en app ("anker" for gruppen). */
const APP_TYPES = new Set<NodeType>(['service', 'frontend']);
/** Nodetyper som kan ligge inni en app. Hendelser og eksterne systemer
 * hører ikke til én app, og grupperes aldri automatisk. */
const MEMBER_TYPES = new Set<NodeType>(['process', 'decision', 'database']);

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[^a-z0-9]/g, '');
}

/** Første mappe i en repo-relativ evidens-sti (= appens repo), f.eks.
 * `spesialist/spesialist-db/...` → `spesialist`. Mapper som starter med `.`
 * (f.eks. `.idea`) er ikke apper. */
function evidenceRoots(node: FlowNode): string[] {
  return node.evidence
    .map((e) => e.file.split('/')[0] ?? '')
    .filter((root) => root.length > 0 && !root.startsWith('.'));
}

/** Repoet flest av nodens evidens-filer ligger i (første vinner ved likt). */
function majorityRoot(node: FlowNode): string | undefined {
  const counts = new Map<string, number>();
  for (const root of evidenceRoots(node)) counts.set(root, (counts.get(root) ?? 0) + 1);
  let best: string | undefined;
  let bestCount = 0;
  for (const [root, count] of counts) {
    if (count > bestCount) {
      best = root;
      bestCount = count;
    }
  }
  return best;
}

/**
 * Finner hvilke noder som hører til samme app:
 *
 * 1. Eksplisitt `group` på noden vinner alltid. Peker `group` på id-en til
 *    en tjeneste-/frontend-node, havner noden i den appens gruppe.
 * 2. Ellers knyttes prosess-, beslutnings- og databasenoder til appen
 *    evidensen deres ligger i: en tjeneste/frontend hvis id eller navn
 *    matcher repoet (f.eks. `spesialist_db` med evidens i `spesialist/` →
 *    Spesialist). Databaser må i tillegg ha appens navn i id/navn, så en
 *    database appen bare leser fra (f.eks. en Infotrygd-replika) ikke
 *    havner i rammen. Finnes ingen slik node, men flere noder deler repo, får de
 *    en egen gruppe oppkalt etter repoet.
 *
 * Tjenester/frontender blir aldri automatisk medlem av en annen app (en
 * tjeneste kan godt ha evidens i appen som kaller den). Grupper med kun én
 * node utelates — en ramme rundt én boks gir ingen informasjon.
 */
export function resolveAppGroups(doc: FlowDocument): AppGroup[] {
  const nodesById = new Map(doc.nodes.map((n) => [n.id, n]));

  // Tjeneste/frontend-noder som eier et repo (id eller navn matcher repoet).
  const anchorByRepo = new Map<string, FlowNode | null>();
  for (const node of doc.nodes) {
    if (!APP_TYPES.has(node.type)) continue;
    const names = new Set([normalize(node.id), normalize(node.label)]);
    const repo = [...new Set(evidenceRoots(node))].find((root) => names.has(normalize(root)));
    if (!repo) continue;
    // To ankre for samme repo er tvetydig — da bruker vi ingen av dem.
    anchorByRepo.set(repo, anchorByRepo.has(repo) ? null : node);
  }

  const groups = new Map<string, AppGroup>();
  const add = (groupId: string, label: string, nodeId: string) => {
    const group = groups.get(groupId) ?? { id: groupId, label, nodeIds: [] };
    if (!group.nodeIds.includes(nodeId)) group.nodeIds.push(nodeId);
    groups.set(groupId, group);
  };

  for (const node of doc.nodes) {
    if (node.group) {
      const target = nodesById.get(node.group);
      if (target && APP_TYPES.has(target.type)) {
        add(`app:${target.id}`, target.label, target.id);
        add(`app:${target.id}`, target.label, node.id);
      } else {
        add(`group:${node.group}`, node.group, node.id);
      }
      continue;
    }
    if (!MEMBER_TYPES.has(node.type)) continue;
    const repo = majorityRoot(node);
    if (!repo) continue;
    const anchor = anchorByRepo.get(repo);
    // En database tilhører appen bare hvis navnet sier det (f.eks.
    // "Spesialist database"). Ellers kan det være en annen kilde appen bare
    // leser fra, f.eks. en Infotrygd-replika.
    if (node.type === 'database' && !normalize(`${node.id} ${node.label}`).includes(normalize(repo))) continue;
    if (anchor && !anchor.group) {
      add(`app:${anchor.id}`, anchor.label, anchor.id);
      add(`app:${anchor.id}`, anchor.label, node.id);
    } else if (anchor === undefined) {
      add(`repo:${repo}`, repo, node.id);
    }
  }

  // En node kan bare ligge i én ramme: første gruppe vinner.
  const assigned = new Set<string>();
  const result: AppGroup[] = [];
  for (const group of groups.values()) {
    const nodeIds = group.nodeIds.filter((id) => !assigned.has(id));
    if (nodeIds.length < 2) continue;
    nodeIds.forEach((id) => assigned.add(id));
    result.push({ ...group, nodeIds });
  }
  return result;
}

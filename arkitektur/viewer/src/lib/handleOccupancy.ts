/**
 * Et tilkoblingspunkt identifiseres av noden og handle-id-en. Source- og
 * target-handlene på samme port deler id (se `FlowNodeCard`), så et punkt
 * regnes som opptatt uansett om en annen kant bruker det som kilde eller mål.
 */
export interface EdgeEndpoints {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export function isHandleOccupied(
  edges: EdgeEndpoints[],
  nodeId: string,
  handleId: string | null | undefined,
  ignoreEdgeId?: string | null
): boolean {
  if (!handleId) return false;
  return edges.some(
    (e) =>
      e.id !== ignoreEdgeId &&
      ((e.source === nodeId && e.sourceHandle === handleId) || (e.target === nodeId && e.targetHandle === handleId))
  );
}

/** En (om)kobling er kun gyldig hvis verken kilde- eller målpunktet allerede
 * brukes av en ANNEN kant enn den som kobles om. */
export function isConnectionFree(
  edges: EdgeEndpoints[],
  connection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null },
  ignoreEdgeId?: string | null
): boolean {
  if (connection.source === connection.target && connection.sourceHandle === connection.targetHandle) return false;
  return (
    !isHandleOccupied(edges, connection.source, connection.sourceHandle, ignoreEdgeId) &&
    !isHandleOccupied(edges, connection.target, connection.targetHandle, ignoreEdgeId)
  );
}

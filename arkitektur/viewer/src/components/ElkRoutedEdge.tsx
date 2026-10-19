import { BaseEdge, EdgeLabelRenderer, type EdgeProps } from '@xyflow/react';
import { wrapLabel, type XY } from '../layout/elkLayout';
import { buildRoundedPath, labelAnchor, orthogonalRoute, type HandleSide } from '../lib/polylinePath';
import { avoidBoxes, type AvoidBox } from '../lib/boxAvoidance';

/**
 * Egen edge-komponent som tegner ELKs faktisk beregnede, kollisjonsbeviste
 * linjerute (`data.points`) i stedet for å la React Flows innebygde
 * `smoothstep`-algoritme gjette en rute ut fra kun start-/sluttpunkt. ELK
 * kjenner til plasseringen av ALLE noder og kanter i diagrammet når den
 * beregner ruten, så resultatet unngår boks-gjennomgang og unødvendig
 * kryssing på en helt annen måte enn det en lokal handle-til-handle-kurve
 * kan.
 *
 * Hvis `data.points` mangler (typisk for selvreferanser, som ELKs layered
 * algoritme ikke ruter), faller vi tilbake til en enkel rett linje mellom
 * React Flows egne `sourceX/Y`/`targetX/Y`-props. Uansett forankres rutens
 * første og siste punkt ALLTID til disse live props-verdiene (se under),
 * slik at en kant som er dratt til et annet tilkoblingspunkt (reconnect)
 * eller hvis node har flyttet seg, alltid peker nøyaktig på riktig handle
 * — ikke ut i løse luften på en utdatert, ELK-beregnet posisjon.
 */
export interface ElkRoutedEdgeData extends Record<string, unknown> {
  points?: XY[];
  /** ELKs plassering av labelen (se `LaidOutEdge.labelBox`). */
  labelBox?: { x: number; y: number; width: number; height: number };
  /** Satt når kilde- eller mål-boksen er flyttet manuelt (eller kanten er
   * koblet om). Da tegnes en ortogonal rute fra de live handlene i stedet
   * for ELKs (nå utdaterte) rute, slik at linjen bøyer seg naturlig og blir
   * rett igjen når boksene står i linje. */
  orthogonal?: boolean;
  /** Andre bokser linjen ikke skal gå gjennom (brukes med `orthogonal`). */
  obstacles?: AvoidBox[];
  /** Kantens egne kilde-/mål-bokser, slik at en ortogonal rute aldri går
   * gjennom dem (f.eks. etter omkobling til baksiden av en boks). */
  sourceBox?: AvoidBox;
  targetBox?: AvoidBox;
}

export function ElkRoutedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
  markerEnd,
}: EdgeProps<import('@xyflow/react').Edge<ElkRoutedEdgeData>>) {
  // ELKs punkter er beregnet mot handlene edgen hadde PÅ LAYOUT-TIDSPUNKTET.
  // Hvis brukeren siden har dratt en kant til et annet "magnet"-punkt
  // (reconnect til en annen slot, eller til en annen node), vet React Flow
  // selv nøyaktig hvor den nye handlen faktisk er — via `sourceX/Y` og
  // `targetX/Y`, som alltid reflekterer gjeldende `sourceHandle`/
  // `targetHandle` og node-posisjon, uansett hva ELK opprinnelig beregnet.
  // Vi forankrer derfor alltid rutens første og siste punkt til disse live
  // koordinatene. Når kilde-/mål-boksen er flyttet (`data.orthogonal`),
  // forkastes ELKs mellompunkter og ruten bygges ortogonalt fra handlene.
  const source = { x: sourceX, y: sourceY };
  const target = { x: targetX, y: targetY };
  const hasElkRoute = !!data?.points && data.points.length >= 2;
  let points: XY[];
  if (data?.orthogonal) {
    points = orthogonalRoute(source, sourcePosition as HandleSide, target, targetPosition as HandleSide, 20, {
      source: data.sourceBox,
      target: data.targetBox,
    });
    if (data.obstacles && data.obstacles.length > 0) {
      points = avoidBoxes(points, data.obstacles);
    }
  } else if (hasElkRoute) {
    points = [source, ...data!.points!.slice(1, -1), target];
  } else {
    points = [source, target];
  }

  const path = buildRoundedPath(points);
  const { x: labelX, y: labelY } = labelAnchor(points, data?.orthogonal ? undefined : data?.labelBox);

  return (
    <>
      <BaseEdge path={path} style={style} markerEnd={markerEnd} />
      {label != null && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              background: (labelBgStyle?.fill as string | undefined) ?? '#ffffff',
              opacity: (labelBgStyle as { fillOpacity?: number } | undefined)?.fillOpacity ?? 1,
              padding: labelBgPadding ? `${labelBgPadding[1]}px ${labelBgPadding[0]}px` : '2px 4px',
              borderRadius: labelBgBorderRadius ?? 4,
              fontSize: (labelStyle?.fontSize as number | undefined) ?? 11,
              fontWeight: (labelStyle?.fontWeight as number | undefined) ?? 500,
              color: (labelStyle?.fill as string | undefined) ?? '#334155',
              whiteSpace: 'pre',
              lineHeight: '14px',
              textAlign: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
            }}
            className="nodrag nopan"
          >
            {typeof label === 'string' ? wrapLabel(label).join('\n') : label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

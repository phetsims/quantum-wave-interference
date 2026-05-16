// Copyright 2026, University of Colorado Boulder

/**
 * Snapshot captures the state of the detector screen at a point in time.
 * It stores a copy of the hits array and the detection mode, along with metadata needed to render the snapshot in the
 * dialog.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import SchemaOrientedIOType from '../../../../tandem/js/types/SchemaOrientedIOType.js';
import { type CoreRecord } from '../../../../tandem/js/types/StateSchema.js';
import StringUnionIO from '../../../../tandem/js/types/StringUnionIO.js';
import { DetectionModeValues } from './DetectionMode.js';
import { SlitConfigurationWithNoBarrierValues } from './SlitConfiguration.js';
import { SourceTypeValues } from './SourceType.js';

const SNAPSHOT_SCHEMA = {

  // The current ordinal label for this snapshot in the dialog, not a persistent unique ID.
  snapshotNumber: NumberIO,

  // Copy of the hits at the time of capture
  hits: ArrayIO( Vector2.Vector2IO ),

  // The detection mode at the time of capture
  detectionMode: StringUnionIO( DetectionModeValues ),

  // The source type at the time of capture (needed for rendering color)
  sourceType: StringUnionIO( SourceTypeValues ),

  // Wavelength (nm) at the time of capture (needed for photon hit color)
  wavelength: NumberIO,

  // Physics parameters captured for display in the snapshot dialog labels
  slitSeparation: NumberIO, // mm
  screenDistance: NumberIO, // m
  screenHalfWidth: NumberIO, // m
  effectiveWavelength: NumberIO, // m
  slitSetting: StringUnionIO( SlitConfigurationWithNoBarrierValues ),
  isEmitting: BooleanIO,
  brightness: NumberIO,
  intensity: NumberIO,
  slitWidth: NumberIO, // mm

  // 1D probability distribution along the detector screen at capture time. Populated only for snapshots
  // taken in averageIntensity mode from solver-driven scenes (High Intensity screen); empty otherwise.
  // Consumers that render an intensity-mode snapshot should prefer this captured distribution so the
  // snapshot image matches the live detector screen; if empty, callers must fall back to a closed-form
  // pattern computed from the other snapshot metadata (used by the Experiment screen).
  intensityDistribution: ArrayIO( NumberIO )
};

export type Snapshot = CoreRecord<typeof SNAPSHOT_SCHEMA>;

export const SnapshotIO = new SchemaOrientedIOType<Snapshot, typeof SNAPSHOT_SCHEMA>( 'SnapshotIO', {
  documentation: 'Serialization for a detector screen snapshot.',
  stateSchema: SNAPSHOT_SCHEMA
} );

// Snapshots are captured-value objects. When snapshot labels need to be renumbered after one is deleted, create
// replacement Snapshot instances rather than mutating existing snapshots.
export function renumberSnapshots( snapshots: Snapshot[] ): Snapshot[] {
  return snapshots.map( ( snapshot, index ) => _.assign( {}, snapshot, {
    snapshotNumber: index + 1,

    // Wrap arrays in a new container so they cannot be mutated by another reference
    hits: [ ...snapshot.hits ],
    intensityDistribution: [ ...snapshot.intensityDistribution ]
  } ) );
}

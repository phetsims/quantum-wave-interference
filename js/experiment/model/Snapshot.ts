// Copyright 2026, University of Colorado Boulder

/**
 * Snapshot captures the state of the detector screen at a point in time. It stores a copy of the hits array
 * and the detection mode, along with metadata needed to render the snapshot in the dialog.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import { type DetectionMode } from './DetectionMode.js';
import { type SourceType } from './SourceType.js';

// Maximum number of hits to store in a snapshot. Beyond this count, the interference pattern
// is fully established and storing more hits wastes memory without visual benefit.
const MAX_SNAPSHOT_HITS = 20000;

type SnapshotStateObject = {
  snapshotNumber: number;
  hits: number[]; // Flat array of [x0, y0, x1, y1, ...] for efficiency
  detectionMode: string;
  sourceType: string;
  wavelength: number;
  slitSeparation: number;
  screenDistance: number;
  effectiveWavelength: number;
  slitSetting: string;
  brightness: number;
  intensity: number;
};

export default class Snapshot {

  // A unique, monotonically increasing number for labeling this snapshot
  public readonly snapshotNumber: number;

  // Copy of the most recent hits at the time of capture (capped at MAX_SNAPSHOT_HITS)
  public readonly hits: Vector2[];

  // The detection mode at the time of capture
  public readonly detectionMode: DetectionMode;

  // The source type at the time of capture (needed for rendering color)
  public readonly sourceType: SourceType;

  // Wavelength (nm) at the time of capture (needed for photon hit color)
  public readonly wavelength: number;

  // Physics parameters captured for display in the snapshot dialog labels
  public readonly slitSeparation: number; // mm
  public readonly screenDistance: number; // m
  public readonly effectiveWavelength: number; // m
  public readonly slitSetting: string;
  public readonly brightness: number;
  public readonly intensity: number;

  public constructor( snapshotNumber: number, sceneData: {
    hits: Vector2[];
    detectionMode: DetectionMode;
    sourceType: SourceType;
    wavelength: number;
    slitSeparation: number;
    screenDistance: number;
    effectiveWavelength: number;
    slitSetting: string;
    brightness: number;
    intensity: number;
  } ) {
    this.snapshotNumber = snapshotNumber;
    // Deep copy the most recent hits, capped for memory efficiency. The pattern is fully
    // visible with MAX_SNAPSHOT_HITS dots; storing more wastes memory.
    const allHits = sceneData.hits;
    const startIndex = Math.max( 0, allHits.length - MAX_SNAPSHOT_HITS );
    this.hits = [];
    for ( let i = startIndex; i < allHits.length; i++ ) {
      this.hits.push( new Vector2( allHits[ i ].x, allHits[ i ].y ) );
    }
    this.detectionMode = sceneData.detectionMode;
    this.sourceType = sceneData.sourceType;
    this.wavelength = sceneData.wavelength;
    this.slitSeparation = sceneData.slitSeparation;
    this.screenDistance = sceneData.screenDistance;
    this.effectiveWavelength = sceneData.effectiveWavelength;
    this.slitSetting = sceneData.slitSetting;
    this.brightness = sceneData.brightness;
    this.intensity = sceneData.intensity;
  }

  public static readonly SnapshotIO = new IOType<Snapshot, SnapshotStateObject>( 'SnapshotIO', {
    valueType: Snapshot,
    documentation: 'Serialization for a detector screen snapshot.',
    stateSchema: {
      snapshotNumber: NumberIO,
      hits: IOType.ObjectIO, // Flat number[] for efficiency
      detectionMode: StringIO,
      sourceType: StringIO,
      wavelength: NumberIO,
      slitSeparation: NumberIO,
      screenDistance: NumberIO,
      effectiveWavelength: NumberIO,
      slitSetting: StringIO,
      brightness: NumberIO,
      intensity: NumberIO
    },
    toStateObject: ( snapshot: Snapshot ): SnapshotStateObject => {
      // Pack hits into a flat [x0, y0, x1, y1, ...] array for efficient serialization
      const flatHits: number[] = new Array( snapshot.hits.length * 2 );
      for ( let i = 0; i < snapshot.hits.length; i++ ) {
        flatHits[ i * 2 ] = snapshot.hits[ i ].x;
        flatHits[ i * 2 + 1 ] = snapshot.hits[ i ].y;
      }
      return {
        snapshotNumber: snapshot.snapshotNumber,
        hits: flatHits,
        detectionMode: snapshot.detectionMode,
        sourceType: snapshot.sourceType,
        wavelength: snapshot.wavelength,
        slitSeparation: snapshot.slitSeparation,
        screenDistance: snapshot.screenDistance,
        effectiveWavelength: snapshot.effectiveWavelength,
        slitSetting: snapshot.slitSetting,
        brightness: snapshot.brightness,
        intensity: snapshot.intensity
      };
    },
    fromStateObject: ( stateObject: SnapshotStateObject ): Snapshot => {
      // Unpack flat hits array back into Vector2[]
      const hits: Vector2[] = [];
      for ( let i = 0; i < stateObject.hits.length; i += 2 ) {
        hits.push( new Vector2( stateObject.hits[ i ], stateObject.hits[ i + 1 ] ) );
      }
      return new Snapshot( stateObject.snapshotNumber, {
        hits: hits,
        detectionMode: stateObject.detectionMode as DetectionMode,
        sourceType: stateObject.sourceType as SourceType,
        wavelength: stateObject.wavelength,
        slitSeparation: stateObject.slitSeparation,
        screenDistance: stateObject.screenDistance,
        effectiveWavelength: stateObject.effectiveWavelength,
        slitSetting: stateObject.slitSetting,
        brightness: stateObject.brightness,
        intensity: stateObject.intensity
      } );
    }
  } as IntentionalAny );
}

// Copyright 2026, University of Colorado Boulder

/**
 * Snapshot captures the state of the detector screen at a point in time.
 * It stores a copy of the hits array and the detection mode, along with metadata needed to render the snapshot in the
 * dialog.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2, { type Vector2StateObject } from '../../../../dot/js/Vector2.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import { type DetectionMode } from './DetectionMode.js';
import { type SlitConfiguration } from './SlitConfiguration.js';
import { type SourceType } from './SourceType.js';

// Shared shape for the constructor parameter and the serialized state (minus hits, which differs in type).
type SnapshotData = {
  detectionMode: DetectionMode;
  sourceType: SourceType;
  wavelength: number;
  slitSeparation: number;
  screenDistance: number;
  screenHalfWidth: number;
  effectiveWavelength: number;
  slitSetting: SlitConfiguration;
  isEmitting: boolean;
  brightness: number;
  intensity: number;
  slitWidth: number;

  // 1D probability distribution along the detector screen at capture time. Populated only for snapshots
  // taken in averageIntensity mode from solver-driven scenes (High Intensity screen); empty otherwise.
  // Consumers that render an intensity-mode snapshot should prefer this captured distribution so the
  // snapshot image matches the live detector screen; if empty, callers must fall back to a closed-form
  // pattern computed from the other snapshot metadata (used by the Experiment screen).
  intensityDistribution: number[];
};

type SnapshotStateObject = SnapshotData & {
  snapshotNumber: number;
  hits: Vector2StateObject[];
};

export default class Snapshot {

  // A unique, monotonically increasing number for labeling this snapshot
  public readonly snapshotNumber: number;

  // Copy of the hits at the time of capture
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
  public readonly screenHalfWidth: number; // m
  public readonly effectiveWavelength: number; // m
  public readonly slitSetting: SlitConfiguration;
  public readonly isEmitting: boolean;
  public readonly brightness: number;
  public readonly intensity: number;
  public readonly slitWidth: number; // mm

  // See SnapshotData.intensityDistribution. Empty array means "not captured" (fall back to closed-form).
  public readonly intensityDistribution: number[];

  public constructor( snapshotNumber: number, hits: Vector2[], data: SnapshotData ) {
    this.snapshotNumber = snapshotNumber;
    this.hits = hits;
    this.detectionMode = data.detectionMode;
    this.sourceType = data.sourceType;
    this.wavelength = data.wavelength;
    this.slitSeparation = data.slitSeparation;
    this.screenDistance = data.screenDistance;
    this.screenHalfWidth = data.screenHalfWidth;
    this.effectiveWavelength = data.effectiveWavelength;
    this.slitSetting = data.slitSetting;
    this.isEmitting = data.isEmitting;
    this.brightness = data.brightness;
    this.intensity = data.intensity;
    this.slitWidth = data.slitWidth;
    this.intensityDistribution = data.intensityDistribution;
  }

  public static readonly SnapshotIO = new IOType<Snapshot, SnapshotStateObject>( 'SnapshotIO', {
    valueType: Snapshot,
    documentation: 'Serialization for a detector screen snapshot.',
    stateSchema: {
      snapshotNumber: NumberIO,
      hits: ArrayIO( Vector2.Vector2IO ),
      detectionMode: StringIO,
      sourceType: StringIO,
      wavelength: NumberIO,
      slitSeparation: NumberIO,
      screenDistance: NumberIO,
      screenHalfWidth: NumberIO,
      effectiveWavelength: NumberIO,
      slitSetting: StringIO,
      isEmitting: BooleanIO,
      brightness: NumberIO,
      intensity: NumberIO,
      slitWidth: NumberIO,
      intensityDistribution: ArrayIO( NumberIO )
    },

    // toStateObject is auto-generated from stateSchema (composite schema with matching field names).

    fromStateObject: ( state: SnapshotStateObject ): Snapshot => {
      return new Snapshot( state.snapshotNumber, state.hits.map( s => Vector2.fromStateObject( s ) ), state );
    }
  } );
}

// Copyright 2026, University of Colorado Boulder

/**
 * Read-only detector-screen data needed by the Experiment detector renderer.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type DetectionMode } from '../model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';
import { type Snapshot } from '../model/Snapshot.js';
import { type SourceType } from '../model/SourceType.js';

export type DetectorScreenHit = {
  readonly x: number;
  readonly y: number;
};

// This intentionally remains a structural TypeScript type instead of following the SchemaOrientedIOType pattern in
// Snapshot.ts. Snapshot is captured model state stored in PhET-iO, so it needs a schema and IOType. This render state is
// a transient view contract assembled from either live model state or a Snapshot immediately before painting; it is not
// stored, restored, or exposed as a PhET-iO value.
export type DetectorScreenRenderState = {
  readonly detectionMode: DetectionMode;
  readonly sourceType: SourceType;
  readonly wavelength: number;
  readonly effectiveWavelength: number;
  readonly slitWidth: number;
  readonly slitSeparation: number;
  readonly screenDistance: number;
  readonly fullScreenHalfWidth: number;
  readonly isEmitting: boolean;
  readonly brightness: number;
  readonly intensity: number;
  readonly slitSetting: SlitConfigurationWithNoBarrier;
  readonly hits: readonly DetectorScreenHit[];
};

export function createDetectorScreenRenderStateFromSnapshot( snapshot: Snapshot ): DetectorScreenRenderState {
  return {
    detectionMode: snapshot.detectionMode,
    sourceType: snapshot.sourceType,
    wavelength: snapshot.wavelength,
    effectiveWavelength: snapshot.effectiveWavelength,
    slitWidth: snapshot.slitWidth,
    slitSeparation: snapshot.slitSeparation,
    screenDistance: snapshot.screenDistance,
    fullScreenHalfWidth: snapshot.screenHalfWidth,
    isEmitting: snapshot.isEmitting,
    brightness: snapshot.brightness,
    intensity: snapshot.intensity,
    slitSetting: snapshot.slitSetting,
    hits: snapshot.hits
  };
}

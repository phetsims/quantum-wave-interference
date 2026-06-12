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

/**
 * A single particle hit recorded on the detector screen. Coordinates are normalized to the full detector extent:
 * x = -1 is the left edge, x = 1 is the right edge, and y follows the same convention for the detector height.
 * Hits with |x| > 1 or |y| > 1 fall outside the visible detector area and are clipped by the renderer.
 */
export type DetectorScreenHit = {
  readonly x: number;
  readonly y: number;
};

// This intentionally remains a structural TypeScript type instead of following the SchemaOrientedIOType pattern in
// Snapshot.ts. Snapshot is captured model state stored in PhET-iO, so it needs a schema and IOType. This render state is
// a transient view contract assembled from either live model state or a Snapshot immediately before painting; it is not
// stored, restored, or exposed as a PhET-iO value.

/**
 * Frozen render-state bundle consumed by renderDetectorScreenTexture. It is assembled immediately before each paint
 * from either live SceneModel properties (via createDetectorScreenRenderStateFromSceneModel) or a stored Snapshot
 * (via createDetectorScreenRenderStateFromSnapshot). Neither source nor renderer holds onto this object beyond one
 * paint call.
 *
 * Field units:
 *   wavelength / effectiveWavelength — nm (nanometers)
 *   slitWidth / slitSeparation       — mm (millimeters)
 *   screenDistance                   — m  (meters)
 *   fullScreenHalfWidth              — m  (meters); physical half-width of the complete detector face
 *   brightness                       — detector-screen brightness percentage [0, 100]
 *   intensity                        — dimensionless source emission intensity [0, 1]; 1 for screens without an
 *                                      adjustable source
 */
export type DetectorScreenRenderState = {
  readonly detectionMode: DetectionMode;
  readonly sourceType: SourceType;
  readonly wavelength: number;
  readonly effectiveWavelength: number;
  readonly slitWidth: number;
  readonly slitSeparation: number;
  readonly screenDistance: number;

  // Physical half-width of the full detector face (m). The renderer uses this with visibleScreenHalfWidth to compute
  // the zoom fraction when the detector is cropped.
  readonly fullScreenHalfWidth: number;
  readonly isEmitting: boolean;
  readonly brightness: number;
  readonly intensity: number;
  readonly slitSetting: SlitConfigurationWithNoBarrier;
  readonly hits: readonly DetectorScreenHit[];
};

/**
 * Converts a stored Snapshot into a DetectorScreenRenderState. The Snapshot field screenHalfWidth is mapped to
 * fullScreenHalfWidth so that the renderer knows the physical extent of the full detector face regardless of any
 * caller-side zoom. Used by SnapshotCanvasNode to render snapshot previews through the same code path as the live
 * detector.
 */
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

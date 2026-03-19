// Copyright 2026, University of Colorado Boulder

/**
 * Snapshot captures the state of the detector screen at a point in time. It stores a copy of the hits array
 * and the detection mode, along with metadata needed to render the snapshot in the dialog.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import { type DetectionMode } from './DetectionMode.js';
import { type SourceType } from './SourceType.js';

// Maximum number of hits to store in a snapshot. Beyond this count, the interference pattern
// is fully established and storing more hits wastes memory without visual benefit.
const MAX_SNAPSHOT_HITS = 20000;

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
  }

}

quantumWaveInterference.register( 'Snapshot', Snapshot );

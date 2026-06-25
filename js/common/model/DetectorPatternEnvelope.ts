// Copyright 2026, University of Colorado Boulder

/**
 * Shared model-side heuristic for deciding when detector-screen geometry visibly groups bands/peaks into two areas.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import { getDisplaySlitLayout } from '../getDisplaySlitLayout.js';

export const EnvelopeCategoryValues = [
  'brightestAtCenter',
  'clusteringIntoTwoFaintSections',
  'clusteringIntoTwoDistinctSections'
] as const;

// Three-point qualitative scale describing how detector-screen geometry groups the visible pattern.
export type EnvelopeCategory = typeof EnvelopeCategoryValues[number];

// Structural interface satisfied by scenes that expose front-facing detector-screen geometry.
export type EnvelopeHeuristicScene = {
  getEffectiveWavelength(): number;
  slitSeparationProperty: TReadOnlyProperty<number>;
  slitSeparationRange?: { min: number; max: number };
  regionHeight?: number;
} & ( {
  screenDistanceProperty: TReadOnlyProperty<number>;
} | {
  regionWidth: number;
  barrierPositionFractionProperty: TReadOnlyProperty<number>;
} );

// Intermediate quantities produced by analyzeEnvelopeHeuristic. Exposed as a type so
// callers can inspect individual values for debugging without re-running the heuristic.
export type EnvelopeHeuristicAnalysis = {
  category: EnvelopeCategory;

  // Composite heuristic score driving the category thresholds (dimensionless). Higher
  // values indicate the envelope is more strongly grouping fringes into side lobes.
  score: number;

  // Dimensionless Fresnel-like separation: d_display^2 / (lambda * L), where d_display is the
  // display-coordinate slit separation, lambda is the effective wavelength (m), and L is the
  // slit-to-screen distance (m).
  fresnelSeparation: number;

  // Dimensionless ratio d_display / L.
  geometryRatio: number;

  // Smooth-step gate in [0, 1] applied to fresnelSeparation to suppress the envelope
  // effect at small geometryRatio values where the paraxial approximation holds well.
  geometryGate: number;

  // Slit-to-screen distance in meters.
  slitToScreenDistance: number;

  // Effective slit separation in display-model coordinates (same units as regionHeight).
  displaySlitSeparation: number;

  // Effective wavelength in meters used for this computation.
  effectiveWavelength: number;
};

const ENVELOPE_GEOMETRY_GATE_START = 0.45;
const ENVELOPE_GEOMETRY_GATE_END = 1.25;
const FAINT_SECTIONS_ENVELOPE_SCORE = 1.5;
const DISTINCT_SECTIONS_ENVELOPE_SCORE = 6;

function smoothStep( edge0: number, edge1: number, value: number ): number {
  const t = clamp( ( value - edge0 ) / ( edge1 - edge0 ), 0, 1 );
  return t * t * ( 3 - 2 * t );
}

function getEnvelopeCategory( envelopeScore: number ): EnvelopeCategory {
  return envelopeScore < FAINT_SECTIONS_ENVELOPE_SCORE ? 'brightestAtCenter' :
         envelopeScore < DISTINCT_SECTIONS_ENVELOPE_SCORE ? 'clusteringIntoTwoFaintSections' :
         'clusteringIntoTwoDistinctSections';
}

/**
 * Computes the qualitative envelope category used for detector-screen descriptions.
 *
 * @param scene - scene supplying front-facing detector-screen geometry
 * @returns detailed envelope heuristic analysis, or null when the scene cannot support the front-facing heuristic
 */
export function analyzeEnvelopeHeuristic( scene: EnvelopeHeuristicScene ): EnvelopeHeuristicAnalysis | null {
  const lambda = scene.getEffectiveWavelength();
  const slitToScreenDistance = 'screenDistanceProperty' in scene ?
                               scene.screenDistanceProperty.value :
                               ( 1 - scene.barrierPositionFractionProperty.value ) * scene.regionWidth;

  if (
    lambda <= 0 ||
    slitToScreenDistance <= 0 ||
    scene.regionHeight === undefined ||
    scene.slitSeparationRange === undefined
  ) {
    return null;
  }

  const displaySlitSeparation = getDisplaySlitLayout(
    scene.slitSeparationProperty.value * 1e-3,
    scene.slitSeparationRange.min * 1e-3,
    scene.slitSeparationRange.max * 1e-3,
    scene.regionHeight
  ).displaySlitSeparation;

  const fresnelSeparation = displaySlitSeparation * displaySlitSeparation /
                            ( lambda * slitToScreenDistance );
  const geometryRatio = displaySlitSeparation / slitToScreenDistance;
  const geometryGate = smoothStep( ENVELOPE_GEOMETRY_GATE_START, ENVELOPE_GEOMETRY_GATE_END, geometryRatio );
  const score = fresnelSeparation * geometryGate;

  return {
    category: getEnvelopeCategory( score ),
    score: score,
    fresnelSeparation: fresnelSeparation,
    geometryRatio: geometryRatio,
    geometryGate: geometryGate,
    slitToScreenDistance: slitToScreenDistance,
    displaySlitSeparation: displaySlitSeparation,
    effectiveWavelength: lambda
  };
}

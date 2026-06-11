// Copyright 2026, University of Colorado Boulder

/**
 * DetectionMode enumerates the display modes for the detector screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

// The canonical runtime values array, used as validValues for StringUnionProperty<DetectionMode>
// and as the type argument for StringUnionIO in PhET-iO serialization.
export const DetectionModeValues = [ 'averageIntensity', 'hits' ] as const;

// Whether the detector screen shows a continuous average-intensity pattern or discrete particle hit dots.
export type DetectionMode = typeof DetectionModeValues[number];

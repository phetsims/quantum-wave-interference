// Copyright 2026, University of Colorado Boulder

/**
 * Creates the canonical ordering for experiment detail lists used in live descriptions and snapshot metadata.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

type CanonicalExperimentDetailsListItems<T> = {
  sourcePhysicsItems: T[];
  slitConfigurationItem: T;
  slitSeparationItem?: T;
  screenDistanceItem?: T;
  screenBrightnessItem?: T;
};

/**
 * Orders experiment details by design priority.
 *
 * @param items - grouped detail items to order
 * @returns detail items in canonical order
 */
export default function createCanonicalExperimentDetailsListItems<T>(
  items: CanonicalExperimentDetailsListItems<T>
): T[] {
  return [
    ...items.sourcePhysicsItems,
    items.slitConfigurationItem,
    ...( items.slitSeparationItem ? [ items.slitSeparationItem ] : [] ),
    ...( items.screenDistanceItem ? [ items.screenDistanceItem ] : [] ),
    ...( items.screenBrightnessItem ? [ items.screenBrightnessItem ] : [] )
  ];
}

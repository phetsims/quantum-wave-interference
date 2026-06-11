// Copyright 2026, University of Colorado Boulder

/**
 * DetectorPatternGraphZoomLevelProperty is the integer zoom-level Property shared by the detector pattern graphs.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Tandem from '../../../../tandem/js/Tandem.js';

export const MIN_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL = 1;
export const DEFAULT_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL = 4;
export const MAX_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL = 6;

/**
 * Caller-facing zoom level specification. Use a specific integer in [MIN, MAX] (i.e. 1–6), 'default' to select
 * DEFAULT_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL (4), or 'max' to select MAX_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL (6).
 */
export type DetectorPatternGraphZoomLevelOption = number | 'default' | 'max';

/**
 * Converts the caller-facing zoom option into the integer zoom level used by the graph controls.
 */
export function getDetectorPatternGraphZoomLevel( zoomLevel: DetectorPatternGraphZoomLevelOption | undefined ): number {
  return zoomLevel === 'max' ? MAX_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL :
         typeof zoomLevel === 'number' ? zoomLevel :
         DEFAULT_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL;
}

export default class DetectorPatternGraphZoomLevelProperty extends NumberProperty {

  /**
   * Creates a graph zoom level Property with the specified initial zoom option and PhET-iO tandem.
   *
   * @param initialZoomLevel - caller-facing initial zoom option, or undefined to use the default zoom level
   * @param tandem - tandem for this Property
   */
  public constructor( initialZoomLevel: DetectorPatternGraphZoomLevelOption | undefined, tandem: Tandem ) {
    const zoomRange = new RangeWithValue(
      MIN_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL,
      MAX_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL,
      getDetectorPatternGraphZoomLevel( initialZoomLevel )
    );

    super( zoomRange.defaultValue, {
      range: zoomRange,
      tandem: tandem,
      numberType: 'Integer'
    } );
  }
}

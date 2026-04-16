// Copyright 2026, University of Colorado Boulder

/**
 * A row of small circles — one per snapshot slot — that fill in as snapshots are captured. Used on the
 * Experiment screen next to the detector-screen snapshot buttons, and at the top of the screen controls
 * panel on the High Intensity and Single Particles screens per the design mockups.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

const DOT_RADIUS = 3;
const DOT_SPACING = 3;
const DOT_STROKE_WIDTH = 0.5;

export default class SnapshotIndicatorDotsNode extends HBox {

  public constructor( numberOfSnapshotsProperty: TReadOnlyProperty<number> ) {

    const maxSnapshots = QuantumWaveInterferenceConstants.MAX_SNAPSHOTS;
    const dots: Circle[] = [];
    for ( let i = 0; i < maxSnapshots; i++ ) {
      dots.push( new Circle( DOT_RADIUS, {
        stroke: QuantumWaveInterferenceColors.indicatorDotStrokeProperty,
        lineWidth: DOT_STROKE_WIDTH,
        fill: QuantumWaveInterferenceColors.indicatorDotInactiveFillProperty
      } ) );
    }

    super( {
      spacing: DOT_SPACING,
      children: dots
    } );

    numberOfSnapshotsProperty.link( count => {
      for ( let i = 0; i < maxSnapshots; i++ ) {
        dots[ i ].fill = i < count
                         ? QuantumWaveInterferenceColors.indicatorDotActiveFillProperty
                         : QuantumWaveInterferenceColors.indicatorDotInactiveFillProperty;
      }
    } );
  }
}

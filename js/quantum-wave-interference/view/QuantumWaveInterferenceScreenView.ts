// Copyright 2026, University of Colorado Boulder

/**
 * QuantumWaveInterferenceScreenView is the top-level view for the Quantum Wave Interference simulation.
 * It contains three visual "rows": the top row with the emitter, double slit, and detector screen
 * in overhead perspective; the middle row with controls and front-facing views; and the bottom row
 * with scene selectors, slit controls, and screen settings.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import QuantumWaveInterferenceModel from '../model/QuantumWaveInterferenceModel.js';
import SourceType from '../model/SourceType.js';
import SceneRadioButtonGroup from './SceneRadioButtonGroup.js';

// Layout constants derived from the design mockup (1024x618 layout bounds)
const LABEL_FONT = new PhetFont( 16 );
const LABEL_Y = 30; // y position for top-row labels

type SelfOptions = EmptySelfOptions;

type QuantumWaveInterferenceScreenViewOptions = SelfOptions & ScreenViewOptions;

export default class QuantumWaveInterferenceScreenView extends ScreenView {

  public constructor( model: QuantumWaveInterferenceModel, providedOptions: QuantumWaveInterferenceScreenViewOptions ) {

    const options = optionize<QuantumWaveInterferenceScreenViewOptions, SelfOptions, ScreenViewOptions>()( {}, providedOptions );

    super( options );

    // ==============================
    // Top Row: Emitter, Double Slit, Detector Screen (overhead perspective)
    // ==============================

    // Source label that changes with the selected scene
    const sourceLabelStringProperty = new DerivedProperty(
      [ model.sceneProperty ],
      scene => {
        if ( scene.sourceType === SourceType.PHOTONS ) {
          return QuantumWaveInterferenceFluent.photonSourceStringProperty.value;
        }
        else if ( scene.sourceType === SourceType.ELECTRONS ) {
          return QuantumWaveInterferenceFluent.electronSourceStringProperty.value;
        }
        else if ( scene.sourceType === SourceType.NEUTRONS ) {
          return QuantumWaveInterferenceFluent.neutronSourceStringProperty.value;
        }
        else {
          return QuantumWaveInterferenceFluent.heliumAtomSourceStringProperty.value;
        }
      }
    );

    const sourceLabel = new Text( sourceLabelStringProperty, {
      font: LABEL_FONT,
      maxWidth: 150,
      left: this.layoutBounds.minX + QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN + 20,
      top: LABEL_Y
    } );
    this.addChild( sourceLabel );

    // Laser pointer node for the photon emitter source
    const laserPointerNode = new LaserPointerNode( model.sceneProperty.value.isEmittingProperty, {
      bodySize: new Dimension2( 88, 40 ),
      nozzleSize: new Dimension2( 16, 32 ),
      buttonOptions: {
        baseColor: 'red',
        radius: 14
      },
      left: this.layoutBounds.minX + QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN + 20,
      top: sourceLabel.bottom + 6,
      tandem: options.tandem.createTandem( 'laserPointerNode' )
    } );
    this.addChild( laserPointerNode );

    // Double slit label
    const doubleSlitLabel = new Text( QuantumWaveInterferenceFluent.doubleSlitStringProperty, {
      font: LABEL_FONT,
      maxWidth: 120
    } );
    this.addChild( doubleSlitLabel );

    // Double slit parallelogram (overhead perspective view)
    // Based on SVG: left edge height 50, right edge offset (51, 21)
    const doubleSlitNode = QuantumWaveInterferenceScreenView.createParallelogramNode( 51, 21, 50, 'black' );
    doubleSlitNode.x = 365;
    doubleSlitNode.y = 45;
    this.addChild( doubleSlitNode );

    // Position label centered above the double slit
    doubleSlitLabel.centerX = doubleSlitNode.centerX;
    doubleSlitLabel.bottom = doubleSlitNode.top - 4;

    // Slit lines on the parallelogram (two thin white vertical lines representing the slits)
    // These are positioned within the parallelogram, offset to account for the skew
    const slitLineLength = 25;
    const slitXFraction = 0.55; // fraction across the parallelogram width
    const slitYCenter = 25; // center of the left edge height

    // The x-offset within the parallelogram accounts for the skew
    const slitBaseX = slitXFraction * 51;
    const slitBaseY = slitYCenter + slitXFraction * 21;

    // Slit spacing (visual representation of slit separation)
    const visualSlitSpacing = 3;

    const leftSlitLine = new Path( Shape.lineSegment( slitBaseX - visualSlitSpacing / 2, slitBaseY - slitLineLength / 2,
      slitBaseX - visualSlitSpacing / 2, slitBaseY + slitLineLength / 2 ), {
      stroke: 'white',
      lineWidth: 1
    } );

    const rightSlitLine = new Path( Shape.lineSegment( slitBaseX + visualSlitSpacing / 2, slitBaseY - slitLineLength / 2,
      slitBaseX + visualSlitSpacing / 2, slitBaseY + slitLineLength / 2 ), {
      stroke: 'white',
      lineWidth: 1
    } );

    doubleSlitNode.addChild( leftSlitLine );
    doubleSlitNode.addChild( rightSlitLine );

    // Detector screen label
    const detectorScreenLabel = new Text( QuantumWaveInterferenceFluent.detectorScreenStringProperty, {
      font: LABEL_FONT,
      maxWidth: 150
    } );
    this.addChild( detectorScreenLabel );

    // Detector screen parallelogram (overhead perspective view)
    // Based on SVG: left edge height 48, right edge offset (60, 24)
    const detectorScreenNode = QuantumWaveInterferenceScreenView.createParallelogramNode( 60, 24, 48, 'black' );
    detectorScreenNode.x = 870;
    detectorScreenNode.y = 48;
    this.addChild( detectorScreenNode );

    // Position label centered above the detector screen
    detectorScreenLabel.centerX = detectorScreenNode.centerX;
    detectorScreenLabel.bottom = detectorScreenNode.top - 4;

    // Distance span line between double slit and detector screen
    const spanY = Math.max( doubleSlitNode.bottom, detectorScreenNode.bottom ) + 12;
    const spanLineNode = new Node( {
      children: [
        // Horizontal line
        new Path( Shape.lineSegment(
          doubleSlitNode.centerX, spanY,
          detectorScreenNode.centerX, spanY
        ), { stroke: 'black', lineWidth: 1 } ),
        // Left tick
        new Path( Shape.lineSegment(
          doubleSlitNode.centerX, spanY - 4,
          doubleSlitNode.centerX, spanY + 4
        ), { stroke: 'black', lineWidth: 1 } ),
        // Right tick
        new Path( Shape.lineSegment(
          detectorScreenNode.centerX, spanY - 4,
          detectorScreenNode.centerX, spanY + 4
        ), { stroke: 'black', lineWidth: 1 } )
      ]
    } );
    this.addChild( spanLineNode );

    // Distance readout text (updates with screen distance)
    const distanceText = new Text( '', {
      font: new PhetFont( 13 ),
      centerX: ( doubleSlitNode.centerX + detectorScreenNode.centerX ) / 2,
      bottom: spanY - 3
    } );
    this.addChild( distanceText );

    // Update the distance text when the active scene's screen distance changes
    const updateDistanceText = () => {
      const scene = model.sceneProperty.value;
      const distance = scene.screenDistanceProperty.value;
      distanceText.string = `${toFixed( distance, 1 )} m`;
      distanceText.centerX = ( doubleSlitNode.centerX + detectorScreenNode.centerX ) / 2;
    };

    // Link to current scene and its screen distance
    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        oldScene.screenDistanceProperty.unlink( updateDistanceText );
      }
      newScene.screenDistanceProperty.link( updateDistanceText );
    } );

    // ==============================
    // Bottom Row
    // ==============================

    // Scene radio buttons - 2x2 grid at the bottom-left
    const sceneRadioButtonGroup = new SceneRadioButtonGroup(
      model.sceneProperty,
      model.scenes,
      options.tandem.createTandem( 'sceneRadioButtonGroup' )
    );
    sceneRadioButtonGroup.left = this.layoutBounds.minX + QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
    sceneRadioButtonGroup.bottom = this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( sceneRadioButtonGroup );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );
  }

  /**
   * Creates a parallelogram shape representing a screen or slit in overhead (perspective) view.
   * The parallelogram has a vertical left edge, with the right edge offset by (dx, dy) from the left.
   *
   * @param dx - horizontal distance from left edge to right edge
   * @param dy - vertical offset of the right edge (positive = right edge is lower)
   * @param leftHeight - height of the left edge
   * @param fill - fill color
   */
  private static createParallelogramNode( dx: number, dy: number, leftHeight: number, fill: string ): Path {
    const shape = new Shape()
      .moveTo( 0, 0 )
      .lineTo( 0, leftHeight )
      .lineTo( dx, leftHeight + dy )
      .lineTo( dx, dy )
      .close();

    return new Path( shape, {
      fill: fill,
      stroke: null
    } );
  }

  /**
   * Resets the view.
   */
  public reset(): void {
    // no-op
  }

  /**
   * Steps the view.
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    // no-op
  }
}

quantumWaveInterference.register( 'QuantumWaveInterferenceScreenView', QuantumWaveInterferenceScreenView );

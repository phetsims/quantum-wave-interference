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
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import { rangeInclusive } from '../../../../dot/js/util/rangeInclusive.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import RulerNode from '../../../../scenery-phet/js/RulerNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import SoundDragListener from '../../../../scenery-phet/js/SoundDragListener.js';
import Color from '../../../../scenery/js/util/Color.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import QuantumWaveInterferenceModel from '../model/QuantumWaveInterferenceModel.js';
import SceneModel from '../model/SceneModel.js';
import SlitSetting from '../model/SlitSetting.js';
import SourceType from '../model/SourceType.js';
import DetectorScreenNode from './DetectorScreenNode.js';
import FrontFacingSlitNode from './FrontFacingSlitNode.js';
import GraphAccordionBox from './GraphAccordionBox.js';
import SceneRadioButtonGroup from './SceneRadioButtonGroup.js';
import ScreenSettingsPanel from './ScreenSettingsPanel.js';
import SlitControlPanel from './SlitControlPanel.js';
import SourceControlPanel from './SourceControlPanel.js';

// Layout constants derived from the design mockup (1024x618 layout bounds)
const LABEL_FONT = new PhetFont( 16 );
const LABEL_Y = 30; // y position for top-row labels

type SelfOptions = EmptySelfOptions;

type QuantumWaveInterferenceScreenViewOptions = SelfOptions & ScreenViewOptions;

export default class QuantumWaveInterferenceScreenView extends ScreenView {

  private readonly graphAccordionBoxes: GraphAccordionBox[];

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

    // DynamicProperty that follows the active scene's isEmittingProperty, so the laser button
    // always controls the currently selected scene's emitter.
    const isEmittingProperty = new DynamicProperty<boolean, boolean, SceneModel>( model.sceneProperty, {
      derive: scene => scene.isEmittingProperty,
      bidirectional: true
    } );

    // Laser pointer node for the emitter source
    const laserPointerNode = new LaserPointerNode( isEmittingProperty, {
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

    // ==============================
    // Beam visualization (behind the slit and screen parallelograms)
    // ==============================

    // Beam rectangle from emitter nozzle tip to double slit
    const emitterBeamNode = new Rectangle( 0, 0, 1, 1, {
      visible: false
    } );
    this.addChild( emitterBeamNode );

    // Trapezoid beam from double slit to detector screen (fans out and fades)
    const fanBeamNode = new Path( null, {
      visible: false
    } );
    this.addChild( fanBeamNode );

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

    // Cover/detector overlays on the parallelogram slit lines
    const slitOverlayHeight = slitLineLength + 4;
    const slitOverlayWidth = 5;

    const leftSlitCover = new Rectangle(
      slitBaseX - visualSlitSpacing / 2 - slitOverlayWidth / 2,
      slitBaseY - slitOverlayHeight / 2,
      slitOverlayWidth, slitOverlayHeight, {
        fill: '#555',
        visible: false
      } );
    doubleSlitNode.addChild( leftSlitCover );

    const rightSlitCover = new Rectangle(
      slitBaseX + visualSlitSpacing / 2 - slitOverlayWidth / 2,
      slitBaseY - slitOverlayHeight / 2,
      slitOverlayWidth, slitOverlayHeight, {
        fill: '#555',
        visible: false
      } );
    doubleSlitNode.addChild( rightSlitCover );

    // Detector overlays (yellow, distinct from gray covers)
    const leftSlitDetectorOverlay = new Rectangle(
      slitBaseX - visualSlitSpacing / 2 - slitOverlayWidth / 2,
      slitBaseY - slitOverlayHeight / 2,
      slitOverlayWidth, slitOverlayHeight, {
        fill: new Color( 255, 200, 50, 0.8 ),
        visible: false
      } );
    doubleSlitNode.addChild( leftSlitDetectorOverlay );

    const rightSlitDetectorOverlay = new Rectangle(
      slitBaseX + visualSlitSpacing / 2 - slitOverlayWidth / 2,
      slitBaseY - slitOverlayHeight / 2,
      slitOverlayWidth, slitOverlayHeight, {
        fill: new Color( 255, 200, 50, 0.8 ),
        visible: false
      } );
    doubleSlitNode.addChild( rightSlitDetectorOverlay );

    // Update cover/detector visibility on the overhead parallelogram based on slit setting
    const updateSlitOverlays = () => {
      const slitSetting = model.sceneProperty.value.slitSettingProperty.value;
      leftSlitCover.visible = ( slitSetting === SlitSetting.LEFT_COVERED );
      rightSlitCover.visible = ( slitSetting === SlitSetting.RIGHT_COVERED );
      leftSlitDetectorOverlay.visible = ( slitSetting === SlitSetting.LEFT_DETECTOR );
      rightSlitDetectorOverlay.visible = ( slitSetting === SlitSetting.RIGHT_DETECTOR );
    };

    // Wire up overlay updates when scene or slit setting changes
    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        oldScene.slitSettingProperty.unlink( updateSlitOverlays );
      }
      newScene.slitSettingProperty.link( updateSlitOverlays );
    } );

    // ==============================
    // Which-path detector indicator (appears next to double slit when detector slit setting is active)
    // ==============================
    const DETECTOR_BOX_WIDTH = 50;
    const DETECTOR_BOX_HEIGHT = 30;
    const detectorIndicatorBox = new Rectangle( 0, 0, DETECTOR_BOX_WIDTH, DETECTOR_BOX_HEIGHT, 5, 5, {
      fill: new Color( 255, 200, 50 ),
      stroke: new Color( 180, 140, 0 ),
      lineWidth: 1
    } );
    const detectorIndicatorLabel = new Text( QuantumWaveInterferenceFluent.detectorStringProperty, {
      font: new PhetFont( 11 ),
      maxWidth: DETECTOR_BOX_WIDTH - 6,
      center: detectorIndicatorBox.center
    } );
    const detectorIndicatorNode = new Node( {
      children: [ detectorIndicatorBox, detectorIndicatorLabel ],
      visible: false,
      // Position to the right of the double slit parallelogram
      left: doubleSlitNode.right + 4,
      centerY: doubleSlitNode.centerY
    } );
    this.addChild( detectorIndicatorNode );

    // DynamicProperty following the active scene's slitSettingProperty
    const slitSettingProperty = new DynamicProperty<SlitSetting, SlitSetting, SceneModel>( model.sceneProperty, {
      derive: scene => scene.slitSettingProperty
    } );

    // Show/hide detector indicator based on slit setting
    slitSettingProperty.link( slitSetting => {
      detectorIndicatorNode.visible = (
        slitSetting === SlitSetting.LEFT_DETECTOR ||
        slitSetting === SlitSetting.RIGHT_DETECTOR
      );
    } );

    // Detector screen label
    const detectorScreenLabel = new Text( QuantumWaveInterferenceFluent.detectorScreenStringProperty, {
      font: LABEL_FONT,
      maxWidth: 150
    } );
    this.addChild( detectorScreenLabel );

    // Detector screen parallelogram (overhead perspective view)
    // Based on SVG: left edge height 48, right edge offset (60, 24)
    const DETECTOR_DX = 60;
    const DETECTOR_DY = 24;
    const DETECTOR_LEFT_HEIGHT = 48;
    const detectorScreenParallelogram = QuantumWaveInterferenceScreenView.createParallelogramNode(
      DETECTOR_DX, DETECTOR_DY, DETECTOR_LEFT_HEIGHT, 'black' );
    detectorScreenParallelogram.y = 48;
    this.addChild( detectorScreenParallelogram );

    // Distance span line between double slit and detector screen (redrawn dynamically)
    const spanLineNode = new Path( null, { stroke: 'black', lineWidth: 1 } );
    this.addChild( spanLineNode );

    // Distance readout text (updates with screen distance)
    const distanceText = new Text( '', {
      font: new PhetFont( 13 )
    } );
    this.addChild( distanceText );

    // The detector screen parallelogram slides horizontally based on screen distance.
    // At max distance, the right edge of the parallelogram aligns with the right edge
    // of the front-facing detector screen. At min distance, the left edge of the
    // parallelogram aligns with the left edge of the front-facing detector screen.
    // These reference positions are set after front-facing screens are created (below).
    // For now, define the range bounds — they will be set once front-facing screens are positioned.
    let frontFacingScreenLeft = 0;
    let frontFacingScreenRight = 0;

    // Update the detector screen parallelogram position and the span line/distance text
    const updateDetectorScreenPosition = () => {
      const scene = model.sceneProperty.value;
      const distance = scene.screenDistanceProperty.value;
      const range = scene.screenDistanceRange;

      // Interpolate: fraction 0 at min distance, 1 at max distance
      const fraction = ( distance - range.min ) / ( range.max - range.min );

      // At fraction 0 (min distance): parallelogram left edge = front-facing screen left
      // At fraction 1 (max distance): parallelogram right edge = front-facing screen right
      const xAtMin = frontFacingScreenLeft;
      const xAtMax = frontFacingScreenRight - DETECTOR_DX;
      detectorScreenParallelogram.x = xAtMin + fraction * ( xAtMax - xAtMin );

      // Update label above the parallelogram
      detectorScreenLabel.centerX = detectorScreenParallelogram.centerX;
      detectorScreenLabel.bottom = detectorScreenParallelogram.top - 4;

      // Update span line between double slit and detector screen
      const spanY = Math.max( doubleSlitNode.bottom, detectorScreenParallelogram.bottom ) + 12;
      const leftX = doubleSlitNode.centerX;
      const rightX = detectorScreenParallelogram.centerX;
      const TICK_HALF = 4;
      spanLineNode.shape = new Shape()
        // Horizontal line
        .moveTo( leftX, spanY ).lineTo( rightX, spanY )
        // Left tick
        .moveTo( leftX, spanY - TICK_HALF ).lineTo( leftX, spanY + TICK_HALF )
        // Right tick
        .moveTo( rightX, spanY - TICK_HALF ).lineTo( rightX, spanY + TICK_HALF );

      // Update distance text
      distanceText.string = `${toFixed( distance, 1 )} m`;
      distanceText.centerX = ( leftX + rightX ) / 2;
      distanceText.bottom = spanY - 3;
    };

    // Link to current scene and its screen distance
    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        oldScene.screenDistanceProperty.unlink( updateDetectorScreenPosition );
      }
      newScene.screenDistanceProperty.link( updateDetectorScreenPosition );
    } );

    // ==============================
    // Beam update logic
    // ==============================

    // The beam color depends on source type and wavelength. For photons, use the visible color
    // corresponding to the wavelength. For particles, use gray.
    const PARTICLE_BEAM_COLOR = new Color( 180, 180, 180 );

    const updateBeam = () => {
      const scene = model.sceneProperty.value;
      const isEmitting = scene.isEmittingProperty.value;
      const intensity = scene.intensityProperty.value;

      emitterBeamNode.visible = isEmitting;
      fanBeamNode.visible = isEmitting;

      if ( !isEmitting ) {
        return;
      }

      // Determine beam color
      const beamColor = scene.sourceType === SourceType.PHOTONS
                         ? VisibleColor.wavelengthToColor( scene.wavelengthProperty.value )
                         : PARTICLE_BEAM_COLOR;

      // Emitter beam: rectangle from laser nozzle tip to the left edge of the double slit parallelogram.
      // The laser nozzle height is 32 (nozzleSize height from LaserPointerNode options).
      const nozzleTipX = laserPointerNode.right;
      const laserCenterY = laserPointerNode.centerY;
      const beamHeight = 32; // matches nozzle height
      const beamLeft = nozzleTipX;
      const beamRight = doubleSlitNode.left;

      emitterBeamNode.setRect( beamLeft, laserCenterY - beamHeight / 2, beamRight - beamLeft, beamHeight );
      emitterBeamNode.fill = beamColor.withAlpha( 0.4 * intensity );

      // Fan beam: trapezoid from double slit right edge to detector screen left edge.
      // It fans out vertically — narrow at the slit side, wider at the screen side.
      const fanLeft = doubleSlitNode.right;
      const fanRight = detectorScreenParallelogram.left;
      const narrowHalfHeight = beamHeight / 2; // Same as beam height at the slit

      // Use the visual center of each parallelogram for beam alignment.
      // Parallelogram vertices span from y=0 to y=leftHeight on the left and y=dy to y=leftHeight+dy
      // on the right, so the vertical center is at (leftHeight + dy) / 2.
      const slitCenterY = doubleSlitNode.y + ( 50 + 21 ) / 2; // doubleSlitNode params: leftHeight=50, dy=21
      const screenCenterY = detectorScreenParallelogram.y + ( DETECTOR_LEFT_HEIGHT + DETECTOR_DY ) / 2;
      const wideHalfHeight = ( detectorScreenParallelogram.height ) / 2; // Fans out to detector screen height

      const fanShape = new Shape()
        .moveTo( fanLeft, slitCenterY - narrowHalfHeight )
        .lineTo( fanRight, screenCenterY - wideHalfHeight )
        .lineTo( fanRight, screenCenterY + wideHalfHeight )
        .lineTo( fanLeft, slitCenterY + narrowHalfHeight )
        .close();
      fanBeamNode.shape = fanShape;

      // Gradient that fades from beam color (with opacity) to transparent
      const gradient = new LinearGradient( fanLeft, 0, fanRight, 0 )
        .addColorStop( 0, beamColor.withAlpha( 0.3 * intensity ) )
        .addColorStop( 1, beamColor.withAlpha( 0 ) );
      fanBeamNode.fill = gradient;
    };

    // Wire up beam updates to the relevant properties via DynamicProperty-style manual linking.
    // When the scene changes, unlink from the old scene's properties and link to the new ones.
    // screenDistanceProperty is included because the detector parallelogram position affects the fan beam.
    const beamProperties = [ 'isEmittingProperty', 'intensityProperty', 'wavelengthProperty', 'screenDistanceProperty' ] as const;
    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        for ( const propName of beamProperties ) {
          oldScene[ propName ].unlink( updateBeam );
        }
      }
      for ( const propName of beamProperties ) {
        newScene[ propName ].link( updateBeam );
      }
    } );

    // ==============================
    // Middle Row: Source controls, front-facing slits, front-facing screen, graph
    // ==============================

    // Front-facing slit view - one per scene, with visibility toggling
    const frontFacingSlitTandem = options.tandem.createTandem( 'frontFacingSlitNodes' );
    const frontFacingSlitNodes = model.scenes.map( ( scene, index ) => {
      const slitNode = new FrontFacingSlitNode( scene, {
        tandem: frontFacingSlitTandem.createTandem( `frontFacingSlitNode${index}` )
      } );
      // Position in the middle column, centered under the overhead double slit parallelogram
      slitNode.centerX = doubleSlitNode.centerX;
      slitNode.top = 120;
      this.addChild( slitNode );
      return slitNode;
    } );

    // Front-facing detector screen - one per scene, with visibility toggling.
    // The front-facing screen has a fixed position; the overhead parallelogram slides above it.
    const FRONT_FACING_SCREEN_RIGHT = 940; // Fixed right edge for all front-facing detector screens
    const detectorScreenTandem = options.tandem.createTandem( 'detectorScreenNodes' );
    const detectorScreenNodes = model.scenes.map( ( scene, index ) => {
      const detectorScreen = new DetectorScreenNode( scene, {
        tandem: detectorScreenTandem.createTandem( `detectorScreenNode${index}` )
      } );
      detectorScreen.right = FRONT_FACING_SCREEN_RIGHT;
      detectorScreen.top = 120;
      this.addChild( detectorScreen );
      return detectorScreen;
    } );

    // Now that front-facing screens are positioned, set the reference bounds for the
    // overhead parallelogram's horizontal range.
    frontFacingScreenLeft = detectorScreenNodes[ 0 ].left;
    frontFacingScreenRight = detectorScreenNodes[ 0 ].right;

    // Trigger initial position update now that bounds are set
    updateDetectorScreenPosition();

    // Graph accordion box - one per scene, positioned below the front-facing detector screen
    const graphTandem = options.tandem.createTandem( 'graphAccordionBoxes' );
    this.graphAccordionBoxes = model.scenes.map( ( scene, index ) => {
      const graphBox = new GraphAccordionBox( scene, {
        tandem: graphTandem.createTandem( `graphAccordionBox${index}` )
      } );
      // Position below the front-facing detector screen, left-aligned
      graphBox.left = detectorScreenNodes[ 0 ].left;
      graphBox.top = detectorScreenNodes[ 0 ].top + 250 + 8; // SCREEN_HEIGHT + spacing
      this.addChild( graphBox );
      return graphBox;
    } );

    // Toggle visibility of front-facing slits, detector screens, and graphs based on the selected scene
    model.sceneProperty.link( selectedScene => {
      model.scenes.forEach( ( scene, index ) => {
        const isSelected = scene === selectedScene;
        frontFacingSlitNodes[ index ].visible = isSelected;
        detectorScreenNodes[ index ].visible = isSelected;
        this.graphAccordionBoxes[ index ].visible = isSelected;
      } );
    } );

    // Source controls panel (beneath the emitter)
    const sourceControlPanel = new SourceControlPanel(
      model.sceneProperty,
      model.scenes,
      {
        tandem: options.tandem.createTandem( 'sourceControlPanel' )
      }
    );
    sourceControlPanel.left = laserPointerNode.left;
    sourceControlPanel.top = laserPointerNode.bottom + 14;
    this.addChild( sourceControlPanel );

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

    // Slit controls panel (center of bottom row)
    const slitControlPanel = new SlitControlPanel(
      model.sceneProperty,
      model.scenes,
      this, // ComboBox list parent
      {
        tandem: options.tandem.createTandem( 'slitControlPanel' )
      }
    );
    slitControlPanel.left = sceneRadioButtonGroup.right + 20;
    slitControlPanel.bottom = this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( slitControlPanel );

    // Screen settings panel (detection mode + brightness)
    const screenSettingsPanel = new ScreenSettingsPanel( model.sceneProperty, {
      tandem: options.tandem.createTandem( 'screenSettingsPanel' )
    } );
    screenSettingsPanel.left = slitControlPanel.right + 20;
    screenSettingsPanel.bottom = this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( screenSettingsPanel );

    // Time controls: play/pause button with step-forward and speed radio buttons
    const timeControlNode = new TimeControlNode( model.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [ TimeSpeed.FAST, TimeSpeed.NORMAL, TimeSpeed.SLOW ],
      flowBoxSpacing: 15,
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => {
            model.sceneProperty.value.step( 1 / 60 ); // Step one frame
          }
        },
        playPauseButtonOptions: {
          radius: 22
        }
      },
      tandem: options.tandem.createTandem( 'timeControlNode' )
    } );
    timeControlNode.left = screenSettingsPanel.right + 20;
    timeControlNode.bottom = this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( timeControlNode );

    // Ruler checkbox - positioned above the time controls, per the design mockup
    const rulerCheckboxLabel = new Text( QuantumWaveInterferenceFluent.rulerStringProperty, {
      font: new PhetFont( 15 ),
      maxWidth: 80
    } );
    const rulerCheckbox = new Checkbox( model.isRulerVisibleProperty, rulerCheckboxLabel, {
      boxWidth: 16,
      spacing: 6,
      tandem: options.tandem.createTandem( 'rulerCheckbox' )
    } );
    rulerCheckbox.left = timeControlNode.left;
    rulerCheckbox.bottom = timeControlNode.top - 10;
    this.addChild( rulerCheckbox );

    // Draggable ruler - 10 cm with major ticks each cm, displayed in front of all other content
    const RULER_CM_COUNT = 10;
    const VIEW_UNITS_PER_CM = 30; // view units per centimeter on the ruler
    const rulerWidth = RULER_CM_COUNT * VIEW_UNITS_PER_CM;
    const rulerHeight = 40;
    const majorTickLabels = rangeInclusive( 0, RULER_CM_COUNT ).map( n => `${n}` );

    const rulerNode = new RulerNode( rulerWidth, rulerHeight, VIEW_UNITS_PER_CM, majorTickLabels,
      QuantumWaveInterferenceFluent.centimetersStringProperty, {
        minorTicksPerMajorTick: 4,
        majorTickFont: new PhetFont( 12 ),
        unitsFont: new PhetFont( 11 ),
        cursor: 'pointer',
        opacity: 0.8,
        visibleProperty: model.isRulerVisibleProperty,
        tandem: options.tandem.createTandem( 'rulerNode' )
      } );

    // Sync ruler position from model
    model.rulerPositionProperty.link( position => {
      rulerNode.translation = position;
    } );

    // Drag bounds: keep at least 30px of the ruler visible within the layout bounds
    const RULER_MIN_VISIBLE_PX = 30;
    const rulerDragBoundsProperty = new DerivedProperty( [ this.visibleBoundsProperty ], visibleBounds => {
      return visibleBounds.withOffsets(
        rulerNode.width - RULER_MIN_VISIBLE_PX,
        0,
        -RULER_MIN_VISIBLE_PX,
        -rulerNode.height
      );
    } );

    // Clamp ruler position when drag bounds change
    rulerDragBoundsProperty.link( dragBounds => {
      model.rulerPositionProperty.value = dragBounds.closestPointTo( model.rulerPositionProperty.value );
    } );

    // Pointer drag listener
    rulerNode.addInputListener( new SoundDragListener( {
      positionProperty: model.rulerPositionProperty,
      dragBoundsProperty: rulerDragBoundsProperty,
      tandem: options.tandem.createTandem( 'rulerNode' ).createTandem( 'dragListener' )
    } ) );

    this.addChild( rulerNode );

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
    this.graphAccordionBoxes.forEach( box => box.reset() );
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

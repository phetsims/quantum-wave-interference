// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentScreenView is the top-level view for the Quantum Wave Interference simulation.
 * It contains three visual "rows": the top row with the emitter, double slit, and detector screen
 * in overhead perspective; the middle row with controls and front-facing views; and the bottom row
 * with scene selectors, slit controls, and screen settings.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { rangeInclusive } from '../../../../dot/js/util/rangeInclusive.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import Shape from '../../../../kite/js/Shape.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import RulerNode from '../../../../scenery-phet/js/RulerNode.js';
import SoundDragListener from '../../../../scenery-phet/js/SoundDragListener.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceQueryParameters from '../../common/QuantumWaveInterferenceQueryParameters.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import DetectionMode from '../model/DetectionMode.js';
import ExperimentModel from '../model/ExperimentModel.js';
import SceneModel from '../model/SceneModel.js';
import SlitSetting from '../model/SlitSetting.js';
import SourceType from '../model/SourceType.js';
import DetectorScreenNode from './DetectorScreenNode.js';
import FrontFacingSlitNode from './FrontFacingSlitNode.js';
import GraphAccordionBox from './GraphAccordionBox.js';
import OverheadDetectorPatternNode from './OverheadDetectorPatternNode.js';
import SceneRadioButtonGroup from './SceneRadioButtonGroup.js';
import ScreenSettingsPanel from './ScreenSettingsPanel.js';
import SlitControlPanel from './SlitControlPanel.js';
import SourceControlPanel from './SourceControlPanel.js';

// Layout constants derived from the design mockup (1024x618 layout bounds)
const LABEL_FONT = new PhetFont( 16 );
const LABEL_Y = 30; // y position for top-row labels

type SelfOptions = EmptySelfOptions;

type ExperimentScreenViewOptions = SelfOptions & ScreenViewOptions;

export default class ExperimentScreenView extends ScreenView {

  private readonly graphAccordionBoxes: GraphAccordionBox[];

  // Shared expanded state for the graph accordion boxes across all scenes, so that switching
  // scenes preserves the open/closed state per the design requirement.
  private readonly graphExpandedProperty: BooleanProperty;

  public constructor( model: ExperimentModel, providedOptions: ExperimentScreenViewOptions ) {

    const options = optionize<ExperimentScreenViewOptions, SelfOptions, ScreenViewOptions>()( {}, providedOptions );

    super( options );

    // ==============================
    // Top Row: Emitter, Double Slit, Detector Screen (overhead perspective)
    // ==============================

    // Source label that changes with the selected scene. All four string properties are
    // declared as dependencies so the label updates correctly when the locale changes.
    const sourceLabelStringProperty = new DerivedProperty(
      [
        model.sceneProperty,
        QuantumWaveInterferenceFluent.photonSourceStringProperty,
        QuantumWaveInterferenceFluent.electronSourceStringProperty,
        QuantumWaveInterferenceFluent.neutronSourceStringProperty,
        QuantumWaveInterferenceFluent.heliumAtomSourceStringProperty
      ],
      ( scene, photonSource, electronSource, neutronSource, heliumAtomSource ) => {
        if ( scene.sourceType === SourceType.PHOTONS ) {
          return photonSource;
        }
        else if ( scene.sourceType === SourceType.ELECTRONS ) {
          return electronSource;
        }
        else if ( scene.sourceType === SourceType.NEUTRONS ) {
          return neutronSource;
        }
        else {
          return heliumAtomSource;
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

    // Particle mass label (hidden for photons, shown for electrons/neutrons/helium atoms).
    // Displays the particle mass in scientific notation with proper sub/superscripts.
    const MASS_LABEL_FONT = new PhetFont( 15 );

    // Map from source type to formatted mass string using RichText markup for sub/superscripts.
    const massLabelMap = new Map<SourceType, string>();
    massLabelMap.set( SourceType.ELECTRONS, 'm<sub>e</sub> = 9.1\u00D710<sup>\u221231</sup> kg' );
    massLabelMap.set( SourceType.NEUTRONS, 'm<sub>n</sub> = 1.7\u00D710<sup>\u221227</sup> kg' );
    massLabelMap.set( SourceType.HELIUM_ATOMS, 'm<sub>He</sub> = 6.6\u00D710<sup>\u221227</sup> kg' );

    const particleMassLabel = new RichText( '', {
      font: MASS_LABEL_FONT,
      left: sourceLabel.left,
      maxWidth: 200
    } );
    this.addChild( particleMassLabel );

    // Update mass label visibility and content when the scene changes
    model.sceneProperty.link( scene => {
      const isParticle = scene.sourceType !== SourceType.PHOTONS;
      particleMassLabel.visible = isParticle;
      if ( isParticle ) {
        particleMassLabel.string = massLabelMap.get( scene.sourceType )!;
      }
    } );

    // DynamicProperty that follows the active scene's isEmittingProperty, so the laser button
    // always controls the currently selected scene's emitter.
    const isEmittingProperty = new DynamicProperty<boolean, boolean, SceneModel>( model.sceneProperty, {
      derive: scene => scene.isEmittingProperty,
      bidirectional: true
    } );

    // Emitter left position, shared by both laser and particle emitters
    const emitterLeft = this.layoutBounds.minX + QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN + 20;

    // Laser pointer node for the photon emitter source.
    const laserPointerNode = new LaserPointerNode( isEmittingProperty, {
      bodySize: new Dimension2( 88, 40 ),
      nozzleSize: new Dimension2( 16, 32 ),
      buttonOptions: {
        baseColor: 'red',
        radius: 14
      },
      left: emitterLeft,
      tandem: options.tandem.createTandem( 'laserPointerNode' )
    } );
    this.addChild( laserPointerNode );

    // Particle emitter node for non-photon scenes (electrons, neutrons, helium atoms).
    // Uses LaserPointerNode with different styling: blue-gray body to look like a generic
    // particle source rather than a laser, matching the electron emitter design mockup.
    const particleEmitterNode = new LaserPointerNode( isEmittingProperty, {
      bodySize: new Dimension2( 88, 40 ),
      nozzleSize: new Dimension2( 16, 32 ),
      topColor: 'rgb(100, 120, 180)',
      bottomColor: 'rgb(30, 40, 80)',
      highlightColor: 'rgb(160, 180, 230)',
      buttonOptions: {
        baseColor: 'red',
        radius: 14
      },
      hasGlass: true,
      glassOptions: {
        mainColor: 'rgb(160, 190, 220)',
        highlightColor: 'white',
        shadowColor: 'rgb(100, 130, 160)',
        heightProportion: 0.7,
        proportionStickingOut: 0.3
      },
      left: emitterLeft,
      visible: false,
      tandem: options.tandem.createTandem( 'particleEmitterNode' )
    } );
    this.addChild( particleEmitterNode );

    // Position the emitter directly below the source label, and the mass label below the emitter.
    // Per the ElectronEmitter.svg design mockup, the mass label appears between the emitter and
    // the source control panel, not between the source label and the emitter.
    // Toggle visibility of the two emitter nodes based on whether the scene is photons or particles.
    const updateEmitterLayout = () => {
      const isPhoton = model.sceneProperty.value.sourceType === SourceType.PHOTONS;
      laserPointerNode.visible = isPhoton;
      particleEmitterNode.visible = !isPhoton;

      // The active emitter node for positioning
      const activeEmitter = isPhoton ? laserPointerNode : particleEmitterNode;

      // Emitter is always directly below the source label, same position for all scenes
      activeEmitter.top = sourceLabel.bottom + 6;

      // Mass label appears below the emitter (only visible for particle scenes)
      particleMassLabel.top = activeEmitter.bottom + 4;
    };

    model.sceneProperty.link( updateEmitterLayout );

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
    const doubleSlitNode = ExperimentScreenView.createParallelogramNode( 51, 21, 50, 'black' );
    doubleSlitNode.x = 365;
    doubleSlitNode.y = 45;
    this.addChild( doubleSlitNode );

    // Position label centered above the double slit, at the same vertical position as the
    // source label per the design mockup where all top-row labels are at a consistent height.
    doubleSlitLabel.centerX = doubleSlitNode.centerX;
    doubleSlitLabel.top = LABEL_Y;

    // Slit lines on the parallelogram (two thin white vertical lines representing the slits).
    // These update dynamically based on the scene's slit separation, matching the front-facing
    // slit view behavior per the design requirement.
    const slitLineLength = 25;
    const slitXFraction = 0.5; // fraction across the parallelogram width (centered)
    const slitYCenter = 25; // center of the left edge height

    // The x-offset within the parallelogram accounts for the skew
    const slitBaseX = slitXFraction * 51;
    const slitBaseY = slitYCenter + slitXFraction * 21;

    // Visual spacing range for the slit lines on the parallelogram (in local coordinates).
    // At minimum slit separation, lines are close together; at maximum, far apart.
    const MIN_VISUAL_SLIT_SPACING = 1;
    const MAX_VISUAL_SLIT_SPACING = 4;

    const leftSlitLine = new Path( null, {
      stroke: 'white',
      lineWidth: 1
    } );

    const rightSlitLine = new Path( null, {
      stroke: 'white',
      lineWidth: 1
    } );

    doubleSlitNode.addChild( leftSlitLine );
    doubleSlitNode.addChild( rightSlitLine );

    // Cover/detector overlays on the parallelogram slit lines
    const slitOverlayHeight = slitLineLength + 4;
    const slitOverlayWidth = 5;

    const leftSlitCover = new Rectangle( 0, 0, slitOverlayWidth, slitOverlayHeight, {
      fill: '#555',
      visible: false
    } );
    doubleSlitNode.addChild( leftSlitCover );

    const rightSlitCover = new Rectangle( 0, 0, slitOverlayWidth, slitOverlayHeight, {
      fill: '#555',
      visible: false
    } );
    doubleSlitNode.addChild( rightSlitCover );

    // Detector overlays (yellow, distinct from gray covers)
    const leftSlitDetectorOverlay = new Rectangle( 0, 0, slitOverlayWidth, slitOverlayHeight, {
      fill: new Color( 255, 200, 50, 0.8 ),
      visible: false
    } );
    doubleSlitNode.addChild( leftSlitDetectorOverlay );

    const rightSlitDetectorOverlay = new Rectangle( 0, 0, slitOverlayWidth, slitOverlayHeight, {
      fill: new Color( 255, 200, 50, 0.8 ),
      visible: false
    } );
    doubleSlitNode.addChild( rightSlitDetectorOverlay );

    // Updates the positions of slit lines, covers, and detector overlays on the overhead
    // parallelogram to reflect the current slit separation and slit setting.
    const updateOverheadSlits = () => {
      const scene = model.sceneProperty.value;
      const separation = scene.slitSeparationProperty.value;
      const range = scene.slitSeparationRange;
      const fraction = ( separation - range.min ) / ( range.max - range.min );
      const visualSpacing = MIN_VISUAL_SLIT_SPACING + fraction * ( MAX_VISUAL_SLIT_SPACING - MIN_VISUAL_SLIT_SPACING );

      const leftX = slitBaseX - visualSpacing / 2;
      const rightX = slitBaseX + visualSpacing / 2;

      // Offset each slit's Y position along the parallelogram's slope (dy/dx = 21/51)
      // so the left slit is higher and the right slit is lower, matching the perspective.
      const slopeRatio = 21 / 51;
      const leftY = slitBaseY - ( visualSpacing / 2 ) * slopeRatio;
      const rightY = slitBaseY + ( visualSpacing / 2 ) * slopeRatio;

      // Update slit line shapes
      leftSlitLine.shape = Shape.lineSegment( leftX, leftY - slitLineLength / 2,
        leftX, leftY + slitLineLength / 2 );
      rightSlitLine.shape = Shape.lineSegment( rightX, rightY - slitLineLength / 2,
        rightX, rightY + slitLineLength / 2 );

      // Reposition cover and detector overlays to track the slit positions
      leftSlitCover.x = leftX - slitOverlayWidth / 2;
      leftSlitCover.y = leftY - slitOverlayHeight / 2;
      rightSlitCover.x = rightX - slitOverlayWidth / 2;
      rightSlitCover.y = rightY - slitOverlayHeight / 2;

      leftSlitDetectorOverlay.x = leftX - slitOverlayWidth / 2;
      leftSlitDetectorOverlay.y = leftY - slitOverlayHeight / 2;
      rightSlitDetectorOverlay.x = rightX - slitOverlayWidth / 2;
      rightSlitDetectorOverlay.y = rightY - slitOverlayHeight / 2;

      // Update cover/detector visibility based on slit setting
      const slitSetting = scene.slitSettingProperty.value;
      leftSlitCover.visible = ( slitSetting === SlitSetting.LEFT_COVERED );
      rightSlitCover.visible = ( slitSetting === SlitSetting.RIGHT_COVERED );
      leftSlitDetectorOverlay.visible = ( slitSetting === SlitSetting.LEFT_DETECTOR );
      rightSlitDetectorOverlay.visible = ( slitSetting === SlitSetting.RIGHT_DETECTOR );
    };

    // Wire up overhead slit updates when scene, slit separation, or slit setting changes
    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        oldScene.slitSeparationProperty.unlink( updateOverheadSlits );
        oldScene.slitSettingProperty.unlink( updateOverheadSlits );
      }
      newScene.slitSeparationProperty.link( updateOverheadSlits );
      newScene.slitSettingProperty.link( updateOverheadSlits );
    } );

    // ==============================
    // Which-path detector indicator (appears next to double slit when detector slit setting is active)
    // ==============================
    const DETECTOR_BOX_WIDTH = 58;
    const DETECTOR_BOX_HEIGHT = 38;
    const detectorIndicatorBox = new Rectangle( 0, 0, DETECTOR_BOX_WIDTH, DETECTOR_BOX_HEIGHT, 5, 5, {
      fill: new Color( 255, 200, 50 ),
      stroke: new Color( 180, 140, 0 ),
      lineWidth: 1
    } );
    const detectorIndicatorLabel = new Text( QuantumWaveInterferenceFluent.detectorStringProperty, {
      font: new PhetFont( 11 ),
      maxWidth: DETECTOR_BOX_WIDTH - 6
    } );

    // Hit count text shown below the "Detector" label when in Hits mode
    const detectorHitCountText = new Text( '', {
      font: new PhetFont( 10 ),
      maxWidth: DETECTOR_BOX_WIDTH - 6,
      visible: false
    } );

    const detectorLabelContainer = new Node( {
      children: [ detectorIndicatorLabel, detectorHitCountText ]
    } );

    const detectorIndicatorNode = new Node( {
      children: [ detectorIndicatorBox, detectorLabelContainer ],
      visible: false,
      // Position to the right of the double slit parallelogram
      left: doubleSlitNode.right + 4,
      centerY: doubleSlitNode.centerY
    } );
    this.addChild( detectorIndicatorNode );

    // Center the label content within the box
    const updateDetectorLabelLayout = () => {
      detectorIndicatorLabel.centerX = DETECTOR_BOX_WIDTH / 2;
      if ( detectorHitCountText.visible ) {
        // Stack label and count vertically
        detectorIndicatorLabel.centerY = DETECTOR_BOX_HEIGHT / 2 - 7;
        detectorHitCountText.centerX = DETECTOR_BOX_WIDTH / 2;
        detectorHitCountText.centerY = DETECTOR_BOX_HEIGHT / 2 + 7;
      }
      else {
        detectorIndicatorLabel.centerY = DETECTOR_BOX_HEIGHT / 2;
      }
    };

    // DynamicProperty following the active scene's slitSettingProperty
    const slitSettingProperty = new DynamicProperty<SlitSetting, SlitSetting, SceneModel>( model.sceneProperty, {
      derive: scene => scene.slitSettingProperty
    } );

    // DynamicProperty following the active scene's detectionModeProperty
    const detectionModeProperty = new DynamicProperty<DetectionMode, DetectionMode, SceneModel>( model.sceneProperty, {
      derive: scene => scene.detectionModeProperty
    } );

    // DynamicProperty following the active scene's detectorHitsProperty
    const detectorHitsProperty = new DynamicProperty<number, number, SceneModel>( model.sceneProperty, {
      derive: scene => scene.detectorHitsProperty
    } );

    // Update the detector indicator: show/hide and display hit count when in Hits mode
    const updateDetectorIndicator = () => {
      const slitSetting = slitSettingProperty.value;
      const isDetectorActive = slitSetting === SlitSetting.LEFT_DETECTOR || slitSetting === SlitSetting.RIGHT_DETECTOR;
      detectorIndicatorNode.visible = isDetectorActive;

      if ( isDetectorActive ) {
        const isHitsMode = detectionModeProperty.value === DetectionMode.HITS;
        detectorHitCountText.visible = isHitsMode;
        if ( isHitsMode ) {
          detectorHitCountText.string = `${detectorHitsProperty.value}`;
        }
        updateDetectorLabelLayout();
      }
    };

    slitSettingProperty.link( updateDetectorIndicator );
    detectionModeProperty.link( updateDetectorIndicator );
    detectorHitsProperty.link( updateDetectorIndicator );

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
    const detectorScreenParallelogram = ExperimentScreenView.createParallelogramNode(
      DETECTOR_DX, DETECTOR_DY, DETECTOR_LEFT_HEIGHT, 'black' );
    detectorScreenParallelogram.y = 48;
    this.addChild( detectorScreenParallelogram );

    // Interference pattern overlay on the overhead detector screen parallelogram.
    // Renders intensity bands clipped to the parallelogram shape, showing the same
    // interference pattern that appears on the front-facing detector screen.
    const overheadPatternNode = new OverheadDetectorPatternNode(
      DETECTOR_DX, DETECTOR_DY, DETECTOR_LEFT_HEIGHT );
    detectorScreenParallelogram.addChild( overheadPatternNode );

    // Distance span between double slit and detector screen: a double-headed arrow
    // with tick marks at each end and a distance label, matching the span indicator style
    // used in FrontFacingSlitNode and the design mockup.
    const SPAN_TICK_LENGTH = 8;
    const distanceSpanArrow = new ArrowNode( 0, 0, 1, 0, {
      headHeight: 5,
      headWidth: 5,
      tailWidth: 1,
      doubleHead: true,
      fill: 'black',
      stroke: null
    } );
    this.addChild( distanceSpanArrow );

    const distanceSpanLeftTick = new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, {
      stroke: 'black', lineWidth: 1
    } );
    this.addChild( distanceSpanLeftTick );

    const distanceSpanRightTick = new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, {
      stroke: 'black', lineWidth: 1
    } );
    this.addChild( distanceSpanRightTick );

    // Distance readout text (updates with screen distance)
    const distanceText = new Text( '', {
      font: new PhetFont( 13 )
    } );
    this.addChild( distanceText );

    // The detector screen parallelogram slides horizontally based on screen distance.
    // At max distance, the right edge of the parallelogram aligns with the right edge
    // of the front-facing detector screen. At min distance, the parallelogram center
    // aligns with the center of the front-facing detector screen. This right-biased range
    // keeps the overhead parallelogram above the right portion of the front-facing screen,
    // matching the design mockup (InitialView.svg) where the overhead detector screen is
    // positioned near the right edge even at intermediate distances.
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

      // At fraction 1 (max distance): parallelogram right edge = front-facing screen right edge
      const xAtMax = frontFacingScreenRight - DETECTOR_DX;

      // At fraction 0 (min distance): parallelogram center = front-facing screen center.
      // This constrains the parallelogram to the right half of the front-facing screen,
      // matching the design SVG where the overhead parallelogram stays near the right side.
      const frontFacingScreenCenter = ( frontFacingScreenLeft + frontFacingScreenRight ) / 2;
      const xAtMin = frontFacingScreenCenter - DETECTOR_DX / 2;
      detectorScreenParallelogram.x = xAtMin + fraction * ( xAtMax - xAtMin );

      // Update label above the parallelogram, at the same vertical position as the other
      // top-row labels per the design mockup where all labels share a consistent height.
      detectorScreenLabel.centerX = detectorScreenParallelogram.centerX;
      detectorScreenLabel.top = LABEL_Y;

      // Update distance span between double slit and detector screen
      const spanY = Math.max( doubleSlitNode.bottom, detectorScreenParallelogram.bottom ) + 12;
      const leftX = doubleSlitNode.centerX;
      const rightX = detectorScreenParallelogram.centerX;

      distanceSpanArrow.setTailAndTip( leftX, spanY, rightX, spanY );
      distanceSpanLeftTick.x = leftX;
      distanceSpanLeftTick.centerY = spanY;
      distanceSpanRightTick.x = rightX;
      distanceSpanRightTick.centerY = spanY;

      // Update distance text
      distanceText.string = `${toFixed( distance, 1 )} m`;
      distanceText.centerX = ( leftX + rightX ) / 2;
      distanceText.bottom = spanY - SPAN_TICK_LENGTH / 2 - 2;
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

      // Emitter beam: rectangle from emitter nozzle tip to the left edge of the double slit parallelogram.
      // The nozzle height is 32 (nozzleSize height from LaserPointerNode options).
      const activeEmitter = scene.sourceType === SourceType.PHOTONS ? laserPointerNode : particleEmitterNode;
      const nozzleTipX = activeEmitter.right;
      const laserCenterY = activeEmitter.centerY;
      const beamHeight = 32; // matches nozzle height
      const beamLeft = nozzleTipX;
      const beamRight = doubleSlitNode.left;

      emitterBeamNode.setRect( beamLeft, laserCenterY - beamHeight / 2, beamRight - beamLeft, beamHeight );
      emitterBeamNode.fill = beamColor.withAlpha( 0.8 * intensity );

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

      // Gradient that fades from beam color (with opacity) to transparent, matching the
      // LaserOn.svg design where the fan beam starts at stop-opacity 0.2 (at default intensity)
      // and fades to fully transparent at the detector screen.
      const gradient = new LinearGradient( fanLeft, 0, fanRight, 0 )
        .addColorStop( 0, beamColor.withAlpha( 0.4 * intensity ) )
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

    // Wire up overhead pattern updates. The pattern depends on the same properties as the
    // interference calculation plus detection mode and hits for Hits mode rendering.
    const updateOverheadPattern = () => {
      const scene = model.sceneProperty.value;
      overheadPatternNode.updatePattern( scene );
    };

    const patternProperties = [
      'isEmittingProperty', 'intensityProperty', 'wavelengthProperty', 'velocityProperty',
      'slitSeparationProperty', 'screenDistanceProperty', 'slitSettingProperty',
      'detectionModeProperty', 'screenBrightnessProperty'
    ] as const;

    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        for ( const propName of patternProperties ) {
          oldScene[ propName ].unlink( updateOverheadPattern );
        }
        oldScene.hitsChangedEmitter.removeListener( updateOverheadPattern );
      }
      for ( const propName of patternProperties ) {
        newScene[ propName ].link( updateOverheadPattern );
      }
      newScene.hitsChangedEmitter.addListener( updateOverheadPattern );
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
      // Use y (not top) because the slit width span extends above y=0 in the node's coordinate frame.
      // y sets the background rect top; the slit width span extends above this.
      slitNode.left = QuantumWaveInterferenceConstants.FRONT_FACING_SLIT_LEFT;
      slitNode.y = QuantumWaveInterferenceConstants.FRONT_FACING_ROW_TOP;
      this.addChild( slitNode );
      return slitNode;
    } );

    // Front-facing detector screen - one per scene, with visibility toggling.
    // The front-facing screen has a fixed position; the overhead parallelogram slides above it.
    const detectorScreenTandem = options.tandem.createTandem( 'detectorScreenNodes' );
    const detectorScreenNodes = model.scenes.map( ( scene, index ) => {
      const detectorScreen = new DetectorScreenNode( scene, {
        tandem: detectorScreenTandem.createTandem( `detectorScreenNode${index}` )
      } );
      // Position so the screen rect's right edge is at DETECTOR_SCREEN_RIGHT.
      // The screen rect starts at local x=0, so .x = desired right edge - screen rect width.
      detectorScreen.x = QuantumWaveInterferenceConstants.DETECTOR_SCREEN_RIGHT - QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH;
      // Use y (not top) to position the background rect at FRONT_FACING_ROW_TOP.
      detectorScreen.y = QuantumWaveInterferenceConstants.FRONT_FACING_ROW_TOP;
      this.addChild( detectorScreen );
      return detectorScreen;
    } );

    // Now that front-facing screens are positioned, set the reference bounds for the
    // overhead parallelogram's horizontal range. Use the screen rect bounds (not the full
    // node bounds which include buttons) for accurate alignment with the overhead view.
    frontFacingScreenLeft = detectorScreenNodes[ 0 ].x;
    frontFacingScreenRight = detectorScreenNodes[ 0 ].x + QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH;

    // Trigger initial position update now that bounds are set, then re-run beam update
    // so the fan beam uses the corrected detector screen parallelogram position.
    updateDetectorScreenPosition();
    updateBeam();

    // Shared expanded property for the graph accordion box, so switching scenes does not
    // change the open/closed state (per design requirement).
    this.graphExpandedProperty = new BooleanProperty(
      QuantumWaveInterferenceQueryParameters.graphExpanded, {
        tandem: options.tandem.createTandem( 'graphExpandedProperty' )
      } );

    // Graph accordion box - one per scene, positioned below the front-facing detector screen.
    // A ManualConstraint aligns each graph's chart area left edge with the detector screen's
    // left edge, accounting for the AccordionBox's internal padding and y-axis label.
    const graphTandem = options.tandem.createTandem( 'graphAccordionBoxes' );
    this.graphAccordionBoxes = model.scenes.map( ( scene, index ) => {
      const graphBox = new GraphAccordionBox( scene, {
        expandedProperty: this.graphExpandedProperty,
        tandem: graphTandem.createTandem( `graphAccordionBox${index}` )
      } );
      graphBox.top = detectorScreenNodes[ 0 ].bottom + 8;
      this.addChild( graphBox );

      const detectorScreen = detectorScreenNodes[ index ];
      ManualConstraint.create( this, [ graphBox, detectorScreen ], ( graphBoxProxy, detectorScreenProxy ) => {

        // Align the chart background's left edge (in the ScreenView coordinate frame) with
        // the detector screen's left edge. The chart background is nested inside the
        // AccordionBox, so we convert its local origin to global coordinates to find the offset.
        const chartGlobalLeft = graphBox.chartBackground.parentToGlobalPoint(
          graphBox.chartBackground.leftTop ).x;
        const graphBoxGlobalLeft = graphBoxProxy.left;
        const chartOffset = chartGlobalLeft - graphBoxGlobalLeft;

        graphBoxProxy.left = detectorScreenProxy.left - chartOffset;
      } );

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
    this.addChild( sourceControlPanel );

    // Update the source control panel position dynamically. For particle scenes, the mass label
    // appears below the emitter per the ElectronEmitter.svg design, so the panel goes below it.
    // For photons (no mass label), the panel goes directly below the emitter.
    const updateSourceControlPanelPosition = () => {
      sourceControlPanel.top = 163;
    };
    model.sceneProperty.link( updateSourceControlPanelPosition );

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
    slitControlPanel.left = QuantumWaveInterferenceConstants.FRONT_FACING_SLIT_LEFT;
    slitControlPanel.bottom = this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( slitControlPanel );

    // Move front-facing slit nodes above the slit control panel so the slit separation
    // span below the view is not obscured by the panel's background.
    frontFacingSlitNodes.forEach( n => n.moveToFront() );

    // Screen settings panel (detection mode + brightness).
    // Per the design mockup, the screen settings panel is in the right column of the bottom row,
    // positioned below the graph accordion box and left-aligned with it.
    const screenSettingsPanel = new ScreenSettingsPanel( model.sceneProperty, {
      tandem: options.tandem.createTandem( 'screenSettingsPanel' )
    } );
    screenSettingsPanel.left = this.graphAccordionBoxes[ 0 ].left;
    screenSettingsPanel.bottom = this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( screenSettingsPanel );

    // Ruler checkbox - positioned to the right of the screen settings panel, per the design mockup
    const rulerCheckboxLabel = new Text( QuantumWaveInterferenceFluent.rulerStringProperty, {
      font: new PhetFont( 15 ),
      maxWidth: 80
    } );
    const rulerCheckbox = new Checkbox( model.isRulerVisibleProperty, rulerCheckboxLabel, {
      boxWidth: 16,
      spacing: 6,
      tandem: options.tandem.createTandem( 'rulerCheckbox' )
    } );
    rulerCheckbox.left = screenSettingsPanel.right + 20;
    rulerCheckbox.top = screenSettingsPanel.top;
    this.addChild( rulerCheckbox );

    // Stopwatch checkbox - positioned below the ruler checkbox
    const stopwatchCheckboxLabel = new Text( QuantumWaveInterferenceFluent.stopwatchStringProperty, {
      font: new PhetFont( 15 ),
      maxWidth: 80
    } );
    const stopwatchCheckbox = new Checkbox( model.stopwatch.isVisibleProperty, stopwatchCheckboxLabel, {
      boxWidth: 16,
      spacing: 6,
      tandem: options.tandem.createTandem( 'stopwatchCheckbox' )
    } );
    stopwatchCheckbox.left = rulerCheckbox.left;
    stopwatchCheckbox.top = rulerCheckbox.bottom + 6;
    this.addChild( stopwatchCheckbox );

    // Time controls: play/pause button with step-forward and speed radio buttons.
    // Per the design mockup, the time controls are below the stopwatch checkbox, to the right
    // of the screen settings panel.
    const timeControlNode = new TimeControlNode( model.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ],
      flowBoxSpacing: 15,
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => {
            model.stepForwardInTime( 1 / 60 ); // Step one frame
          }
        },
        playPauseButtonOptions: {
          radius: 22
        }
      },
      tandem: options.tandem.createTandem( 'timeControlNode' )
    } );
    timeControlNode.left = rulerCheckbox.left;
    timeControlNode.top = stopwatchCheckbox.bottom + 8;
    this.addChild( timeControlNode );

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

    // Draggable stopwatch for timing experiments
    const stopwatchNode = new StopwatchNode( model.stopwatch, {
      dragBoundsProperty: this.visibleBoundsProperty,
      tandem: options.tandem.createTandem( 'stopwatchNode' )
    } );
    this.addChild( stopwatchNode );

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
    this.graphExpandedProperty.reset();
    this.graphAccordionBoxes.forEach( box => box.reset() );
  }

}

quantumWaveInterference.register( 'ExperimentScreenView', ExperimentScreenView );

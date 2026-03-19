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
import { rangeInclusive } from '../../../../dot/js/util/rangeInclusive.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import RulerNode from '../../../../scenery-phet/js/RulerNode.js';
import SoundDragListener from '../../../../scenery-phet/js/SoundDragListener.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceQueryParameters from '../../common/QuantumWaveInterferenceQueryParameters.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../model/ExperimentModel.js';
import DetectorScreenNode from './DetectorScreenNode.js';
import FrontFacingSlitNode from './FrontFacingSlitNode.js';
import GraphAccordionBox from './GraphAccordionBox.js';
import OverheadBeamNode from './OverheadBeamNode.js';
import OverheadDetectorScreenNode from './OverheadDetectorScreenNode.js';
import OverheadDoubleSlitNode from './OverheadDoubleSlitNode.js';
import OverheadEmitterNode from './OverheadEmitterNode.js';
import SceneRadioButtonGroup from './SceneRadioButtonGroup.js';
import ScreenSettingsPanel from './ScreenSettingsPanel.js';
import SlitControlPanel from './SlitControlPanel.js';
import SourceControlPanel from './SourceControlPanel.js';
import WhichPathDetectorIndicatorNode from './WhichPathDetectorIndicatorNode.js';

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

    const overheadEmitterNode = new OverheadEmitterNode( model, this.layoutBounds, options.tandem );
    this.addChild( overheadEmitterNode );

    const overheadDoubleSlitNode = new OverheadDoubleSlitNode( model );
    this.addChild( overheadDoubleSlitNode );

    const whichPathDetectorNode = new WhichPathDetectorIndicatorNode( model );
    whichPathDetectorNode.left = overheadDoubleSlitNode.parallelogramNode.right + 4;
    whichPathDetectorNode.centerY = overheadDoubleSlitNode.parallelogramNode.centerY;
    this.addChild( whichPathDetectorNode );

    const overheadDetectorScreenNode = new OverheadDetectorScreenNode( model, overheadDoubleSlitNode.parallelogramNode );
    this.addChild( overheadDetectorScreenNode );

    // Beam must be behind slit and screen parallelograms - add before them, then move to back
    const overheadBeamNode = new OverheadBeamNode( model, overheadEmitterNode, overheadDoubleSlitNode, overheadDetectorScreenNode );
    this.addChild( overheadBeamNode );
    overheadBeamNode.moveToBack();

    // ==============================
    // Middle Row: Source controls, front-facing slits, front-facing screen, graph
    // ==============================

    // Front-facing slit view - one per scene, with visibility toggling
    const frontFacingSlitTandem = options.tandem.createTandem( 'frontFacingSlitNodes' );
    const frontFacingSlitNodes = model.scenes.map( ( scene, index ) => {
      const slitNode = new FrontFacingSlitNode( scene, {
        tandem: frontFacingSlitTandem.createTandem( `frontFacingSlitNode${index}` )
      } );
      slitNode.left = QuantumWaveInterferenceConstants.FRONT_FACING_SLIT_LEFT;
      slitNode.y = QuantumWaveInterferenceConstants.FRONT_FACING_ROW_TOP;
      this.addChild( slitNode );
      return slitNode;
    } );

    // Front-facing detector screen - one per scene, with visibility toggling.
    const controlsRight = this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
    const detectorScreenTandem = options.tandem.createTandem( 'detectorScreenNodes' );
    const detectorScreenNodes = model.scenes.map( ( scene, index ) => {
      return new DetectorScreenNode( scene, {
        tandem: detectorScreenTandem.createTandem( `detectorScreenNode${index}` )
      } );
    } );

    const maxLocalRight = Math.max( ...detectorScreenNodes.map( ds => ds.localBounds.maxX ) );
    const detectorScreenX = controlsRight - maxLocalRight;
    for ( const detectorScreen of detectorScreenNodes ) {
      detectorScreen.x = detectorScreenX;
      detectorScreen.y = QuantumWaveInterferenceConstants.FRONT_FACING_ROW_TOP;
      this.addChild( detectorScreen );
    }

    // Set overhead parallelogram positioning bounds and trigger initial updates
    const frontFacingScreenLeft = detectorScreenNodes[ 0 ].x;
    const frontFacingScreenRight = detectorScreenNodes[ 0 ].x + QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH;
    overheadDetectorScreenNode.setFrontFacingScreenBounds( frontFacingScreenLeft, frontFacingScreenRight );
    overheadBeamNode.updateBeam();

    // Shared expanded property for the graph accordion box
    this.graphExpandedProperty = new BooleanProperty(
      QuantumWaveInterferenceQueryParameters.graphExpanded, {
        tandem: options.tandem.createTandem( 'graphExpandedProperty' )
      } );

    // Graph accordion box - one per scene
    const graphTandem = options.tandem.createTandem( 'graphAccordionBoxes' );
    this.graphAccordionBoxes = model.scenes.map( ( scene, index ) => {
      const graphBox = new GraphAccordionBox( scene, {
        expandedProperty: this.graphExpandedProperty,
        tandem: graphTandem.createTandem( `graphAccordionBox${index}` )
      } );
      graphBox.x = controlsRight - graphBox.localBounds.maxX;
      graphBox.top = detectorScreenNodes[ 0 ].bottom + 8;
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
    sourceControlPanel.left = overheadEmitterNode.laserPointerNode.left;
    this.addChild( sourceControlPanel );

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
    const screenSettingsPanel = new ScreenSettingsPanel( model.sceneProperty, {
      tandem: options.tandem.createTandem( 'screenSettingsPanel' )
    } );
    screenSettingsPanel.left = this.graphAccordionBoxes[ 0 ].left;
    screenSettingsPanel.bottom = this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( screenSettingsPanel );

    // Ruler checkbox
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

    // Time controls
    const timeControlNode = new TimeControlNode( model.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ],
      flowBoxSpacing: 15,
      playPauseStepButtonOptions: {
        includeStepForwardButton: false,
        playPauseButtonOptions: {
          radius: 22
        }
      },
      tandem: options.tandem.createTandem( 'timeControlNode' )
    } );
    timeControlNode.left = rulerCheckbox.left;
    timeControlNode.bottom = this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( timeControlNode );

    // Draggable ruler
    const RULER_CM_COUNT = 10;
    const VIEW_UNITS_PER_CM = 30;
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

    model.rulerPositionProperty.link( position => {
      rulerNode.translation = position;
    } );

    const RULER_MIN_VISIBLE_PX = 30;
    const rulerDragBoundsProperty = new DerivedProperty( [ this.visibleBoundsProperty ], visibleBounds => {
      return visibleBounds.withOffsets(
        rulerNode.width - RULER_MIN_VISIBLE_PX,
        0,
        -RULER_MIN_VISIBLE_PX,
        -rulerNode.height
      );
    } );

    rulerDragBoundsProperty.link( dragBounds => {
      model.rulerPositionProperty.value = dragBounds.closestPointTo( model.rulerPositionProperty.value );
    } );

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
   * Resets the view.
   */
  public reset(): void {
    this.graphExpandedProperty.reset();
    this.graphAccordionBoxes.forEach( box => box.reset() );
  }
}

quantumWaveInterference.register( 'ExperimentScreenView', ExperimentScreenView );

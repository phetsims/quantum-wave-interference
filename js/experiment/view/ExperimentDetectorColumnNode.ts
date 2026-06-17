// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentDetectorColumnNode owns the front-facing detector screens, screen settings, and graph accordion boxes for
 * the Experiment screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceToggleNode from '../../common/view/QuantumWaveInterferenceToggleNode.js';
import ExperimentConstants from '../ExperimentConstants.js';
import ExperimentModel from '../model/ExperimentModel.js';
import { formatExperimentDetectorScreenResponse } from './description/formatExperimentDetectorPatternResponse.js';
import FrontFacingDetectorScreenNode from './FrontFacingDetectorScreenNode.js';
import GraphAccordionBox from './GraphAccordionBox.js';
import ScreenSettingsPanel from './ScreenSettingsPanel.js';

export default class ExperimentDetectorColumnNode extends Node {

  // One FrontFacingDetectorScreenNode per scene; only the active scene's node is visible via QuantumWaveInterferenceToggleNode.
  public readonly detectorScreenNodes: FrontFacingDetectorScreenNode[];

  // One GraphAccordionBox per scene; shares graphExpandedProperty so the collapsed/expanded state
  // persists when switching scenes.
  public readonly graphAccordionBoxes: GraphAccordionBox[];

  // Shared expanded/collapsed state for all graph accordion boxes. Passed to DetectorRulerNode so
  // the ruler can respond to graph visibility changes.
  public readonly graphExpandedProperty: BooleanProperty;

  // Detection-mode, brightness, and emit controls displayed below the detector screen.
  // Exposed so ExperimentScreenViewDescription can place it in the PDOM order.
  public readonly screenSettingsPanel: ScreenSettingsPanel;

  public constructor(
    model: ExperimentModel,
    layoutBoundsMaxX: number,
    startSnapshotFlash: () => void,
    sceneTandems: ReadonlyMap<object, Tandem>,
    tandem: Tandem
  ) {
    super( { isDisposable: false } );

    const controlsRight = layoutBoundsMaxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;

    // One snapshots dialog is shared by all scenes — it renders the active scene's snapshots, matching the
    // High Intensity and Single Particles screens, and lives at view.snapshotsDialog in the PhET-iO tree.
    const snapshotsDialog = FrontFacingDetectorScreenNode.createSnapshotsDialog( model, tandem.createTandem( 'snapshotsDialog' ) );

    this.detectorScreenNodes = model.scenes.map( scene => new FrontFacingDetectorScreenNode(
      scene,
      model.detectorScreenScaleIndexProperty,
      model.isPlayingProperty,
      {
        onSnapshotCaptured: startSnapshotFlash,
        snapshotsDialog: snapshotsDialog,
        tandem: sceneTandems.get( scene )!.createTandem( 'detectorScreenNode' )
      }
    ) );

    // When the last snapshot is deleted and the dialog auto-closes, return focus to the active scene's take-snapshot
    // button (the snapshots dialog is shared across scenes, so the target depends on the selected scene).
    snapshotsDialog.getTakeSnapshotButton = () => {
      const activeIndex = model.scenes.indexOf( model.sceneProperty.value );
      return activeIndex >= 0 ? this.detectorScreenNodes[ activeIndex ].snapshotButton : null;
    };

    const maxLocalRight = Math.max( ...this.detectorScreenNodes.map( detectorScreen => detectorScreen.localBounds.maxX ) );
    const detectorScreenX = controlsRight - maxLocalRight;
    for ( const detectorScreen of this.detectorScreenNodes ) {
      detectorScreen.x = detectorScreenX;
      detectorScreen.y = ExperimentConstants.FRONT_FACING_ROW_TOP;
    }
    this.addChild( new QuantumWaveInterferenceToggleNode( model.sceneProperty, model.scenes, this.detectorScreenNodes ) );

    this.screenSettingsPanel = new ScreenSettingsPanel(
      model.currentDetectionModeProperty,
      model.currentScreenBrightnessProperty,
      mode => formatExperimentDetectorScreenResponse( model, mode ), {
        tandem: tandem.createTandem( 'screenSettingsPanel' )
      }
    );
    this.layoutScreenSettingsPanel();
    this.addChild( this.screenSettingsPanel );

    // Shared expanded state for the graph accordion boxes across all scenes,
    // so that switching scenes preserves the open/closed state per the design requirement.
    this.graphExpandedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'graphExpandedProperty' ),
      phetioFeatured: true
    } );

    this.graphAccordionBoxes = model.scenes.map( scene => new GraphAccordionBox( scene, {
      expandedProperty: this.graphExpandedProperty,
      isRulerVisibleProperty: model.isRulerVisibleProperty,
      detectorScreenScaleIndexProperty: model.detectorScreenScaleIndexProperty,
      tandem: sceneTandems.get( scene )!.createTandem( 'graphAccordionBox' )
    } ) );
    this.addChild( new QuantumWaveInterferenceToggleNode( model.sceneProperty, model.scenes, this.graphAccordionBoxes ) );

    this.layoutGraphAccordionBoxes();

    // Keep the graph below the screen settings panel to avoid overlap and align the chart rectangle to the detector
    // screen rectangle even if labels or scale change.
    this.screenSettingsPanel.localBoundsProperty.link( () => {
      this.layoutScreenSettingsPanel();
      this.layoutGraphAccordionBoxes();
    } );
    this.screenSettingsPanel.visibleProperty.link( () => this.layoutGraphAccordionBoxes() );
    this.graphAccordionBoxes.forEach( graphBox => {
      graphBox.localBoundsProperty.link( () => this.layoutGraphAccordionBoxes() );
    } );
  }

  /**
   * The left edge of the detector screen in the parent coordinate frame, used by ExperimentScreenView
   * to align the middle slit column and to set front-facing screen bounds on the overhead apparatus.
   */
  public get detectorScreenLeft(): number {
    return this.detectorScreenNodes[ 0 ].left;
  }

  private get detectorScreenCenterX(): number {
    return this.detectorScreenNodes[ 0 ].x + ExperimentConstants.DETECTOR_SCREEN_WIDTH / 2;
  }

  /**
   * The right edge of the detector screen in the parent coordinate frame, used by ExperimentScreenView
   * to set front-facing screen bounds on the overhead apparatus.
   */
  public get detectorScreenRight(): number {
    return this.detectorScreenNodes[ 0 ].x + ExperimentConstants.DETECTOR_SCREEN_WIDTH;
  }

  /**
   * The left edge of the bottom controls (graph accordion box) in the parent coordinate frame.
   * ExperimentScreenView aligns the ruler checkbox to this edge so bottom-row controls line up
   * with the graph.
   */
  public get bottomControlsLeft(): number {
    return this.graphAccordionBoxes[ 0 ].left;
  }

  /**
   * Returns detector-screen controls and descriptions for every scene-specific detector screen node. Called by
   * ExperimentScreenViewDescription to place these nodes under the Detector Screen heading in PDOM order.
   */
  public getDetectorScreenPDOMNodes(): Node[] {
    return this.detectorScreenNodes.flatMap( detectorScreen => [
      detectorScreen.horizontalZoomButtonGroup,
      detectorScreen.horizontalZoomButtonGroupParagraphNode,
      detectorScreen.snapshotButton,
      detectorScreen.viewSnapshotsButton
    ] );
  }

  /**
   * Resets view state: collapses all graph accordion boxes and resets each box's internal state
   * (e.g., zoom level). Called by ExperimentScreenView's ResetAllButton listener.
   */
  public reset(): void {
    this.graphExpandedProperty.reset();
    this.graphAccordionBoxes.forEach( box => box.reset() );
  }

  private layoutScreenSettingsPanel(): void {
    const detectorScreen = this.detectorScreenNodes[ 0 ];

    // Skip when the detector screen reports empty (non-finite) bounds, as can happen transiently under PhET-iO fuzz
    // (e.g. fuzzValues hiding the nodes that anchor its bounds); otherwise the computed top would be non-finite and
    // trip an assertion in Node.setTop. A later relayout runs once bounds are valid again.
    if ( detectorScreen.bounds.isFinite() ) {
      this.screenSettingsPanel.centerX = this.detectorScreenCenterX;
      this.screenSettingsPanel.top = detectorScreen.bottom + 8;
    }
  }

  private layoutGraphAccordionBoxes(): void {
    const detectorScreen = this.detectorScreenNodes[ 0 ];

    // Align the graph below the screen settings panel when it is visible with finite bounds, otherwise below the
    // detector screen. Under PhET-iO fuzz the panel can be hidden (all controls off) or transiently collapse to empty
    // bounds while its visibleProperty catches up, and the detector screen can likewise report non-finite bounds. Bail
    // out rather than feed a non-finite value to Node.setTop/setX; a later relayout positions the boxes once bounds
    // settle. See DetectorScreenControls for the same isFinite guard pattern.
    const usePanel = this.screenSettingsPanel.visible && this.screenSettingsPanel.bounds.isFinite();
    if ( !usePanel && !detectorScreen.bounds.isFinite() ) {
      return;
    }
    const referenceBottom = usePanel ? this.screenSettingsPanel.bottom : detectorScreen.bottom;

    this.graphAccordionBoxes.forEach( graphBox => {
      if ( graphBox.bounds.isFinite() ) {
        graphBox.x = this.detectorScreenCenterX - graphBox.getChartAreaLocalBounds().centerX;
        graphBox.top = referenceBottom + 8;
      }
    } );
  }
}

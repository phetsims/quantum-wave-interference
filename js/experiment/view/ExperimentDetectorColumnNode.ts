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
import DetectorScreenNode from './DetectorScreenNode.js';
import GraphAccordionBox from './GraphAccordionBox.js';
import ScreenSettingsPanel from './ScreenSettingsPanel.js';

export default class ExperimentDetectorColumnNode extends Node {

  public readonly detectorScreenNodes: DetectorScreenNode[];
  public readonly graphAccordionBoxes: GraphAccordionBox[];
  public readonly graphExpandedProperty: BooleanProperty;
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
    this.detectorScreenNodes = model.scenes.map( scene => new DetectorScreenNode(
      scene,
      model.detectorScreenScaleIndexProperty,
      model.isPlayingProperty,
      {
        onSnapshotCaptured: startSnapshotFlash,
        tandem: sceneTandems.get( scene )!.createTandem( 'detectorScreenNode' )
      }
    ) );

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
      model.currentIsEmittingProperty, {
        tandem: tandem.createTandem( 'screenSettingsPanel' )
      }
    );
    this.layoutScreenSettingsPanel();
    this.addChild( this.screenSettingsPanel );

    // Shared expanded state for the graph accordion boxes across all scenes,
    // so that switching scenes preserves the open/closed state per the design requirement.
    this.graphExpandedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'graphExpandedProperty' )
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
    this.graphAccordionBoxes.forEach( graphBox => {
      graphBox.localBoundsProperty.link( () => this.layoutGraphAccordionBoxes() );
    } );
  }

  public get detectorScreenLeft(): number {
    return this.detectorScreenNodes[ 0 ].left;
  }

  private get detectorScreenCenterX(): number {
    return this.detectorScreenNodes[ 0 ].x + ExperimentConstants.DETECTOR_SCREEN_WIDTH / 2;
  }

  public get detectorScreenRight(): number {
    return this.detectorScreenNodes[ 0 ].x + ExperimentConstants.DETECTOR_SCREEN_WIDTH;
  }

  public get bottomControlsLeft(): number {
    return this.graphAccordionBoxes[ 0 ].left;
  }

  public getDetectorScreenButtonNodes(): Node[] {
    return this.detectorScreenNodes.flatMap( detectorScreen => [
      detectorScreen.snapshotButton,
      detectorScreen.viewSnapshotsButton
    ] );
  }

  public reset(): void {
    this.graphExpandedProperty.reset();
    this.graphAccordionBoxes.forEach( box => box.reset() );
  }

  private layoutScreenSettingsPanel(): void {
    this.screenSettingsPanel.centerX = this.detectorScreenCenterX;
    this.screenSettingsPanel.top = this.detectorScreenNodes[ 0 ].bottom + 8;
  }

  private layoutGraphAccordionBoxes(): void {
    this.graphAccordionBoxes.forEach( graphBox => {
      graphBox.x = this.detectorScreenCenterX - graphBox.getChartAreaLocalBounds().centerX;
      graphBox.top = this.screenSettingsPanel.bottom + 8;
    } );
  }
}

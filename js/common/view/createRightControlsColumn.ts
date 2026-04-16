// Copyright 2026, University of Colorado Boulder

/**
 * Factory function that creates the right-side controls column shared by the High Intensity and
 * Single Particles screens. The column contains (top to bottom):
 * - Screen controls panel (erase, camera, snapshots buttons + optional extra children + brightness)
 * - Tools panel (screen-specific checkboxes)
 * - Wave display / wave function display combo box
 * - Time controls (play/pause + speed radio buttons)
 * - Reset All button
 *
 * Screen-specific content is injected via options: additional children for the screen controls panel
 * (e.g., detection mode radio buttons on High Intensity) and the tool checkbox list.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import type PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { type MatterWaveDisplayMode, type PhotonWaveDisplayMode } from '../model/WaveDisplayMode.js';
import Snapshot from '../model/Snapshot.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import createBrightnessControl from './createBrightnessControl.js';
import createWaveDisplaySection from './createWaveDisplaySection.js';
import SnapshotButton from './SnapshotButton.js';
import SnapshotIndicatorDotsNode from './SnapshotIndicatorDotsNode.js';
import SnapshotsDialog from './SnapshotsDialog.js';
import ViewSnapshotsButton from './ViewSnapshotsButton.js';

type RightControlsModel = {
  sceneProperty: TReadOnlyProperty<{ sourceType: string }>;
  currentScreenBrightnessProperty: PhetioProperty<number>;
  currentSnapshotsProperty: TReadOnlyProperty<Snapshot[]>;
  currentNumberOfSnapshotsProperty: TReadOnlyProperty<number>;
  currentPhotonWaveDisplayModeProperty: PhetioProperty<PhotonWaveDisplayMode>;
  currentMatterWaveDisplayModeProperty: PhetioProperty<MatterWaveDisplayMode>;
  isPlayingProperty: BooleanProperty;
  timeSpeedProperty: EnumerationProperty<TimeSpeed>;
  reset(): void;
  takeSnapshot(): void;
  deleteSnapshot( snapshot: Snapshot ): void;
};

type CreateRightControlsColumnOptions = {

  // Extra children placed between the button row and the brightness control in the screen controls panel.
  // For example, High Intensity puts its detection mode radio buttons here.
  additionalScreenControlChildren: Node[];

  // The full set of tool checkboxes for the tools panel. Each screen provides its own list because
  // the first and last items differ (intensityGraph vs hitsGraph, optional detector checkbox).
  toolCheckboxes: Node[];

  // Callback for the erase button
  clearScreen: () => void;

  // Callback triggered after a snapshot is successfully captured (used to trigger the detector screen flash)
  onSnapshotCaptured?: () => void;

  // Callback to reset view-only state (zoom levels, plot positions) alongside model.reset()
  resetView?: () => void;
};

type RightControlsColumnResult = {
  rightControlsVBox: VBox;
};

const createRightControlsColumn = (
  model: RightControlsModel,
  listParent: Node,
  tandem: Tandem,
  options: CreateRightControlsColumnOptions
): RightControlsColumnResult => {

  const rightPanelWidth = QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH;

  // --- Screen controls panel ---

  const eraseButton = new EraserButton( {
    listener: options.clearScreen,
    iconWidth: 20,
    tandem: tandem.createTandem( 'eraseButton' )
  } );

  const snapshotsDialog = new SnapshotsDialog(
    model.currentSnapshotsProperty,
    snapshot => model.deleteSnapshot( snapshot ),
    tandem.createTandem( 'snapshotsDialog' )
  );

  const snapshotButton = new SnapshotButton(
    model.currentNumberOfSnapshotsProperty,
    () => model.takeSnapshot(),
    () => { options.onSnapshotCaptured?.(); },
    tandem.createTandem( 'snapshotButton' )
  );

  const viewSnapshotsButton = new ViewSnapshotsButton(
    model.currentNumberOfSnapshotsProperty,
    model.isPlayingProperty,
    snapshotsDialog,
    snapshotButton.width,
    eraseButton.height,
    tandem.createTandem( 'viewSnapshotsButton' )
  );

  const screenButtonsRow = new HBox( {
    spacing: 8,
    children: [ eraseButton, snapshotButton, viewSnapshotsButton ]
  } );

  const indicatorDots = new SnapshotIndicatorDotsNode( model.currentNumberOfSnapshotsProperty );

  const brightnessControl = createBrightnessControl( model.currentScreenBrightnessProperty, tandem );

  const screenControlsChildren: Node[] = [
    indicatorDots,
    screenButtonsRow,
    ...options.additionalScreenControlChildren,
    brightnessControl
  ];

  const screenControlsPanel = new Panel( new VBox( {
    spacing: 12,
    align: 'left',
    children: screenControlsChildren
  } ), {
    fill: QuantumWaveInterferenceColors.panelFillProperty,
    stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
    xMargin: 10,
    yMargin: 10,
    minWidth: rightPanelWidth
  } );

  // --- Tools panel ---

  const toolsPanel = new Panel( new VBox( {
    spacing: 8,
    align: 'left',
    children: options.toolCheckboxes
  } ), {
    fill: QuantumWaveInterferenceColors.panelFillProperty,
    stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
    xMargin: 10,
    yMargin: 10,
    minWidth: rightPanelWidth
  } );

  // --- Wave display combo box ---

  const waveDisplaySection = createWaveDisplaySection( model, listParent, tandem );

  // --- Time controls ---

  const timeControlNode = new TimeControlNode( model.isPlayingProperty, {
    timeSpeedProperty: model.timeSpeedProperty,
    timeSpeeds: [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ],
    flowBoxSpacing: 15,
    playPauseStepButtonOptions: {
      includeStepForwardButton: false,
      playPauseButtonOptions: { radius: 22 }
    },
    tandem: tandem.createTandem( 'timeControlNode' )
  } );

  // --- Reset All ---

  const resetAllButton = new ResetAllButton( {
    listener: () => {
      model.reset();
      options.resetView?.();
    },
    tandem: tandem.createTandem( 'resetAllButton' )
  } );

  // --- Assemble column ---

  const rightControlsVBox = new VBox( {
    spacing: 12,
    align: 'center',
    children: [
      screenControlsPanel,
      toolsPanel,
      waveDisplaySection,
      timeControlNode,
      resetAllButton
    ]
  } );

  return { rightControlsVBox: rightControlsVBox };
};

export default createRightControlsColumn;

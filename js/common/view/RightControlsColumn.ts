// Copyright 2026, University of Colorado Boulder

/**
 * RightControlsColumn is the right-side controls column shared by the High Intensity and
 * Single Particles screens. The column contains (top to bottom):
 * - Screen controls panel (screen/graph switch + optional extra children + brightness + screen buttons)
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
import Dimension2 from '../../../../dot/js/Dimension2.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';
import type { Snapshot } from '../model/Snapshot.js';
import { type MatterWaveDisplayMode, type PhotonWaveDisplayMode } from '../model/WaveDisplayMode.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import BrightnessControl from './BrightnessControl.js';
import SnapshotButton from './SnapshotButton.js';
import SnapshotIndicatorDotsNode from './SnapshotIndicatorDotsNode.js';
import SnapshotsDialog from './SnapshotsDialog.js';
import ViewSnapshotsButton from './ViewSnapshotsButton.js';
import WaveDisplaySection from './WaveDisplaySection.js';

export type RightControlsModel = {
  sceneProperty: TReadOnlyProperty<{ sourceType: string }>;
  currentScreenBrightnessProperty: PhetioProperty<number>;
  currentSnapshotsProperty: TReadOnlyProperty<Snapshot[]>;
  currentNumberOfSnapshotsProperty: TReadOnlyProperty<number>;
  currentPhotonWaveDisplayModeProperty: PhetioProperty<PhotonWaveDisplayMode>;
  currentMatterWaveDisplayModeProperty: PhetioProperty<MatterWaveDisplayMode>;
  isPlayingProperty: BooleanProperty;
  timeSpeedProperty: EnumerationProperty<TimeSpeed>;
  reset(): void;
  stepOnce(): void;
  takeSnapshot(): void;
  deleteSnapshot( snapshot: Snapshot ): void;
};

export type RightControlsColumnOptions = {

  // false = detector screen, true = graph
  screenGraphVisibleProperty: BooleanProperty;

  // Extra children placed between the screen/graph switch and the brightness control in the screen controls panel.
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

  // Callback to step view-only state that should advance with the model's step-forward button.
  onStepForward?: () => void;

  slitSettingDisplayMap?: Partial<Record<SlitConfigurationWithNoBarrier, TReadOnlyProperty<string>>>;
};

export default class RightControlsColumn extends VBox {

  public readonly timeAndResetRow: HBox;

  public constructor(
    model: RightControlsModel,
    listParent: Node,
    tandem: Tandem,
    options: RightControlsColumnOptions
  ) {

    const rightPanelWidth = QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH;

    // --- Screen controls panel ---

    const screenGraphSwitchTandem = tandem.createTandem( 'screenGraphSwitch' );
    const screenGraphSwitch = new ABSwitch<boolean>(
      options.screenGraphVisibleProperty,
      false,
      new Text( QuantumWaveInterferenceFluent.screenGraphSwitch.screenStringProperty, {
        font: new PhetFont( 14 ),
        maxWidth: 70,
        tandem: screenGraphSwitchTandem.createTandem( 'screenLabel' )
      } ),
      true,
      new Text( QuantumWaveInterferenceFluent.screenGraphSwitch.graphStringProperty, {
        font: new PhetFont( 14 ),
        maxWidth: 70,
        tandem: screenGraphSwitchTandem.createTandem( 'graphLabel' )
      } ),
      {
        layoutOptions: { align: 'center' },
        tandem: screenGraphSwitchTandem,
        toggleSwitchOptions: {
          size: new Dimension2( 37, 17 )
        }
      }
    );

    const eraseButton = new EraserButton( {
      listener: options.clearScreen,
      iconWidth: 20,
      tandem: tandem.createTandem( 'eraseButton' )
    } );

    const snapshotsDialog = new SnapshotsDialog(
      model.currentSnapshotsProperty,
      snapshot => model.deleteSnapshot( snapshot ),
      tandem.createTandem( 'snapshotsDialog' ),
      {
        slitSettingDisplayMap: options.slitSettingDisplayMap,
        useFrontFacingHitCoordinates: true
      }
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

    const indicatorDots = new SnapshotIndicatorDotsNode( model.currentNumberOfSnapshotsProperty );

    const snapshotButtonWithDots = new VBox( {
      spacing: 4,
      children: [ indicatorDots, snapshotButton ]
    } );

    const screenButtonsRow = new HBox( {
      align: 'bottom',
      justify: 'spaceEvenly',
      layoutOptions: { stretch: true },
      children: [ eraseButton, snapshotButtonWithDots, viewSnapshotsButton ]
    } );

    const brightnessControl = new BrightnessControl( model.currentScreenBrightnessProperty, tandem );

    options.screenGraphVisibleProperty.link( isGraphVisible => {
      brightnessControl.visible = !isGraphVisible;
      snapshotButtonWithDots.visible = !isGraphVisible;
      viewSnapshotsButton.visible = !isGraphVisible;
    } );

    const screenControlsChildren: Node[] = [
      screenGraphSwitch,
      ...options.additionalScreenControlChildren,
      brightnessControl,
      screenButtonsRow
    ];

    const screenControlsPanel = new Panel( new VBox( {
      spacing: 12,
      stretch: true,
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
      stretch: true,
      children: options.toolCheckboxes
    } ), {
      fill: QuantumWaveInterferenceColors.panelFillProperty,
      stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
      xMargin: 10,
      yMargin: 10,
      minWidth: rightPanelWidth
    } );

    // --- Wave display combo box ---

    const waveDisplaySection = new WaveDisplaySection( model, listParent, tandem );

    // --- Time controls ---

    const timeControlNode = new TimeControlNode( model.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ],
      flowBoxSpacing: 15,
      playPauseStepButtonOptions: {
        includeStepForwardButton: true,
        stepForwardButtonOptions: {
          listener: () => {
            model.stepOnce();
            options.onStepForward?.();
          }
        },
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

    // --- Bottom row: time controls to the left of reset all ---

    const bottomRow = new HBox( {
      spacing: 15,
      align: 'center',
      children: [ timeControlNode, resetAllButton ]
    } );

    // --- Assemble column ---

    super( {
      spacing: 16,
      align: 'center',
      children: [
        screenControlsPanel,
        toolsPanel,
        waveDisplaySection
      ]
    } );

    this.timeAndResetRow = bottomRow;
  }
}

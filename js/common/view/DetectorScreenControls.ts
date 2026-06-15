// Copyright 2026, University of Colorado Boulder

/**
 * DetectorScreenControls is the shared detector-screen controls group for the High Intensity and
 * Single Particles screens. The main controls panel contains (top to bottom):
 * - Screen controls panel (screen/graph switch + optional extra children + brightness + snapshot buttons)
 * - Tools panel (screen-specific checkboxes)
 *
 * Screen-specific content is injected via options: additional children for the screen controls panel
 * (e.g., detection mode radio buttons on High Intensity) and the tool checkbox list.
 * The lower controls are exposed as separate Nodes so their positions can stay fixed when panel heights change.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import type PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import AlignGroup from '../../../../scenery/js/layout/constraints/AlignGroup.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
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
import SnapshotDescriber from './description/SnapshotDescriber.js';
import SnapshotButton from './SnapshotButton.js';
import SnapshotIndicatorDotsNode from './SnapshotIndicatorDotsNode.js';
import SnapshotsDialog from './SnapshotsDialog.js';
import ViewSnapshotsButton from './ViewSnapshotsButton.js';
import WaveDisplaySection from './WaveDisplaySection.js';

/**
 * Model state and actions shared by the detector-screen controls on the High Intensity and Single Particles screens.
 */
export type DetectorScreenControlsModel = {
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

/**
 * Screen-specific controls, callbacks, and snapshot display configuration supplied by each detector screen.
 */
export type DetectorScreenControlsOptions = {

  // false = detector screen, true = graph
  screenGraphVisibleProperty: BooleanProperty;

  // Extra children placed between the screen/graph switch and the brightness control in the screen controls panel.
  // For example, High Intensity puts its detection mode radio buttons here. Instrument these under
  // tandem.createTandem( 'screenControlsPanel' ) so they nest under the panel in the PhET-iO tree.
  additionalScreenControlChildren: Node[];

  // The full set of tool checkboxes for the tools panel. Each screen provides its own list because
  // the first and last items differ (intensityGraph vs hitsGraph, optional detector checkbox).
  // Instrument these under tandem.createTandem( 'toolsPanel' ) so they nest under the panel in the PhET-iO tree.
  toolCheckboxes: Node[];

  // Callback for the erase button
  clearScreen: () => void;

  // Callback triggered after a snapshot is successfully captured (used to trigger the detector screen flash)
  onSnapshotCaptured?: () => void;

  // Callback to reset view-only state (zoom levels, plot positions) alongside model.reset()
  resetView?: () => void;

  // Callback to step view-only state that should advance with the model's step-forward button.
  onStepForward?: () => void;

  // Slit-name convention used for snapshot metadata. Defaults to top/bottom for these front-facing screens.
  slitOrientation?: 'leftRight' | 'topBottom';

  // Maps stored slit configurations to localized labels in snapshot displays. Defaults are used for omitted entries.
  slitSettingDisplayMap?: Partial<Record<SlitConfigurationWithNoBarrier, TReadOnlyProperty<string>>>;
};

export default class DetectorScreenControls extends VBox {

  public readonly bottomButtonsRow: HBox;
  public readonly waveDisplayAndTimeControlsGroup: VBox;
  private readonly resetAllButton: ResetAllButton;

  public constructor(
    model: DetectorScreenControlsModel,
    listParent: Node,
    tandem: Tandem,
    options: DetectorScreenControlsOptions
  ) {

    const rightPanelWidth = QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH;
    const screenGraphSwitchSize = new Dimension2( 37, 17 );
    const playPauseButtonRadius = 22;
    const stepForwardButtonRadius = 15;
    const playPauseStepButtonSpacing = 10;
    const timeControlFlowBoxSpacing = 15;

    const playPauseStepButtonGroupWidth = 2 * playPauseButtonRadius +
                                          2 * stepForwardButtonRadius +
                                          playPauseStepButtonSpacing;

    // Non-label width of a TimeSpeed radio button (circle + stroke + circle-to-label spacing), reserved so the speed
    // labels are clamped to leave room for it. This is intentionally conservative: TimeSpeedRadioButtonGroup derives
    // the circle radius from the label font's text height ( Text( 'test', labelOptions ).height / 2 ), so the true
    // chrome is font-metric dependent (~25.4 px for PhetFont( 14 )) and slightly exceeds a bare-circle estimate. The
    // extra allowance keeps timeControlNode.width within rightPanelWidth across platforms, including the worst case
    // where ?stringTest=xss saturates every label to its maxWidth.
    const timeSpeedRadioButtonChromeWidth = 27;
    const timeSpeedLabelMaxWidth = Math.max( 1, rightPanelWidth -
                                                playPauseStepButtonGroupWidth -
                                                timeControlFlowBoxSpacing -
                                                timeSpeedRadioButtonChromeWidth );

    // ToggleSwitch stroke extends 0.5 px on both sides beyond the requested size.
    const screenGraphSwitchRenderedWidth = screenGraphSwitchSize.width + 1;
    const screenGraphSwitchLabelToggleSpacing = 6;

    // ABSwitch's centered AlignBoxes add a small amount beyond the Text maxWidth.
    const screenGraphSwitchLabelLayoutAllowance = 4;
    const screenGraphSwitchLabelMaxWidth = ( QuantumWaveInterferenceConstants.RIGHT_PANEL_CONTENT_WIDTH -
                                             screenGraphSwitchRenderedWidth -
                                             2 * screenGraphSwitchLabelToggleSpacing -
                                             screenGraphSwitchLabelLayoutAllowance ) / 2;

    // --- Screen controls panel ---

    // Panel tandems group each panel's controls in the PhET-iO tree. The screen views create the same tandems
    // (Tandem.createTandem memoizes children) to nest the injected controls under the panels.
    const screenControlsPanelTandem = tandem.createTandem( 'screenControlsPanel' );
    const toolsPanelTandem = tandem.createTandem( 'toolsPanel' );

    const screenGraphSwitchTandem = screenControlsPanelTandem.createTandem( 'screenGraphSwitch' );
    const screenGraphSwitch = new ABSwitch<boolean>(
      options.screenGraphVisibleProperty,
      false,
      new Text( QuantumWaveInterferenceFluent.screenGraphSwitch.screenStringProperty, {
        font: new PhetFont( 14 ),
        maxWidth: screenGraphSwitchLabelMaxWidth,
        tandem: screenGraphSwitchTandem.createTandem( 'screenLabel' ),
        tandemNameSuffix: 'screenLabel'
      } ),
      true,
      new Text( QuantumWaveInterferenceFluent.screenGraphSwitch.graphStringProperty, {
        font: new PhetFont( 14 ),
        maxWidth: screenGraphSwitchLabelMaxWidth,
        tandem: screenGraphSwitchTandem.createTandem( 'graphLabel' ),
        tandemNameSuffix: 'graphLabel'
      } ),
      {
        spacing: screenGraphSwitchLabelToggleSpacing,
        justify: 'center',
        centerOnSwitch: true,
        layoutOptions: { align: 'center' },
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.screenGraphSwitch.accessibleHelpTextStringProperty,
        tandem: screenGraphSwitchTandem,
        toggleSwitchOptions: {
          size: screenGraphSwitchSize
        }
      }
    );

    const eraseButton = new EraserButton( {
      listener: options.clearScreen,
      iconWidth: QuantumWaveInterferenceConstants.ERASER_BUTTON_ICON_WIDTH,
      minWidth: QuantumWaveInterferenceConstants.ERASER_BUTTON_MIN_WIDTH,
      minHeight: QuantumWaveInterferenceConstants.ERASER_BUTTON_MIN_HEIGHT,
      yMargin: 0,
      tandem: tandem.createTandem( 'eraseButton' )
    } );

    const snapshotsDialog = new SnapshotsDialog(
      model.currentSnapshotsProperty,
      snapshot => model.deleteSnapshot( snapshot ),
      tandem.createTandem( 'snapshotsDialog' ),
      {
        slitOrientation: options.slitOrientation,
        slitSettingDisplayMap: options.slitSettingDisplayMap,
        useFrontFacingHitCoordinates: true,
        getDescription: snapshot => SnapshotDescriber.getDescription( snapshot )
      }
    );

    const snapshotControlsTandem = screenControlsPanelTandem.createTandem( 'snapshotControls' );
    const snapshotButton = new SnapshotButton(
      model.currentNumberOfSnapshotsProperty,
      () => model.takeSnapshot(),
      () => { options.onSnapshotCaptured?.(); },
      snapshotControlsTandem.createTandem( 'snapshotButton' )
    );

    // When the last snapshot is deleted and the dialog auto-closes, return focus to the take-snapshot button.
    snapshotsDialog.getTakeSnapshotButton = () => snapshotButton;

    const viewSnapshotsButton = new ViewSnapshotsButton(
      model.currentNumberOfSnapshotsProperty,
      model.isPlayingProperty,
      snapshotsDialog,
      snapshotButton.width,
      snapshotButton.height,
      snapshotControlsTandem.createTandem( 'viewSnapshotsButton' )
    );

    const indicatorDots = new SnapshotIndicatorDotsNode( model.currentNumberOfSnapshotsProperty );

    const detectorScreenVisibleProperty = DerivedProperty.not( options.screenGraphVisibleProperty );
    const snapshotButtonWithDots = new VBox( {
      spacing: 4,
      children: [ indicatorDots, snapshotButton ]
    } );

    const snapshotControls = new HBox( {
      align: 'bottom',
      justify: 'spaceEvenly',
      children: [ snapshotButtonWithDots, viewSnapshotsButton ],
      tandem: snapshotControlsTandem,
      visiblePropertyOptions: { phetioFeatured: true }
    } );

    const brightnessControl = new BrightnessControl( model.currentScreenBrightnessProperty, screenControlsPanelTandem );
    const brightnessControlWrapper = new AlignBox( brightnessControl, {
      preferredWidth: QuantumWaveInterferenceConstants.RIGHT_PANEL_CONTENT_WIDTH,
      xAlign: 'center',
      visibleProperty: DerivedProperty.and( [ detectorScreenVisibleProperty, brightnessControl.visibleProperty ] )
    } );

    const screenControlsChildren: Node[] = [
      new AlignBox( screenGraphSwitch, {
        preferredWidth: QuantumWaveInterferenceConstants.RIGHT_PANEL_CONTENT_WIDTH,
        xAlign: 'center',
        visibleProperty: screenGraphSwitch.visibleProperty
      } ),
      ...options.additionalScreenControlChildren.map( child => new AlignBox( child, {
        preferredWidth: QuantumWaveInterferenceConstants.RIGHT_PANEL_CONTENT_WIDTH,
        xAlign: 'center',
        visibleProperty: child.visibleProperty
      } ) ),
      brightnessControlWrapper,
      new AlignBox( snapshotControls, {
        preferredWidth: QuantumWaveInterferenceConstants.RIGHT_PANEL_CONTENT_WIDTH,
        xAlign: 'stretch',
        visibleProperty: DerivedProperty.and( [ detectorScreenVisibleProperty, snapshotControls.visibleProperty ] )
      } )
    ];

    const screenControlsPanel = new Panel( new VBox( {
      spacing: 12,
      align: 'center',
      children: screenControlsChildren
    } ), {
      fill: QuantumWaveInterferenceColors.panelFillProperty,
      stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
      xMargin: QuantumWaveInterferenceConstants.RIGHT_PANEL_X_MARGIN,
      yMargin: 10,
      minWidth: rightPanelWidth,
      align: 'center',
      tandem: screenControlsPanelTandem,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );

    // --- Tools panel ---

    // Checkboxes are left-aligned at the panel's left margin (Panel's default align:'left'), with their boxes
    // lined up vertically. The VBox stretches each checkbox to the full panel content width for generous
    // pointer areas.
    const toolsPanel = new Panel( new VBox( {
      spacing: 8,
      align: 'left',
      stretch: true,
      children: options.toolCheckboxes
    } ), {
      fill: QuantumWaveInterferenceColors.panelFillProperty,
      stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
      xMargin: QuantumWaveInterferenceConstants.RIGHT_PANEL_X_MARGIN,
      yMargin: 10,
      minWidth: rightPanelWidth,
      tandem: toolsPanelTandem,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );

    // Keep right-panel backgrounds width-matched when localization makes either panel wider.
    const rightPanelAlignGroup = new AlignGroup( { matchVertical: false } );
    const screenControlsPanelBox = rightPanelAlignGroup.createBox( screenControlsPanel, {
      xAlign: 'stretch',
      visibleProperty: screenControlsPanel.visibleProperty
    } );
    const toolsPanelBox = rightPanelAlignGroup.createBox( toolsPanel, {
      xAlign: 'stretch',
      visibleProperty: toolsPanel.visibleProperty
    } );

    // --- Wave display combo box ---

    const waveDisplaySection = new WaveDisplaySection( model, listParent, tandem );

    // --- Time controls ---

    const timeControlNode = new TimeControlNode( model.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ],
      flowBoxSpacing: timeControlFlowBoxSpacing,
      speedRadioButtonGroupOptions: {
        labelOptions: {
          font: new PhetFont( 14 ),
          maxWidth: timeSpeedLabelMaxWidth
        }
      },
      playPauseStepButtonOptions: {
        includeStepForwardButton: true,
        playPauseStepXSpacing: playPauseStepButtonSpacing,
        stepForwardButtonOptions: {
          radius: stepForwardButtonRadius,
          listener: () => {
            model.stepOnce();
            options.onStepForward?.();
          }
        },
        playPauseButtonOptions: { radius: playPauseButtonRadius }
      },
      tandem: tandem.createTandem( 'timeControlNode' )
    } );
    affirm( timeControlNode.width <= rightPanelWidth + 1e-6,
      `timeControlNode.width=${timeControlNode.width} exceeds rightPanelWidth=${rightPanelWidth}` );

    // --- Reset All ---

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        options.resetView?.();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    // --- Bottom row: eraser button to the left of reset all ---

    const bottomButtonsRow = new HBox( {
      spacing: 15,
      align: 'center',
      children: [ eraseButton, resetAllButton ]
    } );

    // Keep wave display and time controls together, but outside this VBox's flowing panel layout.
    // This prevents right-panel content changes from pushing these controls toward the bottom buttons.
    const waveDisplayAndTimeControlsGroup = new VBox( {
      spacing: QuantumWaveInterferenceConstants.WAVE_DISPLAY_AND_TIME_CONTROLS_SPACING,
      align: 'center',
      children: [ waveDisplaySection, timeControlNode ]
    } );

    // --- Assemble column ---

    super( {
      spacing: 16,
      align: 'center',
      children: [
        screenControlsPanelBox,
        toolsPanelBox
      ]
    } );

    this.bottomButtonsRow = bottomButtonsRow;
    this.waveDisplayAndTimeControlsGroup = waveDisplayAndTimeControlsGroup;
    this.resetAllButton = resetAllButton;
  }

  /**
   * Aligns Reset All exactly to the screen margin, even though the neighboring eraser button has a shorter background.
   */
  public positionBottomButtonsRow( right: number, resetAllButtonBottom: number ): void {
    if ( this.bottomButtonsRow.bounds.isFinite() ) {
      this.bottomButtonsRow.right = right;
      if ( this.resetAllButton.bounds.isFinite() ) {
        this.bottomButtonsRow.centerY = resetAllButtonBottom - this.resetAllButton.height / 2;
      }
      else {
        this.bottomButtonsRow.centerY = resetAllButtonBottom - this.bottomButtonsRow.height / 2;
      }
    }
  }

  /**
   * Positions the non-panel lower controls from the bottom button row so panel height changes do not affect them.
   * Locale changes can make the time-speed radio buttons wider than the right panels, so maxRight keeps the group
   * within the screen's right padding while preserving the normal centered placement when there is enough room.
   */
  public positionWaveDisplayAndTimeControlsGroup( centerX: number, maxRight: number, fallbackBottom: number ): void {
    if ( this.waveDisplayAndTimeControlsGroup.bounds.isFinite() ) {
      const bottom = this.bottomButtonsRow.bounds.isFinite() ?
                     this.bottomButtonsRow.top :
                     fallbackBottom;
      this.waveDisplayAndTimeControlsGroup.bottom = bottom -
                                                    QuantumWaveInterferenceConstants.WAVE_DISPLAY_AND_TIME_CONTROLS_BOTTOM_OFFSET;

      // Choose one horizontal position per constraint update. Centering and then clamping would oscillate because the
      // ManualConstraint observes this group's bounds and would immediately re-run after each position change.
      const centeredRight = centerX + this.waveDisplayAndTimeControlsGroup.width / 2;
      if ( centeredRight > maxRight ) {
        this.waveDisplayAndTimeControlsGroup.right = maxRight;
      }
      else {
        this.waveDisplayAndTimeControlsGroup.centerX = centerX;
      }
    }
  }
}

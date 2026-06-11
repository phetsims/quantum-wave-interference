// Copyright 2026, University of Colorado Boulder

/**
 * SlitControlPanel is the panel beneath the front-facing slit view that provides controls for the double-slit geometry:
 * - Slit separation NumberControl
 * - Screen distance NumberControl
 * - Slit settings ComboBox (Both open, Left covered, Right covered, Left detector, Right detector)
 *
 * The NumberControl ranges update when the scene changes, since each source type has different physical scales.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceToggleNode from '../../common/view/QuantumWaveInterferenceToggleNode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import ScreenDistanceControl from './ScreenDistanceControl.js';
import SlitSeparationControl from './SlitSeparationControl.js';
import SlitSettingsComboBox from './SlitSettingsComboBox.js';

const SLIT_SETTINGS_TITLE_FONT = new PhetFont( 14 );
const PANEL_CONTENT_SPACING = 20;
const SLIT_SETTINGS_SECTION_SPACING = 6;
const PANEL_WIDTH = ExperimentConstants.FRONT_FACING_SLIT_VIEW_WIDTH + 20;
const PANEL_MIN_HEIGHT = 270;

type SelfOptions = EmptySelfOptions;

// tandem is required so each scene's child controls are properly instrumented for PhET-iO.
type SlitControlPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem'>;

export default class SlitControlPanel extends Panel {

  /**
   * @param sceneProperty - the currently selected scene; drives which scene's controls are visible
   * @param scenes - all scenes; must be the complete set so a control node is created for every scene
   * @param sceneTandems - maps each SceneModel to its PhET-iO Tandem; must contain an entry for every element of scenes
   * @param comboBoxParent - scene graph ancestor used as the popup parent for the slit settings ComboBox list
   * @param providedOptions
   */
  public constructor(
    sceneProperty: Property<SceneModel>,
    scenes: SceneModel[],
    sceneTandems: ReadonlyMap<object, Tandem>,
    comboBoxParent: Node,
    providedOptions: SlitControlPanelOptions
  ) {
    const options = optionize<SlitControlPanelOptions, SelfOptions, PanelOptions>()(
      {
        isDisposable: false,
        xMargin: 14,
        yMargin: 8,
        fill: QuantumWaveInterferenceColors.panelFillProperty,
        stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
        minWidth: PANEL_WIDTH,
        maxWidth: PANEL_WIDTH,
        minHeight: PANEL_MIN_HEIGHT
      },
      providedOptions
    );

    // Create the content for each scene (different NumberControl ranges per scene), swap visibility.
    const sceneNodes: Node[] = [];

    for ( const scene of scenes ) {
      const sceneContent = SlitControlPanel.createSceneContent( scene, comboBoxParent, sceneTandems.get( scene )! );
      sceneNodes.push( sceneContent );
    }

    // Keep all scene content in bounds, preventing layout shifts when switching scenes.
    const contentNode = new QuantumWaveInterferenceToggleNode( sceneProperty, scenes, sceneNodes );

    super( contentNode, options );
  }

  /**
   * Creates the slit control content for a single scene.
   */
  private static createSceneContent(
    scene: SceneModel,
    comboBoxParent: Node,
    tandem: SlitControlPanelOptions['tandem']
  ): Node {
    const slitSeparationControl = new SlitSeparationControl( scene.slitSeparationProperty, scene.slitSeparationRange, scene.sourceType, {
      tandem: tandem.createTandem( 'slitSeparationControl' )
    } );

    const screenDistanceControl = new ScreenDistanceControl( scene, {
      tandem: tandem.createTandem( 'screenDistanceControl' )
    } );

    const slitSettingsLabel = new Text( QuantumWaveInterferenceFluent.slitConfigurationStringProperty, {
      font: SLIT_SETTINGS_TITLE_FONT,
      maxWidth: 170
    } );

    const slitSettingsComboBox = new SlitSettingsComboBox( scene.slitSettingProperty, comboBoxParent, {
      tandem: tandem.createTandem( 'slitSettingsComboBox' )
    } );

    const slitSettingsSection = new VBox( {
      spacing: SLIT_SETTINGS_SECTION_SPACING,
      align: 'center',
      children: [ slitSettingsLabel, slitSettingsComboBox ]
    } );

    return new VBox( {
      spacing: PANEL_CONTENT_SPACING,
      align: 'center',
      children: [ slitSeparationControl, screenDistanceControl, slitSettingsSection ]
    } );
  }

}

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
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import linkSceneVisibility from '../../common/view/linkSceneVisibility.js';
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

type SlitControlPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem'>;

export default class SlitControlPanel extends Panel {
  public constructor(
    sceneProperty: Property<SceneModel>,
    scenes: SceneModel[],
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
      const sceneContent = SlitControlPanel.createSceneContent(
        scene,
        comboBoxParent,
        options.tandem
      );
      sceneContent.visible = scene === sceneProperty.value;
      sceneNodes.push( sceneContent );
    }

    // Container node holds all scene content; only the active one is visible. excludeInvisibleChildrenFromBounds:
    // false ensures the panel sizes to the widest content across all scenes, preventing layout shifts when switching
    // scenes.
    const contentNode = new Node( {
      children: sceneNodes,
      excludeInvisibleChildrenFromBounds: false
    } );

    super( contentNode, options );

    linkSceneVisibility( sceneProperty, scenes, sceneNodes );
  }

  /**
   * Creates the slit control content for a single scene.
   */
  private static createSceneContent(
    scene: SceneModel,
    comboBoxParent: Node,
    tandem: SlitControlPanelOptions['tandem']
  ): Node {
    const sceneTandemName = scene.sourceType;

    const slitSeparationControl = new SlitSeparationControl( scene, {
      tandem: tandem.createTandem( `${sceneTandemName}SlitSeparationControl` )
    } );

    const screenDistanceControl = new ScreenDistanceControl( scene, {
      tandem: tandem.createTandem( `${sceneTandemName}ScreenDistanceControl` )
    } );

    const slitSettingsLabel = new Text( QuantumWaveInterferenceFluent.slitConfigurationStringProperty, {
      font: SLIT_SETTINGS_TITLE_FONT,
      maxWidth: 170
    } );

    const slitSettingsComboBox = new SlitSettingsComboBox( scene, comboBoxParent, {
      tandem: tandem.createTandem( `${sceneTandemName}SlitSettingsComboBox` )
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

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
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { metersUnit } from '../../../../scenery-phet/js/units/metersUnit.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox, { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import { type SlitConfiguration } from '../../common/model/SlitConfiguration.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import linkSceneVisibility from '../../common/view/linkSceneVisibility.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import SlitSeparationControl from './SlitSeparationControl.js';

const TITLE_FONT = new PhetFont( 14 );
const TICK_LABEL_FONT = new PhetFont( 12 );
const SLIDER_TRACK_SIZE = new Dimension2( 150, 3 );
const SLIT_SETTINGS_TITLE_FONT = new PhetFont( 14 );
const COMBO_BOX_FONT = new PhetFont( 14 );
const NUMBER_CONTROL_Y_SPACING = 8;
const ARROW_BUTTONS_X_SPACING = 6;
const PANEL_CONTENT_SPACING = 20;
const SLIT_SETTINGS_SECTION_SPACING = 6;
const PANEL_WIDTH = ExperimentConstants.FRONT_FACING_SLIT_VIEW_WIDTH + 20;
const PANEL_MIN_HEIGHT = 270;
const SCREEN_DISTANCE_DECIMAL_PLACES = 2;
const SCREEN_DISTANCE_DELTA = 0.01;

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

    // Screen distance NumberControl
    const screenDistanceRange = scene.screenDistanceRange;

    //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Factor out screenDistanceControl extends NumberControl
    const screenDistanceControl = new NumberControl(
      QuantumWaveInterferenceFluent.screenDistanceStringProperty,
      scene.screenDistanceProperty,
      screenDistanceRange,
      {
        delta: SCREEN_DISTANCE_DELTA,
        titleNodeOptions: {
          font: TITLE_FONT,
          maxWidth: 150
        },
        numberDisplayOptions: {
          decimalPlaces: SCREEN_DISTANCE_DECIMAL_PLACES,
          valuePattern: {
            visualPattern: metersUnit.visualSymbolPatternStringProperty!,
            accessiblePattern: metersUnit.accessiblePattern!
          },
          textOptions: {
            font: new PhetFont( 14 )
          },
          maxWidth: 100
        },
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.screenDistanceSlider.accessibleHelpTextStringProperty,
        sliderOptions: {
          trackSize: SLIDER_TRACK_SIZE,
          thumbSize: new Dimension2( 13, 22 ),
          majorTickLength: 12,
          majorTicks: SlitControlPanel.createNumericTicks( screenDistanceRange, SCREEN_DISTANCE_DECIMAL_PLACES )
        },
        layoutFunction: NumberControl.createLayoutFunction1( {
          ySpacing: NUMBER_CONTROL_Y_SPACING,
          arrowButtonsXSpacing: ARROW_BUTTONS_X_SPACING
        } ),
        tandem: tandem.createTandem( `${sceneTandemName}ScreenDistanceControl` )
      }
    );

    //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Factor out SlitSettingsComboBox. There is too much inlined here.

    // Slit settings ComboBox
    const slitSettingsLabel = new Text( QuantumWaveInterferenceFluent.slitConfigurationStringProperty, {
      font: SLIT_SETTINGS_TITLE_FONT,
      maxWidth: 170
    } );

    const comboBoxItems: ComboBoxItem<SlitConfiguration>[] = [
      {
        value: 'bothOpen',
        createNode: () =>
          new Text( QuantumWaveInterferenceFluent.bothOpenStringProperty, {
            font: COMBO_BOX_FONT,
            maxWidth: 150
          } ),
        tandemName: 'bothOpenItem'
      },
      {
        value: 'leftCovered',
        createNode: () =>
          new Text( QuantumWaveInterferenceFluent.coverLeftStringProperty, {
            font: COMBO_BOX_FONT,
            maxWidth: 150
          } ),
        tandemName: 'leftCoveredItem',
        separatorBefore: true
      },
      {
        value: 'rightCovered',
        createNode: () =>
          new Text( QuantumWaveInterferenceFluent.coverRightStringProperty, {
            font: COMBO_BOX_FONT,
            maxWidth: 150
          } ),
        tandemName: 'rightCoveredItem'
      },
      {
        value: 'leftDetector',
        createNode: () =>
          new Text( QuantumWaveInterferenceFluent.detectorLeftStringProperty, {
            font: COMBO_BOX_FONT,
            maxWidth: 150
          } ),
        tandemName: 'leftDetectorItem',
        separatorBefore: true
      },
      {
        value: 'rightDetector',
        createNode: () =>
          new Text( QuantumWaveInterferenceFluent.detectorRightStringProperty, {
            font: COMBO_BOX_FONT,
            maxWidth: 150
          } ),
        tandemName: 'rightDetectorItem'
      },
      {
        value: 'bothDetectors',
        createNode: () =>
          new Text( QuantumWaveInterferenceFluent.detectorBothStringProperty, {
            font: COMBO_BOX_FONT,
            maxWidth: 150
          } ),
        tandemName: 'bothDetectorsItem'
      }
    ];

    const slitSettingsContextResponseProperty = QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleContextResponse.createProperty( {
      slitSetting: scene.slitSettingProperty
    } );

    const slitSettingsComboBox = new ComboBox(
      scene.slitSettingProperty,
      comboBoxItems,
      comboBoxParent,
      {
        xMargin: 16,
        yMargin: 8,
        listPosition: 'above',
        accessibleName: QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleNameStringProperty,
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleHelpTextStringProperty,
        accessibleContextResponse: slitSettingsContextResponseProperty,
        tandem: tandem.createTandem( `${sceneTandemName}SlitSettingsComboBox` )
      }
    );

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

  /**
   * Creates major tick marks with numeric labels showing the min and max values of the range.
   * Uses minimal decimal places needed to represent the values without trailing zeros.
   */
  private static createNumericTicks( range: Range, decimalPlaces?: number ): { value: number; label: Node }[] {
    // Use consistent decimal places across both tick labels so they visually match. E.g., for range 0.2–1.0 mm,
    // both ticks should show 1 decimal place: "0.2" and "1.0".
    const tickDecimalPlaces = decimalPlaces ?? Math.max(
      ExperimentConstants.getDecimalPlacesForValue( range.min ),
      ExperimentConstants.getDecimalPlacesForValue( range.max )
    );

    return [
      {
        value: range.min,
        label: new Text( toFixed( range.min, tickDecimalPlaces ), {
          font: TICK_LABEL_FONT,
          maxWidth: 40
        } )
      },
      {
        value: range.max,
        label: new Text( toFixed( range.max, tickDecimalPlaces ), {
          font: TICK_LABEL_FONT,
          maxWidth: 40
        } )
      }
    ];
  }

}

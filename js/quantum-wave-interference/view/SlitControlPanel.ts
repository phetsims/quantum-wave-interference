// Copyright 2026, University of Colorado Boulder

/**
 * SlitControlPanel is the panel in the bottom row that provides controls for the double-slit geometry:
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
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox, { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';
import SlitSetting from '../model/SlitSetting.js';

const TITLE_FONT = new PhetFont( 14 );
const TICK_LABEL_FONT = new PhetFont( 12 );
const SLIDER_TRACK_SIZE = new Dimension2( 130, 3 );
const COMBO_BOX_FONT = new PhetFont( 13 );

type SelfOptions = EmptySelfOptions;

type SlitControlPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem'>;

export default class SlitControlPanel extends Panel {

  public constructor( sceneProperty: Property<SceneModel>, scenes: SceneModel[],
                      comboBoxParent: Node, providedOptions: SlitControlPanelOptions ) {

    const options = optionize<SlitControlPanelOptions, SelfOptions, PanelOptions>()( {
      xMargin: 10,
      yMargin: 10,
      fill: 'rgb( 230, 230, 230 )',
      stroke: 'gray',
      minWidth: 200
    }, providedOptions );

    // Create the content for each scene (different NumberControl ranges per scene), swap visibility.
    const sceneNodes: Node[] = [];

    for ( const scene of scenes ) {
      const sceneContent = SlitControlPanel.createSceneContent( scene, comboBoxParent, options.tandem );
      sceneContent.visible = ( scene === sceneProperty.value );
      sceneNodes.push( sceneContent );
    }

    // Container node holds all scene content; only the active one is visible
    const contentNode = new Node( {
      children: sceneNodes
    } );

    super( contentNode, options );

    // Switch visibility when the scene changes
    sceneProperty.link( activeScene => {
      for ( let i = 0; i < scenes.length; i++ ) {
        sceneNodes[ i ].visible = ( scenes[ i ] === activeScene );
      }
    } );
  }

  /**
   * Creates the slit control content for a single scene.
   */
  private static createSceneContent( scene: SceneModel, comboBoxParent: Node,
                                     tandem: SlitControlPanelOptions['tandem'] ): Node {

    const sceneTandemName = scene.sourceType.tandemName;

    // Slit separation NumberControl
    const slitSeparationRange = scene.slitSeparationRange;
    const slitSeparationDecimalPlaces = SlitControlPanel.getDecimalPlaces( slitSeparationRange );
    const slitSeparationDelta = SlitControlPanel.getDelta( slitSeparationRange );

    const slitSeparationControl = new NumberControl(
      QuantumWaveInterferenceFluent.slitSeparationStringProperty,
      scene.slitSeparationProperty,
      slitSeparationRange,
      {
        delta: slitSeparationDelta,
        titleNodeOptions: {
          font: TITLE_FONT,
          maxWidth: 120
        },
        numberDisplayOptions: {
          decimalPlaces: slitSeparationDecimalPlaces,
          valuePattern: QuantumWaveInterferenceFluent.slitSeparationPatternStringProperty,
          textOptions: {
            font: new PhetFont( 13 )
          },
          maxWidth: 100
        },
        sliderOptions: {
          trackSize: SLIDER_TRACK_SIZE,
          thumbSize: new Dimension2( 13, 22 ),
          majorTickLength: 12,
          majorTicks: [
            {
              value: slitSeparationRange.min,
              label: new Text( QuantumWaveInterferenceFluent.minStringProperty, {
                font: TICK_LABEL_FONT,
                maxWidth: 30
              } )
            },
            {
              value: slitSeparationRange.max,
              label: new Text( QuantumWaveInterferenceFluent.maxStringProperty, {
                font: TICK_LABEL_FONT,
                maxWidth: 30
              } )
            }
          ]
        },
        layoutFunction: NumberControl.createLayoutFunction3( { ySpacing: 3 } ),
        tandem: tandem.createTandem( `${sceneTandemName}SlitSeparationControl` )
      }
    );

    // Screen distance NumberControl
    const screenDistanceRange = scene.screenDistanceRange;
    const screenDistanceDecimalPlaces = SlitControlPanel.getDecimalPlaces( screenDistanceRange );
    const screenDistanceDelta = SlitControlPanel.getDelta( screenDistanceRange );

    const screenDistanceControl = new NumberControl(
      QuantumWaveInterferenceFluent.screenDistanceStringProperty,
      scene.screenDistanceProperty,
      screenDistanceRange,
      {
        delta: screenDistanceDelta,
        titleNodeOptions: {
          font: TITLE_FONT,
          maxWidth: 120
        },
        numberDisplayOptions: {
          decimalPlaces: screenDistanceDecimalPlaces,
          valuePattern: QuantumWaveInterferenceFluent.screenDistancePatternStringProperty,
          textOptions: {
            font: new PhetFont( 13 )
          },
          maxWidth: 100
        },
        sliderOptions: {
          trackSize: SLIDER_TRACK_SIZE,
          thumbSize: new Dimension2( 13, 22 ),
          majorTickLength: 12,
          majorTicks: [
            {
              value: screenDistanceRange.min,
              label: new Text( QuantumWaveInterferenceFluent.minStringProperty, {
                font: TICK_LABEL_FONT,
                maxWidth: 30
              } )
            },
            {
              value: screenDistanceRange.max,
              label: new Text( QuantumWaveInterferenceFluent.maxStringProperty, {
                font: TICK_LABEL_FONT,
                maxWidth: 30
              } )
            }
          ]
        },
        layoutFunction: NumberControl.createLayoutFunction3( { ySpacing: 3 } ),
        tandem: tandem.createTandem( `${sceneTandemName}ScreenDistanceControl` )
      }
    );

    // Slit settings ComboBox
    const slitSettingsLabel = new Text( QuantumWaveInterferenceFluent.slitSettingsStringProperty, {
      font: TITLE_FONT,
      maxWidth: 120
    } );

    const comboBoxItems: ComboBoxItem<SlitSetting>[] = [
      {
        value: SlitSetting.BOTH_OPEN,
        createNode: () => new Text( QuantumWaveInterferenceFluent.bothOpenStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ),
        tandemName: 'bothOpenItem'
      },
      {
        value: SlitSetting.LEFT_COVERED,
        createNode: () => new Text( QuantumWaveInterferenceFluent.leftCoveredStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ),
        tandemName: 'leftCoveredItem'
      },
      {
        value: SlitSetting.RIGHT_COVERED,
        createNode: () => new Text( QuantumWaveInterferenceFluent.rightCoveredStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ),
        tandemName: 'rightCoveredItem'
      },
      {
        value: SlitSetting.LEFT_DETECTOR,
        createNode: () => new Text( QuantumWaveInterferenceFluent.leftDetectorStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ),
        tandemName: 'leftDetectorItem'
      },
      {
        value: SlitSetting.RIGHT_DETECTOR,
        createNode: () => new Text( QuantumWaveInterferenceFluent.rightDetectorStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ),
        tandemName: 'rightDetectorItem'
      }
    ];

    const slitSettingsComboBox = new ComboBox( scene.slitSettingProperty, comboBoxItems, comboBoxParent, {
      xMargin: 10,
      yMargin: 5,
      tandem: tandem.createTandem( `${sceneTandemName}SlitSettingsComboBox` )
    } );

    return new VBox( {
      spacing: 12,
      align: 'center',
      children: [
        slitSeparationControl,
        screenDistanceControl,
        slitSettingsLabel,
        slitSettingsComboBox
      ]
    } );
  }

  /**
   * Determines appropriate decimal places based on the range magnitude.
   */
  private static getDecimalPlaces( range: { min: number; max: number } ): number {
    const span = range.max - range.min;
    if ( span < 0.1 ) {
      return 4;
    }
    else if ( span < 1 ) {
      return 3;
    }
    else if ( span < 10 ) {
      return 1;
    }
    return 0;
  }

  /**
   * Determines an appropriate delta (step size) for a NumberControl based on the range.
   */
  private static getDelta( range: { min: number; max: number } ): number {
    return ( range.max - range.min ) / 100;
  }
}

quantumWaveInterference.register( 'SlitControlPanel', SlitControlPanel );

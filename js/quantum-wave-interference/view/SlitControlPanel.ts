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
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
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
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
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

    // Container node holds all scene content; only the active one is visible.
    // excludeInvisibleChildrenFromBounds: false ensures the panel sizes to the widest
    // content across all scenes, preventing layout shifts when switching scenes.
    const contentNode = new Node( {
      children: sceneNodes,
      excludeInvisibleChildrenFromBounds: false
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

    // Slit separation NumberControl.
    // For scenes with very small slit separations (max < 0.1 mm), display in μm instead of mm
    // for readability. E.g., "10 μm" instead of "0.010 mm" for the electron/helium atom scenes.
    const slitSeparationRange = scene.slitSeparationRange;
    const usesMicrometers = slitSeparationRange.max <= 0.1; // mm threshold for switching to μm

    let slitSeparationNumberDisplayOptions;
    let slitSeparationTicks;
    let slitSeparationDelta;

    if ( usesMicrometers ) {
      // Display in μm: convert mm values to μm (×1000) for the number display and ticks
      const mmToMicrometerDecimalPlaces = SlitControlPanel.getDecimalPlaces(
        new Range( slitSeparationRange.min * 1000, slitSeparationRange.max * 1000 )
      );
      slitSeparationDelta = SlitControlPanel.getDelta( slitSeparationRange );
      slitSeparationNumberDisplayOptions = {
        numberFormatter: ( valueMM: number ) => {
          const valueUM = valueMM * 1000;
          return StringUtils.fillIn( QuantumWaveInterferenceFluent.slitSeparationMicrometerPatternStringProperty.value, {
            value: Utils.toFixed( valueUM, mmToMicrometerDecimalPlaces )
          } );
        },
        textOptions: {
          font: new PhetFont( 13 )
        },
        maxWidth: 100
      };
      slitSeparationTicks = SlitControlPanel.createMicrometerTicks( slitSeparationRange );
    }
    else {
      const slitSeparationDecimalPlaces = SlitControlPanel.getDecimalPlaces( slitSeparationRange );
      slitSeparationDelta = SlitControlPanel.getDelta( slitSeparationRange );
      slitSeparationNumberDisplayOptions = {
        decimalPlaces: slitSeparationDecimalPlaces,
        valuePattern: QuantumWaveInterferenceFluent.slitSeparationPatternStringProperty,
        textOptions: {
          font: new PhetFont( 13 )
        },
        maxWidth: 100
      };
      slitSeparationTicks = SlitControlPanel.createNumericTicks( slitSeparationRange );
    }

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
        numberDisplayOptions: slitSeparationNumberDisplayOptions,
        sliderOptions: {
          trackSize: SLIDER_TRACK_SIZE,
          thumbSize: new Dimension2( 13, 22 ),
          majorTickLength: 12,
          majorTicks: slitSeparationTicks
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
          majorTicks: SlitControlPanel.createNumericTicks( screenDistanceRange )
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
   * Creates major tick marks with μm labels for slit separation ranges that are in the micrometer scale.
   * The range is in mm but the labels display the values converted to μm for readability.
   */
  private static createMicrometerTicks( range: Range ): { value: number; label: Node }[] {

    // Use consistent decimal places across both tick labels so they visually match.
    // E.g., for range 0.5–1.0 μm, both ticks should show 1 decimal place: "0.5" and "1.0".
    const minUM = range.min * 1000;
    const maxUM = range.max * 1000;
    const decimalPlaces = Math.max(
      SlitControlPanel.getTickDecimalPlaces( minUM ),
      SlitControlPanel.getTickDecimalPlaces( maxUM )
    );

    return [
      {
        value: range.min,
        label: new Text( Utils.toFixed( minUM, decimalPlaces ), {
          font: TICK_LABEL_FONT,
          maxWidth: 40
        } )
      },
      {
        value: range.max,
        label: new Text( Utils.toFixed( maxUM, decimalPlaces ), {
          font: TICK_LABEL_FONT,
          maxWidth: 40
        } )
      }
    ];
  }

  /**
   * Creates major tick marks with numeric labels showing the min and max values of the range.
   * Uses minimal decimal places needed to represent the values without trailing zeros.
   */
  private static createNumericTicks( range: Range ): { value: number; label: Node }[] {

    // Use consistent decimal places across both tick labels so they visually match.
    // E.g., for range 0.2–1.0 mm, both ticks should show 1 decimal place: "0.2" and "1.0".
    const decimalPlaces = Math.max(
      SlitControlPanel.getTickDecimalPlaces( range.min ),
      SlitControlPanel.getTickDecimalPlaces( range.max )
    );

    return [
      {
        value: range.min,
        label: new Text( Utils.toFixed( range.min, decimalPlaces ), {
          font: TICK_LABEL_FONT,
          maxWidth: 40
        } )
      },
      {
        value: range.max,
        label: new Text( Utils.toFixed( range.max, decimalPlaces ), {
          font: TICK_LABEL_FONT,
          maxWidth: 40
        } )
      }
    ];
  }

  /**
   * Determines the number of decimal places needed to display a tick value without trailing zeros.
   * For example, 0.2 -> 1, 0.002 -> 3, 5.0 -> 1, 0.1 -> 1
   */
  private static getTickDecimalPlaces( value: number ): number {
    if ( value === Math.floor( value ) ) {
      return 0;
    }
    // Convert to string, find decimals needed
    const str = value.toString();
    const decimalIndex = str.indexOf( '.' );
    if ( decimalIndex === -1 ) {
      return 0;
    }
    return str.length - decimalIndex - 1;
  }

  /**
   * Determines appropriate decimal places based on the precision needed to represent the range
   * boundary values. Uses the maximum number of decimal places from the min and max values.
   */
  private static getDecimalPlaces( range: Range ): number {
    return Math.max(
      SlitControlPanel.getTickDecimalPlaces( range.min ),
      SlitControlPanel.getTickDecimalPlaces( range.max )
    );
  }

  /**
   * Determines an appropriate delta (step size) for a NumberControl based on the decimal
   * precision of the range boundaries. The step size is the smallest increment representable
   * at that precision (e.g., 1 decimal place → delta = 0.1).
   */
  private static getDelta( range: Range ): number {
    const decimalPlaces = SlitControlPanel.getDecimalPlaces( range );
    return Math.pow( 10, -decimalPlaces );
  }
}

quantumWaveInterference.register( 'SlitControlPanel', SlitControlPanel );

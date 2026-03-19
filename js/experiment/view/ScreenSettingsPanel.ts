// Copyright 2026, University of Colorado Boulder

/**
 * ScreenSettingsPanel contains the detection mode radio buttons ('Average intensity' vs 'Hits')
 * and a 'Screen brightness' slider. These controls affect the display on the detector screen.
 *
 * Each scene has its own detectionModeProperty and screenBrightnessProperty, so DynamicProperty
 * is used to follow the active scene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type DetectionMode } from '../model/DetectionMode.js';
import SceneModel from '../model/SceneModel.js';

const TITLE_FONT = new PhetFont( 14 );
const LABEL_FONT = new PhetFont( 13 );
const TICK_LABEL_FONT = new PhetFont( 12 );

type SelfOptions = EmptySelfOptions;

type ScreenSettingsPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem'>;

export default class ScreenSettingsPanel extends Panel {

  public constructor( sceneProperty: Property<SceneModel>,
                      providedOptions: ScreenSettingsPanelOptions ) {

    const options = optionize<ScreenSettingsPanelOptions, SelfOptions, PanelOptions>()( {
      xMargin: 10,
      yMargin: 10,
      fill: '#f4f4f4',
      stroke: '#c1c1c1'
    }, providedOptions );

    // DynamicProperty that follows the active scene's detectionModeProperty
    const detectionModeProperty = new DynamicProperty<DetectionMode, DetectionMode, SceneModel>( sceneProperty, {
      derive: scene => scene.detectionModeProperty,
      bidirectional: true
    } );

    // DynamicProperty that follows the active scene's screenBrightnessProperty
    const screenBrightnessProperty = new DynamicProperty<number, number, SceneModel>( sceneProperty, {
      derive: scene => scene.screenBrightnessProperty,
      bidirectional: true
    } );

    // Radio buttons for Average Intensity vs Hits
    const radioButtonItems: AquaRadioButtonGroupItem<DetectionMode>[] = [
      {
        value: 'averageIntensity',
        createNode: () => new Text( QuantumWaveInterferenceFluent.averageIntensityStringProperty, {
          font: LABEL_FONT,
          maxWidth: 130
        } ),
        tandemName: 'averageIntensityRadioButton'
      },
      {
        value: 'hits',
        createNode: () => new Text( QuantumWaveInterferenceFluent.hitsStringProperty, {
          font: LABEL_FONT,
          maxWidth: 130
        } ),
        tandemName: 'hitsRadioButton'
      }
    ];

    const detectionModeRadioButtonGroup = new AquaRadioButtonGroup<DetectionMode>( detectionModeProperty, radioButtonItems, {
      spacing: 8,
      align: 'left',
      orientation: 'vertical',
      radioButtonOptions: {
        radius: 7
      },
      touchAreaXDilation: 10,
      mouseAreaXDilation: 10,
      tandem: options.tandem.createTandem( 'detectionModeRadioButtonGroup' )
    } );

    // Screen brightness slider
    const brightnessLabel = new Text( QuantumWaveInterferenceFluent.screenBrightnessStringProperty, {
      font: TITLE_FONT,
      maxWidth: 140
    } );

    const brightnessRange = new Range( 0, 1 );
    const brightnessSlider = new HSlider( screenBrightnessProperty, brightnessRange, {
      trackSize: new Dimension2( 130, 3 ),
      thumbSize: new Dimension2( 13, 22 ),
      majorTickLength: 12,
      tandem: options.tandem.createTandem( 'brightnessSlider' )
    } );

    brightnessSlider.addMajorTick( 0, new Text( QuantumWaveInterferenceFluent.minStringProperty, {
      font: TICK_LABEL_FONT,
      maxWidth: 40
    } ) );
    brightnessSlider.addMajorTick( 1, new Text( QuantumWaveInterferenceFluent.maxStringProperty, {
      font: TICK_LABEL_FONT,
      maxWidth: 40
    } ) );

    const brightnessControl = new VBox( {
      spacing: 2,
      children: [ brightnessLabel, brightnessSlider ]
    } );

    const content = new VBox( {
      spacing: 10,
      align: 'left',
      children: [ detectionModeRadioButtonGroup, brightnessControl ]
    } );

    super( content, options );
  }
}

quantumWaveInterference.register( 'ScreenSettingsPanel', ScreenSettingsPanel );

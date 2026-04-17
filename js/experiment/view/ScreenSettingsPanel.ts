// Copyright 2026, University of Colorado Boulder

/**
 * ScreenSettingsPanel contains the detection mode radio buttons ('Intensity' vs 'Hits') and a 'Screen brightness'
 * slider. These controls affect the display on the detector screen,
 * routed through the active scene's properties via the caller-supplied DynamicProperties.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { percentUnit } from '../../../../scenery-phet/js/units/percentUnit.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';

const TITLE_FONT = new PhetFont( 14 );
const LABEL_FONT = new PhetFont( 14 );
const SETTINGS_ROW_SPACING = 40;

type SelfOptions = EmptySelfOptions;

type ScreenSettingsPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem'>;

export default class ScreenSettingsPanel extends Panel {

  public constructor( detectionModeProperty: PhetioProperty<DetectionMode>,
                      screenBrightnessProperty: PhetioProperty<number>,
                      providedOptions: ScreenSettingsPanelOptions ) {

    const options = optionize<ScreenSettingsPanelOptions, SelfOptions, PanelOptions>()( {
      isDisposable: false,
      xMargin: 0,
      yMargin: 6,
      fill: null,
      stroke: null
    }, providedOptions );

    // Radio buttons for Intensity vs Hits
    const radioButtonItems: AquaRadioButtonGroupItem<DetectionMode>[] = [
      {
        value: 'averageIntensity',
        createNode: () => new Text( QuantumWaveInterferenceFluent.intensityStringProperty, {
          font: LABEL_FONT,
          maxWidth: 130
        } ),
        tandemName: 'averageIntensityRadioButton',
        options: {
          accessibleContextResponse: QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.intensityRadioButton.accessibleContextResponseStringProperty
        }
      },
      {
        value: 'hits',
        createNode: () => new Text( QuantumWaveInterferenceFluent.hitsStringProperty, {
          font: LABEL_FONT,
          maxWidth: 130
        } ),
        tandemName: 'hitsRadioButton',
        options: {
          accessibleContextResponse: QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.hitsRadioButton.accessibleContextResponseStringProperty
        }
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
      accessibleName: QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.accessibleHelpTextStringProperty,
      tandem: options.tandem.createTandem( 'detectionModeRadioButtonGroup' )
    } );

    // Screen brightness slider
    const brightnessLabel = new Text( QuantumWaveInterferenceFluent.screenBrightnessStringProperty, {
      font: TITLE_FONT,
      maxWidth: 140
    } );

    const brightnessRange = new Range( 0, QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX );
    const brightnessSlider = new HSlider( screenBrightnessProperty, brightnessRange, {
      trackSize: new Dimension2( 130, 3 ),
      thumbSize: new Dimension2( 13, 22 ),
      majorTickLength: 12,
      createAriaValueText: value => percentUnit.getAccessibleString(
        value / QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX * 100,
        {
          decimalPlaces: 0,
          showTrailingZeros: false,
          showIntegersAsIntegers: true
        }
      ),
      accessibleName: QuantumWaveInterferenceFluent.a11y.brightnessSlider.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.brightnessSlider.accessibleHelpTextStringProperty,
      tandem: options.tandem.createTandem( 'brightnessSlider' )
    } );
    const brightnessControl = new VBox( {
      spacing: 2,
      children: [ brightnessLabel, brightnessSlider ]
    } );

    const content = new HBox( {
      spacing: SETTINGS_ROW_SPACING,
      align: 'center',
      children: [ detectionModeRadioButtonGroup, brightnessControl ]
    } );

    super( content, options );
  }
}

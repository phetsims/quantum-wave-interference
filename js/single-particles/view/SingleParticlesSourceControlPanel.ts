// Copyright 2026, University of Colorado Boulder

/**
 * SingleParticlesSourceControlPanel is a panel containing source controls for the Single Particles screen.
 * Unlike the High Intensity source controls, this panel has no intensity slider.
 * - For photons: a WavelengthNumberControl
 * - For particles (electrons, neutrons, helium atoms): a Velocity NumberControl
 *
 * The panel swaps its content when the active scene changes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SceneryPhetFluent from '../../../../scenery-phet/js/SceneryPhetFluent.js';
import { kilometersPerSecondUnit } from '../../../../scenery-phet/js/units/kilometersPerSecondUnit.js';
import { metersPerSecondUnit } from '../../../../scenery-phet/js/units/metersPerSecondUnit.js';
import { nanometersUnit } from '../../../../scenery-phet/js/units/nanometersUnit.js';
import WavelengthNumberControl from '../../../../scenery-phet/js/WavelengthNumberControl.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { type SourceType } from '../../common/model/SourceType.js';
import linkSceneVisibility from '../../common/view/linkSceneVisibility.js';
import SingleParticlesSceneModel from '../model/SingleParticlesSceneModel.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';

const TITLE_FONT = new PhetFont( 14 );
const TICK_LABEL_FONT = new PhetFont( 12 );
const SLIDER_TRACK_WIDTH = 125;
const SLIDER_TRACK_HEIGHT = 3;

type SelfOptions = EmptySelfOptions;

type SingleParticlesSourceControlPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem'>;

export default class SingleParticlesSourceControlPanel extends Panel {
  public constructor(
    sceneProperty: Property<SingleParticlesSceneModel>,
    scenes: SingleParticlesSceneModel[],
    providedOptions: SingleParticlesSourceControlPanelOptions
  ) {
    const options = optionize<SingleParticlesSourceControlPanelOptions, SelfOptions, PanelOptions>()(
      {
        isDisposable: false,
        xMargin: 10,
        yMargin: 10,
        fill: QuantumWaveInterferenceColors.panelFillProperty,
        stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
        minWidth: 160
      },
      providedOptions
    );

    const sceneControls = scenes.map( scene =>
      SingleParticlesSourceControlPanel.createSceneControl( scene, options.tandem )
    );

    const maxWidth = Math.max( ...sceneControls.map( c => c.width ) );
    const maxHeight = Math.max( ...sceneControls.map( c => c.height ) );

    const sceneNodes = sceneControls.map( ( control, index ) =>
      new AlignBox( control, {
        xAlign: 'center',
        yAlign: 'center',
        preferredWidth: maxWidth,
        preferredHeight: maxHeight,
        visible: scenes[ index ] === sceneProperty.value
      } )
    );

    const contentNode = new Node( {
      children: sceneNodes,
      excludeInvisibleChildrenFromBounds: false
    } );

    super( contentNode, options );

    linkSceneVisibility( sceneProperty, scenes, sceneNodes );
  }

  private static createSceneControl( scene: SingleParticlesSceneModel, tandem: Tandem ): Node {
    if ( scene.sourceType === 'photons' ) {
      return new WavelengthNumberControl( scene.wavelengthProperty, {
        range: new Range( 400, 700 ),
        spectrumSliderTrackOptions: {
          size: new Dimension2( SLIDER_TRACK_WIDTH, 15 )
        },
        spectrumSliderThumbOptions: {
          width: 18,
          height: 18,
          cursorHeight: 15
        },
        titleNodeOptions: {
          font: TITLE_FONT,
          maxWidth: 100
        },
        numberDisplayOptions: {
          valuePattern: {
            visualPattern: SceneryPhetFluent.wavelengthNMValuePatternStringProperty,
            accessiblePattern: nanometersUnit.accessiblePattern!
          },
          textOptions: {
            font: TITLE_FONT
          },
          maxWidth: 80
        },
        layoutFunction: NumberControl.createLayoutFunction1( {
          titleXSpacing: 4,
          arrowButtonsXSpacing: 8,
          ySpacing: 8
        } ),
        includeArrowButtons: true,
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.wavelengthSlider.accessibleHelpTextStringProperty,
        tandem: tandem.createTandem( 'wavelengthControl' )
      } );
    }

    return SingleParticlesSourceControlPanel.createVelocityControl( scene.sourceType, scene.velocityProperty, scene.velocityRange, tandem );
  }

  private static createVelocityControl( sourceType: SourceType, velocityProperty: NumberProperty, velocityRange: Range, tandem: Tandem ): Node {
    const velocityDelta = sourceType === 'electrons' ? 10000 :
                          sourceType === 'neutrons' ? 10 :
                          sourceType === 'heliumAtoms' ? 50 :
                          ( () => { throw new Error( `Unrecognized sourceType: ${sourceType}` ); } )();

    const useKmPerSecond = velocityRange.max >= 10000;
    const speedUnit = useKmPerSecond ? kilometersPerSecondUnit : metersPerSecondUnit;

    const formatSpeed = ( value: number ) => {
      if ( useKmPerSecond ) {
        const kmPerS = value / 1000;
        const roundedValue = roundSymmetric( kmPerS );
        return {
          visualString: StringUtils.fillIn(
            QuantumWaveInterferenceFluent.particleSpeedKmPerSecondPatternStringProperty.value,
            { value: roundedValue }
          ),
          accessibleString: speedUnit.getAccessibleString( roundedValue, {
            decimalPlaces: 0,
            showTrailingZeros: false,
            showIntegersAsIntegers: true
          } )
        };
      }

      const roundedValue = roundSymmetric( value );
      return {
        visualString: StringUtils.fillIn(
          QuantumWaveInterferenceFluent.particleSpeedMeterPerSecondPatternStringProperty.value,
          { value: roundedValue }
        ),
        accessibleString: speedUnit.getAccessibleString( roundedValue, {
          decimalPlaces: 0,
          showTrailingZeros: false,
          showIntegersAsIntegers: true
        } )
      };
    };

    const formatTickLabel = ( value: number ): string =>
      useKmPerSecond ? `${roundSymmetric( value / 1000 )}` : `${roundSymmetric( value )}`;

    return new NumberControl(
      QuantumWaveInterferenceFluent.particleSpeedStringProperty,
      velocityProperty,
      velocityRange,
      {
        delta: velocityDelta,
        titleNodeOptions: {
          font: TITLE_FONT,
          maxWidth: 100
        },
        numberDisplayOptions: {
          numberFormatter: formatSpeed,
          numberFormatterDependencies: [
            ...speedUnit.getDependentProperties(),
            QuantumWaveInterferenceFluent.particleSpeedKmPerSecondPatternStringProperty,
            QuantumWaveInterferenceFluent.particleSpeedMeterPerSecondPatternStringProperty
          ],
          textOptions: {
            font: TITLE_FONT
          },
          maxWidth: 120
        },
        sliderOptions: {
          trackSize: new Dimension2( SLIDER_TRACK_WIDTH, SLIDER_TRACK_HEIGHT ),
          thumbSize: new Dimension2( 13, 22 ),
          majorTickLength: 12,
          majorTicks: [
            {
              value: velocityRange.min,
              label: new Text( formatTickLabel( velocityRange.min ), { font: TICK_LABEL_FONT, maxWidth: 40 } )
            },
            {
              value: velocityRange.max,
              label: new Text( formatTickLabel( velocityRange.max ), { font: TICK_LABEL_FONT, maxWidth: 40 } )
            }
          ]
        },
        layoutFunction: NumberControl.createLayoutFunction1( {
          arrowButtonsXSpacing: 8,
          ySpacing: 8
        } ),
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.particleSpeedSlider.accessibleHelpTextStringProperty,
        tandem: tandem.createTandem( `${sourceType}VelocityControl` )
      }
    );
  }
}

// Copyright 2026, University of Colorado Boulder

/**
 * SourceControlPanel is a panel containing source controls for a scene. It contains:
 * - For photons: a WavelengthNumberControl and an Intensity slider
 * - For particles (electrons, neutrons, helium atoms): a Velocity NumberControl and an Intensity slider
 *
 * The panel swaps its content when the active scene changes.
 *
 * Generic over any scene type that has the required source properties.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
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
import { percentUnit } from '../../../../scenery-phet/js/units/percentUnit.js';
import WavelengthNumberControl from '../../../../scenery-phet/js/WavelengthNumberControl.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type SourceType } from '../model/SourceType.js';
import linkSceneVisibility from './linkSceneVisibility.js';

const TITLE_FONT = new PhetFont( 14 );
const TICK_LABEL_FONT = new PhetFont( 12 );
const DEFAULT_SLIDER_TRACK_WIDTH = 130;
const SOURCE_CONTROL_SLIDER_TRACK_WIDTH = DEFAULT_SLIDER_TRACK_WIDTH * 0.96;
const SLIDER_TRACK_HEIGHT = 3;
const PHOTON_INTENSITY_LABEL_SPACING = 4;
const PARTICLE_INTENSITY_LABEL_SPACING = 2;
const CONTROL_SECTION_SPACING = 16;
const CONTROL_ROW_VERTICAL_MARGIN = 4;

export type SourceControlScene = {
  readonly sourceType: SourceType;
  readonly intensityProperty: NumberProperty;
  readonly wavelengthProperty: NumberProperty;
  readonly velocityProperty: NumberProperty;
  readonly velocityRange: Range;
};

type SelfOptions = EmptySelfOptions;

type SourceControlPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem'>;

export default class SourceControlPanel<T extends SourceControlScene> extends Panel {
  public constructor(
    sceneProperty: Property<T>,
    scenes: T[],
    providedOptions: SourceControlPanelOptions
  ) {
    const options = optionize<SourceControlPanelOptions, SelfOptions, PanelOptions>()(
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

    const sceneControlContents = scenes.map( scene =>
      SourceControlPanel.createSceneControlContent( scene, options.tandem )
    );

    const maxTopControlWidth = Math.max( ...sceneControlContents.map( content => content.topControl.width ) );
    const maxTopControlHeight = Math.max( ...sceneControlContents.map( content => content.topControl.height ) );
    const maxBottomControlWidth = Math.max( ...sceneControlContents.map( content => content.bottomControl.width ) );
    const maxBottomControlHeight = Math.max(
      ...sceneControlContents.map( content => content.bottomControl.height )
    );

    const sceneContentNodes = sceneControlContents.map( sceneControls =>
      SourceControlPanel.createSceneContent( sceneControls.topControl, sceneControls.bottomControl, maxTopControlWidth,
        maxTopControlHeight, maxBottomControlWidth, maxBottomControlHeight )
    );

    const maxSceneWidth = Math.max( ...sceneContentNodes.map( node => node.width ) );
    const maxSceneHeight = Math.max( ...sceneContentNodes.map( node => node.height ) );

    const sceneNodes: Node[] = sceneContentNodes.map( ( sceneContent, index ) => {
      return new AlignBox( sceneContent, {
        xAlign: 'center',
        yAlign: 'center',
        preferredWidth: maxSceneWidth,
        preferredHeight: maxSceneHeight,
        visible: scenes[ index ] === sceneProperty.value
      } );
    } );

    const contentNode = new Node( {
      children: sceneNodes,
      excludeInvisibleChildrenFromBounds: false
    } );

    super( contentNode, options );

    linkSceneVisibility( sceneProperty, scenes, sceneNodes );
  }

  private static createSceneControlContent(
    scene: SourceControlScene,
    tandem: PickRequired<PanelOptions, 'tandem'>['tandem']
  ): {
    topControl: Node;
    bottomControl: Node;
  } {
    const intensityLabelStringProperty = scene.sourceType === 'photons'
                                         ? QuantumWaveInterferenceFluent.sourceIntensityStringProperty
                                         : QuantumWaveInterferenceFluent.emissionRateStringProperty;

    const intensitySlider = new HSlider( scene.intensityProperty, scene.intensityProperty.range, {
      trackSize: new Dimension2( SOURCE_CONTROL_SLIDER_TRACK_WIDTH, SLIDER_TRACK_HEIGHT ),
      thumbSize: new Dimension2( 13, 22 ),
      majorTickLength: 12,
      tickLabelSpacing: scene.sourceType === 'photons' ? 2 : 6,
      createAriaValueText: value => percentUnit.getAccessibleString( value * 100, {
        decimalPlaces: 0,
        showTrailingZeros: false,
        showIntegersAsIntegers: true
      } ),
      accessibleName: intensityLabelStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.intensitySlider.accessibleHelpText.createProperty( {
        sourceType: scene.sourceType
      } ),
      tandem: tandem.createTandem( `${scene.sourceType}IntensitySlider` )
    } );

    intensitySlider.addMajorTick( 0, new Text( '0', { font: TICK_LABEL_FONT } ) );
    intensitySlider.addMajorTick(
      1,
      new Text( QuantumWaveInterferenceFluent.maxStringProperty, {
        font: TICK_LABEL_FONT,
        maxWidth: 40
      } )
    );

    const intensityLabel = new Text( intensityLabelStringProperty, {
      font: TITLE_FONT,
      maxWidth: 120
    } );

    const intensityControl = new VBox( {
      spacing: scene.sourceType === 'photons' ? PHOTON_INTENSITY_LABEL_SPACING : PARTICLE_INTENSITY_LABEL_SPACING,
      children: [ intensityLabel, intensitySlider ]
    } );

    let topControl: Node;

    if ( scene.sourceType === 'photons' ) {
      topControl = new WavelengthNumberControl( scene.wavelengthProperty, {
        range: new Range( 400, 700 ),
        spectrumSliderTrackOptions: {
          size: new Dimension2( SOURCE_CONTROL_SLIDER_TRACK_WIDTH, 15 )
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
            font: new PhetFont( 14 )
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
    else {
      const velocityRange = scene.velocityRange;

      const sourceType = scene.sourceType;
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
              {
                value: roundedValue
              }
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
            {
              value: roundedValue
            }
          ),
          accessibleString: speedUnit.getAccessibleString( roundedValue, {
            decimalPlaces: 0,
            showTrailingZeros: false,
            showIntegersAsIntegers: true
          } )
        };
      };

      const formatTickLabel = ( value: number ): string => {
        if ( useKmPerSecond ) {
          return `${roundSymmetric( value / 1000 )}`;
        }
        else {
          return `${roundSymmetric( value )}`;
        }
      };

      topControl = new NumberControl(
        QuantumWaveInterferenceFluent.particleSpeedStringProperty,
        scene.velocityProperty,
        velocityRange,
        {
          delta: velocityDelta,
          titleNodeOptions: {
            font: TITLE_FONT,
            maxWidth: 100
          },
          numberDisplayOptions: {
            numberFormatter: formatSpeed,
            numberFormatterDependencies: speedUnit.getDependentProperties(),
            textOptions: {
              font: new PhetFont( 14 )
            },
            maxWidth: 120
          },
          sliderOptions: {
            trackSize: new Dimension2( SOURCE_CONTROL_SLIDER_TRACK_WIDTH, SLIDER_TRACK_HEIGHT ),
            thumbSize: new Dimension2( 13, 22 ),
            majorTickLength: 12,
            majorTicks: [
              {
                value: velocityRange.min,
                label: new Text( formatTickLabel( velocityRange.min ), {
                  font: TICK_LABEL_FONT,
                  maxWidth: 40
                } )
              },
              {
                value: velocityRange.max,
                label: new Text( formatTickLabel( velocityRange.max ), {
                  font: TICK_LABEL_FONT,
                  maxWidth: 40
                } )
              }
            ]
          },
          layoutFunction: NumberControl.createLayoutFunction1( {
            arrowButtonsXSpacing: 8,
            ySpacing: 8
          } ),
          accessibleHelpText: QuantumWaveInterferenceFluent.a11y.particleSpeedSlider.accessibleHelpTextStringProperty,
          tandem: tandem.createTandem( `${scene.sourceType}VelocityControl` )
        }
      );
    }

    return {
      topControl: topControl,
      bottomControl: intensityControl
    };
  }

  private static createSceneContent(
    topControl: Node,
    bottomControl: Node,
    topControlWidth: number,
    topControlHeight: number,
    bottomControlWidth: number,
    bottomControlHeight: number
  ): Node {
    const topControlRow = new AlignBox( topControl, {
      xAlign: 'center',
      yAlign: 'center',
      preferredWidth: topControlWidth,
      preferredHeight: topControlHeight,
      yMargin: CONTROL_ROW_VERTICAL_MARGIN
    } );

    const bottomControlRow = new AlignBox( bottomControl, {
      xAlign: 'center',
      yAlign: 'center',
      preferredWidth: bottomControlWidth,
      preferredHeight: bottomControlHeight,
      yMargin: CONTROL_ROW_VERTICAL_MARGIN
    } );

    return new VBox( {
      spacing: CONTROL_SECTION_SPACING,
      align: 'center',
      children: [ topControlRow, bottomControlRow ]
    } );
  }
}

// Copyright 2026, University of Colorado Boulder

/**
 * SourceControlPanel is a panel containing source controls for a scene. It contains:
 * - For photons: a WavelengthNumberControl (and an Intensity slider when the scene supplies `intensityProperty`)
 * - For particles (electrons, neutrons, helium atoms): a Velocity NumberControl (plus Intensity slider when present)
 *
 * The panel swaps its content when the active scene changes. Screens omit the intensity slider by using scenes
 * without an `intensityProperty`.
 *
 * Generic over any scene type that has the required source properties, so the Experiment and simplified screens can
 * share the same wavelength/velocity controls while supplying different scene models.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
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
import SunConstants from '../../../../sun/js/SunConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type SourceType } from '../model/SourceType.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import linkSceneVisibility from './linkSceneVisibility.js';
import { getWavelengthColorZone, getWavelengthColorZoneString } from './WavelengthColorUtils.js';

const TITLE_FONT = new PhetFont( 14 );
const TICK_LABEL_FONT = new PhetFont( 12 );
const DEFAULT_SLIDER_TRACK_WIDTH = 130;
const SOURCE_CONTROL_SLIDER_TRACK_WIDTH = DEFAULT_SLIDER_TRACK_WIDTH * 1.15;
const SLIDER_TRACK_HEIGHT = 3;
const PHOTON_INTENSITY_LABEL_SPACING = 4;
const PARTICLE_INTENSITY_LABEL_SPACING = 2;
const CONTROL_SECTION_SPACING = 16;
const CONTROL_ROW_VERTICAL_MARGIN = 4;

export type SourceControlScene = {
  readonly sourceType: SourceType;
  readonly wavelengthProperty: NumberProperty;
  readonly velocityProperty: NumberProperty;
  readonly velocityRange: Range;

  // Scenes omit this property when their source intensity is fixed, which hides the intensity slider.
  readonly intensityProperty?: NumberProperty;
};

type SelfOptions = {
  photonIntensityLabelStringProperty?: TReadOnlyProperty<string>;
  particleIntensityLabelStringProperty?: TReadOnlyProperty<string>;
  additionalContent?: Node | null;
};

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
        minWidth: 160,
        photonIntensityLabelStringProperty: QuantumWaveInterferenceFluent.sourceIntensityStringProperty,
        particleIntensityLabelStringProperty: QuantumWaveInterferenceFluent.emissionRateStringProperty,
        additionalContent: null
      },
      providedOptions
    );

    const sceneControlContents = scenes.map( scene =>
      SourceControlPanel.createSceneControlContent(
        scene,
        options.tandem,
        scene.sourceType === 'photons'
        ? options.photonIntensityLabelStringProperty
        : options.particleIntensityLabelStringProperty
      )
    );

    const maxTopControlWidth = Math.max( ...sceneControlContents.map( content => content.topControl.width ) );
    const maxTopControlHeight = Math.max( ...sceneControlContents.map( content => content.topControl.height ) );

    const bottomControls = sceneControlContents
      .map( content => content.bottomControl )
      .filter( control => control !== null );
    const maxBottomControlWidth = bottomControls.length > 0 ? Math.max( ...bottomControls.map( n => n.width ) ) : 0;
    const maxBottomControlHeight = bottomControls.length > 0 ? Math.max( ...bottomControls.map( n => n.height ) ) : 0;

    const sceneContentNodes = sceneControlContents.map( sceneControls =>
      SourceControlPanel.createSceneContent( sceneControls.topControl, sceneControls.bottomControl, maxTopControlWidth,
        maxTopControlHeight, maxBottomControlWidth, maxBottomControlHeight )
    );

    const maxSceneWidth = Math.max( ...sceneContentNodes.map( node => node.width ) );
    const maxSceneHeight = Math.max( ...sceneContentNodes.map( node => node.height ) );

    const sceneNodes = sceneContentNodes.map( ( sceneContent, index ) => {
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

    let panelContent: Node = contentNode;
    if ( options.additionalContent ) {
      panelContent = new VBox( {
        spacing: CONTROL_SECTION_SPACING,
        align: 'left',
        children: [ contentNode, options.additionalContent ]
      } );
    }

    super( panelContent, options );

    linkSceneVisibility( sceneProperty, scenes, sceneNodes );
  }

  private static createSceneControlContent(
    scene: SourceControlScene,
    tandem: PickRequired<PanelOptions, 'tandem'>['tandem'],
    intensityLabelStringProperty: TReadOnlyProperty<string>
  ): {
    topControl: Node;
    bottomControl: Node | null;
  } {
    const intensityControl = scene.intensityProperty ? SourceControlPanel.createIntensityControl(
      scene.intensityProperty, scene.sourceType, intensityLabelStringProperty, tandem ) : null;

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
          valuePattern: SunConstants.VALUE_NAMED_PLACEHOLDER,
          numberFormatter: ( value: number ) => {
            const roundedValue = roundSymmetric( value );
            const colorZone = getWavelengthColorZone( roundedValue );
            return {
              visualString: nanometersUnit.getVisualSymbolPatternString( roundedValue, {
                decimalPlaces: 0,
                showTrailingZeros: false,
                showIntegersAsIntegers: true
              } ),
              accessibleString: QuantumWaveInterferenceFluent.a11y.wavelengthSlider.accessibleValue.format( {
                value: nanometersUnit.getAccessibleString( roundedValue, {
                  decimalPlaces: 0,
                  showTrailingZeros: false,
                  showIntegersAsIntegers: true
                } ),
                color: getWavelengthColorZoneString( colorZone )
              } )
            };
          },
          numberFormatterDependencies: [
            ...nanometersUnit.getDependentProperties(),
            ...QuantumWaveInterferenceFluent.a11y.wavelengthSlider.accessibleValue.getDependentProperties(),
            QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.violetStringProperty,
            QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.blueStringProperty,
            QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.indigoStringProperty,
            QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.greenStringProperty,
            QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.yellowStringProperty,
            QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.orangeStringProperty,
            QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.redStringProperty
          ],
          textOptions: {
            font: new PhetFont( 14 )
          },
          maxWidth: 80
        },
        layoutFunction: NumberControl.createLayoutFunction4( {
          verticalSpacing: 8
        } ),
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
            visualString: speedUnit.getVisualSymbolPatternString( roundedValue, {
              decimalPlaces: 0,
              showTrailingZeros: false,
              showIntegersAsIntegers: true
            } ),
            accessibleString: speedUnit.getAccessibleString( roundedValue, {
              decimalPlaces: 0,
              showTrailingZeros: false,
              showIntegersAsIntegers: true
            } )
          };
        }

        const roundedValue = roundSymmetric( value );
        return {
          visualString: speedUnit.getVisualSymbolPatternString( roundedValue, {
            decimalPlaces: 0,
            showTrailingZeros: false,
            showIntegersAsIntegers: true
          } ),
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

            // Retrigger the formatter when locale-dependent unit strings change.
            numberFormatterDependencies: [
              ...speedUnit.getDependentProperties()
            ],
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
    bottomControl: Node | null,
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

    const children: Node[] = [ topControlRow ];
    if ( bottomControl ) {
      children.push( new AlignBox( bottomControl, {
        xAlign: 'center',
        yAlign: 'center',
        preferredWidth: bottomControlWidth,
        preferredHeight: bottomControlHeight,
        yMargin: CONTROL_ROW_VERTICAL_MARGIN
      } ) );
    }

    return new VBox( {
      spacing: CONTROL_SECTION_SPACING,
      align: 'center',
      children: children
    } );
  }

  private static createIntensityControl(
    intensityProperty: NumberProperty,
    sourceType: SourceType,
    intensityLabelStringProperty: TReadOnlyProperty<string>,
    tandem: PickRequired<PanelOptions, 'tandem'>['tandem']
  ): Node {
    const intensitySlider = new HSlider( intensityProperty, intensityProperty.range, {
      trackSize: new Dimension2( SOURCE_CONTROL_SLIDER_TRACK_WIDTH, SLIDER_TRACK_HEIGHT ),
      thumbSize: new Dimension2( 13, 22 ),
      majorTickLength: 12,
      tickLabelSpacing: sourceType === 'photons' ? 2 : 6,
      createAriaValueText: value => percentUnit.getAccessibleString( value * 100, {
        decimalPlaces: 0,
        showTrailingZeros: false,
        showIntegersAsIntegers: true
      } ),
      createContextResponseAlert: ( value, _newValue, valueOnStart ) =>
        SourceControlPanel.getIntensityContextResponse( sourceType, value, valueOnStart, intensityProperty.range ),
      accessibleName: intensityLabelStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.intensitySlider.accessibleHelpText.createProperty( {
        sourceType: sourceType
      } ),
      tandem: tandem.createTandem( `${sourceType}IntensitySlider` )
    } );

    intensitySlider.addMajorTick( 0, new Text( '0', { font: TICK_LABEL_FONT } ) );
    intensitySlider.addMajorTick( 0.5 );
    intensitySlider.addMajorTick(
      1,
      new Text( QuantumWaveInterferenceFluent.maxStringProperty, {
        font: TICK_LABEL_FONT,
        maxWidth: 40
      } )
    );
    for ( let i = 1; i <= 4; i++ ) {
      intensitySlider.addMinorTick( i * 0.1 );
      intensitySlider.addMinorTick( 0.5 + i * 0.1 );
    }

    const intensityLabel = new Text( intensityLabelStringProperty, {
      font: TITLE_FONT,
      maxWidth: 120
    } );

    return new VBox( {
      spacing: sourceType === 'photons' ? PHOTON_INTENSITY_LABEL_SPACING : PARTICLE_INTENSITY_LABEL_SPACING,
      children: [ intensityLabel, intensitySlider ]
    } );
  }

  private static getIntensityContextResponse( sourceType: SourceType, value: number, valueOnStart: number, range: Range ): string | null {
    if ( value === valueOnStart ) {
      return null;
    }

    const change = value === range.min ? 'zero' :
                   value === range.max ? 'max' :
                   value > valueOnStart ? 'more' :
                   'less';

    return QuantumWaveInterferenceFluent.a11y.intensitySlider.accessibleContextResponse.format( {
      sourceType: sourceType,
      change: change
    } );
  }
}

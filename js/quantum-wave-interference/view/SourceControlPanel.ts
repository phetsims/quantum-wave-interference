// Copyright 2026, University of Colorado Boulder

/**
 * SourceControlPanel is the panel beneath the emitter source in the middle row. It contains controls
 * for the source properties:
 * - For photons: a WavelengthNumberControl and an Intensity slider
 * - For particles (electrons, neutrons, helium atoms): a Velocity NumberControl and an Intensity slider
 *
 * The panel swaps its content when the active scene changes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import WavelengthNumberControl from '../../../../scenery-phet/js/WavelengthNumberControl.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';
import SourceType from '../model/SourceType.js';

const TITLE_FONT = new PhetFont( 14 );
const TICK_LABEL_FONT = new PhetFont( 12 );
const SLIDER_TRACK_SIZE = new Dimension2( 130, 3 );

type SelfOptions = EmptySelfOptions;

type SourceControlPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem'>;

export default class SourceControlPanel extends Panel {

  public constructor( sceneProperty: Property<SceneModel>, scenes: SceneModel[],
                      providedOptions: SourceControlPanelOptions ) {

    const options = optionize<SourceControlPanelOptions, SelfOptions, PanelOptions>()( {
      xMargin: 10,
      yMargin: 10,
      fill: '#f4f4f4',
      stroke: '#c1c1c1',
      minWidth: 160
    }, providedOptions );

    // Create the content for each scene, then swap visibility based on the active scene.
    const sceneNodes: Node[] = [];

    for ( const scene of scenes ) {
      const sceneContent = SourceControlPanel.createSceneContent( scene, options.tandem );
      sceneContent.visible = ( scene === sceneProperty.value );
      sceneNodes.push( sceneContent );
    }

    // Container node holds all scene content nodes; only the active one is visible.
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
   * Creates the control content for a single scene.
   */
  private static createSceneContent( scene: SceneModel, tandem: PickRequired<PanelOptions, 'tandem'>['tandem'] ): Node {

    // Intensity slider (shared by all source types)
    const intensitySlider = new HSlider( scene.intensityProperty, scene.intensityProperty.range, {
      trackSize: SLIDER_TRACK_SIZE,
      thumbSize: new Dimension2( 13, 22 ),
      majorTickLength: 12,
      tandem: tandem.createTandem( `${scene.sourceType.tandemName}IntensitySlider` )
    } );

    // Add min ("0") and max ("Max") tick marks
    intensitySlider.addMajorTick( 0, new Text( '0', { font: TICK_LABEL_FONT } ) );
    intensitySlider.addMajorTick( 1, new Text( QuantumWaveInterferenceFluent.maxStringProperty, {
      font: TICK_LABEL_FONT,
      maxWidth: 40
    } ) );

    // Photon scenes use "Intensity" while particle scenes use "Emission Rate" per the
    // ElectronEmitter.svg design mockup, which is more physically intuitive for students.
    const intensityLabelStringProperty = scene.sourceType === SourceType.PHOTONS
                                          ? QuantumWaveInterferenceFluent.intensityStringProperty
                                          : QuantumWaveInterferenceFluent.emissionRateStringProperty;
    const intensityLabel = new Text( intensityLabelStringProperty, {
      font: TITLE_FONT,
      maxWidth: 120
    } );

    const intensityControl = new VBox( {
      spacing: 2,
      children: [
        intensityLabel,
        intensitySlider
      ]
    } );

    let topControl: Node;

    if ( scene.sourceType === SourceType.PHOTONS ) {
      // Wavelength control with spectrum slider
      topControl = new WavelengthNumberControl( scene.wavelengthProperty, {
        range: new Range( 380, 780 ),
        spectrumSliderTrackOptions: {
          size: new Dimension2( 130, 15 )
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
          textOptions: {
            font: new PhetFont( 13 )
          },
          maxWidth: 80
        },
        layoutFunction: NumberControl.createLayoutFunction4( {
          ySpacing: 3
        } ),
        includeArrowButtons: false,
        tandem: tandem.createTandem( 'wavelengthControl' )
      } );
    }
    else {
      // Velocity NumberControl for particle scenes, per the design document:
      // "the panel contains a Velocity NumberControl and Intensity Slider".
      // Speed is displayed in km/s for electrons (large: 1e5–1e7 m/s) and m/s for slower particles.
      const velocityRange = scene.velocityRange;

      // Use km/s for electrons (large velocities), m/s for neutrons and helium atoms
      const useKmPerSecond = velocityRange.max >= 10000;

      // Format the number display value and tick labels appropriately for the speed range
      const formatSpeed = ( value: number ): string => {
        if ( useKmPerSecond ) {
          const kmPerS = value / 1000;
          return StringUtils.fillIn( QuantumWaveInterferenceFluent.particleSpeedKmPerSecondPatternStringProperty.value, {
            value: Utils.roundSymmetric( kmPerS )
          } );
        }
        else {
          return `${Utils.roundSymmetric( value )} m/s`;
        }
      };

      const formatTickLabel = ( value: number ): string => {
        if ( useKmPerSecond ) {
          return `${Utils.roundSymmetric( value / 1000 )}`;
        }
        else {
          return `${Utils.roundSymmetric( value )}`;
        }
      };

      // Use "Particle Speed" per the ElectronEmitter.svg design mockup, which is more
      // student-friendly than the physics term "Velocity".
      topControl = new NumberControl(
        QuantumWaveInterferenceFluent.particleSpeedStringProperty,
        scene.velocityProperty,
        velocityRange,
        {
          delta: ( velocityRange.max - velocityRange.min ) / 100,
          titleNodeOptions: {
            font: TITLE_FONT,
            maxWidth: 100
          },
          numberDisplayOptions: {
            numberFormatter: formatSpeed,
            textOptions: {
              font: new PhetFont( 13 )
            },
            maxWidth: 120
          },
          sliderOptions: {
            trackSize: SLIDER_TRACK_SIZE,
            thumbSize: new Dimension2( 13, 22 ),
            majorTickLength: 12,
            majorTicks: [ {
              value: velocityRange.min,
              label: new Text( formatTickLabel( velocityRange.min ), {
                font: TICK_LABEL_FONT,
                maxWidth: 40
              } )
            }, {
              value: velocityRange.max,
              label: new Text( formatTickLabel( velocityRange.max ), {
                font: TICK_LABEL_FONT,
                maxWidth: 40
              } )
            } ]
          },
          layoutFunction: NumberControl.createLayoutFunction1( {
            ySpacing: 3
          } ),
          tandem: tandem.createTandem( `${scene.sourceType.tandemName}VelocityControl` )
        }
      );
    }

    // For particle scenes, add a de Broglie wavelength readout between the velocity control
    // and the intensity slider. This directly supports the learning goal: "Relate particle
    // momentum to wavelength using the de Broglie relationship."
    const children: Node[] = [ topControl ];

    if ( scene.sourceType !== SourceType.PHOTONS ) {
      const deBroglieText = new RichText( '', {
        font: new PhetFont( 12 ),
        maxWidth: 150,
        fill: '#444'
      } );

      // Compute de Broglie wavelength: λ = h / (m * v), displayed in nm
      const updateWavelengthText = () => {
        const lambdaM = scene.getEffectiveWavelength();
        const lambdaNm = lambdaM * 1e9;
        deBroglieText.string = `λ<sub>dB</sub> = ${toFixed( lambdaNm, 3 )} nm`;
      };

      scene.velocityProperty.link( updateWavelengthText );
      children.push( deBroglieText );
    }

    children.push( intensityControl );

    return new VBox( {
      spacing: 10,
      align: 'center',
      children: children
    } );
  }
}

quantumWaveInterference.register( 'SourceControlPanel', SourceControlPanel );

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
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import WavelengthNumberControl from '../../../../scenery-phet/js/WavelengthNumberControl.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
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
      fill: 'rgb( 230, 230, 230 )',
      stroke: 'gray',
      minWidth: 160
    }, providedOptions );

    // Create the content for each scene, then swap visibility based on the active scene.
    const sceneNodes: Node[] = [];

    for ( const scene of scenes ) {
      const sceneContent = SourceControlPanel.createSceneContent( scene, options.tandem );
      sceneContent.visible = ( scene === sceneProperty.value );
      sceneNodes.push( sceneContent );
    }

    // Container node holds all scene content nodes; only the active one is visible
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

    const intensityLabel = new Text( QuantumWaveInterferenceFluent.intensityStringProperty, {
      font: TITLE_FONT,
      maxWidth: 100
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
          size: SLIDER_TRACK_SIZE
        },
        spectrumSliderThumbOptions: {
          width: 18,
          height: 18,
          cursorHeight: SLIDER_TRACK_SIZE.height
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
        layoutFunction: NumberControl.createLayoutFunction3( {
          ySpacing: 3
        } ),
        tandem: tandem.createTandem( 'wavelengthControl' )
      } );
    }
    else {
      // Velocity NumberControl for particle scenes
      const velocityRange = scene.velocityRange;

      // Use scientific notation for large velocities (electrons: 1e5–1e7 m/s),
      // normal formatting for smaller velocities (neutrons, helium atoms).
      const useScientificNotation = velocityRange.max >= 10000;

      topControl = new NumberControl(
        QuantumWaveInterferenceFluent.velocityStringProperty,
        scene.velocityProperty,
        velocityRange,
        {
          delta: ( velocityRange.max - velocityRange.min ) / 100,
          titleNodeOptions: {
            font: TITLE_FONT,
            maxWidth: 80
          },
          numberDisplayOptions: useScientificNotation ? {
            numberFormatter: ( value: number ) => {
              if ( value === 0 ) {
                return '0 m/s';
              }
              const exponent = Math.floor( Math.log10( Math.abs( value ) ) );
              const mantissa = value / Math.pow( 10, exponent );
              return `${toFixed( mantissa, 2 )} \u00D7 10<sup>${exponent}</sup> m/s`;
            },
            useRichText: true,
            textOptions: {
              font: new PhetFont( 13 )
            },
            maxWidth: 150
          } : {
            valuePattern: QuantumWaveInterferenceFluent.velocityPatternStringProperty,
            textOptions: {
              font: new PhetFont( 13 )
            },
            maxWidth: 100
          },
          sliderOptions: {
            trackSize: SLIDER_TRACK_SIZE,
            thumbSize: new Dimension2( 13, 22 ),
            majorTickLength: 12,
            majorTicks: [ {
              value: velocityRange.min,
              label: new Text( QuantumWaveInterferenceFluent.minStringProperty, {
                font: TICK_LABEL_FONT,
                maxWidth: 30
              } )
            }, {
              value: velocityRange.max,
              label: new Text( QuantumWaveInterferenceFluent.maxStringProperty, {
                font: TICK_LABEL_FONT,
                maxWidth: 30
              } )
            } ]
          },
          layoutFunction: NumberControl.createLayoutFunction3( {
            ySpacing: 3
          } ),
          tandem: tandem.createTandem( `${scene.sourceType.tandemName}VelocityControl` )
        }
      );
    }

    return new VBox( {
      spacing: 10,
      align: 'center',
      children: [ topControl, intensityControl ]
    } );
  }
}

quantumWaveInterference.register( 'SourceControlPanel', SourceControlPanel );

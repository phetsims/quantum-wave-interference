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
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import WavelengthNumberControl from '../../../../scenery-phet/js/WavelengthNumberControl.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';

const TITLE_FONT = new PhetFont( 14 );
const TICK_LABEL_FONT = new PhetFont( 12 );
const DEFAULT_SLIDER_TRACK_WIDTH = 130;
const SOURCE_CONTROL_SLIDER_TRACK_WIDTH = DEFAULT_SLIDER_TRACK_WIDTH * 0.96;
const SLIDER_TRACK_HEIGHT = 3;
const PHOTON_INTENSITY_LABEL_SPACING = 4;
const PARTICLE_INTENSITY_LABEL_SPACING = 2;
const CONTROL_SECTION_SPACING = 16;
const CONTROL_ROW_VERTICAL_MARGIN = 4;

type SelfOptions = EmptySelfOptions;

type SourceControlPanelOptions = SelfOptions & PickRequired<PanelOptions, 'tandem'>;

export default class SourceControlPanel extends Panel {
  public constructor(
    sceneProperty: Property<SceneModel>,
    scenes: SceneModel[],
    providedOptions: SourceControlPanelOptions
  ) {
    const options = optionize<SourceControlPanelOptions, SelfOptions, PanelOptions>()(
      {
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

    // Match row geometry across scenes so control placement does not shift when switching source types.
    const maxTopControlWidth = Math.max( ...sceneControlContents.map( content => content.topControl.width ) );
    const maxTopControlHeight = Math.max( ...sceneControlContents.map( content => content.topControl.height ) );
    const maxBottomControlWidth = Math.max( ...sceneControlContents.map( content => content.bottomControl.width ) );
    const maxBottomControlHeight = Math.max(
      ...sceneControlContents.map( content => content.bottomControl.height )
    );

    const sceneContentNodes = sceneControlContents.map( sceneControls =>
      SourceControlPanel.createSceneContent(
        sceneControls.topControl,
        sceneControls.bottomControl,
        maxTopControlWidth,
        maxTopControlHeight,
        maxBottomControlWidth,
        maxBottomControlHeight
      )
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
        sceneNodes[ i ].visible = scenes[ i ] === activeScene;
      }
    } );
  }

  /**
   * Creates the source-type-specific controls for one scene.
   */
  private static createSceneControlContent(
    scene: SceneModel,
    tandem: PickRequired<PanelOptions, 'tandem'>['tandem']
  ): {
    topControl: Node;
    bottomControl: Node;
  } {
    // Intensity slider (shared by all source types)
    const intensitySlider = new HSlider( scene.intensityProperty, scene.intensityProperty.range, {
      trackSize: new Dimension2( SOURCE_CONTROL_SLIDER_TRACK_WIDTH, SLIDER_TRACK_HEIGHT ),
      thumbSize: new Dimension2( 13, 22 ),
      majorTickLength: 12,
      tickLabelSpacing: scene.sourceType === 'photons' ? 2 : 6,
      tandem: tandem.createTandem( `${scene.sourceType}IntensitySlider` )
    } );

    // Add min ("0") and max ("Max") tick marks
    intensitySlider.addMajorTick( 0, new Text( '0', { font: TICK_LABEL_FONT } ) );
    intensitySlider.addMajorTick(
      1,
      new Text( QuantumWaveInterferenceFluent.maxStringProperty, {
        font: TICK_LABEL_FONT,
        maxWidth: 40
      } )
    );

    // Photon scenes use "Source Intensity" while particle scenes use "Emission Rate" per the
    // ElectronEmitter.svg design mockup, which is more physically intuitive for students.
    const intensityLabelStringProperty =
      scene.sourceType === 'photons'
        ? QuantumWaveInterferenceFluent.sourceIntensityStringProperty
        : QuantumWaveInterferenceFluent.emissionRateStringProperty;
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
      // Wavelength control with spectrum slider
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
          textOptions: {
            font: new PhetFont( 13 )
          },
          maxWidth: 80
        },
        layoutFunction: NumberControl.createLayoutFunction1( {
          titleXSpacing: 4,
          arrowButtonsXSpacing: 8,
          ySpacing: 8
        } ),
        includeArrowButtons: true,
        tandem: tandem.createTandem( 'wavelengthControl' )
      } );
    }
    else {
      // Velocity NumberControl for particle scenes, per the design document:
      // "the panel contains a Velocity NumberControl and Intensity Slider".
      // Speed is displayed in km/s for electrons (large: 1e5–1e7 m/s) and m/s for slower particles.
      const velocityRange = scene.velocityRange;
      const velocityDelta = scene.sourceType === 'electrons'
                            ? 10000 // 10 km/s
                            : scene.sourceType === 'neutrons'
                              ? 10
                            : ( velocityRange.max - velocityRange.min ) / 100;

      // Use km/s for electrons (large velocities), m/s for neutrons and helium atoms
      const useKmPerSecond = velocityRange.max >= 10000;

      // Format the number display value and tick labels appropriately for the speed range
      const formatSpeed = ( value: number ): string => {
        if ( useKmPerSecond ) {
          const kmPerS = value / 1000;
          return StringUtils.fillIn(
            QuantumWaveInterferenceFluent.particleSpeedKmPerSecondPatternStringProperty.value,
            {
              value: Utils.roundSymmetric( kmPerS )
            }
          );
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
          delta: velocityDelta,
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
          tandem: tandem.createTandem( `${scene.sourceType}VelocityControl` )
        }
      );
    }

    return {
      topControl: topControl,
      bottomControl: intensityControl
    };
  }

  /**
   * Creates the scene content using fixed-size row containers so controls keep identical
   * height and position across source types.
   */
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

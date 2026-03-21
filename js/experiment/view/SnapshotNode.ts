// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotNode displays a single snapshot in the SnapshotsDialog. It shows a miniature rendering of the
 * detector screen state at the time the snapshot was taken, along with a title, key physics parameters
 * (slit separation, screen distance, wavelength), and a delete button.
 *
 * The parameter labels allow users to compare how different settings produce different interference
 * patterns, directly supporting the learning goal of predicting how changes to wavelength, particle
 * properties, or slit geometry affect the observed pattern.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import Utils from '../../../../dot/js/Utils.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import TrashButton from '../../../../scenery-phet/js/buttons/TrashButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';
import Snapshot from '../model/Snapshot.js';

// Snapshot display dimensions (scaled down from the full detector screen)
const SNAPSHOT_WIDTH = 180;
const SNAPSHOT_HEIGHT = 120;
const CORNER_RADIUS = 6;
const HIT_DOT_RADIUS = 1;
const INTENSITY_BINS = 150;
const INTENSITY_SCREEN_BRIGHTNESS_MIN_MULTIPLIER = 1.2;
const INTENSITY_SCREEN_BRIGHTNESS_MAX_MULTIPLIER = 6.0;
const INTENSITY_BRIGHTNESS_MAX_MULTIPLIER = 0.8;
const HITS_SCREEN_BRIGHTNESS_MIN_MULTIPLIER = 0.1;
const HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER = 1.8; // previous default hits gain

const PARAM_FONT = new PhetFont( 11 );
const TITLE_FONT = new PhetFont( { size: 12, weight: 'bold' } );

// Map from slitSetting name strings to their display string properties
const SLIT_SETTING_DISPLAY_MAP: Record<string, TReadOnlyProperty<string>> = {
  BOTH_OPEN: QuantumWaveInterferenceFluent.bothOpenStringProperty,
  LEFT_COVERED: QuantumWaveInterferenceFluent.leftCoveredStringProperty,
  RIGHT_COVERED: QuantumWaveInterferenceFluent.rightCoveredStringProperty,
  LEFT_DETECTOR: QuantumWaveInterferenceFluent.leftDetectorStringProperty,
  RIGHT_DETECTOR: QuantumWaveInterferenceFluent.rightDetectorStringProperty
};

const getIntensityScreenBrightnessMultiplier = ( sliderBrightness: number ): number => {
  const clampedBrightness = Utils.clamp( sliderBrightness, 0, 1 );
  return Utils.linear(
    0,
    1,
    INTENSITY_SCREEN_BRIGHTNESS_MIN_MULTIPLIER,
    INTENSITY_SCREEN_BRIGHTNESS_MAX_MULTIPLIER,
    clampedBrightness
  );
};

const getHitsDisplayGain = ( brightness: number ): number => {
  const clampedBrightness = Utils.clamp( brightness, 0, SceneModel.SCREEN_BRIGHTNESS_MAX );
  return Utils.linear(
    0,
    SceneModel.SCREEN_BRIGHTNESS_MAX,
    HITS_SCREEN_BRIGHTNESS_MIN_MULTIPLIER,
    HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER,
    clampedBrightness
  );
};

const getIntensityDisplayGain = ( brightness: number, intensity: number ): number => {
  return (
    getIntensityScreenBrightnessMultiplier( brightness ) *
    Utils.clamp( intensity, 0, 1 ) *
    INTENSITY_BRIGHTNESS_MAX_MULTIPLIER
  );
};

export default class SnapshotNode extends Node {
  public constructor( sceneModel: SceneModel, index: number ) {
    const snapshotProperty: TReadOnlyProperty<Snapshot | null> = new DerivedProperty(
      [ sceneModel.snapshotsProperty ],
      snapshots => ( index < snapshots.length ? snapshots[ index ] : null )
    );

    // Background rectangle for the snapshot image
    const background = new Rectangle(
      0,
      0,
      SNAPSHOT_WIDTH,
      SNAPSHOT_HEIGHT,
      CORNER_RADIUS,
      CORNER_RADIUS,
      {
        fill: 'black',
        stroke: QuantumWaveInterferenceColors.snapshotStrokeProperty,
        lineWidth: 1
      }
    );

    // Canvas node for rendering the snapshot content (hits or intensity bands)
    const canvasNode = new SnapshotCanvasNode( snapshotProperty, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT );
    canvasNode.clipArea = background.shape!;

    // Title text showing "Snapshot N", overlaid on the snapshot image
    const titleText = new Text( '', {
      font: TITLE_FONT,
      fill: 'white',
      maxWidth: SNAPSHOT_WIDTH - 12
    } );

    // Parameter labels showing the physics settings at the time of capture
    const slitSepText = new Text( '', { font: PARAM_FONT, fill: 'black', maxWidth: 130 } );
    const screenDistText = new Text( '', { font: PARAM_FONT, fill: 'black', maxWidth: 130 } );
    const wavelengthText = new Text( '', { font: PARAM_FONT, fill: 'black', maxWidth: 130 } );
    const slitSettingText = new Text( '', { font: PARAM_FONT, fill: QuantumWaveInterferenceColors.snapshotSecondaryTextFillProperty, maxWidth: 130 } );
    const detectionModeText = new Text( '', { font: PARAM_FONT, fill: QuantumWaveInterferenceColors.snapshotSecondaryTextFillProperty, maxWidth: 130 } );

    const parameterLabels = new VBox( {
      spacing: 2,
      align: 'left',
      children: [ slitSepText, screenDistText, wavelengthText, slitSettingText, detectionModeText ]
    } );

    // Update all text content when the snapshot changes
    snapshotProperty.link( snapshot => {
      if ( snapshot ) {
        titleText.string = StringUtils.fillIn(
          QuantumWaveInterferenceFluent.snapshotNumberPatternStringProperty.value,
          {
            number: snapshot.snapshotNumber
          }
        );

        // Slit separation: use μm for small values (< 0.1 mm) for readability
        if ( snapshot.slitSeparation < 0.1 ) {
          const valueUM = snapshot.slitSeparation * 1000;
          slitSepText.string = StringUtils.fillIn(
            QuantumWaveInterferenceFluent.slitSeparationMicrometerValuePatternStringProperty.value,
            {
              value: toFixed( valueUM, 1 )
            }
          );
        }
 else {
          slitSepText.string = StringUtils.fillIn(
            QuantumWaveInterferenceFluent.slitSeparationValuePatternStringProperty.value,
            {
              value: toFixed( snapshot.slitSeparation, 2 )
            }
          );
        }

        // Screen distance: D = X.X m
        screenDistText.string = StringUtils.fillIn(
          QuantumWaveInterferenceFluent.screenDistanceValuePatternStringProperty.value,
          {
            value: toFixed( snapshot.screenDistance, 1 )
          }
        );

        // Wavelength: show the photon wavelength directly, or the de Broglie wavelength for particles
        if ( snapshot.sourceType === 'photons' ) {
          wavelengthText.string = StringUtils.fillIn(
            QuantumWaveInterferenceFluent.wavelengthPatternStringProperty.value,
            {
              value: Utils.roundSymmetric( snapshot.wavelength )
            }
          );
        }
 else {
          // Convert effective wavelength from meters to nanometers for display
          const lambdaNm = snapshot.effectiveWavelength * 1e9;
          wavelengthText.string = StringUtils.fillIn(
            QuantumWaveInterferenceFluent.deBroglieWavelengthPatternStringProperty.value,
            {
              value: toFixed( lambdaNm, 3 )
            }
          );
        }

        // Slit setting (only show if not the default "Both open")
        if ( snapshot.slitSetting !== 'BOTH_OPEN' ) {
          const displayProperty = SLIT_SETTING_DISPLAY_MAP[ snapshot.slitSetting ];
          slitSettingText.string = displayProperty ? displayProperty.value : snapshot.slitSetting;
          slitSettingText.visible = true;
        }
 else {
          slitSettingText.visible = false;
        }

        // Detection mode
        detectionModeText.string =
          snapshot.detectionMode === 'hits'
            ? QuantumWaveInterferenceFluent.hitsStringProperty.value
            : QuantumWaveInterferenceFluent.averageIntensityStringProperty.value;
      }

      titleText.left = 6;
      titleText.top = 4;
      canvasNode.invalidatePaint();
    } );

    const trashButton = new TrashButton( {
      listener: () => {
        const snapshot = snapshotProperty.value;
        if ( snapshot ) {
          sceneModel.deleteSnapshot( snapshot );
        }
      },
      iconOptions: {
        scale: 0.6
      },
      touchAreaXDilation: 8,
      touchAreaYDilation: 8
    } );

    // Layout: [snapshot image] [parameter labels] [trash button]
    const contentBox = new HBox( {
      spacing: 10,
      align: 'center',
      children: [
        new Node( { children: [ background, canvasNode, titleText ] } ),
        parameterLabels,
        trashButton
      ]
    } );

    super( {
      children: [ contentBox ],
      visibleProperty: new DerivedProperty( [ snapshotProperty ], snapshot => snapshot !== null )
    } );
  }
}

/**
 * Canvas node that renders the snapshot content (hits or intensity).
 */
class SnapshotCanvasNode extends CanvasNode {
  private readonly snapshotProperty: TReadOnlyProperty<Snapshot | null>;

  public constructor(
    snapshotProperty: TReadOnlyProperty<Snapshot | null>,
    width: number,
    height: number
  ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, width, height )
    } );
    this.snapshotProperty = snapshotProperty;
  }

  public paintCanvas( context: CanvasRenderingContext2D ): void {
    const snapshot = this.snapshotProperty.value;
    if ( !snapshot ) {
      return;
    }

    if ( snapshot.detectionMode === 'hits' ) {
      this.paintHits( context, snapshot );
    }
 else {
      this.paintIntensity( context, snapshot );
    }
  }

  private paintHits( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    const hits = snapshot.hits;
    if ( hits.length === 0 ) {
      return;
    }

    const width = SNAPSHOT_WIDTH;
    const height = SNAPSHOT_HEIGHT;
    const displayGain = getHitsDisplayGain( snapshot.brightness );
    const colorScale = Math.max( 1, displayGain );
    const coreAlpha = Utils.clamp( displayGain, 0, 1 );

    // Hit color based on source type
    if ( snapshot.sourceType === 'photons' ) {
      const color = VisibleColor.wavelengthToColor( snapshot.wavelength );
      const scaledR = Utils.clamp( Utils.roundSymmetric( color.red * colorScale ), 0, 255 );
      const scaledG = Utils.clamp( Utils.roundSymmetric( color.green * colorScale ), 0, 255 );
      const scaledB = Utils.clamp( Utils.roundSymmetric( color.blue * colorScale ), 0, 255 );
      context.fillStyle = `rgba(${scaledR},${scaledG},${scaledB},${coreAlpha})`;
    }
 else {
      context.fillStyle = `rgba(255,255,255,${coreAlpha})`;
    }

    // Use fillRect for performance — at the snapshot's small scale (1px dots), squares and
    // circles are visually indistinguishable.
    const dotDiameter = HIT_DOT_RADIUS * 2;
    for ( let i = 0; i < hits.length; i++ ) {
      const hit = hits[ i ];
      const viewX = ( ( hit.x + 1 ) / 2 ) * width;
      const viewY = ( ( hit.y + 1 ) / 2 ) * height;
      context.fillRect( viewX - HIT_DOT_RADIUS, viewY - HIT_DOT_RADIUS, dotDiameter, dotDiameter );
    }
  }

  private paintIntensity( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    const hits = snapshot.hits;
    if ( hits.length === 0 ) {
      return;
    }

    const width = SNAPSHOT_WIDTH;
    const height = SNAPSHOT_HEIGHT;
    const binWidth = width / INTENSITY_BINS;
    const displayGain = getIntensityDisplayGain( snapshot.brightness, snapshot.intensity );

    // Bin the captured hits to reproduce the actual accumulated pattern that was displayed
    // on screen at capture time, rather than the theoretical intensity formula. This makes
    // snapshots faithfully capture the state of the screen including statistical noise from
    // limited sampling, which is pedagogically meaningful: early snapshots show granular
    // patterns while later snapshots show smoother convergence to the theoretical curve.
    const bins = new Array<number>( INTENSITY_BINS ).fill( 0 );
    let maxBin = 0;
    for ( let i = 0; i < hits.length; i++ ) {
      const binIndex = Math.min(
        INTENSITY_BINS - 1,
        Math.max( 0, Math.floor( ( ( hits[ i ].x + 1 ) / 2 ) * INTENSITY_BINS ) )
      );
      bins[ binIndex ]++;
      if ( bins[ binIndex ] > maxBin ) {
        maxBin = bins[ binIndex ];
      }
    }

    if ( maxBin === 0 ) {
      return;
    }

    for ( let i = 0; i < INTENSITY_BINS; i++ ) {
      if ( bins[ i ] > 0 ) {
        const intensity = bins[ i ] / maxBin;
        const intensityScale = intensity * displayGain;

        if ( intensityScale > 0.01 ) {
          if ( snapshot.sourceType === 'photons' ) {
            const color = VisibleColor.wavelengthToColor( snapshot.wavelength );
            const r = Utils.clamp( Utils.roundSymmetric( color.red * intensityScale ), 0, 255 );
            const g = Utils.clamp( Utils.roundSymmetric( color.green * intensityScale ), 0, 255 );
            const b = Utils.clamp( Utils.roundSymmetric( color.blue * intensityScale ), 0, 255 );
            context.fillStyle = `rgb(${r},${g},${b})`;
          }
 else {
            context.fillStyle = `rgba(255,255,255,${Utils.clamp( intensityScale, 0, 1 )})`;
          }
          context.fillRect( i * binWidth, 0, binWidth + 0.5, height );
        }
      }
    }
  }
}

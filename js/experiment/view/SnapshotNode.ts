// Copyright 2026, University of Colorado Boulder

/**
 * TODO: This file is large (~460 lines). Consider moving SnapshotCanvasNode to a separate file, see https://github.com/phetsims/quantum-wave-interference/issues/9
 *
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
import SceneryPhetFluent from '../../../../scenery-phet/js/SceneryPhetFluent.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import Snapshot from '../model/Snapshot.js';

// Snapshot display dimensions (scaled down from the full detector screen)
const SNAPSHOT_WIDTH = 360;
const SNAPSHOT_HEIGHT = 132;
const FULL_SCREEN_TEXTURE_WIDTH = ExperimentConstants.DETECTOR_SCREEN_WIDTH;
const FULL_SCREEN_TEXTURE_HEIGHT = ExperimentConstants.FRONT_FACING_ROW_HEIGHT;
const CORNER_RADIUS = 6;
const METADATA_WIDTH = 165;
const HIT_CORE_RADIUS = 2.0;
const HIT_GLOW_RADIUS = 3.4;
const INTENSITY_SCREEN_BRIGHTNESS_MIN_MULTIPLIER = 1.2;
const INTENSITY_SCREEN_BRIGHTNESS_MAX_MULTIPLIER = 6.0;
const INTENSITY_BRIGHTNESS_MAX_MULTIPLIER = 0.8;
const HITS_SCREEN_BRIGHTNESS_MIN_MULTIPLIER = 0.1;
const HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER = 1.8; // previous default hits gain
const HITS_CORE_ALPHA_MIN = 0.2;
const HITS_CORE_ALPHA_MIDPOINT_MAX = 1;
const HITS_GLOW_ALPHA_MAX = 0.15;
const HITS_GLOW_START_FRACTION = 0.5;
const MAX_RENDERED_SNAPSHOT_HITS = 100000;

const PARAM_FONT = new PhetFont( 12 );
const TITLE_FONT = new PhetFont( { size: 16, weight: 'bold' } );

const SOURCE_TYPE_DISPLAY_MAP: Record<string, TReadOnlyProperty<string>> = {
  photons: QuantumWaveInterferenceFluent.photonsStringProperty,
  electrons: QuantumWaveInterferenceFluent.electronsStringProperty,
  neutrons: QuantumWaveInterferenceFluent.neutronsStringProperty,
  heliumAtoms: QuantumWaveInterferenceFluent.heliumAtomsStringProperty
};

const SLIT_SETTING_DISPLAY_MAP: Record<string, TReadOnlyProperty<string>> = {
  BOTH_OPEN: QuantumWaveInterferenceFluent.bothOpenStringProperty,
  LEFT_COVERED: QuantumWaveInterferenceFluent.leftCoveredStringProperty,
  RIGHT_COVERED: QuantumWaveInterferenceFluent.rightCoveredStringProperty,
  LEFT_DETECTOR: QuantumWaveInterferenceFluent.leftDetectorStringProperty,
  RIGHT_DETECTOR: QuantumWaveInterferenceFluent.rightDetectorStringProperty,
  bothOpen: QuantumWaveInterferenceFluent.bothOpenStringProperty,
  leftCovered: QuantumWaveInterferenceFluent.leftCoveredStringProperty,
  rightCovered: QuantumWaveInterferenceFluent.rightCoveredStringProperty,
  leftDetector: QuantumWaveInterferenceFluent.leftDetectorStringProperty,
  rightDetector: QuantumWaveInterferenceFluent.rightDetectorStringProperty
};

// TODO: Duplicated code fragment - these brightness/alpha functions are duplicated from getDetectorScreenTexture.ts. Factor to shared utility, see https://github.com/phetsims/quantum-wave-interference/issues/9
// TODO: Avoid deprecated methods from Utils. (Utils.clamp, Utils.linear, Utils.roundSymmetric used throughout this file), see https://github.com/phetsims/quantum-wave-interference/issues/9
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

const getHitsBrightnessFraction = ( brightness: number ): number => {
  return Utils.clamp( brightness / SceneModel.SCREEN_BRIGHTNESS_MAX, 0, 1 );
};

const getHitsCoreAlpha = ( brightnessFraction: number ): number => {
  const clampedFraction = Utils.clamp( brightnessFraction, 0, 1 );
  if ( clampedFraction <= HITS_GLOW_START_FRACTION ) {
    return Utils.linear(
      0,
      HITS_GLOW_START_FRACTION,
      HITS_CORE_ALPHA_MIN,
      HITS_CORE_ALPHA_MIDPOINT_MAX,
      clampedFraction
    );
  }
  return HITS_CORE_ALPHA_MIDPOINT_MAX;
};

const getHitsGlowAlpha = ( brightnessFraction: number ): number => {
  const clampedFraction = Utils.clamp( brightnessFraction, 0, 1 );
  if ( clampedFraction <= HITS_GLOW_START_FRACTION ) {
    return 0;
  }
  return Utils.linear( HITS_GLOW_START_FRACTION, 1, 0, HITS_GLOW_ALPHA_MAX, clampedFraction );
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
    const canvasNode = new SnapshotCanvasNode( snapshotProperty, sceneModel, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT );
    canvasNode.clipArea = background.shape!;

    // Title text shown as a heading above the metadata on the right side
    const titleText = new Text( '', {
      font: TITLE_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH
    } );

    // Parameter labels showing the physics settings at the time of capture
    const sceneNameText = new Text( '', { font: PARAM_FONT, fill: 'black', maxWidth: METADATA_WIDTH } );
    const wavelengthOrSpeedText = new Text( '', { font: PARAM_FONT, fill: 'black', maxWidth: METADATA_WIDTH } );
    const slitSepText = new Text( '', { font: PARAM_FONT, fill: 'black', maxWidth: METADATA_WIDTH } );
    const screenDistText = new Text( '', { font: PARAM_FONT, fill: 'black', maxWidth: METADATA_WIDTH } );
    const slitSettingText = new Text( '', { font: PARAM_FONT, fill: 'black', maxWidth: METADATA_WIDTH } );

    const parameterLabels = new VBox( {
      spacing: 2,
      align: 'left',
      children: [ sceneNameText, wavelengthOrSpeedText, slitSepText, screenDistText, slitSettingText ]
    } );

    // Update all text content when the snapshot changes
    // TODO: This callback uses many StringProperties (snapshotNumberPatternStringProperty, slitSeparationStringProperty, screenDistanceStringProperty, wavelengthStringProperty, particleSpeedStringProperty, etc.) that are not dependencies. Locale changes won't trigger updates, see https://github.com/phetsims/quantum-wave-interference/issues/9
    snapshotProperty.link( snapshot => {
      if ( snapshot ) {
        titleText.string = StringUtils.fillIn(
          QuantumWaveInterferenceFluent.snapshotNumberPatternStringProperty.value,
          {
            number: index + 1
          }
        );
        const sourceTypeDisplayProperty = SOURCE_TYPE_DISPLAY_MAP[ snapshot.sourceType ];
        sceneNameText.string = sourceTypeDisplayProperty ? sourceTypeDisplayProperty.value : snapshot.sourceType;

        // Slit separation: use μm for small values (< 0.1 mm) for readability
        if ( snapshot.slitSeparation < 0.1 ) {
          const valueUM = snapshot.slitSeparation * 1000;
          slitSepText.string = `${QuantumWaveInterferenceFluent.slitSeparationStringProperty.value}: ${toFixed( valueUM, 1 )} μm`; // TODO: This must be i18n in the yaml file, see https://github.com/phetsims/quantum-wave-interference/issues/9
        }
        else {
          slitSepText.string = `${QuantumWaveInterferenceFluent.slitSeparationStringProperty.value}: ${toFixed( snapshot.slitSeparation, 2 )} mm`; // TODO: This must be i18n in the yaml file, see https://github.com/phetsims/quantum-wave-interference/issues/9
        }

        screenDistText.string = `${QuantumWaveInterferenceFluent.screenDistanceStringProperty.value}: ${toFixed( snapshot.screenDistance, 1 )} m`; // TODO: This must be i18n in the yaml file, see https://github.com/phetsims/quantum-wave-interference/issues/9

        // Show photon wavelength directly, and particle speed for matter-wave scenes.
        if ( snapshot.sourceType === 'photons' ) {
          wavelengthOrSpeedText.string = `${SceneryPhetFluent.wavelengthStringProperty.value}: ${Utils.roundSymmetric( snapshot.wavelength )} nm`; // TODO: This must be i18n in the yaml file, see https://github.com/phetsims/quantum-wave-interference/issues/9
        }
        else {
          // TODO: These physical constants (particle masses, Planck's constant) should be named constants, not magic numbers. Also duplicated from SceneModel, see https://github.com/phetsims/quantum-wave-interference/issues/9
          const particleMass =
            snapshot.sourceType === 'electrons' ? 9.109e-31 :
            snapshot.sourceType === 'neutrons' ? 1.675e-27 :
            6.646e-27;
          const speed = snapshot.effectiveWavelength === 0 ? 0 : 6.626e-34 / ( particleMass * snapshot.effectiveWavelength );
          if ( speed >= 10000 ) {
            wavelengthOrSpeedText.string = StringUtils.fillIn(
              QuantumWaveInterferenceFluent.particleSpeedKmPerSecondPatternStringProperty.value,
              {
                value: Utils.roundSymmetric( speed / 1000 )
              }
            );
            wavelengthOrSpeedText.string = `${QuantumWaveInterferenceFluent.particleSpeedStringProperty.value}: ${wavelengthOrSpeedText.string}`;
          }
          else {
            wavelengthOrSpeedText.string = `${QuantumWaveInterferenceFluent.particleSpeedStringProperty.value}: ${Utils.roundSymmetric( speed )} m/s`; // TODO: This must be i18n in the yaml file, see https://github.com/phetsims/quantum-wave-interference/issues/9
          }
        }

        const slitSettingDisplayProperty = SLIT_SETTING_DISPLAY_MAP[ snapshot.slitSetting ];
        const slitSettingDisplayString = slitSettingDisplayProperty ? slitSettingDisplayProperty.value : snapshot.slitSetting;
        slitSettingText.string = `Slits: ${slitSettingDisplayString}`; // TODO: "Slits:" must be i18n in the yaml file, see https://github.com/phetsims/quantum-wave-interference/issues/9
      }

      canvasNode.invalidatePaint();
    } );

    const trashButton = new TrashButton( {
      listener: () => {
        const snapshot = snapshotProperty.value;
        if ( snapshot ) {
          sceneModel.deleteSnapshot( snapshot );
        }
      },
      soundPlayer: sharedSoundPlayers.get( 'erase' ),
      baseColor: QuantumWaveInterferenceColors.screenButtonBaseColorProperty,
      iconOptions: {
        scale: 0.6
      },
      touchAreaXDilation: 8,
      touchAreaYDilation: 8
    } );

    const metadataContent = new VBox( {
      spacing: 6,
      align: 'left',
      children: [ titleText, parameterLabels ]
    } );

    const metadataColumn = new Node( {
      children: [
        new Rectangle( 0, 0, METADATA_WIDTH, SNAPSHOT_HEIGHT, {
          fill: 'rgba( 0, 0, 0, 0 )',
          stroke: null,
          pickable: false
        } ),
        metadataContent,
        trashButton
      ]
    } );
    metadataContent.left = 0;
    metadataContent.top = 0;
    trashButton.left = 0;
    trashButton.bottom = SNAPSHOT_HEIGHT;

    // Layout: [snapshot image] [parameter labels + trash button]
    const contentBox = new HBox( {
      spacing: 10,
      align: 'top',
      children: [
        new Node( { children: [ background, canvasNode ] } ),
        metadataColumn
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
  private readonly sceneModel: SceneModel;
  private readonly intensityTextureCanvas: HTMLCanvasElement;
  private readonly intensityTextureContext: CanvasRenderingContext2D;

  public constructor(
    snapshotProperty: TReadOnlyProperty<Snapshot | null>,
    sceneModel: SceneModel,
    width: number,
    height: number
  ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, width, height )
    } );
    // TODO: Do we want to use parameter properties throughout this sim, see https://github.com/phetsims/quantum-wave-interference/issues/9
    this.snapshotProperty = snapshotProperty;
    this.sceneModel = sceneModel;
    this.intensityTextureCanvas = document.createElement( 'canvas' );
    this.intensityTextureCanvas.width = FULL_SCREEN_TEXTURE_WIDTH;
    this.intensityTextureCanvas.height = FULL_SCREEN_TEXTURE_HEIGHT;

    const intensityTextureContext = this.intensityTextureCanvas.getContext( '2d' );
    if ( !intensityTextureContext ) {
      throw new Error( 'Could not create 2D context for snapshot intensity texture' );
    }
    this.intensityTextureContext = intensityTextureContext;
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
    const brightnessFraction = getHitsBrightnessFraction( snapshot.brightness );
    const coreAlpha = getHitsCoreAlpha( brightnessFraction );
    const glowAlpha = getHitsGlowAlpha( brightnessFraction );
    const glowRadius = HIT_GLOW_RADIUS * Math.min( 2, Math.sqrt( Math.max( 1, displayGain ) ) );

    const baseRGB =
      snapshot.sourceType === 'photons'
      ? VisibleColor.wavelengthToColor( snapshot.wavelength )
      : { red: 255, green: 255, blue: 255 };
    const scaledR = baseRGB.red;
    const scaledG = baseRGB.green;
    const scaledB = baseRGB.blue;

    const hitCount = hits.length;
    const renderCount = Math.min( hitCount, MAX_RENDERED_SNAPSHOT_HITS );
    const startIndex = hitCount - renderCount;

    const drawHits = ( alpha: number, radius: number ): void => {
      if ( alpha === 0 ) {
        return;
      }
      context.fillStyle = `rgba(${scaledR},${scaledG},${scaledB},${alpha})`;
      for ( let i = startIndex; i < hitCount; i++ ) {
        const hit = hits[ i ];
        const viewX = ( ( hit.x + 1 ) / 2 ) * width;
        const viewY = ( ( hit.y + 1 ) / 2 ) * height;
        context.beginPath();
        context.arc( viewX, viewY, radius, 0, Math.PI * 2 );
        context.fill();
      }
    };

    // Match the front-facing detector rendering order: glow pass, then core pass.
    drawHits( glowAlpha, glowRadius );
    drawHits( coreAlpha, HIT_CORE_RADIUS );
  }

  private paintIntensity( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    const textureContext = this.intensityTextureContext;
    textureContext.clearRect( 0, 0, FULL_SCREEN_TEXTURE_WIDTH, FULL_SCREEN_TEXTURE_HEIGHT );

    if ( !snapshot.isEmitting ) {
      return;
    }

    const lambda = snapshot.effectiveWavelength;
    if ( lambda === 0 ) {
      return;
    }

    const displayGain = getIntensityDisplayGain( snapshot.brightness, snapshot.intensity );
    const screenHalfWidth = this.sceneModel.screenHalfWidth;
    const slitWidthMeters = this.sceneModel.slitWidth * 1e-3;
    const d = snapshot.slitSeparation * 1e-3; // TODO: Use descriptive names (e.g. slitSeparationMeters) instead of single-letter physics variables, see https://github.com/phetsims/quantum-wave-interference/issues/9
    const L = snapshot.screenDistance; // TODO: Use descriptive names (e.g. screenDistanceMeters) instead of single-letter physics variables, see https://github.com/phetsims/quantum-wave-interference/issues/9
    const slitSetting = snapshot.slitSetting;
    const isSingleSlit =
      slitSetting === 'leftCovered' ||
      slitSetting === 'rightCovered' ||
      slitSetting === 'leftDetector' ||
      slitSetting === 'rightDetector';

    const photonColor = snapshot.sourceType === 'photons'
                        ? VisibleColor.wavelengthToColor( snapshot.wavelength )
                        : null;

    for ( let x = 0; x < FULL_SCREEN_TEXTURE_WIDTH; x++ ) {
      const fraction = ( x + 0.5 ) / FULL_SCREEN_TEXTURE_WIDTH;
      const physicalX = ( fraction - 0.5 ) * 2 * screenHalfWidth;
      const sinTheta = physicalX / Math.sqrt( physicalX * physicalX + L * L );

      const singleSlitArg = Math.PI * slitWidthMeters * sinTheta / lambda;
      const singleSlitFactor = singleSlitArg === 0 ? 1 : Math.pow( Math.sin( singleSlitArg ) / singleSlitArg, 2 );

      const intensity =
        isSingleSlit
        ? singleSlitFactor
        : Math.pow( Math.cos( Math.PI * d * sinTheta / lambda ), 2 ) * singleSlitFactor;

      const intensityScale = intensity * displayGain;
      if ( intensityScale < 0.004 ) { // TODO: Document this magic number threshold, see https://github.com/phetsims/quantum-wave-interference/issues/9
        continue;
      }

      if ( photonColor ) {
        const r = Utils.clamp( Utils.roundSymmetric( photonColor.red * intensityScale ), 0, 255 );
        const g = Utils.clamp( Utils.roundSymmetric( photonColor.green * intensityScale ), 0, 255 );
        const b = Utils.clamp( Utils.roundSymmetric( photonColor.blue * intensityScale ), 0, 255 );
        textureContext.fillStyle = `rgb(${r},${g},${b})`;
      }
      else {
        const value = Utils.clamp( Utils.roundSymmetric( 255 * intensityScale ), 0, 255 );
        textureContext.fillStyle = `rgb(${value},${value},${value})`;
      }
      textureContext.fillRect( x, 0, 1, FULL_SCREEN_TEXTURE_HEIGHT );
    }

    context.save();
    context.imageSmoothingEnabled = true;
    context.drawImage( this.intensityTextureCanvas, 0, 0, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT );
    context.restore();
  }
}

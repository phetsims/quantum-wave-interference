// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotNode displays a single snapshot in the SnapshotsDialog for the High Intensity and Single Particles screens.
 * It shows a miniature rendering of the detector screen state at the time the snapshot was taken, along with a title,
 * key physics parameters (source type, wavelength/speed, slit separation, slit configuration), and a delete button.
 *
 * Adapted from experiment/view/SnapshotNode.ts for use with common types.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import TrashButton from '../../../../scenery-phet/js/buttons/TrashButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SceneryPhetFluent from '../../../../scenery-phet/js/SceneryPhetFluent.js';
import SceneryPhetStrings from '../../../../scenery-phet/js/SceneryPhetStrings.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import { type SourceType } from '../model/SourceType.js';
import { type SlitConfiguration } from '../model/SlitConfiguration.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import Snapshot from '../model/Snapshot.js';
import { BASE_HIT_CORE_RADIUS, BASE_HIT_GLOW_RADIUS, getHitsBrightnessFraction, getHitsCoreAlpha, getHitsDisplayGain, getHitsGlowAlpha, getIntensityDisplayGain, PERCEPTUAL_VISIBILITY_THRESHOLD } from './ScreenBrightnessUtils.js';

const SNAPSHOT_WIDTH = 360;
const SNAPSHOT_HEIGHT = 132;
const CORNER_RADIUS = 6;
const METADATA_WIDTH = 165;
const MAX_RENDERED_SNAPSHOT_HITS = 100000;

const PARAM_FONT = new PhetFont( 12 );
const TITLE_FONT = new PhetFont( { size: 16, weight: 'bold' } );

const SOURCE_TYPE_DISPLAY_MAP: Record<SourceType, TReadOnlyProperty<string>> = {
  photons: QuantumWaveInterferenceFluent.photonsStringProperty,
  electrons: QuantumWaveInterferenceFluent.electronsStringProperty,
  neutrons: QuantumWaveInterferenceFluent.neutronsStringProperty,
  heliumAtoms: QuantumWaveInterferenceFluent.heliumAtomsStringProperty
};

const SLIT_SETTING_DISPLAY_MAP: Record<SlitConfiguration, TReadOnlyProperty<string>> = {
  bothOpen: QuantumWaveInterferenceFluent.bothOpenStringProperty,
  leftCovered: QuantumWaveInterferenceFluent.topCoveredStringProperty,
  rightCovered: QuantumWaveInterferenceFluent.bottomCoveredStringProperty,
  leftDetector: QuantumWaveInterferenceFluent.topDetectorStringProperty,
  rightDetector: QuantumWaveInterferenceFluent.bottomDetectorStringProperty,
  bothDetectors: QuantumWaveInterferenceFluent.bothDetectorsStringProperty
};

type SnapshotNodeOptions = {
  snapshotsProperty: TReadOnlyProperty<Snapshot[]>;
  deleteSnapshot: ( snapshot: Snapshot ) => void;
};

export default class SnapshotNode extends Node {
  public constructor( index: number, options: SnapshotNodeOptions ) {

    const snapshotProperty: TReadOnlyProperty<Snapshot | null> = new DerivedProperty(
      [ options.snapshotsProperty ],
      snapshots => ( index < snapshots.length ? snapshots[ index ] : null )
    );

    const ifSnapshot = <T>( compute: ( snapshot: Snapshot ) => T, empty: T ): ( snapshot: Snapshot | null ) => T =>
      snapshot => snapshot ? compute( snapshot ) : empty;

    const sourceTypeDisplayDeps = [
      SOURCE_TYPE_DISPLAY_MAP.photons,
      SOURCE_TYPE_DISPLAY_MAP.electrons,
      SOURCE_TYPE_DISPLAY_MAP.neutrons,
      SOURCE_TYPE_DISPLAY_MAP.heliumAtoms
    ] as const;
    const slitSettingDisplayDeps = [
      SLIT_SETTING_DISPLAY_MAP.bothOpen,
      SLIT_SETTING_DISPLAY_MAP.leftCovered,
      SLIT_SETTING_DISPLAY_MAP.rightCovered,
      SLIT_SETTING_DISPLAY_MAP.leftDetector,
      SLIT_SETTING_DISPLAY_MAP.rightDetector,
      SLIT_SETTING_DISPLAY_MAP.bothDetectors
    ] as const;

    const titleProperty = new DerivedProperty(
      [ snapshotProperty, QuantumWaveInterferenceFluent.snapshotNumberPatternStringProperty ],
      ( snapshot, pattern ) => snapshot
                               ? StringUtils.fillIn( pattern, { number: index + 1 } )
                               : ''
    );

    const sceneNameProperty = new DerivedProperty(
      [ snapshotProperty, ...sourceTypeDisplayDeps ],
      ifSnapshot( snapshot => SOURCE_TYPE_DISPLAY_MAP[ snapshot.sourceType ].value, '' )
    );

    const formatLabelValue = ( label: string, value: string ): string => StringUtils.fillIn(
      QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.value,
      { label: label, value: value }
    );

    const slitSeparationProperty = new DerivedProperty(
      [
        snapshotProperty,
        QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
        QuantumWaveInterferenceFluent.slitSeparationStringProperty,
        QuantumWaveInterferenceFluent.valueMicrometersPatternStringProperty,
        QuantumWaveInterferenceFluent.valueMillimetersPatternStringProperty
      ],
      ifSnapshot( snapshot => {
        const slitSepValue = snapshot.slitSeparation < 0.1
                             ? StringUtils.fillIn(
            QuantumWaveInterferenceFluent.valueMicrometersPatternStringProperty.value,
            { value: toFixed( snapshot.slitSeparation * 1000, 1 ) }
          )
                             : StringUtils.fillIn(
            QuantumWaveInterferenceFluent.valueMillimetersPatternStringProperty.value,
            { value: toFixed( snapshot.slitSeparation, 2 ) }
          );
        return formatLabelValue(
          QuantumWaveInterferenceFluent.slitSeparationStringProperty.value,
          slitSepValue
        );
      }, '' )
    );

    const wavelengthOrSpeedProperty = new DerivedProperty(
      [
        snapshotProperty,
        QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
        SceneryPhetFluent.wavelengthStringProperty,
        QuantumWaveInterferenceFluent.particleSpeedStringProperty,
        QuantumWaveInterferenceFluent.wavelengthNanometersPatternStringProperty,
        QuantumWaveInterferenceFluent.particleSpeedKmPerSecondPatternStringProperty,
        QuantumWaveInterferenceFluent.particleSpeedMeterPerSecondPatternStringProperty
      ],
      ifSnapshot( snapshot => {
        if ( snapshot.sourceType === 'photons' ) {
          const wavelengthValue = StringUtils.fillIn(
            QuantumWaveInterferenceFluent.wavelengthNanometersPatternStringProperty.value,
            { value: roundSymmetric( snapshot.wavelength ) }
          );
          return formatLabelValue( SceneryPhetFluent.wavelengthStringProperty.value, wavelengthValue );
        }
        const sourceType = snapshot.sourceType;
        const particleMass = sourceType === 'electrons' ? QuantumWaveInterferenceConstants.ELECTRON_MASS :
                             sourceType === 'neutrons' ? QuantumWaveInterferenceConstants.NEUTRON_MASS :
                             sourceType === 'heliumAtoms' ? QuantumWaveInterferenceConstants.HELIUM_ATOM_MASS :
                             ( () => { throw new Error( `Unrecognized sourceType: ${sourceType}` ); } )();
        const speed = snapshot.effectiveWavelength === 0 ? 0 : QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( particleMass * snapshot.effectiveWavelength );
        const speedValue = speed >= 10000
                           ? StringUtils.fillIn(
            QuantumWaveInterferenceFluent.particleSpeedKmPerSecondPatternStringProperty.value,
            { value: roundSymmetric( speed / 1000 ) }
          )
                           : StringUtils.fillIn(
            QuantumWaveInterferenceFluent.particleSpeedMeterPerSecondPatternStringProperty.value,
            { value: roundSymmetric( speed ) }
          );
        return formatLabelValue( QuantumWaveInterferenceFluent.particleSpeedStringProperty.value, speedValue );
      }, '' )
    );

    const slitSettingProperty = new DerivedProperty(
      [
        snapshotProperty,
        QuantumWaveInterferenceFluent.slitsLabelPatternStringProperty,
        ...slitSettingDisplayDeps
      ],
      ifSnapshot( snapshot => StringUtils.fillIn(
        QuantumWaveInterferenceFluent.slitsLabelPatternStringProperty.value,
        { setting: SLIT_SETTING_DISPLAY_MAP[ snapshot.slitSetting ].value }
      ), '' )
    );

    const trashButtonAccessibleNameProperty = new DerivedProperty(
      [ snapshotProperty, SceneryPhetStrings.key.deleteStringProperty, titleProperty ],
      ( snapshot, deleteString, title ) => snapshot ? `${deleteString} ${title}` : ''
    );

    const background = new Rectangle(
      0, 0, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT,
      CORNER_RADIUS, CORNER_RADIUS,
      {
        fill: 'black',
        stroke: QuantumWaveInterferenceColors.snapshotStrokeProperty,
        lineWidth: 1
      }
    );

    const canvasNode = new SnapshotCanvasNode(
      snapshotProperty, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT
    );
    canvasNode.clipArea = background.shape!;

    const titleText = new Text( titleProperty, {
      font: TITLE_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH
    } );

    const sceneNameText = new Text( sceneNameProperty, {
      font: PARAM_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH
    } );
    const wavelengthOrSpeedText = new Text( wavelengthOrSpeedProperty, {
      font: PARAM_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH
    } );
    const slitSepText = new Text( slitSeparationProperty, {
      font: PARAM_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH
    } );
    const slitSettingText = new Text( slitSettingProperty, {
      font: PARAM_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH
    } );

    const parameterLabels = new VBox( {
      spacing: 2,
      align: 'left',
      children: [ sceneNameText, wavelengthOrSpeedText, slitSepText, slitSettingText ]
    } );

    snapshotProperty.link( () => canvasNode.invalidatePaint() );

    const trashButton = new TrashButton( {
      listener: () => {
        const snapshot = snapshotProperty.value;
        if ( snapshot ) {
          options.deleteSnapshot( snapshot );
        }
      },
      soundPlayer: sharedSoundPlayers.get( 'erase' ),
      baseColor: QuantumWaveInterferenceColors.screenButtonBaseColorProperty,
      accessibleName: trashButtonAccessibleNameProperty,
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
        metadataContent
      ]
    } );
    metadataContent.left = 0;
    metadataContent.top = 0;

    const contentBox = new HBox( {
      spacing: 10,
      align: 'top',
      children: [
        new Node( { children: [ background, canvasNode ] } ),
        metadataColumn
      ]
    } );
    trashButton.left = SNAPSHOT_WIDTH + 10;
    trashButton.bottom = SNAPSHOT_HEIGHT;

    super( {
      isDisposable: false,
      children: [ contentBox, trashButton ],
      visibleProperty: new DerivedProperty( [ snapshotProperty ], snapshot => snapshot !== null )
    } );
  }
}

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
    const brightnessFraction = getHitsBrightnessFraction( snapshot.brightness );
    const coreAlpha = getHitsCoreAlpha( brightnessFraction );
    const glowAlpha = getHitsGlowAlpha( brightnessFraction );
    const glowRadius = BASE_HIT_GLOW_RADIUS * Math.min( 2, Math.sqrt( Math.max( 1, displayGain ) ) );

    const baseRGB = snapshot.sourceType === 'photons'
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

    drawHits( glowAlpha, glowRadius );
    drawHits( coreAlpha, BASE_HIT_CORE_RADIUS );
  }

  private paintIntensity( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    const distribution = snapshot.intensityDistribution;

    // Snapshots from this common dialog are always produced by a solver-driven scene (High Intensity
    // screen). If the distribution was not captured (e.g., snapshot taken before the solver produced any
    // output, or mode was not averageIntensity at capture time) there is nothing to render.
    if ( distribution.length === 0 ) {
      return;
    }

    const normalizedBrightness = snapshot.brightness / QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX;
    const displayGain = getIntensityDisplayGain( normalizedBrightness, snapshot.intensity );

    const baseColor = snapshot.sourceType === 'photons'
                      ? VisibleColor.wavelengthToColor( snapshot.wavelength )
                      : null;

    // The live detector screen varies its interference pattern along its vertical axis; the snapshot is
    // rendered in landscape (wide and short) so that same pattern maps to the snapshot's horizontal axis.
    const distributionLength = distribution.length;
    for ( let x = 0; x < SNAPSHOT_WIDTH; x++ ) {
      const solverIndex = clamp(
        Math.floor( ( x + 0.5 ) / SNAPSHOT_WIDTH * distributionLength ),
        0, distributionLength - 1
      );
      const intensityScale = distribution[ solverIndex ] * displayGain;
      if ( intensityScale < PERCEPTUAL_VISIBILITY_THRESHOLD ) {
        continue;
      }

      if ( baseColor ) {
        const r = clamp( roundSymmetric( baseColor.red * intensityScale ), 0, 255 );
        const g = clamp( roundSymmetric( baseColor.green * intensityScale ), 0, 255 );
        const b = clamp( roundSymmetric( baseColor.blue * intensityScale ), 0, 255 );
        context.fillStyle = `rgb(${r},${g},${b})`;
      }
      else {
        const value = clamp( roundSymmetric( 255 * intensityScale ), 0, 255 );
        context.fillStyle = `rgb(${value},${value},${value})`;
      }
      context.fillRect( x, 0, 1, SNAPSHOT_HEIGHT );
    }
  }
}

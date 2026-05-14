// Copyright 2026, University of Colorado Boulder

//REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 This file is a bit too large. Consider moving class SnapshotCanvasNode to its own file.
/**
 * SnapshotNode displays a single snapshot in the SnapshotsDialog.
 * It shows a miniature rendering of the detector screen state at the time the snapshot was taken, along with a title,
 * key physics parameters (source type, wavelength/speed, slit separation, slit configuration), and a delete button.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import TrashButton from '../../../../scenery-phet/js/buttons/TrashButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SceneryPhetFluent from '../../../../scenery-phet/js/SceneryPhetFluent.js';
import SceneryPhetStrings from '../../../../scenery-phet/js/SceneryPhetStrings.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';
import type { Snapshot } from '../model/Snapshot.js';
import { type SourceType } from '../model/SourceType.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { getApparentAnalyticalDetectorIntensity } from './ApparentDetectorPattern.js';
import { BASE_HIT_CORE_RADIUS, BASE_HIT_GLOW_RADIUS, getHitsBrightnessFraction, getHitsCoreAlpha, getHitsDisplayGain, getHitsGlowAlpha, getIntensityDisplayGain, getInterpolatedRGBFillStyle, getSceneRGB, sampleSmoothedIntensityDistribution } from './ScreenBrightnessUtils.js';

const SNAPSHOT_WIDTH = 360;
const SNAPSHOT_HEIGHT = 132;
const CORNER_RADIUS = 0;
const METADATA_WIDTH = 165;
const MAX_RENDERED_SNAPSHOT_HITS = 100000;

// Resolution for the offscreen texture canvas used by the analytical intensity rendering path.
const ANALYTICAL_TEXTURE_WIDTH = 376;
const ANALYTICAL_TEXTURE_HEIGHT = 155;
const CAPTURED_INTENSITY_TEXTURE_WIDTH = SNAPSHOT_WIDTH * 4;
const CAPTURED_INTENSITY_TEXTURE_HEIGHT = SNAPSHOT_HEIGHT;
const CAPTURED_INTENSITY_SMOOTHING_RADIUS = 1.5;

const PARAM_FONT = new PhetFont( 12 );
const TITLE_FONT = new PhetFont( { size: 16, weight: 'bold' } );

const SOURCE_TYPE_DISPLAY_MAP: Record<SourceType, TReadOnlyProperty<string>> = {
  photons: QuantumWaveInterferenceFluent.photonsStringProperty,
  electrons: QuantumWaveInterferenceFluent.electronsStringProperty,
  neutrons: QuantumWaveInterferenceFluent.neutronsStringProperty,
  heliumAtoms: QuantumWaveInterferenceFluent.heliumAtomsStringProperty
};

const DEFAULT_SLIT_SETTING_DISPLAY_MAP: Record<SlitConfigurationWithNoBarrier, TReadOnlyProperty<string>> = {
  bothOpen: QuantumWaveInterferenceFluent.bothOpenStringProperty,
  leftCovered: QuantumWaveInterferenceFluent.topCoveredStringProperty,
  rightCovered: QuantumWaveInterferenceFluent.bottomCoveredStringProperty,
  leftDetector: QuantumWaveInterferenceFluent.topDetectorStringProperty,
  rightDetector: QuantumWaveInterferenceFluent.bottomDetectorStringProperty,
  bothDetectors: QuantumWaveInterferenceFluent.bothDetectorsStringProperty,
  noBarrier: QuantumWaveInterferenceFluent.noBarrierStringProperty
};

export type SnapshotNodeOptions = {
  snapshotsProperty: TReadOnlyProperty<Snapshot[]>;
  deleteSnapshot: ( snapshot: Snapshot ) => void;
  slitSettingDisplayMap?: Partial<Record<SlitConfigurationWithNoBarrier, TReadOnlyProperty<string>>>;

  // Formats the slit separation value (in mm) for display. Default uses µm if < 0.1 mm, else mm.
  formatSlitSeparation?: ( slitSepMM: number ) => string;

  // When true, a screen distance row is included in the metadata labels.
  showScreenDistance?: boolean;

  // When provided, the full PDOM structure (section, heading, description paragraph, metadata list) is created.
  getDescription?: ( snapshot: Snapshot ) => string;

  // The front-facing High Intensity and Single Particles detector screens store hit.x as the detector-screen
  // vertical coordinate and hit.y as the horizontal coordinate. Other screens use the conventional x/y mapping.
  useFrontFacingHitCoordinates?: boolean;

  // Optional Experiment detector zoom. When supplied, all snapshots are cropped to the centered visible detector span.
  detectorScreenScaleIndexProperty?: TReadOnlyProperty<number>;
  getVisibleScreenHalfWidth?: () => number;
};

export default class SnapshotNode extends Node {
  private readonly detectorSnapshotSlot: Node;

  public constructor( index: number, options: SnapshotNodeOptions ) {

    const getSlitSettingDisplayProperty = (
      slitConfiguration: SlitConfigurationWithNoBarrier
    ): TReadOnlyProperty<string> => options.slitSettingDisplayMap?.[ slitConfiguration ] ||
                                    DEFAULT_SLIT_SETTING_DISPLAY_MAP[ slitConfiguration ];
    const slitSettingDisplayMap: Record<SlitConfigurationWithNoBarrier, TReadOnlyProperty<string>> = {
      bothOpen: getSlitSettingDisplayProperty( 'bothOpen' ),
      leftCovered: getSlitSettingDisplayProperty( 'leftCovered' ),
      rightCovered: getSlitSettingDisplayProperty( 'rightCovered' ),
      leftDetector: getSlitSettingDisplayProperty( 'leftDetector' ),
      rightDetector: getSlitSettingDisplayProperty( 'rightDetector' ),
      bothDetectors: getSlitSettingDisplayProperty( 'bothDetectors' ),
      noBarrier: getSlitSettingDisplayProperty( 'noBarrier' )
    };

    const defaultFormatSlitSeparation = ( slitSepMM: number ): string => {
      return slitSepMM < 0.1
             ? StringUtils.fillIn(
          QuantumWaveInterferenceFluent.valueMicrometersPatternStringProperty.value,
          { value: toFixed( slitSepMM * 1000, 1 ) }
        )
             : StringUtils.fillIn(
          QuantumWaveInterferenceFluent.valueMillimetersPatternStringProperty.value,
          { value: toFixed( slitSepMM, 2 ) }
        );
    };
    const formatSlitSeparation = options.formatSlitSeparation || defaultFormatSlitSeparation;

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
      slitSettingDisplayMap.bothOpen,
      slitSettingDisplayMap.leftCovered,
      slitSettingDisplayMap.rightCovered,
      slitSettingDisplayMap.leftDetector,
      slitSettingDisplayMap.rightDetector,
      slitSettingDisplayMap.bothDetectors,
      slitSettingDisplayMap.noBarrier
    ] as const;

    const titleProperty = new DerivedProperty(
      [ snapshotProperty, QuantumWaveInterferenceFluent.snapshotNumberPatternStringProperty ],
      ( snapshot, pattern ) => snapshot
                               ? StringUtils.fillIn( pattern, { number: snapshot.snapshotNumber } )
                               : ''
    );

    const sceneNameProperty = new DerivedProperty(
      [ snapshotProperty, ...sourceTypeDisplayDeps ],
      ifSnapshot( snapshot => SOURCE_TYPE_DISPLAY_MAP[ snapshot.sourceType ].value, '' )
    );

    const headingProperty = new DerivedProperty(
      [ titleProperty, sceneNameProperty ],
      ( title, sceneName ) => title ? `${title}: ${sceneName}` : ''
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
      ifSnapshot( snapshot => formatLabelValue(
        QuantumWaveInterferenceFluent.slitSeparationStringProperty.value,
        formatSlitSeparation( snapshot.slitSeparation )
      ), '' )
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
        { setting: slitSettingDisplayMap[ snapshot.slitSetting ].value }
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
      snapshotProperty,
      SNAPSHOT_WIDTH,
      SNAPSHOT_HEIGHT,
      options.useFrontFacingHitCoordinates || false,
      options.getVisibleScreenHalfWidth
    );
    canvasNode.clipArea = background.shape!;
    snapshotProperty.link( () => canvasNode.invalidatePaint() );
    options.detectorScreenScaleIndexProperty?.link( () => canvasNode.invalidatePaint() );

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

    const parameterLabelsChildren: Node[] = [ sceneNameText, wavelengthOrSpeedText, slitSepText ];

    // Conditionally include screen distance row (used by the Experiment screen).
    let screenDistanceProperty: TReadOnlyProperty<string> | null = null;
    if ( options.showScreenDistance ) {
      screenDistanceProperty = new DerivedProperty(
        [
          snapshotProperty,
          QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
          QuantumWaveInterferenceFluent.screenDistanceStringProperty,
          QuantumWaveInterferenceFluent.valueMetersPatternStringProperty
        ],
        ifSnapshot( snapshot => {
          const screenDistValue = StringUtils.fillIn(
            QuantumWaveInterferenceFluent.valueMetersPatternStringProperty.value,
            { value: toFixed( snapshot.screenDistance, 2 ) }
          );
          return formatLabelValue(
            QuantumWaveInterferenceFluent.screenDistanceStringProperty.value,
            screenDistValue
          );
        }, '' )
      );
      parameterLabelsChildren.push( new Text( screenDistanceProperty, {
        font: PARAM_FONT,
        fill: 'black',
        maxWidth: METADATA_WIDTH
      } ) );
    }

    parameterLabelsChildren.push( slitSettingText );

    const parameterLabels = new VBox( {
      spacing: 2,
      align: 'left',
      children: parameterLabelsChildren
    } );

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

    const detectorSnapshotSlot = new Node( {
      children: [
        new Rectangle( 0, 0, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT, {
          fill: 'rgba( 0, 0, 0, 0 )',
          stroke: null,
          pickable: false
        } ),
        background,
        canvasNode
      ]
    } );

    const contentBox = new HBox( {
      spacing: 10,
      align: 'top',
      children: [
        detectorSnapshotSlot,
        metadataColumn
      ]
    } );
    trashButton.left = SNAPSHOT_WIDTH + 10;
    trashButton.bottom = SNAPSHOT_HEIGHT;

    const nodeChildren: Node[] = [ contentBox, trashButton ];

    // Build PDOM structure when a description provider is supplied (Experiment screen).
    if ( options.getDescription ) {
      const getDescription = options.getDescription;

      const descriptionProperty = options.detectorScreenScaleIndexProperty ?
                                  new DerivedProperty(
                                    [ snapshotProperty, options.detectorScreenScaleIndexProperty ],
                                    snapshot => snapshot ? getDescription( snapshot ) : ''
                                  ) :
                                  snapshotProperty.derived(
                                    snapshot => snapshot ? getDescription( snapshot ) : ''
                                  );
      const descriptionNode = new Node( {
        accessibleParagraph: descriptionProperty
      } );

      const experimentTypeListItemProperty = new DerivedProperty(
        [
          snapshotProperty,
          QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
          QuantumWaveInterferenceFluent.a11y.sceneRadioButtonGroup.accessibleNameStringProperty,
          ...sourceTypeDisplayDeps
        ],
        ifSnapshot( snapshot => formatLabelValue(
          QuantumWaveInterferenceFluent.a11y.sceneRadioButtonGroup.accessibleNameStringProperty.value,
          SOURCE_TYPE_DISPLAY_MAP[ snapshot.sourceType ].value
        ), '' )
      );

      const detectionModeListItemProperty = new DerivedProperty(
        [
          snapshotProperty,
          QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
          QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.accessibleNameStringProperty,
          QuantumWaveInterferenceFluent.intensityStringProperty,
          QuantumWaveInterferenceFluent.hitsStringProperty
        ],
        ifSnapshot( snapshot => formatLabelValue(
          QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.accessibleNameStringProperty.value,
          snapshot.detectionMode === 'averageIntensity'
          ? QuantumWaveInterferenceFluent.intensityStringProperty.value
          : QuantumWaveInterferenceFluent.hitsStringProperty.value
        ), '' )
      );

      const slitSettingListItemProperty = new DerivedProperty(
        [
          snapshotProperty,
          QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
          QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleNameStringProperty,
          ...slitSettingDisplayDeps
        ],
        ifSnapshot( snapshot => formatLabelValue(
          QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleNameStringProperty.value,
          slitSettingDisplayMap[ snapshot.slitSetting ].value
        ), '' )
      );

      const metadataListChildren: Node[] = [
        new Node( { tagName: 'li', innerContent: experimentTypeListItemProperty } ),
        new Node( { tagName: 'li', innerContent: detectionModeListItemProperty } ),
        new Node( { tagName: 'li', innerContent: wavelengthOrSpeedProperty } ),
        new Node( { tagName: 'li', innerContent: slitSeparationProperty } )
      ];

      if ( screenDistanceProperty ) {
        metadataListChildren.push( new Node( { tagName: 'li', innerContent: screenDistanceProperty } ) );
      }

      metadataListChildren.push( new Node( { tagName: 'li', innerContent: slitSettingListItemProperty } ) );

      const metadataListNode = new Node( {
        tagName: 'ul',
        children: metadataListChildren
      } );

      nodeChildren.push( descriptionNode, metadataListNode );
    }

    const superOptions: Record<string, unknown> = {
      isDisposable: false,
      children: nodeChildren,
      visibleProperty: new DerivedProperty( [ snapshotProperty ], snapshot => snapshot !== null )
    };

    if ( options.getDescription ) {
      superOptions.tagName = 'div';
      superOptions.containerTagName = 'section';
      superOptions.accessibleHeading = headingProperty;
    }

    super( superOptions );
    this.detectorSnapshotSlot = detectorSnapshotSlot;

    if ( options.getDescription ) {
      const descriptionNode = nodeChildren[ 2 ];
      const metadataListNode = nodeChildren[ 3 ];
      this.pdomOrder = [ descriptionNode, metadataListNode, trashButton ];
    }
  }

  public addSnapshotOverlayChild( child: Node, includeInPDOM = false ): void {
    this.detectorSnapshotSlot.addChild( child );
    if ( includeInPDOM && this.pdomOrder ) {
      this.pdomOrder = [ child, ...this.pdomOrder ];
    }
  }
}

class SnapshotCanvasNode extends CanvasNode {
  private readonly snapshotProperty: TReadOnlyProperty<Snapshot | null>;
  private readonly useFrontFacingHitCoordinates: boolean;
  private readonly getZoomedScreenHalfWidth: ( () => number ) | null;
  private readonly intensityTextureCanvas: HTMLCanvasElement;
  private readonly intensityTextureContext: CanvasRenderingContext2D;

  public constructor(
    snapshotProperty: TReadOnlyProperty<Snapshot | null>,
    width: number,
    height: number,
    useFrontFacingHitCoordinates: boolean,
    getVisibleScreenHalfWidth?: () => number
  ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, width, height )
    } );
    this.snapshotProperty = snapshotProperty;
    this.useFrontFacingHitCoordinates = useFrontFacingHitCoordinates;
    this.getZoomedScreenHalfWidth = getVisibleScreenHalfWidth || null;

    this.intensityTextureCanvas = document.createElement( 'canvas' );
    this.intensityTextureCanvas.width = ANALYTICAL_TEXTURE_WIDTH;
    this.intensityTextureCanvas.height = ANALYTICAL_TEXTURE_HEIGHT;

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

    const displayBounds = this.canvasBounds;
    const width = displayBounds.width;
    const height = displayBounds.height;
    const visibleHalfWidth = this.getVisibleScreenHalfWidth( snapshot );
    const visibleFraction = visibleHalfWidth / snapshot.screenHalfWidth;
    const zoomScale = 1 / visibleFraction;
    const displayGain = getHitsDisplayGain( snapshot.brightness );
    const brightnessFraction = getHitsBrightnessFraction( snapshot.brightness );
    const coreAlpha = getHitsCoreAlpha( brightnessFraction );
    const glowAlpha = getHitsGlowAlpha( brightnessFraction );
    const glowRadius = BASE_HIT_GLOW_RADIUS * zoomScale * Math.min( 2, Math.sqrt( Math.max( 1, displayGain ) ) );

    const baseRGB = getSceneRGB( snapshot.sourceType, snapshot.wavelength );
    const scaledR = baseRGB.r;
    const scaledG = baseRGB.g;
    const scaledB = baseRGB.b;

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
        const hitX = hit.x;
        const normalizedVisibleX = hitX / visibleFraction;
        if ( Math.abs( normalizedVisibleX ) > 1 ) {
          continue;
        }

        // Front-facing detector hits use hit.y from center-to-top; snapshots stretch that half-span to full height.
        const hitY = this.useFrontFacingHitCoordinates ? 1 - 2 * hit.y : hit.y;
        const normalizedVisibleY = hitY / visibleFraction;
        if ( Math.abs( normalizedVisibleY ) > 1 ) {
          continue;
        }

        const viewX = displayBounds.left + ( ( normalizedVisibleX + 1 ) / 2 ) * width;
        const viewY = displayBounds.top + ( ( normalizedVisibleY + 1 ) / 2 ) * height;
        context.beginPath();
        context.arc( viewX, viewY, radius, 0, Math.PI * 2 );
        context.fill();
      }
    };

    drawHits( glowAlpha, glowRadius );
    drawHits( coreAlpha, BASE_HIT_CORE_RADIUS * zoomScale );
  }

  private paintIntensity( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    if ( snapshot.intensityDistribution.length > 0 ) {
      this.paintCapturedIntensity( context, snapshot );
    }
    else {
      this.paintAnalyticalIntensity( context, snapshot );
    }
  }

  /**
   * Renders from a captured solver probability distribution (High Intensity / Single Particles screens).
   */
  private paintCapturedIntensity( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    const distribution = snapshot.intensityDistribution;
    const displayBounds = this.canvasBounds;
    const textureContext = this.intensityTextureContext;
    this.setIntensityTextureSize( CAPTURED_INTENSITY_TEXTURE_WIDTH, CAPTURED_INTENSITY_TEXTURE_HEIGHT );
    textureContext.clearRect( 0, 0, CAPTURED_INTENSITY_TEXTURE_WIDTH, CAPTURED_INTENSITY_TEXTURE_HEIGHT );

    const backgroundRGB = { r: 0, g: 0, b: 0 };

    const normalizedBrightness = snapshot.brightness / QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX;
    const displayGain = getIntensityDisplayGain( normalizedBrightness, snapshot.intensity );

    const sourceRGB = getSceneRGB( snapshot.sourceType, snapshot.wavelength );

    for ( let x = 0; x < CAPTURED_INTENSITY_TEXTURE_WIDTH; x++ ) {
      const fraction = ( x + 0.5 ) / CAPTURED_INTENSITY_TEXTURE_WIDTH;
      const intensityScale = sampleSmoothedIntensityDistribution( distribution, fraction, CAPTURED_INTENSITY_SMOOTHING_RADIUS ) *
                             displayGain;
      const fillStyle = getInterpolatedRGBFillStyle( backgroundRGB, sourceRGB, intensityScale );
      textureContext.fillStyle = fillStyle;
      textureContext.fillRect( x, 0, 1, CAPTURED_INTENSITY_TEXTURE_HEIGHT );
    }

    context.save();
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      this.intensityTextureCanvas,
      displayBounds.left,
      displayBounds.top,
      displayBounds.width,
      displayBounds.height
    );
    context.restore();
  }

  /**
   * Computes the analytical Fraunhofer diffraction pattern from snapshot metadata (Experiment screen).
   */
  private paintAnalyticalIntensity( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    if ( !snapshot.isEmitting ) {
      return;
    }

    const lambda = snapshot.effectiveWavelength;
    if ( lambda === 0 ) {
      return;
    }

    const displayBounds = this.canvasBounds;
    const textureContext = this.intensityTextureContext;
    this.setIntensityTextureSize( ANALYTICAL_TEXTURE_WIDTH, ANALYTICAL_TEXTURE_HEIGHT );
    textureContext.clearRect( 0, 0, ANALYTICAL_TEXTURE_WIDTH, ANALYTICAL_TEXTURE_HEIGHT );

    const displayGain = getIntensityDisplayGain( snapshot.brightness, snapshot.intensity );
    const screenHalfWidth = this.getVisibleScreenHalfWidth( snapshot );

    // The analytical snapshot texture spans the full detector width, which is twice the captured screenHalfWidth.
    const sampleWidthOnScreen = 2 * screenHalfWidth / ANALYTICAL_TEXTURE_WIDTH;
    const slitWidthMeters = snapshot.slitWidth * 1e-3;
    const slitSeparationMeters = snapshot.slitSeparation * 1e-3;
    const screenDistanceMeters = snapshot.screenDistance;
    const slitSetting = snapshot.slitSetting;
    const backgroundRGB = { r: 0, g: 0, b: 0 };

    const sourceRGB = getSceneRGB( snapshot.sourceType, snapshot.wavelength );

    for ( let x = 0; x < ANALYTICAL_TEXTURE_WIDTH; x++ ) {
      const fraction = ( x + 0.5 ) / ANALYTICAL_TEXTURE_WIDTH;
      const physicalX = ( fraction - 0.5 ) * 2 * screenHalfWidth;
      const intensity = getApparentAnalyticalDetectorIntensity( {
        positionOnScreen: physicalX,
        sampleWidthOnScreen: sampleWidthOnScreen,
        effectiveWavelength: lambda,
        screenDistance: screenDistanceMeters,
        slitWidth: slitWidthMeters,
        slitSeparation: slitSeparationMeters,
        slitSetting: slitSetting
      } );

      const intensityScale = intensity * displayGain;
      const fillStyle = getInterpolatedRGBFillStyle( backgroundRGB, sourceRGB, intensityScale );
      textureContext.fillStyle = fillStyle;
      textureContext.fillRect( x, 0, 1, ANALYTICAL_TEXTURE_HEIGHT );
    }

    context.save();
    context.imageSmoothingEnabled = true;
    context.drawImage(
      this.intensityTextureCanvas,
      displayBounds.left,
      displayBounds.top,
      displayBounds.width,
      displayBounds.height
    );
    context.restore();
  }

  private getVisibleScreenHalfWidth( snapshot: Snapshot ): number {
    return this.getZoomedScreenHalfWidth ? this.getZoomedScreenHalfWidth() : snapshot.screenHalfWidth;
  }

  private setIntensityTextureSize( width: number, height: number ): void {
    if ( this.intensityTextureCanvas.width !== width ) {
      this.intensityTextureCanvas.width = width;
    }
    if ( this.intensityTextureCanvas.height !== height ) {
      this.intensityTextureCanvas.height = height;
    }
  }
}

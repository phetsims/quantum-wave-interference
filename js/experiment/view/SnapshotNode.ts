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
import Property from '../../../../axon/js/Property.js';
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
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import Snapshot from '../model/Snapshot.js';
import { getHitsBrightnessFraction } from './ScreenBrightnessUtils.js';
import { getHitsCoreAlpha } from './ScreenBrightnessUtils.js';
import { getHitsDisplayGain } from './ScreenBrightnessUtils.js';
import { getHitsGlowAlpha } from './ScreenBrightnessUtils.js';
import { getIntensityDisplayGain } from './ScreenBrightnessUtils.js';
import SnapshotDescriber from './description/SnapshotDescriber.js';

// Snapshot display dimensions (scaled down from the full detector screen)
const SNAPSHOT_WIDTH = 360;
const SNAPSHOT_HEIGHT = 132;
const FULL_SCREEN_TEXTURE_WIDTH = ExperimentConstants.DETECTOR_SCREEN_WIDTH;
const FULL_SCREEN_TEXTURE_HEIGHT = ExperimentConstants.FRONT_FACING_ROW_HEIGHT;
const CORNER_RADIUS = 6;
const METADATA_WIDTH = 165;
const HIT_CORE_RADIUS = 2.0;
const HIT_GLOW_RADIUS = 3.4;
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


export default class SnapshotNode extends Node {
  public constructor( sceneModel: SceneModel, index: number ) {
    const snapshotProperty: TReadOnlyProperty<Snapshot | null> = new DerivedProperty(
      [ sceneModel.snapshotsProperty ],
      snapshots => ( index < snapshots.length ? snapshots[ index ] : null )
    );

    const titleProperty = new Property( '' );
    const sceneNameProperty = new Property( '' );
    const wavelengthOrSpeedProperty = new Property( '' );
    const slitSeparationProperty = new Property( '' );
    const screenDistanceProperty = new Property( '' );
    const slitSettingProperty = new Property( '' );
    const descriptionProperty = new Property( '' );
    const headingProperty = new Property( '' );
    const trashButtonAccessibleNameProperty = new Property( '' );
    const experimentTypeListItemProperty = new Property( '' );
    const detectionModeListItemProperty = new Property( '' );
    const slitSettingListItemProperty = new Property( '' );

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
    const titleText = new Text( titleProperty, {
      font: TITLE_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH
    } );

    // Parameter labels showing the physics settings at the time of capture
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
    const screenDistText = new Text( screenDistanceProperty, {
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
      children: [ sceneNameText, wavelengthOrSpeedText, slitSepText, screenDistText, slitSettingText ]
    } );

    // Update all text content when the snapshot changes or when locale strings change.
    const updateLabels = (): void => {
      const snapshot = snapshotProperty.value;
      if ( snapshot ) {
        titleProperty.value = StringUtils.fillIn(
          QuantumWaveInterferenceFluent.snapshotNumberPatternStringProperty.value,
          { number: index + 1 }
        );
        const sourceTypeDisplayProperty = SOURCE_TYPE_DISPLAY_MAP[ snapshot.sourceType ];
        const sourceTypeDisplayString = sourceTypeDisplayProperty ?
                                        sourceTypeDisplayProperty.value :
                                        snapshot.sourceType;
        sceneNameProperty.value = sourceTypeDisplayString;
        headingProperty.value = `${titleProperty.value}: ${sourceTypeDisplayString}`;
        experimentTypeListItemProperty.value = StringUtils.fillIn(
          QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.value,
          {
            label: QuantumWaveInterferenceFluent.a11y.sceneRadioButtonGroup.accessibleNameStringProperty.value,
            value: sourceTypeDisplayString
          }
        );

        // Slit separation: use μm for small values (< 0.1 mm) for readability
        if ( snapshot.slitSeparation < 0.1 ) {
          const valueUM = snapshot.slitSeparation * 1000;
          const slitSepValue = StringUtils.fillIn(
            QuantumWaveInterferenceFluent.valueMicrometersPatternStringProperty.value,
            { value: toFixed( valueUM, 1 ) }
          );
          slitSeparationProperty.value = StringUtils.fillIn(
            QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.value,
            { label: QuantumWaveInterferenceFluent.slitSeparationStringProperty.value, value: slitSepValue }
          );
        }
        else {
          const slitSepValue = StringUtils.fillIn(
            QuantumWaveInterferenceFluent.valueMillimetersPatternStringProperty.value,
            { value: toFixed( snapshot.slitSeparation, 2 ) }
          );
          slitSeparationProperty.value = StringUtils.fillIn(
            QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.value,
            { label: QuantumWaveInterferenceFluent.slitSeparationStringProperty.value, value: slitSepValue }
          );
        }

        const screenDistValue = StringUtils.fillIn(
          QuantumWaveInterferenceFluent.valueMetersPatternStringProperty.value,
          { value: toFixed( snapshot.screenDistance, 1 ) }
        );
        screenDistanceProperty.value = StringUtils.fillIn(
          QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.value,
          { label: QuantumWaveInterferenceFluent.screenDistanceStringProperty.value, value: screenDistValue }
        );

        const detectionModeDisplay =
          snapshot.detectionMode === 'averageIntensity' ?
          QuantumWaveInterferenceFluent.intensityStringProperty.value :
          QuantumWaveInterferenceFluent.hitsStringProperty.value;
        detectionModeListItemProperty.value = StringUtils.fillIn(
          QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.value,
          {
            label: QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.accessibleNameStringProperty.value,
            value: detectionModeDisplay
          }
        );

        // Show photon wavelength directly, and particle speed for matter-wave scenes.
        if ( snapshot.sourceType === 'photons' ) {
          const wavelengthValue = StringUtils.fillIn(
            QuantumWaveInterferenceFluent.wavelengthNanometersPatternStringProperty.value,
            { value: roundSymmetric( snapshot.wavelength ) }
          );
          wavelengthOrSpeedProperty.value = StringUtils.fillIn(
            QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.value,
            { label: SceneryPhetFluent.wavelengthStringProperty.value, value: wavelengthValue }
          );
        }
        else {
          const particleMass =
            snapshot.sourceType === 'electrons' ? QuantumWaveInterferenceConstants.ELECTRON_MASS :
            snapshot.sourceType === 'neutrons' ? QuantumWaveInterferenceConstants.NEUTRON_MASS :
            QuantumWaveInterferenceConstants.HELIUM_ATOM_MASS;
          const speed = snapshot.effectiveWavelength === 0 ? 0 : QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( particleMass * snapshot.effectiveWavelength );
          if ( speed >= 10000 ) {
            const kmPerSValue = StringUtils.fillIn(
              QuantumWaveInterferenceFluent.particleSpeedKmPerSecondPatternStringProperty.value,
              { value: roundSymmetric( speed / 1000 ) }
            );
            wavelengthOrSpeedProperty.value = StringUtils.fillIn(
              QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.value,
              { label: QuantumWaveInterferenceFluent.particleSpeedStringProperty.value, value: kmPerSValue }
            );
          }
          else {
            const speedValue = StringUtils.fillIn(
              QuantumWaveInterferenceFluent.particleSpeedMeterPerSecondPatternStringProperty.value,
              { value: roundSymmetric( speed ) }
            );
            wavelengthOrSpeedProperty.value = StringUtils.fillIn(
              QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.value,
              { label: QuantumWaveInterferenceFluent.particleSpeedStringProperty.value, value: speedValue }
            );
          }
        }

        const slitSettingDisplayProperty = SLIT_SETTING_DISPLAY_MAP[ snapshot.slitSetting ];
        const slitSettingDisplayString = slitSettingDisplayProperty ? slitSettingDisplayProperty.value : snapshot.slitSetting;
        slitSettingProperty.value = StringUtils.fillIn(
          QuantumWaveInterferenceFluent.slitsLabelPatternStringProperty.value,
          { setting: slitSettingDisplayString }
        );
        slitSettingListItemProperty.value = StringUtils.fillIn(
          QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.value,
          {
            label: QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleNameStringProperty.value,
            value: slitSettingDisplayString
          }
        );
        descriptionProperty.value = SnapshotDescriber.getDescription( snapshot );
        trashButtonAccessibleNameProperty.value =
          `${SceneryPhetStrings.key.deleteStringProperty.value} ${titleProperty.value}`;
      }
      else {
        titleProperty.value = '';
        sceneNameProperty.value = '';
        wavelengthOrSpeedProperty.value = '';
        slitSeparationProperty.value = '';
        screenDistanceProperty.value = '';
        slitSettingProperty.value = '';
        descriptionProperty.value = '';
        headingProperty.value = '';
        trashButtonAccessibleNameProperty.value = '';
        experimentTypeListItemProperty.value = '';
        detectionModeListItemProperty.value = '';
        slitSettingListItemProperty.value = '';
      }

      canvasNode.invalidatePaint();
    };

    // Re-render when the snapshot itself changes or when any locale-dependent string changes.
    snapshotProperty.link( updateLabels );
    QuantumWaveInterferenceFluent.snapshotNumberPatternStringProperty.lazyLink( updateLabels );
    QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.lazyLink( updateLabels );
    QuantumWaveInterferenceFluent.slitSeparationStringProperty.lazyLink( updateLabels );
    QuantumWaveInterferenceFluent.screenDistanceStringProperty.lazyLink( updateLabels );
    QuantumWaveInterferenceFluent.particleSpeedStringProperty.lazyLink( updateLabels );
    QuantumWaveInterferenceFluent.slitsLabelPatternStringProperty.lazyLink( updateLabels );
    QuantumWaveInterferenceFluent.intensityStringProperty.lazyLink( updateLabels );
    QuantumWaveInterferenceFluent.hitsStringProperty.lazyLink( updateLabels );
    QuantumWaveInterferenceFluent.a11y.sceneRadioButtonGroup.accessibleNameStringProperty.lazyLink( updateLabels );
    QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.accessibleNameStringProperty.lazyLink( updateLabels );
    QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleNameStringProperty.lazyLink( updateLabels );
    QuantumWaveInterferenceFluent.hitsCountPatternStringProperty.lazyLink( updateLabels );
    SceneryPhetStrings.key.deleteStringProperty.lazyLink( updateLabels );
    SceneryPhetFluent.wavelengthStringProperty.lazyLink( updateLabels );
    SOURCE_TYPE_DISPLAY_MAP.photons.lazyLink( updateLabels );
    SOURCE_TYPE_DISPLAY_MAP.electrons.lazyLink( updateLabels );
    SOURCE_TYPE_DISPLAY_MAP.neutrons.lazyLink( updateLabels );
    SOURCE_TYPE_DISPLAY_MAP.heliumAtoms.lazyLink( updateLabels );
    SLIT_SETTING_DISPLAY_MAP.BOTH_OPEN.lazyLink( updateLabels );
    SLIT_SETTING_DISPLAY_MAP.LEFT_COVERED.lazyLink( updateLabels );
    SLIT_SETTING_DISPLAY_MAP.RIGHT_COVERED.lazyLink( updateLabels );
    SLIT_SETTING_DISPLAY_MAP.LEFT_DETECTOR.lazyLink( updateLabels );
    SLIT_SETTING_DISPLAY_MAP.RIGHT_DETECTOR.lazyLink( updateLabels );

    const trashButton = new TrashButton( {
      listener: () => {
        const snapshot = snapshotProperty.value;
        if ( snapshot ) {
          sceneModel.deleteSnapshot( snapshot );
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

    const descriptionNode = new Node( {
      accessibleParagraph: descriptionProperty
    } );
    const metadataListNode = new Node( {
      tagName: 'ul',
      children: [
        new Node( {
          tagName: 'li',
          innerContent: experimentTypeListItemProperty
        } ),
        new Node( {
          tagName: 'li',
          innerContent: detectionModeListItemProperty
        } ),
        new Node( {
          tagName: 'li',
          innerContent: wavelengthOrSpeedProperty
        } ),
        new Node( {
          tagName: 'li',
          innerContent: slitSeparationProperty
        } ),
        new Node( {
          tagName: 'li',
          innerContent: screenDistanceProperty
        } ),
        new Node( {
          tagName: 'li',
          innerContent: slitSettingListItemProperty
        } )
      ]
    } );

    // Layout: [snapshot image] [parameter labels + trash button]
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
      tagName: 'div',
      containerTagName: 'section',
      accessibleHeading: headingProperty,
      children: [ contentBox, trashButton, descriptionNode, metadataListNode ],
      visibleProperty: new DerivedProperty( [ snapshotProperty ], snapshot => snapshot !== null )
    } );
    this.pdomOrder = [
      descriptionNode,
      metadataListNode,
      trashButton
    ];
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
    const slitSeparationMeters = snapshot.slitSeparation * 1e-3;
    const screenDistanceMeters = snapshot.screenDistance;
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
      const sinTheta = physicalX / Math.sqrt( physicalX * physicalX + screenDistanceMeters * screenDistanceMeters );

      const singleSlitArg = Math.PI * slitWidthMeters * sinTheta / lambda;
      const singleSlitFactor = singleSlitArg === 0 ? 1 : Math.pow( Math.sin( singleSlitArg ) / singleSlitArg, 2 );

      const intensity =
        isSingleSlit
        ? singleSlitFactor
        : Math.pow( Math.cos( Math.PI * slitSeparationMeters * sinTheta / lambda ), 2 ) * singleSlitFactor;

      const intensityScale = intensity * displayGain;
      // Skip bands below perceptual visibility to avoid painting nearly-black pixels
      if ( intensityScale < 0.004 ) {
        continue;
      }

      if ( photonColor ) {
        const r = clamp( roundSymmetric( photonColor.red * intensityScale ), 0, 255 );
        const g = clamp( roundSymmetric( photonColor.green * intensityScale ), 0, 255 );
        const b = clamp( roundSymmetric( photonColor.blue * intensityScale ), 0, 255 );
        textureContext.fillStyle = `rgb(${r},${g},${b})`;
      }
      else {
        const value = clamp( roundSymmetric( 255 * intensityScale ), 0, 255 );
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

// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotNode displays a single snapshot in the SnapshotsDialog.
 * It shows a miniature rendering of the detector screen state at the time the snapshot was taken, along with a title,
 * key physics parameters (source type, wavelength/speed, slit separation, slit configuration), and a delete button.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import TrashButton from '../../../../scenery-phet/js/buttons/TrashButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SceneryPhetFluent from '../../../../scenery-phet/js/SceneryPhetFluent.js';
import SceneryPhetStrings from '../../../../scenery-phet/js/SceneryPhetStrings.js';
import { kilometersPerSecondUnit } from '../../../../scenery-phet/js/units/kilometersPerSecondUnit.js';
import { metersPerSecondUnit } from '../../../../scenery-phet/js/units/metersPerSecondUnit.js';
import { metersUnit } from '../../../../scenery-phet/js/units/metersUnit.js';
import { micrometersUnit } from '../../../../scenery-phet/js/units/micrometersUnit.js';
import { millimetersUnit } from '../../../../scenery-phet/js/units/millimetersUnit.js';
import { nanometersUnit } from '../../../../scenery-phet/js/units/nanometersUnit.js';
import { percentUnit } from '../../../../scenery-phet/js/units/percentUnit.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';
import type { Snapshot } from '../model/Snapshot.js';
import { type SourceType } from '../model/SourceType.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import SnapshotCanvasNode from './SnapshotCanvasNode.js';

const SNAPSHOT_WIDTH = 360;
const SNAPSHOT_HEIGHT = 132;
const CORNER_RADIUS = 0;
const METADATA_WIDTH = 165;

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

  // TODO: https://github.com/phetsims/quantum-wave-interference/issues/118 document or align this disparity
  leftCovered: QuantumWaveInterferenceFluent.coverTopStringProperty,
  rightCovered: QuantumWaveInterferenceFluent.coverBottomStringProperty,
  leftDetector: QuantumWaveInterferenceFluent.detectorTopStringProperty,
  rightDetector: QuantumWaveInterferenceFluent.detectorBottomStringProperty,
  bothDetectors: QuantumWaveInterferenceFluent.detectorBothStringProperty,
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
             ? micrometersUnit.getVisualSymbolPatternString( slitSepMM * 1000, {
          decimalPlaces: 1,
          showTrailingZeros: true
        } )
             : millimetersUnit.getVisualSymbolPatternString( slitSepMM, {
          decimalPlaces: 2,
          showTrailingZeros: true
        } );
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
      [ titleProperty, sceneNameProperty, QuantumWaveInterferenceFluent.snapshotHeadingPatternStringProperty ],
      ( title, sceneName, pattern ) => title ? StringUtils.fillIn( pattern, {
        snapshot: title,
        scene: sceneName
      } ) : ''
    );

    const formatLabelValue = ( label: string, value: string ): string => StringUtils.fillIn(
      QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.value,
      { label: label, value: value }
    );

    const slitSeparationProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        snapshotProperty,
        QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
        QuantumWaveInterferenceFluent.slitSeparationStringProperty,
        ...micrometersUnit.getDependentProperties(),
        ...millimetersUnit.getDependentProperties()
      ] ) ),
      () => ifSnapshot( snapshot => formatLabelValue(
        QuantumWaveInterferenceFluent.slitSeparationStringProperty.value,
        formatSlitSeparation( snapshot.slitSeparation )
      ), '' )( snapshotProperty.value )
    );

    const wavelengthOrSpeedProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        snapshotProperty,
        QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
        SceneryPhetFluent.wavelengthStringProperty,
        QuantumWaveInterferenceFluent.particleSpeedStringProperty,
        ...nanometersUnit.getDependentProperties(),
        ...kilometersPerSecondUnit.getDependentProperties(),
        ...metersPerSecondUnit.getDependentProperties()
      ] ) ),
      () => ifSnapshot( snapshot => {
        if ( snapshot.sourceType === 'photons' ) {
          const wavelengthValue = nanometersUnit.getVisualSymbolPatternString( roundSymmetric( snapshot.wavelength ), {
            decimalPlaces: 0,
            showTrailingZeros: false,
            showIntegersAsIntegers: true
          } );
          return formatLabelValue( SceneryPhetFluent.wavelengthStringProperty.value, wavelengthValue );
        }
        const sourceType = snapshot.sourceType;
        const particleMass = sourceType === 'electrons' ? QuantumWaveInterferenceConstants.ELECTRON_MASS :
                             sourceType === 'neutrons' ? QuantumWaveInterferenceConstants.NEUTRON_MASS :
                             sourceType === 'heliumAtoms' ? QuantumWaveInterferenceConstants.HELIUM_ATOM_MASS :
                             ( () => { throw new Error( `Unrecognized sourceType: ${sourceType}` ); } )();
        const speed = snapshot.effectiveWavelength === 0 ? 0 : QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( particleMass * snapshot.effectiveWavelength );
        const speedValue = speed >= 10000
                           ? kilometersPerSecondUnit.getVisualSymbolPatternString( roundSymmetric( speed / 1000 ), {
            decimalPlaces: 0,
            showTrailingZeros: false,
            showIntegersAsIntegers: true
          } )
                           : metersPerSecondUnit.getVisualSymbolPatternString( roundSymmetric( speed ), {
            decimalPlaces: 0,
            showTrailingZeros: false,
            showIntegersAsIntegers: true
          } );
        return formatLabelValue( QuantumWaveInterferenceFluent.particleSpeedStringProperty.value, speedValue );
      }, '' )( snapshotProperty.value )
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

    const screenBrightnessProperty = DerivedProperty.deriveAny(
      [
        snapshotProperty,
        QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
        QuantumWaveInterferenceFluent.screenBrightnessStringProperty,
        ...percentUnit.getDependentProperties()
      ],
      () => ifSnapshot( snapshot => {
        const percentValue = snapshot.brightness / QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX * 100;
        return formatLabelValue(
          QuantumWaveInterferenceFluent.screenBrightnessStringProperty.value,
          percentUnit.getVisualSymbolPatternString( percentValue, {
            decimalPlaces: 0,
            showTrailingZeros: false,
            showIntegersAsIntegers: true
          } )
        );
      }, '' )( snapshotProperty.value )
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

    const titleText = new Text( headingProperty, {
      font: TITLE_FONT,
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

    const screenBrightnessText = new Text( screenBrightnessProperty, {
      font: PARAM_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH
    } );

    const parameterLabelsChildren: Node[] = [ wavelengthOrSpeedText, slitSepText ];

    // Conditionally include screen distance row (used by the Experiment screen).
    let screenDistanceProperty: TReadOnlyProperty<string> | null = null;
    if ( options.showScreenDistance ) {
      screenDistanceProperty = DerivedProperty.deriveAny(
        [
          snapshotProperty,
          QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
          QuantumWaveInterferenceFluent.screenDistanceStringProperty,
          ...metersUnit.getDependentProperties()
        ],
        () => ifSnapshot( snapshot => {
          const screenDistValue = metersUnit.getVisualSymbolPatternString( snapshot.screenDistance, {
            decimalPlaces: 2,
            showTrailingZeros: true
          } );
          return formatLabelValue(
            QuantumWaveInterferenceFluent.screenDistanceStringProperty.value,
            screenDistValue
          );
        }, '' )( snapshotProperty.value )
      );
      parameterLabelsChildren.push( new Text( screenDistanceProperty, {
        font: PARAM_FONT,
        fill: 'black',
        maxWidth: METADATA_WIDTH
      } ) );
    }

    parameterLabelsChildren.push( slitSettingText, screenBrightnessText );

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
      touchAreaYDilation: 8,
      tandem: Tandem.OPT_OUT
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

    metadataColumn.left = SNAPSHOT_WIDTH + 10;
    metadataColumn.top = 0;

    const contentBox = new Node( {
      children: [ detectorSnapshotSlot, metadataColumn ]
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
        new Node( { tagName: 'li', innerContent: detectionModeListItemProperty } ),
        new Node( { tagName: 'li', innerContent: wavelengthOrSpeedProperty } ),
        new Node( { tagName: 'li', innerContent: slitSeparationProperty } )
      ];

      if ( screenDistanceProperty ) {
        metadataListChildren.push( new Node( { tagName: 'li', innerContent: screenDistanceProperty } ) );
      }

      metadataListChildren.push( new Node( { tagName: 'li', innerContent: slitSettingListItemProperty } ) );
      metadataListChildren.push( new Node( { tagName: 'li', innerContent: screenBrightnessProperty } ) );

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

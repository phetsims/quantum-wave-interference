// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotMetadataProperties creates the localized text Properties shown in SnapshotNode.
 * Keeping this formatting and dependency logic outside SnapshotNode makes the visual layout class easier to scan and
 * keeps every locale-dependent value in one place.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { type DualString } from '../../../../axon/js/AccessibleStrings.js';
import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import SceneryPhetFluent from '../../../../scenery-phet/js/SceneryPhetFluent.js';
import { kilometersPerSecondUnit } from '../../../../scenery-phet/js/units/kilometersPerSecondUnit.js';
import { metersPerSecondUnit } from '../../../../scenery-phet/js/units/metersPerSecondUnit.js';
import { metersUnit } from '../../../../scenery-phet/js/units/metersUnit.js';
import { micrometersUnit } from '../../../../scenery-phet/js/units/micrometersUnit.js';
import { millimetersUnit } from '../../../../scenery-phet/js/units/millimetersUnit.js';
import { nanometersUnit } from '../../../../scenery-phet/js/units/nanometersUnit.js';
import { percentUnit } from '../../../../scenery-phet/js/units/percentUnit.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';
import type { Snapshot } from '../model/Snapshot.js';
import { type SourceType } from '../model/SourceType.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

// Whether the two slits are arranged left-right (Experiment screen, overhead view) or top-bottom (High Intensity /
// Single Particles screens, front-facing view). Controls which localized slit-name strings are used.
type SlitOrientation = 'leftRight' | 'topBottom';

// Maps every slit configuration (including noBarrier) to its localized display-name Property for a given orientation.
type SlitSettingDisplayMap = Record<SlitConfigurationWithNoBarrier, TReadOnlyProperty<string>>;

export type SnapshotMetadataPropertiesOptions = {

  // Slit-name convention used for model left/right slit configurations. Defaults to top/bottom for front-facing screens.
  slitOrientation?: SlitOrientation;

  // Optional display-name map for slit configurations. Defaults are used for omitted entries.
  slitSettingDisplayMap?: Partial<SlitSettingDisplayMap>;

  // Formats the visual and accessible slit separation value (in mm). Uses micrometers if < 0.1 mm, else millimeters.
  formatSlitSeparation?: ( slitSepMM: number ) => DualString;

  // When true, a screen distance row is included in the metadata labels.
  showScreenDistance?: boolean;
};

const SOURCE_TYPE_DISPLAY_MAP: Record<SourceType, TReadOnlyProperty<string>> = {
  photons: QuantumWaveInterferenceFluent.photonsStringProperty,
  electrons: QuantumWaveInterferenceFluent.electronsStringProperty,
  neutrons: QuantumWaveInterferenceFluent.neutronsStringProperty,
  heliumAtoms: QuantumWaveInterferenceFluent.heliumAtomsStringProperty
};

const SLIT_SETTING_DISPLAY_MAPS: Record<SlitOrientation, SlitSettingDisplayMap> = {
  leftRight: {
    bothOpen: QuantumWaveInterferenceFluent.bothOpenStringProperty,
    leftCovered: QuantumWaveInterferenceFluent.coverLeftStringProperty,
    rightCovered: QuantumWaveInterferenceFluent.coverRightStringProperty,
    leftDetector: QuantumWaveInterferenceFluent.detectorLeftStringProperty,
    rightDetector: QuantumWaveInterferenceFluent.detectorRightStringProperty,
    bothDetectors: QuantumWaveInterferenceFluent.detectorBothStringProperty,
    noBarrier: QuantumWaveInterferenceFluent.noBarrierStringProperty
  },
  topBottom: {
    bothOpen: QuantumWaveInterferenceFluent.bothOpenStringProperty,

    // The model keys use Experiment's overhead left/right slit names; front-facing screens present those same slits
    // as top/bottom.
    leftCovered: QuantumWaveInterferenceFluent.coverTopStringProperty,
    rightCovered: QuantumWaveInterferenceFluent.coverBottomStringProperty,
    leftDetector: QuantumWaveInterferenceFluent.detectorTopStringProperty,
    rightDetector: QuantumWaveInterferenceFluent.detectorBottomStringProperty,
    bothDetectors: QuantumWaveInterferenceFluent.detectorBothStringProperty,
    noBarrier: QuantumWaveInterferenceFluent.noBarrierStringProperty
  }
};

// Number formatting shared by the integer-valued wavelength and speed readouts.
const NUMBER_FORMAT_OPTIONS = {
  decimalPlaces: 0,
  showTrailingZeros: false,
  showIntegersAsIntegers: true
};

function DEFAULT_FORMAT_SLIT_SEPARATION( slitSepMM: number ): DualString {
  return slitSepMM < 0.1 ?
         micrometersUnit.getDualString( slitSepMM * 1000, {
           decimalPlaces: 1,
           showTrailingZeros: true
         } ) :
         millimetersUnit.getDualString( slitSepMM, {
           decimalPlaces: 2,
           showTrailingZeros: true
         } );
}

const SOURCE_TYPE_DISPLAY_DEPENDENCIES = [
  SOURCE_TYPE_DISPLAY_MAP.photons,
  SOURCE_TYPE_DISPLAY_MAP.electrons,
  SOURCE_TYPE_DISPLAY_MAP.neutrons,
  SOURCE_TYPE_DISPLAY_MAP.heliumAtoms
] as const;

function ifSnapshot<T>( compute: ( snapshot: Snapshot ) => T, empty: T ): ( snapshot: Snapshot | null ) => T {
  return snapshot => snapshot ? compute( snapshot ) : empty;
}

function formatLabelValue( label: string, value: string ): string {
  return StringUtils.fillIn(
    QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty.value,
    { label: label, value: value }
  );
}

const createSlitSettingDisplayMap = (
  slitOrientation: SlitOrientation,
  providedMap?: Partial<SlitSettingDisplayMap>
): SlitSettingDisplayMap => {
  const defaultMap = SLIT_SETTING_DISPLAY_MAPS[ slitOrientation ];
  const getSlitSettingDisplayProperty = (
    slitConfiguration: SlitConfigurationWithNoBarrier
  ): TReadOnlyProperty<string> => providedMap?.[ slitConfiguration ] ||
                                  defaultMap[ slitConfiguration ];

  return {
    bothOpen: getSlitSettingDisplayProperty( 'bothOpen' ),
    leftCovered: getSlitSettingDisplayProperty( 'leftCovered' ),
    rightCovered: getSlitSettingDisplayProperty( 'rightCovered' ),
    leftDetector: getSlitSettingDisplayProperty( 'leftDetector' ),
    rightDetector: getSlitSettingDisplayProperty( 'rightDetector' ),
    bothDetectors: getSlitSettingDisplayProperty( 'bothDetectors' ),
    noBarrier: getSlitSettingDisplayProperty( 'noBarrier' )
  };
};

export default class SnapshotMetadataProperties {

  // Formatted heading shown at the top of the snapshot card, e.g. "Snapshot 1 – Photons".
  public readonly headingProperty: TReadOnlyProperty<string>;

  // Visual label row showing photon wavelength (nm) for photons, or particle speed (m/s or km/s) for matter particles.
  public readonly wavelengthOrSpeedProperty: TReadOnlyProperty<string>;

  // Screen-reader version of wavelengthOrSpeedProperty using fully spelled-out unit strings.
  public readonly wavelengthOrSpeedAccessibleProperty: TReadOnlyProperty<string>;

  // Visual label row for slit separation, displayed in micrometers (< 0.1 mm) or millimeters.
  public readonly slitSeparationProperty: TReadOnlyProperty<string>;

  // Screen-reader version of slitSeparationProperty using fully spelled-out unit strings.
  public readonly slitSeparationAccessibleProperty: TReadOnlyProperty<string>;

  // Visual label row for the distance from source to screen, in meters. Null when showScreenDistance is false.
  public readonly screenDistanceProperty: TReadOnlyProperty<string> | null;

  // Screen-reader version of screenDistanceProperty. Null when showScreenDistance is false.
  public readonly screenDistanceAccessibleProperty: TReadOnlyProperty<string> | null;

  // Visual label row for the current slit configuration, e.g. "Slits: Both Open".
  public readonly slitSettingProperty: TReadOnlyProperty<string>;

  // Visual label row for screen brightness as a percentage of the maximum.
  public readonly screenBrightnessProperty: TReadOnlyProperty<string>;

  // Screen-reader version of screenBrightnessProperty using fully spelled-out unit strings.
  public readonly screenBrightnessAccessibleProperty: TReadOnlyProperty<string>;

  // Accessible name for the delete-snapshot button, includes the snapshot title for screen-reader context.
  public readonly trashButtonAccessibleNameProperty: TReadOnlyProperty<string>;

  // PDOM list-item string for the detection mode row (Intensity vs. Hits), used inside the accessible metadata list.
  public readonly detectionModeListItemProperty: TReadOnlyProperty<string>;

  // PDOM list-item string for the slit setting row, used inside the accessible metadata list.
  public readonly slitSettingListItemProperty: TReadOnlyProperty<string>;

  /**
   * Creates the text Properties for one snapshot slot.
   *
   * Each Property depends on every localized string and unit Property that can affect its formatted value, so visible
   * labels and PDOM metadata update correctly when locale or unit display settings change.
   *
   * @param snapshotProperty - snapshot currently occupying this slot, or null when the slot is empty
   * @param options - optional screen-specific formatting and display-name hooks
   */
  public constructor(
    snapshotProperty: TReadOnlyProperty<Snapshot | null>,
    options: SnapshotMetadataPropertiesOptions
  ) {
    const slitSettingDisplayMap = createSlitSettingDisplayMap(
      options.slitOrientation || 'topBottom',
      options.slitSettingDisplayMap
    );
    const slitSettingDisplayDependencies = [
      slitSettingDisplayMap.bothOpen,
      slitSettingDisplayMap.leftCovered,
      slitSettingDisplayMap.rightCovered,
      slitSettingDisplayMap.leftDetector,
      slitSettingDisplayMap.rightDetector,
      slitSettingDisplayMap.bothDetectors,
      slitSettingDisplayMap.noBarrier
    ] as const;

    const formatSlitSeparation = options.formatSlitSeparation || DEFAULT_FORMAT_SLIT_SEPARATION;

    const titleProperty = new DerivedProperty(
      [ snapshotProperty, QuantumWaveInterferenceFluent.snapshotNumberPatternStringProperty ],
      ( snapshot, pattern ) => snapshot
                               ? StringUtils.fillIn( pattern, { number: snapshot.snapshotNumber } )
                               : ''
    );

    const sceneNameProperty = new DerivedProperty(
      [ snapshotProperty, ...SOURCE_TYPE_DISPLAY_DEPENDENCIES ],
      ifSnapshot( snapshot => SOURCE_TYPE_DISPLAY_MAP[ snapshot.sourceType ].value, '' )
    );

    this.headingProperty = new DerivedProperty(
      [ titleProperty, sceneNameProperty, QuantumWaveInterferenceFluent.snapshotHeadingPatternStringProperty ],
      ( title, sceneName, pattern ) => title ? StringUtils.fillIn( pattern, {
        snapshot: title,
        scene: sceneName
      } ) : ''
    );

    // The visual and accessible slit-separation rows are identical except for which side of the DualString they read.
    const createSlitSeparationProperty = ( selectString: ( dual: DualString ) => string ): TReadOnlyProperty<string> =>
      DerivedProperty.deriveAny(
        Array.from( new Set( [
          snapshotProperty,
          QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
          QuantumWaveInterferenceFluent.slitSeparationStringProperty,
          ...micrometersUnit.getDependentProperties(),
          ...millimetersUnit.getDependentProperties()
        ] ) ),
        () => ifSnapshot( snapshot => formatLabelValue(
          QuantumWaveInterferenceFluent.slitSeparationStringProperty.value,
          selectString( formatSlitSeparation( snapshot.slitSeparation ) )
        ), '' )( snapshotProperty.value )
      );

    this.slitSeparationProperty = createSlitSeparationProperty( dual => dual.visualString );
    this.slitSeparationAccessibleProperty = createSlitSeparationProperty( dual => dual.accessibleString );

    // The visual and accessible wavelength/speed rows are identical except for which PhetUnit string method formats the
    // value (getVisualSymbolPatternString vs getAccessibleString). All three units share the same type, so the builder
    // takes a formatter and applies it uniformly.
    const createWavelengthOrSpeedProperty = (
      formatUnitValue: ( unit: typeof nanometersUnit, value: number ) => string
    ): TReadOnlyProperty<string> =>
      DerivedProperty.deriveAny(
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
            return formatLabelValue(
              SceneryPhetFluent.wavelengthStringProperty.value,
              formatUnitValue( nanometersUnit, roundSymmetric( snapshot.wavelength ) )
            );
          }

          const particleMass = QuantumWaveInterferenceConstants.getParticleMass( snapshot.sourceType );
          const speed = snapshot.effectiveWavelength === 0 ? 0 :
                        QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( particleMass * snapshot.effectiveWavelength );
          const speedValue = speed >= 10000 ?
                             formatUnitValue( kilometersPerSecondUnit, roundSymmetric( speed / 1000 ) ) :
                             formatUnitValue( metersPerSecondUnit, roundSymmetric( speed ) );
          return formatLabelValue( QuantumWaveInterferenceFluent.particleSpeedStringProperty.value, speedValue );
        }, '' )( snapshotProperty.value )
      );

    this.wavelengthOrSpeedProperty = createWavelengthOrSpeedProperty(
      ( unit, value ) => unit.getVisualSymbolPatternString( value, NUMBER_FORMAT_OPTIONS ) );
    this.wavelengthOrSpeedAccessibleProperty = createWavelengthOrSpeedProperty(
      ( unit, value ) => unit.getAccessibleString( value, NUMBER_FORMAT_OPTIONS ) );

    this.slitSettingProperty = new DerivedProperty(
      [
        snapshotProperty,
        QuantumWaveInterferenceFluent.slitsLabelPatternStringProperty,
        ...slitSettingDisplayDependencies
      ],
      ifSnapshot( snapshot => StringUtils.fillIn(
        QuantumWaveInterferenceFluent.slitsLabelPatternStringProperty.value,
        { setting: slitSettingDisplayMap[ snapshot.slitSetting ].value }
      ), '' )
    );

    this.screenBrightnessProperty = DerivedProperty.deriveAny(
      [
        snapshotProperty,
        QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
        QuantumWaveInterferenceFluent.screenBrightnessStringProperty,
        ...percentUnit.getDependentProperties()
      ],
      () => ifSnapshot( snapshot => {
        return formatLabelValue(
          QuantumWaveInterferenceFluent.screenBrightnessStringProperty.value,
          percentUnit.getVisualSymbolPatternString( snapshot.brightness, {
            decimalPlaces: 0,
            showTrailingZeros: false,
            showIntegersAsIntegers: true
          } )
        );
      }, '' )( snapshotProperty.value )
    );

    this.screenBrightnessAccessibleProperty = DerivedProperty.deriveAny(
      [
        snapshotProperty,
        QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
        QuantumWaveInterferenceFluent.screenBrightnessStringProperty,
        ...percentUnit.getDependentProperties()
      ],
      () => ifSnapshot( snapshot => {
        return formatLabelValue(
          QuantumWaveInterferenceFluent.screenBrightnessStringProperty.value,
          percentUnit.getAccessibleString( snapshot.brightness, {
            decimalPlaces: 0,
            showTrailingZeros: false,
            showIntegersAsIntegers: true
          } )
        );
      }, '' )( snapshotProperty.value )
    );

    this.screenDistanceProperty = options.showScreenDistance ?
                                  DerivedProperty.deriveAny(
                                    [
                                      snapshotProperty,
                                      QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
                                      QuantumWaveInterferenceFluent.screenDistanceStringProperty,
                                      ...metersUnit.getDependentProperties()
                                    ],
                                    () => ifSnapshot( snapshot => {
                                      const screenDistanceValue = metersUnit.getVisualSymbolPatternString(
                                        snapshot.screenDistance, {
                                          decimalPlaces: 2,
                                          showTrailingZeros: true
                                        } );
                                      return formatLabelValue(
                                        QuantumWaveInterferenceFluent.screenDistanceStringProperty.value,
                                        screenDistanceValue
                                      );
                                    }, '' )( snapshotProperty.value )
                                  ) :
                                  null;

    this.screenDistanceAccessibleProperty = options.showScreenDistance ?
                                            DerivedProperty.deriveAny(
                                              [
                                                snapshotProperty,
                                                QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
                                                QuantumWaveInterferenceFluent.screenDistanceStringProperty,
                                                ...metersUnit.getDependentProperties()
                                              ],
                                              () => ifSnapshot( snapshot => {
                                                const screenDistanceValue = metersUnit.getAccessibleString(
                                                  snapshot.screenDistance, {
                                                    decimalPlaces: 2,
                                                    showTrailingZeros: true
                                                  } );
                                                return formatLabelValue(
                                                  QuantumWaveInterferenceFluent.screenDistanceStringProperty.value,
                                                  screenDistanceValue
                                                );
                                              }, '' )( snapshotProperty.value )
                                            ) :
                                            null;

    this.trashButtonAccessibleNameProperty = DerivedProperty.deriveAny(
      [
        snapshotProperty,
        titleProperty,
        ...QuantumWaveInterferenceFluent.a11y.snapshotNode.deleteSnapshotAccessibleName.getDependentProperties()
      ],
      () => snapshotProperty.value ?
            QuantumWaveInterferenceFluent.a11y.snapshotNode.deleteSnapshotAccessibleName.format( {
              snapshotTitle: titleProperty.value
            } ) :
            ''
    );

    this.detectionModeListItemProperty = new DerivedProperty(
      [
        snapshotProperty,
        QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
        QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.accessibleNameStringProperty,
        QuantumWaveInterferenceFluent.intensityStringProperty,
        QuantumWaveInterferenceFluent.hitsStringProperty
      ],
      ifSnapshot( snapshot => formatLabelValue(
        QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.accessibleNameStringProperty.value,
        snapshot.detectionMode === 'intensity'
        ? QuantumWaveInterferenceFluent.intensityStringProperty.value
        : QuantumWaveInterferenceFluent.hitsStringProperty.value
      ), '' )
    );

    this.slitSettingListItemProperty = new DerivedProperty(
      [
        snapshotProperty,
        QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
        QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleNameStringProperty,
        ...slitSettingDisplayDependencies
      ],
      ifSnapshot( snapshot => formatLabelValue(
        QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleNameStringProperty.value,
        slitSettingDisplayMap[ snapshot.slitSetting ].value
      ), '' )
    );
  }
}

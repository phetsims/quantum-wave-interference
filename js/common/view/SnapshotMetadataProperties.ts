// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotMetadataProperties creates the localized text Properties shown in SnapshotNode.
 * Keeping this formatting and dependency logic outside SnapshotNode makes the visual layout class easier to scan and
 * keeps every locale-dependent value in one place.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type DualString } from '../../../../axon/js/AccessibleStrings.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
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
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { getWavelengthColorZone, getWavelengthColorZoneStringProperty, WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES } from './WavelengthColorUtils.js';

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

const SLIT_SETTING_DISPLAY_MAPS: Record<SlitOrientation, SlitSettingDisplayMap> = {
  leftRight: {
    bothOpen: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.bothOpenStringProperty,
    leftCovered: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.coverLeftStringProperty,
    rightCovered: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.coverRightStringProperty,
    leftDetector: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.detectorLeftStringProperty,
    rightDetector: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.detectorRightStringProperty,
    bothDetectors: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.detectorBothStringProperty,
    noBarrier: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.noBarrierStringProperty
  },
  topBottom: {
    bothOpen: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.bothOpenStringProperty,

    // The model keys use Experiment's overhead left/right slit names; front-facing screens present those same slits
    // as top/bottom.
    leftCovered: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.coverTopStringProperty,
    rightCovered: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.coverBottomStringProperty,
    leftDetector: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.detectorTopStringProperty,
    rightDetector: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.detectorBottomStringProperty,
    bothDetectors: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.detectorBothStringProperty,
    noBarrier: QuantumWaveInterferenceFluent.snapshotSlitConfiguration.noBarrierStringProperty
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

  // Formatted heading shown at the top of the snapshot card, e.g. "Snapshot 1: Intensity".
  public readonly headingProperty: TReadOnlyProperty<string>;

  // Whether slit geometry metadata applies to this snapshot. False when no snapshot is present or the barrier is absent.
  public readonly isSlitGeometryRelevantProperty: TReadOnlyProperty<boolean>;

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

  // Visual label row for the current slit configuration, e.g. "Both slits open".
  public readonly slitSettingProperty: TReadOnlyProperty<string>;

  // Visual label row for screen brightness as a percentage of the maximum.
  public readonly screenBrightnessProperty: TReadOnlyProperty<string>;

  // Screen-reader version of screenBrightnessProperty using fully spelled-out unit strings.
  public readonly screenBrightnessAccessibleProperty: TReadOnlyProperty<string>;

  // Accessible name for the delete-snapshot button, includes the snapshot title for screen-reader context.
  public readonly trashButtonAccessibleNameProperty: TReadOnlyProperty<string>;

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
    const slitOrientation = options.slitOrientation || 'topBottom';
    const slitSettingDisplayMap = createSlitSettingDisplayMap(
      slitOrientation,
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

    const detectionModeDisplayProperty = new DerivedProperty(
      [
        snapshotProperty,
        QuantumWaveInterferenceFluent.intensityStringProperty,
        QuantumWaveInterferenceFluent.hitsStringProperty
      ],
      ifSnapshot( snapshot => snapshot.detectionMode === 'intensity' ?
                              QuantumWaveInterferenceFluent.intensityStringProperty.value :
                              QuantumWaveInterferenceFluent.hitsStringProperty.value, '' )
    );

    this.headingProperty = new DerivedProperty(
      [ titleProperty, detectionModeDisplayProperty, QuantumWaveInterferenceFluent.snapshotHeadingPatternStringProperty ],
      ( title, detectionMode, pattern ) => title ? StringUtils.fillIn( pattern, {
        snapshot: title,
        detectionMode: detectionMode
      } ) : ''
    );

    this.isSlitGeometryRelevantProperty = snapshotProperty.derived(
      snapshot => !!snapshot && snapshot.slitSetting !== 'noBarrier'
    );

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

    const slitSeparationAccessibleValueProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        snapshotProperty,
        ...micrometersUnit.getDependentProperties(),
        ...millimetersUnit.getDependentProperties()
      ] ) ),
      () => ifSnapshot( snapshot => formatSlitSeparation( snapshot.slitSeparation ).accessibleString, '' )(
        snapshotProperty.value
      )
    );
    const slitSeparationDescriptionProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.slitSeparation.createProperty( {
        distance: slitSeparationAccessibleValueProperty
      } );
    this.slitSeparationAccessibleProperty = new DerivedProperty(
      [ snapshotProperty, slitSeparationDescriptionProperty ],
      ( snapshot, description ) => snapshot ? description : ''
    );

    // The visual row needs label-value formatting, while the PDOM row below reuses the main-view sentence pattern.
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

    const wavelengthAccessibleValueProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        snapshotProperty,
        ...nanometersUnit.getDependentProperties()
      ] ) ),
      () => ifSnapshot(
        snapshot => nanometersUnit.getAccessibleString( roundSymmetric( snapshot.wavelength ), NUMBER_FORMAT_OPTIONS ),
        ''
      )( snapshotProperty.value )
    );

    const wavelengthColorStringProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        snapshotProperty,
        ...WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES
      ] ) ),
      () => ifSnapshot( snapshot => getWavelengthColorZoneStringProperty(
        getWavelengthColorZone( roundSymmetric( snapshot.wavelength ) )
      ).value, '' )( snapshotProperty.value )
    );

    const wavelengthDescriptionProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.wavelength.createProperty( {
        wavelength: wavelengthAccessibleValueProperty,
        color: wavelengthColorStringProperty
      } );

    const particleSpeedAccessibleValueProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        snapshotProperty,
        ...kilometersPerSecondUnit.getDependentProperties(),
        ...metersPerSecondUnit.getDependentProperties()
      ] ) ),
      () => ifSnapshot( snapshot => {
        if ( snapshot.sourceType === 'photons' ) {
          return '';
        }

        const particleMass = QuantumWaveInterferenceConstants.getParticleMass( snapshot.sourceType );
        const speed = snapshot.effectiveWavelength === 0 ? 0 :
                      QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( particleMass * snapshot.effectiveWavelength );
        return speed >= 10000 ?
               kilometersPerSecondUnit.getAccessibleString( roundSymmetric( speed / 1000 ), NUMBER_FORMAT_OPTIONS ) :
               metersPerSecondUnit.getAccessibleString( roundSymmetric( speed ), NUMBER_FORMAT_OPTIONS );
      }, '' )( snapshotProperty.value )
    );

    const particleSpeedDescriptionProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.particleSpeed.createProperty( {
        speed: particleSpeedAccessibleValueProperty
      } );

    this.wavelengthOrSpeedAccessibleProperty = new DerivedProperty(
      [ snapshotProperty, wavelengthDescriptionProperty, particleSpeedDescriptionProperty ],
      ( snapshot, wavelengthDescription, particleSpeedDescription ) => snapshot ?
                                                                       ( snapshot.sourceType === 'photons' ?
                                                                         wavelengthDescription :
                                                                         particleSpeedDescription ) :
                                                                       ''
    );

    this.slitSettingProperty = new DerivedProperty(
      [
        snapshotProperty,
        ...slitSettingDisplayDependencies
      ],
      ifSnapshot( snapshot => slitSettingDisplayMap[ snapshot.slitSetting ].value, '' )
    );
    const snapshotSlitSettingProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier> = snapshotProperty.derived(
      snapshot => snapshot ? snapshot.slitSetting : 'bothOpen'
    );
    const slitSettingDescriptionProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.slitConfiguration.createProperty( {
        slitSetting: snapshotSlitSettingProperty,
        slitOrientation: slitOrientation
      } );
    this.slitSettingListItemProperty = new DerivedProperty(
      [ snapshotProperty, slitSettingDescriptionProperty ],
      ( snapshot, description ) => snapshot ? description : ''
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

    const screenBrightnessAccessibleValueProperty = DerivedProperty.deriveAny(
      [
        snapshotProperty,
        ...percentUnit.getDependentProperties()
      ],
      () => ifSnapshot( snapshot => percentUnit.getAccessibleString( snapshot.brightness, {
        decimalPlaces: 0,
        showTrailingZeros: false,
        showIntegersAsIntegers: true
      } ), '' )( snapshotProperty.value )
    );
    const screenBrightnessDescriptionProperty =
      QuantumWaveInterferenceFluent.a11y.snapshotsDialog.screenBrightness.createProperty( {
        brightness: screenBrightnessAccessibleValueProperty
      } );
    this.screenBrightnessAccessibleProperty = new DerivedProperty(
      [ snapshotProperty, screenBrightnessDescriptionProperty ],
      ( snapshot, description ) => snapshot ? description : ''
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

    if ( options.showScreenDistance ) {
      const screenDistanceAccessibleValueProperty = DerivedProperty.deriveAny(
        [
          snapshotProperty,
          ...metersUnit.getDependentProperties()
        ],
        () => ifSnapshot( snapshot => metersUnit.getAccessibleString( snapshot.screenDistance, {
          decimalPlaces: 2,
          showTrailingZeros: true
        } ), '' )( snapshotProperty.value )
      );
      const screenDistanceDescriptionProperty =
        QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.screenDistance.createProperty( {
          distance: screenDistanceAccessibleValueProperty
        } );
      this.screenDistanceAccessibleProperty = new DerivedProperty(
        [ snapshotProperty, screenDistanceDescriptionProperty ],
        ( snapshot, description ) => snapshot ? description : ''
      );
    }
    else {
      this.screenDistanceAccessibleProperty = null;
    }

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

  }
}

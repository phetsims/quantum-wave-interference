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

type SlitOrientation = 'leftRight' | 'topBottom';
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
  public readonly headingProperty: TReadOnlyProperty<string>;
  public readonly wavelengthOrSpeedProperty: TReadOnlyProperty<string>;
  public readonly wavelengthOrSpeedAccessibleProperty: TReadOnlyProperty<string>;
  public readonly slitSeparationProperty: TReadOnlyProperty<string>;
  public readonly slitSeparationAccessibleProperty: TReadOnlyProperty<string>;
  public readonly screenDistanceProperty: TReadOnlyProperty<string> | null;
  public readonly screenDistanceAccessibleProperty: TReadOnlyProperty<string> | null;
  public readonly slitSettingProperty: TReadOnlyProperty<string>;
  public readonly screenBrightnessProperty: TReadOnlyProperty<string>;
  public readonly screenBrightnessAccessibleProperty: TReadOnlyProperty<string>;
  public readonly trashButtonAccessibleNameProperty: TReadOnlyProperty<string>;
  public readonly detectionModeListItemProperty: TReadOnlyProperty<string>;
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

    this.slitSeparationProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        snapshotProperty,
        QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
        QuantumWaveInterferenceFluent.slitSeparationStringProperty,
        ...micrometersUnit.getDependentProperties(),
        ...millimetersUnit.getDependentProperties()
      ] ) ),
      () => ifSnapshot( snapshot => formatLabelValue(
        QuantumWaveInterferenceFluent.slitSeparationStringProperty.value,
        formatSlitSeparation( snapshot.slitSeparation ).visualString
      ), '' )( snapshotProperty.value )
    );

    this.slitSeparationAccessibleProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        snapshotProperty,
        QuantumWaveInterferenceFluent.snapshotLabelValuePatternStringProperty,
        QuantumWaveInterferenceFluent.slitSeparationStringProperty,
        ...micrometersUnit.getDependentProperties(),
        ...millimetersUnit.getDependentProperties()
      ] ) ),
      () => ifSnapshot( snapshot => formatLabelValue(
        QuantumWaveInterferenceFluent.slitSeparationStringProperty.value,
        formatSlitSeparation( snapshot.slitSeparation ).accessibleString
      ), '' )( snapshotProperty.value )
    );

    this.wavelengthOrSpeedProperty = DerivedProperty.deriveAny(
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
        const particleMass = QuantumWaveInterferenceConstants.getParticleMass( sourceType );
        const speed = snapshot.effectiveWavelength === 0 ? 0 :
                      QuantumWaveInterferenceConstants.PLANCK_CONSTANT /
                      ( particleMass * snapshot.effectiveWavelength );
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

    this.wavelengthOrSpeedAccessibleProperty = DerivedProperty.deriveAny(
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
          const wavelengthValue = nanometersUnit.getAccessibleString( roundSymmetric( snapshot.wavelength ), {
            decimalPlaces: 0,
            showTrailingZeros: false,
            showIntegersAsIntegers: true
          } );
          return formatLabelValue( SceneryPhetFluent.wavelengthStringProperty.value, wavelengthValue );
        }

        const sourceType = snapshot.sourceType;
        const particleMass = QuantumWaveInterferenceConstants.getParticleMass( sourceType );
        const speed = snapshot.effectiveWavelength === 0 ? 0 :
                      QuantumWaveInterferenceConstants.PLANCK_CONSTANT /
                      ( particleMass * snapshot.effectiveWavelength );
        const speedValue = speed >= 10000
                           ? kilometersPerSecondUnit.getAccessibleString( roundSymmetric( speed / 1000 ), {
            decimalPlaces: 0,
            showTrailingZeros: false,
            showIntegersAsIntegers: true
          } )
                           : metersPerSecondUnit.getAccessibleString( roundSymmetric( speed ), {
            decimalPlaces: 0,
            showTrailingZeros: false,
            showIntegersAsIntegers: true
          } );
        return formatLabelValue( QuantumWaveInterferenceFluent.particleSpeedStringProperty.value, speedValue );
      }, '' )( snapshotProperty.value )
    );

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

    this.screenBrightnessAccessibleProperty = DerivedProperty.deriveAny(
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
          percentUnit.getAccessibleString( percentValue, {
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
        snapshot.detectionMode === 'averageIntensity'
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

// Copyright 2026, University of Colorado Boulder

/**
 * PDOM-only list of current source, slit, and detector-screen details. This factors the Experiment screen's vetted
 * "Current experimental details" design so the same description structure can be used by related screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import { roundSymmetric } from '../../../../../dot/js/util/roundSymmetric.js';
import AccessibleList, { type AccessibleListItem } from '../../../../../scenery-phet/js/accessibility/AccessibleList.js';
import { kilometersPerSecondUnit } from '../../../../../scenery-phet/js/units/kilometersPerSecondUnit.js';
import { metersPerSecondUnit } from '../../../../../scenery-phet/js/units/metersPerSecondUnit.js';
import { metersUnit } from '../../../../../scenery-phet/js/units/metersUnit.js';
import { micrometersUnit } from '../../../../../scenery-phet/js/units/micrometersUnit.js';
import { nanometersUnit } from '../../../../../scenery-phet/js/units/nanometersUnit.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type DetectionMode } from '../../model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import { type SourceType } from '../../model/SourceType.js';
import QuantumWaveInterferenceConstants from '../../QuantumWaveInterferenceConstants.js';
import { getWavelengthColorZone, getWavelengthColorZoneStringProperty, WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES } from '../WavelengthColorUtils.js';
import { type SlitOrientation } from './QuantumWaveInterferenceScreenSummaryContent.js';

type RangeLike = {
  min: number;
  max: number;
};

type SetupDetailsScene = {
  sourceType: SourceType;
  velocityRange: RangeLike;
  slitSeparationRange: RangeLike;
};

type SetupDetailsModel = {
  sceneProperty: TReadOnlyProperty<SetupDetailsScene>;
  currentIsEmittingProperty: TReadOnlyProperty<boolean>;
  currentWavelengthProperty: TReadOnlyProperty<number>;
  currentVelocityProperty: TReadOnlyProperty<number>;
  currentSlitSeparationProperty: TReadOnlyProperty<number>;
};

type SetupDetailsOptions = {
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;
  screenDistanceProperty?: TReadOnlyProperty<number>;
  slitOrientation?: SlitOrientation;
  additionalListItems?: AccessibleListItem[];
};

const NANOMETER_RANGE_THRESHOLD_MM = 0.0001;
const MICROMETERS_PER_MILLIMETER = 1000;
const NANOMETERS_PER_MILLIMETER = 1e6;

export default class ExperimentSetupDetailsNode extends Node {

  public constructor(
    model: SetupDetailsModel,
    slitSettingProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>,
    providedOptions: SetupDetailsOptions = {}
  ) {

    const slitOrientation = providedOptions.slitOrientation || 'leftRight';

    const sourceTypeProperty = model.sceneProperty.derived( scene => scene.sourceType );
    const isEmittingStringProperty = model.currentIsEmittingProperty.derived( isEmitting => isEmitting ? 'true' : 'false' );
    const isPhotonSceneProperty = model.sceneProperty.derived( scene => scene.sourceType === 'photons' );
    const isParticleSceneProperty = model.sceneProperty.derived( scene => scene.sourceType !== 'photons' );

    const sourceEmitterDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.sourceEmitter.createProperty( {
        sourceType: sourceTypeProperty,
        isEmitting: isEmittingStringProperty
      } );

    const wavelengthStringProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [ model.currentWavelengthProperty, ...nanometersUnit.getDependentProperties() ] ) ),
      () => nanometersUnit.getAccessibleString( roundSymmetric( model.currentWavelengthProperty.value ), {
        decimalPlaces: 0,
        showTrailingZeros: false,
        showIntegersAsIntegers: true
      } )
    );

    const wavelengthColorStringProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        model.currentWavelengthProperty,
        ...WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES
      ] ) ),
      () => getWavelengthColorZoneStringProperty(
        getWavelengthColorZone( roundSymmetric( model.currentWavelengthProperty.value ) )
      ).value
    );

    const wavelengthDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.wavelength.createProperty( {
        wavelength: wavelengthStringProperty,
        color: wavelengthColorStringProperty
      } );

    const particleSpeedStringProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        model.sceneProperty,
        model.currentVelocityProperty,
        ...kilometersPerSecondUnit.getDependentProperties(),
        ...metersPerSecondUnit.getDependentProperties()
      ] ) ),
      () => {

        // Match the visual controls: electrons use km/s, while the slower particle sources use m/s.
        const scene = model.sceneProperty.value;
        const velocity = model.currentVelocityProperty.value;
        const useKmPerSecond = scene.velocityRange.max >= 10000;
        const speedUnit = useKmPerSecond ? kilometersPerSecondUnit : metersPerSecondUnit;
        const speedValue = useKmPerSecond ? velocity / 1000 : velocity;
        return speedUnit.getAccessibleString( roundSymmetric( speedValue ), {
          decimalPlaces: 0,
          showTrailingZeros: false,
          showIntegersAsIntegers: true
        } );
      }
    );

    const particleSpeedDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.particleSpeed.createProperty( {
        speed: particleSpeedStringProperty
      } );

    const particleSourceTypeProperty = model.sceneProperty.derived(
      scene => scene.sourceType as 'electrons' | 'neutrons' | 'heliumAtoms'
    );
    const particleMassDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.particleMass.accessibleParagraph.createProperty( {
        sourceType: particleSourceTypeProperty
      } );

    const slitConfigurationDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.slitConfiguration.createProperty( {
        slitSetting: slitSettingProperty,
        slitOrientation: slitOrientation
      } );

    const slitSeparationStringProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        model.sceneProperty,
        model.currentSlitSeparationProperty,
        ...micrometersUnit.getDependentProperties(),
        ...nanometersUnit.getDependentProperties()
      ] ) ),
      () => {
        const scene = model.sceneProperty.value;
        const slitSeparationMM = model.currentSlitSeparationProperty.value;
        if ( scene.slitSeparationRange.max <= NANOMETER_RANGE_THRESHOLD_MM ) {
          const slitSeparationNM = slitSeparationMM * NANOMETERS_PER_MILLIMETER;
          return nanometersUnit.getAccessibleString( slitSeparationNM, {
            decimalPlaces: QuantumWaveInterferenceConstants.getCompactDecimalPlacesForMaxValue(
              scene.slitSeparationRange.max * NANOMETERS_PER_MILLIMETER
            ),
            showTrailingZeros: true
          } );
        }

        const slitSeparationUM = slitSeparationMM * MICROMETERS_PER_MILLIMETER;
        const decimalPlaces = QuantumWaveInterferenceConstants.getRangeDecimalPlaces(
          scene.slitSeparationRange.min * MICROMETERS_PER_MILLIMETER,
          scene.slitSeparationRange.max * MICROMETERS_PER_MILLIMETER
        );
        return micrometersUnit.getAccessibleString( slitSeparationUM, {
          decimalPlaces: decimalPlaces,
          showTrailingZeros: false,
          showIntegersAsIntegers: true
        } );
      }
    );

    const slitSeparationDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.slitSeparation.createProperty( {
        distance: slitSeparationStringProperty
      } );

    const listItems: ( TReadOnlyProperty<string> | AccessibleListItem )[] = [
      sourceEmitterDescriptionStringProperty
    ];

    if ( providedOptions.detectionModeProperty ) {
      listItems.push(
        QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.detectionMode.createProperty( {
          detectionMode: providedOptions.detectionModeProperty
        } )
      );
    }

    listItems.push(
      {
        stringProperty: wavelengthDescriptionStringProperty,
        visibleProperty: isPhotonSceneProperty
      },
      {
        stringProperty: particleSpeedDescriptionStringProperty,
        visibleProperty: isParticleSceneProperty
      },
      {
        stringProperty: particleMassDescriptionStringProperty,
        visibleProperty: isParticleSceneProperty
      },
      slitConfigurationDescriptionStringProperty,
      slitSeparationDescriptionStringProperty
    );

    const screenDistanceProperty = providedOptions.screenDistanceProperty;
    if ( screenDistanceProperty ) {
      const screenDistanceStringProperty = DerivedProperty.deriveAny(
        Array.from( new Set( [ screenDistanceProperty, ...metersUnit.getDependentProperties() ] ) ),
        () => metersUnit.getAccessibleString( screenDistanceProperty.value, {
          decimalPlaces: 2,
          showTrailingZeros: true,
          showIntegersAsIntegers: true
        } )
      );

      listItems.push(
        QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.screenDistance.createProperty( {
          distance: screenDistanceStringProperty
        } )
      );
    }

    providedOptions.additionalListItems && listItems.push( ...providedOptions.additionalListItems );

    super( {
      accessibleTemplate: AccessibleList.createTemplateProperty( {
        leadingParagraphStringProperty: QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.leadingParagraphStringProperty,
        listItems: listItems
      } )
    } );
  }
}

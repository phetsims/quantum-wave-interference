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
import { toFixed } from '../../../../../dot/js/util/toFixed.js';
import AccessibleList, { type AccessibleListItem } from '../../../../../scenery-phet/js/accessibility/AccessibleList.js';
import { kilometersPerSecondUnit } from '../../../../../scenery-phet/js/units/kilometersPerSecondUnit.js';
import { metersPerSecondUnit } from '../../../../../scenery-phet/js/units/metersPerSecondUnit.js';
import { metersUnit } from '../../../../../scenery-phet/js/units/metersUnit.js';
import { nanometersUnit } from '../../../../../scenery-phet/js/units/nanometersUnit.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type DetectionMode } from '../../model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import { type SourceType } from '../../model/SourceType.js';
import { getWavelengthColorZone, getWavelengthColorZoneString } from '../WavelengthColorUtils.js';
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
};

const getDecimalPlacesForValue = ( value: number ): number => {
  if ( value === Math.floor( value ) ) {
    return 0;
  }
  const str = value.toString();
  const decimalIndex = str.indexOf( '.' );
  return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
};

const getRangeDecimalPlaces = ( min: number, max: number ): number =>
  Math.max( getDecimalPlacesForValue( min ), getDecimalPlacesForValue( max ) );

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

    const wavelengthColorStringProperty = new DerivedProperty(
      [
        model.currentWavelengthProperty,
        QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.violetStringProperty,
        QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.blueStringProperty,
        QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.indigoStringProperty,
        QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.greenStringProperty,
        QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.yellowStringProperty,
        QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.orangeStringProperty,
        QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.redStringProperty
      ],
      wavelength => getWavelengthColorZoneString(
        getWavelengthColorZone( roundSymmetric( wavelength ) )
      )
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

    const slitConfigurationDescriptionStringProperty = slitOrientation === 'topBottom' ?
                                                       QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.slitConfigurationTopBottom.createProperty( {
                                                         slitSetting: slitSettingProperty
                                                       } ) :
                                                       QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.slitConfiguration.createProperty( {
                                                         slitSetting: slitSettingProperty
                                                       } );

    const slitSeparationStringProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        model.sceneProperty,
        model.currentSlitSeparationProperty,
        ...QuantumWaveInterferenceFluent.a11y.slitWidthMicrometersPattern.getDependentProperties()
      ] ) ),
      () => {
        const scene = model.sceneProperty.value;
        const slitSeparationMM = model.currentSlitSeparationProperty.value;
        const slitSeparationUM = slitSeparationMM * 1000;
        const decimalPlaces = getRangeDecimalPlaces(
          scene.slitSeparationRange.min * 1000,
          scene.slitSeparationRange.max * 1000
        );
        return QuantumWaveInterferenceFluent.a11y.slitWidthMicrometersPattern.format( {
          value: toFixed( slitSeparationUM, decimalPlaces )
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

    super( {
      accessibleTemplate: AccessibleList.createTemplateProperty( {
        leadingParagraphStringProperty: QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.leadingParagraphStringProperty,
        listItems: listItems
      } )
    } );
  }
}

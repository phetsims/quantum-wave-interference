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
import { percentUnit } from '../../../../../scenery-phet/js/units/percentUnit.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import { type SourceType } from '../../model/SourceType.js';
import QuantumWaveInterferenceConstants from '../../QuantumWaveInterferenceConstants.js';
import { getWavelengthColorZone, getWavelengthColorZoneStringProperty, WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES } from '../WavelengthColorUtils.js';
import createCanonicalExperimentDetailsListItems from './createCanonicalExperimentDetailsListItems.js';
import { type SlitOrientation } from './QuantumWaveInterferenceScreenSummaryContent.js';

// Minimal { min, max } range shape used to avoid a hard dependency on dot/Range in the structural types below.
type RangeLike = {
  min: number;
  max: number;
};

/**
 * Structural subset of a scene model that carries the source-type identity and the physical ranges needed
 * to choose appropriate display units. particleSpeedRange is in m/s; slitSeparationRange is in mm.
 */
type SetupDetailsScene = {
  sourceType: SourceType;
  particleSpeedRange: RangeLike; // m/s — used to decide between m/s and km/s display units
  slitSeparationRange: RangeLike; // mm — used to decide between μm and nm display units
};

/**
 * Structural model contract required by ExperimentSetupDetailsNode. Satisfied by BaseScreenModel and its
 * subclasses, but intentionally narrow so unrelated screens can provide their own lightweight implementation.
 * currentWavelengthProperty is in nm; currentParticleSpeedProperty is in m/s; currentSlitSeparationProperty is in mm.
 */
type SetupDetailsModel = {
  sceneProperty: TReadOnlyProperty<SetupDetailsScene>;
  currentWavelengthProperty: TReadOnlyProperty<number>; // nm — photon scenes only
  currentParticleSpeedProperty: TReadOnlyProperty<number>; // m/s — matter-wave scenes only
  currentSlitSeparationProperty: TReadOnlyProperty<number>; // mm
  currentScreenBrightnessProperty: TReadOnlyProperty<number>; // percent
};

/**
 * Options that control which list items are rendered and supply optional model properties for items that are not
 * always present. All fields are optional; defaults produce the full canonical Experiment-screen description.
 */
type SetupDetailsOptions = {

  // When provided, appends a "screen distance" list item. Value is in meters.
  screenDistanceProperty?: TReadOnlyProperty<number>;

  // Orientation of the slits used to choose the correct directional string (default: 'leftRight').
  slitOrientation?: SlitOrientation;

  // Set false to suppress the "Current experimental details" leading paragraph (default: true).
  includeLeadingParagraph?: boolean;

  // Optional leading paragraph string to use before the list items.
  leadingParagraphStringProperty?: TReadOnlyProperty<string>;
};

const NANOMETER_RANGE_THRESHOLD_MM = 0.0001;
const MICROMETERS_PER_MILLIMETER = 1000;
const NANOMETERS_PER_MILLIMETER = 1e6;

export default class ExperimentSetupDetailsNode extends Node {

  public constructor(
    model: SetupDetailsModel,
    slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>,
    providedOptions: SetupDetailsOptions = {}
  ) {

    const slitOrientation = providedOptions.slitOrientation || 'leftRight';

    const isPhotonSceneProperty = model.sceneProperty.derived( scene => scene.sourceType === 'photons' );
    const isParticleSceneProperty = model.sceneProperty.derived( scene => scene.sourceType !== 'photons' );
    const isSlitGeometryRelevantProperty = slitConfigurationProperty.derived( slitConfiguration => slitConfiguration !== 'noBarrier' );

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
        model.currentParticleSpeedProperty,
        ...kilometersPerSecondUnit.getDependentProperties(),
        ...metersPerSecondUnit.getDependentProperties()
      ] ) ),
      () => {

        // Match the visual controls: electrons use km/s, while the slower particle sources use m/s.
        const scene = model.sceneProperty.value;
        const velocity = model.currentParticleSpeedProperty.value;
        const useKmPerSecond = scene.particleSpeedRange.max >= 10000;
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

    const slitConfigurationDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.slitConfiguration.createProperty( {
        slitSetting: slitConfigurationProperty,
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

    const screenBrightnessStringProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [
        model.currentScreenBrightnessProperty,
        ...percentUnit.getDependentProperties()
      ] ) ),
      () => percentUnit.getAccessibleString( model.currentScreenBrightnessProperty.value, {
        decimalPlaces: 0,
        showTrailingZeros: false,
        showIntegersAsIntegers: true
      } )
    );

    const screenBrightnessDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.snapshotsDialog.screenBrightness.createProperty( {
        brightness: screenBrightnessStringProperty
      } );

    const screenDistanceProperty = providedOptions.screenDistanceProperty;
    let screenDistanceListItem: AccessibleListItem | undefined;
    if ( screenDistanceProperty ) {
      const screenDistanceStringProperty = DerivedProperty.deriveAny(
        Array.from( new Set( [ screenDistanceProperty, ...metersUnit.getDependentProperties() ] ) ),
        () => metersUnit.getAccessibleString( screenDistanceProperty.value, {
          decimalPlaces: 2,
          showTrailingZeros: true,
          showIntegersAsIntegers: true
        } )
      );

      screenDistanceListItem = {
        stringProperty: QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.screenDistance.createProperty( {
          distance: screenDistanceStringProperty
        } ),
        visibleProperty: isSlitGeometryRelevantProperty
      };
    }

    const listItems = createCanonicalExperimentDetailsListItems<TReadOnlyProperty<string> | AccessibleListItem>( {
      sourcePhysicsItems: [
        {
          stringProperty: wavelengthDescriptionStringProperty,
          visibleProperty: isPhotonSceneProperty
        },
        {
          stringProperty: particleSpeedDescriptionStringProperty,
          visibleProperty: isParticleSceneProperty
        }
      ],
      slitConfigurationItem: slitConfigurationDescriptionStringProperty,
      slitSeparationItem: {
        stringProperty: slitSeparationDescriptionStringProperty,
        visibleProperty: isSlitGeometryRelevantProperty
      },
      screenDistanceItem: screenDistanceListItem,
      screenBrightnessItem: screenBrightnessDescriptionStringProperty
    } );

    super( {
      accessibleTemplate: AccessibleList.createTemplateProperty( {
        leadingParagraphStringProperty: providedOptions.includeLeadingParagraph === false ?
                                        null :
                                        providedOptions.leadingParagraphStringProperty ||
                                        QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.leadingParagraphStringProperty,
        listItems: listItems
      } )
    } );
  }
}

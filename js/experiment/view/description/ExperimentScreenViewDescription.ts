// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentScreenViewDescription owns the Experiment screen's PDOM-only content and heading groups.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import { roundSymmetric } from '../../../../../dot/js/util/roundSymmetric.js';
import { toFixed } from '../../../../../dot/js/util/toFixed.js';
import AccessibleList from '../../../../../scenery-phet/js/accessibility/AccessibleList.js';
import { kilometersPerSecondUnit } from '../../../../../scenery-phet/js/units/kilometersPerSecondUnit.js';
import { metersPerSecondUnit } from '../../../../../scenery-phet/js/units/metersPerSecondUnit.js';
import { metersUnit } from '../../../../../scenery-phet/js/units/metersUnit.js';
import { nanometersUnit } from '../../../../../scenery-phet/js/units/nanometersUnit.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import { getWavelengthColorZone, getWavelengthColorZoneString } from '../../../common/view/WavelengthColorUtils.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../../ExperimentConstants.js';
import ExperimentModel from '../../model/ExperimentModel.js';
import type SceneModel from '../../model/SceneModel.js';
import type OverheadEmitterNode from '../OverheadEmitterNode.js';
import type SceneRadioButtonGroup from '../../../common/view/SceneRadioButtonGroup.js';
import type ScreenSettingsPanel from '../ScreenSettingsPanel.js';
import type SlitControlPanel from '../SlitControlPanel.js';
import type SourceControlPanel from '../../../common/view/SourceControlPanel.js';
import DetectorScreenDescriber from './DetectorScreenDescriber.js';
import SlitViewDescriptionNode from './SlitViewDescriptionNode.js';

export default class ExperimentScreenViewDescription extends Node {

  public readonly experimentSetupHeadingNode: Node;
  public readonly sourceHeadingNode: Node;
  public readonly slitsHeadingNode: Node;
  public readonly detectorScreenHeadingNode: Node;

  public constructor(
    model: ExperimentModel,
    overheadEmitterNode: OverheadEmitterNode,
    sourceControlPanel: SourceControlPanel<SceneModel>,
    sceneRadioButtonGroup: SceneRadioButtonGroup<SceneModel>,
    slitControlPanel: SlitControlPanel,
    detectorScreenButtonNodes: Node[],
    screenSettingsPanel: ScreenSettingsPanel
  ) {

    super();

    // Accessible paragraph describing the current state of the detector screen for screen reader users.
    // The description scales with hit count: few hits describe scattered detections,
    // many hits describe the emerging/established interference pattern.
    const maxHitsReachedResponseNode = new Node();
    this.addChild( maxHitsReachedResponseNode );
    model.scenes.forEach( scene => {
      scene.isMaxHitsReachedProperty.lazyLink( isMaxHitsReached => {
        if ( isMaxHitsReached ) {
          maxHitsReachedResponseNode.addAccessibleContextResponse(
            QuantumWaveInterferenceFluent.a11y.detectorScreen.maxHitsReached.accessibleContextResponseStringProperty,
            { responseGroup: 'quantum-wave-interference-experiment-max-hits-reached' }
          );
        }
      } );
    } );

    const detectorScreenDescriber = new DetectorScreenDescriber(
      model.sceneProperty,
      model.isRulerVisibleProperty,
      model.detectorScreenScaleIndexProperty
    );
    const detectorScreenDescriptionNode = new Node( {
      accessibleParagraph: detectorScreenDescriber.descriptionProperty
    } );
    this.addChild( detectorScreenDescriptionNode );

    const slitViewDescriptionNode = new SlitViewDescriptionNode( model );
    this.addChild( slitViewDescriptionNode );

    // Accessible paragraph describing the particle mass for screen reader users.
    // This is important on-screen text (rendered as RichText in OverheadEmitterNode) that supports the learning goal:
    // "Relate particle momentum to wavelength using the de Broglie relationship." Hidden for photons (which are
    // massless).
    const particleSourceTypeProperty = model.sceneProperty.derived(
      scene => scene.sourceType as 'electrons' | 'neutrons' | 'heliumAtoms'
    );
    const particleMassDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.particleMass.accessibleParagraph.createProperty( {
        sourceType: particleSourceTypeProperty
      } );

    // Booleans are converted to Fluent select keys, and source-type predicates control which scene-specific details
    // are included in the accessible setup list.
    const sourceTypeProperty = model.sceneProperty.derived( scene => scene.sourceType );
    const isEmittingStringProperty = model.currentIsEmittingProperty.derived( isEmitting => isEmitting ? 'true' : 'false' );
    const isPhotonSceneProperty = model.sceneProperty.derived( scene => scene.sourceType === 'photons' );
    const isParticleSceneProperty = model.sceneProperty.derived( scene => scene.sourceType !== 'photons' );

    const sourceEmitterDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.sourceEmitter.createProperty( {
        sourceType: sourceTypeProperty,
        isEmitting: isEmittingStringProperty
      } );

    const detectionModeDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.detectionMode.createProperty( {
        detectionMode: model.currentDetectionModeProperty
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

    const slitConfigurationDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.slitConfiguration.createProperty( {
        slitSetting: model.currentSlitSettingProperty
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
        const decimalPlaces = ExperimentConstants.getRangeDecimalPlaces(
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

    const screenDistanceStringProperty = DerivedProperty.deriveAny(
      Array.from( new Set( [ model.currentScreenDistanceProperty, ...metersUnit.getDependentProperties() ] ) ),
      () => metersUnit.getAccessibleString( model.currentScreenDistanceProperty.value, {
        decimalPlaces: 2,
        showTrailingZeros: true,
        showIntegersAsIntegers: true
      } )
    );

    const screenDistanceDescriptionStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.screenDistance.createProperty( {
        distance: screenDistanceStringProperty
      } );

    const experimentSetupDetailsListNode = new Node( {
      accessibleTemplate: AccessibleList.createTemplateProperty( {
        leadingParagraphStringProperty: QuantumWaveInterferenceFluent.a11y.experimentSetupDetails.leadingParagraphStringProperty,
        listItems: [
          sourceEmitterDescriptionStringProperty,
          detectionModeDescriptionStringProperty,
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
          slitSeparationDescriptionStringProperty,
          screenDistanceDescriptionStringProperty
        ]
      } )
    } );
    this.addChild( experimentSetupDetailsListNode );

    // Heading nodes for PDOM navigation. Each groups related controls under a heading so screen reader users can jump
    // between major sections with heading shortcuts.
    this.experimentSetupHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.experimentSetupHeadingStringProperty
    } );
    this.addChild( this.experimentSetupHeadingNode );

    this.sourceHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.sourceHeadingStringProperty
    } );
    this.addChild( this.sourceHeadingNode );

    this.slitsHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.slitsHeadingStringProperty
    } );
    this.addChild( this.slitsHeadingNode );

    this.detectorScreenHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.detectorScreenHeadingStringProperty
    } );
    this.addChild( this.detectorScreenHeadingNode );

    // Play Area focus order, organized under headings for screen reader navigation.
    this.experimentSetupHeadingNode.pdomOrder = [
      detectorScreenDescriptionNode,
      slitViewDescriptionNode,
      experimentSetupDetailsListNode,
      overheadEmitterNode.maxHitsReachedPanel
    ];

    this.sourceHeadingNode.pdomOrder = [
      overheadEmitterNode.laserPointerNode,
      overheadEmitterNode.particleEmitterNode,
      sourceControlPanel,
      sceneRadioButtonGroup
    ];

    this.slitsHeadingNode.pdomOrder = [ slitControlPanel ];

    this.detectorScreenHeadingNode.pdomOrder = [
      ...detectorScreenButtonNodes,
      screenSettingsPanel
    ];
  }
}

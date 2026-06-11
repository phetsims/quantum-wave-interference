// Copyright 2026, University of Colorado Boulder

/**
 * PDOM-only list of detector-screen state details for the Experiment screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import AccessibleList from '../../../../../scenery-phet/js/accessibility/AccessibleList.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import DetectorScreenDescriber from '../../../common/view/description/DetectorScreenDescriber.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { getDetectorScreenHalfWidthForScaleIndex } from '../../model/DetectorScreenScale.js';
import ExperimentModel from '../../model/ExperimentModel.js';

type FluentBoolean = 'true' | 'false';

function toFluentBoolean( value: boolean ): FluentBoolean {
  return value ? 'true' : 'false';
}

export default class ExperimentDetectorScreenDetailsNode extends Node {

  public constructor( model: ExperimentModel ) {
    const detectorScreenDescriber = new DetectorScreenDescriber(
      model.sceneProperty,
      model.isRulerVisibleProperty,
      model.detectorScreenScaleIndexProperty.derived( getDetectorScreenHalfWidthForScaleIndex )
    );

    const isEmittingStringProperty = model.currentIsEmittingProperty.derived( toFluentBoolean );
    const isMaxHitsReachedStringProperty = model.currentIsMaxHitsReachedProperty.derived( toFluentBoolean );

    const sourceStateStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.sourceState.createProperty( {
        isEmitting: isEmittingStringProperty
      } );

    const totalHitsStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.totalHits.createProperty( {
        hitCount: model.currentTotalHitsProperty,
        isMaxHitsReached: isMaxHitsReachedStringProperty
      } );

    const totalHitsVisibleProperty = model.currentDetectionModeProperty.derived( detectionMode => detectionMode === 'hits' );

    const patternDescriptionStringProperty = new DerivedProperty(
      [
        detectorScreenDescriber.descriptionProperty,
        model.currentDetectionModeProperty,
        model.currentTotalHitsProperty,
        QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty,
        QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.emptyStringProperty
      ],
      ( detectorScreenDescription, detectionMode, totalHits, intensityOffDescription, emptyDescription ) =>
        detectionMode === 'hits' && totalHits === 0 || detectorScreenDescription === intensityOffDescription ?
        emptyDescription :
        detectorScreenDescription
    );

    super( {
      accessibleTemplate: AccessibleList.createTemplateProperty( {
        listItems: [
          sourceStateStringProperty,
          {
            stringProperty: totalHitsStringProperty,
            visibleProperty: totalHitsVisibleProperty
          },
          patternDescriptionStringProperty
        ]
      } )
    } );
  }
}

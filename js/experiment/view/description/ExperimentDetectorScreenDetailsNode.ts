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

// String-literal union used as a boolean selector in Fluent message patterns, which expect string values rather than
// native booleans for variant selection.
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

    const detectorScreenIsEmptyProperty = new DerivedProperty(
      [
        detectorScreenDescriber.descriptionProperty,
        model.currentDetectionModeProperty,
        model.currentTotalHitsProperty,
        QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty
      ],
      ( detectorScreenDescription, detectionMode, totalHits, intensityOffDescription ) =>
        detectionMode === 'hits' && totalHits === 0 || detectorScreenDescription === intensityOffDescription
    );

    const patternDescriptionStringProperty = new DerivedProperty(
      [
        detectorScreenDescriber.descriptionProperty,
        detectorScreenIsEmptyProperty,
        QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.emptyStringProperty
      ],
      ( detectorScreenDescription, detectorScreenIsEmpty, emptyDescription ) =>
        detectorScreenIsEmpty ? emptyDescription : detectorScreenDescription
    );

    const leadingParagraphStringProperty =
      QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.leadingParagraph.createProperty( {
        detectionMode: model.currentDetectionModeProperty,
        sourceType: model.sceneProperty.derived( scene => scene.sourceType ),
        detectorScreenIsEmpty: detectorScreenIsEmptyProperty.derived( toFluentBoolean )
      } );

    super( {
      accessibleTemplate: AccessibleList.createTemplateProperty( {
        leadingParagraphStringProperty: leadingParagraphStringProperty,
        listItems: [ {
          stringProperty: patternDescriptionStringProperty,
          visibleProperty: DerivedProperty.not( detectorScreenIsEmptyProperty )
        } ]
      } )
    } );
  }
}

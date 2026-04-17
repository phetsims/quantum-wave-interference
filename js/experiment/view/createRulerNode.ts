// Copyright 2026, University of Colorado Boulder

/**
 * Factory for the draggable ruler used by the Experiment screen.
 * The ruler's horizontal scale is calibrated to the active detector screen:
 * its full width maps to the scene's full detector width in mm.
 * Each scene gets its own ruler so the tick labels can be tuned to that scene's source type and detector size.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { rangeInclusive } from '../../../../dot/js/util/rangeInclusive.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import AccessibleDraggableOptions from '../../../../scenery-phet/js/accessibility/grab-drag/AccessibleDraggableOptions.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import RulerNode from '../../../../scenery-phet/js/RulerNode.js';
import InteractiveHighlightingNode from '../../../../scenery/js/accessibility/voicing/nodes/InteractiveHighlightingNode.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import { type SourceType } from '../model/SourceType.js';

const RULER_LABELED_TICK_INTERVAL_MM = 5;
const RULER_MINOR_TICKS_PER_MAJOR = 4;
const RULER_HEIGHT = 40;

const getRulerLabelDecimalPlaces = ( halfDetectorWidthMM: number, _sourceType: SourceType ): number => {
  if ( halfDetectorWidthMM >= 10 ) {
    return 0;
  }
  if ( halfDetectorWidthMM >= 1 ) {
    return 1;
  }
  return 2;
};

const createRulerNode = (
  detectorWidthMM: number,
  sourceType: SourceType,
  tandem: Tandem
): InteractiveHighlightingNode => {
  const halfDetectorWidthMM = detectorWidthMM / 2;
  const labelDecimalPlaces = getRulerLabelDecimalPlaces( halfDetectorWidthMM, sourceType );
  const labeledIntervalCount = detectorWidthMM / RULER_LABELED_TICK_INTERVAL_MM;
  const centerLabeledTickIndex = labeledIntervalCount / 2;
  const majorTickWidth = ExperimentConstants.DETECTOR_SCREEN_WIDTH / labeledIntervalCount;
  const majorTickLabels = rangeInclusive( 0, labeledIntervalCount ).map( i => {
    const labelValue = -halfDetectorWidthMM + i * RULER_LABELED_TICK_INTERVAL_MM;
    return toFixed( labelValue, labelDecimalPlaces );
  } );

  const rulerNode = new RulerNode(
    ExperimentConstants.DETECTOR_SCREEN_WIDTH,
    RULER_HEIGHT,
    majorTickWidth,
    majorTickLabels,
    QuantumWaveInterferenceFluent.rulerUnitsStringProperty.value,
    {
      minorTicksPerMajorTick: RULER_MINOR_TICKS_PER_MAJOR,
      unitsMajorTickIndex: centerLabeledTickIndex,
      majorTickFont: new PhetFont( 12 ),
      unitsFont: new PhetFont( 12 ),
      tandem: tandem
    }
  );

  return new InteractiveHighlightingNode( {
    children: [ rulerNode ],
    cursor: 'pointer',
    opacity: 0.8,
    accessibleName: QuantumWaveInterferenceFluent.rulerStringProperty,
    accessibleHelpText: QuantumWaveInterferenceFluent.a11y.ruler.accessibleHelpTextStringProperty,
    tagName: AccessibleDraggableOptions.tagName,
    focusable: AccessibleDraggableOptions.focusable,
    ariaRole: AccessibleDraggableOptions.ariaRole,
    accessibleNameBehavior: AccessibleDraggableOptions.accessibleNameBehavior,
    accessibleRoleDescription: AccessibleDraggableOptions.accessibleRoleDescription
  } );
};

export default createRulerNode;

// Copyright 2026, University of Colorado Boulder

/**
 * DetectorRulerNode is the draggable ruler used by the Experiment screen.
 * The ruler's horizontal scale is calibrated to the shared detector-screen zoom:
 * its full width maps to the visible detector width in mm.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { rangeInclusive } from '../../../../dot/js/util/rangeInclusive.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import AccessibleDraggableOptions from '../../../../scenery-phet/js/accessibility/grab-drag/AccessibleDraggableOptions.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import RulerNode from '../../../../scenery-phet/js/RulerNode.js';
import { millimetersUnit } from '../../../../scenery-phet/js/units/millimetersUnit.js';
import InteractiveHighlightingNode from '../../../../scenery/js/accessibility/voicing/nodes/InteractiveHighlightingNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import { DETECTOR_SCREEN_SCALE_OPTIONS } from '../model/DetectorScreenScale.js';

const RULER_LABELED_TICK_INTERVAL_MM = 5;
const RULER_MINOR_TICKS_PER_MAJOR = 4;
const RULER_HEIGHT = 40;

const getRulerLabelDecimalPlaces = ( halfDetectorWidthMM: number ): number => {
  if ( halfDetectorWidthMM >= 10 ) {
    return 0;
  }
  if ( halfDetectorWidthMM >= 1 ) {
    return 1;
  }
  return 2;
};

export default class DetectorRulerNode extends InteractiveHighlightingNode {

  public constructor( detectorScreenScaleIndexProperty: TReadOnlyProperty<number>, tandem: Tandem ) {
    const rulerContainer = new Node();
    let rulerNode: RulerNode | null = null;

    const rebuildRuler = () => {
      if ( rulerNode ) {
        rulerContainer.removeChild( rulerNode );
        rulerNode.dispose();
      }

      const { minMM, maxMM } = DETECTOR_SCREEN_SCALE_OPTIONS[ detectorScreenScaleIndexProperty.value ];
      const detectorWidthMM = maxMM - minMM;
      const halfDetectorWidthMM = detectorWidthMM / 2;
      const labelDecimalPlaces = getRulerLabelDecimalPlaces( halfDetectorWidthMM );
      const labeledIntervalCount = detectorWidthMM / RULER_LABELED_TICK_INTERVAL_MM;
      const centerLabeledTickIndex = labeledIntervalCount / 2;
      const majorTickWidth = ExperimentConstants.DETECTOR_SCREEN_WIDTH / labeledIntervalCount;
      const majorTickLabels = rangeInclusive( 0, labeledIntervalCount ).map( i => {
        const labelValue = minMM + i * RULER_LABELED_TICK_INTERVAL_MM;
        return toFixed( labelValue, labelDecimalPlaces );
      } );

      rulerNode = new RulerNode(
        ExperimentConstants.DETECTOR_SCREEN_WIDTH,
        RULER_HEIGHT,
        majorTickWidth,
        majorTickLabels,
        millimetersUnit.visualSymbolStringProperty!,
        {
          minorTicksPerMajorTick: RULER_MINOR_TICKS_PER_MAJOR,
          unitsMajorTickIndex: centerLabeledTickIndex,
          majorTickFont: new PhetFont( 12 ),
          unitsFont: new PhetFont( 12 ),
          instrumentUnitsLabelText: false,
          tandem: Tandem.OPT_OUT
        }
      );
      rulerContainer.addChild( rulerNode );
    };

    detectorScreenScaleIndexProperty.link( rebuildRuler );

    super( {
      children: [ rulerContainer ],
      cursor: 'pointer',
      opacity: 0.8,
      accessibleName: QuantumWaveInterferenceFluent.rulerStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.ruler.accessibleHelpTextStringProperty,
      tagName: AccessibleDraggableOptions.tagName,
      focusable: AccessibleDraggableOptions.focusable,
      ariaRole: AccessibleDraggableOptions.ariaRole,
      accessibleNameBehavior: AccessibleDraggableOptions.accessibleNameBehavior,
      accessibleRoleDescription: AccessibleDraggableOptions.accessibleRoleDescription,
      tandem: tandem
    } );
  }
}

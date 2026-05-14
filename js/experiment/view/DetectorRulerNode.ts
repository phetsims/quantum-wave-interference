// Copyright 2026, University of Colorado Boulder

/**
 * DetectorRulerNode is the draggable ruler used by the Experiment screen.
 * The ruler's horizontal scale is calibrated to the shared detector-screen zoom:
 * its full width maps to the visible detector width in mm.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { rangeInclusive } from '../../../../dot/js/util/rangeInclusive.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AccessibleDraggableOptions from '../../../../scenery-phet/js/accessibility/grab-drag/AccessibleDraggableOptions.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import RulerNode from '../../../../scenery-phet/js/RulerNode.js';
import SoundDragListener from '../../../../scenery-phet/js/SoundDragListener.js';
import SoundKeyboardDragListener from '../../../../scenery-phet/js/SoundKeyboardDragListener.js';
import { millimetersUnit } from '../../../../scenery-phet/js/units/millimetersUnit.js';
import InteractiveHighlightingNode from '../../../../scenery/js/accessibility/voicing/nodes/InteractiveHighlightingNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import { DETECTOR_SCREEN_SCALE_OPTIONS } from '../model/DetectorScreenScale.js';
import SceneModel from '../model/SceneModel.js';
import DetectorScreenNode from './DetectorScreenNode.js';
import GraphAccordionBox from './GraphAccordionBox.js';
import RulerDragBoundsProperty from './RulerDragBoundsProperty.js';

const RULER_LABELED_TICK_INTERVAL_MM = 5;
const RULER_MINOR_TICKS_PER_MAJOR = 4;
const RULER_HEIGHT = 40;
const RULER_KEYBOARD_DRAG_DELTA = 5;
const RULER_KEYBOARD_SHIFT_DRAG_DELTA = 1;

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
  private readonly rulerPositionProperty: Property<Vector2>;
  private readonly rulerDragBoundsProperty: RulerDragBoundsProperty;
  private readonly rulerTandem: Tandem;

  public constructor(
    scene: SceneModel,
    sceneProperty: TReadOnlyProperty<SceneModel>,
    isRulerVisibleProperty: TReadOnlyProperty<boolean>,
    detectorScreenScaleIndexProperty: TReadOnlyProperty<number>,
    rulerPositionProperty: Property<Vector2>,
    visibleBoundsProperty: TReadOnlyProperty<Bounds2>,
    graphExpandedProperty: TReadOnlyProperty<boolean>,
    detectorScreenNode: DetectorScreenNode,
    graphAccordionBox: GraphAccordionBox,
    localRootNode: Node,
    tandem: Tandem
  ) {
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

    this.rulerPositionProperty = rulerPositionProperty;
    this.rulerTandem = tandem;

    this.rulerPositionProperty.link( position => {
      this.translation = position;
    } );

    const updateRulerVisibility = () => {
      this.visible = isRulerVisibleProperty.value && sceneProperty.value === scene;
    };
    sceneProperty.link( updateRulerVisibility );
    isRulerVisibleProperty.link( updateRulerVisibility );

    this.rulerDragBoundsProperty = new RulerDragBoundsProperty(
      visibleBoundsProperty,
      scene,
      sceneProperty,
      graphExpandedProperty,
      detectorScreenNode,
      graphAccordionBox,
      this,
      localRootNode
    );
    this.rulerDragBoundsProperty.constrainRulerPositionProperty( rulerPositionProperty );
    this.addDragListeners( this.rulerDragBoundsProperty.dragBoundsProperty );
  }

  public centerRulerOnDetectorScreen(): void {
    this.rulerPositionProperty.value = this.rulerDragBoundsProperty.getCenteredRulerPosition();
  }

  private addDragListeners( dragBoundsProperty: TReadOnlyProperty<Bounds2 | null> ): void {
    this.addInputListener(
      new SoundDragListener( {
        positionProperty: this.rulerPositionProperty,
        dragBoundsProperty: dragBoundsProperty,
        tandem: this.rulerTandem.createTandem( 'dragListener' )
      } )
    );

    this.addInputListener(
      new SoundKeyboardDragListener( {
        positionProperty: this.rulerPositionProperty,
        dragBoundsProperty: dragBoundsProperty,
        keyboardDragDirection: 'upDown',
        dragDelta: RULER_KEYBOARD_DRAG_DELTA,
        shiftDragDelta: RULER_KEYBOARD_SHIFT_DRAG_DELTA,
        tandem: this.rulerTandem.createTandem( 'keyboardDragListener' )
      } )
    );
  }
}

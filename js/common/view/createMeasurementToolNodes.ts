// Copyright 2026, University of Colorado Boulder

/**
 * Factory function that creates measurement tool nodes (stopwatch, measuring tape, time plot,
 * position plot) and adds them to the provided parent node. These tools are identical between
 * the High Intensity and Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type DualString } from '../../../../axon/js/AccessibleStrings.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import getMeasuringTapeUnits from './getMeasuringTapeUnits.js';
import PositionPlotNode from './PositionPlotNode.js';
import TimePlotNode from './TimePlotNode.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';

type MeasurementSceneLike = WaveVisualizableScene & { sourceType: string; regionWidth: number };

type MeasurementToolsModel = {
  sceneProperty: TReadOnlyProperty<MeasurementSceneLike>;
  stopwatch: Stopwatch;
  isStopwatchVisibleProperty: BooleanProperty;
  isTapeMeasureVisibleProperty: BooleanProperty;
  isTimePlotVisibleProperty: BooleanProperty;
  isPositionPlotVisibleProperty: BooleanProperty;
  tapeMeasureBasePositionProperty: Vector2Property;
  tapeMeasureTipPositionProperty: Vector2Property;
};

type MeasurementToolNodes = {
  timePlotNode: TimePlotNode;
  positionPlotNode: PositionPlotNode;
};

type StopwatchTimeUnit = {
  threshold: number;
  multiplier: number;
  symbolStringProperty: TReadOnlyProperty<string>;
  accessibleNameStringProperty: TReadOnlyProperty<string>;
};

const STOPWATCH_TIME_UNITS: StopwatchTimeUnit[] = [
  {
    threshold: 1e-12,
    multiplier: 1e15,
    symbolStringProperty: QuantumWaveInterferenceFluent.timeUnits.femtoseconds.symbolStringProperty,
    accessibleNameStringProperty: QuantumWaveInterferenceFluent.timeUnits.femtoseconds.accessibleNameStringProperty
  },
  {
    threshold: 1e-9,
    multiplier: 1e12,
    symbolStringProperty: QuantumWaveInterferenceFluent.timeUnits.picoseconds.symbolStringProperty,
    accessibleNameStringProperty: QuantumWaveInterferenceFluent.timeUnits.picoseconds.accessibleNameStringProperty
  },
  {
    threshold: 1e-6,
    multiplier: 1e9,
    symbolStringProperty: QuantumWaveInterferenceFluent.timeUnits.nanoseconds.symbolStringProperty,
    accessibleNameStringProperty: QuantumWaveInterferenceFluent.timeUnits.nanoseconds.accessibleNameStringProperty
  },
  {
    threshold: 1e-3,
    multiplier: 1e6,
    symbolStringProperty: QuantumWaveInterferenceFluent.timeUnits.microseconds.symbolStringProperty,
    accessibleNameStringProperty: QuantumWaveInterferenceFluent.timeUnits.microseconds.accessibleNameStringProperty
  },
  {
    threshold: 1,
    multiplier: 1e3,
    symbolStringProperty: QuantumWaveInterferenceFluent.timeUnits.milliseconds.symbolStringProperty,
    accessibleNameStringProperty: QuantumWaveInterferenceFluent.timeUnits.milliseconds.accessibleNameStringProperty
  },
  {
    threshold: Number.POSITIVE_INFINITY,
    multiplier: 1,
    symbolStringProperty: QuantumWaveInterferenceFluent.timeUnits.seconds.symbolStringProperty,
    accessibleNameStringProperty: QuantumWaveInterferenceFluent.timeUnits.seconds.accessibleNameStringProperty
  }
];

const createPhysicalStopwatchFormatter = (): ( time: number ) => DualString => {
  return ( time: number ) => {
    const timeUnit = STOPWATCH_TIME_UNITS.find( unit => time < unit.threshold )!;
    const scaledTime = Math.max( 0, time * timeUnit.multiplier );
    const decimalPlaces = scaledTime < 10 ? 2 :
                          scaledTime < 100 ? 1 :
                          0;
    const valueString = toFixed( scaledTime, decimalPlaces );

    const valueMarkup = StringUtils.wrapLTR( `<span style='font-size: 20px; font-family:${StopwatchNode.NUMBER_FONT_FAMILY};'>${valueString}</span>` );
    const unitsMarkup = `<span style='font-size: 14px; font-family:${StopwatchNode.NUMBER_FONT_FAMILY};'>${timeUnit.symbolStringProperty.value}</span>`;

    return {
      visualString: StringUtils.fillIn( QuantumWaveInterferenceFluent.stopwatchValueUnitsPatternStringProperty.value, {
        value: valueMarkup,
        units: unitsMarkup
      } ),
      accessibleString: StringUtils.fillIn( QuantumWaveInterferenceFluent.stopwatchValueUnitsPatternStringProperty.value, {
        value: valueString,
        units: timeUnit.accessibleNameStringProperty.value
      } )
    };
  };
};

const createMeasurementToolNodes = (
  model: MeasurementToolsModel,
  parentNode: Node,
  visibleBoundsProperty: Property<Bounds2>,
  waveRegionLeft: number,
  waveRegionTop: number,
  tandem: Tandem
): MeasurementToolNodes => {

  const stopwatchNode = new StopwatchNode( model.stopwatch, {
    dragBoundsProperty: visibleBoundsProperty,
    numberDisplayRange: Stopwatch.ZERO_TO_ALMOST_SIXTY,
    numberDisplayOptions: {
      numberFormatter: createPhysicalStopwatchFormatter(),
      numberFormatterDependencies: [
        QuantumWaveInterferenceFluent.stopwatchValueUnitsPatternStringProperty,
        ...STOPWATCH_TIME_UNITS.flatMap( unit => [ unit.symbolStringProperty, unit.accessibleNameStringProperty ] )
      ],
      useRichText: true,
      maxWidth: 150
    },
    tandem: tandem.createTandem( 'stopwatchNode' )
  } );
  model.isStopwatchVisibleProperty.link( isVisible => {
    model.stopwatch.isVisibleProperty.value = isVisible;
  } );
  parentNode.addChild( stopwatchNode );

  const measuringTapeUnitsProperty = new DerivedProperty(
    [ model.sceneProperty ],
    scene => getMeasuringTapeUnits( scene.regionWidth )
  );

  const measuringTapeNode = new MeasuringTapeNode( measuringTapeUnitsProperty, {
    textBackgroundColor: 'rgba( 255, 255, 255, 0.6 )',
    textColor: 'black',
    basePositionProperty: model.tapeMeasureBasePositionProperty,
    tipPositionProperty: model.tapeMeasureTipPositionProperty,
    significantFigures: 2,
    tandem: tandem.createTandem( 'measuringTapeNode' )
  } );
  visibleBoundsProperty.link( visibleBounds => measuringTapeNode.setDragBounds( visibleBounds.eroded( 20 ) ) );
  model.isTapeMeasureVisibleProperty.linkAttribute( measuringTapeNode, 'visible' );
  parentNode.addChild( measuringTapeNode );

  const timePlotNode = new TimePlotNode(
    model.sceneProperty,
    waveRegionLeft,
    waveRegionTop,
    model.isTimePlotVisibleProperty
  );
  parentNode.addChild( timePlotNode );

  const positionPlotNode = new PositionPlotNode(
    model.sceneProperty,
    waveRegionLeft,
    waveRegionTop,
    model.isPositionPlotVisibleProperty
  );
  parentNode.addChild( positionPlotNode );

  return { timePlotNode: timePlotNode, positionPlotNode: positionPlotNode };
};

export default createMeasurementToolNodes;

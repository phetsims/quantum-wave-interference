// Copyright 2026, University of Colorado Boulder

/**
 * MeasurementToolNodes creates measurement tool nodes (stopwatch, measuring tape, time plot,
 * position plot). These tools are identical between the High Intensity and Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type DualString } from '../../../../axon/js/AccessibleStrings.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import PhetUnit from '../../../../scenery-phet/js/PhetUnit.js';
import SceneryPhetFluent from '../../../../scenery-phet/js/SceneryPhetFluent.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import { femtosecondsUnit } from '../../../../scenery-phet/js/units/femtosecondsUnit.js';
import { microsecondsUnit } from '../../../../scenery-phet/js/units/microsecondsUnit.js';
import { millisecondsUnit } from '../../../../scenery-phet/js/units/millisecondsUnit.js';
import { nanosecondsUnit } from '../../../../scenery-phet/js/units/nanosecondsUnit.js';
import { picosecondsUnit } from '../../../../scenery-phet/js/units/picosecondsUnit.js';
import { secondsUnit } from '../../../../scenery-phet/js/units/secondsUnit.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import getMeasuringTapeUnits from './getMeasuringTapeUnits.js';
import PositionPlotNode from './PositionPlotNode.js';
import TimePlotNode from './TimePlotNode.js';

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

export default class MeasurementToolNodes extends Node {

  public readonly timePlotNode: TimePlotNode;
  public readonly positionPlotNode: PositionPlotNode;

  public constructor(
    model: MeasurementToolsModel,
    visibleBoundsProperty: Property<Bounds2>,
    waveRegionLeft: number,
    waveRegionTop: number,
    tandem: Tandem
  ) {

    const stopwatchNode = new StopwatchNode( model.stopwatch, {
      dragBoundsProperty: visibleBoundsProperty,
      numberDisplayRange: Stopwatch.ZERO_TO_ALMOST_SIXTY,
      numberDisplayOptions: {
        numberFormatter: createPhysicalStopwatchFormatter(),
        numberFormatterDependencies: Array.from( new Set( [
          SceneryPhetFluent.stopwatchValueUnitsPatternStringProperty,
          ...STOPWATCH_TIME_UNITS.flatMap( timeUnit => timeUnit.unit.getDependentProperties() )
        ] ) ),
        useRichText: true,
        maxWidth: 150
      },
      tandem: tandem.createTandem( 'stopwatchNode' )
    } );
    model.isStopwatchVisibleProperty.link( isVisible => {
      model.stopwatch.isVisibleProperty.value = isVisible;
    } );

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

    const timePlotNode = new TimePlotNode(
      model.sceneProperty,
      waveRegionLeft,
      waveRegionTop,
      model.isTimePlotVisibleProperty
    );

    const positionPlotNode = new PositionPlotNode(
      model.sceneProperty,
      waveRegionLeft,
      waveRegionTop,
      model.isPositionPlotVisibleProperty
    );

    super( {
      children: [ stopwatchNode, measuringTapeNode, timePlotNode, positionPlotNode ]
    } );

    this.timePlotNode = timePlotNode;
    this.positionPlotNode = positionPlotNode;
  }
}

type StopwatchTimeUnit = {
  threshold: number;
  multiplier: number;
  unit: PhetUnit<ReadOnlyProperty<string>>;
};

const STOPWATCH_TIME_UNITS: StopwatchTimeUnit[] = [
  {
    threshold: 1e-12,
    multiplier: 1e15,
    unit: femtosecondsUnit
  },
  {
    threshold: 1e-9,
    multiplier: 1e12,
    unit: picosecondsUnit
  },
  {
    threshold: 1e-6,
    multiplier: 1e9,
    unit: nanosecondsUnit
  },
  {
    threshold: 1e-3,
    multiplier: 1e6,
    unit: microsecondsUnit
  },
  {
    threshold: 1,
    multiplier: 1e3,
    unit: millisecondsUnit
  },
  {
    threshold: Number.POSITIVE_INFINITY,
    multiplier: 1,
    unit: secondsUnit
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
    const unitsMarkup = `<span style='font-size: 14px; font-family:${StopwatchNode.NUMBER_FONT_FAMILY};'>${timeUnit.unit.getVisualSymbolString()}</span>`;

    return {
      visualString: StringUtils.fillIn( SceneryPhetFluent.stopwatchValueUnitsPatternStringProperty.value, {
        value: valueMarkup,
        units: unitsMarkup
      } ),
      accessibleString: timeUnit.unit.getAccessibleString( scaledTime, {
        decimalPlaces: decimalPlaces,
        showTrailingZeros: true
      } )
    };
  };
};

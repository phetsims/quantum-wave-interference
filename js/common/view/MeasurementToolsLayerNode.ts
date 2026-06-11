// Copyright 2026, University of Colorado Boulder

/**
 * MeasurementToolsLayerNode creates measurement tool nodes (stopwatch, measuring tape, time plot, position plot). These
 * tools are identical between the High Intensity and Single Particles screens.
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
import Range from '../../../../dot/js/Range.js';
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
import { type BarrierType } from '../model/BarrierType.js';
import { type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';
import { type WaveDisplayMode } from '../model/WaveDisplayMode.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import { type MeasurementToolsViewStateFragment } from './description/QuantumWaveInterferenceAccessibleViewState.js';
import getMeasuringTapeUnits, { MEASURING_TAPE_UNIT_VISUAL_SYMBOL_PROPERTIES } from './getMeasuringTapeUnits.js';
import PositionPlotNode from './PositionPlotNode.js';
import TimePlotNode from './TimePlotNode.js';

// Scene state needed by the measuring tape and plot tools. The structural type keeps this shared Node
// independent of the concrete High Intensity and Single Particles scene model classes.
type MeasurementSceneLike = WaveVisualizableScene & { sourceType: string; regionWidth: number; slitSeparationRange: Range };

// Structural model type for the shared measurement tools parent Node. It includes only the active
// scene, visibility Properties, and model-backed tool state needed to construct and synchronize the tools.
type MeasurementToolsModel = {

  // Active scene, used for scene-specific units and plot data.
  readonly sceneProperty: TReadOnlyProperty<MeasurementSceneLike>;

  // Model-owned stopwatch so elapsed time persists independently of the view Node.
  readonly stopwatch: Stopwatch;

  // Tool visibility toggles controlled by the Tools panel.
  readonly isStopwatchVisibleProperty: BooleanProperty;
  readonly isTapeMeasureVisibleProperty: BooleanProperty;
  readonly isTimePlotVisibleProperty: BooleanProperty;
  readonly isPositionPlotVisibleProperty: BooleanProperty;

  // Active wave display quantity used by the time and position plots.
  readonly currentWaveDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;

  // Barrier state of the active scene, used by the position plot to describe whether the sampled
  // row crosses an open slit, a covered slit, or a slit with a detector.
  readonly currentBarrierTypeProperty: TReadOnlyProperty<BarrierType>;
  readonly currentSlitSeparationProperty: TReadOnlyProperty<number>;
  readonly currentSlitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>;

  // Model-owned measuring tape endpoints so tape placement persists with scene state.
  readonly tapeMeasureBasePositionProperty: Vector2Property;
  readonly tapeMeasureTipPositionProperty: Vector2Property;
};

export default class MeasurementToolsLayerNode extends Node {

  // Exposed publicly so callers (HighIntensityScreenView, SingleParticlesScreenView) can drive the
  // simulation loop: step() on each frame and reset() on a sim reset. Also read for accessibility snapshots.
  public readonly timePlotNode: TimePlotNode;
  public readonly positionPlotNode: PositionPlotNode;
  private readonly stopwatchNode: StopwatchNode;
  private readonly measuringTapeNode: MeasuringTapeNode;
  private readonly model: MeasurementToolsModel;

  public constructor(
    model: MeasurementToolsModel,
    visibleBoundsProperty: Property<Bounds2>,
    waveRegionLeft: number,
    waveRegionTop: number,
    tandem: Tandem
  ) {

    const stopwatchNode = new StopwatchNode( model.stopwatch, {
      dragBoundsProperty: visibleBoundsProperty,
      accessibleHelpText: null,
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
      [ model.sceneProperty, ...MEASURING_TAPE_UNIT_VISUAL_SYMBOL_PROPERTIES ],
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
      model.currentWaveDisplayModeProperty,
      waveRegionLeft,
      waveRegionTop,
      visibleBoundsProperty,
      model.isTimePlotVisibleProperty,
      tandem.createTandem( 'timePlotNode' )
    );

    const slitSeparationRangeProperty = new DerivedProperty(
      [ model.sceneProperty ],
      scene => scene.slitSeparationRange
    );

    const positionPlotNode = new PositionPlotNode(
      model.sceneProperty,
      model.currentWaveDisplayModeProperty,
      waveRegionLeft,
      waveRegionTop,
      model.isPositionPlotVisibleProperty,
      {
        barrierTypeProperty: model.currentBarrierTypeProperty,
        slitSeparationProperty: model.currentSlitSeparationProperty,
        slitSeparationRangeProperty: slitSeparationRangeProperty,
        slitConfigurationProperty: model.currentSlitConfigurationProperty
      },
      tandem.createTandem( 'positionPlotNode' )
    );

    super( {
      children: [ stopwatchNode, measuringTapeNode, timePlotNode, positionPlotNode ]
    } );

    this.model = model;
    this.stopwatchNode = stopwatchNode;
    this.measuringTapeNode = measuringTapeNode;
    this.timePlotNode = timePlotNode;
    this.positionPlotNode = positionPlotNode;
  }

  /**
   * Gets measurement-tool view state for agent-facing accessibility snapshots.
   *
   * @returns measurement-tool view state
   */
  public getAccessibleViewState(): MeasurementToolsViewStateFragment {
    const basePosition = this.model.tapeMeasureBasePositionProperty.value;
    const tipPosition = this.model.tapeMeasureTipPositionProperty.value;
    const isTapeMeasureVisible = this.measuringTapeNode.visible;
    const isStopwatchVisible = this.stopwatchNode.visible;

    return {
      measurementTools: {
        tapeMeasure: isTapeMeasureVisible ? {
          visible: true,
          basePosition: {
            x: basePosition.x,
            y: basePosition.y
          },
          tipPosition: {
            x: tipPosition.x,
            y: tipPosition.y
          }
        } : {
          visible: false
        },
        stopwatch: isStopwatchVisible ? {
          visible: true,
          isRunning: this.model.stopwatch.isRunningProperty.value,
          elapsedTimeSeconds: this.model.stopwatch.timeProperty.value
        } : {
          visible: false
        },
        timePlot: this.model.isTimePlotVisibleProperty.value ? {
          visible: true,
          probePosition: {
            x: this.timePlotNode.probePositionProperty.value.x,
            y: this.timePlotNode.probePositionProperty.value.y
          },
          chartPosition: {
            x: this.timePlotNode.getChartPosition().x,
            y: this.timePlotNode.getChartPosition().y
          }
        } : {
          visible: false
        },
        positionPlot: this.model.isPositionPlotVisibleProperty.value ? {
          visible: true,
          lineYFraction: this.positionPlotNode.lineYFractionProperty.value
        } : {
          visible: false
        }
      }
    };
  }
}

// Describes one row of the adaptive-unit lookup table used by createPhysicalStopwatchFormatter.
// The stopwatch time value (in seconds) is compared against threshold to select the appropriate
// unit: the first entry whose threshold exceeds the current time wins.
type StopwatchTimeUnit = {

  // Upper bound (exclusive, in seconds) below which this unit is selected.
  threshold: number;

  // Factor applied to the raw seconds value to obtain a display value in the chosen unit
  // (e.g., 1e15 converts seconds to femtoseconds).
  multiplier: number;

  // The PhetUnit that supplies the localized symbol and accessible string for this time range.
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

/**
 * Creates the number formatter used by the stopwatch display. The formatter selects the most
 * readable physical time unit (femtoseconds through seconds) by scanning STOPWATCH_TIME_UNITS for
 * the first entry whose threshold exceeds the raw seconds value, scales the value with the
 * corresponding multiplier, then chooses 0–2 decimal places based on the magnitude of the scaled
 * value (2 places below 10, 1 below 100, 0 otherwise). Returns a DualString with separate visual
 * (HTML-styled rich text) and accessible (plain-text) representations.
 */
function createPhysicalStopwatchFormatter(): ( time: number ) => DualString {
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
}

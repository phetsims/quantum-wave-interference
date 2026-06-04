// Copyright 2026, University of Colorado Boulder

/**
 * Factory for the four standard measurement tool checkboxes (tape measure, stopwatch, time plot,
 * position plot) shared by the High Intensity and Single Particles screen views.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import BaseSceneModel from '../model/BaseSceneModel.js';
import BaseScreenModel from '../model/BaseScreenModel.js';
import ToolCheckbox from './ToolCheckbox.js';
import ToolIcons from './ToolIcons.js';

export default function createStandardToolCheckboxes<T extends BaseSceneModel>(
  model: BaseScreenModel<T>,
  tandem: Tandem
): {
  tapeMeasureCheckbox: ToolCheckbox;
  stopwatchCheckbox: ToolCheckbox;
  timePlotCheckbox: ToolCheckbox;
  positionPlotCheckbox: ToolCheckbox;
} {
  return {
    tapeMeasureCheckbox: new ToolCheckbox(
      model.isTapeMeasureVisibleProperty,
      QuantumWaveInterferenceFluent.tapeMeasureStringProperty,
      tandem.createTandem( 'tapeMeasureCheckbox' ),
      ToolIcons.createTapeMeasureIcon(),
      QuantumWaveInterferenceFluent.a11y.tapeMeasureCheckbox.accessibleHelpTextStringProperty
    ),
    stopwatchCheckbox: new ToolCheckbox(
      model.isStopwatchVisibleProperty,
      QuantumWaveInterferenceFluent.stopwatchStringProperty,
      tandem.createTandem( 'stopwatchCheckbox' ),
      ToolIcons.createStopwatchIcon(),
      QuantumWaveInterferenceFluent.a11y.stopwatchCheckbox.accessibleHelpTextStringProperty
    ),
    timePlotCheckbox: new ToolCheckbox(
      model.isTimePlotVisibleProperty,
      QuantumWaveInterferenceFluent.timePlotStringProperty,
      tandem.createTandem( 'timePlotCheckbox' ),
      ToolIcons.createTimePlotIcon(),
      QuantumWaveInterferenceFluent.a11y.timePlotCheckbox.accessibleHelpTextStringProperty
    ),
    positionPlotCheckbox: new ToolCheckbox(
      model.isPositionPlotVisibleProperty,
      QuantumWaveInterferenceFluent.positionPlotStringProperty,
      tandem.createTandem( 'positionPlotCheckbox' ),
      ToolIcons.createPositionPlotIcon(),
      QuantumWaveInterferenceFluent.a11y.positionPlotCheckbox.accessibleHelpTextStringProperty
    )
  };
}

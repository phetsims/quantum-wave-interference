// Copyright 2026, University of Colorado Boulder

/**
 * Factory for the standard measurement tool checkboxes shared by the High Intensity and Single Particles screen views.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import BaseSceneModel from '../model/BaseSceneModel.js';
import BaseScreenModel from '../model/BaseScreenModel.js';
import ToolCheckbox from './ToolCheckbox.js';

/**
 * Creates the four measurement-tool visibility checkboxes (tape measure, stopwatch, time plot, position plot)
 * shared by the High Intensity and Single Particles screen views. Each checkbox is bound to the corresponding
 * Boolean Property on the model and is individually instrumented under the provided tandem. Callers destructure
 * the returned object to pass the checkboxes into their control panels.
 *
 * @param model - the screen model whose tool-visibility Properties the checkboxes toggle
 * @param tandem - parent tandem; child tandems are created for each checkbox
 * @returns named ToolCheckbox instances, one per measurement tool
 */
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
      QuantumWaveInterferenceFluent.a11y.tapeMeasureCheckbox.accessibleHelpTextStringProperty
    ),
    stopwatchCheckbox: new ToolCheckbox(
      model.isStopwatchVisibleProperty,
      QuantumWaveInterferenceFluent.stopwatchStringProperty,
      tandem.createTandem( 'stopwatchCheckbox' ),
      QuantumWaveInterferenceFluent.a11y.stopwatchCheckbox.accessibleHelpTextStringProperty
    ),
    timePlotCheckbox: new ToolCheckbox(
      model.isTimePlotVisibleProperty,
      QuantumWaveInterferenceFluent.timePlotStringProperty,
      tandem.createTandem( 'timePlotCheckbox' ),
      QuantumWaveInterferenceFluent.a11y.timePlotCheckbox.accessibleHelpTextStringProperty
    ),
    positionPlotCheckbox: new ToolCheckbox(
      model.isPositionPlotVisibleProperty,
      QuantumWaveInterferenceFluent.positionPlotStringProperty,
      tandem.createTandem( 'positionPlotCheckbox' ),
      QuantumWaveInterferenceFluent.a11y.positionPlotCheckbox.accessibleHelpTextStringProperty
    )
  };
}

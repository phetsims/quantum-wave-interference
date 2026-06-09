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

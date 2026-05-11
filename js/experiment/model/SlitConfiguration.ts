// Copyright 2026, University of Colorado Boulder

/**
 * Re-exports SlitConfiguration from common for backwards compatibility.
 *
 * TODO: We do not want or need backward compatibility, delete and use directly, see https://github.com/phetsims/quantum-wave-interference/issues/100
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export {
  type SlitConfiguration,
  SlitConfigurationValues,
  type SlitConfigurationWithNoBarrier,
  SlitConfigurationWithNoBarrierValues,
  type DetectorSide,
  DetectorSideValues,
  hasDetectorOnSide,
  hasAnyDetector,
  isDoubleSlitConfiguration
} from '../../common/model/SlitConfiguration.js';

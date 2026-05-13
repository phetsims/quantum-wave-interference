// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for measurement tape unit conversion.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import HighIntensitySceneModel from '../../high-intensity/model/HighIntensitySceneModel.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type SourceType } from '../model/SourceType.js';
import getMeasuringTapeUnits from './getMeasuringTapeUnits.js';

QUnit.module( 'MeasuringTapeUnits' );

const EPSILON = 1e-12;

const assertApproximately = (
  assert: Assert,
  actual: number,
  expected: number,
  message: string,
  epsilon = EPSILON
): void => {
  assert.ok( Math.abs( actual - expected ) <= Math.abs( expected ) * epsilon, `${message}: expected ${expected}, got ${actual}` );
};

const createScene = ( sourceType: SourceType ): HighIntensitySceneModel => new HighIntensitySceneModel( {
  sourceType: sourceType,
  tandem: Tandem.OPT_OUT
} );

QUnit.test( 'full wave-region view width maps to physical region width', assert => {
  const photonScene = createScene( 'photons' );
  const photonUnits = getMeasuringTapeUnits( photonScene.regionWidth );

  assert.strictEqual( photonUnits.name, 'μm', 'photon scene uses micrometers' );
  assertApproximately(
    assert,
    QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH * photonUnits.multiplier,
    photonScene.regionWidth * 1e6,
    'photon tape maps full view width to region width in micrometers'
  );

  ( [ 'electrons', 'neutrons', 'heliumAtoms' ] as SourceType[] ).forEach( sourceType => {
    const matterScene = createScene( sourceType );
    const matterUnits = getMeasuringTapeUnits( matterScene.regionWidth );

    assert.strictEqual( matterUnits.name, 'nm', `${sourceType} scene uses nanometers` );
    assertApproximately(
      assert,
      QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH * matterUnits.multiplier,
      matterScene.regionWidth * 1e9,
      `${sourceType} tape maps full view width to region width in nanometers`
    );
  } );
} );

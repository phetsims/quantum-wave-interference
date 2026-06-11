// Copyright 2026, University of Colorado Boulder

/**
 * Shared string formatters for QuantumWaveInterferenceAccessibleState. These keep dynamic state descriptions and context responses
 * aligned when they describe the same semantic state.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { micrometersUnit } from '../../../../../scenery-phet/js/units/micrometersUnit.js';
import { metersPerSecondUnit } from '../../../../../scenery-phet/js/units/metersPerSecondUnit.js';
import { nanometersUnit } from '../../../../../scenery-phet/js/units/nanometersUnit.js';
import { picometersUnit } from '../../../../../scenery-phet/js/units/picometersUnit.js';
import { getWavelengthColorZoneStringProperty } from '../../../common/view/WavelengthColorUtils.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type HighIntensitySemanticAccessibleViewState, type QuantumWaveInterferencePatternFormation, type QuantumWaveInterferencePatternKind } from './HighIntensityAccessibleViewState.js';

export type FluentBoolean = 'true' | 'false';

export function toFluentBoolean( value: boolean ): FluentBoolean {
  return value ? 'true' : 'false';
}

function getPatternKindKey( patternKind: QuantumWaveInterferencePatternKind ): QuantumWaveInterferencePatternKind {
  return patternKind;
}

type SingleSlitLocationKey = 'leftCovered' | 'rightCovered';

function getSingleSlitLocationKey( state: HighIntensitySemanticAccessibleViewState ): SingleSlitLocationKey {
  return state.slitConfiguration === 'leftCovered' ? 'leftCovered' :
         'rightCovered';
}

export function formatSourceBeamDescription( state: HighIntensitySemanticAccessibleViewState ): string {
  return QuantumWaveInterferenceFluent.a11y.highIntensityState.sourceBeam.format( {
    isEmitting: toFluentBoolean( state.isEmitting ),
    sourceType: state.sourceType,
    photonColor: state.wavelengthColorZone || 'red',
    wavefrontSpacing: state.wavefrontSpacing,
    waveDisplayMode: state.waveDisplayMode,
    slitSetting: state.slitConfiguration
  } );
}

export function formatParticleDescription( state: HighIntensitySemanticAccessibleViewState ): string {
  if ( state.sourceType === 'photons' ) {
    return QuantumWaveInterferenceFluent.a11y.highIntensityState.photonDetail.format( {
      wavelength: nanometersUnit.getAccessibleString( state.wavelengthNM, {
        decimalPlaces: 0,
        showTrailingZeros: false,
        showIntegersAsIntegers: true
      } ),
      color: getWavelengthColorZoneStringProperty( state.wavelengthColorZone! ).value
    } );
  }

  return QuantumWaveInterferenceFluent.a11y.highIntensityState.particleDetail.format( {
    sourceType: state.sourceType,
    speed: metersPerSecondUnit.getAccessibleString( state.particleSpeedMetersPerSecond, {
      decimalPlaces: 0,
      showTrailingZeros: false,
      showIntegersAsIntegers: true
    } ),
    wavelength: picometersUnit.getAccessibleString( state.effectiveWavelengthPicometers, {
      decimalPlaces: 2,
      showTrailingZeros: false,
      showIntegersAsIntegers: true
    } )
  } );
}

export function formatSlitDescription( state: HighIntensitySemanticAccessibleViewState ): string {
  return QuantumWaveInterferenceFluent.a11y.highIntensityState.slits.format( {
    slitSetting: state.slitConfiguration,
    separation: state.slitSeparationMM === null ? '' :
                state.sourceType === 'photons' ?
                micrometersUnit.getAccessibleString( state.slitSeparationMM * 1000, { decimalPlaces: 2 } ) :
                nanometersUnit.getAccessibleString( state.slitSeparationMM * 1e6, { decimalPlaces: 2 } )
  } );
}

export const formatDetectorDescription = (
  state: HighIntensitySemanticAccessibleViewState,
  patternFormation: QuantumWaveInterferencePatternFormation = state.patternFormation
): string =>
  QuantumWaveInterferenceFluent.a11y.highIntensityState.detectorPattern.format( {
    isEmitting: toFluentBoolean( state.isEmitting ),
    detectionMode: state.detectionMode,
    patternFormation: patternFormation,
    patternKind: getPatternKindKey( state.patternKind ),
    waveDisplayMode: state.waveDisplayMode,
    slitSetting: getSingleSlitLocationKey( state ),
    hitStage: state.hitStage,
    hitCount: state.totalHits,
    bandSpacing: state.bandSpacingDescription
  } );

// Copyright 2026, University of Colorado Boulder

/**
 * Shared string formatters for QuantumWaveInterferenceAccessibleState. These keep dynamic state descriptions and context responses
 * aligned when they describe the same semantic state.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { micrometersUnit } from '../../../../../scenery-phet/js/units/micrometersUnit.js';
import { nanometersUnit } from '../../../../../scenery-phet/js/units/nanometersUnit.js';
import { getWavelengthColorZoneStringProperty } from '../../../common/view/WavelengthColorUtils.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type HighIntensitySemanticAccessibleViewState, type QuantumWaveInterferencePatternFormation, type QuantumWaveInterferencePatternKind } from './HighIntensityAccessibleViewState.js';

export type FluentBoolean = 'true' | 'false';

export const toFluentBoolean = ( value: boolean ): FluentBoolean => value ? 'true' : 'false';

const getPatternKindKey = ( patternKind: QuantumWaveInterferencePatternKind ): QuantumWaveInterferencePatternKind => patternKind;

type SingleSlitLocationKey = 'leftCovered' | 'rightCovered';

const getSingleSlitLocationKey = ( state: HighIntensitySemanticAccessibleViewState ): SingleSlitLocationKey =>
  state.slitConfiguration === 'leftCovered' ? 'leftCovered' :
  'rightCovered';

export const formatSourceBeamDescription = ( state: HighIntensitySemanticAccessibleViewState ): string =>
  QuantumWaveInterferenceFluent.a11y.highIntensityState.sourceBeam.format( {
    isEmitting: toFluentBoolean( state.isEmitting ),
    sourceType: state.sourceType,
    photonColor: state.wavelengthColorZone || 'red',
    wavefrontSpacing: state.wavefrontSpacing,
    waveDisplayMode: state.waveDisplayMode,
    slitSetting: state.slitConfiguration
  } );

export const formatParticleDescription = ( state: HighIntensitySemanticAccessibleViewState ): string => {
  if ( state.sourceType === 'photons' ) {
    return QuantumWaveInterferenceFluent.a11y.highIntensityState.photonDetail.format( {
      wavelength: state.wavelengthNM,
      color: getWavelengthColorZoneStringProperty( state.wavelengthColorZone! ).value
    } );
  }

  return QuantumWaveInterferenceFluent.a11y.highIntensityState.particleDetail.format( {
    sourceType: state.sourceType,
    speed: state.particleSpeedMetersPerSecond,
    wavelength: state.effectiveWavelengthPicometers
  } );
};

export const formatSlitDescription = ( state: HighIntensitySemanticAccessibleViewState ): string =>
  QuantumWaveInterferenceFluent.a11y.highIntensityState.slits.format( {
    slitSetting: state.slitConfiguration,
    separation: state.slitSeparationMM === null ? '' :
                state.sourceType === 'photons' ?
                micrometersUnit.getAccessibleString( state.slitSeparationMM * 1000, { decimalPlaces: 2 } ) :
                nanometersUnit.getAccessibleString( state.slitSeparationMM * 1e6, { decimalPlaces: 2 } )
  } );

export const formatDetectorDescription = (
  state: HighIntensitySemanticAccessibleViewState,
  patternFormation: QuantumWaveInterferencePatternFormation = state.patternFormation
): string =>
  QuantumWaveInterferenceFluent.a11y.highIntensityState.detectorPattern.format( {
    isEmitting: toFluentBoolean( state.isEmitting ),
    detectionMode: state.detectionMode,
    patternFormation: patternFormation,
    patternKind: getPatternKindKey( state.patternKind ),
    slitSetting: getSingleSlitLocationKey( state ),
    hitStage: state.hitStage,
    hitCount: state.totalHits,
    bandSpacing: state.bandSpacingDescription
  } );

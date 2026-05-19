// Copyright 2026, University of Colorado Boulder

/**
 * Shared string formatters for QWIAccessibleState. These keep dynamic state descriptions and context responses
 * aligned when they describe the same semantic state.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type SlitConfigurationWithNoBarrier } from '../../../common/model/SlitConfiguration.js';
import { getWavelengthColorZoneString } from '../../../common/view/WavelengthColorUtils.js';
import { type QWIAccessibleState, type QWIPatternKind } from './QWIAccessibleStateDescriber.js';
import { micrometersUnit } from '../../../../../scenery-phet/js/units/micrometersUnit.js';
import { nanometersUnit } from '../../../../../scenery-phet/js/units/nanometersUnit.js';

export type FluentBoolean = 'true' | 'false';
export type DetectorSlitSetting = 'leftDetector' | 'rightDetector' | 'bothDetectors';

export const toFluentBoolean = ( value: boolean ): FluentBoolean => value ? 'true' : 'false';

export const toDetectorSlitSetting = ( slitSetting: SlitConfigurationWithNoBarrier ): DetectorSlitSetting =>
  slitSetting === 'leftDetector' ? 'leftDetector' :
  slitSetting === 'rightDetector' ? 'rightDetector' :
  slitSetting === 'bothDetectors' ? 'bothDetectors' :
  ( () => { throw new Error( `Unrecognized slitSetting: ${slitSetting}` ); } )();

const getPatternKindKey = ( patternKind: QWIPatternKind ): QWIPatternKind => patternKind;

export const formatSourceBeamDescription = ( state: QWIAccessibleState ): string =>
  QuantumWaveInterferenceFluent.a11y.highIntensityState.sourceBeam.format( {
    isEmitting: toFluentBoolean( state.isEmitting ),
    sourceType: state.sourceType,
    photonColor: state.wavelengthColorZone || 'red',
    wavefrontSpacing: state.wavefrontSpacing
  } );

export const formatParticleDescription = ( state: QWIAccessibleState ): string => {
  if ( state.sourceType === 'photons' ) {
    return QuantumWaveInterferenceFluent.a11y.highIntensityState.photonDetail.format( {
      wavelength: state.wavelengthNM,
      color: getWavelengthColorZoneString( state.wavelengthColorZone! )
    } );
  }

  return QuantumWaveInterferenceFluent.a11y.highIntensityState.particleDetail.format( {
    sourceType: state.sourceType,
    speed: state.particleSpeedMetersPerSecond,
    wavelength: state.effectiveWavelengthPicometers
  } );
};

export const formatSlitDescription = ( state: QWIAccessibleState ): string =>
  QuantumWaveInterferenceFluent.a11y.highIntensityState.slits.format( {
    slitSetting: state.slitConfiguration,
    separation: state.slitSeparationMM === null ? '' :
                state.sourceType === 'photons' ?
                micrometersUnit.getAccessibleString( state.slitSeparationMM * 1000, { decimalPlaces: 2 } ) :
                nanometersUnit.getAccessibleString( state.slitSeparationMM * 1e6, { decimalPlaces: 2 } )
  } );

export const formatDetectorDescription = ( state: QWIAccessibleState ): string =>
  QuantumWaveInterferenceFluent.a11y.highIntensityState.detectorPattern.format( {
    isEmitting: toFluentBoolean( state.isEmitting ),
    detectionMode: state.detectionMode,
    patternFormation: state.patternFormation,
    patternKind: getPatternKindKey( state.patternKind ),
    hitStage: state.hitStage,
    hitCount: state.totalHits,
    bandCount: state.bandAnalysis.bandCount
  } );

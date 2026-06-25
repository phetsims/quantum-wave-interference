// Copyright 2026, University of Colorado Boulder

/**
 * Shared string formatters for QuantumWaveInterferenceAccessibleState. These keep dynamic state descriptions and context responses
 * aligned when they describe the same semantic state.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { metersPerSecondUnit } from '../../../../../scenery-phet/js/units/metersPerSecondUnit.js';
import { micrometersUnit } from '../../../../../scenery-phet/js/units/micrometersUnit.js';
import { nanometersUnit } from '../../../../../scenery-phet/js/units/nanometersUnit.js';
import { picometersUnit } from '../../../../../scenery-phet/js/units/picometersUnit.js';
import { formatDetectorPatternDescription, formatLiveHitsDescription } from '../../../common/view/description/DetectorScreenDescriptionFormatter.js';
import { getWavelengthColorZoneStringProperty } from '../../../common/view/WavelengthColorUtils.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type HighIntensitySemanticAccessibleViewState, type QuantumWaveInterferencePatternFormation, type QuantumWaveInterferencePatternKind } from './HighIntensityAccessibleViewState.js';

/**
 * String-literal union used as a Fluent-compatible boolean selector. Fluent message variants are keyed on
 * the literal strings 'true' and 'false' rather than JS booleans, so model boolean values must be mapped
 * through toFluentBoolean before being passed to a Fluent format call.
 */
export type FluentBoolean = 'true' | 'false';

/**
 * Converts a JS boolean to the Fluent-compatible string literal required by Fluent message selectors.
 * Use this whenever a boolean model value must be passed as a Fluent message argument.
 */
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

/**
 * Formats a localized string describing the current beam/source state (emission status, source type, wavelength color,
 * wavefront spacing, display mode, and slit configuration). Used in both transition context responses and
 * experiment-setup sequence items on the High Intensity and Single Particles screens.
 */
export function formatSourceBeamDescription( state: HighIntensitySemanticAccessibleViewState ): string {
  return QuantumWaveInterferenceFluent.a11y.waveExperimentState.sourceBeam.format( {
    isEmitting: toFluentBoolean( state.isEmitting ),
    sourceType: state.sourceType,
    photonColor: state.wavelengthColorZone || 'red',
    wavefrontSpacing: state.wavefrontSpacing,
    waveDisplayMode: state.waveDisplayMode,
    slitSetting: state.slitConfiguration
  } );
}

/**
 * Formats a localized string describing the current particle type and its key physical properties.
 * For photons, reports wavelength (nm) and visible color; for other particles (electrons, neutrons, helium atoms),
 * reports speed (m/s) and de Broglie wavelength (pm). Intended for screen-detail descriptions that convey
 * the current source properties to screen-reader users.
 */
export function formatParticleDescription( state: HighIntensitySemanticAccessibleViewState ): string {
  if ( state.sourceType === 'photons' ) {
    return QuantumWaveInterferenceFluent.a11y.waveExperimentState.photonDetail.format( {
      wavelength: nanometersUnit.getAccessibleString( state.wavelengthNM, {
        decimalPlaces: 0,
        showTrailingZeros: false,
        showIntegersAsIntegers: true
      } ),
      color: getWavelengthColorZoneStringProperty( state.wavelengthColorZone! ).value
    } );
  }

  return QuantumWaveInterferenceFluent.a11y.waveExperimentState.particleDetail.format( {
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

/**
 * Formats a localized string describing the current slit configuration (open/closed/covered arrangement)
 * and slit separation. For photons, separation is reported in micrometers; for other particles, in nanometers.
 * Returns an empty string for the separation component when no slit separation is applicable.
 */
export function formatSlitDescription( state: HighIntensitySemanticAccessibleViewState ): string {
  return QuantumWaveInterferenceFluent.a11y.waveExperimentState.slits.format( {
    slitSetting: state.slitConfiguration,
    separation: state.slitSeparationMM === null ? '' :
                state.sourceType === 'photons' ?
                micrometersUnit.getAccessibleString( state.slitSeparationMM * 1000, { decimalPlaces: 2 } ) :
                nanometersUnit.getAccessibleString( state.slitSeparationMM * 1e6, { decimalPlaces: 2 } )
  } );
}

/**
 * Formats a localized string describing the current detector/pattern state, including emission status,
 * detection mode, pattern formation stage, pattern kind, display mode, slit location, hit stage, and band spacing.
 * Used as a context response in transition descriptions and as a sequence-item string in experiment-setup sequences.
 *
 * @param state - the current semantic accessible view state
 * @param patternFormation - override for the pattern-formation value; defaults to state.patternFormation.
 *   Pass an explicit value when the caller needs to describe a specific formation stage (e.g., a sequence
 *   item that fires at a known milestone) rather than the live state value.
 */
export const formatDetectorDescription = (
  state: HighIntensitySemanticAccessibleViewState,
  patternFormation: QuantumWaveInterferencePatternFormation = state.patternFormation
): string =>
  state.detectionMode === 'hits' ?
  formatLiveHitsDescription(
    state.hitStage,
    state.slitConfiguration,
    {
      spacingCategory: state.bandSpacingDescription,
      envelopeCategory: state.envelopeCategory
    },
    undefined,
    true
  ) :
  formatDetectorPatternDescription(
    state.isEmitting,
    state.detectionMode,
    patternFormation,
    getPatternKindKey( state.patternKind ),
    state.waveDisplayMode,
    getSingleSlitLocationKey( state ),
    state.hitStage,
    state.bandSpacingDescription,
    state.envelopeCategory,
    undefined,
    true
  );

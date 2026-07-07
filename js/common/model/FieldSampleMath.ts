// Copyright 2026, University of Colorado Boulder

/**
 * Helpers for reducing field samples to scalar intensity or the combined single-complex
 * display value.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Complex from '../../../../dot/js/Complex.js';
import { type FieldComponent, type FieldSample } from './WaveKernelTypes.js';

/**
 * The coherent complex-amplitude sum for all field components with the same coherence-group name.
 * Separate group sums are decoherent and therefore combine by intensity rather than amplitude.
 */
type CoherentGroupSum = {
  name: string;
  real: number;
  imaginary: number;
};

/**
 * Computes the physical intensity represented by a field sample. Complex amplitudes are summed
 * within each coherence group before taking magnitude squared, then those group intensities are
 * summed. Empty field samples and non-field samples have zero intensity.
 *
 * @param sample - The sample to reduce to intensity.
 * @returns The non-negative total intensity, or zero when the sample has no field value.
 */
export function computeSampleIntensity( sample: FieldSample ): number {
  if ( sample.kind !== 'field' ) {
    return 0;
  }

  const components = sample.components;

  // Most kernel samples have at most two components: incident, one open slit, or the two slit paths.
  // Handle those cases directly and keep the generic grouping fallback for hand-authored tests or
  // future models that introduce more coherence groups.
  if ( components.length === 0 ) {
    return 0;
  }
  if ( components.length === 1 ) {
    return components[ 0 ].value.magnitudeSquared;
  }
  if ( components.length === 2 ) {
    const value0 = components[ 0 ].value;
    const value1 = components[ 1 ].value;
    if ( components[ 0 ].coherenceGroup === components[ 1 ].coherenceGroup ) {
      const real = value0.real + value1.real;
      const imaginary = value0.imaginary + value1.imaginary;
      return real * real + imaginary * imaginary;
    }
    else {
      return value0.magnitudeSquared + value1.magnitudeSquared;
    }
  }
  const groupSums = getCoherentGroupSums( components );

  let intensity = 0;
  for ( let i = 0; i < groupSums.length; i++ ) {
    const groupSum = groupSums[ i ];
    intensity += groupSum.real * groupSum.real + groupSum.imaginary * groupSum.imaginary;
  }
  return intensity;
}

/**
 * Combined display adapter: produce one complex value from a physically richer FieldSample.
 *
 * If there is one coherence group, this is the coherent sum. If there are multiple groups, the
 * returned phase is taken from the strongest group and the magnitude is scaled to the total
 * decoherent intensity. That keeps signed-component displays finite while preserving intensity.
 */
export function getRepresentativeComplex( sample: FieldSample ): Complex {
  if ( sample.kind !== 'field' ) {
    return new Complex( 0, 0 );
  }

  const components = sample.components;

  // Mirror computeSampleIntensity's common 0/1/2-component fast path, but preserve this adapter's
  // combined rule: if groups are decoherent, display the strongest phase scaled to total intensity.
  if ( components.length === 0 ) {
    return new Complex( 0, 0 );
  }
  if ( components.length === 1 ) {
    return new Complex( components[ 0 ].value.real, components[ 0 ].value.imaginary );
  }
  if ( components.length === 2 ) {
    const value0 = components[ 0 ].value;
    const value1 = components[ 1 ].value;
    if ( components[ 0 ].coherenceGroup === components[ 1 ].coherenceGroup ) {
      return new Complex( value0.real + value1.real, value0.imaginary + value1.imaginary );
    }
    else {
      const intensity0 = value0.magnitudeSquared;
      const intensity1 = value1.magnitudeSquared;
      return createRepresentativeComplexFromStrongestGroup(
        intensity0 + intensity1,
        intensity0 >= intensity1 ? value0.real : value1.real,
        intensity0 >= intensity1 ? value0.imaginary : value1.imaginary,
        Math.max( intensity0, intensity1 )
      );
    }
  }

  const groupSums = getCoherentGroupSums( components );

  let totalIntensity = 0;
  let strongestReal = 0;
  let strongestImaginary = 0;
  let strongestIntensity = 0;

  for ( let i = 0; i < groupSums.length; i++ ) {
    const real = groupSums[ i ].real;
    const imaginary = groupSums[ i ].imaginary;
    const intensity = real * real + imaginary * imaginary;
    totalIntensity += intensity;
    if ( intensity > strongestIntensity ) {
      strongestReal = real;
      strongestImaginary = imaginary;
      strongestIntensity = intensity;
    }
  }

  return createRepresentativeComplexFromStrongestGroup( totalIntensity, strongestReal, strongestImaginary, strongestIntensity );
}

function getCoherenceGroupIndex( groupSums: CoherentGroupSum[], coherenceGroup: string ): number {
  for ( let i = 0; i < groupSums.length; i++ ) {
    if ( groupSums[ i ].name === coherenceGroup ) {
      return i;
    }
  }
  return -1;
}

/**
 * Groups field components by coherence-group name and coherently sums each group's complex
 * amplitudes. Group order follows the first occurrence of each name, and an empty component array
 * produces an empty result.
 *
 * @param components - Field components whose amplitudes will be grouped and summed.
 * @returns One complex-amplitude sum per distinct coherence group.
 */
function getCoherentGroupSums( components: FieldComponent[] ): CoherentGroupSum[] {
  const groupSums: CoherentGroupSum[] = [];

  for ( let i = 0; i < components.length; i++ ) {
    const component = components[ i ];
    const groupIndex = getCoherenceGroupIndex( groupSums, component.coherenceGroup );
    if ( groupIndex < 0 ) {
      groupSums.push( {
        name: component.coherenceGroup,
        real: component.value.real,
        imaginary: component.value.imaginary
      } );
    }
    else {
      groupSums[ groupIndex ].real += component.value.real;
      groupSums[ groupIndex ].imaginary += component.value.imaginary;
    }
  }

  return groupSums;
}

/**
 * Creates a single combined display value whose phase matches the strongest coherent group and whose
 * magnitude squared equals the total intensity across all groups. Returns zero when either the
 * total intensity or strongest-group intensity is non-positive, avoiding an undefined phase and
 * division by zero.
 *
 * @param totalIntensity - Intensity summed across all decoherent groups.
 * @param strongestReal - Real component of the strongest coherent-group sum.
 * @param strongestImaginary - Imaginary component of the strongest coherent-group sum.
 * @param strongestIntensity - Magnitude squared of the strongest coherent-group sum.
 * @returns A representative complex value preserving total intensity and the strongest-group phase.
 */
function createRepresentativeComplexFromStrongestGroup(
  totalIntensity: number,
  strongestReal: number,
  strongestImaginary: number,
  strongestIntensity: number
): Complex {
  if ( totalIntensity <= 0 || strongestIntensity <= 0 ) {
    return new Complex( 0, 0 );
  }

  const scale = Math.sqrt( totalIntensity / strongestIntensity );
  return new Complex( strongestReal * scale, strongestImaginary * scale );
}

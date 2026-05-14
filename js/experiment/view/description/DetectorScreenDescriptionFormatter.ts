// Copyright 2026, University of Colorado Boulder

/**
 * Shared detector-screen accessible-description formatting for the live detector screen and snapshots.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type BandAnalysisResult, type HitStage } from './BandAnalysis.js';

export const formatIntensityDescription = (
  isDoubleSlit: boolean,
  analysis: BandAnalysisResult,
  spatialDescription: string
): string => {
  return isDoubleSlit ?
         QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensity.format( {
           bandCount: analysis.bandCount,
           spatialDescription: spatialDescription
         } ) :
         QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensitySingleSlit.format( {
           spatialDescription: spatialDescription
         } );
};

export const formatLiveHitsDescription = (
  hitStage: HitStage,
  isDoubleSlit: boolean,
  spatialDescription: string
): string => {
  return isDoubleSlit ?
         hitStage === 'none' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty.value :
         hitStage === 'few' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty.value :
         hitStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty.value :
         hitStage === 'developing' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsDeveloping.format( { spatialDescription: spatialDescription } ) :
         hitStage === 'clear' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsClear.format( { spatialDescription: spatialDescription } ) :
         ( () => { throw new Error( `Unrecognized hitStage: ${hitStage}` ); } )() :
         hitStage === 'none' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty.value :
         hitStage === 'few' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty.value :
         hitStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsSingleSlitEmergingStringProperty.value :
         ( hitStage === 'developing' || hitStage === 'clear' ) ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsSingleSlitClear.format( { spatialDescription: spatialDescription } ) :
         ( () => { throw new Error( `Unrecognized hitStage: ${hitStage}` ); } )();
};

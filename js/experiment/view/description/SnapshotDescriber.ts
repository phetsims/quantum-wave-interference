// Copyright 2026, University of Colorado Boulder

/**
 * Produces an accessible paragraph for a detector-screen snapshot using the same qualitative
 * description structure as the live detector screen.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import Snapshot from '../../model/Snapshot.js';
import BandAnalysis from './BandAnalysis.js';

export default class SnapshotDescriber {

  public static getDescription( snapshot: Snapshot ): string {
    const isDoubleSlit = snapshot.slitSetting === 'bothOpen';

    if ( snapshot.detectionMode === 'averageIntensity' ) {
      if ( !snapshot.isEmitting ) {
        return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty.value;
      }

      const analysis = BandAnalysis.analyzeTheoreticalPatternFromSnapshot( snapshot );
      const spatialDescription = BandAnalysis.formatSpatialDescription(
        analysis,
        isDoubleSlit,
        false,
        false
      );

      return isDoubleSlit ?
             QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensity.format( {
               spatialDescription: spatialDescription
             } ) :
             QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensitySingleSlit.format( {
               spatialDescription: spatialDescription
             } );
    }

    const totalHits = snapshot.hits.length;
    const hitStage = BandAnalysis.getHitStage( totalHits, isDoubleSlit );
    const hitCountSentence =
      totalHits === 1 ?
      'The detector screen shows a total of 1 hit.' :
      `The detector screen shows a total of ${totalHits} hits.`;
    const analysis = BandAnalysis.analyzeTheoreticalPatternFromSnapshot( snapshot );
    const spatialDescription = BandAnalysis.formatSpatialDescription(
      analysis,
      isDoubleSlit,
      false,
      false
    );

    if ( isDoubleSlit ) {
      if ( hitStage === 'none' ) {
        return SnapshotDescriber.insertSecondSentence(
          QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty.value,
          hitCountSentence
        );
      }
      if ( hitStage === 'few' ) {
        return SnapshotDescriber.insertSecondSentence(
          QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty.value,
          hitCountSentence
        );
      }
      if ( hitStage === 'emerging' ) {
        return SnapshotDescriber.insertSecondSentence(
          QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty.value,
          hitCountSentence
        );
      }
      if ( hitStage === 'developing' ) {
        return SnapshotDescriber.insertSecondSentence(
          QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsDeveloping.format( {
            spatialDescription: spatialDescription
          } ),
          hitCountSentence
        );
      }
      return SnapshotDescriber.insertSecondSentence(
        QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsClear.format( {
          spatialDescription: spatialDescription
        } ),
        hitCountSentence
      );
    }

    if ( hitStage === 'none' ) {
      return SnapshotDescriber.insertSecondSentence(
        QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty.value,
        hitCountSentence
      );
    }
    if ( hitStage === 'few' ) {
      return SnapshotDescriber.insertSecondSentence(
        QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty.value,
        hitCountSentence
      );
    }
    if ( hitStage === 'emerging' ) {
      return SnapshotDescriber.insertSecondSentence(
        QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsSingleSlitEmergingStringProperty.value,
        hitCountSentence
      );
    }
    return SnapshotDescriber.insertSecondSentence(
      QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsSingleSlitClear.format( {
        spatialDescription: spatialDescription
      } ),
      hitCountSentence
    );
  }

  private static insertSecondSentence( paragraph: string, secondSentence: string ): string {
    const firstSentenceMatch = paragraph.match( /^.*?[.!?](?:\s|$)/ );
    if ( !firstSentenceMatch ) {
      return `${paragraph} ${secondSentence}`;
    }

    const firstSentence = firstSentenceMatch[ 0 ].trim();
    const remainingText = paragraph.slice( firstSentenceMatch[ 0 ].length ).trim();
    return remainingText ?
           `${firstSentence} ${secondSentence} ${remainingText}` :
           `${firstSentence} ${secondSentence}`;
  }
}

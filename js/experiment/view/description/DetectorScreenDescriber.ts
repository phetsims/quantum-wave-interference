// Copyright 2026, University of Colorado Boulder

/**
 * DetectorScreenDescriber produces a dynamic accessible description of the detector screen
 * that scales with the number of accumulated hits. For small numbers of hits, it describes
 * scattered detections. As hits accumulate, it shifts toward describing the emerging
 * interference pattern (double slit) or broad diffraction pattern (single slit / detector).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../../model/ExperimentModel.js';
import SceneModel from '../../model/SceneModel.js';

export default class DetectorScreenDescriber {

  public readonly descriptionProperty: TReadOnlyProperty<string>;

  public constructor( model: ExperimentModel ) {

    const descriptionProperty = new Property<string>( '' );
    this.descriptionProperty = descriptionProperty;

    const update = () => {
      const scene = model.sceneProperty.value;
      const detectionMode = scene.detectionModeProperty.value;
      const paragraphs = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph;

      if ( detectionMode === 'averageIntensity' ) {
        descriptionProperty.value = paragraphs.averageIntensity.format( {
          isEmitting: scene.isEmittingProperty.value ? 'true' : 'false'
        } );
        return;
      }

      const totalHits = scene.totalHitsProperty.value;

      if ( totalHits === 0 ) {
        descriptionProperty.value = paragraphs.hitsNoneStringProperty.value;
        return;
      }

      const slitSetting = scene.slitSettingProperty.value;
      const isDoubleSlit = slitSetting === 'bothOpen';

      // Count the number of bright bands (peaks) by analyzing the intensity bins.
      const bandCount = DetectorScreenDescriber.countBrightBands( scene.intensityBins, scene.intensityBinsMax );

      const bandDescription = bandCount > 0
        ? QuantumWaveInterferenceFluent.a11y.detectorScreen.bandDescriptionPattern.format( { numBands: bandCount } )
        : '';

      if ( isDoubleSlit ) {
        if ( totalHits <= 10 ) {
          descriptionProperty.value = paragraphs.hitsFew.format( { totalHits: totalHits } );
        }
        else if ( totalHits <= 50 ) {
          descriptionProperty.value = paragraphs.hitsEmerging.format( { totalHits: totalHits } );
        }
        else if ( totalHits <= 200 ) {
          descriptionProperty.value = paragraphs.hitsDeveloping.format( {
            totalHits: totalHits,
            bandDescription: bandDescription
          } );
        }
        else {
          descriptionProperty.value = paragraphs.hitsClear.format( {
            totalHits: totalHits,
            bandDescription: bandDescription
          } );
        }
      }
      else {

        // Single slit or which-path detector: broad central band, no interference fringes.
        if ( totalHits <= 10 ) {
          descriptionProperty.value = paragraphs.hitsFew.format( { totalHits: totalHits } );
        }
        else if ( totalHits <= 50 ) {
          descriptionProperty.value = paragraphs.hitsSingleSlitEmerging.format( { totalHits: totalHits } );
        }
        else {
          descriptionProperty.value = paragraphs.hitsSingleSlitClear.format( {
            totalHits: totalHits,
            bandDescription: bandDescription
          } );
        }
      }
    };

    // Listen to scene changes and rewire listeners for the active scene.
    let previousScene: SceneModel | null = null;
    model.sceneProperty.link( scene => {
      if ( previousScene ) {
        previousScene.hitsChangedEmitter.removeListener( update );
        previousScene.detectionModeProperty.unlink( update );
        previousScene.isEmittingProperty.unlink( update );
        previousScene.slitSettingProperty.unlink( update );
      }
      scene.hitsChangedEmitter.addListener( update );
      scene.detectionModeProperty.lazyLink( update );
      scene.isEmittingProperty.lazyLink( update );
      scene.slitSettingProperty.lazyLink( update );
      previousScene = scene;
      update();
    } );
  }

  /**
   * Counts the number of bright bands (peaks) in the intensity bins. To avoid counting noise
   * as bands, bins are smoothed with a moving average before peak detection. A band is a
   * contiguous region where the smoothed value exceeds a fraction of the smoothed maximum.
   */
  public static countBrightBands( intensityBins: number[], intensityBinsMax: number ): number {
    if ( intensityBinsMax === 0 ) {
      return 0;
    }

    // Smooth with a moving average to filter out single-bin noise.
    const windowSize = 7;
    const halfWindow = Math.floor( windowSize / 2 );
    const smoothed = new Array( intensityBins.length ).fill( 0 );
    let smoothedMax = 0;

    for ( let i = 0; i < intensityBins.length; i++ ) {
      let sum = 0;
      let count = 0;
      for ( let j = Math.max( 0, i - halfWindow ); j <= Math.min( intensityBins.length - 1, i + halfWindow ); j++ ) {
        sum += intensityBins[ j ];
        count++;
      }
      smoothed[ i ] = sum / count;
      if ( smoothed[ i ] > smoothedMax ) {
        smoothedMax = smoothed[ i ];
      }
    }

    if ( smoothedMax === 0 ) {
      return 0;
    }

    // A bin is considered "bright" if it exceeds 20% of the smoothed peak value.
    const threshold = smoothedMax * 0.2;
    let bandCount = 0;
    let inBand = false;

    for ( let i = 0; i < smoothed.length; i++ ) {
      if ( smoothed[ i ] >= threshold ) {
        if ( !inBand ) {
          bandCount++;
          inBand = true;
        }
      }
      else {
        inBand = false;
      }
    }

    return bandCount;
  }
}

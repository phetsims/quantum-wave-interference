// Copyright 2026, University of Colorado Boulder

/**
 * HighIntensitySceneModel holds the state for one of the four source-type scenes (Photons, Electrons,
 * Neutrons, Helium atoms) on the High Intensity screen.
 *
 * Extends BaseSceneModel with High Intensity–specific state: detection mode, intensity control,
 * detector hit tracking per slit, continuous hit accumulation, and full slit configuration
 * (including detector variants).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import BaseSceneModel, { type BaseSceneModelOptions, HIT_VERTICAL_EXTENT, MAX_HITS } from '../../common/model/BaseSceneModel.js';
import { createContinuousWaveSolver } from '../../common/model/createWaveSolver.js';
import { type DetectionMode, DetectionModeValues } from '../../common/model/DetectionMode.js';
import { hasAnyDetector, hasDetectorOnSide } from '../../common/model/SlitConfiguration.js';
import { type SlitConfiguration, SlitConfigurationValues } from '../../common/model/SlitConfiguration.js';

const MAX_EMISSION_RATE = 100;
const SINGLE_OPEN_SLIT_INTENSITY_SCALE = 0.5;

export type HighIntensitySceneModelOptions = BaseSceneModelOptions;

export default class HighIntensitySceneModel extends BaseSceneModel {

  public readonly intensityProperty: NumberProperty;
  public readonly slitConfigurationProperty: StringUnionProperty<SlitConfiguration>;
  public readonly detectionModeProperty: StringUnionProperty<DetectionMode>;
  public readonly leftDetectorHitsProperty: NumberProperty;
  public readonly rightDetectorHitsProperty: NumberProperty;

  // True when Hits mode has reached the hit cap
  public readonly isMaxHitsReachedProperty: TReadOnlyProperty<boolean>;

  // False when the emitter button should be disabled
  public readonly isEmitterEnabledProperty: TReadOnlyProperty<boolean>;

  // Whether the wave field should be rendered in the visualization region
  public readonly isWaveVisibleProperty: TReadOnlyProperty<boolean>;

  private hitAccumulator: number;

  public constructor( providedOptions: HighIntensitySceneModelOptions ) {

    super( createContinuousWaveSolver(), providedOptions );

    const tandem = providedOptions.tandem;

    this.hitAccumulator = 0;

    this.intensityProperty = new NumberProperty( 0.5, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'intensityProperty' )
    } );

    this.slitConfigurationProperty = new StringUnionProperty<SlitConfiguration>( 'bothOpen', {
      validValues: SlitConfigurationValues,
      tandem: tandem.createTandem( 'slitConfigurationProperty' )
    } );

    this.detectionModeProperty = new StringUnionProperty<DetectionMode>( 'averageIntensity', {
      validValues: DetectionModeValues,
      tandem: tandem.createTandem( 'detectionModeProperty' )
    } );

    this.isWaveVisibleProperty = this.isEmittingProperty;

    this.leftDetectorHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'leftDetectorHitsProperty' ),
      phetioReadOnly: true
    } );

    this.rightDetectorHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'rightDetectorHitsProperty' ),
      phetioReadOnly: true
    } );

    this.isMaxHitsReachedProperty = new DerivedProperty(
      [ this.detectionModeProperty, this.totalHitsProperty ],
      ( detectionMode, totalHits ) => detectionMode === 'hits' && totalHits >= MAX_HITS
    );

    this.isEmitterEnabledProperty = this.isMaxHitsReachedProperty.derived( isMax => !isMax );

    // Initial sync and listeners
    this.syncSolverParameters();
    this.setupClearScreenListeners();
    this.intensityProperty.lazyLink( () => this.clearScreen() );
    this.slitConfigurationProperty.lazyLink( () => this.clearScreen() );

    // Stop the source when the hit cap is reached
    this.isMaxHitsReachedProperty.lazyLink( isMaxHitsReached => {
      if ( isMaxHitsReached ) {
        this.isEmittingProperty.value = false;
      }
    } );
  }

  protected override isTopSlitOpen(): boolean {
    return this.slitConfigurationProperty.value !== 'leftCovered';
  }

  protected override isBottomSlitOpen(): boolean {
    return this.slitConfigurationProperty.value !== 'rightCovered';
  }

  public override getIntensityAtPosition( positionOnScreen: number ): number {
    const lambda = this.getEffectiveWavelength();
    if ( lambda === 0 ) {
      return 0;
    }

    if ( this.obstacleTypeProperty.value === 'none' ) {
      return 1;
    }

    const slitConfig = this.slitConfigurationProperty.value;
    const slitSeparationMeters = this.slitSeparationProperty.value * 1e-3;

    if ( slitConfig === 'leftCovered' || slitConfig === 'rightCovered' ) {
      const uncoveredSlitOffsetMeters = slitConfig === 'leftCovered' ? slitSeparationMeters / 2 :
                                        -slitSeparationMeters / 2;
      return SINGLE_OPEN_SLIT_INTENSITY_SCALE * this.computeSingleSlitIntensity( positionOnScreen, uncoveredSlitOffsetMeters );
    }

    if ( hasAnyDetector( slitConfig ) ) {
      const slitWidthMeters = this.slitWidth * 1e-3;
      const screenDistanceMeters = this.getEffectiveScreenDistance();
      const sinTheta = positionOnScreen / Math.sqrt( positionOnScreen * positionOnScreen + screenDistanceMeters * screenDistanceMeters );
      const singleSlitArg = Math.PI * slitWidthMeters * sinTheta / lambda;
      return singleSlitArg === 0 ? 1 : Math.pow( Math.sin( singleSlitArg ) / singleSlitArg, 2 );
    }

    return this.computeDoubleSlitIntensity( positionOnScreen );
  }

  public override clearScreen(): void {
    this.hitAccumulator = 0;
    this.leftDetectorHitsProperty.value = 0;
    this.rightDetectorHitsProperty.value = 0;
    super.clearScreen();
  }

  public takeHighIntensitySnapshot(): void {
    this.takeSnapshot( this.detectionModeProperty.value, this.slitConfigurationProperty.value, this.intensityProperty.value );
  }

  /**
   * Steps the scene forward in time: advances the wave solver and accumulates hits.
   */
  public step( dt: number ): void {

    // Always step the wave solver so animation continues
    if ( this.isEmittingProperty.value ) {
      this.waveSolver.step( dt );
    }

    // Accumulate hits when emitting in hits mode
    if (
      !this.isEmittingProperty.value ||
      this.detectionModeProperty.value !== 'hits' ||
      this.isMaxHitsReachedProperty.value ||
      dt > 0.5
    ) {
      return;
    }

    const rate = MAX_EMISSION_RATE * this.intensityProperty.value;
    this.hitAccumulator += rate * dt;
    const numHits = Math.floor( this.hitAccumulator );
    this.hitAccumulator -= numHits;

    if ( numHits === 0 ) {
      return;
    }

    const slitConfig = this.slitConfigurationProperty.value;
    const isDetectorActive = hasAnyDetector( slitConfig );
    let actualHits = 0;
    let leftHits = 0;
    let rightHits = 0;

    for ( let i = 0; i < numHits; i++ ) {
      if ( this.totalHitsProperty.value + actualHits >= MAX_HITS ) {
        break;
      }

      const x = this.generateHitPosition();
      const y = ( dotRandom.nextDouble() - 0.5 ) * 2 * HIT_VERTICAL_EXTENT;
      this.hits.push( new Vector2( x, y ) );
      actualHits++;

      if ( isDetectorActive ) {
        const side = dotRandom.nextDouble() < 0.5 ? 'left' : 'right';
        if ( hasDetectorOnSide( slitConfig, side ) ) {
          if ( side === 'left' ) { leftHits++; }
          else { rightHits++; }
        }
      }
    }

    if ( actualHits > 0 ) {
      this.totalHitsProperty.value += actualHits;
      if ( isDetectorActive ) {
        this.leftDetectorHitsProperty.value += leftHits;
        this.rightDetectorHitsProperty.value += rightHits;
      }
      this.hitsChangedEmitter.emit();
    }
  }

  public override reset(): void {
    super.reset();
    this.intensityProperty.reset();
    this.slitConfigurationProperty.reset();
    this.detectionModeProperty.reset();
    this.hitAccumulator = 0;
    this.leftDetectorHitsProperty.reset();
    this.rightDetectorHitsProperty.reset();
    this.syncSolverParameters();
  }
}

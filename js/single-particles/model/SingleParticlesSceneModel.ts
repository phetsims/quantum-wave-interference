// Copyright 2026, University of Colorado Boulder

/**
 * SingleParticlesSceneModel holds the state for one of the four source-type scenes (Photons, Electrons,
 * Neutrons, Helium atoms) on the Single Particles screen.
 *
 * Extends BaseSceneModel with Single Particles–specific state: single-packet emission with auto-repeat,
 * detector tool, restricted slit configurations (no detector variants), and always-Hits mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { PACKET_TRAVERSAL_TIME } from '../../common/model/AnalyticalWavePacketSolver.js';
import BaseSceneModel, { type BaseSceneModelOptions, HIT_VERTICAL_EXTENT, MAX_HITS } from '../../common/model/BaseSceneModel.js';
import { createWavePacketSolver } from '../../common/model/createWaveSolver.js';

export const SingleParticlesSlitConfigurationValues = [ 'bothOpen', 'leftCovered', 'rightCovered' ] as const;
export type SingleParticlesSlitConfiguration = typeof SingleParticlesSlitConfigurationValues[number];

export const DetectorToolStateValues = [ 'ready', 'detected', 'notDetected' ] as const;
export type DetectorToolState = typeof DetectorToolStateValues[number];

const MIN_EMISSION_INTERVAL = 0.3;

export type SingleParticlesSceneModelOptions = BaseSceneModelOptions;

export default class SingleParticlesSceneModel extends BaseSceneModel {

  public readonly autoRepeatProperty: BooleanProperty;
  public readonly slitConfigurationProperty: StringUnionProperty<SingleParticlesSlitConfiguration>;

  // Whether a wave packet is currently propagating through the visualization region
  public readonly isPacketActiveProperty: BooleanProperty;

  // Whether the wave field should be rendered in the visualization region
  public readonly isWaveVisibleProperty: TReadOnlyProperty<boolean>;

  // Detector tool state — position/radius are in normalized coordinates (0–1) within the wave region
  public readonly detectorToolPositionProperty: Vector2Property;
  public readonly detectorToolRadiusProperty: NumberProperty;
  public readonly detectorToolStateProperty: StringUnionProperty<DetectorToolState>;
  public readonly detectorToolProbabilityProperty: NumberProperty;

  public readonly isMaxHitsReachedProperty: TReadOnlyProperty<boolean>;

  // False when the emitter button should be disabled
  public readonly isEmitterEnabledProperty: TReadOnlyProperty<boolean>;

  // Time since the last packet was emitted
  private timeSinceLastEmission: number;

  // Progress of the current packet as fraction of traversal (0 = just emitted, 1 = at detector screen)
  private packetProgress: number;

  public constructor( providedOptions: SingleParticlesSceneModelOptions ) {

    super( createWavePacketSolver(), combineOptions<BaseSceneModelOptions>( {
      defaultPhotonWaveDisplayMode: 'timeAveragedIntensity'
    }, providedOptions ) );

    const tandem = providedOptions.tandem;

    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
    this.packetProgress = 0;

    this.autoRepeatProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'autoRepeatProperty' )
    } );

    this.slitConfigurationProperty = new StringUnionProperty<SingleParticlesSlitConfiguration>( 'bothOpen', {
      validValues: SingleParticlesSlitConfigurationValues,
      tandem: tandem.createTandem( 'slitConfigurationProperty' )
    } );

    this.isPacketActiveProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isPacketActiveProperty' ),
      phetioReadOnly: true
    } );

    this.isWaveVisibleProperty = this.isPacketActiveProperty;

    this.isMaxHitsReachedProperty = new DerivedProperty(
      [ this.totalHitsProperty ],
      totalHits => totalHits >= MAX_HITS
    );

    this.isEmitterEnabledProperty = new DerivedProperty(
      [ this.isMaxHitsReachedProperty, this.isPacketActiveProperty, this.autoRepeatProperty ],
      ( isMaxHits, isPacketActive, autoRepeat ) =>
        isMaxHits ? false :
        autoRepeat ? true :
        !isPacketActive
    );

    // Detector tool
    this.detectorToolPositionProperty = new Vector2Property( new Vector2( 0.5, 0.5 ), {
      tandem: tandem.createTandem( 'detectorToolPositionProperty' )
    } );

    this.detectorToolRadiusProperty = new NumberProperty( 0.1, {
      range: new Range( 0.03, 0.3 ),
      tandem: tandem.createTandem( 'detectorToolRadiusProperty' )
    } );

    this.detectorToolStateProperty = new StringUnionProperty<DetectorToolState>( 'ready', {
      validValues: DetectorToolStateValues,
      tandem: tandem.createTandem( 'detectorToolStateProperty' )
    } );

    this.detectorToolProbabilityProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'detectorToolProbabilityProperty' ),
      phetioReadOnly: true
    } );

    // Initial sync and listeners
    this.syncSolverParameters();
    this.setupClearScreenListeners();
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
      return this.computeSingleSlitIntensity( positionOnScreen, uncoveredSlitOffsetMeters );
    }

    return this.computeDoubleSlitIntensity( positionOnScreen );
  }

  public override clearScreen(): void {
    this.isPacketActiveProperty.value = false;
    this.packetProgress = 0;
    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
    super.clearScreen();
  }

  public takeSingleParticlesSnapshot(): void {
    this.takeSnapshot( 'hits', this.slitConfigurationProperty.value, 1 );
  }

  /**
   * Emits a single wave packet from the source.
   */
  public emitPacket(): void {
    if ( this.isMaxHitsReachedProperty.value || this.isPacketActiveProperty.value ) {
      return;
    }
    this.isPacketActiveProperty.value = true;
    this.packetProgress = 0;
    this.timeSinceLastEmission = 0;
    this.waveSolver.reset();
    this.syncSolverParameters();
  }

  /**
   * Steps the scene forward in time. Handles single-packet propagation and detection.
   */
  public step( dt: number ): void {
    this.timeSinceLastEmission += dt;

    if ( this.isPacketActiveProperty.value ) {
      this.waveSolver.step( dt );

      this.packetProgress += dt / PACKET_TRAVERSAL_TIME;

      const detectionProbabilityPerStep = this.packetProgress > 0.8 ?
                                          ( this.packetProgress - 0.8 ) / 0.2 * dt * 5 :
                                          0;

      if ( dotRandom.nextDouble() < detectionProbabilityPerStep || this.packetProgress >= 1.0 ) {
        this.detectPacket();
      }

      // Update detector tool probability while packet is active
      if ( this.isPacketActiveProperty.value && this.detectorToolStateProperty.value === 'ready' ) {
        this.detectorToolProbabilityProperty.value = this.computeDetectorProbability();
      }
    }
    else {
      this.detectorToolProbabilityProperty.value = 0;
    }

    // In non-auto-repeat mode, detectPacket() sets isEmitting to false, preventing re-emission.
    if (
      this.isEmittingProperty.value &&
      !this.isPacketActiveProperty.value &&
      this.timeSinceLastEmission >= MIN_EMISSION_INTERVAL &&
      !this.isMaxHitsReachedProperty.value
    ) {
      this.emitPacket();
    }
  }

  private detectPacket(): void {
    if ( !this.isPacketActiveProperty.value ) {
      return;
    }

    const x = this.generateHitPosition();
    const y = ( dotRandom.nextDouble() - 0.5 ) * 2 * HIT_VERTICAL_EXTENT;
    this.hits.push( new Vector2( x, y ) );
    this.totalHitsProperty.value++;
    this.isPacketActiveProperty.value = false;
    this.packetProgress = 0;
    this.hitsChangedEmitter.emit();

    if ( !this.autoRepeatProperty.value ) {
      this.isEmittingProperty.value = false;
    }
  }

  private getDetectorCircleParams(): { cx: number; cy: number; rSq: number } {
    const gw = this.waveSolver.gridWidth;
    const gh = this.waveSolver.gridHeight;
    return {
      cx: this.detectorToolPositionProperty.value.x * gw,
      cy: this.detectorToolPositionProperty.value.y * gh,
      rSq: ( this.detectorToolRadiusProperty.value * gw ) ** 2
    };
  }

  public computeDetectorProbability(): number {
    if ( !this.isPacketActiveProperty.value ) {
      return 0;
    }

    const field = this.waveSolver.getAmplitudeField();
    const gw = this.waveSolver.gridWidth;
    const gh = this.waveSolver.gridHeight;
    const { cx, cy, rSq } = this.getDetectorCircleParams();

    let insideSum = 0;
    let totalSum = 0;

    for ( let iy = 0; iy < gh; iy++ ) {
      for ( let ix = 0; ix < gw; ix++ ) {
        const idx = ( iy * gw + ix ) * 2;
        const re = field[ idx ];
        const im = field[ idx + 1 ];
        const prob = re * re + im * im;
        totalSum += prob;

        const dxGrid = ix - cx;
        const dyGrid = iy - cy;
        if ( dxGrid * dxGrid + dyGrid * dyGrid <= rSq ) {
          insideSum += prob;
        }
      }
    }

    return totalSum > 0 ? insideSum / totalSum : 0;
  }

  public performDetectorMeasurement(): void {
    if ( !this.isPacketActiveProperty.value || this.detectorToolStateProperty.value !== 'ready' ) {
      return;
    }

    const probability = this.computeDetectorProbability();
    const detected = dotRandom.nextDouble() < probability;

    if ( detected ) {
      this.detectorToolStateProperty.value = 'detected';
      this.isPacketActiveProperty.value = false;
      this.packetProgress = 0;
    }
    else {
      this.detectorToolStateProperty.value = 'notDetected';
      this.zeroWaveInsideDetector();
    }
  }

  private zeroWaveInsideDetector(): void {
    const field = this.waveSolver.getAmplitudeField();
    const gw = this.waveSolver.gridWidth;
    const gh = this.waveSolver.gridHeight;
    const { cx, cy, rSq } = this.getDetectorCircleParams();

    let outsideSum = 0;

    for ( let iy = 0; iy < gh; iy++ ) {
      for ( let ix = 0; ix < gw; ix++ ) {
        const idx = ( iy * gw + ix ) * 2;
        const dxGrid = ix - cx;
        const dyGrid = iy - cy;

        if ( dxGrid * dxGrid + dyGrid * dyGrid <= rSq ) {
          field[ idx ] = 0;
          field[ idx + 1 ] = 0;
        }
        else {
          const re = field[ idx ];
          const im = field[ idx + 1 ];
          outsideSum += re * re + im * im;
        }
      }
    }

    if ( outsideSum > 0 ) {
      const scale = 1 / Math.sqrt( outsideSum );
      for ( let iy = 0; iy < gh; iy++ ) {
        for ( let ix = 0; ix < gw; ix++ ) {
          const idx = ( iy * gw + ix ) * 2;
          field[ idx ] *= scale;
          field[ idx + 1 ] *= scale;
        }
      }
    }

    this.waveSolver.invalidate();
  }

  public resetDetectorToolState(): void {
    this.detectorToolStateProperty.value = 'ready';
  }

  public override reset(): void {
    super.reset();
    this.autoRepeatProperty.reset();
    this.slitConfigurationProperty.reset();
    this.isPacketActiveProperty.reset();
    this.detectorToolPositionProperty.reset();
    this.detectorToolRadiusProperty.reset();
    this.detectorToolStateProperty.reset();
    this.detectorToolProbabilityProperty.reset();
    this.packetProgress = 0;
    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
    this.syncSolverParameters();
  }
}

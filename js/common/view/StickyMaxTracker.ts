// Copyright 2026, University of Colorado Boulder

/**
 * Tracks a "sticky" running maximum magnitude used to scale plot y-axes. The tracked value grows
 * immediately to new peaks but decays toward the current peak over time, so the scale stays
 * stable when a signal fades instead of snapping per-frame to the frame's observed max.
 *
 * Used by TimePlotNode and PositionPlotNode to share the same amplitude-scaling behavior while
 * letting each caller control how quickly the scale decays (per-step vs. per-second).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export default class StickyMaxTracker {

  private readonly minValue: number;
  private currentValue: number;

  public constructor( minValue: number ) {
    this.minValue = minValue;
    this.currentValue = minValue;
  }

  /**
   * Update the tracked value toward `observedMax`. `decayFactor` is the fraction of the gap
   * between `currentValue` and `observedMax` that remains after this update (1 = no decay,
   * 0 = snap to observed max). Returns the new value.
   */
  public update( observedMax: number, decayFactor: number ): number {
    if ( observedMax >= this.currentValue ) {
      this.currentValue = observedMax;
    }
    else {
      this.currentValue = observedMax + ( this.currentValue - observedMax ) * decayFactor;
    }
    if ( this.currentValue < this.minValue ) {
      this.currentValue = this.minValue;
    }
    return this.currentValue;
  }

  public getValue(): number {
    return this.currentValue;
  }

  public reset(): void {
    this.currentValue = this.minValue;
  }
}

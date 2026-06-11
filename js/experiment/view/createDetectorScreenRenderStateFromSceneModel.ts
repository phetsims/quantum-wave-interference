// Copyright 2026, University of Colorado Boulder

/**
 * Converts a live Experiment SceneModel into a transient DetectorScreenRenderState snapshot used by the shared
 * detector-screen renderer. The returned object is assembled immediately before each paint and is not retained beyond
 * that paint call.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type DetectorScreenRenderState } from '../../common/view/DetectorScreenRenderState.js';
import SceneModel from '../model/SceneModel.js';

/**
 * Reads the current values of all rendering-relevant SceneModel properties and assembles them into a
 * DetectorScreenRenderState for one paint pass. Called by getDetectorScreenTexture on every dirty render cycle.
 * The returned object is transient — callers must not cache it across frames.
 */
export default function createDetectorScreenRenderStateFromSceneModel( sceneModel: SceneModel ): DetectorScreenRenderState {
  return {
    detectionMode: sceneModel.detectionModeProperty.value,
    sourceType: sceneModel.sourceType,
    wavelength: sceneModel.wavelengthProperty.value,
    effectiveWavelength: sceneModel.getEffectiveWavelength(),
    slitWidth: sceneModel.slitWidth,
    slitSeparation: sceneModel.slitSeparationProperty.value,
    screenDistance: sceneModel.screenDistanceProperty.value,
    fullScreenHalfWidth: sceneModel.fullScreenHalfWidth,
    isEmitting: sceneModel.isEmittingProperty.value,
    brightness: sceneModel.screenBrightnessProperty.value,
    intensity: sceneModel.intensityProperty.value,
    slitSetting: sceneModel.slitSettingProperty.value,
    hits: sceneModel.hits
  };
}

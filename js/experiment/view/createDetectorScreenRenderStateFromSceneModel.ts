// Copyright 2026, University of Colorado Boulder

/**
 * Converts an Experiment SceneModel into the frozen detector-screen render state used by the shared renderer.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type DetectorScreenRenderState } from '../../common/view/DetectorScreenRenderState.js';
import SceneModel from '../model/SceneModel.js';

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

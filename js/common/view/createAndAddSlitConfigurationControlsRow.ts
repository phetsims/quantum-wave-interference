// Copyright 2026, University of Colorado Boulder

/**
 * Creates the slit controls row shared by the High Intensity and Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import type { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import type Tandem from '../../../../tandem/js/Tandem.js';
import type { TAlertable } from '../../../../utterance-queue/js/Utterance.js';
import type BaseSceneModel from '../model/BaseSceneModel.js';
import { type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';
import createSlitConfigComboItems, { type SlitConfigComboItemTandems } from './createSlitConfigComboItems.js';
import SlitConfigurationControlsRow from './SlitConfigurationControlsRow.js';

/**
 * Creates, adds, and returns the slit controls row used below the front-facing wave region.
 *
 * @param slitConfigurationProperty - current slit configuration for the active scene
 * @param sceneProperty - active scene Property
 * @param scenes - scene models that each own a slit separation control
 * @param waveRegionLeft - left edge used to align the row with the wave region
 * @param slitControlsBottom - bottom edge used to align the row near the bottom of the screen
 * @param listParent - parent node used by the combo box popup list
 * @param tandem - parent tandem for row children
 * @param slitConfigComboItemTandems - tandem names for screen-specific covered/closed combo items
 * @param accessibleContextResponse - response spoken when a new slit configuration is selected
 * @returns the row, for accessible description and nearby tool positioning
 */
export default function createAndAddSlitConfigurationControlsRow(
  slitConfigurationProperty: PhetioProperty<SlitConfigurationWithNoBarrier>,
  sceneProperty: TReadOnlyProperty<BaseSceneModel>,
  scenes: BaseSceneModel[],
  waveRegionLeft: number,
  slitControlsBottom: number,
  listParent: Node,
  tandem: Tandem,
  slitConfigComboItemTandems: SlitConfigComboItemTandems,
  accessibleContextResponse?: TAlertable
): SlitConfigurationControlsRow<SlitConfigurationWithNoBarrier> {
  const bottomRow = new SlitConfigurationControlsRow(
    slitConfigurationProperty,
    createSlitConfigComboItems( slitConfigComboItemTandems ),
    sceneProperty,
    scenes,
    waveRegionLeft,
    slitControlsBottom,
    listParent,
    tandem,
    accessibleContextResponse
  );
  listParent.addChild( bottomRow );

  return bottomRow;
}

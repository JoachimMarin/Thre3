enum EventGroup {
  /** The player starts moving from player.position to player.destination. */
  BEGIN_STEP_ALL,
  /** The player starts moving from player.position to player.destination and game objects are triggered. */
  BEGIN_STEP_TRIGGER,
  /** The player finishes moving and player.position is now player.destination. */
  END_STEP_ALL,
  /** The player finishes moving and player.position is now player.destination and game objects are triggered. */
  END_STEP_TRIGGER,
  /** Game loop update. Must not alter game state, as it is only called when running the game with Phaser.  */
  UPDATE,
  /** All objects in the level. */
  ALL
}

export default EventGroup;

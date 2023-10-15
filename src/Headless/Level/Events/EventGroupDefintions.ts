import GameObjectEvent from 'Headless/Level/Events/GridObjectEvent';
import GameObject from 'Headless/Level/GameObjects/BaseClasses/GameObject';
import ClassUtils from 'Headless/Utils/ClassUtils';

/**
 * Defines a new EventGroup for GameObjectEvent key for GameObjects fulfilling condition.
 * @param key
 * @param condition
 */

function DefineEventGroup(
  eventGroups: Map<GameObjectEvent, (obj: GameObject) => boolean>,
  key: GameObjectEvent,
  condition: (obj: GameObject) => boolean
) {
  eventGroups.set(key, condition);
}

function DefineEventGroups() {
  const eventGroups = new Map<GameObjectEvent, (obj: GameObject) => boolean>();
  // Check whether a GameObject has a certain event
  // All GameObjects in the scene
  DefineEventGroup(eventGroups, GameObjectEvent.GLOBAL_SCENE, (_obj) => true);
  // GameObjects that override an event function:
  // .OnUpdate
  DefineEventGroup(eventGroups, GameObjectEvent.UPDATE, (obj) =>
    ClassUtils.IsImplemented(obj.OnUpdate)
  );
  // .OnBeginStep
  DefineEventGroup(eventGroups, GameObjectEvent.BEGIN_STEP_ALL, (obj) =>
    ClassUtils.IsImplemented(obj.OnBeginStep)
  );
  // .OnBeginStepTrigger
  DefineEventGroup(eventGroups, GameObjectEvent.BEGIN_STEP_TRIGGER, (obj) =>
    ClassUtils.IsImplemented(obj.OnBeginStepTrigger)
  );
  // .OnEndStep
  DefineEventGroup(eventGroups, GameObjectEvent.END_STEP_ALL, (obj) =>
    ClassUtils.IsImplemented(obj.OnEndStep)
  );
  // .OnEndStepTrigger
  DefineEventGroup(eventGroups, GameObjectEvent.END_STEP_TRIGGER, (obj) =>
    ClassUtils.IsImplemented(obj.OnEndStepTrigger)
  );
  return eventGroups;
}

const EventGroupDefintions = DefineEventGroups();
export default EventGroupDefintions;

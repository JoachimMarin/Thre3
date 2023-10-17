import EventGroup from 'Game/Level/Events/GridObjectEvent';
import GameObject from 'Game/Level/GameObjects/BaseClasses/GameObject';
import ClassUtils from 'Utils/ClassUtils';

function DefineEventGroup(
  eventGroups: Map<EventGroup, (obj: GameObject) => boolean>,
  key: EventGroup,
  condition: (obj: GameObject) => boolean
) {
  eventGroups.set(key, condition);
}

function DefineEventGroups() {
  const eventGroups = new Map<EventGroup, (obj: GameObject) => boolean>();
  // All GameObjects in the scene
  DefineEventGroup(eventGroups, EventGroup.ALL, (_obj) => true);

  // GameObjects that override an event function:
  // .OnUpdate
  DefineEventGroup(eventGroups, EventGroup.UPDATE, (obj) =>
    ClassUtils.IsImplemented(obj.OnUpdate)
  );
  // .OnBeginStep
  DefineEventGroup(eventGroups, EventGroup.BEGIN_STEP_ALL, (obj) =>
    ClassUtils.IsImplemented(obj.OnBeginStep)
  );
  // .OnBeginStepTrigger
  DefineEventGroup(eventGroups, EventGroup.BEGIN_STEP_TRIGGER, (obj) =>
    ClassUtils.IsImplemented(obj.OnBeginStepTrigger)
  );
  // .OnEndStep
  DefineEventGroup(eventGroups, EventGroup.END_STEP_ALL, (obj) =>
    ClassUtils.IsImplemented(obj.OnEndStep)
  );
  // .OnEndStepTrigger
  DefineEventGroup(eventGroups, EventGroup.END_STEP_TRIGGER, (obj) =>
    ClassUtils.IsImplemented(obj.OnEndStepTrigger)
  );
  return eventGroups;
}

/**
 * Associates a condition with every GameObjectEvent to determine which GameObjects belong to the event group.
 * Event groups are commonly used in order to run event function only for those GameObjects that actually override the event function.
 */
const EventGroupDefintions = DefineEventGroups();
export default EventGroupDefintions;

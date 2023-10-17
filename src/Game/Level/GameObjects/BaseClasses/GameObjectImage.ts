import DynamicState from 'Game/Level/GameState/DynamicState';
import { IVec2, Vec2 } from 'Utils/Math/GridPoint';
import GameObject from 'Game/Level/GameObjects/BaseClasses/GameObject';
import IImage from 'PhaserStubs/IImage';
export default class GameObjectImage extends GameObject {
  protected image: IImage;

  protected constructor(
    state: DynamicState,
    aPoint: IVec2,
    imageKey: string,
    displayWidth: number,
    displayHeight: number
  ) {
    super();

    if (!state.virtual) {
      const point = Vec2.AsVec2(aPoint);
      this.image = state.levelScene.add.image(
        point.realX(),
        point.realY(),
        imageKey
      );
      this.image.setDisplaySize(displayWidth, displayHeight);
    }
  }

  override Remove(state: DynamicState): void {
    super.Remove(state);
    if (!state.virtual) {
      this.image.destroy();
      this.image = null;
    }
  }

  override Unload(virtual: boolean) {
    super.Unload(virtual);
    if (!virtual) {
      this.image.destroy();
      this.image = null;
    }
  }
}

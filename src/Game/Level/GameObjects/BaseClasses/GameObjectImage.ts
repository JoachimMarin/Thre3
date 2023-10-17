import DynamicState from 'Game/Level/GameState/DynamicState';
import { IVec2, Vec2 } from 'Utils/Math/GridPoint';
import GameObject from 'Game/Level/GameObjects/BaseClasses/GameObject';
import IImage from 'PhaserStubs/IImage';
import Constants from 'Game/Constants';
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

    if (Constants.INCLUDE_GRAPHICS) {
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
    if (Constants.INCLUDE_GRAPHICS) {
      this.image.destroy();
      this.image = null;
    }
  }

  override Unload() {
    super.Unload();
    if (Constants.INCLUDE_GRAPHICS) {
      this.image.destroy();
      this.image = null;
    }
  }
}

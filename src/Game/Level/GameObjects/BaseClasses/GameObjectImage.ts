import Constants from 'Game/Constants';
import GameObject from 'Game/Level/GameObjects/BaseClasses/GameObject';
import DynamicState from 'Game/Level/GameState/DynamicState';
import { IVec2, Vec2 } from 'Utils/Math/GridPoint';


export default class GameObjectImage extends GameObject {
  protected image: Phaser.GameObjects.Image;

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
    if (Constants.INCLUDE_GRAPHICS && this.image != undefined) {
      this.image.destroy();
      this.image = undefined;
    }
  }

  override Unload() {
    super.Unload();
    if (Constants.INCLUDE_GRAPHICS && this.image != undefined) {
      this.image.destroy();
      this.image = undefined;
    }
  }
}

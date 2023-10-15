import LevelScene from 'Phaser/LevelScene';
import MainMenuScene from 'Phaser/MainMenuScene';
import SideUserInterfaceScene from 'Phaser/UI/SideUserInterfaceScene';
import GridUserInterfaceScene from 'Phaser/UI/GridUserInterfaceScene';

export default abstract class Scenes {
  static ALL = [
    MainMenuScene.SCENE,
    LevelScene.SCENE,
    SideUserInterfaceScene.SCENE,
    GridUserInterfaceScene.SCENE
  ];
}

import LevelScene from 'Phaser/LevelScene';
import MainMenuScene from 'Phaser/MainMenuScene';
import SideUserInterfaceScene from 'Phaser/SideUserInterfaceScene';
import GridUserInterfaceScene from 'Phaser/GridUserInterfaceScene';

export default abstract class Scenes {
  static ALL = [
    MainMenuScene.SCENE,
    LevelScene.SCENE,
    SideUserInterfaceScene.SCENE,
    GridUserInterfaceScene.SCENE
  ];
}

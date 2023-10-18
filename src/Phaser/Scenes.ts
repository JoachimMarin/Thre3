import LevelScene from 'Phaser/LevelScene';
import MainMenuScene from 'Phaser/MainMenuScene';
import GridUserInterfaceScene from 'Phaser/UI/GridUserInterfaceScene';
import SideUserInterfaceScene from 'Phaser/UI/SideUserInterfaceScene';


export default abstract class Scenes {
  static ALL = [
    MainMenuScene.SCENE,
    LevelScene.SCENE,
    SideUserInterfaceScene.SCENE,
    GridUserInterfaceScene.SCENE
  ];
}

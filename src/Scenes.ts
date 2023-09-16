import LevelScene from 'LevelScene';
import MainMenuScene from 'MainMenuScene';
import UserInterfaceScene from 'UserInterfaceScene';

export default abstract class Scenes {
  static ALL = [
    MainMenuScene.SCENE,
    LevelScene.SCENE,
    UserInterfaceScene.SCENE
  ];
}

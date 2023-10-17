export default abstract class IImage {
  abstract clearAlpha(..._: any[]): void;
  abstract setAlpha(..._: any[]): void;
  abstract destroy(..._: any[]): void;
  abstract setAngle(..._: any[]): void;
  abstract setDisplaySize(..._: any[]): void;
  abstract setVisible(..._: any[]): void;
  public x: number;
  public y: number;
  public flipX: boolean;
}

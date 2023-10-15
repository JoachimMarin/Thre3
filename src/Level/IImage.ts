export default abstract class IImage {
  abstract clearAlpha(..._: any[]);
  abstract setAlpha(..._: any[]);
  abstract destroy(..._: any[]);
  abstract setAngle(..._: any[]);
  abstract setDisplaySize(..._: any[]);
  abstract setVisible(..._: any[]);
  public x: number;
  public y: number;
  public flipX: boolean;
}

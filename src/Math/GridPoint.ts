import Direction from 'Math/Direction';

export type IVec2 = Vec2 | [integer, integer];

export class Vec2 {
  public readonly x: number;
  public readonly y: number;

  static AsVec2(arg: IVec2) {
    if (arg instanceof Vec2) {
      return arg;
    }
    if (Array.isArray(arg)) {
      return new Vec2(arg[0], arg[1]);
    }
    console.error('Cannot convert to Vec2: <' + arg + '>');
  }

  private constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  realX() {
    return this.x * 128 + 64;
  }

  realY() {
    return this.y * 128 + 64;
  }

  Add(other: Vec2) {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  Negate() {
    return new Vec2(-this.x, -this.y);
  }

  Subtract(other: Vec2) {
    return new Vec2(this.x - other.x, this.y - other.y);
  }

  Multiply(factor: integer) {
    return new Vec2(factor * this.x, factor * this.y);
  }

  Angle() {
    return (Math.atan2(this.y, this.x) * 180) / Math.PI;
  }

  Norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  static Zero() {
    return new Vec2(0, 0);
  }

  static TranslationVector(direction: Direction, length: number = 1) {
    switch (direction) {
      case Direction.UP:
        return new Vec2(0, -length);
      case Direction.LEFT:
        return new Vec2(-length, 0);
      case Direction.DOWN:
        return new Vec2(0, length);
      case Direction.RIGHT:
        return new Vec2(length, 0);
      default:
        return new Vec2(0, 0);
    }
  }

  Translate(direction: Direction, length: number = 1) {
    return this.Add(Vec2.TranslationVector(direction, length));
  }
}

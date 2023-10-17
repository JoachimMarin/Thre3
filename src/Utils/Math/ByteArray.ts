export default abstract class ByteArray {
  static Write8(array: Uint8Array, index: integer, value: integer) {
    array[index] = value;
  }

  static Write16(array: Uint8Array, index: integer, value: integer) {
    const valueUpper = value >> 8;
    array[index] = valueUpper;
    array[index + 1] = value - (valueUpper << 8);
  }

  static Write32(array: Uint8Array, index: integer, value: integer) {
    const d = value;
    const c = d >> 8;
    const b = c >> 8;
    const a = b >> 8;
    array[index] = a;
    array[index + 1] = b - (a << 8);
    array[index + 2] = c - (b << 8);
    array[index + 3] = d - (c << 8);
  }
}

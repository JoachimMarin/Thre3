abstract class IsImplemented {
  private static readonly cache = new Map<(...args: any[]) => void, boolean>();

  static get(func: (...args: any[]) => void) {
    if (!this.cache.has(func)) {
      const functionString: string = func.toString().replace(/\s/g, '');
      const first = functionString.indexOf('{}');
      const result = first == -1 || first != functionString.lastIndexOf('{}');
      this.cache.set(func, result);
      return result;
    }
    return this.cache.get(func);
  }
}

export default abstract class ClassUtils {
  static IsImplemented(func: (...args: any[]) => void) {
    return IsImplemented.get(func);
  }
}

export function nest(obj: any, toNest: string[]): any {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    if (key.includes("_")) {
      const [name, prop] = key.split("_");

      if (!toNest.includes(name)) {
        acc[key] = value;
        return acc;
      }

      if (acc[name] == null) {
        acc[name] = {};
      }

      acc[name][prop] = value;
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}

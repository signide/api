export class CityError extends Error {
  name: "CityNameError" | "CityIDError";
  type: "name" | "id";
  cityName: string;
  cityID: number;

  constructor(notFound: string | number) {
    super("");
    if (typeof notFound == "string") {
      this.message = `unknown city name '${notFound}'`;
      this.name = "CityNameError";
      this.type = "name";
      this.cityName = notFound;
    } else {
      this.message = `unknown city id '${notFound}'`;
      this.name = "CityIDError";
      this.type = "id";
      this.cityID = notFound;
    }
  }
}

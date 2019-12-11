export class CityError extends Error {
  name: "CityNameError" | "CityIdError";
  type: "name" | "id";
  cityName: string;
  cityId: number;

  constructor(notFound: string | number) {
    super("");
    if (typeof notFound == "string") {
      this.message = `unknown city name '${notFound}'`;
      this.name = "CityNameError";
      this.type = "name";
      this.cityName = notFound;
    } else {
      this.message = `unknown city id '${notFound}'`;
      this.name = "CityIdError";
      this.type = "id";
      this.cityId = notFound;
    }
  }
}

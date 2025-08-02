import { defaultPlugins, defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://frost.met.no/swagger.json",
  output: "src/api",
  plugins: [...defaultPlugins.filter((plugin) => plugin !== "@hey-api/sdk")],
});

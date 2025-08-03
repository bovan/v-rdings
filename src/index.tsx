import { render } from "ink";
import App from "./app";
import { dbInit } from "./db/db";

dbInit();
const { waitUntilExit } = render(<App />);

await waitUntilExit();
console.log("Takk for nå!");

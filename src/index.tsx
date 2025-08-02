import { render } from "ink";
import App from "./app";
import { dbClose } from "./db/db";

const { waitUntilExit } = render(<App />);
await waitUntilExit();
console.log("Goodbye!");

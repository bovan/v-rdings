# bovans Weather CLI tool

(Naming is because Yr is the web page I mostly use and this uses the same dataset)

## How to run

To install dependencies:

```bash
bun install
```

To add secrets go to [frost.met.no](https://frost.met.no/auth/requestCredentials.html)
and get your secrets.

Put them in a `.env` file in the root of the project:

```config
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
```

To run:

```bash
bun start
```

## Dev notes

Use `bun dev` to start with the possibility to inspect the code
(Tried to get react-devtools working, but it seems broken after React 19 update)

Use `bun test` to run some tests, they just create the databases
and checks that initializing work

# bovans værdings

A simple CLI app I made because I wanted to use data from Yr.no
(which basically uses frost.met.no) and get it into Home Assistant.

Then I got sidetracked and made a CLI tool that can be used to get weather data
because I found the idea of using React in terminal to be kinda fun.

## How to run

Install bun if you don't have it already:
[bun.sh](https://bun.sh/)

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
and checks that initializing work. Tests will be added if they make the development
easier, as HMR does not work yet.

This is work in progress and just for fun, so dont rely on it for anything important!

# About Thre3

Thre3 is a 2d puzzle game where you play as a mouse used by a crazy scientist in his experiments.
Your goal is to reach the cheese, avoiding all obstacles the scientist set up.

The game can be played [online](https://joachimmarin.github.io/Thre3/).

# Development

Thre3 is written in typescript based on [Phaser 3](https://phaser.io/) and is based on the [Phaser 3 TypeScript Project Template](https://github.com/photonstorm/phaser3-typescript-project-template).

The game is released to github pages automatically when changes are pushed to the main branch, allowing everyone to easily play the latest stable version.

## Running Headless

Parts of Thre3 can run headless using node. This can be used in unit tests or to find optimal solution paths.

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command                      | Description                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `npm install`                | Install project dependencies                                                      |
| `npm run watch`              | Build project and open web server running project, watching for changes           |
| `npm run dev`                | Builds project and open web server, but do not watch for changes                  |
| `npm run build`              | Builds code bundle with production settings (minification, no source maps, etc..) |
| `npm run headless -- [args]` | Builds code bundle for running Thre3 headless using node.                         |

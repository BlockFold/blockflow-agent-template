# Blockflow Agent Template

This project is a template for creating your first Blockflow Agent.

# Quick start

## Install dependencies & compile

```
npm i
```

## Test smart contracts

```
npx hardhat test
```

## Test agents

```
npm run test:agent
```

## Publish your agent

To publish your agent, you will need to get a `BF_TOKEN` to authenticate yourself with your Blockflow Team. You can get your token from:

https://{{teamName}}.blockflow.com/templates/publish

Or follow the steps [here](https://docs.google.com/document/d/1K_-lGAM96MKHjqCuaEWeYjDmJxbGkC5aJZIy3XW1kpM/edit#heading=h.vnz4h0zbnera) to be guided through the Blockflow interface.

This token should be put in a `.env` file, in the root directory of your agent template.

You can then publish your agent with the following command:

```
npx blockflow-cli publish --url https://{{teamName}}.blockflow.com
```

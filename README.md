# Blockflow Agent Template

This project is a template for creating your first Blockflow Agent.

# Quick start

## Install dependencies & compile

```
npx hardhat compile
npm i
```

## Test smart contracts

```
npx hardhat test
```

## Test agents

```
npx hardhat test ./test-agent/mint.test.ts

```

## Publish your agent

To publish your agent, you will need to get a `BF_TOKEN` to authenticate yourself with your Blockflow Team. You can get your token from:

https://{{teamName}}.blockflow.com/templates/publish

This token should be put in a `.env` file, in the root directory of your agent template.

You can then publish your agent with the following command:

```
npx blockflow-cli publish --url https://{{teamName}}.blockflow.com
```

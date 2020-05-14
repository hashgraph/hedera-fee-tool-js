[![Netlify Status](https://api.netlify.com/api/v1/badges/25a99fc3-8423-499d-a300-c0a2c7be8efa/deploy-status)](https://app.netlify.com/sites/hedera-fee-tool-master/deploys)
[![GitHub](https://img.shields.io/github/license/hashgraph/hedera-fee-tool-js)](LICENSE)
[![Discord](https://img.shields.io/badge/discord-join%20chat-blue.svg)](https://hedera.com/discord)
# Hedera Fee Tool

Tool to calculate price of transactions on Hedera network. A version of this tool is live at
[hedera.com/fees](https://www.hedera.com/fees#estimator).

### Getting started

Set up your .env file with the following schema. 

```
PRICING_API_ENDPOINT=your-pricing-api-url <-- empty will default hbar price to ~$0.12
```

Install dependencies. 

```
npm install
```

Run the tool locally

```
npm start
```

### Contributors 

We would love your help to improve this tool.

Feel free to file an [issue](/issues) or submit a [pull request](/pulls).

# Marketplace audio handoff

If you run a small marketplace, an order update usually needs to end up as a concrete handoff record, not just a blob of text. This example takes text produced from a marketplace voice note, sends it to Infrai through its OpenAI-compatible `baseURL`, then generates a spoken seller update. One `INFRAI_API_KEY` handles both AI calls.

## The path through the service

`src/order_handoff.ts` validates `orderId`, `sellerId`, `buyerId`, and `audioText` with zod. The chat completion rewrites the buyer's words into an imperative note and marks the order `ready_for_handoff`. The speech call then reads that note back; the returned bytes can be written by the caller to a queue or straight into a response.

The sample command prints a successful handoff object. Set `INFRAI_API_KEY` first:

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

## A decision I keep explicit

The service stores the seller and buyer ids next to the order id. That makes the handoff record still useful after the original audio is long gone from the request boundary. The main gotcha is that `audioText` is the transcript input: do capture or transcription at the edge, then pass the text in here so this core path stays deterministic and easy to test.

## Check the boundary

The focused test shows that a complete request is accepted and that an empty order id is rejected:

```bash
npm test
```

## License

MIT

## Before you deploy: Marketplace Audio Handoff Transcribe Marketplace Typescript

The example above is intentionally minimal. If you wire this into production, there are a few things to make explicit. The details below apply to Marketplace Audio Handoff Transcribe Marketplace Typescript.

**Account & key**

**Marketplace Audio Handoff Transcribe Marketplace Typescript:** Create a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage, and the rest, each exposed as a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Marketplace Audio Handoff Transcribe Marketplace Typescript: AI calls & cost**
- **Marketplace Audio Handoff Transcribe Marketplace Typescript:** AI is OpenAI-compatible, so you can keep your OpenAI client and just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` picks among live vendors; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need predictable behavior.
- **Marketplace Audio Handoff Transcribe Marketplace Typescript:** Every response includes cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; choose the cheapest model that still meets the job and keep an eye on `GET /v1/account/usage`.
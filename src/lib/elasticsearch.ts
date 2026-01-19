import { Client } from "@elastic/elasticsearch";

// 创建单例客户端
let client: Client | null = null;

export function getElasticsearchClient(): Client {
  if (!client) {
    client = new Client({
      nodes: (
        process.env.ES_HOSTS ||
        "http://order-search-es-0.order-search-es.dev-consumer:9200"
      ).split(","),
      requestTimeout: 30000,
      maxRetries: 5,
      sniffOnStart: true,
      sniffInterval: 60000,
    });
  }
  return client;
}

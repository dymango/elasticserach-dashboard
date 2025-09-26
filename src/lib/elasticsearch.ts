import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  nodes: [
    "http://order-search-es-0.order-search-es.dev-consumer:9200",
    "http://order-search-es-1.order-search-es.dev-consumer:9200",
    "http://order-search-es-2.order-search-es.dev-consumer:9200"
  ]
});


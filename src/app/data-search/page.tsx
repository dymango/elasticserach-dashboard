"use client";

import { useEffect, useState } from "react";
// @ts-expect-error temp
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-expect-error temp
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const PAGE_SIZE_OPTIONS = [20, 50, 100];
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];
const defaultJson = JSON.stringify({ query: { match_all: {} } }, null, 2);

export default function Page() {
  const [queryText, setQueryText] = useState(defaultJson);
  const [results, setResults] = useState<any[]>([]);
  const [indexOptions, setIndexOptions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [gotoPage, setGotoPage] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(""); // 默认第一个索引

  useEffect(() => {
    async function fetchIndices() {
      try {
        const res = await fetch("/api/search", { method: "GET" });
        const data = await res.json();
        if (data.indices && data.indices.length > 0) {
          setIndexOptions(data.indices);
          setSelectedIndex(data.indices[0]); // 默认选择第一个
        }
      } catch (err) {
        console.error("Failed to fetch indices:", err);
      }
    }
    fetchIndices();
  }, []);

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  const formatJsonInput = () => {
    try {
      const parsed = JSON.parse(queryText);
      setQueryText(JSON.stringify(parsed, null, 2));
    } catch {
      alert("请输入合法 JSON 才能格式化");
    }
  };

  const runQuery = async (page = 1, size = pageSize) => {
    setLoading(true);
    try {
      let parsedQuery;
      try {
        parsedQuery = JSON.parse(queryText);
      } catch {
        alert("请输入合法 JSON 查询字符串");
        setLoading(false);
        return;
      }

      const body = {
        ...parsedQuery,
        from: (page - 1) * size,
        size,
        indexName: selectedIndex,
      };

      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setResults(data.search_result.hits || []);
      setTotal(data.search_result.total.value);
      setCurrentPage(page);
    } catch (err: any) {
      console.error("Query failed:", err);
      alert("Query failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const handleGoto = () => {
    const pageNum = Number(gotoPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      runQuery(pageNum);
      setGotoPage("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      {/* 索引选择 + 查询窗口 */}
      <div className="bg-white shadow-md p-4 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-gray-600 text-sm">索引:</label>
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {indexOptions.map((idx) => (
              <option key={idx} value={idx}>
                {idx}
              </option>
            ))}
          </select>
        </div>

        <textarea
          rows={4}
          placeholder='输入 JSON 查询，如 {"query":{"match_all":{}}}'
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault(); // 阻止默认切换焦点行为
              const textarea = e.currentTarget;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;

              // 插入 2 个空格或 "\t"，这里用两个空格
              const newValue =
                queryText.substring(0, start) + "  " + queryText.substring(end);
              setQueryText(newValue);

              // 光标移动到插入后的后面
              setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 2;
              }, 0);
            }
          }}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={formatJsonInput}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
          >
            格式化 JSON
          </button>
          <button
            onClick={() => runQuery(1)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* 总条数 */}
      <div className="text-gray-500 text-sm">
        总条数: {total}，当前第 {currentPage} 页 / 共 {totalPages} 页
      </div>

      {/* 查询结果列表 */}
      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="text-center text-gray-500">No results</div>
        ) : (
          results.map((r) => {
            const expanded = expandedIds.has(r._id);
            return (
              <div
                key={r._id}
                className="p-4 bg-white shadow-md rounded-2xl hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-400">_id: {r._id}</div>
                  <button
                    onClick={() => toggleExpand(r._id)}
                    className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition"
                  >
                    {expanded ? "折叠" : "展开"}
                  </button>
                </div>

                {expanded && (
                  <SyntaxHighlighter
                    language="json"
                    style={oneLight}
                    className="rounded-lg overflow-auto whitespace-pre-wrap"
                  >
                    {JSON.stringify(r._source, null, 2)}
                  </SyntaxHighlighter>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 分页 + 每页条数 */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => runQuery(currentPage - 1)}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
          >
            上一页
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            if (
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 2
            ) {
              return (
                <button
                  key={page}
                  onClick={() => runQuery(page)}
                  className={`px-3 py-1 rounded transition ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              );
            } else if (Math.abs(page - currentPage) === 3) {
              return (
                <span key={page} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            disabled={currentPage === totalPages || loading}
            onClick={() => runQuery(currentPage + 1)}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
          >
            下一页
          </button>

          {/* 跳转页 */}
          <div className="flex items-center space-x-1">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={gotoPage}
              onChange={(e) => setGotoPage(e.target.value)}
              placeholder="页码"
              className="w-16 border rounded px-2 py-1"
            />
            <button
              onClick={handleGoto}
              className="px-3 py-1 rounded bg-blue-500 text-white hover:opacity-90 transition"
            >
              跳转
            </button>
          </div>

          {/* 每页条数选择器 👇 */}
          <div className="flex items-center space-x-2 ml-4">
            <label className="text-sm text-gray-600">每页条数:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                const size = Number(e.target.value);
                setPageSize(size);
                runQuery(1, size);
              }}
              className="border rounded px-2 py-1"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

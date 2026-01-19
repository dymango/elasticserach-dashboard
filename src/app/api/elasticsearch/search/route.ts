import { NextRequest, NextResponse } from 'next/server'
import { getElasticsearchClient } from '@/lib/elasticsearch'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { index, query, page = 1, pageSize = 10 } = body
    if (!index) {
      return NextResponse.json(
        { success: false, error: 'Index name is required' },
        { status: 400 }
      )
    }

    // 解析查询
    let esQuery: any
    try {
      esQuery = query ? JSON.parse(query) : { query: { match_all: {} } }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON query' },
        { status: 400 }
      )
    }

    // 计算分页参数
    const from = (page - 1) * pageSize

    const client = getElasticsearchClient()

    // 执行搜索
    const result = await client.search({
      index,
      body: {
        ...esQuery,
        from,
        size: pageSize,
      },
      track_total_hits: true
    })

    // 格式化响应
    const hits = result.hits.hits.map((hit: any) => ({
      _id: hit._id,
      _index: hit._index,
      _score: hit._score,
      ...hit._source
    }))

    const total = typeof result.hits.total === 'object' 
      ? result.hits.total.value 
      : result.hits.total
    return NextResponse.json({
      success: true,
      data: {
        total,
        results: hits,
        took: result.took,
        page,
        pageSize
      }
    })
  } catch (error: any) {
    console.error('Error searching:', error)
    
    // 提供更详细的错误信息
    let errorMessage = error.message || 'Failed to execute search'
    
    if (error.meta?.body?.error) {
      errorMessage = error.meta.body.error.reason || errorMessage
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
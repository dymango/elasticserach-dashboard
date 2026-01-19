import { NextRequest, NextResponse } from 'next/server'
import { getElasticsearchClient } from '@/lib/elasticsearch'

export async function GET(request: NextRequest) {
  try {
    const client = getElasticsearchClient()
    
    // 获取索引详细信息
    const result = await client.cat.indices({
      format: 'json',
      h: [
        'index',
        'health',
        'status',
        'docs.count',
        'store.size',
        'pri',
        'rep'
      ]
    })

    // 过滤掉系统索引并格式化数据
    const indices = result
      .filter((index: any) => !index.index?.startsWith('.'))
      .map((index: any) => ({
        index: index.index,
        health: index.health,
        status: index.status,
        docsCount: parseInt(index['docs.count'] || '0'),
        storeSize: index['store.size'] || '0b',
        primaryShards: parseInt(index.pri || '0'),
        replicas: parseInt(index.rep || '0')
      }))
      // 按索引名称排序
      .sort((a: any, b: any) => a.index.localeCompare(b.index))

    return NextResponse.json({
      success: true,
      data: indices
    })
  } catch (error: any) {
    console.error('Error fetching indices details:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch indices details' 
      },
      { status: 500 }
    )
  }
}
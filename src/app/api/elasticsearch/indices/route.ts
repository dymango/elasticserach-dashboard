import { NextRequest, NextResponse } from 'next/server'
import { getElasticsearchClient } from '@/lib/elasticsearch'

export async function GET(request: NextRequest) {
  try {
    const client = getElasticsearchClient()
    
    const result = await client.cat.indices({
      format: 'json',
      h: ['index', 'docs.count', 'store.size']
    })

    // 过滤掉系统索引
    const indices = result
      .filter((index: any) => !index.index?.startsWith('.'))
      .map((index: any) => ({
        name: index.index,
        docCount: parseInt(index['docs.count'] || '0'),
        size: index['store.size'] || '0b'
      }))

    return NextResponse.json({
      success: true,
      data: indices
    })
  } catch (error: any) {
    console.error('Error fetching indices:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch indices' 
      },
      { status: 500 }
    )
  }
}
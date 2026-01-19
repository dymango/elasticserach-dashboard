import { redirect } from 'next/navigation'

export default function HomePage() {
  // 重定向到 queries 页面作为默认页面
  redirect('/queries')
}
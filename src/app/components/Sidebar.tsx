'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChartBarIcon, 
  CircleStackIcon, 
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline'

const navigation = [
//   { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Indices', href: '/indices', icon: CircleStackIcon },
  { name: 'Queries', href: '/queries', icon: MagnifyingGlassIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[280px] bg-[#003d5c] h-screen text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-[#004d6d]">
        <div className="w-10 h-10 relative">
          <ElasticsearchLogo />
        </div>
        <span className="text-xl font-semibold">Elasticsearch</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-[#004d6d] text-white' 
                      : 'text-gray-300 hover:bg-[#004d6d]/50 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

// Elasticsearch Logo Component
function ElasticsearchLogo() {
  return (
    <svg viewBox="0 0 256 256" className="w-full h-full">
      {/* 黄色上半部分 */}
      <path
        d="M 50 30 Q 150 30 200 70 L 150 70 Q 100 70 50 70 Z"
        fill="#FEC514"
      />
      <path
        d="M 150 70 Q 180 70 200 85 Q 180 70 150 70 Z"
        fill="#D9A218"
      />
      
      {/* 黑色和蓝色中间部分 */}
      <rect x="40" y="90" width="90" height="45" rx="5" fill="#343741" />
      <path
        d="M 130 90 L 180 90 Q 210 90 210 120 Q 210 135 180 135 L 130 135 Z"
        fill="#00BFB3"
      />
      
      {/* 绿色下半部分 */}
      <path
        d="M 50 155 L 100 155 Q 150 155 180 170 Q 200 180 200 200 Q 180 215 150 215 Q 100 215 50 200 Z"
        fill="#00A89B"
      />
      <path
        d="M 100 155 Q 130 155 150 170 Q 140 160 100 155 Z"
        fill="#4ECDC4"
      />
    </svg>
  )
}
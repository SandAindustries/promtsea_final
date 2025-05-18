// ✅ app/feed/page.tsx – 마이 피드 + 북마크 + 추천 프롬프트 통합 (TypeScript 경고 해결)
'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

interface Prompt {
  id: string
  title: string
  description: string
  category?: string
  likes?: number
}

interface Comment {
  id: string
  content: string
  created_at: string
}

export default function FeedPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [myPrompts, setMyPrompts] = useState<Prompt[]>([])
  const [bookmarked, setBookmarked] = useState<Prompt[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [recommendations, setRecommendations] = useState<Prompt[]>([])

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setEmail(user.email || '')

      const { data: uploads } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('prompt_id, prompt:prompts(*)')
        .eq('user_id', user.id)

      const { data: userComments } = await supabase
        .from('comments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data: recs } = await supabase
        .from('prompts')
        .select('*')
        .neq('user_id', user.id)
        .order('likes', { ascending: false })
        .limit(3)

      if (uploads) setMyPrompts(uploads)
      if (bookmarks) {
        const mapped = bookmarks
          .map((b) => Array.isArray(b.prompt) ? b.prompt[0] : b.prompt)
          .filter((p): p is Prompt => !!p)
        setBookmarked(mapped)
      }
      if (userComments) setComments(userComments)
      if (recs) setRecommendations(recs)
    }
    fetch()
  }, [])

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-100 p-4 border-r">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-300 rounded-full mb-4" />
          <h2 className="text-xl font-semibold">Seonwoo Baeeee</h2>
          <p className="text-sm text-gray-600 text-center mb-2"></p>
          <div className="flex space-x-4 mb-6">
            <a href="https://linkedin.com" target="_blank" className="w-5 h-5 bg-gray-400 rounded" />
            <a href="https://github.com" target="_blank" className="w-5 h-5 bg-gray-400 rounded" />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Tools & Visualizations</h3>
            <div className="w-full h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </aside>

      {/* Center Tabs */}
      <main className="flex-1 p-6">
        <Tabs defaultValue="myPrompts" className="w-full">
          <TabsList>
            <TabsTrigger value="myPrompts">My Prompts</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="myPrompts">
            <div className="space-y-4 mt-4">
              {myPrompts.map((p) => (
                <Card key={p.id} className="p-4">
                  <h4 className="font-semibold text-base mb-1">{p.title}</h4>
                  <p className="text-sm text-gray-600 mb-1">{p.description}</p>
                  <div className="text-xs text-gray-400">❤️ {p.likes ?? 0}</div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookmarked">
            <div className="space-y-4 mt-4">
              {bookmarked.map((p) => (
                <Card key={p.id} className="p-4">
                  <h4 className="font-semibold text-base mb-1">{p.title}</h4>
                  <p className="text-sm text-gray-600 mb-1">{p.description}</p>
                  <div className="text-xs text-gray-400">❤️ {p.likes ?? 0}</div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comments">
            <div className="space-y-3 mt-4">
              {comments.map((c) => (
                <Card key={c.id} className="p-4">
                  <p className="text-sm text-gray-800 whitespace-pre-line">{c.content}</p>
                  <p className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Right Section – Recommendations + Portfolio */}
      <aside className="w-1/4 bg-gray-50 p-4 border-l">
        <h3 className="text-lg font-semibold mb-4">Recommended for you</h3>
        <div className="space-y-3 mb-6">
          {recommendations.map((r) => (
            <Card key={r.id} className="p-3">
              <p className="font-medium text-sm mb-1">{r.title}</p>
              <p className="text-xs text-gray-500">{r.category}</p>
              <div className="text-xs text-gray-400 mt-1">❤️ {r.likes ?? 0}</div>
            </Card>
          ))}
        </div>

        <h3 className="text-lg font-semibold mb-2">Portfolio</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <a href="https://notion.so" target="_blank" className="underline">Notion Portfolio</a>
          <a href="https://resume.io" target="_blank" className="underline">Resume.io CV</a>
        </div>
      </aside>
    </div>
  )
}

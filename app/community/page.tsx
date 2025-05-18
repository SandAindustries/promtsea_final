'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Post {
  id: string
  title: string
  content: string
  email: string
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
      if (data) setPosts(data)

      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setUserEmail(user.email)
    }
    fetch()
  }, [])

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) return
    const { data, error } = await supabase.from('posts').insert([{ title, content, email: userEmail }])
    if (!error) {
      setTitle('')
      setContent('')
      const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
      if (data) setPosts(data)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">PromptSea Community</h1>

      <div className="flex flex-col gap-3 mb-6">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl border-gray-300"
        />
        <Textarea
          placeholder="Write a post..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="rounded-xl border-gray-300"
        />
        <Button variant="outline" onClick={handlePost} className="w-fit">
          Post
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-xl border border-gray-200 p-4 bg-white"
          >
            <h2 className="font-semibold text-base mb-1">{post.title}</h2>
            <p className="text-sm text-gray-500 mb-1">{post.email}</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
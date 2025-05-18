'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Post {
  id: string
  title: string
  content: string
  email: string
  created_at: string
}

export default function PostDetailPage() {
  const [post, setPost] = useState<Post | null>(null)
  const { id } = useParams()

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()

      if (data) setPost(data)
    }

    fetchPost()
  }, [id])

  if (!post) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-xl font-bold mb-2">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-2">{post.email}</p>
      <p className="whitespace-pre-line text-gray-800">{post.content}</p>
    </div>
  )
}
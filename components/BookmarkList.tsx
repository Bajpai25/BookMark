'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Bookmark = {
  id: string
  created_at: string
  user_id: string
  url: string
  title: string
}

export default function BookmarkList({ userId, refreshKey = 0 }: { userId: string; refreshKey?: number }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchBookmarks = useCallback(async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarks:', error)
    } else {
      setBookmarks(data || [])
    }
    setLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    fetchBookmarks()

    // Subscribe to real-time changes (works if Supabase Realtime is enabled)
    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((current) => [payload.new as Bookmark, ...current])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((current) =>
              current.filter((bookmark) => bookmark.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    // Cross-tab sync via BroadcastChannel
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('bookmarks-sync')
      bc.onmessage = () => {
        fetchBookmarks()
      }
    } catch {
      // BroadcastChannel not supported in this browser
    }

    return () => {
      supabase.removeChannel(channel)
      bc?.close()
    }
  }, [userId, supabase, refreshKey, fetchBookmarks])

  const deleteBookmark = async (id: string) => {
    // Optimistic update
    setBookmarks((current) => current.filter((bookmark) => bookmark.id !== id))

    const { error } = await supabase.from('bookmarks').delete().eq('id', id)

    if (error) {
      console.error('Error deleting bookmark:', error)
      // Refetch on error
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setBookmarks(data || [])
    } else {
      // Notify other tabs
      try {
        const bc = new BroadcastChannel('bookmarks-sync')
        bc.postMessage('changed')
        bc.close()
      } catch {
        // BroadcastChannel not supported
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No bookmarks yet. Add your first bookmark above!
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="group relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate mb-1">
                {bookmark.title}
              </h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
              >
                <span className="truncate">{bookmark.url}</span>
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(bookmark.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => deleteBookmark(bookmark.id)}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100"
              aria-label="Delete bookmark"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

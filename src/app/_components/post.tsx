"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface PostManagerProps {
  isPremium: boolean;
}

export function PostManager({ isPremium }: PostManagerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const utils = api.useUtils();
  
  // Queries
  const { data: posts, isLoading } = api.post.list.useQuery();

  // Mutations
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.list.invalidate();
      setTitle("");
      setContent("");
      setErrorMessage("");
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to create post. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Title is required");
      return;
    }

    if (!isPremium && posts && posts.length >= 1) {
      setErrorMessage("Hobby plan users can only create 1 post. Please upgrade to Pro to unlock unlimited posts!");
      return;
    }

    createPost.mutate({ title, content });
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 w-full max-w-6xl mt-8">
      {/* Creation form */}
      <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
        <h2 className="text-xl font-bold mb-4 text-slate-100">Create a New Post</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Post Title</label>
            <input
              type="text"
              placeholder="e.g. My First Project Idea"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Description / Notes</label>
            <textarea
              placeholder="e.g. Build this template using T3 Stack..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm resize-none"
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={createPost.isPending}
            className="w-full rounded-lg bg-indigo-600 py-3 font-semibold hover:bg-indigo-500 transition duration-200 text-sm text-white disabled:opacity-50 cursor-pointer"
          >
            {createPost.isPending ? "Creating Post..." : "Create Post"}
          </button>
        </form>
      </div>

      {/* List display */}
      <div className="md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-100">Your Database Items ({posts?.length ?? 0})</h2>
          {!isPremium && (
            <span className="text-xs bg-amber-500/15 border border-amber-500/20 text-amber-400 rounded-full px-3 py-1 font-semibold">
              Hobby Plan Limit: {posts?.length ?? 0}/1
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse bg-slate-900 border border-slate-800 h-28 rounded-xl" />
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center">
            <p className="text-slate-400 mb-2 font-medium">No posts or database items found yet.</p>
            <p className="text-xs text-slate-500">Fill out the form on the left to add your first record to Neon PostgreSQL.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-200">{post.title}</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {post.content && (
                  <p className="mt-2 text-slate-400 text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

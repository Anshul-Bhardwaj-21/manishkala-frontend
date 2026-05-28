"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

interface ArticleEngagementProps {
  title: string;
}

interface LocalComment {
  id: string;
  name: string;
  email: string;
  comment: string;
  createdAt: string;
}

export function ArticleEngagement({ title }: ArticleEngagementProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const likeKey = `liked:${window.location.pathname}`;
    const commentsKey = `comments:${window.location.pathname}`;
    const savedLiked = window.localStorage.getItem(likeKey) === "true";
    const savedComments = window.localStorage.getItem(commentsKey);

    setLiked(savedLiked);
    setLikeCount(savedLiked ? 1 : 0);
    setCurrentUrl(window.location.href);

    if (savedComments) {
      try {
        const parsedComments = JSON.parse(savedComments) as LocalComment[];
        setComments(Array.isArray(parsedComments) ? parsedComments : []);
      } catch {
        setComments([]);
      }
    }
  }, []);

  function toggleLike() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount(nextLiked ? 1 : 0);
    window.localStorage.setItem(`liked:${window.location.pathname}`, String(nextLiked));
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanedName = name.trim();
    const cleanedEmail = email.trim();
    const cleanedComment = comment.trim();

    if (!cleanedName || !cleanedEmail || !cleanedComment) {
      setStatus("Please add your name, email, and comment.");
      return;
    }

    const nextComment: LocalComment = {
      id: `${Date.now()}`,
      name: cleanedName,
      email: cleanedEmail,
      comment: cleanedComment,
      createdAt: new Date().toISOString()
    };
    const nextComments = [nextComment, ...comments].slice(0, 20);

    setComments(nextComments);
    window.localStorage.setItem(`comments:${window.location.pathname}`, JSON.stringify(nextComments));
    setComment("");
    setEmail("");
    setStatus("Comment saved in this browser.");
  }

  return (
    <section id="comments" className="mt-10 border-y border-hairline bg-linen/25 px-5 py-8" aria-label="Article actions and comments">
      <div className="flex flex-col items-center gap-4 text-center">
        <button
          type="button"
          onClick={toggleLike}
          className="group/heart inline-flex min-h-14 min-w-14 items-center justify-center overflow-hidden rounded-full border border-hairline bg-paper px-4 text-accent transition-all duration-300 hover:min-w-40 hover:border-accent hover:bg-accent-soft focus-visible:min-w-40"
          aria-pressed={liked}
        >
          <span className="text-3xl leading-none" aria-hidden="true">
            {liked ? "\u2665" : "\u2661"}
          </span>
          <span className="ml-0 max-w-0 whitespace-nowrap text-sm font-bold text-accent opacity-0 transition-all duration-300 group-hover/heart:ml-3 group-hover/heart:max-w-24 group-hover/heart:opacity-100 group-focus-visible/heart:ml-3 group-focus-visible/heart:max-w-24 group-focus-visible/heart:opacity-100">
            {liked ? "Liked" : "Like"}
          </span>
        </button>
        <p className="text-sm font-semibold text-muted">{likeCount ? "You liked this writing." : "Tap the heart if this stayed with you."}</p>
      </div>

      <div className="mt-8 flex flex-col gap-5 border-t border-hairline pt-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Reader Space</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">Leave a comment</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex min-h-11 items-center border border-hairline bg-paper px-4 text-sm font-bold text-ink transition-colors hover:border-accent hover:text-accent"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <a
            href="#comment-form"
            className="inline-flex min-h-11 items-center border border-ink bg-ink px-4 text-sm font-bold text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            Add comment
          </a>
        </div>
      </div>

      <form id="comment-form" className="mt-7 grid gap-4 border-t border-hairline pt-6" onSubmit={submitComment}>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-ink">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="min-h-11 border border-hairline bg-paper px-3 text-base font-semibold text-ink outline-none transition-colors focus:border-accent"
              autoComplete="name"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-11 border border-hairline bg-paper px-3 text-base font-semibold text-ink outline-none transition-colors focus:border-accent"
              autoComplete="email"
              type="email"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Comment
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="min-h-36 resize-y border border-hairline bg-paper px-3 py-2 text-base leading-7 text-ink outline-none transition-colors focus:border-accent"
            />
          </label>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted">
            Comments are saved locally for now. WordPress comment submission can be connected later.
          </p>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-4 text-sm font-bold text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            Post comment
          </button>
        </div>
        {status ? <p className="text-sm font-semibold text-accent" role="status">{status}</p> : null}
      </form>

      <div className="mt-8 border-t border-hairline pt-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-serif text-2xl font-semibold text-ink">Comments</h3>
          <span className="text-sm font-bold text-muted">{comments.length}</span>
        </div>
        {comments.length ? (
          <ol className="mt-5 space-y-4">
            {comments.map((item) => (
              <li key={item.id} className="border border-hairline bg-paper p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-bold text-ink">{item.name}</p>
                  <time className="text-xs font-semibold uppercase tracking-[0.12em] text-muted" dateTime={item.createdAt}>
                    {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-muted">{item.comment}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm leading-6 text-muted">No comments in this browser yet.</p>
        )}
      </div>

      {currentUrl ? <p className="sr-only">Current article URL: {currentUrl}</p> : null}
    </section>
  );
}

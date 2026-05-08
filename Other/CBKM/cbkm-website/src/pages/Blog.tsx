import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { fetchBlogs } from '../lib/db/blogs';
import { Blog as BlogType } from '../types';

const Blog: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogType[]>([]);

  useEffect(() => {
    fetchBlogs().then(setBlogs).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="py-24 animate-fade-in" style={{ background: 'linear-gradient(160deg, #111, #1a1a1a)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Stories &amp; Updates</span>
          <h1 className="mt-4 text-white font-bold font-serif" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', letterSpacing: '-0.01em' }}>
            CBKM <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Blog</em>
          </h1>
          <div className="divider center" style={{ marginTop: '1.5rem' }} />
          <p className="text-lg leading-[1.8]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Stories, updates, and insights from Calgary's Tamil community
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-24" style={{ background: 'var(--surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article key={blog.id} className="rounded-2xl overflow-hidden card-hover"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="h-48 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.25), rgba(139,26,26,0.25))' }}>
                  {blog.image ? (
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        <Calendar className="w-12 h-12 mx-auto mb-2" />
                        <div className="text-sm font-medium">
                          {new Date(blog.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm" style={{ color: 'var(--text-muted)' }}>
                      <User className="w-4 h-4 mr-1.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
                      <span>By {blog.author}</span>
                    </div>
                    <div className="flex items-center text-sm" style={{ color: 'var(--text-muted)', opacity: 0.65 }}>
                      <Clock className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      <span>{new Date(blog.publishDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-3 line-clamp-2 font-serif" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
                    {blog.title}
                  </h2>
                  <div className="mb-5 line-clamp-3 prose prose-sm leading-[1.8]" style={{ color: 'var(--text-muted)' }}
                    dangerouslySetInnerHTML={{ __html: blog.description }} />
                  <button className="inline-flex items-center font-semibold text-sm hover:opacity-75 transition-opacity" style={{ color: '#C9A84C' }}>
                    Read More <ArrowRight className="w-4 h-4 ml-1.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {blogs.length === 0 && (
            <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
              <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(201,168,76,0.25)' }} />
              <p>No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;

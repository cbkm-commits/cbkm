import React from 'react';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { mockBlogs } from '../data/mockData';

const Blog: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            CBKM Blog
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Stories, updates, and insights from Calgary's Tamil community
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockBlogs.map((blog) => (
            <article key={blog.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Blog Image */}
              <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-2" />
                    <div className="text-sm font-medium">
                      {new Date(blog.publishDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Content */}
              <div className="p-6">
                {/* Meta Information */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    <span>By {blog.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{new Date(blog.publishDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Blog Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {blog.title}
                </h2>

                {/* Blog Description */}
                <div 
                  className="text-gray-600 mb-4 line-clamp-3 prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: blog.description }}
                />

                {/* Read More Link */}
                <button className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold inline-flex items-center">
            Load More Articles
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blog;

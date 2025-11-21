import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { calculateReadTime } from '@/utils/readTime';

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  
  const ordinal = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `Published on ${day}${ordinal(day)} ${month}, ${year}`;
};

export default function BlogPreview() {
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get preview data from sessionStorage
    const previewDataStr = sessionStorage.getItem('blog_preview_data');
    
    if (previewDataStr) {
      try {
        const previewData = JSON.parse(previewDataStr);
        const transformedBlog = {
          ...previewData,
          article_category: previewData.category_name,
          read_time: calculateReadTime(previewData.article_body),
        };
        setBlog(transformedBlog);
        // Clear the data after loading
        sessionStorage.removeItem('blog_preview_data');
      } catch (error) {
        console.error('Error parsing preview data:', error);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon icon="eos-icons:loading" className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Icon icon="heroicons:document-magnifying-glass" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog Not Found</h1>
          <p className="text-gray-600 mb-4">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const hasContent = blog?.article_body !== null && 
                    blog?.article_body !== undefined && 
                    blog?.article_body !== '' && 
                    blog?.article_body.trim().length > 0;

  return (
    <main className="bg-gray-50 min-h-screen relative">
      {/* Preview Banner */}
      <div className="bg-yellow-500 text-black py-3 px-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon icon="heroicons:eye" className="w-5 h-5" />
            <span className="font-medium">Preview Mode</span>
            <span className="text-sm opacity-75 hidden sm:inline">This is how your blog will look when published</span>
          </div>
          <button
            onClick={() => window.close()}
            className="px-4 py-1.5 bg-black/10 hover:bg-black/20 rounded-lg text-sm font-medium transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>

      {/* Hero Section - Matching paan-africa style */}
      <div 
        className="relative py-12 sm:py-16 md:py-24 pt-20 sm:pt-24 md:pt-32 overflow-hidden"
        style={{
          backgroundImage: blog?.article_image ? `url(${blog.article_image})` : 'linear-gradient(to bottom right, #172840, #243a52)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#172840]/90 via-[#1e3147]/90 to-[#243a52]/90"></div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 left-8 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full opacity-80 animate-pulse"></div>
        <div className="absolute -top-6 right-12 w-16 h-16 sm:w-20 sm:h-20 bg-yellow-400 rounded-full opacity-70"></div>
        <div className="absolute -bottom-10 right-8 w-24 h-24 sm:w-32 sm:h-32 bg-red-500 rounded-full opacity-60"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4 sm:mb-6">
            {blog?.article_category && (
              <span className="px-3 py-1 sm:px-4 sm:py-1.5 text-sm font-medium capitalize text-red-500 bg-red-500/10 rounded-full">
                {blog.article_category}
              </span>
            )}
            <span className="text-sm text-gray-300">
              {blog?.created_at && formatDate(blog.created_at)}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight px-4 leading-snug lg:leading-tight">
            {blog?.article_name}
          </h1>

          <div className="mt-6 sm:mt-8 flex justify-center">
            <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20">
        <div className="flex gap-8">
          {/* Main Content */}
          <article className="flex-1 bg-white rounded-xl overflow-hidden">
            {blog?.article_image && (
              <div className="relative w-full h-[500px]">
                <Image
                  src={blog.article_image}
                  alt={blog.article_name}
                  width={600}
                  height={0}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            )}

            <div className="p-6 sm:p-8 md:p-12 lg:p-10">
              {/* Read time and author info */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-6">
                {blog?.read_time && (
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:clock" className="w-4 h-4" />
                    <span>{blog.read_time}</span>
                  </div>
                )}
                {blog?.author_name && (
                  <div className="flex items-center gap-2">
                    <Icon icon="heroicons:user" className="w-4 h-4" />
                    <span>By {blog.author_name}</span>
                  </div>
                )}
              </div>

              {!hasContent && (
                <div className="text-center py-12 sm:py-16">
                  <Icon
                    icon="heroicons:document-text"
                    className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-[#172840]"
                  />
                  <h3 className="mt-4 text-base sm:text-lg font-medium text-[#172840]">
                    Content Coming Soon
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-gray-500">
                    This article is being prepared. Please check back later.
                  </p>
                </div>
              )}

              {hasContent && (
                <div
                  className="prose prose-sm sm:prose-base md:prose-lg max-w-none
                    prose-headings:font-bold prose-headings:text-[#172840] prose-headings:tracking-tight
                    prose-h1:text-4xl prose-h1:mb-8 prose-h1:mt-12
                    prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-10
                    prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
                    prose-h4:text-xl prose-h4:mb-4 prose-h4:mt-6
                    prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
                    prose-a:text-red-500 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-[#172840] prose-strong:font-semibold
                    prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                    prose-blockquote:border-l-4 prose-blockquote:border-red-500 prose-blockquote:pl-4 prose-blockquote:italic
                    prose-ul:list-disc prose-ul:pl-6 prose-ul:my-6
                    prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-6
                    prose-li:mb-2 prose-li:text-gray-600
                    prose-code:text-red-500 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-gray-900 prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg
                    prose-hr:my-8 prose-hr:border-gray-200"
                >
                  <div dangerouslySetInnerHTML={{ __html: blog.article_body }} />
                </div>
              )}

              {/* Tags */}
              {blog?.article_tags && blog.article_tags.length > 0 && (
                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                  <h3 className="text-sm sm:text-base font-medium text-[#172840] mb-3 sm:mb-4">
                    Tags:
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {blog.article_tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm text-[#172840] bg-[#172840]/5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, X, Calendar, Download } from 'lucide-react';
import { fetchGallery } from '../lib/db/gallery';
import { GalleryImage } from '../types';

const categories = ['All', 'Festival', 'Performance', 'Workshop', 'Art', 'Community'];

const Gallery: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchGallery().then(data => setImages(data as GalleryImage[])).catch(() => {});
  }, []);

  const selectedImageData = images.find(img => img.id === selectedImage);

  return (
    <div>
      {/* Hero */}
      <section className="py-24 animate-fade-in" style={{ background: 'linear-gradient(160deg, #111, #1a1a1a)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Memories</span>
          <h1 className="mt-4 text-white font-bold font-serif" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', letterSpacing: '-0.01em' }}>
            Photo <em style={{ color: '#C9A84C', fontStyle: 'italic' }}>Gallery</em>
          </h1>
          <div className="divider center" style={{ marginTop: '1.5rem' }} />
          <p className="text-lg leading-[1.8]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Memories from our cultural events and community celebrations
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-4">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  background: activeCategory === cat ? '#C9A84C' : 'var(--surface-alt)',
                  color: activeCategory === cat ? '#1a1a1a' : 'var(--text-muted)',
                  border: `1px solid ${activeCategory === cat ? '#C9A84C' : 'var(--border)'}`,
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-24" style={{ background: 'var(--surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <div key={image.id}
                className="rounded-2xl overflow-hidden cursor-pointer card-hover"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                onClick={() => setSelectedImage(image.id)}>
                <div className="w-full h-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(139,26,26,0.1))' }}>
                  {image.url ? (
                    <img src={image.url} alt={image.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12" style={{ color: 'rgba(201,168,76,0.25)' }} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>{image.title}</h3>
                  <p className="text-sm mb-2 leading-[1.8]" style={{ color: 'var(--text-muted)' }}>{image.description}</p>
                  <div className="flex items-center text-xs" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(image.uploadDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {images.length === 0 && (
            <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
              <ImageIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(201,168,76,0.25)' }} />
              <p>No photos yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && selectedImageData && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}>
          <div className="rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}>
            <div className="p-5 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-xl font-semibold font-serif" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
                {selectedImageData.title}
              </h2>
              <button onClick={() => setSelectedImage(null)} style={{ color: 'var(--text-muted)' }}
                className="hover:opacity-70 transition-opacity">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-5">
              <div className="w-full h-96 rounded-xl overflow-hidden mb-4" style={{ background: 'var(--surface-alt)' }}>
                {selectedImageData.url ? (
                  <img src={selectedImageData.url} alt={selectedImageData.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16" style={{ color: 'rgba(201,168,76,0.25)' }} />
                  </div>
                )}
              </div>
              <p className="mb-4 leading-[1.8]" style={{ color: 'var(--text-muted)' }}>{selectedImageData.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-sm" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                  Uploaded on {new Date(selectedImageData.uploadDate).toLocaleDateString()}
                </div>
                <button className="flex items-center font-semibold text-sm transition-opacity hover:opacity-70" style={{ color: '#C9A84C' }}>
                  <Download className="w-4 h-4 mr-2" />Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

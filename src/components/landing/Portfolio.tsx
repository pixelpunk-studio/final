import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";
import { X } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  type: "graphic" | "video";
  order: number;
}

// Normalizes Google Drive URLs for reliable embedding
function extractDriveFileId(url: string): string | null {
  try {
    const u = new URL(url);
    // Match /file/d/{id}/...
    const parts = u.pathname.split("/");
    const fileIndex = parts.indexOf("d");
    if (parts.includes("file") && fileIndex !== -1 && parts[fileIndex + 1]) {
      return parts[fileIndex + 1];
    }
    // Match id param
    const idParam = u.searchParams.get("id");
    if (idParam) return idParam;
    return null;
  } catch {
    return null;
  }
}

function isDriveUrl(url?: string): boolean {
  if (!url) return false;
  return /(^https?:\/\/)?(drive\.google\.com|docs\.google\.com)/i.test(url);
}

function driveThumbnailUrl(id: string, size: number = 1600): string {
  // Returns image/jpeg with no HTML wrapper
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
}

function driveUcViewUrl(id: string): string {
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

function driveLh3Url(id: string, size: number = 1600): string {
  // Undocumented but commonly used image CDN path
  return `https://lh3.googleusercontent.com/d/${id}=w${size}`;
}

function normalizeDriveImageUrl(url?: string): string | undefined {
  if (!url) return url;
  if (!isDriveUrl(url)) return url;
  const id = extractDriveFileId(url);
  return id ? driveThumbnailUrl(id) : url;
}

function handleDriveImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, originalUrl?: string) {
  const img = e.currentTarget;
  const attempt = Number(img.dataset.attempt || 0);
  const id = originalUrl ? extractDriveFileId(originalUrl) : null;
  if (!id) return;
  if (attempt === 0) {
    img.dataset.attempt = "1";
    img.src = driveUcViewUrl(id);
  } else if (attempt === 1) {
    img.dataset.attempt = "2";
    img.src = driveLh3Url(id);
  } else {
    // Give up after two fallbacks
    img.onerror = null;
  }
}

function normalizeDriveVideoIframeSrc(url?: string): string | undefined {
  if (!url) return url;
  if (!isDriveUrl(url)) return url;
  const id = extractDriveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : url;
}

export default function Portfolio() {
  const [graphics, setGraphics] = useState<PortfolioItem[]>([]);
  const [videos, setVideos] = useState<PortfolioItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const portfolioRef = ref(database, "portfolio");
    const unsubscribe = onValue(portfolioRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const portfolioArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        const graphicsData = portfolioArray
          .filter((item) => item.type === "graphic")
          .sort((a, b) => a.order - b.order)
          .slice(0, 3);

        const videosData = portfolioArray
          .filter((item) => item.type === "video")
          .sort((a, b) => a.order - b.order)
          .slice(0, 3);

        setGraphics(graphicsData);
        setVideos(videosData);
      }
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("work");
    if (element) observer.observe(element);

    return () => {
      unsubscribe();
      if (element) observer.unobserve(element);
    };
  }, []);

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  return (
    <>
      <section id="work" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className={`text-5xl md:text-6xl font-bold text-center mb-16 tracking-tight transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Our Work
          </h2>

          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 tracking-tight">Graphic Designs</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {graphics.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 hover:border-black transition-all duration-300 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                  aria-label={`View ${item.title}`}
                >
                  {!loadedImages.has(item.id) && (
                    <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                  )}
                  <img
                    src={normalizeDriveImageUrl(item.imageUrl)}
                    alt={item.title}
                    loading="lazy"
                    onLoad={() => handleImageLoad(item.id)}
                    onError={(e) => handleDriveImageError(e, item.imageUrl)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                    <p className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {item.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold mb-8 tracking-tight">Video Editing</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {videos.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative aspect-video rounded-2xl overflow-hidden border border-gray-200 hover:border-black transition-all duration-300 bg-gray-100 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                  aria-label={`Watch ${item.title}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
                    </div>
                  </div>
                  <p className="absolute bottom-4 left-4 text-white font-medium">{item.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
        >
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 text-white hover:opacity-60 transition-opacity"
            aria-label="Close modal"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {selectedItem.type === "graphic" ? (
              <img
                src={normalizeDriveImageUrl(selectedItem.imageUrl)}
                alt={selectedItem.title}
                onError={(e) => handleDriveImageError(e, selectedItem.imageUrl)}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            ) : isDriveUrl(selectedItem.videoUrl) ? (
              <iframe
                src={normalizeDriveVideoIframeSrc(selectedItem.videoUrl)}
                width="1280"
                height="720"
                allow="autoplay"
                allowFullScreen
                className="w-full h-auto max-h-[90vh]"
                title={selectedItem.title}
              />
            ) : (
              <video
                src={selectedItem.videoUrl}
                controls
                autoPlay
                className="w-full h-auto max-h-[90vh]"
                aria-label={selectedItem.title}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </>
  );
}

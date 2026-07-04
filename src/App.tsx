/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, memo, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, 
  X, 
  ArrowRight, 
  Sparkles, 
  MessageSquare, 
  MessageCircle,
  Video, 
  Instagram, 
  Youtube, 
  Zap,
  Volume2,
  VolumeX,
  Film,
  Target,
  Compass,
  Lightbulb,
  Eye,
  Play,
  Pause,
  Maximize2,
  ExternalLink,
  Terminal,
  Cpu,
  Layers,
  Sliders,
  Mail,
  Phone,
  ArrowUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download
} from "lucide-react";
import { portfolioData, Project } from "./portfolioData";

function getYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getProjectVideoSrc(url: string | undefined): string {
  if (!url) return "";
  const driveMatch = url.match(/(?:drive\.google\.com|docs\.google\.com|drive\.usercontent\.google\.com).*(?:id=|\/d\/)([a-zA-Z0-9_-]{25,50})/i);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `/api/video-proxy?id=${fileId}`;
  }
  return url;
}

function resolveAssetUrl(url: string | undefined): string {
  if (!url) return "";

  // Support Google Drive image URLs directly by routing them through our virus-bypass server-side proxy
  const driveMatch = url.match(/(?:drive\.google\.com|docs\.google\.com|drive\.usercontent\.google\.com).*(?:id=|\/d\/)([a-zA-Z0-9_-]{25,50})/i);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `/api/video-proxy?id=${fileId}&type=image`;
  }

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;

  // Since we run in a custom Express server container on Cloud Run,
  // assets are always served relative to the root '/' path.
  return "/" + cleanUrl;
}

interface ScrollRevealProps {
  children: any;
  delay?: number;
  className?: string;
  style?: any;
  key?: string | number;
}

function ScrollReveal({ children, delay = 0, className = "", style = {} }: ScrollRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Backup timer to guarantee items are shown even if IntersectionObserver fails to trigger in nested iframe/container environments
    const backupTimer = setTimeout(() => {
      setIsRevealed(true);
    }, 150 + delay);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(entry.target);
          clearTimeout(backupTimer);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      clearTimeout(backupTimer);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? "scale(1) translateY(0)" : "scale(0.96) translateY(30px)",
        transition: isRevealed
          ? `opacity 180ms cubic-bezier(0.175, 0.885, 0.32, 1.25) ${delay}ms, transform 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}ms`
          : "none",
        willChange: "transform, opacity",
        ...style
      }}
    >
      {children}
    </div>
  );
}

function getReelVideoSource(url: string, startTime?: number) {
  if (!url) return { type: "video" as const, src: "" };

  // Google Drive detection (extracts file ID and converts to our custom server-side proxy URL)
  const driveMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{25,50})/i);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return {
      type: "google-drive" as const,
      src: `/api/video-proxy?id=${fileId}`
    };
  }

  // YouTube detection (including Shorts)
  const shortsMatch = url.match(/shorts\/([^"&?\/\s]{11})/i);
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  const videoId = (shortsMatch && shortsMatch[1]) || (ytMatch && ytMatch[1]);
  if (videoId) {
    const startSec = startTime || 10;
    return {
      type: "youtube" as const,
      src: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&iv_load_policy=3&rel=0&showinfo=0&disablekb=1&playsinline=1&start=${startSec}&vq=hd1080&enablejsapi=1`,
      videoId: videoId
    };
  }

  // Vimeo detection (excluding direct mp4 links)
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/i);
  const isDirectMp4 = url.includes(".mp4");
  if (vimeoMatch && !isDirectMp4) {
    const videoId = vimeoMatch[3];
    return {
      type: "vimeo" as const,
      src: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1&controls=0`
    };
  }

  return { type: "video" as const, src: url };
}

interface TikTokSlideProps {
  key?: string | number;
  reel: any;
  isActive: boolean;
  isPreload: boolean;
  onTimeout: () => void;
  index: number;
}

const TikTokSlide = memo(function TikTokSlide({ reel, isActive, isPreload, onTimeout, index }: TikTokSlideProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes);

  // Check if the video is a YouTube Short inside TikTokSlide loading logic
  const isYouTubeShort = useMemo(() => {
    return reel.videoUrl && (reel.videoUrl.includes("shorts/") || reel.videoUrl.includes("/shorts"));
  }, [reel.videoUrl]);

  const source = useMemo(() => {
    if (isYouTubeShort) {
      const match = reel.videoUrl.match(/shorts\/([^"&?\/\s]{11})/i);
      const videoId = match ? match[1] : getYouTubeId(reel.videoUrl);
      if (videoId) {
        const startSec = reel.startTime || 0;
        return {
          type: "youtube" as const,
          src: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&iv_load_policy=3&rel=0&showinfo=0&disablekb=1&playsinline=1&start=${startSec}&vq=hd1080&enablejsapi=1`,
          videoId: videoId
        };
      }
    }
    return getReelVideoSource(reel.videoUrl, reel.startTime);
  }, [reel.videoUrl, reel.startTime, isYouTubeShort]);

  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false);
  const [loadYoutube, setLoadYoutube] = useState(false);

  // Reset error & loading states on active slide or URL change, and delay heavy iframe render
  useEffect(() => {
    if (isActive) {
      setHasError(false);
      setIsLoading(true);
      setIsPaused(false);
      
      // Delay rendering the iframe to ensure smooth transition
      const timer = setTimeout(() => {
        setShouldRenderIframe(true);
      }, 450);
      return () => clearTimeout(timer);
    } else {
      setShouldRenderIframe(false);
      setIsIframeLoaded(false);
      setLoadYoutube(false);
    }
  }, [isActive, reel.videoUrl]);

  // Listen for messages from YouTube Player API to know exactly when the video starts playing (playerState === 1)
  useEffect(() => {
    if (!isActive || !shouldRenderIframe) return;

    const handleMessage = (event: MessageEvent) => {
      // Check if the message is from YouTube domain
      if (!event.origin.includes("youtube.com")) return;
      try {
        const data = JSON.parse(event.data);
        if (data.event === "infoDelivery" && data.info && typeof data.info.playerState !== "undefined") {
          const state = data.info.playerState;
          if (state === 1) { // 1 = PLAYING
            setIsIframeLoaded(true);
            setIsLoading(false);
          }
        }
      } catch (e) {
        // Safe to ignore non-JSON messages or parsing errors
      }
    };

    window.addEventListener("message", handleMessage);

    // Fallback safety timeout of 3.5s to display the video if API is blocked or message isn't received
    const fallbackTimer = setTimeout(() => {
      setIsIframeLoaded(true);
      setIsLoading(false);
    }, 3500);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(fallbackTimer);
    };
  }, [isActive, shouldRenderIframe]);

  // Keep a stable ref of onTimeout to prevent parent re-renders from restarting the 4-second scroll timer
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  // Always run the 5-second auto-scroll timer when slide becomes active
  useEffect(() => {
    let timer: any;

    if (isActive) {
      timer = setTimeout(() => {
        onTimeoutRef.current();
      }, 5000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isActive]);

  // Handle play/pause and middle seek of the local HTML5 video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      const setStartToMiddle = () => {
        if (video.duration) {
          video.currentTime = video.duration / 2;
        } else {
          video.currentTime = 5; // fallback
        }
      };

      if (video.readyState >= 1) {
        setStartToMiddle();
      } else {
        video.onloadedmetadata = () => {
          setStartToMiddle();
        };
      }

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("Autoplay failed or was interrupted:", err);
        });
      }
    } else {
      video.pause();
    }
  }, [isActive]);

  // Only load the source when the slide is marked for preloading to prevent network choke
  const smoothVideoSrc = isPreload ? reel.fallbackUrl : undefined;

  const handleLikeClick = () => {
    if (isLiked) {
      setLikesCount(reel.likes);
      setIsLiked(false);
    } else {
      setIsLiked(true);
      if (reel.likes.endsWith("K")) {
        const num = parseFloat(reel.likes) + 0.1;
        setLikesCount(num.toFixed(1) + "K");
      } else {
        setLikesCount((parseInt(reel.likes) + 1).toString());
      }
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play()
        .then(() => setIsPaused(false))
        .catch((err) => console.log("Play failed:", err));
    } else {
      video.pause();
      setIsPaused(true);
    }
  };

  return (
    <div 
      data-index={index}
      className="relative w-full h-full flex-shrink-0 snap-start overflow-hidden flex flex-col justify-between select-none" 
      style={{ height: "100%" }}
    >
      {/* Video / Google Drive Proxy stream */}
      {loadYoutube ? (
        source.type === "youtube" ? (
          <div className="absolute inset-0 bg-black">
            {/* HD cover image is rendered on top in z-20 and fades out when iframe loads */}
            <img 
              src={`https://img.youtube.com/vi/${(source as any).videoId}/hqdefault.jpg`}
              className={`absolute inset-0 w-full h-full object-cover brightness-[1.06] contrast-[1.04] saturate-[1.04] transition-opacity duration-500 select-none pointer-events-none ${
                isActive && isIframeLoaded ? "opacity-0 pointer-events-none z-0" : "opacity-100 z-20"
              }`}
              alt="Reel cover"
            />
            {shouldRenderIframe && (
              <iframe
                src={source.src || undefined}
                className="absolute w-[183%] h-[150%] left-[-41.5%] top-[-25%] select-none pointer-events-none brightness-[1.06] contrast-[1.04] saturate-[1.04] shadow-2xl z-10"
                allow="autoplay; encrypted-media; picture-in-picture"
                style={{ border: 0 }}
              />
            )}
          </div>
        ) : source.type === "vimeo" ? (
          <div className="absolute inset-0 bg-black">
            {shouldRenderIframe && (
              <iframe
                src={source.src || undefined}
                onLoad={() => {
                  setTimeout(() => {
                    setIsIframeLoaded(true);
                  }, 300);
                }}
                className="absolute w-[183%] h-[150%] left-[-41.5%] top-[-25%] select-none pointer-events-none brightness-110 shadow-2xl z-10"
                allow="autoplay; fullscreen; picture-in-picture"
                style={{ border: 0 }}
              />
            )}
          </div>
        ) : (
          <div className="absolute inset-0 bg-black" />
        )
      ) : (
        // Play the native high-performance, GPU-accelerated video fallback by default!
        smoothVideoSrc ? (
          <div className="absolute inset-0 bg-black">
            <video
              ref={videoRef}
              src={smoothVideoSrc}
              loop
              muted
              playsInline
              preload="auto"
              onPlay={() => setIsPaused(false)}
              onPause={() => setIsPaused(true)}
              onLoadStart={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              onPlaying={() => setIsLoading(false)}
              onWaiting={() => setIsLoading(true)}
              className="absolute inset-0 w-full h-full object-cover select-none brightness-110"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-black" />
        )
      )}

      {/* Interactive Overlay to Load YouTube Player on Demand (Buttery-smooth by default) */}
      {!loadYoutube && isActive && (
        <div className="absolute inset-x-0 bottom-32 flex flex-col items-center gap-2.5 px-4 z-[25] pointer-events-none">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLoadYoutube(true);
            }}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 bg-[#FF3B3F] hover:bg-neutral-900 text-white text-[11px] font-black tracking-widest uppercase rounded-full shadow-[0_4px_14px_rgba(255,59,63,0.4)] border border-[#FF3B3F]/30 hover:border-white/10 transition-all duration-300 active:scale-95 animate-bounce flex-shrink-0"
            style={{ animationDuration: '3s' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
            <span>Guarda su YouTube 🎬</span>
          </button>
          
          <a
            href={reel.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto text-[10px] font-bold text-white/90 hover:text-[#FF3B3F] bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5 transition-all duration-200 tracking-wider uppercase"
          >
            Apri originale ↗
          </a>
        </div>
      )}

      {/* 1. Subtle dark vignette gradient overlay at bottom for maximum readability */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none z-20" />

      {/* 2. Top header overlay inside the phone screen (e.g. "Per te", "Seguiti") */}
      <div className="absolute top-12 left-0 right-0 flex justify-center gap-4 text-white/60 font-bold text-[11px] tracking-wider z-20 pointer-events-none">
        <span className="text-white border-b-2 border-[#FF3B3F] pb-1 cursor-pointer pointer-events-auto">Per te</span>
        <span className="cursor-pointer hover:text-white pointer-events-auto transition-colors duration-200">Seguiti</span>
      </div>

      {/* 3. Right Sidebar Controls (Heart/Like, Comments, Share, Music Disc) */}
      <div className="absolute right-3.5 bottom-20 flex flex-col items-center gap-5 z-30">
        {/* Profile Avatar */}
        <div className="relative mb-2">
          <div className="w-9 h-9 rounded-full border border-white/40 bg-[#FF3B3F] overflow-hidden flex items-center justify-center shadow-lg">
            <span className="text-xs font-black text-white font-mono">JC</span>
          </div>
          <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FF3B3F] hover:bg-[#ff1e22] text-white flex items-center justify-center text-[10px] font-extrabold shadow-lg transition-transform duration-200 hover:scale-110">
            +
          </button>
        </div>

        {/* Like Button */}
        <button 
          onClick={handleLikeClick}
          className="flex flex-col items-center group cursor-pointer focus:outline-none"
        >
          <div className={`w-10 h-10 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-md border border-white/5 transition-all duration-200 ${
            isLiked ? "scale-110 bg-[#FF3B3F]/20 border-[#FF3B3F]/30" : "hover:scale-105 active:scale-95"
          }`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill={isLiked ? "#FF3B3F" : "none"} 
              stroke={isLiked ? "#FF3B3F" : "#ffffff"} 
              strokeWidth="2.5" 
              className="w-5 h-5 transition-transform duration-200"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-white mt-1 drop-shadow-md select-none">{likesCount}</span>
        </button>

        {/* Comments Button */}
        <button className="flex flex-col items-center group cursor-pointer focus:outline-none">
          <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-md border border-white/5 hover:scale-105 active:scale-95 transition-transform">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2.5" 
              className="w-5 h-5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-white mt-1 drop-shadow-md select-none">{reel.comments || "420"}</span>
        </button>

        {/* Share Button */}
        <button className="flex flex-col items-center group cursor-pointer focus:outline-none">
          <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-md border border-white/5 hover:scale-105 active:scale-95 transition-transform">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="2.5" 
              className="w-5 h-5 translate-x-[1px]"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" x2="12" y1="2" y2="15" />
            </svg>
          </div>
          <span className="text-[10px] font-black text-white mt-1 drop-shadow-md select-none">Share</span>
        </button>

        {/* Spinning Music Disc */}
        <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center border-2 border-white/20 animate-[spin_4s_linear_infinite] mt-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-neutral-700 via-neutral-950 to-neutral-700 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B3F]" />
          </div>
        </div>
      </div>

      {/* 4. Left/Bottom Info (Username, Caption, Tags) */}
      <div className="absolute left-3.5 right-16 bottom-5 z-20 text-white flex flex-col gap-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm tracking-wide text-white hover:underline cursor-pointer select-none">{reel.username || "@josue.cais"}</span>
          <span className="px-1.5 py-0.5 bg-white/20 text-[9px] uppercase font-bold tracking-widest rounded-none select-none">Creator</span>
        </div>
        <p className="text-[11px] leading-relaxed text-white/95 line-clamp-3 font-normal select-none">
          {reel.caption}
        </p>
        <span className="text-[10px] font-bold text-[#FF3B3F] hover:underline cursor-pointer tracking-wider select-none">
          {reel.tags}
        </span>
        
        {/* Dynamic audio title line at bottom */}
        <div className="flex items-center gap-1.5 text-[10px] text-white/70 mt-1 overflow-hidden w-full">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            className="w-3.5 h-3.5 animate-pulse shrink-0"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <div className="whitespace-nowrap overflow-hidden text-ellipsis flex-1">
            <span className="inline-block animate-[pulse_2s_infinite]">
              Suono originale - {reel.username || "@josue.cais"}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Custom subtle loading spinner centered */}
      {isLoading && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-10 pointer-events-none">
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-white/10 border-t-[#FF3B3F] animate-spin" />
            <span className="absolute text-[8px] font-black text-white font-mono tracking-widest uppercase mt-0.5">ITS</span>
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.isPreload === nextProps.isPreload &&
    prevProps.index === nextProps.index &&
    prevProps.reel.id === nextProps.reel.id
  );
});

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  
  // Custom owner WhatsApp number set directly to +39 3454690373 as requested
  const phoneNumber = "393454690373";
  
  // Interactive state for preview modals
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalVideoMuted, setModalVideoMuted] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      setModalVideoMuted(false);
      setActiveSlideIndex(0);
      setIsLightboxOpen(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject || isOpen || isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProject, isOpen, isLightboxOpen]);

  const renderDescriptionWithLinks = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, lineIdx) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = line.split(urlRegex);
      return (
        <span key={lineIdx} className="block mb-1.5 last:mb-0">
          {parts.map((part, partIdx) => {
            if (urlRegex.test(part)) {
              let cleanUrl = part;
              if (part.endsWith('.') || part.endsWith(',') || part.endsWith(')')) {
                cleanUrl = part.slice(0, -1);
              }
              return (
                <a
                  key={partIdx}
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF3B3F] hover:underline hover:text-[#FF3B3F]/80 break-all inline-flex items-center gap-1 font-bold bg-[#FF3B3F]/10 px-2 py-0.5 border border-[#FF3B3F]/25 my-0.5 transition-colors duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  📂 Vedi Brief su Google Drive ↗
                </a>
              );
            }
            return part;
          })}
        </span>
      );
    });
  };

  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"Tutti" | "Grafica" | "Multimediale" | "AI Tech" | "Social">("Tutti");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);

  const filteredProjects = activeFilter === "Tutti"
    ? portfolioData.projects
    : portfolioData.projects.filter(p => p.category === activeFilter);

  // Simulated timeline state for Box 1's interactive fast-forward preview
  const [mockFrame, setMockFrame] = useState(1);
  const [mockSpeed, setMockSpeed] = useState("1.0x PLAY");
  
  useEffect(() => {
    let interval: any;
    if (activeHoverId === "progetto-social") {
      setMockSpeed("3.0x FF >>");
      interval = setInterval(() => {
        setMockFrame((prev) => (prev >= 450 ? 1 : prev + 18));
      }, 60);
    } else {
      setMockSpeed("1.0x PLAY");
      interval = setInterval(() => {
        setMockFrame((prev) => (prev >= 450 ? 1 : prev + 1));
      }, 120);
    }
    return () => {
      clearInterval(interval);
    };
  }, [activeHoverId]);

  // Video URLs mapped for direct elite cinematic visual feedback on hover/modal
  const projectVideos: Record<string, string> = {
    "progetto-social": "https://assets.mixkit.co/videos/preview/mixkit-holding-a-smartphone-showing-a-social-media-feed-41566-large.mp4",
    "progetto-ai-assets": "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-his-laptop-and-smartphone-41589-large.mp4",
    "progetto-relaunch": "https://assets.mixkit.co/videos/preview/mixkit-digital-marketing-specialist-working-on-her-laptop-42345-large.mp4"
  };

  // Cover image placeholders (gorgeous high quality cinematic gradients / photos patterns)
  const projectCovers: Record<string, string> = {
    "progetto-social": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    "progetto-ai-assets": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    "progetto-relaunch": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800"
  };

  // Scroll detection for sticky premium header and back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { hero, about, philosophy, contacts } = portfolioData;

  // Automatic slow auto-scroll (every 4.5s) to the right for the Chi Sono photo carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev === about.photos.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(timer);
  }, [about.photos.length]);

  const phoneContainerRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<any>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleSlideTimeout = (index: number) => {
    if (index !== currentReelIndex) return;
    const nextIndex = (currentReelIndex + 1) % portfolioData.reels.length;
    scrollToSlide(nextIndex);
  };

  const scrollToSlide = (index: number) => {
    if (!phoneContainerRef.current) return;
    const container = phoneContainerRef.current;
    const itemHeight = container.clientHeight;
    
    isProgrammaticScrollRef.current = true;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Temporarily disable CSS Scroll Snapping to prevent stuttering/fighting during programmatic scroll
    container.style.scrollSnapType = "none";
    
    container.scrollTo({
      top: index * itemHeight,
      behavior: "smooth"
    });

    // Update the active index ONLY after the smooth scroll has finished to prevent lag during the scroll transition!
    const activeIndexTimer = setTimeout(() => {
      setCurrentReelIndex(index);
    }, 780);

    // Re-enable snapping and release programmatic scroll lock once scroll finishes (approx 850ms)
    const releaseTimer = setTimeout(() => {
      if (phoneContainerRef.current) {
        phoneContainerRef.current.style.scrollSnapType = "y mandatory";
      }
      isProgrammaticScrollRef.current = false;
    }, 850);
  };

  // Track active slide using Intersection Observer for ultra-smooth scrolling without layout thrashing
  useEffect(() => {
    const container = phoneContainerRef.current;
    if (!container) return;

    const observerOptions = {
      root: container,
      rootMargin: "0px",
      threshold: 0.51, // Target when more than half of the slide is visible
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (isProgrammaticScrollRef.current) return;
      
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const indexAttr = entry.target.getAttribute("data-index");
          if (indexAttr !== null) {
            const index = parseInt(indexAttr, 10);
            setCurrentReelIndex(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Observe each child element of the scroll container
    const children = container.children;
    Array.from(children).forEach((child: any) => observer.observe(child));

    return () => {
      observer.disconnect();
    };
  }, [portfolioData.reels.length]);


  const heroRef = useRef<HTMLDivElement>(null);



  return (
    <div className="bg-[#F4F3F0] text-[#0F0F10] font-sans selection:bg-[#FF3B3F] selection:text-white min-h-screen relative overflow-hidden">
      
      {/* 1. PREMIUM SWISS MINIMALIST NAVBAR */}
      <nav 
        id="navbar-root"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          scrolled 
            ? "bg-[#F4F3F0]/90 backdrop-blur-xl border-[#0F0F10]/10 py-3 shadow-[0_10px_35px_-10px_rgba(0,0,0,0.05)]" 
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Logo Brand left */}
          <a 
            id="brand-logo"
            href="#hero" 
            className="group flex items-center gap-2 text-lg font-bold tracking-[0.25em] text-[#0F0F10] hover:text-[#FF3B3F] transition-colors duration-300 font-display"
          >
            <span>JOSUE CAISACHANA</span>
          </a>

          {/* Desktop Center Menu Links */}
          <div id="desktop-menu" className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest font-bold text-[#0F0F10]/75">
            <a href="#about" className="hover:text-[#FF3B3F] transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#FF3B3F] hover:after:w-full after:transition-all after:duration-300">Chi Sono</a>
            <a href="#portfolio" className="hover:text-[#FF3B3F] transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#FF3B3F] hover:after:w-full after:transition-all after:duration-300">Lavori</a>
            <a href="#philosophy" className="hover:text-[#FF3B3F] transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#FF3B3F] hover:after:w-full after:transition-all after:duration-300">Filosofia</a>
            <a href="#contacts" className="hover:text-[#FF3B3F] transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#FF3B3F] hover:after:w-full after:transition-all after:duration-300">Contatti</a>
          </div>

          {/* Right Action Button Call */}
          <div className="hidden md:flex items-center gap-3">
            <a 
              id="cta-whatsapp-nav"
              href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(contacts.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative px-4 py-2 overflow-hidden group rounded-none border border-[#0F0F10]/15 transition-all duration-300 hover:border-[#FF3B3F] bg-[#0F0F10]/[0.02]"
            >
              <div className="absolute inset-0 bg-[#FF3B3F]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center gap-2 text-xs uppercase tracking-widest text-[#0F0F10] group-hover:text-black transition-colors duration-300 font-semibold font-mono">
                <MessageCircle className="w-4 h-4 text-green-500 transition-transform group-hover:scale-110" />
                <span>WhatsApp</span>
              </div>
            </a>
            <a 
              id="cta-email-nav"
              href={`mailto:${contacts.email}`}
              className="relative px-4 py-2 overflow-hidden group rounded-none border border-[#0F0F10]/15 transition-all duration-300 hover:border-[#D90429] bg-[#0F0F10]/[0.02]"
            >
              <div className="absolute inset-0 bg-[#D90429]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center gap-2 text-xs uppercase tracking-widest text-[#0F0F10] group-hover:text-black transition-colors duration-300 font-semibold font-mono">
                <Mail className="w-4 h-4 text-[#D90429] transition-transform group-hover:scale-110" />
                <span>Email</span>
              </div>
            </a>

            <a 
              id="cta-cv-download-nav"
              href="/api/video-proxy?id=1sCegLRbbl3nvFEqdJrOAJ36tElIRor64&download=true"
              className="relative px-4 py-2 overflow-hidden group rounded-none border border-[#0F0F10]/15 transition-all duration-300 hover:border-blue-500 bg-[#0F0F10]/[0.02]"
            >
              <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center gap-2 text-xs uppercase tracking-widest text-[#0F0F10] group-hover:text-black transition-colors duration-300 font-semibold font-mono">
                <Download className="w-4 h-4 text-blue-500 transition-transform group-hover:scale-110" />
                <span>Scarica CV</span>
              </div>
            </a>
          </div>

          {/* Mobile Hamburguer trigger */}
          <button 
            id="mobile-menu-trigger"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[#0F0F10] hover:text-[#FF3B3F] p-2 transition-colors duration-200"
            aria-label="Toggle MENU"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Fullscreen Overlay Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              id="mobile-navigation-overlay"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 top-[60px] bg-[#F4F3F0] z-40 flex flex-col justify-between p-8 border-t border-[#0F0F10]/10 md:hidden"
            >
              <div className="flex flex-col gap-6 text-xl uppercase tracking-widest font-bold pt-6">
                <a 
                  href="#about" 
                  onClick={() => setIsOpen(false)}
                  className="hover:text-[#FF3B3F] text-[#0F0F10] transition-colors duration-300 py-3 border-b border-[#0F0F10]/5"
                >
                  Chi Sono
                </a>
                <a 
                  href="#portfolio" 
                  onClick={() => setIsOpen(false)}
                  className="hover:text-[#FF3B3F] text-[#0F0F10] transition-colors duration-300 py-3 border-b border-[#0F0F10]/5"
                >
                  Lavori
                </a>
                <a 
                  href="#philosophy" 
                  onClick={() => setIsOpen(false)}
                  className="hover:text-[#FF3B3F] text-[#0F0F10] transition-colors duration-300 py-3 border-b border-[#0F0F10]/5"
                >
                  Filosofia
                </a>
                <a 
                  href="#contacts" 
                  onClick={() => setIsOpen(false)}
                  className="hover:text-[#FF3B3F] text-[#0F0F10] transition-colors duration-300 py-3 border-b border-[#0F0F10]/5"
                >
                  Contatti
                </a>
              </div>

              <div className="flex flex-col gap-4 pb-12">
                <a 
                  href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(contacts.whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-4 rounded-none bg-[#FF3B3F] hover:bg-[#FF3B3F]/90 text-white font-bold tracking-widest text-sm uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-[4px_4px_0px_#0F0F10]"
                >
                  <MessageCircle className="w-5 h-5 text-green-400 font-bold animate-pulse" />
                  <span>WhatsApp - PARLIAMO</span>
                </a>
                <a 
                  href={`mailto:${contacts.email}`}
                  className="w-full text-center py-4 rounded-none bg-[#0F0F10] hover:bg-[#D90429] text-white font-bold tracking-widest text-sm uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-[4px_4px_0px_#0F0F10]"
                >
                  <Mail className="w-5 h-5 text-red-500" />
                  <span>EMAIL - SCRIVIMI</span>
                </a>

                <a 
                  href="/api/video-proxy?id=1sCegLRbbl3nvFEqdJrOAJ36tElIRor64&download=true"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-4 rounded-none bg-blue-500 hover:bg-blue-600 text-white font-bold tracking-widest text-sm uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-[4px_4px_0px_#0F0F10]"
                >
                  <Download className="w-5 h-5 text-white" />
                  <span>SCARICA CURRICULUM 📥</span>
                </a>
                <p className="text-center text-xs text-gray-500 font-mono mt-2">
                  Josue Caisachana © 2026 • Milano
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. SWISS MODERNIST HERO POSTER */}
      <section 
        id="hero"
        ref={heroRef}
        className="relative min-h-screen w-full flex flex-col justify-center pt-28 pb-16 bg-[#F4F3F0] overflow-hidden"
      >
        {/* Subtle background technical grid line and architectural feeling */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none">
          <div className="w-full h-full" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        {/* Ambient video controllers (Mute button & subtle indicators) */}
        <div className="absolute bottom-6 right-6 md:right-12 z-20 flex items-center gap-6">
          <p className="text-[10px] text-[#0F0F10]/40 font-mono tracking-widest hidden sm:block font-bold">STATUS // ACTIVE STAGE WORKOUT</p>
          <div className="h-1 w-8 bg-[#0F0F10]/15" />
        </div>

        {/* Hero content aligned in spacious container - Centered premium layout */}
        <div className="w-full max-w-5xl mx-auto px-6 md:px-12 z-10 py-6 relative flex flex-col justify-center items-center min-h-[80vh]">
          <div className="flex flex-col items-center justify-center text-center w-full relative">
            
            {/* THE TYPOGRAPHIC POSTER & Strategic copy */}
            <div className="w-full max-w-3xl flex flex-col justify-center text-center relative">
              
              {/* STAGE POSTER COMPOSITION: Precise extraction of the Moodboard */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full border-2 border-[#0F0F10] bg-white p-4 sm:p-10 mb-8 overflow-hidden shadow-[8px_8px_0px_#0F0F10] group/poster"
              >
                
                {/* Poster Corner Technical Labels - EXACT MATCH to Moodboard structure */}
                <div className="flex justify-between items-start text-[9px] font-mono text-[#0F0F10]/60 uppercase tracking-widest border-b border-[#0F0F10]/10 pb-4 mb-4">
                  <div className="flex flex-col text-left">
                    <span className="text-[#0F0F10]/40">Presented By:</span>
                    <span className="font-bold text-[#0F0F10]">Josue Caisachana</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[#0F0F10]/40">Type of Presentation:</span>
                    <span className="font-bold text-[#0F0F10]">Personal Presentation</span>
                  </div>
                </div>

                {/* Giant Typographic Overlap Layout */}
                <div className="relative py-4 flex flex-col justify-center items-center select-none h-[150px] sm:h-[190px] w-full px-2 sm:px-6">
                  {/* Huge Crimson Background Layer text from the moodboard */}
                  <h2 className="absolute text-[11vw] sm:text-[7.8vw] lg:text-[6.5vw] font-black font-display text-[#FF3B3F] tracking-tighter leading-none uppercase opacity-95 transition-transform duration-700 group-hover/poster:scale-102">
                    DIGITAL
                  </h2>
                  
                  {/* Heavy Matte Black Overlay text on top */}
                  <h3 className="relative z-10 text-[4.8vw] sm:text-[3.2vw] lg:text-[2.5vw] font-black font-syne text-[#0F0F10] tracking-tight leading-none uppercase text-center">
                    MARKETING PORTFOLIO
                  </h3>
                </div>

                {/* Poster Bottom Technical Labels - EXACT MATCH to Moodboard structure */}
                <div className="flex justify-between items-end text-[9px] font-mono text-[#0F0F10]/60 uppercase tracking-widest border-t border-[#0F0F10]/10 pt-4 mt-4">
                  <div className="flex flex-col text-left">
                    <span className="text-[#0F0F10]/40">Name of Project:</span>
                    <span className="font-bold text-[#0F0F10]">Digital Marketing Portfolio</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-[#0F0F10]/40">Project Stage:</span>
                    <span className="font-bold text-[#FF3B3F] animate-pulse">2026 // MILANO</span>
                  </div>
                </div>

                {/* Background scanning laser effect for modern visual flair */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF3B3F]/5 to-transparent -translate-x-full group-hover/poster:translate-x-full transition-transform duration-1000 pointer-events-none" />
              </motion.div>

              {/* Tag Line */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="flex items-center justify-center gap-3 mb-4"
              >
                <span className="h-[2px] w-6 bg-[#FF3B3F]" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#FF3B3F] font-bold">
                  {hero.tagline}
                </span>
                <span className="inline-block w-1.5 h-1.5 bg-[#FF3B3F] rounded-full animate-ping" />
              </motion.div>

              {/* Subtitle / Bio summary removed per request */}

              {/* Action CTAs - Bold, structural block buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.9 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 flex-wrap"
              >
                <a 
                  id="hero-cta-primary"
                  href="#portfolio"
                  className="group relative px-6 py-4 bg-[#FF3B3F] hover:bg-[#0F0F10] text-white font-extrabold tracking-widest text-[11px] uppercase cursor-pointer rounded-none border-2 border-black transition-all duration-300 shadow-[4px_4px_0px_#0F0F10] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] text-center"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <span>{hero.ctaPrimary}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </span>
                </a>

                <a 
                  id="hero-cta-secondary"
                  href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(contacts.whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-6 py-4 bg-white hover:bg-[#FF3B3F]/5 text-[#0F0F10] hover:text-[#FF3B3F] font-extrabold tracking-widest text-[11px] uppercase border-2 border-black rounded-none shadow-[4px_4px_0px_#0F0F10] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] text-center transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 text-green-500 font-bold" />
                    <span>{hero.ctaSecondary}</span>
                  </span>
                </a>

                <a 
                  id="hero-cta-email"
                  href={`mailto:${contacts.email}`}
                  className="group px-6 py-4 bg-white hover:bg-[#D90429]/5 text-[#0F0F10] hover:text-[#D90429] font-extrabold tracking-widest text-[11px] uppercase border-2 border-black rounded-none shadow-[4px_4px_0px_#0F0F10] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] text-center transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Mail className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 text-[#D90429]" />
                    <span>Invia un'Email</span>
                  </span>
                </a>

                <a 
                  id="hero-cta-cv-download"
                  href="/api/video-proxy?id=1sCegLRbbl3nvFEqdJrOAJ36tElIRor64&download=true"
                  className="group px-6 py-4 bg-white hover:bg-blue-500/5 text-[#0F0F10] hover:text-blue-600 font-extrabold tracking-widest text-[11px] uppercase border-2 border-black rounded-none shadow-[4px_4px_0px_#0F0F10] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] text-center transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Download className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 text-blue-500" />
                    <span>Scarica CV 📥</span>
                  </span>
                </a>
              </motion.div>
            </div>

          </div>
        </div>

        {/* Ambient scrolling arrow at center bottom */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 hidden md:block">
          <motion.div 
            id="hero-scroll-indicator"
            className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity cursor-pointer text-[#0F0F10]"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            onClick={() => {
              const el = document.getElementById("about");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase">SCROLL</span>
            <div className="w-[1px] h-10 bg-gradient-to-b from-[#0F0F10] to-transparent mt-1" />
          </motion.div>
        </div>
      </section>

      {/* 3. SEZIONE 'CHI SONO' (Autentica e Asimmetrica) */}
      <section 
        id="about" 
        className="py-24 sm:py-32 bg-[#F4F3F0] relative z-10 border-t border-[#0F0F10]/10 overflow-hidden"
      >
        {/* Subtle background ambient graphic */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#FF3B3F]/5 rounded-full filter blur-[120px] pointer-events-none -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-neutral-900/[0.02] rounded-full filter blur-[150px] pointer-events-none translate-x-1/2" />
 
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Colonna Sinistra: Storytelling text */}
            <motion.div 
              className="lg:col-span-7 xl:col-span-5 flex flex-col justify-start"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#FF3B3F] font-mono text-xs font-bold tracking-[0.3em]">01 / CHI SONO</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3F]" />
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight text-[#0F0F10] mb-6 uppercase">
                {about.title}
              </h2>
              
              {/* Location Tag */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-[#0F0F10]/5 border border-[#0F0F10]/10 text-[#0F0F10] rounded-none">
                  21 ANNI
                </span>
                <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-[#FF3B3F]/10 border border-[#FF3B3F]/20 text-[#FF3B3F] rounded-none">
                  RHO (MILANO)
                </span>
              </div>
 
              {/* Story paragraphs */}
              <div className="space-y-6 text-[#0F0F10]/80 leading-relaxed text-sm sm:text-base font-medium">
                {about.paragraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </motion.div>

            {/* Colonna Centrale: Foto Carousel Zone */}
            <motion.div
              className="lg:col-span-5 xl:col-span-3 flex flex-col justify-start w-full relative z-20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              {/* Viewfinder-style interactive polaroid picture deck */}
              <div className="relative bg-white border border-[#0F0F10]/15 p-4 shadow-md transition-shadow hover:shadow-xl rounded-none group overflow-hidden">
                {/* Micro viewfinder corner brackets */}
                <div className="absolute top-2 left-2 border-t-2 border-l-2 border-[#0F0F10]/20 w-3 h-3 pointer-events-none group-hover:border-[#FF3B3F] transition-colors duration-300" />
                <div className="absolute top-2 right-2 border-t-2 border-r-2 border-[#0F0F10]/20 w-3 h-3 pointer-events-none group-hover:border-[#FF3B3F] transition-colors duration-300" />
                <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-[#0F0F10]/20 w-3 h-3 pointer-events-none group-hover:border-[#FF3B3F] transition-colors duration-300" />
                <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-[#0F0F10]/20 w-3 h-3 pointer-events-none group-hover:border-[#FF3B3F] transition-colors duration-300" />

                {/* Info strip overlay */}
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#0F0F10]/5 bg-[#F4F3F0] font-mono text-[8px] text-[#0F0F10]/60 uppercase tracking-widest mb-3 select-none">
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
                    <span>REC MODE: ACTIVE</span>
                  </div>
                  <span>CAM_{currentPhotoIndex + 1}</span>
                </div>

                {/* Core Photo Viewport */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#121212] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentPhotoIndex}
                      src={resolveAssetUrl(about.photos[currentPhotoIndex].url) || undefined}
                      alt={about.photos[currentPhotoIndex].caption}
                      referrerPolicy="no-referrer"
                      initial={{ opacity: 0.2, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0.2, scale: 1.02 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="w-full h-full object-cover select-none"
                    />
                  </AnimatePresence>

                  {/* Absolute subtle shadow gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Navigation overlay arrow buttons */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPhotoIndex((prev) => (prev === 0 ? about.photos.length - 1 : prev - 1));
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white hover:bg-[#FF3B3F] text-black hover:text-white border border-[#0F0F10]/10 shadow-md transition-all duration-300 opacity-60 lg:opacity-0 lg:group-hover:opacity-100 z-10"
                    aria-label="Foto precedente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPhotoIndex((prev) => (prev === about.photos.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white hover:bg-[#FF3B3F] text-black hover:text-white border border-[#0F0F10]/10 shadow-md transition-all duration-300 opacity-60 lg:opacity-0 lg:group-hover:opacity-100 z-10"
                    aria-label="Prossima foto"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Small watermark inside frame */}
                  <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 text-[7px] font-mono tracking-wider text-white/50 uppercase pointer-events-none select-none">
                    JOSUE_CAISACHANA
                  </div>
                </div>

                {/* Polish Bottom: Caption / Indicator dots */}
                <div className="pt-4 pb-1 text-center font-sans">
                  
                  {/* Dots Indicator */}
                  <div className="flex justify-center gap-1.5">
                    {about.photos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPhotoIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentPhotoIndex 
                            ? "w-6 bg-[#FF3B3F]" 
                            : "w-1.5 bg-[#0F0F10]/20 hover:bg-[#0F0F10]/40"
                        }`}
                        aria-label={`Foto ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
 
            {/* Colonna Destra: Punti di forza cards */}
            <motion.div 
              className="lg:col-span-12 xl:col-span-4 flex flex-col justify-start w-full lg:sticky lg:top-24"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#0F0F10]/60 mb-6 font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FF3B3F]" />
                <span>{about.strengthsTitle}</span>
              </h3>
 
              <div className="space-y-4">
                {about.strengths.map((str, idx) => {
                  // Choose custom icon based on index
                  let IconComponent = Target;
                  if (idx === 0) IconComponent = Eye;
                  if (idx === 1) IconComponent = Compass;
                  if (idx === 2) IconComponent = Zap;
 
                  return (
                    <motion.div 
                      key={idx}
                      whileHover={{ x: 6, scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#F4F3F0] p-6 rounded-none border-2 border-[#0F0F10]/5 hover:border-[#0F0F10] hover:bg-white group transition-all duration-300 relative overflow-hidden cursor-pointer hover:shadow-[4px_4px_0px_#FF3B3F]"
                    >
                      {/* Dynamic accent on hover card */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#FF3B3F]/25 group-hover:bg-[#FF3B3F] transition-all duration-300" />
                      
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white border border-[#0F0F10]/10 rounded-none group-hover:bg-[#FF3B3F]/10 group-hover:border-[#FF3B3F]/30 transition-all duration-300 shrink-0">
                          <IconComponent className="w-5 h-5 text-[#0F0F10]/60 group-hover:text-[#FF3B3F] transition-all duration-300" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#0F0F10] group-hover:text-[#FF3B3F] transition-all duration-300 mb-1 font-display">
                            {str.title}
                          </h4>
                          <p className="text-xs text-[#0F0F10]/70 leading-relaxed font-semibold font-sans">
                            {str.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
 
          </div>
        </div>
      </section>

      {/* 2. SEZIONE 'PORTFOLIO' (02 / SELECTED WORKS) */}
      <section 
        id="portfolio" 
        className="py-24 sm:py-32 bg-[#F4F3F0] relative z-10 border-t border-[#0F0F10]/10 overflow-hidden"
      >
        {/* Ambient subtle light source overlay */}
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#FF3B3F]/5 rounded-full filter blur-[150px] pointer-events-none -translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[#FF3B3F] font-mono text-xs font-black tracking-[0.3em]">02 / LAVORI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3F]" />
              </div>
            </motion.div>
          </div>

          {/* Minimalist, Asymmetric Filter Bar matching Bento layout */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-2 border-[#0F0F10] bg-white p-4 mb-12 gap-4 font-mono select-none rounded-none shadow-[4px_4px_0px_#0F0F10]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-white uppercase bg-[#FF3B3F] px-2 py-0.5 rounded-none">
                {activeFilter === "Tutti" ? "MAIN_BOARD" : `FILTER_${activeFilter.toUpperCase().replace(' ', '_')}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {(["Tutti", "Grafica", "Multimediale", "AI Tech", "Social"] as const).map((filter, idx) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    id={`filter-${filter}`}
                    onClick={() => setActiveFilter(filter)}
                    className={`flex-grow md:flex-grow-0 px-4 py-2 text-left md:text-center text-[11px] font-black uppercase tracking-wider cursor-pointer border-2 transition-all duration-200 rounded-none ${
                      isActive
                        ? "bg-[#FF3B3F] text-white border-black shadow-none"
                        : "bg-white text-[#0F0F10] border-black/10 hover:border-black hover:text-[#FF3B3F]"
                    }`}
                  >
                    0{idx} / {filter === "Tutti" ? "TUTTI" : filter.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Balanced 3-Column Grid Layout (Equally distributed visual weight to resolve hierarchical bias) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProjects.map((project, idx) => {
              const isHovered = activeHoverId === project.id;
              const hasVideo = project.mediaType === "video" && project.videoUrl;
              
              return (
                <ScrollReveal 
                  key={project.id} 
                  delay={idx * 50} 
                  className="flex flex-col"
                >
                  <div
                    id={`card-${project.id}`}
                    className="group relative h-full bg-white border-2 border-[#0F0F10] rounded-none overflow-hidden hover:border-black cursor-pointer flex flex-col justify-between shadow-[6px_6px_0px_#0F0F10] hover:shadow-[10px_10px_0px_#FF3B3F] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300"
                    onMouseEnter={() => setActiveHoverId(project.id)}
                    onMouseLeave={() => setActiveHoverId(null)}
                    onClick={() => setSelectedProject(project)}
                  >
                    {/* Media preview block */}
                    <div className="h-52 relative overflow-hidden bg-[#0F0F10] border-b-2 border-[#0F0F10]">
                      <div className="absolute top-3 left-3 z-20">
                        <span className="px-2 py-0.5 bg-black border border-[#FF3B3F]/30 text-[8px] font-mono text-white uppercase rounded-none font-bold">
                          {project.projectWorkNum}
                        </span>
                      </div>

                      <img 
                        src={resolveAssetUrl(project.mediaUrl)} 
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 select-none group-hover:scale-105 ${
                          hasVideo && isHovered ? "opacity-0" : "opacity-100"
                        }`}
                      />

                      {hasVideo && !getYouTubeId(project.videoUrl) && (
                        <video
                          src={getProjectVideoSrc(project.videoUrl)}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
                            isHovered ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      )}

                      {hasVideo && getYouTubeId(project.videoUrl) && isHovered && (() => {
                        const ytId = getYouTubeId(project.videoUrl);
                        return (
                          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10">
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1&enablejsapi=1`}
                              className="absolute w-[130%] h-[130%] -top-[15%] -left-[15%] pointer-events-none border-none select-none max-w-none max-h-none rounded-none"
                              title={project.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                          </div>
                        );
                      })()}

                      {/* Play overlay decoration on hover for multimedia projects */}
                      {project.mediaType === "video" && (
                        <div className="absolute top-3 right-3 z-20">
                          <div className="w-8 h-8 rounded-none bg-white border-2 border-black flex items-center justify-center group-hover:bg-[#FF3B3F] group-hover:text-white transition-colors duration-200 shadow-[2px_2px_0px_#0F0F10]">
                            <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform duration-200" />
                          </div>
                        </div>
                      )}

                      {/* HUD overlay for cards */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-0 z-10 flex flex-col justify-between p-3 bg-black/20 pointer-events-none select-none font-mono"
                          >
                            <div className="flex items-center justify-between text-[7px] font-black text-[#FF3B3F] tracking-widest bg-white text-[#0F0F10] border border-black px-1.5 py-0.5 rounded-none shadow">
                              <span className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-[#FF3B3F] rounded-full animate-ping" />
                                {project.mediaType === "video" ? "PLAYBACK" : "PREVIEW"}
                              </span>
                              <span>{project.mediaType === "video" ? "24FPS" : "300DPI"}</span>
                            </div>

                            <motion.div 
                              initial={{ y: "-100%" }}
                              animate={{ y: "100%" }}
                              transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                              className="absolute left-0 right-0 h-[1.5px] bg-[#FF3B3F]/80 shadow-[0_0_3px_#FF3B3F]"
                            />

                            <div className="flex items-end justify-between text-[8px] font-mono leading-none mt-auto text-white drop-shadow">
                              <div className="bg-black/80 px-1 py-0.5 border border-white/10">
                                <p className="font-bold text-[#F5F5F5] uppercase text-[7px]">
                                  {project.category}
                                </p>
                              </div>
                              <div className="bg-black/80 px-1 py-0.5 border border-[#FF3B3F]/25 text-right">
                                <p className="font-bold text-[#FF3B3F] text-[7px]">
                                  READY
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Brief and content block */}
                    <div className="p-5 flex-grow flex flex-col justify-between bg-white">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono font-black tracking-wider text-[#FF3B3F] uppercase block">
                            {project.detailCategory}
                          </span>
                          {project.formatRecommended && (
                            <span className="text-[8px] font-mono text-[#0F0F10]/50 uppercase font-bold">
                              {project.formatRecommended.split(' px')[0]}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-base font-black tracking-tight text-[#0F0F10] leading-tight group-hover:text-[#FF3B3F] transition-colors duration-200 uppercase mb-4 h-[3.25rem] line-clamp-2">
                          {project.title}
                        </h3>

                        <div className="space-y-1 mb-4">
                          <span className="text-[8px] font-mono uppercase tracking-widest text-[#0F0F10]/55 font-bold block">
                            Brief Assegnato:
                          </span>
                          <p className="text-xs text-[#0F0F10]/80 font-semibold font-sans leading-relaxed line-clamp-4 h-[5rem]">
                            {project.description}
                          </p>
                        </div>
                      </div>

                      {/* Footer software used block */}
                      <div className="border-t-2 border-[#0F0F10] pt-4 mt-auto flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[8px] font-mono uppercase tracking-widest text-[#0F0F10]/50 font-bold">
                            Ruolo:
                          </span>
                          <span className="font-black text-[#0F0F10] uppercase truncate max-w-[70%]">
                            {project.role}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.software.map((sw, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 text-[8px] font-mono font-black uppercase bg-white text-[#0F0F10] border border-[#0F0F10] shadow-[1.5px_1.5px_0px_#0F0F10] rounded-none"
                            >
                              {sw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </ScrollReveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. SEZIONE 'COMPETENZE' (03 / L'ARSENALE CREATIVO) */}
      <section 
        id="skills" 
        className="py-24 sm:py-32 bg-[#F4F3F0] relative z-10 border-t border-[#0F0F10]/10 overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neutral-900/[0.01] rounded-full filter blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
          
          {/* Header */}
          <div className="text-center mb-16 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="text-[#D90429] font-mono text-xs font-bold tracking-[0.3em]">03 / SKILLSET</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D90429]" />
            </div>
          </div>

          {/* Griglia di Card Moderne */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {portfolioData.skills.items.map((skill, idx) => {
              // Map icons dynamically to matches
              let SkillIconComponent = Sliders;
              if (skill.id === "sk-premiere") SkillIconComponent = Film;
              if (skill.id === "sk-capcut") SkillIconComponent = Sliders;
              if (skill.id === "sk-photoshop") SkillIconComponent = Layers;
              if (skill.id === "sk-ai-tools") SkillIconComponent = Cpu;

              // Customize active bar percentage visual
              let percentage = "100%";
              let bulletPoints: string[] = [];
              if (skill.id === "sk-premiere") {
                percentage = "100%";
                bulletPoints = ["Montaggio Cinematografico", "Sound FX & Audio Layers", "Advanced Color LUTs"];
              } else if (skill.id === "sk-capcut") {
                percentage = "100%";
                bulletPoints = ["Tik Tok Hook Dynamics", "Mobile-first Video Design", "Speed Ramp Syncing"];
              } else if (skill.id === "sk-photoshop") {
                percentage = "100%";
                bulletPoints = ["Cinematic Poster Design", "Atmospheric Composites", "Lighting Reconstruction"];
              } else if (skill.id === "sk-ai-tools") {
                percentage = "100%";
                bulletPoints = ["Midjourney Art Direction", "Runway Gen-3 Filmmaking", "Style Transfer Models"];
              }

              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.12 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="bg-white border border-[#0F0F10]/10 rounded-sm p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#D90429]/50 hover:shadow-[0_15px_35px_-15px_rgba(217,4,41,0.12)]"
                >
                  <div>
                    {/* Icon frame */}
                    <div className="w-12 h-12 rounded-sm bg-[#0F0F10]/5 border border-[#0F0F10]/10 flex items-center justify-center text-gray-700 hover:text-[#D90429] hover:bg-[#D90429]/10 hover:border-[#D90429]/30 transition-all duration-300 mb-6">
                      <SkillIconComponent className="w-5 h-5 transition-transform duration-300" />
                    </div>

                    {/* Skill Info */}
                    <h3 className="text-lg font-bold font-display tracking-tight text-[#0F0F10] mb-2">
                      {skill.name}
                    </h3>
                    <p className="text-[11px] font-mono text-[#D90429] tracking-wider mb-4 leading-normal uppercase">
                      {skill.level}
                    </p>
                    <p className="text-xs text-gray-600 font-light leading-relaxed mb-6">
                      {skill.description}
                    </p>

                    {/* Custom points bullet details */}
                    <ul className="space-y-1.5 border-t border-[#0F0F10]/10 pt-5 mb-6 text-xs text-gray-500 font-mono">
                      {bulletPoints.map((bp, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-[#D90429] rounded-full shrink-0" />
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Level Progress bar (Thin, sleek) */}
                  <div className="space-y-2 mt-auto">
                    <div className="w-full h-[2px] bg-[#0F0F10]/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: percentage }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        className="h-full bg-[#D90429] rounded-full"
                      />
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. SEZIONE 'FILOSOFIA' (04 / VISIONE) */}
      <section 
        id="philosophy" 
        className="py-28 sm:py-36 bg-[#F4F3F0] relative z-10 border-t border-[#0F0F10]/10 overflow-hidden"
      >
        {/* Subtle radial glow background that emphasizes the quote centering */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF3B3F]/3 rounded-full filter blur-[150px] pointer-events-none" />
 
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
          
          <div className="text-center mb-8">
            <span className="text-[#FF3B3F] font-mono text-xs font-bold tracking-[0.3em]">04 / VISIONE</span>
            <span className="block h-[1px] w-12 bg-[#FF3B3F] mx-auto mt-4" />
          </div>
 
          {/* Cinematic Crop Frame layout simulating viewfinder */}
          <motion.div 
            className="relative px-6 py-16 sm:py-24 sm:px-16 border border-[#0F0F10]/10 bg-white rounded-none max-w-5xl mx-auto overflow-hidden shadow-sm"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            {/* Viewfinder Elements (Themed details matching video editor design) */}
            <div className="absolute top-3 left-3 border-t border-l border-[#0F0F10]/20 w-5 h-5" />
            <div className="absolute top-3 right-3 border-t border-r border-[#0F0F10]/20 w-5 h-5" />
            <div className="absolute bottom-3 left-3 border-b border-l border-[#0F0F10]/20 w-5 h-5" />
            <div className="absolute bottom-3 right-3 border-b border-r border-[#0F0F10]/20 w-5 h-5" />
 
            {/* Simulated Recording Details */}
            <div className="absolute top-3 left-10 hidden sm:flex items-center gap-1.5 text-[9px] font-mono text-gray-500 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3F] animate-pulse" />
              <span>REC [RAW]</span>
            </div>
            <div className="absolute top-3 right-10 hidden sm:flex items-center gap-3 text-[9px] font-mono text-gray-500 tracking-widest">
              <span>24 FPS</span>
              <span>•</span>
              <span>2.35:1 SHUTTER</span>
            </div>
            <div className="absolute bottom-3 left-10 hidden sm:flex items-center gap-2 text-[9px] font-mono text-gray-500 tracking-widest">
              <span>ISO 800</span>
              <span>5600K</span>
            </div>
            <div className="absolute bottom-3 right-10 hidden sm:flex items-center gap-2 text-[9px] font-mono text-gray-500 tracking-widest">
              <span>CH1  █ █ █ █ ░ ░</span>
            </div>
 
            {/* Philosophy text */}
            <div className="relative z-10 flex flex-col items-center">
              
              <span className="font-syne font-black text-[10px] sm:text-xs tracking-[0.4em] uppercase text-gray-600 mb-6 block text-center">
                {philosophy.subtitle || "SOGNI VISIVI TRADOTTI IN REALTÀ."}
              </span>
 
              {/* Central Bold Quote statement with gradient highlights */}
              <blockquote className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl font-black font-syne tracking-tight text-[#0F0F10] text-center leading-[1.2] max-w-4xl mx-auto my-6 py-4 px-2 select-none border-y border-[#0F0F10]/10 uppercase">
                "Se abbiamo il potere di sognarlo, abbiamo anche il potere di <span className="text-[#FF3B3F] font-black relative inline-block">renderlo realtà."</span>
              </blockquote>
 

 
              <cite className="not-italic text-center mt-4">
                <span className="block text-[#FF3B3F] text-xs font-mono font-bold tracking-widest uppercase mb-1">
                  — {philosophy.author}
                </span>
              </cite>

            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. SEZIONE 'CONTATTI' (05 / CREATIVE MAGNET CONTACTS) */}
      <section 
        id="contacts" 
        className="py-24 sm:py-32 bg-[#F4F3F0] relative z-10 border-t border-[#0F0F10]/10 overflow-hidden"
      >
        {/* Subtle decorative target corner highlights resembling professional director viewfinders */}
        <div className="absolute top-8 left-8 border-t border-l border-[#0F0F10]/15 w-4 h-4" />
        <div className="absolute top-8 right-8 border-t border-r border-[#0F0F10]/15 w-4 h-4" />
        <div className="absolute bottom-8 left-8 border-b border-l border-[#0F0F10]/15 w-4 h-4" />
        <div className="absolute bottom-8 right-8 border-b border-r border-[#0F0F10]/15 w-4 h-4" />

        {/* Ambient large light node behind contacts text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/5 rounded-full filter blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center relative">
          
          <div className="flex justify-center items-center gap-2 mb-6">
            <span className="text-[#D90429] font-mono text-xs font-bold tracking-[0.3em]">05 / CONTACTS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D90429]" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-[#0F0F10] mb-6 leading-none select-none">
            {contacts.title}
          </h2>

          {/* PRIMARY CONTACT BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <motion.a
              href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(contacts.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-4 py-5 px-8 bg-[#D90429] hover:bg-[#0F0F10] text-white hover:text-white font-mono font-bold tracking-widest text-xs uppercase rounded-sm transition-all duration-300 shadow-[0_15px_45px_-12px_rgba(217,4,41,0.5)] border border-[#D90429] hover:border-[#0F0F10] hover:shadow-[0_15px_45px_-12px_rgba(15,15,16,0.25)]"
            >
              <MessageCircle className="w-4 h-4 text-green-400 font-bold transition-transform group-hover:scale-110" />
              <span>{contacts.ctaWhatsapp}</span>
              
              {/* Absolute visual highlights for extreme polish */}
              <span className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-transparent group-hover:border-[#0F0F10]" />
              <span className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-transparent group-hover:border-[#0F0F10]" />
            </motion.a>

            <motion.a
              href={`mailto:${contacts.email}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-4 py-5 px-8 bg-[#0F0F10] hover:bg-[#D90429] text-white hover:text-white font-mono font-bold tracking-widest text-xs uppercase rounded-sm transition-all duration-300 shadow-[0_15px_45px_-12px_rgba(15,15,16,0.25)] border border-[#0F0F10] hover:border-[#D90429] hover:shadow-[0_15px_45px_-12px_rgba(217,4,41,0.5)]"
            >
              <Mail className="w-4 h-4 text-red-500 transition-transform group-hover:scale-110" />
              <span>Invia un'Email ✉️</span>
              
              {/* Absolute visual highlights for extreme polish */}
              <span className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-transparent group-hover:border-white" />
              <span className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-transparent group-hover:border-white" />
            </motion.a>

            <motion.a
              href="/api/video-proxy?id=1sCegLRbbl3nvFEqdJrOAJ36tElIRor64&download=true"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-4 py-5 px-8 bg-blue-500 hover:bg-[#0F0F10] text-white hover:text-white font-mono font-bold tracking-widest text-xs uppercase rounded-sm transition-all duration-300 shadow-[0_15px_45px_-12px_rgba(59,130,246,0.5)] border border-blue-500 hover:border-[#0F0F10] hover:shadow-[0_15px_45px_-12px_rgba(15,15,16,0.25)]"
            >
              <Download className="w-4 h-4 text-white transition-transform group-hover:scale-110" />
              <span>Scarica CV 📥</span>
              
              {/* Absolute visual highlights for extreme polish */}
              <span className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t-2 border-l-2 border-transparent group-hover:border-[#0F0F10]" />
              <span className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b-2 border-r-2 border-transparent group-hover:border-[#0F0F10]" />
            </motion.a>
          </div>



        </div>
      </section>

      {/* 5F. FOOTER & SEO & BACK TO TOP BUTTON */}
      <footer className="py-12 bg-[#F4F3F0] relative z-10 border-t border-[#0F0F10]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Left side copyright */}
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D90429]" />
                <span className="text-sm font-bold tracking-tight text-[#0F0F10] uppercase">JOSUE CAISACHANA</span>
              </div>
              <p className="text-xs text-gray-600 font-mono mt-1">
                © {new Date().getFullYear()} Josue Caisachana. All Rights Reserved.
              </p>
              <p className="text-[10px] text-gray-705 font-mono">
                Sede operativa: Rho (MI) — Milano, Italia
              </p>
            </div>



            {/* Right Side - Back to top mechanism and quick navigation */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="p-3 bg-white hover:bg-[#D90429] border border-[#0F0F10]/10 hover:border-[#D90429] text-gray-600 hover:text-white rounded-full transition-all duration-300 flex items-center justify-center group shadow-sm"
                aria-label="Torna in cima"
              >
                <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

          </div>

        </div>
      </footer>

      {/* 6. DYNAMIC PREMIUM CINEMATIC VIDEO LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            id="cinematic-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#060606]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              id="cinematic-modal-viewport"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="bg-[#0E0E10] border-2 border-white/20 max-w-6xl w-full overflow-hidden shadow-[0_0_50px_rgba(255,59,63,0.15)] rounded-none flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Minimalist Tech Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#141416]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF3B3F] animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 font-bold">
                    SCHEDA PROGETTO / {selectedProject.projectWorkNum || "WORK"}
                  </span>
                </div>

                <button 
                  onClick={() => setSelectedProject(null)}
                  className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer rounded-none border border-white/10 flex items-center justify-center"
                  aria-label="Chiudi"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 w-full bg-[#0E0E10]">
                
                {/* Left Column: Media display stage */}
                <div className="lg:col-span-7 bg-[#050507] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-center items-center relative overflow-hidden min-h-[320px] sm:min-h-[400px] lg:min-h-[520px] py-8">
                  {(() => {
                    const isVertical = selectedProject.formatRecommended?.toLowerCase().includes("verticale") || false;
                    const ytId = getYouTubeId(selectedProject.videoUrl);
                    const isVideo = selectedProject.mediaType === "video" && selectedProject.videoUrl;

                    if (isVideo && isVertical) {
                      return (
                        <div className="w-full h-full flex flex-col justify-center items-center py-4 px-4 relative overflow-hidden">
                          {/* Ambient blur glow behind device */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FF3B3F]/10 rounded-full blur-[70px] pointer-events-none" />

                          {/* Smartphone Device Mockup */}
                          <div className="relative w-[210px] sm:w-[230px] aspect-[9/19] bg-[#16161a] rounded-[36px] p-2 border-[4px] border-[#2A2A2E] shadow-[0_20px_40px_rgba(0,0,0,0.8),_0_0_30px_rgba(255,59,63,0.15)] ring-1 ring-white/10 flex flex-col items-center justify-center z-10">
                            {/* Top Speaker Notch */}
                            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-between px-3">
                              <div className="w-0.5 h-0.5 bg-white/20 rounded-full" />
                              <div className="w-8 h-0.5 bg-[#222] rounded-full" />
                              <div className="w-1 h-1 bg-[#0d0e12] rounded-full" />
                            </div>

                            {/* Screen container */}
                            <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-black border border-white/5 z-20 flex items-center justify-center">
                              {ytId ? (
                                <div className="relative w-full h-full overflow-hidden">
                                  <iframe
                                    id={`yt-player-vertical-${ytId}`}
                                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&loop=1&playlist=${ytId}&controls=1&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`}
                                    className="absolute w-full h-full border-none select-none z-10"
                                    title={selectedProject.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  />
                                </div>
                              ) : (
                                <video
                                  src={getProjectVideoSrc(selectedProject.videoUrl)}
                                  autoPlay
                                  controls
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
 
                            {/* OS bottom swipe indicator bar */}
                            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-white/30 rounded-full z-30" />
                          </div>
                        </div>
                      );
                    }
 
                    // Horizontal media view / Non-vertical layout
                    return (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4">
                        <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[550px] bg-[#040406] overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center group rounded-none">
                          {isVideo ? (
                            ytId ? (
                              <div className="relative w-full h-full overflow-hidden">
                                <iframe
                                  id={`yt-player-horizontal-${ytId}`}
                                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&loop=1&playlist=${ytId}&controls=1&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`}
                                  className="absolute w-full h-full border-none select-none z-10"
                                  title={selectedProject.title}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                              </div>
                            ) : (
                              <video
                                src={getProjectVideoSrc(selectedProject.videoUrl)}
                                autoPlay
                                controls
                                playsInline
                                className="w-full h-full object-contain"
                              />
                            )
                          ) : selectedProject.gallery && selectedProject.gallery.length > 0 ? (
                            <div className="relative w-full h-full flex items-center justify-center bg-[#040406] cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
                              <img
                                src={resolveAssetUrl(selectedProject.gallery[activeSlideIndex])}
                                alt={`${selectedProject.title} - Slide ${activeSlideIndex + 1}`}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                className="max-w-full max-h-full object-contain select-none transition-all duration-300"
                              />
                              
                              {/* Left & Right navigation arrows */}
                              {selectedProject.gallery.length > 1 && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSlideIndex((prev) => (prev === 0 ? selectedProject.gallery!.length - 1 : prev - 1));
                                    }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 border border-white/20 flex items-center justify-center text-white hover:bg-[#FF3B3F] hover:border-[#FF3B3F] transition-all cursor-pointer z-20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    aria-label="Immagine precedente"
                                  >
                                    <ChevronLeft className="w-6 h-6" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveSlideIndex((prev) => (prev === selectedProject.gallery!.length - 1 ? 0 : prev + 1));
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 border border-white/20 flex items-center justify-center text-white hover:bg-[#FF3B3F] hover:border-[#FF3B3F] transition-all cursor-pointer z-20 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    aria-label="Prossima immagine"
                                  >
                                    <ChevronRight className="w-6 h-6" />
                                  </button>
                                </>
                              )}

                              {/* Dot indicators */}
                              {selectedProject.gallery.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                  {selectedProject.gallery.map((_, idx) => (
                                    <button
                                      key={idx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveSlideIndex(idx);
                                      }}
                                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                                        idx === activeSlideIndex 
                                          ? "bg-[#FF3B3F] w-5" 
                                          : "bg-white/40 hover:bg-white/70"
                                      }`}
                                      aria-label={`Vai alla slide ${idx + 1}`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <img
                              src={resolveAssetUrl(selectedProject.mediaUrl)}
                              alt={selectedProject.title}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              className="max-w-full max-h-full object-contain select-none cursor-zoom-in"
                              onClick={() => setIsLightboxOpen(true)}
                            />
                          )}

                          {/* Zoom / Full screen button for static images */}
                          {!isVideo && (
                            <button
                              onClick={() => setIsLightboxOpen(true)}
                              className="absolute top-4 right-4 p-2.5 bg-black/70 hover:bg-[#FF3B3F] border border-white/20 hover:border-[#FF3B3F] rounded-full text-white cursor-pointer z-20 shadow-md transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                              title="Ingrandisci a schermo intero"
                            >
                              <Maximize2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        
                        {/* Interactive hint label underneath */}
                        {!isVideo && (
                          <div className="mt-2.5 text-[9px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1.5 select-none animate-pulse">
                            <Sparkles className="w-3 h-3 text-[#FF3B3F]" />
                            Clicca sull'immagine o premi il tasto in alto a destra per i dettagli in alta risoluzione
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Right Column: Brief and Info */}
                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between text-white space-y-6">
                  <div className="space-y-5">
                    
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-widest uppercase border border-[#FF3B3F] text-[#FF3B3F] bg-[#FF3B3F]/5 font-bold">
                        {selectedProject.detailCategory || "MULTIMEDIALE"}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase border border-white/15 text-white/60 bg-white/5 font-bold">
                        {selectedProject.category}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-white uppercase leading-tight">
                      {selectedProject.title}
                    </h3>

                    {/* Assign Brief */}
                    <div className="space-y-2 border-t border-white/10 pt-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF3B3F] font-black block">
                        Brief Assegnato:
                      </span>
                      <div className="text-sm text-white/80 leading-relaxed font-sans font-medium">
                        {renderDescriptionWithLinks(selectedProject.description)}
                      </div>
                    </div>

                    {/* Grid metadata for Role and format */}
                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-white/40 uppercase block mb-0.5 font-bold">FORMATO</span>
                        <span className="text-white font-black uppercase text-[11px] tracking-tight block">
                          {selectedProject.formatRecommended || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#FF3B3F] uppercase block mb-0.5 font-bold">RUOLO SVOLTO</span>
                        <span className="text-white font-black uppercase text-[11px] tracking-tight block">
                          {selectedProject.role}
                        </span>
                      </div>
                    </div>

                    {/* Software */}
                    <div className="border-t border-white/10 pt-4">
                      <span className="text-[9px] text-white/40 uppercase block mb-2 font-mono font-bold">SOFTWARE IMPIEGATO</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedProject.software.map((sw, i) => (
                          <span 
                            key={i}
                            className="px-2 py-0.5 text-[9px] font-mono bg-white/5 text-white border border-white/15 uppercase font-bold"
                          >
                            {sw}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Live Web Link if available */}
                  {selectedProject.liveUrl && (
                    <div className="border-t border-white/10 pt-4">
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 px-4 bg-[#FF3B3F] hover:bg-white text-white hover:text-black font-black tracking-widest text-[11px] sm:text-xs uppercase transition-all duration-300 text-center flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(255,255,255,0.15)] hover:shadow-none active:translate-y-1 cursor-pointer border border-[#FF3B3F] hover:border-white animate-pulse"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                        VAI AL SITO WEB DEL LAVORO SVOLTO ↗
                      </a>
                    </div>
                  )}

                  {/* CTA whatsapp */}
                  <div className="border-t border-white/10 pt-4">
                    <a
                      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                        `Ciao Josue, ho visto il tuo progetto "${selectedProject.title}" (${selectedProject.projectWorkNum}) nel tuo portfolio e vorrei richiedere un preventivo per un lavoro simile!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 bg-white hover:bg-[#FF3B3F] text-black hover:text-white font-black tracking-widest text-[10px] uppercase transition-all duration-300 text-center block shadow-[4px_4px_0px_rgba(255,255,255,0.2)] hover:shadow-none active:translate-y-1 cursor-pointer"
                    >
                      {selectedProject.category === "Multimediale" ? "RICHIEDI VIDEO SIMILE 🎬" : "RICHIEDI PROGETTO SIMILE 🎨"}
                    </a>
                  </div>

                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. DYNAMIC IMAGE FULL-SCREEN LIGHTBOX OVERLAY */}
      <AnimatePresence>
        {isLightboxOpen && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between w-full border-b border-white/10 pb-4 mb-2 z-10">
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono text-[#FF3B3F] tracking-widest uppercase font-bold">
                  SCHERMO INTERO / DETTAGLI DI ALTA QUALITÀ
                </span>
                <h4 className="text-sm sm:text-base font-black font-sans uppercase tracking-tight text-white">
                  {selectedProject.title} {selectedProject.gallery && selectedProject.gallery.length > 1 ? `(${activeSlideIndex + 1} / ${selectedProject.gallery.length})` : ""}
                </h4>
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 bg-white/5 hover:bg-[#FF3B3F] border border-white/10 hover:border-[#FF3B3F] text-white transition-all duration-300 rounded-none flex items-center justify-center cursor-pointer"
                aria-label="Chiudi schermo intero"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Lightbox Main Stage */}
            <div className="relative flex-grow w-full flex items-center justify-center overflow-hidden py-4">
              <img
                src={resolveAssetUrl(
                  selectedProject.gallery && selectedProject.gallery.length > 0 
                    ? selectedProject.gallery[activeSlideIndex] 
                    : selectedProject.mediaUrl
                )}
                alt={selectedProject.title}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[82vh] object-contain select-none shadow-[0_0_80px_rgba(0,0,0,0.9)] scale-100 hover:scale-[1.01] transition-transform duration-500 cursor-zoom-out"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(false);
                }}
              />

              {/* Lightbox Gallery Navigation Controls */}
              {selectedProject.gallery && selectedProject.gallery.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlideIndex((prev) => (prev === 0 ? selectedProject.gallery!.length - 1 : prev - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/80 border border-white/20 hover:border-[#FF3B3F] flex items-center justify-center text-white hover:bg-[#FF3B3F] transition-all cursor-pointer z-50 shadow-lg"
                    aria-label="Precedente"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlideIndex((prev) => (prev === selectedProject.gallery!.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/80 border border-white/20 hover:border-[#FF3B3F] flex items-center justify-center text-white hover:bg-[#FF3B3F] transition-all cursor-pointer z-50 shadow-lg"
                    aria-label="Successiva"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Footer Info */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-4 mt-2 text-xs font-mono text-white/50 z-10 gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider text-[#FF3B3F] font-bold">
                  {selectedProject.detailCategory}
                </span>
                <span>Role: {selectedProject.role}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Software: {selectedProject.software.join(", ")}</span>
                <span className="hidden sm:inline">|</span>
                <button 
                  onClick={() => setIsLightboxOpen(false)}
                  className="text-white hover:text-[#FF3B3F] transition-colors cursor-pointer uppercase tracking-widest text-[10px] font-bold"
                >
                  Torna alla scheda &times;
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasto "Torna in alto" con stile Neo-Brutalist */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            id="back-to-top"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 bg-[#FF3B3F] hover:bg-white text-white hover:text-[#0F0F10] border-2 border-[#0F0F10] p-3 shadow-[4px_4px_0px_#0F0F10] hover:shadow-[2px_2px_0px_#0F0F10] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-200 cursor-pointer flex items-center justify-center rounded-none font-bold"
            aria-label="Torna in alto"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}


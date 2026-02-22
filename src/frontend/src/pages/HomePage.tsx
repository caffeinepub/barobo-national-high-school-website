import { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import PhilippineTimeClock from '../components/PhilippineTimeClock';
import WeatherForecastSection from '../components/WeatherForecastSection';
import FacebookPresenceBlock from '../components/FacebookPresenceBlock';
import SchoolActivitiesSlider from '../components/SchoolActivitiesSlider';
import { Eye, Target, Star, BookOpen, FileText, GraduationCap, Download, ScrollText, Loader2, Users, Volume2, MapPin, Clock, School } from 'lucide-react';
import { useGetBNHSHymnVideo, useGetCitizenCharterBackgroundPublic, useGetCitizenCharterStaticImagePublic } from '../hooks/useQueries';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { isYouTubeUrl } from '../lib/urlConverter';

export default function HomePage() {
  const { actor } = useActor();
  const { data: hymnVideo, isLoading: hymnLoading } = useGetBNHSHymnVideo();
  const { data: citizenCharterBackground } = useGetCitizenCharterBackgroundPublic();
  const { data: citizenCharterStaticImage } = useGetCitizenCharterStaticImagePublic();
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasAttemptedAutoplay, setHasAttemptedAutoplay] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const weatherRef = useRef<HTMLDivElement>(null);
  const [weatherHeight, setWeatherHeight] = useState<number | undefined>(undefined);
  const [backgroundImageError, setBackgroundImageError] = useState(false);
  const [staticImageError, setStaticImageError] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  // Memoize the hymn video URL to prevent src changes during playback
  // Only changes when the underlying blob object identity changes
  const hymnVideoUrl = useMemo(() => {
    if (!hymnVideo) return null;
    return hymnVideo.getDirectURL();
  }, [hymnVideo]);

  // Check if the hymn video is a YouTube URL
  const isYouTubeVideo = useMemo(() => {
    if (!hymnVideoUrl) return false;
    return isYouTubeUrl(hymnVideoUrl) || hymnVideoUrl.includes('/embed/');
  }, [hymnVideoUrl]);

  // Build YouTube embed URL with autoplay parameters
  const youtubeEmbedUrl = useMemo(() => {
    if (!isYouTubeVideo || !hymnVideoUrl) return null;
    
    // If already an embed URL, add parameters
    if (hymnVideoUrl.includes('/embed/')) {
      const separator = hymnVideoUrl.includes('?') ? '&' : '?';
      return `${hymnVideoUrl}${separator}autoplay=1&mute=0`;
    }
    
    return hymnVideoUrl;
  }, [isYouTubeVideo, hymnVideoUrl]);

  // Memoize Citizen Charter images with cache-busting
  const citizenCharterBackgroundUrl = useMemo(() => {
    if (!citizenCharterBackground) return null;
    const baseUrl = citizenCharterBackground.getDirectURL();
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }, [citizenCharterBackground]);

  const citizenCharterStaticImageUrl = useMemo(() => {
    if (!citizenCharterStaticImage) return null;
    const baseUrl = citizenCharterStaticImage.getDirectURL();
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }, [citizenCharterStaticImage]);

  const { data: totalVisitors } = useQuery({
    queryKey: ['totalVisitors'],
    queryFn: async () => {
      if (!actor) return 0;
      const count = await actor.getTotalVisitors();
      return Number(count);
    },
    enabled: !!actor,
    refetchInterval: 30000,
  });

  const { data: depedVision } = useQuery({
    queryKey: ['depedVision'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getDepEdVision();
      } catch (error) {
        console.error('Error fetching DepEd Vision:', error);
        return null;
      }
    },
    enabled: !!actor,
  });

  const { data: depedMission } = useQuery({
    queryKey: ['depedMission'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getDepEdMission();
      } catch (error) {
        console.error('Error fetching DepEd Mission:', error);
        return null;
      }
    },
    enabled: !!actor,
  });

  useEffect(() => {
    const recordVisit = async () => {
      if (!actor) return;
      const sessionId = sessionStorage.getItem('visitorSessionId') || `session-${Date.now()}-${Math.random()}`;
      if (!sessionStorage.getItem('visitorSessionId')) {
        sessionStorage.setItem('visitorSessionId', sessionId);
      }
      try {
        await actor.recordVisitor(sessionId);
      } catch (error) {
        console.error('Error recording visitor:', error);
      }
    };
    recordVisit();
  }, [actor]);

  // Measure weather section height on md+ viewports
  useEffect(() => {
    if (!weatherRef.current) return;

    const updateHeight = () => {
      // Only apply height constraint on md+ viewports (768px+)
      if (window.innerWidth >= 768 && weatherRef.current) {
        const height = weatherRef.current.offsetHeight;
        setWeatherHeight(height);
      } else {
        setWeatherHeight(undefined);
      }
    };

    // Initial measurement
    updateHeight();

    // Use ResizeObserver to track changes
    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(weatherRef.current);

    // Also listen to window resize for viewport changes
    window.addEventListener('resize', updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Single deterministic autoplay attempt for BNHS Hymn video
  // Only runs once per page load when video URL becomes available
  useEffect(() => {
    if (!hymnVideoUrl || hasAttemptedAutoplay) return;

    // For YouTube embeds, autoplay is handled via URL parameters
    if (isYouTubeVideo) {
      setHasAttemptedAutoplay(true);
      return;
    }

    // For regular video files
    if (!videoRef.current) return;

    const autoplayTimer = setTimeout(() => {
      if (videoRef.current) {
        // Mark that we've attempted autoplay to prevent repeated attempts
        setHasAttemptedAutoplay(true);
        
        // Attempt to play with sound
        videoRef.current.muted = false;
        videoRef.current.play()
          .then(() => {
            // Autoplay with sound succeeded
            setAutoplayFailed(false);
          })
          .catch((error) => {
            console.warn('Autoplay with sound blocked by browser:', error);
            // Show user message instead of trying muted autoplay
            setAutoplayFailed(true);
          });
      }
    }, 3000); // 3-second delay

    return () => clearTimeout(autoplayTimer);
  }, [hymnVideoUrl, hasAttemptedAutoplay, isYouTubeVideo]);

  const formatVisionText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const formatMissionText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      const boldPattern = /\*\*(.*?)\*\*/g;
      const parts: (string | React.ReactElement)[] = [];
      let lastIndex = 0;
      let match;

      while ((match = boldPattern.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={`bold-${index}-${match.index}`}>{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <span key={index}>
          {parts.length > 0 ? parts : line}
          {index < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-center md:text-left">
            <PhilippineTimeClock />
          </div>

          <div className="text-center md:text-right">
            <div className="inline-block rounded-lg bg-[#800000] px-6 py-3 text-white shadow-md">
              <p className="text-lg font-semibold">
                Total Visitors: <span className="text-2xl font-bold">{totalVisitors?.toLocaleString() || 0}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Weather Forecast and Facebook Section - side by side on md+ */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div ref={weatherRef}>
            <WeatherForecastSection />
          </div>
          <div>
            <FacebookPresenceBlock maxHeight={weatherHeight} />
          </div>
        </div>

        {/* Welcome and Faculty Section */}
        <section className="mb-12 rounded-lg bg-white p-8 shadow-md">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Welcome Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <School className="h-8 w-8 text-[#800000]" />
                <h2 className="text-3xl font-bold text-[#800000]">
                  Welcome to Barobo National High School Website!
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <img
                    src="/assets/principal 3.jpg"
                    alt="Principal"
                    className="w-32 h-32 rounded-lg object-cover shadow-md"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">LORNA M. BAUTISTA, EdD</p>
                    <p className="text-sm text-gray-600 mb-2">Principal IV</p>
                    <p className="text-gray-700 leading-relaxed">
                      Welcome to Barobo National High School! We are committed to providing quality education and fostering a nurturing environment for all our students.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Faculty Group Photo */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-[#800000]" />
                <h2 className="text-3xl font-bold text-[#800000]">Our Faculty</h2>
              </div>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg">
                <img
                  src="/assets/generated/faculty-staff-group.dim_1600x900.png"
                  alt="Faculty and Staff Group Photo"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-center text-gray-600 italic">
                Dedicated educators committed to excellence in teaching and learning
              </p>
            </div>
          </div>
        </section>

        {/* School Activities Slider */}
        <section className="mb-12">
          <SchoolActivitiesSlider />
        </section>

        {/* Citizen Charter Section */}
        <section className="mb-12">
          <div
            className="rounded-lg p-8 shadow-md"
            style={{
              backgroundColor: citizenCharterBackgroundUrl && !backgroundImageError ? 'transparent' : '#800000',
              backgroundImage: citizenCharterBackgroundUrl && !backgroundImageError
                ? `url(${citizenCharterBackgroundUrl})`
                : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <h2 className="mb-6 text-center text-3xl font-bold text-white">
              Citizen Charter
            </h2>

            {/* Static Image Section */}
            {citizenCharterStaticImageUrl && !staticImageError && (
              <div className="mb-8 overflow-hidden rounded-lg shadow-lg">
                <img
                  src={citizenCharterStaticImageUrl}
                  alt="Citizen Charter"
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '800px' }}
                  onError={() => {
                    console.error('Failed to load Citizen Charter static image');
                    setStaticImageError(true);
                  }}
                />
              </div>
            )}

            {/* Contact Information Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Contact Information */}
              <Card className="border-white/20 bg-white/95 backdrop-blur-sm">
                <CardHeader style={{ backgroundColor: '#800000' }}>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MapPin className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <p className="font-semibold text-gray-800">School Address:</p>
                    <p className="text-gray-700">
                      Barobo National High School<br />
                      Purok 1B Townsite, Poblacion<br />
                      Barobo, Surigao del Sur<br />
                      Philippines 8309
                    </p>
                    <p className="font-semibold text-gray-800 mt-4">Contact:</p>
                    <p className="text-gray-700">
                      Phone: (086) 850 - 0113 (JHS)<br />
                      (086) 850 - 0547 (SHS)<br />
                      Email: 304861@deped.gov.ph
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Office Hours */}
              <Card className="border-white/20 bg-white/95 backdrop-blur-sm">
                <CardHeader style={{ backgroundColor: '#22c55e' }}>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5" />
                    Office Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <p className="font-semibold text-gray-800">Monday - Friday</p>
                    <p className="text-gray-700">
                      Morning: 8:00 A.M. - 12:00 P.M.<br />
                      Afternoon: 1:00 P.M. - 5:00 P.M.
                    </p>
                    <p className="font-semibold text-gray-800 mt-4">Saturday - Sunday</p>
                    <p className="text-gray-700">Closed</p>
                  </div>
                </CardContent>
              </Card>

              {/* School Hours */}
              <Card className="border-white/20 bg-white/95 backdrop-blur-sm">
                <CardHeader style={{ backgroundColor: '#0ea5e9' }}>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <School className="h-5 w-5" />
                    School Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <p className="font-semibold text-gray-800">Junior High School (JHS)</p>
                    <p className="text-gray-700">
                      Monday - Friday<br />
                      Morning: 7:15 A.M. - 12:00 P.M.<br />
                      Afternoon: 1:00 P.M. - 5:00 P.M.
                    </p>
                    <p className="font-semibold text-gray-800 mt-4">Senior High School (SHS)</p>
                    <p className="text-gray-700">
                      Monday - Friday<br />
                      Morning: 7:30 A.M. - 11:45 A.M.<br />
                      Afternoon: 1:00 P.M. - 5:00 P.M.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visit Us Section */}
            <div className="mt-8 rounded-lg bg-white/95 p-6 shadow-lg backdrop-blur-sm">
              <h3 className="mb-4 text-center text-xl font-bold text-[#800000]">Visit Us</h3>
              <div className="aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.123456789!2d126.17890!3d8.57890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMzQnNDQuMCJOIDEyNsKwMTAnNDQuMCJF!5e0!3m2!1sen!2sph!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Barobo National High School Location"
                />
              </div>
              <p className="mt-4 text-center text-sm text-gray-600">
                G4HC+C74, Barobo, Surigao del Sur
              </p>
            </div>
          </div>
        </section>

        {/* DepEd Vision, Mission, and Core Values Section */}
        <section className="mb-12 rounded-lg bg-gradient-to-br from-[#800000] to-[#600000] p-8 shadow-lg text-white">
          <h2 className="mb-8 text-center text-3xl font-bold">
            DepEd Vision, Mission, and Core Values
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Vision */}
            <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <Eye className="h-8 w-8 text-[#FFD700]" />
                <h3 className="text-2xl font-bold">Vision</h3>
              </div>
              <p className="leading-relaxed text-white/90">
                {depedVision ? formatVisionText(depedVision.vision) : 'Loading...'}
              </p>
            </div>

            {/* Mission */}
            <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <Target className="h-8 w-8 text-[#FFD700]" />
                <h3 className="text-2xl font-bold">Mission</h3>
              </div>
              <p className="leading-relaxed text-white/90">
                {depedMission ? formatMissionText(depedMission.mission) : 'Loading...'}
              </p>
            </div>

            {/* Core Values */}
            <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <Star className="h-8 w-8 text-[#FFD700]" />
                <h3 className="text-2xl font-bold">Core Values</h3>
              </div>
              <ul className="space-y-2 text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700]">•</span>
                  <span>Maka-Diyos (God-loving)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700]">•</span>
                  <span>Maka-tao (People-oriented)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700]">•</span>
                  <span>Makakalikasan (Environment-friendly)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700]">•</span>
                  <span>Makabansa (Patriotic)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* BNHS Hymn Section */}
        <section className="mb-12 rounded-lg bg-gradient-to-br from-[#800000] to-[#600000] p-8 shadow-lg">
          <div className="mb-6 flex items-center justify-center gap-3">
            <Volume2 className="h-8 w-8 text-[#FFD700]" />
            <h2 className="text-center text-3xl font-bold text-white">
              BNHS Hymn
            </h2>
          </div>

          {hymnLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-white" />
            </div>
          ) : hymnVideoUrl ? (
            <div className="mx-auto max-w-4xl">
              {autoplayFailed && !isYouTubeVideo && (
                <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                  <AlertDescription className="text-yellow-800">
                    Click the play button to hear the BNHS Hymn. (Autoplay was blocked by your browser)
                  </AlertDescription>
                </Alert>
              )}
              
              {embedError && isYouTubeVideo && (
                <Alert className="mb-4 bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800">
                    Unable to load the video. This may be due to privacy settings or embedding restrictions on the video.
                  </AlertDescription>
                </Alert>
              )}

              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-xl">
                {isYouTubeVideo && youtubeEmbedUrl ? (
                  <iframe
                    ref={iframeRef}
                    src={youtubeEmbedUrl}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="BNHS Hymn"
                    onError={() => {
                      console.error('YouTube embed failed to load');
                      setEmbedError(true);
                    }}
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={hymnVideoUrl}
                    controls
                    className="h-full w-full"
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              <p className="mt-4 text-center text-sm text-white/80">
                The BNHS Hymn will auto-play with sound after a 3-second delay
              </p>
            </div>
          ) : (
            <Alert className="mx-auto max-w-2xl bg-white/10 border-white/20">
              <AlertDescription className="text-white">
                No hymn video available. Please contact the administrator to upload the BNHS Hymn.
              </AlertDescription>
            </Alert>
          )}
        </section>

        {/* Quick Links Section */}
        <section className="mb-12 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6 text-center text-3xl font-bold text-[#800000]">
            Quick Links
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="/about/history"
              className="group flex flex-col items-center gap-3 rounded-lg border-2 border-[#800000]/20 p-6 transition-all hover:border-[#800000] hover:bg-[#800000]/5 hover:shadow-lg"
            >
              <BookOpen className="h-12 w-12 text-[#800000] transition-transform group-hover:scale-110" />
              <span className="text-center font-semibold text-gray-800">Our History</span>
            </a>

            <a
              href="/publications/the-inkspirer"
              className="group flex flex-col items-center gap-3 rounded-lg border-2 border-[#800000]/20 p-6 transition-all hover:border-[#800000] hover:bg-[#800000]/5 hover:shadow-lg"
            >
              <FileText className="h-12 w-12 text-[#800000] transition-transform group-hover:scale-110" />
              <span className="text-center font-semibold text-gray-800">The Inkspirer</span>
            </a>

            <a
              href="/about/learning-curriculum"
              className="group flex flex-col items-center gap-3 rounded-lg border-2 border-[#800000]/20 p-6 transition-all hover:border-[#800000] hover:bg-[#800000]/5 hover:shadow-lg"
            >
              <GraduationCap className="h-12 w-12 text-[#800000] transition-transform group-hover:scale-110" />
              <span className="text-center font-semibold text-gray-800">Curriculum</span>
            </a>

            <a
              href="/about/downloadable-forms"
              className="group flex flex-col items-center gap-3 rounded-lg border-2 border-[#800000]/20 p-6 transition-all hover:border-[#800000] hover:bg-[#800000]/5 hover:shadow-lg"
            >
              <Download className="h-12 w-12 text-[#800000] transition-transform group-hover:scale-110" />
              <span className="text-center font-semibold text-gray-800">Forms</span>
            </a>
          </div>
        </section>

        {/* Statistical Bulletin Section */}
        <section className="mb-12 rounded-lg bg-[#800000] p-8 shadow-lg">
          <h2 className="mb-6 text-center text-3xl font-bold text-white">
            {depedVision?.bnhsStatisticalBulletinTitle || 'Barobo National High School Statistical Bulletin'}
          </h2>
          <div
            className="rounded-lg bg-cover bg-center p-8"
            style={{
              backgroundImage: 'url(/assets/generated/stats-background.dim_600x400.jpg)',
            }}
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-white/90 p-6 text-center shadow-md backdrop-blur-sm">
                <p className="text-4xl font-bold text-[#800000]">2,500+</p>
                <p className="mt-2 text-gray-700">Students Enrolled</p>
              </div>
              <div className="rounded-lg bg-white/90 p-6 text-center shadow-md backdrop-blur-sm">
                <p className="text-4xl font-bold text-[#800000]">120+</p>
                <p className="mt-2 text-gray-700">Dedicated Teachers</p>
              </div>
              <div className="rounded-lg bg-white/90 p-6 text-center shadow-md backdrop-blur-sm">
                <p className="text-4xl font-bold text-[#800000]">95%</p>
                <p className="mt-2 text-gray-700">Graduation Rate</p>
              </div>
              <div className="rounded-lg bg-white/90 p-6 text-center shadow-md backdrop-blur-sm">
                <p className="text-4xl font-bold text-[#800000]">50+</p>
                <p className="mt-2 text-gray-700">Years of Excellence</p>
              </div>
            </div>
          </div>
        </section>

        {/* School Calendar Section */}
        <section className="mb-12 rounded-lg bg-white p-8 shadow-md">
          <div className="mb-6 flex items-center justify-center gap-3">
            <ScrollText className="h-8 w-8 text-[#800000]" />
            <h2 className="text-center text-3xl font-bold text-[#800000]">
              School Calendar
            </h2>
          </div>
          <div className="overflow-hidden rounded-lg">
            <img
              src="/assets/generated/calendar-header.dim_800x200.jpg"
              alt="School Calendar"
              className="w-full"
            />
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border-l-4 border-[#800000] bg-gray-50 p-4">
              <p className="font-semibold text-gray-800">Opening of Classes</p>
              <p className="text-gray-600">August 29, 2024</p>
            </div>
            <div className="rounded-lg border-l-4 border-[#800000] bg-gray-50 p-4">
              <p className="font-semibold text-gray-800">First Semester Ends</p>
              <p className="text-gray-600">December 20, 2024</p>
            </div>
            <div className="rounded-lg border-l-4 border-[#800000] bg-gray-50 p-4">
              <p className="font-semibold text-gray-800">Second Semester Begins</p>
              <p className="text-gray-600">January 6, 2025</p>
            </div>
            <div className="rounded-lg border-l-4 border-[#800000] bg-gray-50 p-4">
              <p className="font-semibold text-gray-800">End of School Year</p>
              <p className="text-gray-600">May 30, 2025</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

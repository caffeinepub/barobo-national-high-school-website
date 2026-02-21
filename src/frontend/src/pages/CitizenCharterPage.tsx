import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, School, Phone, Mail, MapPinned } from 'lucide-react';
import { useGetContactInfoSections, useGetOfficeHoursSections, useGetSchoolHoursSections, useGetCitizenCharterBackgroundPublic, useGetCitizenCharterStaticImagePublic } from '@/hooks/useQueries';

export default function CitizenCharterPage() {
  const { data: contactInfoSections = [] } = useGetContactInfoSections();
  const { data: officeHoursSections = [] } = useGetOfficeHoursSections();
  const { data: schoolHoursSections = [] } = useGetSchoolHoursSections();
  const { data: citizenCharterBackground } = useGetCitizenCharterBackgroundPublic();
  const { data: citizenCharterStaticImage } = useGetCitizenCharterStaticImagePublic();
  const [backgroundImageError, setBackgroundImageError] = useState(false);
  const [staticImageError, setStaticImageError] = useState(false);

  const defaultContactInfo = `Barobo National High School
Purok 1B Townsite, Poblacion, Barobo, Surigao del Sur, Philippines 8309

Phone: (086) 850 - 0113 (JHS), (086) 850 - 0547 (SHS)
Email: 304861@deped.gov.ph`;

  const defaultOfficeHours = `Monday - Friday
8:00 A.M. - 12:00 P.M. (Morning)
1:00 P.M. - 5:00 P.M. (Afternoon)

Saturday - Sunday
Closed`;

  const defaultSchoolHours = `For Junior High School (JHS)
Monday - Friday
7:15 A.M. - 12:00 P.M. (Morning)
1:00 P.M. - 5:00 P.M. (Afternoon)
Saturday - Sunday: Closed

For Senior High School (SHS)
Monday - Friday
7:30 A.M. - 11:45 A.M. (Morning)
1:00 P.M. - 5:00 P.M. (Afternoon)
Saturday - Sunday: Closed`;

  // Generate background style with cache-busting
  const backgroundStyle = citizenCharterBackground && !backgroundImageError
    ? {
        backgroundImage: `linear-gradient(rgba(128, 0, 0, 0.7), rgba(128, 0, 0, 0.7)), url(${citizenCharterBackground.getDirectURL()}?t=${Date.now()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  // Generate static image URL with cache-busting
  const staticImageUrl = citizenCharterStaticImage && !staticImageError
    ? `${citizenCharterStaticImage.getDirectURL()}?t=${Date.now()}`
    : null;

  // Google Maps embed URL for the plus code
  const mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.123!2d126.27!3d8.528!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMzEnNDEuMCJOIDEyNsKwMTYnMTIuMCJF!5e0!3m2!1sen!2sph!4v1234567890!5m2!1sen!2sph&q=G4HC%2BC74,+Barobo,+Surigao+del+Sur`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-school-blue/5">
      <PageHeader
        title="Citizen's Charter"
        description="School Contact Information and Service Hours"
        backgroundStyle={backgroundStyle}
      />
      {citizenCharterBackground && (
        <img
          src={`${citizenCharterBackground.getDirectURL()}?t=${Date.now()}`}
          alt=""
          className="hidden"
          onError={() => setBackgroundImageError(true)}
        />
      )}

      <div className="container mx-auto px-4 py-12">
        {staticImageUrl && (
          <div className="mb-12 mx-auto max-w-6xl">
            <img
              src={staticImageUrl}
              alt="Citizen Charter Information"
              className="w-full h-auto rounded-lg shadow-lg"
              onError={() => setStaticImageError(true)}
            />
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_400px] max-w-7xl mx-auto">
          {/* Contact Information Cards */}
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader 
                className="text-white"
                style={{ backgroundColor: 'oklch(0.35 0.12 25)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3">
                    <MapPinned className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Contact Information</CardTitle>
                    <CardDescription className="text-white/80">
                      Get in touch with us
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {contactInfoSections.length > 0 ? (
                  <div className="space-y-4">
                    {contactInfoSections.map((section) => (
                      <div key={section.id.toString()} className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {section.content}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-school-maroon mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-school-blue mb-1">Address</p>
                        <p className="text-sm text-muted-foreground">
                          Barobo National High School<br />
                          Purok 1B Townsite, Poblacion<br />
                          Barobo, Surigao del Sur<br />
                          Philippines 8309
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-school-maroon mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-school-blue mb-1">Phone</p>
                        <p className="text-sm text-muted-foreground">
                          (086) 850 - 0113 (JHS)<br />
                          (086) 850 - 0547 (SHS)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-school-maroon mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-school-blue mb-1">Email</p>
                        <p className="text-sm text-muted-foreground">304861@deped.gov.ph</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader 
                className="text-white"
                style={{ backgroundColor: 'oklch(0.55 0.15 145)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Office Hours</CardTitle>
                    <CardDescription className="text-white/80">
                      Administrative office schedule
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {officeHoursSections.length > 0 ? (
                  <div className="space-y-4">
                    {officeHoursSections.map((section) => (
                      <div key={section.id.toString()} className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {section.content}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-school-blue mb-2">Weekdays</p>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday<br />
                        8:00 A.M. - 12:00 P.M. (Morning)<br />
                        1:00 P.M. - 5:00 P.M. (Afternoon)
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-school-blue mb-2">Weekend</p>
                      <p className="text-sm text-muted-foreground">
                        Saturday - Sunday<br />
                        Closed
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-school-gold/20 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader 
                className="text-white"
                style={{ backgroundColor: 'oklch(0.65 0.12 230)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3">
                    <School className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-white">School Hours</CardTitle>
                    <CardDescription className="text-white/80">
                      Class and activity schedule
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {schoolHoursSections.length > 0 ? (
                  <div className="space-y-4">
                    {schoolHoursSections.map((section) => (
                      <div key={section.id.toString()} className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {section.content}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-school-blue mb-2">Junior High School (JHS)</p>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday<br />
                        7:15 A.M. - 12:00 P.M. (Morning)<br />
                        1:00 P.M. - 5:00 P.M. (Afternoon)<br />
                        Saturday - Sunday: Closed
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-school-blue mb-2">Senior High School (SHS)</p>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday<br />
                        7:30 A.M. - 11:45 A.M. (Morning)<br />
                        1:00 P.M. - 5:00 P.M. (Afternoon)<br />
                        Saturday - Sunday: Closed
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Visit Us Section */}
          <div className="lg:row-span-1">
            <Card className="border-school-gold/20 shadow-lg h-full">
              <CardHeader className="bg-gradient-to-br from-school-maroon to-school-maroon-dark text-white">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-3">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Visit Us</CardTitle>
                    <CardDescription className="text-white/80">
                      Find us on the map
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 pb-6">
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="font-semibold text-school-blue mb-2">Location</p>
                    <p className="text-muted-foreground">
                      G4HC+C74, Barobo, Surigao del Sur
                    </p>
                  </div>
                  <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border">
                    <iframe
                      src={mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Barobo National High School Location"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

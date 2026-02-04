import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Clock, School } from 'lucide-react';
import { useGetAllContactInfoSections, useGetAllOfficeHoursSections, useGetAllSchoolHoursSections } from '@/hooks/useQueries';

export default function CitizenCharterPage() {
  const { actor } = useActor();

  const { data: backgroundData } = useQuery({
    queryKey: ['citizenCharterBackground'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCitizenCharterBackground();
      } catch (error) {
        console.log('No background image set, using default maroon background');
        return null;
      }
    },
    enabled: !!actor,
  });

  const { data: staticImageData } = useQuery({
    queryKey: ['citizenCharterStaticImage'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCitizenCharterStaticImage();
      } catch (error) {
        console.log('No static image set');
        return null;
      }
    },
    enabled: !!actor,
  });

  // Fetch CRUD sections
  const { data: contactInfoSections = [] } = useGetAllContactInfoSections();
  const { data: officeHoursSections = [] } = useGetAllOfficeHoursSections();
  const { data: schoolHoursSections = [] } = useGetAllSchoolHoursSections();

  const backgroundImageUrl = backgroundData?.backgroundImage
    ? `${backgroundData.backgroundImage.getDirectURL()}?t=${backgroundData.lastUpdated}`
    : null;

  const staticImageUrl = staticImageData?.staticImage
    ? `${staticImageData.staticImage.getDirectURL()}?t=${staticImageData.lastUpdated}`
    : null;

  // Get active sections (only display active entries)
  const activeContactInfo = contactInfoSections.filter(section => section.isActive);
  const activeOfficeHours = officeHoursSections.filter(section => section.isActive);
  const activeSchoolHours = schoolHoursSections.filter(section => section.isActive);

  // Fallback content if no sections exist
  const hasContactInfo = activeContactInfo.length > 0;
  const hasOfficeHours = activeOfficeHours.length > 0;
  const hasSchoolHours = activeSchoolHours.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Title and Subtitle Section with Background Image */}
      <div
        className="relative bg-maroon text-white py-16 bg-cover bg-center"
        style={
          backgroundImageUrl
            ? {
                backgroundImage: `linear-gradient(rgba(128, 0, 0, 0.7), rgba(128, 0, 0, 0.7)), url(${backgroundImageUrl})`,
              }
            : { backgroundColor: '#800000' }
        }
      >
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Citizen Charter</h1>
          <p className="text-xl text-center text-white/90">School address and contact information</p>
        </div>
      </div>

      {/* Static Image Section */}
      {staticImageUrl && (
        <div className="w-full bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="w-full flex items-center justify-center">
              <img
                src={staticImageUrl}
                alt="Citizen Charter Information"
                className="w-full h-auto object-contain"
                style={{ maxWidth: '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* School Contact Information Section - Solid Maroon Background */}
      <div className="w-full bg-maroon py-12">
        <div className="container mx-auto px-4">
          {/* Section Title with Solid Maroon Color and Center Alignment */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: '#800000' }}>
            School Contact Information
          </h2>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Information Card */}
            <Card className="border-white/20 border shadow-lg" style={{ backgroundColor: '#800000' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Phone className="h-5 w-5 text-white" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasContactInfo ? (
                  activeContactInfo.map((section) => (
                    <div key={section.id.toString()} className="text-white/90 whitespace-pre-wrap">
                      {section.content}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 mt-1 flex-shrink-0 text-white" />
                      <div>
                        <h3 className="font-semibold mb-1 text-white">School Address</h3>
                        <p className="text-white/90">
                          Barobo National High School
                          <br />
                          Purok 1B Townsite, Poblacion
                          <br />
                          Barobo, Surigao del Sur
                          <br />
                          Philippines 8309
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 mt-1 flex-shrink-0 text-white" />
                      <div>
                        <h3 className="font-semibold mb-1 text-white">Phone</h3>
                        <p className="text-white/90">
                          (086) 850 - 0113 (JHS)
                          <br />
                          (086) 850 - 0547 (SHS)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 mt-1 flex-shrink-0 text-white" />
                      <div>
                        <h3 className="font-semibold mb-1 text-white">Email</h3>
                        <p className="text-white/90">304861@deped.gov.ph</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Office Hours Card */}
            <Card className="border-white/20 border shadow-lg" style={{ backgroundColor: '#800000' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="h-5 w-5 text-white" />
                  Office Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasOfficeHours ? (
                  activeOfficeHours.map((section) => (
                    <div key={section.id.toString()} className="text-white/90 whitespace-pre-wrap">
                      {section.content}
                    </div>
                  ))
                ) : (
                  <>
                    <div>
                      <h3 className="font-semibold mb-2 text-white">Weekdays</h3>
                      <p className="text-white/90">
                        Monday - Friday
                        <br />
                        8:00 A.M. - 12:00 P.M. (Morning)
                        <br />
                        1:00 P.M. - 5:00 P.M. (Afternoon)
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-white">Weekend</h3>
                      <p className="text-white/90">Saturday - Sunday Closed</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* School Hours Card */}
            <Card className="border-white/20 border shadow-lg" style={{ backgroundColor: '#800000' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <School className="h-5 w-5 text-white" />
                  School Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasSchoolHours ? (
                  activeSchoolHours.map((section) => (
                    <div key={section.id.toString()} className="text-white/90 whitespace-pre-wrap">
                      {section.content}
                    </div>
                  ))
                ) : (
                  <>
                    <div>
                      <h3 className="font-semibold mb-2 text-white">Junior High School (JHS)</h3>
                      <p className="text-white/90">
                        Monday - Friday
                        <br />
                        7:15 A.M. - 12:00 P.M. (Morning)
                        <br />
                        1:00 P.M. - 5:00 P.M. (Afternoon)
                      </p>
                      <p className="text-white/90 mt-2">Saturday - Sunday Closed</p>
                    </div>

                    <div className="pt-4 border-t border-white/20">
                      <h3 className="font-semibold mb-2 text-white">Senior High School (SHS)</h3>
                      <p className="text-white/90">
                        Monday - Friday
                        <br />
                        7:30 A.M. - 11:45 A.M. (Morning)
                        <br />
                        1:00 P.M. - 5:00 P.M. (Afternoon)
                      </p>
                      <p className="text-white/90 mt-2">Saturday - Sunday Closed</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

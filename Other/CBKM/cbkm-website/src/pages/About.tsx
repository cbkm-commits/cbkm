import React from 'react';
import { Users, Calendar, Award, Heart, Globe, Target } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About Calgary Bharathi Kalai Mandram
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Promoting Heritage, Unity, and Tradition
          </p>
          <p className="text-lg text-gray-500 italic">
            யாதும் ஊரே, யாவரும் கேளிர்; தீதும் நன்றும் பிறர்தர வாரா
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-4">
                  CBKM is an active organization committed to promoting and safeguarding the diverse Tamil culture and language. Our goal is to build a strong community and offer opportunities for people to connect, learn, and honour our heritage.
                </p>
                <p className="text-lg text-gray-600 mb-4">
                  Through various events and activities, we seek to cultivate a profound understanding and appreciation of Tamil culture and language among individuals from all walks of life.
                </p>
                <p className="text-lg text-gray-600">
                  Come join us in our efforts to uphold and celebrate the richness of Tamil culture!
                </p>
              </div>
              <div className="bg-primary-50 rounded-lg p-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-600 text-white p-3 rounded-lg">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Vision</h3>
                      <p className="text-gray-600">To be the leading Tamil cultural organization in Calgary, preserving our heritage for future generations.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-600 text-white p-3 rounded-lg">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Values</h3>
                      <p className="text-gray-600">Unity, Cultural Preservation, Community Service, Education, and Excellence.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tamil Culture Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Tamil Culture and Heritage</h2>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-600 mb-4">
                Tamil culture is the culture of Tamil people. Tamil is one of the oldest surviving languages, spoken by Tamil people. Tamil Nadu has been a region where people have lived for over 400,000 years and has a continuous cultural history of over 5,500 years.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Tamil culture is expressed through language, literature, music, dance, folk arts, martial arts, painting, sculpture, architecture, sports, media, comedy, food, clothing, celebrations, philosophy, religions, traditions, rituals, institutions, and science.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Language & Literature</h3>
                  <p className="text-gray-600">Preserving the ancient Tamil language and its rich literary traditions.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Arts & Music</h3>
                  <p className="text-gray-600">Celebrating traditional Tamil arts, music, and dance forms.</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Festivals & Traditions</h3>
                  <p className="text-gray-600">Observing traditional Tamil festivals and cultural practices.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Annual Events */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Annual Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-6 border-2 border-primary-200 rounded-lg">
                <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pongal Festival</h3>
                <p className="text-gray-600">Harvest festival celebrating prosperity and gratitude</p>
              </div>
              <div className="text-center p-6 border-2 border-primary-200 rounded-lg">
                <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tamil New Year</h3>
                <p className="text-gray-600">Traditional New Year celebrations with cultural programs</p>
              </div>
              <div className="text-center p-6 border-2 border-primary-200 rounded-lg">
                <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Deepavali</h3>
                <p className="text-gray-600">Festival of lights with traditional celebrations</p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-primary-100">Community Members</div>
              </div>
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">12+</div>
                <div className="text-primary-100">Annual Events</div>
              </div>
              <div className="text-center">
                <Award className="w-12 h-12 mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">15+</div>
                <div className="text-primary-100">Years of Service</div>
              </div>
              <div className="text-center">
                <Globe className="w-12 h-12 mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">1000+</div>
                <div className="text-primary-100">Event Attendees</div>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Leadership</h2>
            <p className="text-lg text-gray-600 text-center mb-8">
              Our dedicated team of volunteers works tirelessly to serve the Calgary Tamil community
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900">President</h3>
                <p className="text-gray-600">Leadership & Vision</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900">Secretary</h3>
                <p className="text-gray-600">Administration</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900">Treasurer</h3>
                <p className="text-gray-600">Financial Management</p>
              </div>
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900">Cultural Coordinator</h3>
                <p className="text-gray-600">Event Planning</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;

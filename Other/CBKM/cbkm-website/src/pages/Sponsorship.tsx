import React from 'react';
import { HandHeart, Star, Globe, Phone, Mail, ExternalLink } from 'lucide-react';
import { mockSponsors } from '../data/mockData';
import { useSponsorship } from '../context/SponsorshipContext';

const Sponsorship: React.FC = () => {
  const { sponsorshipContact } = useSponsorship();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'platinum':
        return 'bg-gray-100 border-gray-300';
      case 'gold':
        return 'bg-yellow-50 border-yellow-300';
      case 'silver':
        return 'bg-gray-50 border-gray-300';
      case 'bronze':
        return 'bg-orange-50 border-orange-300';
      default:
        return 'bg-gray-50 border-gray-300';
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'platinum':
        return 'bg-gray-800 text-white';
      case 'gold':
        return 'bg-yellow-500 text-white';
      case 'silver':
        return 'bg-gray-500 text-white';
      case 'bronze':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Sponsors
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Thank you to our generous sponsors who support Calgary's Tamil community
          </p>
        </div>

        {/* Sponsorship CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-8 mb-12">
          <div className="text-center">
            <HandHeart className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Become a Sponsor</h2>
            <p className="text-xl mb-6 text-primary-100">
              Support our community and promote your business to Calgary's Tamil community
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Brand Visibility</h3>
                <p className="text-primary-100">Reach thousands of community members through our events and platforms</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Community Impact</h3>
                <p className="text-primary-100">Support cultural preservation and community building initiatives</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Networking</h3>
                <p className="text-primary-100">Connect with local businesses and community leaders</p>
              </div>
            </div>
            <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Contact Us About Sponsorship
            </button>
          </div>
        </div>

        {/* Current Sponsors */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Valued Sponsors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 ${getLevelColor(
                  sponsor.level
                )}`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">Logo</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelBadge(sponsor.level)}`}>
                      {sponsor.level.charAt(0).toUpperCase() + sponsor.level.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{sponsor.name}</h3>
                  <p className="text-gray-600 mb-4">{sponsor.description}</p>
                  <div className="flex space-x-2">
                    {sponsor.website && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-semibold"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsorship Levels */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Sponsorship Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 border-2 border-gray-200 rounded-lg">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bronze</h3>
              <p className="text-gray-600 mb-4">$500 - $999</p>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>• Logo on website</li>
                <li>• Social media mention</li>
                <li>• Event recognition</li>
              </ul>
            </div>
            <div className="text-center p-6 border-2 border-gray-200 rounded-lg">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Silver</h3>
              <p className="text-gray-600 mb-4">$1,000 - $2,499</p>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>• All Bronze benefits</li>
                <li>• Logo on event materials</li>
                <li>• Verbal recognition at events</li>
              </ul>
            </div>
            <div className="text-center p-6 border-2 border-yellow-300 rounded-lg bg-yellow-50">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gold</h3>
              <p className="text-gray-600 mb-4">$2,500 - $4,999</p>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>• All Silver benefits</li>
                <li>• Banner placement at events</li>
                <li>• Sponsor booth space</li>
              </ul>
            </div>
            <div className="text-center p-6 border-2 border-gray-800 rounded-lg bg-gray-100">
              <div className="bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Platinum</h3>
              <p className="text-gray-600 mb-4">$5,000+</p>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>• All Gold benefits</li>
                <li>• Title sponsorship</li>
                <li>• VIP event access</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interested in Sponsoring?</h2>
          <p className="text-gray-600 mb-6">
            Contact our sponsorship team to learn more about partnership opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={`mailto:${sponsorshipContact.email}`}
              className="flex items-center text-primary-600 hover:text-primary-700 font-semibold"
            >
              <Mail className="w-5 h-5 mr-2" />
              {sponsorshipContact.email}
            </a>
            <a
              href={`tel:${sponsorshipContact.phone}`}
              className="flex items-center text-primary-600 hover:text-primary-700 font-semibold"
            >
              <Phone className="w-5 h-5 mr-2" />
              {sponsorshipContact.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sponsorship;

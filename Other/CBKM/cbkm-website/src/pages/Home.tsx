import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, HandHeart, Image, ArrowRight, Star, MapPin, Clock } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Calgary Bharathi Kalai Mandram
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-primary-100">
              Promoting Heritage, Unity, and Tradition
            </p>
            <p className="text-lg mb-8 text-primary-200 italic">
              யாதும் ஊரே, யாவரும் கேளிர்; தீதும் நன்றும் பிறர்தர வாரா
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/events"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                Upcoming Events
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Welcome to CBKM
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                CBKM is an active organization committed to promoting and safeguarding the diverse Tamil culture and language. Our goal is to build a strong community and offer opportunities for people to connect, learn, and honour our heritage.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Through various events and activities, we seek to cultivate a profound understanding and appreciation of Tamil culture and language among individuals from all walks of life.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
              >
                Learn more about our mission
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            <div className="bg-primary-100 rounded-lg p-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-600 text-white p-3 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Building</h3>
                    <p className="text-gray-600">Creating a strong, united Tamil community in Calgary</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-600 text-white p-3 rounded-lg">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Cultural Events</h3>
                    <p className="text-gray-600">Celebrating Tamil festivals and traditions throughout the year</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-600 text-white p-3 rounded-lg">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Language Preservation</h3>
                    <p className="text-gray-600">Teaching and preserving the Tamil language for future generations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tamil Culture Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <img src="/logo.svg?v=2" alt="CBKM Logo" className="w-24 h-24 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              தமிழ் கலாச்சாரம் மற்றும் பண்பாடு
            </h2>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              தமிழர் பண்பாடு தமிழ் மக்களின் கலாச்சாரம் ஆகும். எஞ்சியிருக்கும் பழமையான மொழிகளில் ஒன்றான தமிழ் மொழியை தமிழ் மக்கள் பேசுகிறார்கள். தமிழகம் 400 ஆயிரம் ஆண்டுகளுக்கும் மேலாக மக்கள் வசிக்கும் பகுதியாக உள்ளது மற்றும் 5,500 ஆண்டுகளுக்கும் மேலான தொடர்ச்சியான கலாச்சார வரலாற்றைக் கொண்டுள்ளது. எனவே, தமிழர் பண்பாடு பல ஆண்டுகளாக பல்வேறு தாக்கங்களைக் கண்டது.
            </p>
            
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              தமிழ் கலாச்சாரம் மொழி, இலக்கியம், இசை, நடனம், நாட்டுப்புற கலை, தற்காப்பு கலை, ஓவியம், சிற்பம், கட்டிடக்கலை, விளையாட்டு, ஊடகங்கள், நகைச்சுவை, உணவு, ஆடைகள், கொண்டாட்டங்கள், தத்துவம், மதங்கள், மரபுகள், சடங்குகள், நிறுவனங்கள், அறிவியலை வெளிப்படுத்தப்படுகிறது. தமிழர் பண்பாடு தமிழ் மொழியின் ஊடாகவும், தமிழர் தாயகப் பிணைப்பின் ஊடாகவும், தமிழர் மரபுகள், வரலாறு, விழுமியங்கள், கலைகள் ஊடாகவும், சமூக, பொருளாதார, அரசியல் தளங்கள் ஊடாகவும் பேணப்படும் தனித்துவ பண்பாட்டுக் கூறுகளைக் குறிக்கும்.
            </p>
          </div>
        </div>
      </section>

      {/* Annual Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ஆண்டு நிகழ்வுகள்
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Pongal Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                பொங்கல் திருநாளின் நோக்கம்
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 leading-relaxed">
                  பொங்கல். இது ஒரு தமிழர் இனத் திருவிழா. சாதி, சமயம் மற்றும் பல வேறுபாடுகளை மறந்து, கல் தோன்றி, மண் தோன்றாக் காலத்தே, முன்தோன்றிய மூத்த குடியின் அடையாள, பண்பாட்டு விழாவாக பொங்கல் திகழ்கிறது. உழைப்பின் மகிமையை ஊருக்கு, உலகுக்கு சொல்லும் விழா, பொங்கல் விழா, இது இயற்கையோடு இயைந்த மூத்த குடியின் திருநாள்.
                </p>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  மனிதன் உயிர் வாழ உணவு தேவை. நமது முக்கியமான உணவுப் பொருள் அரிசி. இதனை விளைவித்து, அறுவடை செய்து, வையத்து உயிருக்கெல்லாம் சோறிடும், அறுவடைத் திருநாளான பொங்கல் விழா போற்றத் தகுந்ததல்லவா! பொங்கல் நன்றி தெரிவிக்கும் விழா.
                </p>
              </div>
            </div>

            {/* Deepavali Section */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                தீபாவளியின் பெருமை
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4 leading-relaxed">
                  ஆண்டு முழுவதும் பல பண்டிகைகள் வந்தாலும் தீபாவளிக்கு என்று தனிச்சிறப்பு ஒன்று உண்டு. அன்றைய தினம் ஏழை, பணக்காரர் என்ற பாகுபாடு இல்லாமல் எல்லோரும் எண்ணெய் நீராடி, புத்தாடை அணிந்து, தீபம் ஏற்றிக் கொண்டாடுவது அவசியம் என்று புராணமே கூறுவதுதான் அந்தச் சிறப்பு.
                </p>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  உலகெங்கிலும் மக்கள் விழாக்களைக் கொண்டாடுவதன் நோக்கம். இயந்திர கதியிலான தங்கள் இயல்பு வாழ்க்கையில் சோர்வு நீங்கி, சுறுசுறுப்படைவதற்காகத்தான். தேக்கமான வாழ்க்கைக்கு வடிகாலாக இருப்பவைகளே விழாக்கள். விழாக்கள் கொண்டாடப்படுவதன் மூலம், புத்துணர்வும், புது எழுச்சியும், புதிய நம்பிக்கையும் பிறக்கிறது. காலைக் கதிரவன் அன்றைய நாளின், நம்பிக்கையின் அடையாளம். விழாக்கள், வாழ்க்கை வாழ்வதற்கே என்ற மகிழ்ச்சியின் அடையாளம்.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600">
              Explore our programs and initiatives that celebrate Tamil culture
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Events</h3>
              <p className="text-gray-600">Cultural celebrations, festivals, and community gatherings</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HandHeart className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sponsorship</h3>
              <p className="text-gray-600">Partner with us to support Tamil community initiatives</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gallery</h3>
              <p className="text-gray-600">Memories from our events and community activities</p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Involved</h3>
              <p className="text-gray-600">Join our community activities and cultural events</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Upcoming Events
              </h2>
              <p className="text-lg text-gray-600">
                Join us for our upcoming cultural celebrations
              </p>
            </div>
            <Link
              to="/events"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center"
            >
              View All Events
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-primary-200"></div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  January 15, 2024
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pongal Festival 2024</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  Calgary Tamil Community Centre
                </div>
                <p className="text-gray-600 mb-4">
                  Join us for our annual Pongal celebration with traditional food, music, and cultural performances.
                </p>
                <Link
                  to="/events"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Learn More →
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-primary-200"></div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  April 14, 2024
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tamil New Year Celebration</h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  Bowness Community Centre
                </div>
                <p className="text-gray-600 mb-4">
                  Celebrate Tamil New Year with cultural programs, traditional games, and community gathering.
                </p>
                <Link
                  to="/events"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Involved With CBKM
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join our community and help us preserve and celebrate Tamil culture in Calgary
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              to="/sponsorship"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Become a Sponsor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

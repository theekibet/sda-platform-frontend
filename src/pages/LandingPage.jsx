import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to SDA Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A Christian community platform for youth fellowship, Bible reading, prayer wall, and meaningful discussions.
          </p>
          <div className="space-x-4">
            <Link 
              to="/auth/login" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link 
              to="/auth/register" 
              className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-xl font-semibold mb-2">Bible Reader</h3>
            <p className="text-gray-600">Read and study the Bible with our comprehensive Bible reader tool.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🙏</div>
            <h3 className="text-xl font-semibold mb-2">Prayer Wall</h3>
            <p className="text-gray-600">Share prayer requests and pray for others in the community.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Community Forums</h3>
            <p className="text-gray-600">Engage in meaningful discussions with fellow believers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

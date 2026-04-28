import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>
      <div className="max-w-3xl mx-auto">
        <p className="text-lg text-gray-600 mb-6">
          SDA Platform is a Christian community platform designed for youth fellowship,
          Bible study, prayer sharing, and meaningful discussions.
        </p>
        <p className="text-lg text-gray-600 mb-6">
          Our mission is to create a safe and engaging space where young believers can
          grow in their faith, connect with others, and share their spiritual journey.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Vision</h2>
        <p className="text-lg text-gray-600">
          To empower the next generation of believers through technology and community,
          making disciples and spreading the gospel in the digital age.
        </p>
      </div>
    </div>
  );
};

export default About;

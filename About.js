import React from 'react';
import './Page.css'; 

// Import icons
import { FaNetworkWired, FaEye, FaBolt, FaShieldAlt, FaGlobe, FaFlask, FaCheckCircle } from 'react-icons/fa';

const About = () => {
  const features = [
    {
      icon: <FaNetworkWired />,
      title: 'Interactive Visualization',
      description: 'Explore supply chains with dynamic tree diagrams that respond to your interactions.'
    },
    {
      icon: <FaEye />,
      title: 'Multiple View Modes',
      description: 'Switch between component-focused and manufacturer-focused views for different analytical perspectives.'
    },
    {
      icon: <FaBolt />,
      title: 'Real-time Updates',
      description: 'Access up-to-date supply chain data with smooth transitions and responsive interfaces.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Secure Access',
      description: 'Protected authentication system ensuring your data and analysis remain private and secure.'
    }
  ];

  const stats = [
    { label: 'Products Traced', value: '500+' },
    { label: 'Manufacturers Mapped', value: '200+' },
    { label: 'Supply Chain Tiers', value: '5+' },
    { label: 'Data Points Analyzed', value: '1M+' }
  ];

  return (
    <div className="page-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-icon-container">
          <FaFlask />
        </div>
        <h1>About Aavyooh</h1>
        <p className="page-subtitle">
          A modern platform for visualizing and analyzing supply chains, 
          providing insights into manufacturing dependencies and supplier relationships.
        </p>
      </div>

      {/* Stats Section */}
      <div className="info-card stats-card">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Core Features Grid */}
      <div className="info-grid">
        <div className="info-card mission-card">
          <h2>Our Mission</h2>
          <p>
            Aavyooh empowers industry professionals with cutting-edge visualization tools 
            to understand complex supply chain relationships. Our platform transforms raw data into 
            actionable insights, helping businesses make informed decisions about sourcing, 
            manufacturing, and supply chain optimization.
          </p>
        </div>
        <div className="info-card tech-card">
          <h2>Our Technology</h2>
          <p>
            Leveraging a modern tech stack including React, D3.js, and a robust backend API, we deliver a fast, responsive, and secure experience.
          </p>
          <div className="tech-tags">
            <span>React</span>
            <span>D3.js</span>
            <span>Node.js</span>
            <span>CSS3</span>
          </div>
        </div>
      </div>

      {/* Detailed Features Section */}
      <div className="info-card">
        <h2 className="card-title">Key Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-text">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
import React, { useState } from 'react';
import './Page.css'; // Uses the same updated stylesheet

// Import icons
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      // Optional: auto-hide success message after some time
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-icon-container">
          <FaEnvelope />
        </div>
        <h1>Contact Us</h1>
        <p className="page-subtitle">
          Have a question or need support? Fill out the form below, and our team will get back to you shortly.
        </p>
      </div>

      <div className="contact-grid">
        <div className="info-card">
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required>
                <option value="">Select a subject</option>
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Partnership</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} required></textarea>
            </div>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : <><FaPaperPlane /> Send Message</>}
            </button>
            {isSubmitted && <p style={{ color: 'green', marginTop: '10px' }}>Thank you! Your message has been sent.</p>}
          </form>
        </div>
        <div className="contact-info">
          <div className="info-card">
            <h2>Contact Information</h2>
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <div>
                <strong>Location</strong>
                <p>San Francisco, CA</p>
              </div>
            </div>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <div>
                <strong>Email</strong>
                <p>support@aavyooh.com</p>
              </div>
            </div>
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <div>
                <strong>Phone</strong>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from './config';
import './Home.css';
import { getActivities, getMaterialsWorkedOn, getVisitedPages, getLastSession } from './activityTracker';
import { 
    FiCheckCircle, FiCircle,
    FiClock, FiUser, FiMap, FiShare2, FiFileText, FiAlertTriangle,
    FiActivity, FiSearch, FiGlobe, FiLoader, FiAnchor, FiTrendingUp, FiTrendingDown, FiMinus
} from 'react-icons/fi';

const formatTimeAgo = (isoString) => {
  if (!isoString) return 'First login';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  return new Date(isoString).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const pageIcons = {
  'Supply Chain Map': <FiMap />,
  'Complete Network': <FiShare2 />,
  'Regulatory Requirements': <FiFileText />,
  'Risk Alerts': <FiAlertTriangle />,
};

const formatManufacturer = (mfr) => {
  if (!mfr) return '';
  const parts = mfr.split('_');
  if (parts.length >= 3) {
    const name = parts.slice(0, -2).join(' ').replace(/\b\w/g, c => c.toUpperCase());
    const city = parts[parts.length - 2].replace(/\b\w/g, c => c.toUpperCase());
    const state = parts[parts.length - 1].toUpperCase();
    return `${name} (${city}, ${state})`;
  }
  return mfr.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const Dashboard = ({ username = 'User', lastLogin }) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [materialsWorkedOn, setMaterialsWorkedOn] = useState([]);
  const [visitedPages, setVisitedPages] = useState({});
  const [isLastSession, setIsLastSession] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [hubs, setHubs] = useState([]);
  const [hubsLoading, setHubsLoading] = useState(true);
  const [hubsError, setHubsError] = useState(null);
  const lastSession = getLastSession();
  const lastVisitedPage = lastSession ? lastSession.lastVisitedPage : null;
  const loginTime = sessionStorage.getItem('loginTime');

  // Fetch supply chain news on login (once per session)
  useEffect(() => {
    const cachedNews = sessionStorage.getItem('supplyChainNews');
    if (cachedNews) {
      setNewsItems(JSON.parse(cachedNews));
      setNewsLoading(false);
    } else {
      axios.get(`${config.API_BASE_URL}/get_supply_chain_news`)
        .then(res => {
          setNewsItems(res.data);
          sessionStorage.setItem('supplyChainNews', JSON.stringify(res.data));
        })
        .catch(err => {
          console.error('Failed to fetch supply chain news:', err);
          setNewsError('Unable to load news at this time.');
        })
        .finally(() => setNewsLoading(false));
    }
  }, []);

  // Fetch shipping hubs on login (once per session)
  useEffect(() => {
    const cachedHubs = sessionStorage.getItem('shippingHubs');
    if (cachedHubs) {
      setHubs(JSON.parse(cachedHubs));
      setHubsLoading(false);
    } else {
      axios.get(`${config.API_BASE_URL}/get_shipping_hubs`)
        .then(res => {
          setHubs(res.data);
          sessionStorage.setItem('shippingHubs', JSON.stringify(res.data));
        })
        .catch(err => {
          console.error('Failed to fetch shipping hubs:', err);
          setHubsError('Unable to load hub data at this time.');
        })
        .finally(() => setHubsLoading(false));
    }
  }, []);

  useEffect(() => {
    const refresh = () => {
      const currentActivities = getActivities();
      const currentMaterials = getMaterialsWorkedOn();
      const currentPages = getVisitedPages();

      if (currentActivities.length > 0) {
        setActivities(currentActivities);
        setMaterialsWorkedOn(currentMaterials);
        setVisitedPages(currentPages);
        setIsLastSession(false);
      } else {
        // Fall back to last session data
        const last = getLastSession();
        if (last) {
          setActivities(last.activities || []);
          setMaterialsWorkedOn(last.materials || []);
          setVisitedPages(last.pages || {});
          setIsLastSession(true);
        } else {
          setActivities([]);
          setMaterialsWorkedOn([]);
          setVisitedPages({});
          setIsLastSession(false);
        }
      }
    };
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  const sessionDuration = () => {
    if (!loginTime) return '0m';
    const mins = Math.floor((Date.now() - new Date(loginTime).getTime()) / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const quickActions = [
    { label: 'Supply Chain Map', icon: <FiMap />, path: '/supply-chain-map' },
    { label: 'Complete Network', icon: <FiShare2 />, path: '/complete-network' },
    { label: 'Risk Alerts', icon: <FiAlertTriangle />, path: '/risk-alerts' },
    { label: 'Regulations', icon: <FiFileText />, path: '/regulatory-requirements' },
  ];


  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome back, {username}</h2>
          <div className="welcome-meta">
            <span><FiClock /> Last login: {lastLogin ? formatDate(lastLogin) : 'First session'}</span>
            <span><FiActivity /> Session: {sessionDuration()}</span>
            <span><FiSearch /> Materials explored: {materialsWorkedOn.length}</span>
            {lastVisitedPage && <span><FiMap /> Last visited: {lastVisitedPage}</span>}
          </div>
        </div>
        <div className="quick-actions">
          {quickActions.map((action, i) => (
            <button key={i} className="quick-action-btn" onClick={() => navigate(action.path)}>
              {action.icon} <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity & Materials Row */}
      <div className="activity-row">
        {/* Recent Activity Feed */}
        <div className="list-card activity-card">
          <h3><FiActivity /> {isLastSession ? 'Last Session Activity' : 'Recent Activity'}</h3>
          {isLastSession && <p className="last-session-badge">From your previous session</p>}
          {activities.length === 0 ? (
            <p className="empty-state">No activity yet. Start exploring your supply chain!</p>
          ) : (
            <ul>
              {activities.slice(0, 8).map((activity, i) => (
                <li key={i} className="activity-item">
                  <span className="activity-icon">
                    {activity.type === 'page_visit' && (pageIcons[activity.page] || <FiCircle />)}
                    {activity.type === 'material_search' && <FiSearch />}
                    {activity.type === 'action' && <FiCheckCircle />}
                  </span>
                  <div className="activity-detail">
                    <span className="activity-label">
                      {activity.type === 'page_visit' && `Visited ${activity.page}`}
                      {activity.type === 'material_search' && (
                        <>
                          Searched <strong>{activity.material?.replace(/_/g, ' ')}</strong>
                          {activity.manufacturer && <> from <strong>{formatManufacturer(activity.manufacturer)}</strong></>}
                          {` in ${activity.page}`}
                        </>
                      )}
                      {activity.type === 'action' && (
                        <>
                          {activity.action}
                          {activity.details?.product && <> — <strong>{activity.details.product}</strong></>}
                        </>
                      )}
                    </span>
                    <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Materials Worked On + Pages Visited */}
        <div className="list-card insights-card">
          <h3><FiUser /> {isLastSession ? 'Last Session Insights' : 'Session Insights'}</h3>
          {isLastSession && <p className="last-session-badge">From your previous session</p>}
          
          <div className="insight-section">
            <h4>Pages Visited</h4>
            {Object.keys(visitedPages).length === 0 ? (
              <p className="empty-state">No pages visited yet.</p>
            ) : (
              <div className="page-chips">
                {Object.entries(visitedPages).map(([page, count], i) => (
                  <span key={i} className="page-chip">
                    {pageIcons[page] || <FiCircle />} {page} <strong>×{count}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="insight-section">
            <h4>Materials Explored</h4>
            {materialsWorkedOn.length === 0 ? (
              <p className="empty-state">Search for materials to see them here.</p>
            ) : (
              <div className="material-chips">
                {materialsWorkedOn.map((mat, i) => (
                  <span key={i} className="material-chip">{mat}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Shipping Hubs & Global News */}
      <div className="bottom-grid">
        <div className="list-card hubs-card">
          <h3><FiAnchor /> Major Shipping Hubs <span className="hub-live-badge">LIVE</span></h3>
          {hubsLoading ? (
            <div className="news-loading"><FiLoader className="spinner" /> Loading hub activity...</div>
          ) : hubsError ? (
            <p className="empty-state">{hubsError}</p>
          ) : hubs.length === 0 ? (
            <p className="empty-state">No hub data available.</p>
          ) : (
            <ul className="hubs-list">
              {hubs.map((hub, index) => (
                <li key={hub.id || index} className="hub-item">
                  <div className="hub-main">
                    <span className="hub-name">{hub.name}</span>
                    <span className="hub-region">{hub.region}</span>
                  </div>
                  <div className="hub-stats">
                    <span className="hub-stat">
                      <strong>{hub.active_shipments}</strong> shipments
                    </span>
                    <span className="hub-stat">
                      <strong>{hub.vessels_docked}</strong> vessels
                    </span>
                  </div>
                  <div className="hub-footer">
                    <span className={`hub-congestion ${hub.congestion?.toLowerCase()}`}>{hub.congestion}</span>
                    <span className={`hub-trend ${hub.trend}`}>
                      {hub.trend === 'up' ? <FiTrendingUp /> : hub.trend === 'down' ? <FiTrendingDown /> : <FiMinus />}
                      {hub.change_pct}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="list-card news-card">
          <h3><FiGlobe /> Global Supply Chain News</h3>
          {newsLoading ? (
            <div className="news-loading"><FiLoader className="spinner" /> Loading latest news...</div>
          ) : newsError ? (
            <p className="empty-state">{newsError}</p>
          ) : newsItems.length === 0 ? (
            <p className="empty-state">No news available.</p>
          ) : (
            <ul className="news-list">
              {newsItems.map((item, index) => (
                <li key={item.id || index} className="news-item">
                  <div className="news-header">
                    <span className={`news-impact ${item.impact?.toLowerCase()}`}>{item.impact}</span>
                    <span className="news-category">{item.category}</span>
                  </div>
                  <span className="news-headline">{item.headline}</span>
                  <span className="news-summary">{item.summary}</span>
                  <div className="news-meta">
                    <span className="news-region">{item.region}</span>
                    <span className="news-date">{item.date}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
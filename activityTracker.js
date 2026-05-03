// src/activityTracker.js
// Tracks user activity across the app using sessionStorage

const ACTIVITY_KEY = 'user_activity';
const MAX_ACTIVITIES = 20;

export function trackPageVisit(pageName, details = {}) {
  const activities = getActivities();
  activities.unshift({
    type: 'page_visit',
    page: pageName,
    details,
    timestamp: new Date().toISOString(),
  });
  // Keep only the latest entries
  sessionStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities.slice(0, MAX_ACTIVITIES)));
}

export function trackMaterialSearch(material, page, manufacturer = '') {
  const activities = getActivities();
  activities.unshift({
    type: 'material_search',
    material,
    manufacturer,
    page,
    timestamp: new Date().toISOString(),
  });
  sessionStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities.slice(0, MAX_ACTIVITIES)));
}

export function trackAction(action, details = {}) {
  const activities = getActivities();
  activities.unshift({
    type: 'action',
    action,
    details,
    timestamp: new Date().toISOString(),
  });
  sessionStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities.slice(0, MAX_ACTIVITIES)));
}

export function getActivities() {
  try {
    return JSON.parse(sessionStorage.getItem(ACTIVITY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getMaterialsWorkedOn() {
  const activities = getActivities();
  const materials = activities
    .filter(a => a.type === 'material_search')
    .map(a => a.material);
  return [...new Set(materials)];
}

export function getVisitedPages() {
  const activities = getActivities();
  const pages = {};
  activities
    .filter(a => a.type === 'page_visit')
    .forEach(a => {
      pages[a.page] = (pages[a.page] || 0) + 1;
    });
  return pages;
}

// Save current session data to localStorage before logout
export function saveLastSession() {
  const activities = getActivities();
  const materials = getMaterialsWorkedOn();
  const pages = getVisitedPages();
  const lastVisited = activities.find(a => a.type === 'page_visit');
  if (activities.length > 0) {
    localStorage.setItem('lastSession', JSON.stringify({
      activities,
      materials,
      pages,
      lastVisitedPage: lastVisited ? lastVisited.page : null,
      savedAt: new Date().toISOString(),
    }));
  }
}

// Retrieve last session data from localStorage
export function getLastSession() {
  try {
    return JSON.parse(localStorage.getItem('lastSession') || 'null');
  } catch {
    return null;
  }
}

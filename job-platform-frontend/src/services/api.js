const API_BASE_URL = 'http://localhost:8000/api';

// Helper pour les appels API
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur API');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Services d'authentification
export const authService = {
  login: (email, password) => 
    apiCall('/login', { method: 'POST', body: { email, password } }),

  register: (userData) => 
    apiCall('/register', { method: 'POST', body: userData }),

  logout: () => 
    apiCall('/logout', { method: 'POST' }),

  getMe: () => 
    apiCall('/me'),
};

// Services pour les jobs
export const jobService = {
  getJobs: () => 
    apiCall('/jobs'),

  searchJobs: (filters) => {
    const params = new URLSearchParams();
    if (filters.title) params.append('title', filters.title);
    if (filters.company) params.append('company', filters.company);
    if (filters.location) params.append('location', filters.location);
    
    return apiCall(`/jobs/search?${params.toString()}`);
  },

  getJob: (id) => 
    apiCall(`/jobs/${id}`),

  createJob: (jobData) => 
    apiCall('/jobs', { method: 'POST', body: jobData }),

  updateJob: (id, jobData) => 
    apiCall(`/jobs/${id}`, { method: 'PUT', body: jobData }),

  deleteJob: (id) => 
    apiCall(`/jobs/${id}`, { method: 'DELETE' }),
};

// Services pour les candidatures
export const applicationService = {
  getApplications: () => 
    apiCall('/applications'),

  applyToJob: (jobId, coverLetter) => 
    apiCall(`/jobs/${jobId}/apply`, { 
      method: 'POST', 
      body: { cover_letter: coverLetter } 
    }),

  updateApplication: (applicationId, status) => 
    apiCall(`/applications/${applicationId}`, { 
      method: 'PUT', 
      body: { status } 
    }),

  deleteApplication: (applicationId) => 
    apiCall(`/applications/${applicationId}`, { method: 'DELETE' }),
};

// Services admin
export const adminService = {
  adminOnly: () => 
    apiCall('/admin-only'),
};
// API configuration and utility functions
const API_BASE_URL = 'https://resume-formatter-7rc4.onrender.com/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use the status text
      }
      throw new ApiError(response.status, errorMessage);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const api = {
  // Upload CV file
  uploadCV: async (file: File): Promise<{ cvData: any; originalText?: string }> => {
    const formData = new FormData();
    formData.append('cv', file);
    
    const response = await fetch(`${API_BASE_URL}/cv/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use the status text
      }
      throw new ApiError(response.status, errorMessage);
    }

    return await response.json();
  },

  // Get all CVs
  getAllCVs: () => apiRequest<any[]>('/cv/all'),

  // Get CV by ID
  getCVById: (id: string) => apiRequest<any>(`/cv/${id}`),

  // Update CV
  updateCV: (id: string, data: any) => 
    apiRequest<any>(`/cv/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Export CV as text
  exportCVAsText: async (id: string, filename: string) => {
    const response = await fetch(`${API_BASE_URL}/cv/${id}/export`);
    if (!response.ok) throw new ApiError(response.status, 'Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Export CV as DOCX
  exportCVAsDocx: async (id: string, filename: string) => {
    const response = await fetch(`${API_BASE_URL}/cv/${id}/export-docx`);
    if (!response.ok) throw new ApiError(response.status, 'Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Export CV as PDF
  exportCVAsPdf: async (id: string, filename: string) => {
    const response = await fetch(`${API_BASE_URL}/cv/${id}/export-pdf`);
    if (!response.ok) throw new ApiError(response.status, 'Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
import { auth } from '../firebase';

const API_BASE_URL = 'http://localhost:8000/api';

export interface IssueData {
  title: string;
  description: string;
  issue_type: string;
  severity: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string;
  status: string;
}

export const createIssue = async (data: IssueData) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
        throw new Error("User not authenticated or no email found.");
    }
    
    const payload = {
        ...data,
        user_email: user.email,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
    };
    
    const response = await fetch(`${API_BASE_URL}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(`Failed to create issue: ${errData.detail || response.statusText}`);
    }
    
    const result = await response.json();
    return result.issue_id;
  } catch (e) {
    console.error("Error creating issue: ", e);
    throw e;
  }
};

export const getIssues = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/issues`);
    if (!response.ok) {
        throw new Error('Failed to fetch issues');
    }
    const issues = await response.json();
    
    // Map backend response fields to match frontend expectations if necessary
    return issues.map((issue: any) => ({
        id: issue.issue_id,
        ...issue,
        created_at: { toMillis: () => new Date(issue.created_at).getTime() } // Shim for existing Firebase timestamp usage in components
    }));
  } catch (e) {
    console.error("Error getting issues: ", e);
    throw e;
  }
};

export const updateIssueStatus = async (id: string, status: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update issue status');
    return await response.json();
  } catch (error) {
    console.error('Error updating issue status:', error);
    throw error;
  }
};

export const deleteIssue = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/issues/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete issue');
    return await response.json();
  } catch (error) {
    console.error('Error deleting issue:', error);
    throw error;
  }
};

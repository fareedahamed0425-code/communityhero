import { useState, useEffect, useRef } from 'react';
import { Users, AlertTriangle, ShieldAlert, CheckCircle, Trash2, Zap } from 'lucide-react';
import { getIssues, updateIssueStatus, deleteIssue } from '../services/issueService';
import { getUsers, updateUserRole, deleteUser } from '../services/userService';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'issues' | 'users'>('issues');
  const [issues, setIssues] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);

  const knownCriticalIds = useRef<Set<string>>(new Set());

  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio API error", e);
    }
  };

  // Auto poll every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [issuesData, usersData] = await Promise.all([
          getIssues(),
          getUsers()
        ]);
        
        const severityWeight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        const statusWeight: Record<string, number> = { reported: 3, ai_triaged: 3, assigned: 2, in_progress: 2, verification: 1, resolved: 0, closed: 0, reopened: 3 };

        issuesData.sort((a: any, b: any) => {
          const statusA = statusWeight[(a.status || 'reported').toLowerCase()] ?? 0;
          const statusB = statusWeight[(b.status || 'reported').toLowerCase()] ?? 0;
          if (statusA !== statusB) return statusB - statusA;

          const sevA = severityWeight[(a.severity || 'low').toLowerCase()] ?? 0;
          const sevB = severityWeight[(b.severity || 'low').toLowerCase()] ?? 0;
          if (sevA !== sevB) return sevB - sevA;

          const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : new Date(a.created_at).getTime();
          const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : new Date(b.created_at).getTime();
          return timeB - timeA;
        });

        // Check for new critical issues
        let newCriticalFound = false;
        issuesData.forEach((issue: any) => {
          if (issue.severity?.toLowerCase() === 'critical' && issue.status !== 'resolved' && issue.status !== 'closed') {
            const id = issue.id || issue.issue_id;
            if (id && !knownCriticalIds.current.has(id)) {
              knownCriticalIds.current.add(id);
              newCriticalFound = true;
            }
          }
        });
        
        if (newCriticalFound && issues.length > 0) {
          playAlertSound();
        }
        
        setIssues(issuesData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const handleUpdateIssueStatus = async (id: string, status: string) => {
    try {
      await updateIssueStatus(id, status);
      setRefreshKey(prev => prev + 1);
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleDeleteIssue = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      try {
        await deleteIssue(id);
        setRefreshKey(prev => prev + 1);
      } catch (e) {
        alert("Failed to delete issue");
      }
    }
  };

  const handleUpdateUserRole = async (id: string, role: string) => {
    try {
      await updateUserRole(id, role);
      setRefreshKey(prev => prev + 1);
    } catch (e) {
      alert("Failed to update role");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        setRefreshKey(prev => prev + 1);
      } catch (e) {
        alert("Failed to delete user");
      }
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    if (timestamp.toDate) return timestamp.toDate().toLocaleString();
    if (timestamp.toMillis) return new Date(timestamp.toMillis()).toLocaleString();
    return new Date(timestamp).toLocaleString();
  };

  const openIssues = issues.filter(i => i.status !== 'resolved' && i.status !== 'closed').length;
  const criticalIssues = issues.filter(i => i.severity?.toLowerCase() === 'critical').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
          Admin Command Center
        </h1>
        <p className="text-on-surface-variant font-body text-sm">
          Full control over community data. Manage users, edit issue statuses, and maintain the platform.
        </p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl shadow-sm border border-surface-container-low">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="bg-primary-container p-2 sm:p-2.5 rounded-xl">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-on-primary-container" />
            </div>
          </div>
          <h3 className="text-xs sm:text-sm font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Total Users</h3>
          <p className="text-2xl sm:text-4xl font-headline font-black text-on-surface">{loading ? '...' : users.length}</p>
        </div>

        <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl shadow-sm border border-surface-container-low">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="bg-secondary-container p-2 sm:p-2.5 rounded-xl">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-on-secondary-container" />
            </div>
          </div>
          <h3 className="text-xs sm:text-sm font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Active Issues</h3>
          <p className="text-2xl sm:text-4xl font-headline font-black text-on-surface">{loading ? '...' : openIssues}</p>
        </div>

        <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl shadow-sm border border-error-container">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="bg-error-container p-2 sm:p-2.5 rounded-xl animate-pulse">
              <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-on-error-container" />
            </div>
          </div>
          <h3 className="text-xs sm:text-sm font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Critical Alerts</h3>
          <p className="text-2xl sm:text-4xl font-headline font-black text-error">{loading ? '...' : criticalIssues}</p>
        </div>

        <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl shadow-sm border border-surface-container-low">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="bg-tertiary-container p-2 sm:p-2.5 rounded-xl">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-on-tertiary-container" />
            </div>
          </div>
          <h3 className="text-xs sm:text-sm font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1">System Status</h3>
          <p className="text-2xl sm:text-4xl font-headline font-black text-tertiary">Online</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-surface-container-low p-1 rounded-xl w-fit mb-6 border border-surface-container">
        <button 
          onClick={() => setActiveTab('issues')}
          className={`px-6 py-2 rounded-lg text-sm font-label font-bold transition-all ${
            activeTab === 'issues' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Manage Issues
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2 rounded-lg text-sm font-label font-bold transition-all ${
            activeTab === 'users' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Manage Users
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-low overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-container">
            <thead className="bg-surface-container-low/50">
              <tr>
                {activeTab === 'issues' ? (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Issue</th>
                    <th className="px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Reported</th>
                    <th className="px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">User Email</th>
                    <th className="px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Issues Reported</th>
                    <th className="px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-right text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-surface-container-lowest divide-y divide-surface-container">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant animate-pulse">Loading...</td>
                </tr>
              ) : activeTab === 'issues' ? (
                issues.map(issue => (
                  <tr 
                    key={issue.id || issue.issue_id}
                    className="hover:bg-surface-container-lowest/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-on-surface">{issue.title || issue.issue_type}</div>
                      <div className="text-xs text-on-surface-variant">{(issue.id || issue.issue_id)?.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">
                      {formatTime(issue.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                        issue.severity === 'critical' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-highest'
                      }`}>{issue.severity}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={issue.status || 'reported'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleUpdateIssueStatus(issue.id || issue.issue_id, e.target.value)}
                        className="bg-surface-container-low border border-outline-variant text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
                      >
                        <option value="reported">Reported</option>
                        <option value="ai_triaged">AI Triaged</option>
                        <option value="verification">Verification</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                        <option value="reopened">Reopened</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end items-center h-full">
                      {issue.severity === 'critical' && issue.status !== 'resolved' && issue.status !== 'closed' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateIssueStatus(issue.id || issue.issue_id, 'resolved');
                          }}
                          className="px-3 py-1.5 bg-error text-white hover:bg-red-700 rounded-lg transition-colors ml-2 font-bold text-xs flex items-center shadow-sm"
                          title="Quick Resolve"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Fix
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteIssue(issue.id || issue.issue_id);
                        }}
                        className="p-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-colors ml-2"
                        title="Delete Issue"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                users.map(user => (
                  <tr key={user.user_id} className="hover:bg-surface-container-lowest/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-on-surface">{user.email}</div>
                      <div className="text-xs text-on-surface-variant">{user.user_id?.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface">
                      {user.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface">
                      {user.issues?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={user.role || 'citizen'}
                        onChange={(e) => handleUpdateUserRole(user.user_id, e.target.value)}
                        className="bg-surface-container-low border border-outline-variant text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="moderator">Moderator</option>
                        <option value="officer">Officer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="p-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-colors ml-2"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedIssue(null)}>
          <div 
            className="bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-headline font-bold text-on-surface">Issue Details</h2>
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {selectedIssue.image_url && (
                  <img 
                    src={selectedIssue.image_url} 
                    alt="Issue" 
                    className="w-full h-auto max-h-80 object-contain bg-surface-container-low rounded-xl border border-outline-variant" 
                  />
                )}
                
                <div>
                  <h4 className="font-label font-bold text-on-surface text-sm uppercase tracking-wider mb-1">Title & Type</h4>
                  <p className="font-body text-on-surface text-lg">{selectedIssue.title || selectedIssue.issue_type}</p>
                </div>

                <div>
                  <h4 className="font-label font-bold text-on-surface text-sm uppercase tracking-wider mb-1">Description</h4>
                  <p className="font-body text-on-surface-variant text-base whitespace-pre-wrap bg-surface-container-low p-4 rounded-xl">
                    {selectedIssue.description || 'No additional description provided by the citizen.'}
                  </p>
                </div>
                
                {selectedIssue.latitude && selectedIssue.longitude && (
                  <div className="flex items-center gap-2">
                    <span className="font-label font-bold text-on-surface text-sm uppercase tracking-wider">Location:</span>
                    <a 
                      href={`https://www.google.com/maps?q=${selectedIssue.latitude},${selectedIssue.longitude}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="font-body text-primary hover:underline text-sm font-semibold"
                    >
                      {selectedIssue.latitude.toFixed(5)}, {selectedIssue.longitude.toFixed(5)} 📍
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-surface-container-low border-t border-surface-container flex justify-end rounded-b-2xl">
              <button 
                onClick={() => setSelectedIssue(null)}
                className="px-6 py-2 bg-primary text-on-primary rounded-xl font-label font-bold hover:bg-surface-tint transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

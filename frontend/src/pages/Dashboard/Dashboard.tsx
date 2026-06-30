import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock, AlertTriangle, ChevronRight, Filter, Search, Camera } from 'lucide-react';
import { getIssues } from '../../services/issueService';
import { getUsers } from '../../services/userService';

interface DashboardProps {
  isAdminView?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isAdminView = false }) => {
  const [activeTab, setActiveTab] = useState('queue');
  const [issues, setIssues] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getIssues();
        // Sort by created_at descending if available
        data.sort((a: any, b: any) => {
          const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
          const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
          return timeB - timeA;
        });
        setIssues(data);

        if (isAdminView) {
          const usersData = await getUsers();
          setUsers(usersData);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdminView]);

  const openIssues = issues.filter(i => i.status !== 'Resolved').length;
  const resolvedIssues = issues.filter(i => i.status === 'Resolved').length;
  const criticalIssues = issues.filter(i => i.severity === 'Critical').length;
  
  // Format timestamp helper
  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    if (timestamp.toMillis) {
      return new Date(timestamp.toMillis()).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
            {isAdminView ? 'Admin Dashboard' : 'Community Dashboard'}
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            {isAdminView 
              ? 'Monitor civic issues, track SLA compliance, and verify reports.'
              : 'Track all civic issues reported by your community.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="h-4 w-4 text-outline absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search ID, Location..." 
              className="pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-body outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all w-full md:w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-surface-container-low border border-outline-variant px-4 py-2 rounded-xl text-sm font-label font-bold text-on-surface hover:bg-surface-container transition-colors active:scale-95">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>
      
      {/* Dynamic Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl shadow-sm border border-surface-container-low hover:border-primary/30 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="bg-primary-container p-2 sm:p-2.5 rounded-xl group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-on-primary-container" />
            </div>
            <span className="text-[10px] sm:text-xs font-label font-bold bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">Live</span>
          </div>
          <h3 className="text-xs sm:text-sm font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Open Issues</h3>
          <p className="text-2xl sm:text-4xl font-headline font-black text-on-surface">
            {loading ? '...' : openIssues}
          </p>
        </div>

        <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl shadow-sm border border-surface-container-low hover:border-secondary/30 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="bg-secondary-container p-2 sm:p-2.5 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-on-secondary-container" />
            </div>
            <span className="text-[10px] sm:text-xs font-label font-bold bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">Total</span>
          </div>
          <h3 className="text-xs sm:text-sm font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Resolved</h3>
          <p className="text-2xl sm:text-4xl font-headline font-black text-secondary">
            {loading ? '...' : resolvedIssues}
          </p>
        </div>

        <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl shadow-sm border border-error-container hover:border-error/40 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-error/5 rounded-bl-full -z-10 group-hover:bg-error/10 transition-colors"></div>
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="bg-error-container p-2 sm:p-2.5 rounded-xl group-hover:scale-110 transition-transform animate-pulse">
              <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-on-error-container" />
            </div>
          </div>
          <h3 className="text-xs sm:text-sm font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Critical Priority</h3>
          <p className="text-2xl sm:text-4xl font-headline font-black text-error">
            {loading ? '...' : criticalIssues}
          </p>
        </div>

        <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-2xl shadow-sm border border-surface-container-low hover:border-tertiary/30 hover:shadow-md transition-all duration-300 group">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="bg-tertiary-container p-2 sm:p-2.5 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-on-tertiary-container" />
            </div>
          </div>
          <h3 className="text-xs sm:text-sm font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Avg Resolution Time</h3>
          <p className="text-2xl sm:text-4xl font-headline font-black text-tertiary">N/A</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-surface-container-low p-1 rounded-xl w-fit mb-6 border border-surface-container">
        <button 
          onClick={() => setActiveTab('queue')}
          className={`px-6 py-2 rounded-lg text-sm font-label font-bold transition-all ${
            activeTab === 'queue' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Priority Queue
        </button>
        <button 
          onClick={() => setActiveTab('recent')}
          className={`px-6 py-2 rounded-lg text-sm font-label font-bold transition-all ${
            activeTab === 'recent' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Recent Activity
        </button>
        {isAdminView && (
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg text-sm font-label font-bold transition-all ${
              activeTab === 'users' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Users Data
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'users' ? (
        <div className="space-y-6">
          {users.length === 0 ? (
            <div className="bg-surface-container-lowest p-8 rounded-2xl text-center border border-surface-container-low shadow-sm">
              <ShieldAlert className="h-10 w-10 text-outline mb-4 mx-auto opacity-50" />
              <p className="text-on-surface-variant">No user data found.</p>
            </div>
          ) : (
            users.map(user => (
              <div key={user.email} className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-low overflow-hidden transition-all hover:shadow-md">
                <div className="bg-surface-container-low/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-container gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-on-surface">{user.email}</h3>
                      <p className="text-xs font-body text-on-surface-variant">User ID: {user.user_id}</p>
                    </div>
                  </div>
                  <span className="bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full text-xs font-bold w-fit">
                    {user.issues.length} {user.issues.length === 1 ? 'Complaint' : 'Complaints'}
                  </span>
                </div>
                <div className="p-4 bg-surface-container-lowest">
                  <div className="space-y-3">
                    {user.issues.map((issue: any) => (
                      <div key={issue.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-surface-container hover:border-primary/30 transition-colors gap-4">
                         <div className="flex items-center gap-4">
                           {issue.image_url ? (
                              <img src={issue.image_url} alt="Issue" className="h-12 w-12 object-cover rounded-lg shadow-sm" />
                            ) : (
                              <div className="h-12 w-12 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant">
                                <Camera className="h-5 w-5" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-bold text-on-surface mb-1">{issue.title || issue.issue_type}</div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 inline-flex text-[10px] font-label font-bold rounded-md border ${
                                  issue.status === 'Needs Verification' ? 'bg-secondary-container text-on-secondary-container border-secondary/20' :
                                  'bg-primary-container text-on-primary-container border-primary/20'
                                }`}>
                                  {issue.status || 'Pending'}
                                </span>
                                <span className={`px-2 py-0.5 inline-flex text-[10px] font-label font-bold rounded-md border ${
                                  issue.severity === 'Critical' ? 'bg-error-container text-on-error-container border-error/20' :
                                  issue.severity === 'High' ? 'bg-tertiary-container text-on-tertiary-container border-tertiary/20' :
                                  'bg-surface-container-highest text-on-surface border-outline-variant/50'
                                }`}>
                                  {issue.severity || 'Unassigned'}
                                </span>
                              </div>
                            </div>
                         </div>
                         <div className="text-xs text-on-surface-variant font-medium sm:text-right flex items-center sm:items-end gap-2 sm:flex-col">
                           <Clock className="h-3 w-3 inline sm:hidden" />
                           {formatTime(issue.created_at)}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-low overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-container">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Issue Details</th>
                <th className="px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Reported</th>
                <th className="px-6 py-4 text-right text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-surface-container-lowest divide-y divide-surface-container">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-on-surface-variant">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-8 w-8 bg-surface-container rounded-full mb-4"></div>
                      <div className="h-4 bg-surface-container rounded w-1/4"></div>
                    </div>
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-on-surface-variant">
                    <div className="flex flex-col items-center">
                      <ShieldAlert className="h-10 w-10 text-outline mb-4 opacity-50" />
                      <p>No issues have been reported yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-surface-container-lowest/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-surface-container p-3 rounded-xl overflow-hidden shrink-0">
                          {issue.image_url ? (
                            <img src={issue.image_url} alt="Issue" className="h-8 w-8 object-cover rounded-md" />
                          ) : (
                            <Camera className="h-5 w-5 text-on-surface-variant" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-headline font-bold text-on-surface group-hover:text-primary transition-colors">{issue.title || issue.issue_type}</div>
                          <div className="text-xs font-body text-on-surface-variant">{issue.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-label font-bold rounded-md border ${
                        issue.severity === 'Critical' ? 'bg-error-container text-on-error-container border-error/20' :
                        issue.severity === 'High' ? 'bg-tertiary-container text-on-tertiary-container border-tertiary/20' :
                        'bg-surface-container-highest text-on-surface border-outline-variant/50'
                      }`}>
                        {issue.severity || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-label font-bold rounded-md border ${
                        issue.status === 'Needs Verification' ? 'bg-secondary-container text-on-secondary-container border-secondary/20' :
                        'bg-primary-container text-on-primary-container border-primary/20'
                      }`}>
                        {issue.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-body text-on-surface-variant">
                      {formatTime(issue.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="inline-flex items-center justify-center p-2 rounded-lg text-outline hover:bg-primary/10 hover:text-primary transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};

export default Dashboard;

'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Activity,
  RefreshCw,
  Send,
  Trash2,
  Edit,
  Plus
} from 'lucide-react'

interface SystemNotification {
  id: string
  title: string
  message: string
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  type: 'system' | 'maintenance' | 'security' | 'update'
  status: 'active' | 'scheduled' | 'sent' | 'draft'
  targetAudience: 'all' | 'admins' | 'users' | 'specific'
  scheduledFor?: string
  createdAt: string
  createdBy: string
  sentAt?: string
  recipients?: number
}

const priorityConfig = {
  P0: { name: 'Critical', color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
  P1: { name: 'High', color: 'orange', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
  P2: { name: 'Medium', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  P3: { name: 'Low', color: 'gray', bgColor: 'bg-gray-50', textColor: 'text-gray-700', borderColor: 'border-gray-200' },
  P4: { name: 'Silent', color: 'gray', bgColor: 'bg-gray-25', textColor: 'text-gray-500', borderColor: 'border-gray-100' }
}

const typeConfig = {
  system: { name: 'System', icon: Activity, color: 'blue' },
  maintenance: { name: 'Maintenance', icon: Clock, color: 'yellow' },
  security: { name: 'Security', icon: AlertTriangle, color: 'red' },
  update: { name: 'Update', icon: RefreshCw, color: 'green' }
}

export default function SystemNotificationsPage() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'active' | 'scheduled' | 'sent' | 'drafts'>('active')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockNotifications: SystemNotification[] = [
      {
        id: '1',
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance will occur on Sunday, 2AM-4AM EST. Some services may be temporarily unavailable.',
        priority: 'P1',
        type: 'maintenance',
        status: 'scheduled',
        targetAudience: 'all',
        scheduledFor: '2024-02-04T02:00:00Z',
        createdAt: '2024-01-28T10:00:00Z',
        createdBy: 'admin@laundrylobby.com'
      },
      {
        id: '2',
        title: 'Security Update Available',
        message: 'A critical security update is available. Please update your systems at your earliest convenience.',
        priority: 'P0',
        type: 'security',
        status: 'active',
        targetAudience: 'admins',
        createdAt: '2024-01-27T15:30:00Z',
        createdBy: 'security@laundrylobby.com',
        sentAt: '2024-01-27T15:35:00Z',
        recipients: 45
      },
      {
        id: '3',
        title: 'New Feature Release',
        message: 'We\'ve released new priority management features. Check out the updated notification system!',
        priority: 'P2',
        type: 'update',
        status: 'sent',
        targetAudience: 'all',
        createdAt: '2024-01-26T09:00:00Z',
        createdBy: 'product@laundrylobby.com',
        sentAt: '2024-01-26T09:15:00Z',
        recipients: 1250
      }
    ]

    setTimeout(() => {
      setNotifications(mockNotifications)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredNotifications = notifications.filter(n => n.status === activeTab)

  const getStatusBadge = (status: string) => {
    const config = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Scheduled' },
      sent: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Sent' },
      draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Draft' }
    }
    const statusConfig = config[status as keyof typeof config] || config.draft
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
        {statusConfig.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">System Notifications</h1>
          <p className="text-gray-600 mt-1">Manage platform-wide system notifications and announcements</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Notification
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">
                {notifications.filter(n => n.status === 'scheduled').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-600">
                {notifications.filter(n => n.status === 'sent').length}
              </p>
            </div>
            <Send className="w-8 h-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recipients</p>
              <p className="text-2xl font-bold text-purple-600">
                {notifications.reduce((sum, n) => sum + (n.recipients || 0), 0).toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'active', name: 'Active', count: notifications.filter(n => n.status === 'active').length },
            { id: 'scheduled', name: 'Scheduled', count: notifications.filter(n => n.status === 'scheduled').length },
            { id: 'sent', name: 'Sent', count: notifications.filter(n => n.status === 'sent').length },
            { id: 'drafts', name: 'Drafts', count: notifications.filter(n => n.status === 'draft').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} notifications</h3>
            <p className="text-gray-600">
              {activeTab === 'active' && 'No active system notifications at the moment.'}
              {activeTab === 'scheduled' && 'No notifications are currently scheduled.'}
              {activeTab === 'sent' && 'No notifications have been sent yet.'}
              {activeTab === 'drafts' && 'No draft notifications saved.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const priorityStyle = priorityConfig[notification.priority]
            const typeStyle = typeConfig[notification.type]
            const TypeIcon = typeStyle.icon
            
            return (
              <div key={notification.id} className={`p-6 rounded-lg border ${priorityStyle.bgColor} ${priorityStyle.borderColor}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <TypeIcon className={`w-5 h-5 mr-2 text-${typeStyle.color}-600`} />
                      <h3 className={`font-medium ${priorityStyle.textColor}`}>{notification.title}</h3>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${priorityStyle.bgColor} ${priorityStyle.textColor}`}>
                        {notification.priority}
                      </span>
                      <span className="ml-2">
                        {getStatusBadge(notification.status)}
                      </span>
                    </div>
                    
                    <p className={`text-sm ${priorityStyle.textColor} mb-3`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>Created: {new Date(notification.createdAt).toLocaleDateString()}</span>
                      <span>By: {notification.createdBy}</span>
                      <span>Audience: {notification.targetAudience}</span>
                      {notification.recipients && (
                        <span>Recipients: {notification.recipients.toLocaleString()}</span>
                      )}
                      {notification.scheduledFor && (
                        <span>Scheduled: {new Date(notification.scheduledFor).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create System Notification</h3>
            <p className="text-gray-600 mb-4">This feature will be implemented in the next phase.</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
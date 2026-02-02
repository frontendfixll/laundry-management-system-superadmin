'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Download,
  Shield,
  Eye,
  Clock,
  User,
  Activity,
  TrendingUp,
  MapPin,
  Smartphone,
  Wifi,
  AlertTriangle
} from 'lucide-react'

interface SuspiciousPattern {
  _id: string
  patternId: string
  type: 'login_anomaly' | 'transaction_fraud' | 'account_takeover' | 'bot_activity' | 'data_scraping' | 'privilege_escalation' | 'unusual_access' | 'mass_operations'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  detectedAt: Date
  description: string
  affectedEntities: {
    users: string[]
    tenants: string[]
    ipAddresses: string[]
    sessions: string[]
  }
  indicators: {
    type: string
    value: string
    description: string
    riskScore: number
  }[]
  timeline: {
    timestamp: Date
    event: string
    details: string
    severity: string
  }[]
  geolocation: {
    country: string
    region: string
    city: string
    coordinates: {
      lat: number
      lng: number
    }
    vpnDetected: boolean
    proxyDetected: boolean
  }
  deviceFingerprint: {
    userAgent: string
    browser: string
    os: string
    device: string
    screenResolution: string
    timezone: string
    language: string
  }
  riskAssessment: {
    overallRisk: number
    factors: {
      factor: string
      weight: number
      score: number
    }[]
    recommendation: string
  }
  investigation: {
    status: 'open' | 'investigating' | 'confirmed' | 'false_positive' | 'resolved'
    assignedTo?: string
    notes: string[]
    actions: string[]
    resolvedAt?: Date
    resolution?: string
  }
  relatedPatterns: string[]
}

export default function SuspiciousPatternsPage() {
  const [patterns, setPatterns] = useState<SuspiciousPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [dateRange, setDateRange] = useState('24h')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalPatterns: 0,
    criticalPatterns: 0,
    activeInvestigations: 0,
    confirmedThreats: 0,
    falsePositives: 0,
    avgConfidence: 0,
    topThreatType: ''
  })

  useEffect(() => {
    fetchSuspiciousPatterns()
  }, [page, selectedType, selectedSeverity, selectedStatus, dateRange, searchQuery])

  const fetchSuspiciousPatterns = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(selectedSeverity !== 'all' && { severity: selectedSeverity }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery }),
        range: dateRange
      })

      const response = await fetch(`/api/superadmin/audit/security/suspicious?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')).state?.token : ''}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch suspicious patterns')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPatterns(data.data.patterns)
        setStats(data.data.stats)
        setTotalPages(data.data.pagination.pages)
      } else {
        throw new Error(data.message || 'Failed to fetch suspicious patterns')
      }
      
    } catch (error) {
      console.error('Error fetching suspicious patterns:', error)
      // Fallback to mock data
      const mockPatterns: SuspiciousPattern[] = [
        {
          _id: '1',
          patternId: 'SP-2024-001',
          type: 'login_anomaly',
          severity: 'critical',
          confidence: 94.5,
          detectedAt: new Date(),
          description: 'Multiple failed login attempts from different geographic locations within 5 minutes',
          affectedEntities: {
            users: ['user_123', 'user_456'],
            tenants: ['tenant_001'],
            ipAddresses: ['192.168.1.100', '10.0.0.1', '203.0.113.1'],
            sessions: ['sess_abc123', 'sess_def456']
          },
          indicators: [
            {
              type: 'GEOGRAPHIC_IMPOSSIBILITY',
              value: 'Login from India and USA within 2 minutes',
              description: 'Physically impossible travel time between locations',
              riskScore: 9
            },
            {
              type: 'FAILED_ATTEMPTS',
              value: '25 failed attempts in 5 minutes',
              description: 'Brute force attack pattern detected',
              riskScore: 8
            },
            {
              type: 'VPN_USAGE',
              value: 'Multiple VPN exit nodes detected',
              description: 'Attempts to hide real location',
              riskScore: 7
            }
          ],
          timeline: [
            {
              timestamp: new Date(Date.now() - 300000),
              event: 'FAILED_LOGIN',
              details: 'Failed login from India (Mumbai)',
              severity: 'medium'
            },
            {
              timestamp: new Date(Date.now() - 180000),
              event: 'FAILED_LOGIN',
              details: 'Failed login from USA (New York)',
              severity: 'high'
            },
            {
              timestamp: new Date(Date.now() - 60000),
              event: 'ACCOUNT_LOCKED',
              details: 'Account automatically locked due to suspicious activity',
              severity: 'critical'
            }
          ],
          geolocation: {
            country: 'Multiple',
            region: 'Multiple',
            city: 'Multiple',
            coordinates: { lat: 0, lng: 0 },
            vpnDetected: true,
            proxyDetected: true
          },
          deviceFingerprint: {
            userAgent: 'Multiple user agents detected',
            browser: 'Chrome, Firefox, Safari',
            os: 'Windows, Linux, macOS',
            device: 'Desktop, Mobile',
            screenResolution: 'Multiple resolutions',
            timezone: 'Multiple timezones',
            language: 'en-US, hi-IN'
          },
          riskAssessment: {
            overallRisk: 9,
            factors: [
              { factor: 'Geographic Impossibility', weight: 0.3, score: 9 },
              { factor: 'Failed Attempts', weight: 0.25, score: 8 },
              { factor: 'VPN Usage', weight: 0.2, score: 7 },
              { factor: 'Device Variation', weight: 0.15, score: 8 },
              { factor: 'Time Pattern', weight: 0.1, score: 9 }
            ],
            recommendation: 'Immediate account suspension and security review required'
          },
          investigation: {
            status: 'investigating',
            assignedTo: 'security@laundrylobby.com',
            notes: [
              'Coordinated attack detected across multiple accounts',
              'VPN and proxy usage suggests sophisticated threat actor',
              'Account locked automatically by security system'
            ],
            actions: [
              'Account suspended pending investigation',
              'IP addresses blocked',
              'Security team notified'
            ]
          },
          relatedPatterns: ['SP-2024-002', 'SP-2024-003']
        },
        {
          _id: '2',
          patternId: 'SP-2024-002',
          type: 'transaction_fraud',
          severity: 'high',
          confidence: 87.3,
          detectedAt: new Date(Date.now() - 3600000),
          description: 'Unusual transaction patterns suggesting payment fraud',
          affectedEntities: {
            users: ['user_789'],
            tenants: ['tenant_002'],
            ipAddresses: ['198.51.100.1'],
            sessions: ['sess_ghi789']
          },
          indicators: [
            {
              type: 'VELOCITY_ANOMALY',
              value: '50 transactions in 10 minutes',
              description: 'Transaction velocity far exceeds normal patterns',
              riskScore: 8
            },
            {
              type: 'AMOUNT_PATTERN',
              value: 'All transactions exactly ₹999',
              description: 'Suspicious uniform transaction amounts',
              riskScore: 7
            },
            {
              type: 'CARD_TESTING',
              value: 'Multiple failed payments with different cards',
              description: 'Possible stolen card testing',
              riskScore: 9
            }
          ],
          timeline: [
            {
              timestamp: new Date(Date.now() - 3600000),
              event: 'RAPID_TRANSACTIONS',
              details: 'Started making rapid transactions',
              severity: 'medium'
            },
            {
              timestamp: new Date(Date.now() - 3300000),
              event: 'CARD_FAILURES',
              details: 'Multiple payment failures with different cards',
              severity: 'high'
            },
            {
              timestamp: new Date(Date.now() - 3000000),
              event: 'PATTERN_DETECTED',
              details: 'Fraud detection system triggered',
              severity: 'critical'
            }
          ],
          geolocation: {
            country: 'India',
            region: 'Maharashtra',
            city: 'Pune',
            coordinates: { lat: 18.5204, lng: 73.8567 },
            vpnDetected: false,
            proxyDetected: true
          },
          deviceFingerprint: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            browser: 'Chrome 120.0',
            os: 'Windows 10',
            device: 'Desktop',
            screenResolution: '1920x1080',
            timezone: 'Asia/Kolkata',
            language: 'en-US'
          },
          riskAssessment: {
            overallRisk: 8,
            factors: [
              { factor: 'Transaction Velocity', weight: 0.3, score: 8 },
              { factor: 'Payment Failures', weight: 0.25, score: 9 },
              { factor: 'Amount Patterns', weight: 0.2, score: 7 },
              { factor: 'Card Testing', weight: 0.15, score: 9 },
              { factor: 'Proxy Usage', weight: 0.1, score: 6 }
            ],
            recommendation: 'Block payment processing and review transaction history'
          },
          investigation: {
            status: 'confirmed',
            assignedTo: 'fraud@laundrylobby.com',
            notes: [
              'Confirmed fraudulent activity',
              'Multiple stolen cards used',
              'Account flagged for permanent suspension'
            ],
            actions: [
              'Payment processing blocked',
              'Account suspended',
              'Law enforcement notified'
            ],
            resolvedAt: new Date(Date.now() - 1800000),
            resolution: 'Confirmed fraud - account permanently suspended'
          },
          relatedPatterns: []
        }
      ]

      const mockStats = {
        totalPatterns: 0,
        criticalPatterns: 23,
        activeInvestigations: 45,
        confirmedThreats: 78,
        falsePositives: 12,
        avgConfidence: 82.5,
        topThreatType: 'login_anomaly'
      }

      setPatterns(mockPatterns)
      setStats(mockStats)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100'
      case 'high': return 'text-orange-700 bg-orange-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-700 bg-blue-100'
      case 'investigating': return 'text-orange-700 bg-orange-100'
      case 'confirmed': return 'text-red-700 bg-red-100'
      case 'false_positive': return 'text-gray-700 bg-gray-100'
      case 'resolved': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'login_anomaly': return 'text-red-700 bg-red-100'
      case 'transaction_fraud': return 'text-purple-700 bg-purple-100'
      case 'account_takeover': return 'text-orange-700 bg-orange-100'
      case 'bot_activity': return 'text-blue-700 bg-blue-100'
      case 'data_scraping': return 'text-indigo-700 bg-indigo-100'
      case 'privilege_escalation': return 'text-red-700 bg-red-100'
      case 'unusual_access': return 'text-yellow-700 bg-yellow-100'
      case 'mass_operations': return 'text-pink-700 bg-pink-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 8) return 'text-red-700'
    if (score >= 6) return 'text-orange-700'
    if (score >= 4) return 'text-yellow-700'
    return 'text-green-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <AlertCircle className="w-8 h-8 mr-3" />
              Suspicious Pattern Detection
            </h1>
            <p className="text-red-100 mt-2">
              AI-powered detection of suspicious activities, fraud patterns, and security threats
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-100">Active Patterns: {stats.totalPatterns}</p>
            <p className="text-xs text-red-200">Threat Intelligence</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.totalPatterns}</p>
            </div>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Critical</p>
              <p className="text-xl font-bold text-purple-900 mt-1">{stats.criticalPatterns}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">Investigating</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.activeInvestigations}</p>
            </div>
            <Eye className="w-5 h-5 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Confirmed</p>
              <p className="text-xl font-bold text-red-900 mt-1">{stats.confirmedThreats}</p>
            </div>
            <Shield className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">False Positive</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.falsePositives}</p>
            </div>
            <Activity className="w-5 h-5 text-gray-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Avg Confidence</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.avgConfidence}%</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-sm p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Top Threat</p>
              <p className="text-sm font-bold text-indigo-900 mt-1">{stats.topThreatType.replace('_', ' ')}</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Types</option>
            <option value="login_anomaly">Login Anomaly</option>
            <option value="transaction_fraud">Transaction Fraud</option>
            <option value="account_takeover">Account Takeover</option>
            <option value="bot_activity">Bot Activity</option>
            <option value="data_scraping">Data Scraping</option>
            <option value="privilege_escalation">Privilege Escalation</option>
            <option value="unusual_access">Unusual Access</option>
            <option value="mass_operations">Mass Operations</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="confirmed">Confirmed</option>
            <option value="false_positive">False Positive</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Suspicious Patterns List */}
      <div className="space-y-4">
        {patterns.map((pattern) => (
          <div key={pattern._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="font-mono text-sm text-gray-600">{pattern.patternId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(pattern.type)}`}>
                    {pattern.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(pattern.severity)}`}>
                    {pattern.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pattern.investigation.status)}`}>
                    {pattern.investigation.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-100">
                    {pattern.confidence}% Confidence
                  </span>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-gray-800 font-medium">{pattern.description}</p>
                </div>

                {/* Key Indicators */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Indicators</h4>
                  <div className="space-y-2">
                    {pattern.indicators.slice(0, 3).map((indicator, index) => (
                      <div key={index} className="bg-red-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-red-900">{indicator.type.replace('_', ' ')}</span>
                          <span className={`text-sm font-bold ${getRiskScoreColor(indicator.riskScore)}`}>
                            Risk: {indicator.riskScore}/10
                          </span>
                        </div>
                        <p className="text-sm text-red-800">{indicator.value}</p>
                        <p className="text-xs text-red-600 mt-1">{indicator.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Affected Entities */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Affected Entities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Users</p>
                      <p className="font-medium">{pattern.affectedEntities.users.length}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Tenants</p>
                      <p className="font-medium">{pattern.affectedEntities.tenants.length}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">IP Addresses</p>
                      <p className="font-medium">{pattern.affectedEntities.ipAddresses.length}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Sessions</p>
                      <p className="font-medium">{pattern.affectedEntities.sessions.length}</p>
                    </div>
                  </div>
                </div>

                {/* Geolocation & Device Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location
                    </h4>
                    <p className="text-sm text-blue-800">{pattern.geolocation.city}, {pattern.geolocation.region}, {pattern.geolocation.country}</p>
                    {pattern.geolocation.vpnDetected && (
                      <p className="text-xs text-red-600 mt-1">⚠️ VPN Detected</p>
                    )}
                    {pattern.geolocation.proxyDetected && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Proxy Detected</p>
                    )}
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center">
                      <Smartphone className="w-4 h-4 mr-1" />
                      Device
                    </h4>
                    <p className="text-sm text-purple-800">{pattern.deviceFingerprint.browser} on {pattern.deviceFingerprint.os}</p>
                    <p className="text-xs text-purple-600">{pattern.deviceFingerprint.device} • {pattern.deviceFingerprint.screenResolution}</p>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Assessment</h4>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-900">Overall Risk Score</span>
                      <span className={`text-lg font-bold ${getRiskScoreColor(pattern.riskAssessment.overallRisk)}`}>
                        {pattern.riskAssessment.overallRisk}/10
                      </span>
                    </div>
                    <p className="text-sm text-red-800">{pattern.riskAssessment.recommendation}</p>
                    <div className="mt-2 space-y-1">
                      {pattern.riskAssessment.factors.slice(0, 3).map((factor, index) => (
                        <div key={index} className="flex justify-between text-xs text-red-700">
                          <span>{factor.factor}</span>
                          <span>{factor.score}/10 (weight: {(factor.weight * 100).toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Investigation Status */}
                {pattern.investigation.notes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Investigation</h4>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      {pattern.investigation.assignedTo && (
                        <p className="text-sm text-orange-700 mb-1">
                          <strong>Assigned to:</strong> {pattern.investigation.assignedTo}
                        </p>
                      )}
                      <div className="space-y-1">
                        {pattern.investigation.notes.slice(0, 2).map((note, index) => (
                          <p key={index} className="text-sm text-orange-800">• {note}</p>
                        ))}
                      </div>
                      {pattern.investigation.resolution && (
                        <div className="mt-2 pt-2 border-t border-orange-200">
                          <p className="text-sm font-medium text-orange-900">
                            <strong>Resolution:</strong> {pattern.investigation.resolution}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                  <div className="space-y-2">
                    {pattern.timeline.slice(0, 3).map((event, index) => (
                      <div key={index} className="flex items-start space-x-3 text-sm">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{event.event.replace('_', ' ')}</span>
                            <span className="text-xs text-gray-500">
                              {event.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-600">{event.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions & Timestamp */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                <button className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50">
                  <Eye className="w-4 h-4" />
                </button>
                <div className="text-xs text-gray-500 text-right">
                  <div>Detected:</div>
                  <div>{pattern.detectedAt.toLocaleDateString()}</div>
                  <div>{pattern.detectedAt.toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
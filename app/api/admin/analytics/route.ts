import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get all events with attendees
    const events = await prisma.event.findMany({
      include: {
        attendees: true,
        waitlist: true,
        feedback: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get all members
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Get all blog posts
    const blogPosts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Get all campaigns
    const campaigns = await prisma.campaign.findMany({
      include: {
        recipients: true,
      },
    })

    // Calculate statistics
    const now = new Date()
    const upcomingEvents = events.filter((e) => new Date(e.date) >= now)
    const pastEvents = events.filter((e) => new Date(e.date) < now)

    // Event statistics
    const eventStats = {
      total: events.length,
      upcoming: upcomingEvents.length,
      past: pastEvents.length,
      totalAttendees: events.reduce((sum, e) => sum + e.attendees.length, 0),
      totalAttended: events.reduce((sum, e) => sum + e.attendees.filter((a) => a.attended).length, 0),
      averageAttendance: pastEvents.length > 0
        ? pastEvents.reduce((sum, e) => sum + e.attendees.length, 0) / pastEvents.length
        : 0,
      totalWaitlist: events.reduce((sum, e) => sum + e.waitlist.length, 0),
      totalFeedback: events.reduce((sum, e) => sum + e.feedback.length, 0),
      averageRating: events.reduce((sum, e) => {
        const ratings = e.feedback.filter((f) => f.rating).map((f) => f.rating!)
        return sum + (ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0)
      }, 0) / (events.filter((e) => e.feedback.some((f) => f.rating)).length || 1),
    }

    // Member statistics
    const memberStats = {
      total: members.length,
      pending: members.filter((m) => m.status === 'pending').length,
      active: members.filter((m) => m.status === 'active').length,
      declined: members.filter((m) => m.status === 'declined').length,
      growth: members.filter((m) => {
        const memberDate = new Date(m.createdAt)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return memberDate >= thirtyDaysAgo
      }).length,
    }

    // Blog statistics
    const blogStats = {
      total: blogPosts.length,
      published: blogPosts.filter((p) => p.published).length,
      drafts: blogPosts.filter((p) => !p.published).length,
      totalViews: blogPosts.reduce((sum, p) => sum + p.views, 0),
      averageViews: blogPosts.length > 0
        ? blogPosts.reduce((sum, p) => sum + p.views, 0) / blogPosts.length
        : 0,
    }

    // Campaign statistics
    const campaignStats = {
      total: campaigns.length,
      sent: campaigns.filter((c) => c.status === 'sent').length,
      scheduled: campaigns.filter((c) => c.status === 'scheduled').length,
      drafts: campaigns.filter((c) => c.status === 'draft').length,
      totalRecipients: campaigns.reduce((sum, c) => sum + c.recipients.length, 0),
      totalSent: campaigns.reduce((sum, c) => sum + c.recipients.filter((r) => r.status === 'sent').length, 0),
      totalFailed: campaigns.reduce((sum, c) => sum + c.recipients.filter((r) => r.status === 'failed').length, 0),
    }

    // Attendance trends (last 6 months)
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
    const recentEvents = events.filter((e) => new Date(e.createdAt) >= sixMonthsAgo)
    const attendanceTrends = Array.from({ length: 6 }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0)
      const monthEvents = recentEvents.filter((e) => {
        const eventDate = new Date(e.createdAt)
        return eventDate >= monthStart && eventDate <= monthEnd
      })
      return {
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        events: monthEvents.length,
        attendees: monthEvents.reduce((sum, e) => sum + e.attendees.length, 0),
        attended: monthEvents.reduce((sum, e) => sum + e.attendees.filter((a) => a.attended).length, 0),
      }
    })

    // Member growth trends
    const memberGrowthTrends = Array.from({ length: 6 }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0)
      const monthMembers = members.filter((m) => {
        const memberDate = new Date(m.createdAt)
        return memberDate >= monthStart && memberDate <= monthEnd
      })
      return {
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        newMembers: monthMembers.length,
        activeMembers: monthMembers.filter((m) => m.status === 'active').length,
      }
    })

    // Event attendance comparison (registered vs came)
    const eventAttendanceComparison = pastEvents.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      registered: e.attendees.length,
      attended: e.attendees.filter((a) => a.attended).length,
      noShows: e.attendees.length - e.attendees.filter((a) => a.attended).length,
      attendanceRate: e.attendees.length > 0 
        ? ((e.attendees.filter((a) => a.attended).length / e.attendees.length) * 100).toFixed(1)
        : '0',
      capacity: e.capacity,
    }))

    // Top events by attendance
    const topEvents = [...events]
      .sort((a, b) => b.attendees.length - a.attendees.length)
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        attendees: e.attendees.length,
        attended: e.attendees.filter((a) => a.attended).length,
        capacity: e.capacity,
      }))

    // Top blog posts by views
    const topBlogPosts = [...blogPosts]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        views: p.views,
        published: p.published,
      }))

    return NextResponse.json({
      eventStats,
      memberStats,
      blogStats,
      campaignStats,
      attendanceTrends,
      memberGrowthTrends,
      topEvents,
      topBlogPosts,
      eventAttendanceComparison,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}


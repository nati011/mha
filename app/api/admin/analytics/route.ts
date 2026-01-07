import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Skip database calls during build time or if DATABASE_URL is not set
  // This must be the FIRST thing in the function, before any imports are used
  if (process.env.NEXT_PHASE === 'phase-production-build' || 
      process.env.NEXT_PHASE === 'phase-development-build' ||
      !process.env.DATABASE_URL) {
    return NextResponse.json({
      eventStats: { total: 0, upcoming: 0, past: 0, totalAttendees: 0, totalAttended: 0, averageAttendance: 0, totalWaitlist: 0, totalFeedback: 0, averageRating: 0 },
      memberStats: { total: 0, pending: 0, active: 0, declined: 0, growth: 0 },
      blogStats: { total: 0, published: 0, drafts: 0, totalViews: 0, averageViews: 0 },
      campaignStats: { total: 0, sent: 0, scheduled: 0, drafts: 0, totalRecipients: 0, totalSent: 0, totalFailed: 0 },
      attendanceTrends: [],
      memberGrowthTrends: [],
      topEvents: [],
      topBlogPosts: [],
      eventAttendanceComparison: [],
    })
  }

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
    const upcomingEvents = events.filter((e: typeof events[0]) => new Date(e.date) >= now)
    const pastEvents = events.filter((e: typeof events[0]) => new Date(e.date) < now)

    // Event statistics
    const eventStats = {
      total: events.length,
      upcoming: upcomingEvents.length,
      past: pastEvents.length,
      totalAttendees: events.reduce((sum: number, e: typeof events[0]) => sum + e.attendees.length, 0),
      totalAttended: events.reduce((sum: number, e: typeof events[0]) => sum + e.attendees.filter((a: typeof events[0]['attendees'][0]) => a.attended).length, 0),
      averageAttendance: pastEvents.length > 0
        ? pastEvents.reduce((sum: number, e: typeof events[0]) => sum + e.attendees.length, 0) / pastEvents.length
        : 0,
      totalWaitlist: events.reduce((sum: number, e: typeof events[0]) => sum + e.waitlist.length, 0),
      totalFeedback: events.reduce((sum: number, e: typeof events[0]) => sum + e.feedback.length, 0),
      averageRating: events.reduce((sum: number, e: typeof events[0]) => {
        const ratings = e.feedback.filter((f: typeof events[0]['feedback'][0]) => f.rating).map((f: typeof events[0]['feedback'][0]) => f.rating!)
        return sum + (ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0)
      }, 0) / (events.filter((e: typeof events[0]) => e.feedback.some((f: typeof events[0]['feedback'][0]) => f.rating)).length || 1),
    }

    // Member statistics
    const memberStats = {
      total: members.length,
      pending: members.filter((m: typeof members[0]) => m.status === 'pending').length,
      active: members.filter((m: typeof members[0]) => m.status === 'active').length,
      declined: members.filter((m: typeof members[0]) => m.status === 'declined').length,
      growth: members.filter((m: typeof members[0]) => {
        const memberDate = new Date(m.createdAt)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return memberDate >= thirtyDaysAgo
      }).length,
    }

    // Blog statistics
    const blogStats = {
      total: blogPosts.length,
      published: blogPosts.filter((p: typeof blogPosts[0]) => p.published).length,
      drafts: blogPosts.filter((p: typeof blogPosts[0]) => !p.published).length,
      totalViews: blogPosts.reduce((sum: number, p: typeof blogPosts[0]) => sum + p.views, 0),
      averageViews: blogPosts.length > 0
        ? blogPosts.reduce((sum: number, p: typeof blogPosts[0]) => sum + p.views, 0) / blogPosts.length
        : 0,
    }

    // Campaign statistics
    const campaignStats = {
      total: campaigns.length,
      sent: campaigns.filter((c: typeof campaigns[0]) => c.status === 'sent').length,
      scheduled: campaigns.filter((c: typeof campaigns[0]) => c.status === 'scheduled').length,
      drafts: campaigns.filter((c: typeof campaigns[0]) => c.status === 'draft').length,
      totalRecipients: campaigns.reduce((sum: number, c: typeof campaigns[0]) => sum + c.recipients.length, 0),
      totalSent: campaigns.reduce((sum: number, c: typeof campaigns[0]) => sum + c.recipients.filter((r: typeof campaigns[0]['recipients'][0]) => r.status === 'sent').length, 0),
      totalFailed: campaigns.reduce((sum: number, c: typeof campaigns[0]) => sum + c.recipients.filter((r: typeof campaigns[0]['recipients'][0]) => r.status === 'failed').length, 0),
    }

    // Attendance trends (last 6 months)
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000)
    const recentEvents = events.filter((e: typeof events[0]) => new Date(e.createdAt) >= sixMonthsAgo)
    const attendanceTrends = Array.from({ length: 6 }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0)
      const monthEvents = recentEvents.filter((e: typeof events[0]) => {
        const eventDate = new Date(e.createdAt)
        return eventDate >= monthStart && eventDate <= monthEnd
      })
      return {
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        events: monthEvents.length,
        attendees: monthEvents.reduce((sum: number, e: typeof events[0]) => sum + e.attendees.length, 0),
        attended: monthEvents.reduce((sum: number, e: typeof events[0]) => sum + e.attendees.filter((a: typeof events[0]['attendees'][0]) => a.attended).length, 0),
      }
    })

    // Member growth trends
    const memberGrowthTrends = Array.from({ length: 6 }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0)
      const monthMembers = members.filter((m: typeof members[0]) => {
        const memberDate = new Date(m.createdAt)
        return memberDate >= monthStart && memberDate <= monthEnd
      })
      return {
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        newMembers: monthMembers.length,
        activeMembers: monthMembers.filter((m: typeof members[0]) => m.status === 'active').length,
      }
    })

    // Event attendance comparison (registered vs came)
    const eventAttendanceComparison = pastEvents.map((e: typeof events[0]) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      registered: e.attendees.length,
      attended: e.attendees.filter((a: typeof events[0]['attendees'][0]) => a.attended).length,
      noShows: e.attendees.length - e.attendees.filter((a: typeof events[0]['attendees'][0]) => a.attended).length,
      attendanceRate: e.attendees.length > 0 
        ? ((e.attendees.filter((a: typeof events[0]['attendees'][0]) => a.attended).length / e.attendees.length) * 100).toFixed(1)
        : '0',
      capacity: e.capacity,
    }))

    // Top events by attendance
    const topEvents = [...events]
      .sort((a: typeof events[0], b: typeof events[0]) => b.attendees.length - a.attendees.length)
      .slice(0, 5)
      .map((e: typeof events[0]) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        attendees: e.attendees.length,
        attended: e.attendees.filter((a: typeof events[0]['attendees'][0]) => a.attended).length,
        capacity: e.capacity,
      }))

    // Top blog posts by views
    const topBlogPosts = [...blogPosts]
      .sort((a: typeof blogPosts[0], b: typeof blogPosts[0]) => b.views - a.views)
      .slice(0, 5)
      .map((p: typeof blogPosts[0]) => ({
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


import 'server-only'
import { prisma } from './db'

/**
 * Mark an attendee as attended (signed in)
 */
export async function markAttendeeAsAttended(attendeeId: number) {
  return await prisma.attendee.update({
    where: { id: attendeeId },
    data: {
      attended: true,
      attendedAt: new Date(),
    },
  })
}

/**
 * Mark an attendee as not attended (undo sign-in)
 */
export async function markAttendeeAsNotAttended(attendeeId: number) {
  return await prisma.attendee.update({
    where: { id: attendeeId },
    data: {
      attended: false,
      attendedAt: null,
    },
  })
}

/**
 * Get all attendees who have ever attended any event
 */
export async function getAllAttendedAttendees() {
  return await prisma.attendee.findMany({
    where: {
      attended: true,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          time: true,
          venue: true,
        },
      },
    },
    orderBy: [
      { attendedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  })
}

/**
 * Get unique attendees (by email) who have attended any event
 * Useful for getting a list of all people who have ever attended
 */
export async function getUniqueAttendedAttendees() {
  const attendees = await prisma.attendee.findMany({
    where: {
      attended: true,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          time: true,
          venue: true,
        },
      },
    },
    orderBy: [
      { attendedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  // Group by email and get the most recent attendance for each
  const uniqueAttendees = new Map<string, typeof attendees[0]>()
  
  for (const attendee of attendees) {
    const existing = uniqueAttendees.get(attendee.email)
    if (!existing || 
        (attendee.attendedAt && existing.attendedAt && 
         attendee.attendedAt > existing.attendedAt)) {
      uniqueAttendees.set(attendee.email, attendee)
    }
  }

  return Array.from(uniqueAttendees.values())
}

/**
 * Get attendance statistics
 */
export async function getAttendanceStats() {
  const totalAttendees = await prisma.attendee.count()
  const attendedCount = await prisma.attendee.count({
    where: { attended: true },
  })
  const uniqueAttendedEmails = await prisma.attendee.findMany({
    where: { attended: true },
    select: { email: true },
    distinct: ['email'],
  })

  return {
    totalAttendees,
    attendedCount,
    uniqueAttendedCount: uniqueAttendedEmails.length,
  }
}


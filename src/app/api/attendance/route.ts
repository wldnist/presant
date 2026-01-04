// API Route for Attendance
import { NextRequest, NextResponse } from 'next/server';
import { createAttendanceService } from '@/services/serviceFactory';

// Initialize database on server-side
import '@/infrastructure/database/migrate';

export async function GET(request: NextRequest) {
  try {
    const service = createAttendanceService();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    
    if (eventId) {
      const records = await service.getRegisteredParticipantsWithAttendance(eventId);
      return NextResponse.json(records);
    }
    
    const allAttendance = await service.getAllAttendance();
    return NextResponse.json(allAttendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const service = createAttendanceService();
    
    // Check if it's bulk submission or single update
    if (Array.isArray(body)) {
      // Bulk submission
      await service.submitAttendance(body);
      return NextResponse.json({ success: true }, { status: 201 });
    } else {
      // Single update
      const { participantId, eventId, status } = body;
      if (!participantId || !eventId || !status) {
        return NextResponse.json(
          { error: 'participantId, eventId, and status are required' },
          { status: 400 }
        );
      }
      await service.updateAttendanceStatus(participantId, eventId, status);
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error submitting attendance:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit attendance' },
      { status: 500 }
    );
  }
}


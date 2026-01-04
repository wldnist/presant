// API Route for Participants
import { NextRequest, NextResponse } from 'next/server';
import { createParticipantService } from '@/services/serviceFactory';

// Initialize database on server-side
import '@/infrastructure/database/migrate';

export async function GET() {
  try {
    const service = createParticipantService();
    const participants = await service.getAllParticipants();
    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch participants';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const service = createParticipantService();
    const participant = await service.createParticipant(body);
    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error('Error creating participant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create participant';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


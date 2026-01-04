// API Route for Event Instance Participants
import { NextRequest, NextResponse } from 'next/server';
import { createEventInstanceService } from '@/services/serviceFactory';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const service = createEventInstanceService();
    const participants = await service.getRegisteredParticipants(uuid);
    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching registered participants:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch registered participants' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const body = await request.json();
    const { participantId } = body;
    
    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId is required' },
        { status: 400 }
      );
    }
    
    const service = createEventInstanceService();
    await service.registerParticipant(uuid, participantId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error registering participant:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to register participant' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participant_id');
    
    if (!participantId) {
      return NextResponse.json(
        { error: 'participant_id query parameter is required' },
        { status: 400 }
      );
    }
    
    const service = createEventInstanceService();
    await service.unregisterParticipant(uuid, participantId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unregistering participant:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unregister participant' },
      { status: 500 }
    );
  }
}


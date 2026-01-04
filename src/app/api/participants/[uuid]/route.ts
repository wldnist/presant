// API Route for Participant by UUID
import { NextRequest, NextResponse } from 'next/server';
import { createParticipantService } from '@/services/serviceFactory';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const service = createParticipantService();
    const participant = await service.getParticipantByUuid(uuid);
    
    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error fetching participant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch participant';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const body = await request.json();
    const service = createParticipantService();
    const participant = await service.updateParticipant(uuid, body);
    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error updating participant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update participant';
    return NextResponse.json(
      { error: errorMessage },
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
    const service = createParticipantService();
    await service.deleteParticipant(uuid);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting participant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete participant';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


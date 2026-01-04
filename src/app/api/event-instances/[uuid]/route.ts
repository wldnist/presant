// API Route for Event Instance by UUID
import { NextRequest, NextResponse } from 'next/server';
import { createEventInstanceService } from '@/services/serviceFactory';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const service = createEventInstanceService();
    const eventInstance = await service.getEventInstanceByUuid(uuid);
    
    if (!eventInstance) {
      return NextResponse.json(
        { error: 'Event instance not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(eventInstance);
  } catch (error) {
    console.error('Error fetching event instance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch event instance' },
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
    const service = createEventInstanceService();
    const eventInstance = await service.updateEventInstance(uuid, body);
    return NextResponse.json(eventInstance);
  } catch (error) {
    console.error('Error updating event instance:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update event instance' },
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
    const service = createEventInstanceService();
    await service.deleteEventInstance(uuid);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event instance:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete event instance' },
      { status: 500 }
    );
  }
}


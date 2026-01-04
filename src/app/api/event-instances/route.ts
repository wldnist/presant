// API Route for Event Instances
import { NextRequest, NextResponse } from 'next/server';
import { createEventInstanceService } from '@/services/serviceFactory';

// Initialize database on server-side
import '@/infrastructure/database/migrate';

export async function GET(request: NextRequest) {
  try {
    const service = createEventInstanceService();
    const { searchParams } = new URL(request.url);
    const masterEventId = searchParams.get('master_event_id');
    
    if (masterEventId) {
      const eventInstances = await service.getEventInstancesByMasterEvent(masterEventId);
      return NextResponse.json(eventInstances);
    }
    
    const eventInstances = await service.getAllEventInstances();
    return NextResponse.json(eventInstances);
  } catch (error) {
    console.error('Error fetching event instances:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch event instances';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const service = createEventInstanceService();
    const eventInstance = await service.createEventInstance(body);
    return NextResponse.json(eventInstance, { status: 201 });
  } catch (error) {
    console.error('Error creating event instance:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create event instance';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


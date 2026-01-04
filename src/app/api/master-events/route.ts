// API Route for Master Events
import { NextRequest, NextResponse } from 'next/server';
import { createMasterEventService } from '@/services/serviceFactory';

// Initialize database on server-side
import '@/infrastructure/database/migrate';

export async function GET(request: NextRequest) {
  try {
    const service = createMasterEventService();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (query) {
      const masterEvents = await service.searchMasterEvents(query);
      return NextResponse.json(masterEvents);
    }
    
    const masterEvents = await service.getAllMasterEvents();
    return NextResponse.json(masterEvents);
  } catch (error) {
    console.error('Error fetching master events:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch master events';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const service = createMasterEventService();
    const masterEvent = await service.createMasterEvent(body);
    return NextResponse.json(masterEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating master event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create master event';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


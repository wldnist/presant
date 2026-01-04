// API Route for Master Event by UUID
import { NextRequest, NextResponse } from 'next/server';
import { createMasterEventService } from '@/services/serviceFactory';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const service = createMasterEventService();
    const masterEvent = await service.getMasterEventByUuid(uuid);
    
    if (!masterEvent) {
      return NextResponse.json(
        { error: 'Master event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(masterEvent);
  } catch (error) {
    console.error('Error fetching master event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch master event';
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
    const service = createMasterEventService();
    const masterEvent = await service.updateMasterEvent(uuid, body);
    return NextResponse.json(masterEvent);
  } catch (error) {
    console.error('Error updating master event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update master event';
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
    const service = createMasterEventService();
    await service.deleteMasterEvent(uuid);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting master event:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete master event';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


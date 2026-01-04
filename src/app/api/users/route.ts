// API Route for System Users
import { NextRequest, NextResponse } from 'next/server';
import { createUserService } from '@/services/serviceFactory';

// Initialize database on server-side
import '@/infrastructure/database/migrate';

export async function GET(request: NextRequest) {
  try {
    const service = createUserService();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (query) {
      const users = await service.searchUsers(query);
      return NextResponse.json(users);
    }
    
    const users = await service.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const service = createUserService();
    const user = await service.createUser(body);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}


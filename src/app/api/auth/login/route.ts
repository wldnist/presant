import { NextRequest, NextResponse } from 'next/server';
import { SystemUserRepository } from '@/repositories/sqlite/SystemUserRepository';
import { runMigrations } from '@/infrastructure/database/migrate';

// Run migrations on first API call
let migrationsInitialized = false;

export async function POST(request: NextRequest) {
  // Ensure migrations are run before handling request
  if (!migrationsInitialized) {
    try {
      await runMigrations();
      migrationsInitialized = true;
    } catch (error) {
      console.error('Migration error in login route:', error);
      // Continue anyway - migrations might already be applied
    }
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    const userRepository = new SystemUserRepository();
    const user = await userRepository.findByUsername(username);

    if (!user) {
      console.log(`User not found: ${username}`);
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }
    
    console.log(`User found: ${user.username}, role: ${user.role}, active: ${user.is_active}`);

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Akun tidak aktif' },
        { status: 403 }
      );
    }

    // Verify password dengan bcrypt
    const { compare } = await import('bcryptjs');
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Return user data (tanpa password)
    return NextResponse.json({
      id: user.uuid,
      username: user.username,
      name: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat login';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


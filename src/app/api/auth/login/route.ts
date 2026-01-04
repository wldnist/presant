import { NextRequest, NextResponse } from 'next/server';
import { SystemUserRepository } from '@/repositories/sqlite/SystemUserRepository';
import '@/infrastructure/database/migrate'; // Initialize database

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

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


import { NextRequest, NextResponse } from 'next/server';
import { createDepositCheckoutSession } from '@/app/api/subscription';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount } = body;

    // Validate the amount
    if (!amount || typeof amount !== 'number' || amount < 5) {
      return NextResponse.json(
        { error: 'Amount must be at least $5' },
        { status: 400 }
      );
    }

    // Call the server action to create the checkout session
    const response = await createDepositCheckoutSession(amount);

    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error creating deposit checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

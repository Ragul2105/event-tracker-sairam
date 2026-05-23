import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/modules/auth/middleware";
import { findAllBloodDonationRecords, upsertBloodDonationRecord } from "@/modules/blood-donation/repositories";
import { z } from "zod";

const upsertBloodDonationSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  campDonors: z.number().int().min(0).default(0),
  regularDonors: z.number().int().min(0).default(0),
  college: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await findAllBloodDonationRecords();

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Blood donation fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blood donation records" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = upsertBloodDonationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    const totalDonors = parsed.data.campDonors + parsed.data.regularDonors;
    const record = await upsertBloodDonationRecord({
      year: parsed.data.year,
      campDonors: parsed.data.campDonors,
      regularDonors: parsed.data.regularDonors,
      totalDonors,
      college: parsed.data.college,
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Blood donation create error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create blood donation record" },
      { status: 500 }
    );
  }
}

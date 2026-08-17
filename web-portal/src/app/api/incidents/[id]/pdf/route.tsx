import { NextRequest, NextResponse } from 'next/server';
import ReactPDF from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { IncidentReportDocument } from '@/lib/pdf/IncidentReportDocument';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: incident, error } = await supabase
    .from('incidents')
    .select('*, pets(*), profiles(*)')
    .eq('id', id)
    .single();

  if (error || !incident) {
    return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
  }

  const pdfStream = await ReactPDF.renderToStream(
    <IncidentReportDocument data={incident} />
  );

  return new NextResponse(pdfStream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="incident-report-${id}.pdf"`,
    },
  });
}
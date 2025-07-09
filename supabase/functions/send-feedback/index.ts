
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequest {
  feedback: string;
  businessName: string;
  websiteUrl: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedback, businessName, websiteUrl, timestamp }: FeedbackRequest = await req.json();

    console.log('Received feedback:', { businessName, websiteUrl, feedback });

    const emailResponse = await resend.emails.send({
      from: "CiteMe.AI Feedback <onboarding@resend.dev>",
      to: ["barmang@gmail.com"],
      subject: `New Feedback - ${businessName}`,
      html: `
        <h2>New Feedback Received</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Analysis Details:</h3>
          <p><strong>Business Name:</strong> ${businessName}</p>
          <p><strong>Website URL:</strong> ${websiteUrl}</p>
          <p><strong>Submitted:</strong> ${new Date(timestamp).toLocaleString()}</p>
        </div>
        
        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3>Feedback:</h3>
          <p style="white-space: pre-wrap; line-height: 1.5;">${feedback}</p>
        </div>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          This feedback was submitted through CiteMe.AI analysis results page.
        </p>
      `,
    });

    console.log("Feedback email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-feedback function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

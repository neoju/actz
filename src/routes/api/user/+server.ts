import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/prisma";

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth();
  
  if (!session?.user?.id) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { language } = await request.json();
    
    // Validate language
    if (!language || !["en", "vi"].includes(language)) {
      return json({ error: "Invalid language. Must be 'en' or 'vi'" }, { status: 400 });
    }

    // Update user language preference
    await prisma.user.update({
      where: { id: session.user.id },
      data: { language }
    });

    return json({ success: true, language });
  } catch (error) {
    console.error("Error updating language:", error);
    return json({ error: "Failed to update language" }, { status: 500 });
  }
};

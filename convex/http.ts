import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";
import { ClerkWebhookEvent } from "../types/clerk";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (context, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const body = await request.text();

    const wh = new Webhook(webhookSecret);
    let event: ClerkWebhookEvent;
    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch {
      return new Response("Invalid webhook signature", { status: 400 });
    }

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const { id, first_name, last_name, image_url, public_metadata } =
          event.data;
        const name =
          [first_name, last_name].filter(Boolean).join(" ") || "Anonymous";
        const role =
          public_metadata?.role === "admin" ? "admin" : "user";

        const existing = await context.runQuery(internal.users.getByClerkId, {
          clerkId: id,
        });

        if (existing) {
          await context.runMutation(internal.users.updateFromWebhook, {
            id: existing._id,
            name,
            imageUrl: image_url,
            role,
          });
        } else {
          await context.runMutation(internal.users.createFromWebhook, {
            clerkId: id,
            name,
            imageUrl: image_url,
            role,
          });
        }
        break;
      }
      case "user.deleted": {
        const { id } = event.data;
        if (id) {
          const existing = await context.runQuery(internal.users.getByClerkId, {
            clerkId: id,
          });
          if (existing) {
            await context.runMutation(internal.users.deleteFromWebhook, {
              id: existing._id,
            });
          }
        }
        break;
      }
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;

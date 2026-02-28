import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
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
    let event: WebhookEvent;
    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
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
          (public_metadata?.role as string) === "admin" ? "admin" : "user";

        const existing = await ctx.runQuery(internal.users.getByClerkId, {
          clerkId: id,
        });

        if (existing) {
          await ctx.runMutation(internal.users.updateFromWebhook, {
            id: existing._id,
            name,
            imageUrl: image_url,
            role,
          });
        } else {
          await ctx.runMutation(internal.users.createFromWebhook, {
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
          const existing = await ctx.runQuery(internal.users.getByClerkId, {
            clerkId: id,
          });
          if (existing) {
            await ctx.runMutation(internal.users.deleteFromWebhook, {
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

interface WebhookEvent {
  type: string;
  data: {
    id: string;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    public_metadata?: Record<string, unknown>;
  };
}

export default http;

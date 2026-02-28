export interface ClerkWebhookData {
  id: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  public_metadata?: { role?: string };
}

export interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: ClerkWebhookData;
}

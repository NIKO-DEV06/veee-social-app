import { httpRouter } from 'convex/server';
import { Webhook } from 'svix';
import { api } from './_generated/api';
import { httpAction } from './_generated/server';

const http = httpRouter();

http.route({
  path: '/clerk-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Missing CLERK_WEBHOOK_SECRET environment variable');
    }

    const svix_id = request.headers.get('svix-id');
    const svix_signature = request.headers.get('svix-signature');
    const svix_timestamp = request.headers.get('svix-timestamp');

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response('Error occured -- no svix headers', {
        status: 400,
      });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: any;

    // veriify webhook
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as any;
    } catch (error) {
      console.error('Error verifying webhook:', error);
      return new Response('Error occured', { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      const email = email_addresses[0].email_address;
      const name = `${first_name || ''} ${last_name || ''.trim()}`;

      try {
        await ctx.runMutation(api.users.createUser, {
          email,
          fullname: name,
          image: image_url,
          clerkId: id,
          username: email.split('@')[0],
        });
      } catch (error) {
        console.error('Error creating user:', error);
        return new Response('Error creating user', { status: 500 });
      }

      return new Response('Webhook processed succesfully', { status: 200 });
    }
    return new Response('Event not handled', { status: 200 });
  }),
});

export default http;

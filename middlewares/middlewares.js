import { send } from '../deps.js';

const errorMiddleware = async(context, next) => {
  try {
    await next();
  } catch (e) {
    console.log(e);
  }
}

const requestTimingMiddleware = async({ request, session}, next) => {
  const start = new Date(Date.now())
  const user = await session.get('user')
  await next()
  console.log(`Request time: ${start.toString()} method: ${request.method} path: ${request.url.pathname} made by (userid) ${user ? user.id : 'anonymous'}`);
}

const serveStaticFilesMiddleware = async(context, next) => {
  if (context.request.url.pathname.startsWith('/static')) {
    const path = context.request.url.pathname.substring(7);
  
    await send(context, path, {
      root: `${Deno.cwd()}/static`
    });
  
  } else {
    await next();
  }
}
const limitAccessMiddleware = async(context, next) => {
  if (context.request.url.pathname.startsWith('/behavior')) {
    if (await context.session.get('authenticated')) {
      await next();
    } else {
      context.response.status = 401;
      context.response.redirect('/auth/login');
    }
  } else {
    await next();
  }
}
export { errorMiddleware, requestTimingMiddleware, serveStaticFilesMiddleware, limitAccessMiddleware };
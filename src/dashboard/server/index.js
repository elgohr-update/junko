const { join } = require('path');
const protoLoader = require('@grpc/proto-loader');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const consola = require('consola');
const { Nuxt, Builder } = require('nuxt');
const protoPath = join(__dirname, '../..', 'api/service.proto');
const grpc = require('grpc');
const bluebird = require('bluebird');
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const serviceDeff = grpc.loadPackageDefinition(packageDefinition).api;

const app = new Koa();
const router = new KoaRouter();

app.context.rpc = new serviceDeff.Fetcher('localhost:50051', grpc.credentials.createInsecure());
bluebird.promisifyAll(app.context.rpc);

const config = require('../nuxt.config.js');
config.dev = app.env !== 'production';

async function start() {
  const nuxt = new Nuxt(config);

  const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server;

  if (config.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  } else {
    await nuxt.ready();
  }

  router.get(
    '/guilds',
    async ctx => {
      ctx.body = await ctx.rpc.fetchGuildsAsync({});
    }
  );

  app.use(router.routes()).use(router.allowedMethods());

  app.use(ctx => {
    ctx.status = 200;
    ctx.respond = false;
    ctx.req.ctx = ctx;
    nuxt.render(ctx.req, ctx.res);
  });

  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  });
}

start();

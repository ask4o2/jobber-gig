import { winstonLogger } from '@ask4o2/jobber-shared';
import { config } from '@gig/config';
import { createClient } from 'redis';
import { Logger } from 'winston';

type RedisClient = ReturnType<typeof createClient>;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigRedisConnection', 'debug');

const client: RedisClient = createClient({ url: `${config.REDIS_HOST}` });

const redisConnect = async (): Promise<void> => {
  try {
    await client.connect();
    const ping = await client.png();
    log.info(`Redis connected successfully: ${ping}`);
  } catch (error) {
    log.log('error', 'Gig ServiceredisConnect() method error:', error);
    throw error;
  }
};

const cacheError = (): void => {
  client.on('error', (error) => {
    log.error(error);
  });
};

export { client, redisConnect, cacheError };

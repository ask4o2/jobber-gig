import { winstonLogger } from '@ask4o2/jobber-shared';
import { config } from '@gig/config';
import { Logger } from 'winston';
import client, { Channel, ChannelModel, Connection } from 'amqplib';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigQueueConnection', 'debug');

const createConnection = async (): Promise<Channel | undefined> => {
  try {
    const connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel = await connection.createChannel();

    log.info(`Gig service connected to RabbitMQ Queue Successfully.`);

    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    log.log('error', 'Gig Service createConnection() method error:', error);
    return undefined;
  }
};

function closeConnection(channel: Channel, connection: ChannelModel): void {
  // Signal Interrup SIGINT to close the connection and channel once, A signal interrupt is sent mostly when u press ctrl + c to terminate the process.
  process.once('SIGINT', async () => {
    await channel.close();
    await connection.close();
    log.info(`GigService Closed Connection to Queue Successfully...`);
  });
}

export { createConnection };

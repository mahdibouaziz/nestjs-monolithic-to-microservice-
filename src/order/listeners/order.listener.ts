import { Inject, Injectable } from '@nestjs/common';
import { Order } from '../order';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from '../../shared/redis.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class OrderListener {
  constructor(
    private redisService: RedisService,
    @Inject('KAFKA_SERVICE') private client: ClientKafka,
  ) {}

  @OnEvent('order.completed')
  async handleOrderCompletedEvent(order: Order) {
    const client = this.redisService.getClient();
    client.zincrby('rankings', order.ambassador_revenue, order.user.name);
    await this.client.emit('default', JSON.stringify(order));
  }
}

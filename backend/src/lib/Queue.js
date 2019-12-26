import Bull from 'bull';
import redis from 'redis';

import * as jobs from '../app/jobs';
import redisConfig from '../config/redis';

const arrayJobs = Object.values(jobs);

class Queue {
  constructor() {
    this.queues = {};

    this.client = redis.createClient(redisConfig);

    this.init();
  }

  init() {
    this.queues = arrayJobs.map(job => ({
      bull: new Bull(job.key, redisConfig),
      name: job.key,
      handle: job.handle,
      options: job.options,
    }));
  }

  add(name, data) {
    const findQueue = this.queues.find(queue => queue.name === name);

    return findQueue.bull.add(data, findQueue.options);
  }

  processQueue() {
    console.log('process queue');
    return this.queues.forEach(queue => {
      queue.bull.process(queue.handle);

      queue.bull.on('failed', job => this.handleFailure(job, queue));
    });
  }

  handleFailure(job, queue) {
    console.log('Job Failed', queue.key, job.data);
  }
}

export default new Queue();

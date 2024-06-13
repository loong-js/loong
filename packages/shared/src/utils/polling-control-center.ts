/**
 * Poll The Control Center
 */
export type PollingControlCenterTask = () => Promise<any> | any;

export type PollingControlCenterCheckDone = () => boolean;

interface IPollingControlCenterQueueItem {
  name?: string;
  task: PollingControlCenterTask;
  done?: boolean;
  checkDone?: PollingControlCenterCheckDone;
  // pending time
  timeToBeExecuted?: number;
  // interval time millisecond ms
  interval: number;
  // execute it at the beginning
  leading?: boolean;

  timeout?: number;
  initialTime?: number;
}

interface IPollingControlCenterOptions {
  // the interval between the control center can be set to 5 seconds if both tasks are performed once every 1 minute or 30 seconds if you want to be precise
  interval: number;
  // execute it at the beginning
  leading?: boolean;
  // add a task and it will run automatically
  autorun?: boolean;
}

// use only one poll to control multiple tasks
export class PollingControlCenter {
  queue: IPollingControlCenterQueueItem[] = [];

  timer?: ReturnType<typeof setTimeout>;

  constructor(private options: IPollingControlCenterOptions) {}

  async addTask(queueItem: IPollingControlCenterQueueItem) {
    if (queueItem.name) {
      this.queue = this.queue.filter((item) => item.name === queueItem.name);
    }
    this.queue.push(queueItem);

    let { leading } = queueItem;
    if (leading === undefined) {
      leading = this.options.leading;
    }
    if (leading) {
      await queueItem.task();

      // if the first execution is complete there is no need to continue polling
      if (queueItem.checkDone?.()) {
        queueItem.done = true;
        return;
      }
    }

    queueItem.initialTime = Date.now();
    queueItem.timeToBeExecuted = queueItem.initialTime + queueItem.interval;

    if (queueItem.timeout) {
      queueItem.timeout += queueItem.initialTime;
    }

    if (this.options.autorun) {
      this.run();
    }
  }

  clear() {
    clearInterval(this.timer);
    this.timer = undefined;
    this.queue = [];
  }

  run() {
    if (this.timer) {
      return;
    }
    this.timer = setInterval(() => this.polling(), this.options.interval);
  }

  private polling() {
    // if there is an unfinished task then execute it
    if (!this.queue.some((item) => !item.done)) {
      this.clear();
      return;
    }
    const now = Date.now();
    this.queue.forEach(async (queueItem) => {
      // if the task has been completed or there is no time to be executed it does not need to be executed
      // if there is no pending time the task has not been added to the execution or the task may have been executed after joining the task but the asynchronous task has not yet been executed
      if (queueItem.done || !queueItem.timeToBeExecuted) {
        return;
      }
      if (now < queueItem.timeToBeExecuted) {
        return;
      }

      // prevent the task from being started again when executed asynchronously
      queueItem.timeToBeExecuted = undefined;

      await queueItem.task();

      if (queueItem.checkDone?.()) {
        queueItem.done = true;
        return;
      }

      queueItem.timeToBeExecuted = Date.now();

      if (queueItem.timeout && queueItem.timeToBeExecuted > queueItem.timeout) {
        queueItem.done = true;
        return;
      }

      queueItem.timeToBeExecuted += queueItem.interval;
    });
  }
}

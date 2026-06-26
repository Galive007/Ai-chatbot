/**
 * Message Queue System
 * Manages response ordering and conversation flow
 */

export class MessageQueueSystem {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.callbacks = [];
  }

  /**
   * Enqueue a response
   */
  enqueue(agentId, responseData, priority = 'normal') {
    const item = {
      id: `${agentId}_${Date.now()}`,
      agentId,
      responseData,
      priority,
      enqueuedAt: Date.now(),
      status: 'pending',
    };

    this.queue.push(item);
    this.sortQueue();

    return item.id;
  }

  /**
   * Sort queue by priority and timestamp
   */
  sortQueue() {
    const priorityOrder = { high: 1, normal: 2, low: 3 };

    this.queue.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.enqueuedAt - b.enqueuedAt;
    });
  }

  /**
   * Process next item in queue
   */
  async processNext() {
    if (this.queue.length === 0 || this.processing) {
      return null;
    }

    this.processing = true;

    try {
      const item = this.queue.shift();
      item.status = 'processing';

      // Notify callbacks
      this.callbacks.forEach((cb) => cb({ type: 'processing', item }));

      // Process with delay to simulate realistic conversation flow
      const delayMs = this.getDelayForAgent(item.agentId);
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      item.status = 'completed';
      item.completedAt = Date.now();

      // Notify callbacks
      this.callbacks.forEach((cb) => cb({ type: 'completed', item }));

      return item;
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process all items in queue
   */
  async processAll() {
    const results = [];

    while (this.queue.length > 0) {
      const item = await this.processNext();
      if (item) {
        results.push(item);
      }
    }

    return results;
  }

  /**
   * Get delay for agent based on activity
   */
  getDelayForAgent(agentId) {
    // Base delay: 1-2 seconds between responses
    const baseDelay = 1000 + Math.random() * 1000;

    // Vary by agent personality
    const agentDelays = {
      alex: 1200,  // Thoughtful, takes time
      mia: 800,    // Responsive and quick
      noah: 1500,  // Creative, takes longer
    };

    return (agentDelays[agentId] || baseDelay) + Math.random() * 500;
  }

  /**
   * Subscribe to queue events
   */
  subscribe(callback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      items: this.queue.map((item) => ({
        id: item.id,
        agentId: item.agentId,
        priority: item.priority,
        status: item.status,
        enqueuedAt: item.enqueuedAt,
      })),
    };
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue = [];
  }

  /**
   * Cancel specific item
   */
  cancel(itemId) {
    this.queue = this.queue.filter((item) => item.id !== itemId);
  }

  /**
   * Get pending items for agent
   */
  getPendingForAgent(agentId) {
    return this.queue.filter((item) => item.agentId === agentId);
  }

  /**
   * Reprioritize item
   */
  reprioritize(itemId, newPriority) {
    const item = this.queue.find((i) => i.id === itemId);
    if (item) {
      item.priority = newPriority;
      this.sortQueue();
    }
  }
}

export const messageQueueSystem = new MessageQueueSystem();

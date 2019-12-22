// User specific debounce function
module.exports = {
  RateLimiter: (delay, fn) => {
    const userMap = new Map();

    return (msg => {
      if (msg.channel.type !== 'dm' || msg.author.bot) {
        return;
      }

      if (userMap.has(msg.author.id)) {
        clearTimeout(userMap.get(msg.author.id));
      }

      userMap.set(msg.author.id, setTimeout(() => {
        fn(msg);
        userMap.delete(msg.author.id);
      }, delay))
    });
  }
}
module.exports = {
  // TODO: This needs to be a debounce.
  RateLimiter: (time, fn) => {
    const userMap = new Map();
  
    return (msg => {
      if (msg.channel.type !== 'dm' || msg.author.bot) {
        return;
      }

      if (userMap.has(msg.author.id)) {
        if ((Date.now() - userMap.get(msg.author.id)) < time) {
          console.log(`Rate limiting ${msg.author.username}`);
          return;
        }
      }
      fn(msg);
      userMap.set(msg.author.id, Date.now());
    });
  }
}

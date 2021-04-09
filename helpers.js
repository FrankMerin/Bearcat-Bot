const Discord = require('discord.js');

// User specific debounce function
module.exports = {
  RateLimiter: (delay, fn) => {
    const userMap = new Map();

    return (msg) => {
      // Don't rate limit myself.
      if (msg.author.bot) {
        return;
      }

      if (userMap.has(msg.author.id)) {
        clearTimeout(userMap.get(msg.author.id));
      }

      userMap.set(
        msg.author.id,
        setTimeout(() => {
          fn(msg);
          userMap.delete(msg.author.id);
        }, delay),
      );
    };
  },
  getMemberFromUser: (client, user) => client.guilds.first().member(user),
  userHasRoles: (member) => member.roles.last().name !== '@everyone',
  isStudentOrGradStudent: (member) => {
    if (
      member.roles.find(({ name }) => name === 'Student') ||
      member.roles.find(({ name }) => name === 'Grad Student')
    ) {
      return true;
    }
    return false;
  },
  isUserAdminOrMod: (client, user) => {
    const member = client.guilds.first().member(user);
    return member.hasPermission('ADMINISTRATOR');
  },
  getUserFromMention: (client, mention) => {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
      mention = mention.slice(2, -1);

      if (mention.startsWith('!')) {
        mention = mention.slice(1);
      }

      return client.users.get(mention);
    } else if (!isNaN(mention)) {
      // Allow the user to invoke askmajor with a direct userid rather than @'ing them.
      return client.users.get(mention);
    }
  },
  isRedditPostingTime: () => {
    // If the time is: 6am, 2pm, 10pm, return true. Else return false.
    const time = new Date().getHours();
    return time === 6 || time === 14 || time === 22;
  },

  // Takes a post, finds out if we've already posted it in the relevant channel, returns boolean.
  havePostedAlready: async (client, postLink, REDDIT_POSTING_CHANNEL_ID) => {
    const channel = await client.channels.get(REDDIT_POSTING_CHANNEL_ID);

    const messages = await channel.fetchMessages({ limit: 10 });
    const foundMessage = messages.find((currentMessage) => currentMessage.content === postLink);
    return Boolean(foundMessage);
  },

  // Returns the nth non-stickied post in postList
  getNthNonStickiedPost: (postList, startAt = 0) => {
    for (let i = startAt; i < postList.length; ++i) {
      if (postList[i].data.stickied === true) {
        continue;
      } else return [`https://reddit.com${postList[i].data.permalink}`, i];
    }
    throw new Error('No non stickied posts found');
  },

  whoDeletedTheMessage: (firstDeleteEvent, messageDelete) => {
    if (
      // Checks if the audit log's event channel ID match the deleted message channel ID?
      firstDeleteEvent.extra.channel.id === messageDelete.channel.id &&
      // Checks if the audit log's event author ID matches the deleted message author ID?
      firstDeleteEvent.target.id === messageDelete.author.id &&
      // Checks if the recent audit log entry is recent (to avoid using old entries)
      firstDeleteEvent.createdTimestamp > Date.now() - 7 * 1000
    ) {
      return firstDeleteEvent.executor.tag;
    } else {
      return messageDelete.author.tag;
    }
  },

  log: (msg) => {
    const timestamp = new Date().toString();
    console.log(`${msg} @ ${timestamp}`);
  },

  errLog: (msg) => {
    const timestamp = new Date().toString();
    console.error(`${msg} @ ${timestamp}`);
  },
};

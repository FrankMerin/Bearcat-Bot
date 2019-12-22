const Discord = require('discord.js');

const auth = require('./auth.json');
const messages = require('./messages.js');
const majorsInfo = require('./majorsInfo.js');

// Initialize Discord Bot
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Assigns the given user the given role. Returns true if successful, false if not.
function assignRole(user, major) {
  try {
    const guild = client.guilds.first();
    const role = guild.roles.find(({name}) => name === major);
    if (!role) {
      throw new Error(`Intended role not found on server`);
    }
  
    const member = guild.member(user);
    if (member.roles.find(currRole => currRole === role)) {
      return {
        success: false,
        error: 'You alrady have that role.',
      };
    }

    if (!member.roles.find(({name}) => name === 'Student')) {
      return {
        success: false,
        error: 'You have to be a student to receive a major. Please go to the #role-assignment channel to do so.'
      };
    }

    // Remove any other major role/s the user already has.
    member.roles.forEach(role => {
      if (majorsInfo.fullToAbbrev[role.name]) {
        member.removeRole(role);
      }
    });

    member.addRole(role);
    return {success: true};
  } catch (err) {
    console.error(`Failed to assign ${major} to ${user.username}.`);
    console.error(err);
    return {
      success: false,
      error: `Failed to assign major for unknown reason. Please PM "@egrodo#6991", my creator.`
    };
  }
}

client.on('message', msg => {
  if (msg.channel.type !== 'dm' || msg.author.bot) {
    return;
  }

  const givenMajor = msg.content.toUpperCase();
  const resolvedMajor = majorsInfo.abbrevToFull[givenMajor];
  if (resolvedMajor) {
    const result = assignRole(msg.author, resolvedMajor);
    if (result.success) {
      msg.reply(`Successfully assigned you the role "${resolvedMajor}".`);
    } else {
      msg.reply(result.error)
    }
  } else {
    msg.reply("Invalid input, please type exactly one of the roles listed above.");
  }
});

// TODO: Find an event for users selecting "student" in the role assignemnt channel, then PM them for major.
// client.on('guildMemberAdd', (async ({user}) => {
//   console.log(user.username, user.id);
//   await user.send(messages.firstGreeting);
//   // messages.askMajor
// }));

client.login(auth.token);

// TODO: Make command that will let an admin invoke the greeting on any specified user.